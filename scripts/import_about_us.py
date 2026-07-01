import sys
import os
import json
import re
import pyodbc
from datetime import datetime, timezone

# Fix console encoding
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Database connection
CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=.\\SQLEXPRESS;"
    "DATABASE=NGUYENTRUCTRUONG_DB;"
    "Trusted_Connection=Yes;"
    "TrustServerCertificate=Yes;"
)

JSON_PATH = r"C:\Users\Admin\.gemini\antigravity-ide\brain\fcbfefb5-c1fe-4f5b-8f0e-775a86571372\scratch\about_us_articles.json"

IMG_SRC_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)
TAG_RE = re.compile(r'<[^>]+>')


def extract_first_image_url(html):
    if not html:
        return None

    match = IMG_SRC_RE.search(html)
    return match.group(1).strip() if match else None


def strip_html_to_text(html):
    if not html:
        return ''

    text = TAG_RE.sub(' ', html)
    text = re.sub(r'&nbsp;|&#160;', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def slugify(text):
    text = text.lower().strip()
    # Remove Vietnamese accents
    replacements = {
        'a': 'áàảãạăắằẳẵặâấầẩẫậ',
        'd': 'đ',
        'e': 'éèẻẽẹêếềểễệ',
        'i': 'íìỉĩị',
        'o': 'óòỏõọôốồổỗộơớờởỡợ',
        'u': 'úùủũụưứừửữự',
        'y': 'ýỳỷỹỵ'
    }
    for r, chars in replacements.items():
        for c in chars:
            text = text.replace(c, r)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

def get_or_create_category(cursor, name, parent_id):
    """Get category by name under a parent, or create it if not exists."""
    slug = slugify(name)
    
    # Check if category already exists with the same parent
    if parent_id is not None:
        cursor.execute(
            "SELECT Id FROM PostCategories WHERE (Name = ? OR Slug = ?) AND ParentId = ? AND IsDeleted = 0",
            name, slug, parent_id
        )
    else:
        cursor.execute(
            "SELECT Id FROM PostCategories WHERE (Name = ? OR Slug = ?) AND ParentId IS NULL AND IsDeleted = 0",
            name, slug
        )
        
    row = cursor.fetchone()
    if row:
        return row[0], False
        
    # Check slug uniqueness globally in PostCategories, append suffix if exists
    cursor.execute("SELECT 1 FROM PostCategories WHERE Slug = ? AND IsDeleted = 0", slug)
    if cursor.fetchone():
        # Append parent ID or random number to slug
        slug = f"{slug}-{parent_id if parent_id else 'sub'}"
        
    now = datetime.now(timezone.utc)
    cursor.execute(
        """INSERT INTO PostCategories (Name, Slug, Description, ParentId, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, ?, ?, 0)""",
        name, slug, f"Danh mục: {name}", parent_id, now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True

def ensure_post_slug_unique(cursor, slug, post_id=None):
    """Check if post slug is unique, append incremental suffix if needed."""
    base_slug = slug
    counter = 1
    while True:
        if post_id is not None:
            cursor.execute("SELECT 1 FROM Posts WHERE Slug = ? AND Id != ? AND IsDeleted = 0", slug, post_id)
        else:
            cursor.execute("SELECT 1 FROM Posts WHERE Slug = ? AND IsDeleted = 0", slug)
            
        if not cursor.fetchone():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1

def import_posts():
    print("=" * 60)
    print(" IMPORT PHUC LONG ABOUT US ARTICLES TO DATABASE")
    print("=" * 60)
    
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found!")
        return
        
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        articles = json.load(f)
        
    print(f"Loaded {len(articles)} crawled articles.")
    
    # Dedup by title
    unique_articles = {}
    for a in articles:
        title = a['title'].strip()
        if title not in unique_articles:
            unique_articles[title] = a
        else:
            # Keep the one with longer content
            if len(a['content']) > len(unique_articles[title]['content']):
                unique_articles[title] = a
                
    print(f"Deduplicated to {len(unique_articles)} unique articles.")
    
    # Establish connection
    try:
        conn = pyodbc.connect(CONN_STR)
        cursor = conn.cursor()
        print("Connected to database successfully!")
    except Exception as e:
        print(f"Connection error: {e}")
        return
        
    # Map root category mappings dynamically from DB (children of ve-chung-toi root)
    cursor.execute("SELECT Id FROM PostCategories WHERE Slug = 've-chung-toi' AND IsDeleted = 0")
    row = cursor.fetchone()
    if not row:
        print("Error: Root category 've-chung-toi' not found in database!")
        return
    about_root_id = row[0]

    cursor.execute("SELECT Id, Name FROM PostCategories WHERE ParentId = ? AND IsDeleted = 0", about_root_id)
    root_mappings = {}
    for r_id, r_name in cursor.fetchall():
        root_mappings[r_name.upper()] = r_id
    print(f"Dynamically loaded root category mappings: {root_mappings}")
    
    stats = {
        "categories_created": 0,
        "posts_created": 0,
        "posts_updated": 0
    }
    
    try:
        for title, a in unique_articles.items():
            print(f"\nProcessing Article: {title}")
            
            # 1. Resolve Category ID from hierarchy
            cats = a.get('categories', [])
            
            # Map category name string list
            cat_names = []
            for c in cats:
                if isinstance(c, dict):
                    cat_names.append(c.get('categoryName', ''))
                else:
                    cat_names.append(str(c))
            
            cat_names = [name.strip() for name in cat_names if name.strip()]
            # Limit the category hierarchy to at most 2 levels under 've-chung-toi' (e.g. CÀ PHÊ -> Hạt cà phê Phúc Long)
            # Level 3 elements are actually the post/article names, not categories.
            if len(cat_names) > 2:
                cat_names = cat_names[:2]
            
            if not cat_names:
                # Default to root "Về chúng tôi" (ID: 4)
                post_category_id = 4
                print("  -> No categories specified, default to Về chúng tôi (ID 4)")
            else:
                # Resolve category path hierarchy
                current_parent_id = None
                
                # Check if first category name matches any root mapping
                first_cat = cat_names[0].upper()
                if first_cat in root_mappings:
                    current_parent_id = root_mappings[first_cat]
                    print(f"  -> Matched root category '{cat_names[0]}' (ID {current_parent_id})")
                    remaining_cats = cat_names[1:]
                else:
                    # Default to Về chúng tôi (ID 4) as parent
                    current_parent_id = 4
                    remaining_cats = cat_names
                    
                # Traverse / create children
                for name in remaining_cats:
                    cat_id, created = get_or_create_category(cursor, name, current_parent_id)
                    current_parent_id = cat_id
                    if created:
                        stats["categories_created"] += 1
                        print(f"    + Created category '{name}' (ID {cat_id}) under parent ID {current_parent_id}")
                    else:
                        print(f"    = Matched category '{name}' (ID {cat_id})")
                        
                post_category_id = current_parent_id
                
            # 2. Insert or Update Post in database
            external_id = a.get('external_id')
            source_url = a.get('source_url')
            content = a.get('content', '')
            image_url = a.get('image_url') or extract_first_image_url(content)
            
            # Slug generation
            slug = slugify(a.get('slug') or title)
            
            # Look up existing post by Title + PostCategoryId OR ExternalId
            post_id = None
            if external_id:
                cursor.execute("SELECT Id, Slug FROM Posts WHERE ExternalId = ? AND IsDeleted = 0", external_id)
                row = cursor.fetchone()
                if row:
                    post_id, slug = row[0], row[1]
                    
            if not post_id:
                cursor.execute(
                    "SELECT Id, Slug FROM Posts WHERE Title = ? AND PostCategoryId = ? AND IsDeleted = 0",
                    title, post_category_id
                )
                row = cursor.fetchone()
                if row:
                    post_id, slug = row[0], row[1]
                    
            now = datetime.now(timezone.utc)
            
            if post_id:
                # Update existing post
                unique_slug = ensure_post_slug_unique(cursor, slug, post_id)
                cursor.execute(
                    """UPDATE Posts
                       SET Content = ?, ImageUrl = ?, ExternalId = ?, SourceUrl = ?, Slug = ?, UpdatedAt = ?
                       WHERE Id = ?""",
                    content, image_url or None, external_id or None, source_url or None, unique_slug, now, post_id
                )
                stats["posts_updated"] += 1
                print(f"  -> Updated post: ID {post_id} | Slug: {unique_slug}")
            else:
                # Insert new post
                unique_slug = ensure_post_slug_unique(cursor, slug)
                cursor.execute(
                    """INSERT INTO Posts (Title, Content, ImageUrl, PostCategoryId, ExternalId, SourceUrl, Slug, CreatedAt, IsDeleted)
                       OUTPUT INSERTED.Id
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
                    title, content, image_url or None, post_category_id, external_id or None, source_url or None, unique_slug, now
                )
                new_post_id = int(cursor.fetchone()[0])
                stats["posts_created"] += 1
                print(f"  -> Created new post: ID {new_post_id} | Slug: {unique_slug}")
                
        # Commit transaction
        conn.commit()
        print("\nDatabase transaction committed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"\n[Error] Transaction rolled back. Details: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()
        
    print("\n" + "=" * 60)
    print(" IMPORT SUMMARY")
    print("=" * 60)
    print(f"  Categories Created: {stats['categories_created']}")
    print(f"  Posts Created:      {stats['posts_created']}")
    print(f"  Posts Updated:      {stats['posts_updated']}")
    print("=" * 60)

if __name__ == "__main__":
    import_posts()
