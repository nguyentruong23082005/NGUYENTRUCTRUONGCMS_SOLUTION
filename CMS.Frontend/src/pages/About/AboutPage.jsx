import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosClient from '../../api/axiosClient';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './AboutPage.module.css';

const stripHtmlToText = (value = '') => {
  if (!value) return '';

  const parser = new DOMParser();
  const document = parser.parseFromString(String(value), 'text/html');

  return document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
};

// Recursive Category Menu Node Component
const CategoryMenuNode = ({ node, activeId, expandedIds, onSelect, onToggle }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isActive = activeId === node.id;

  return (
    <div className={styles.menuNode}>
      <div 
        className={`${styles.menuHeader} ${isActive ? styles.activeNode : ''}`}
        onClick={() => onSelect(node.id)}
      >
        <span className={styles.menuName}>{node.name}</span>
        {hasChildren && (
          <button 
            type="button"
            className={`${styles.toggleBtn} ${isExpanded ? styles.expanded : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            ▼
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className={styles.menuChildren}>
          {node.children.map((child) => (
            <CategoryMenuNode
              key={child.id}
              node={child}
              activeId={activeId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AboutPage = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');

  const [posts, setPosts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [aboutRootCategory, setAboutRootCategory] = useState(null);
  
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  // Load all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await axiosClient.get('/api/post-categories');
        const categoryItems = categoryResponse?.data?.data || [];
        setAllCategories(categoryItems);
        
        // Find about Root category dynamically without hardcoding slug only (fallbacks to matching name)
        const aboutRoot = categoryItems.find(
          (category) => !category.parentId && categoryItems.some((child) => child.parentId === category.id)
        );
        setAboutRootCategory(aboutRoot);

        if (aboutRoot) {
          // Recursive helper to build category tree
          const buildTree = (parentId) => {
            return categoryItems
              .filter((c) => c.parentId === parentId)
              .map((c) => ({
                ...c,
                children: buildTree(c.id)
              }));
          };
          
          const tree = buildTree(aboutRoot.id);
          setCategoryTree(tree);
          
          // Auto-expand first level categories by default
          setExpandedCategories(tree.map(t => t.id));
        }
      } catch (error) {
        console.error('Không tải được danh mục bài viết:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Sync categorySlug query parameter to activeCategoryId state
  useEffect(() => {
    if (allCategories.length === 0) return;

    if (categorySlug) {
      const matched = allCategories.find((c) => c.slug === categorySlug);
      if (matched) {
        setActiveCategoryId(matched.id);
        
        // Expand parent categories up to the root
        let parentId = matched.parentId;
        const toExpand = [];
        while (parentId && aboutRootCategory && parentId !== aboutRootCategory.id) {
          toExpand.push(parentId);
          const parentCategory = allCategories.find((c) => c.id === parentId);
          parentId = parentCategory ? parentCategory.parentId : null;
        }
        
        if (toExpand.length > 0) {
          setExpandedCategories((prev) => [...new Set([...prev, ...toExpand])]);
        }
      }
    } else {
      setActiveCategoryId(null);
    }
  }, [categorySlug, allCategories, aboutRootCategory]);

  // Fetch posts when activeCategoryId changes
  useEffect(() => {
    if (loading) return;

    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const catId = activeCategoryId || aboutRootCategory?.id;
        if (!catId) return;

        const response = await axiosClient.get('/api/posts', {
          params: {
            pageSize: 50, // Load more to see all scraped posts
            categoryId: catId
          }
        });
        
        const items = response?.data?.data?.items || [];
        const list = Array.isArray(items)
          ? items.map((item) => ({
              id: String(item.id),
              title: item.title,
              slug: item.slug || item.id,
              summary: stripHtmlToText(item.summary || item.content || ''),
              imageUrl: item.thumbnailUrl || item.imageUrl || ''
            }))
          : [];

        setPosts(list);
      } catch (error) {
        console.error('Không tải được danh sách bài viết:', error);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategoryId, aboutRootCategory, loading]);

  const handleSelectCategory = (categoryId) => {
    setActiveCategoryId(categoryId);
  };

  const handleToggleCategory = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Find active category info for breadcrumb
  const activeCategoryObj = allCategories.find(c => c.id === activeCategoryId);

  if (loading) return <Loading fullPage />;

  const pageTitleText = aboutRootCategory?.name || 'Về chúng tôi';

  return (
    <main className={styles.page}>
      <Helmet>
        <title>{pageTitleText} - Phúc Long Coffee & Tea</title>
        <meta name="description" content={`Khám phá câu chuyện thương hiệu ${pageTitleText}.`} />
      </Helmet>

      <div className="container">
        <nav className="breadcrumb-nav" aria-label="Điều hướng">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">/</span>
          {activeCategoryId ? (
            <>
              <Link to="/about" onClick={() => handleSelectCategory(null)}>
                {pageTitleText}
              </Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-active">{activeCategoryObj?.name}</span>
            </>
          ) : (
            <span className="breadcrumb-active">{pageTitleText}</span>
          )}
        </nav>

        <div className={styles.layoutWrapper}>
          {/* Sidebar collapsible Category Menu */}
          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>{pageTitleText}</h3>
            <div className={styles.categoryMenu}>
              <div 
                className={`${styles.menuHeader} ${!activeCategoryId ? styles.activeNode : ''}`}
                onClick={() => handleSelectCategory(null)}
              >
                <span className={styles.menuName}>Tất cả câu chuyện</span>
              </div>
              {categoryTree.map((node) => (
                <CategoryMenuNode
                  key={node.id}
                  node={node}
                  activeId={activeCategoryId}
                  expandedIds={expandedCategories}
                  onSelect={handleSelectCategory}
                  onToggle={handleToggleCategory}
                />
              ))}
            </div>
          </aside>

          {/* Right Area content listing posts */}
          <section className={styles.contentArea}>
            <h1 className={styles.pageTitle}>
              {activeCategoryObj ? activeCategoryObj.name : pageTitleText}
            </h1>
            
            {postsLoading ? (
              <Loading />
            ) : posts.length > 0 ? (
              <div className={styles.list}>
                {posts.map((post) => (
                  <article key={post.id} className={styles.item}>
                    <div className={styles.imageWrapper}>
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={post.title} className={styles.image} />
                      ) : (
                        <div className={styles.imagePlaceholder}>{pageTitleText.toUpperCase()}</div>
                      )}
                    </div>
                    <div className={styles.info}>
                      <h2 className={styles.postTitle}>
                        <Link to={`/about/${post.slug}`}>{post.title}</Link>
                      </h2>
                      {post.summary && <p className={styles.summary}>{post.summary}</p>}
                      <Link to={`/about/${post.slug}`} className={styles.readMore}>Xem chi tiết</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="Chưa có bài viết nào" 
                description="Không tìm thấy bài viết nào trong danh mục này." 
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
