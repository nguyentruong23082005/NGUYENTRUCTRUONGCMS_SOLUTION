"""
Phuc Long Scraper + Import vao SQL Server
==========================================
Goi truc tiep API cua Phuc Long (api-crownx.winmart.vn)
de lay danh muc, san pham, roi import vao SQL Server CMS.

Cach chay:
    pip install requests pyodbc
    python phuclong_scraper.py

Connection string doc tu appsettings.json cua CMS.Backend.
"""

import sys
import os
import json
import time
import re
import requests
import pyodbc
import html
from datetime import datetime, timezone

# Fix Windows console encoding
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# ============================================================
# API ENDPOINTS (da tim duoc tu discovery script)
# ============================================================
API_BASE = "https://api-crownx.winmart.vn"

# Category API: tra ve danh sach san pham theo slug
CATEGORY_API = f"{API_BASE}/plg/api/web/item/category"

# Homepage API: tra ve banner trang chu va block san pham noi bat
HOMEPAGE_API = f"{API_BASE}/it/api/plg/v1/homepage"

# Promotion API: tra ve danh sach bai khuyen mai/tin tuc
PROMOTION_API = f"{API_BASE}/plg-art/api/v1/web/homepage/tin-tuc-khuyen-mai"

# Store API: tra ve danh sach cua hang
STORE_API = f"{API_BASE}/mt/api/plg/v1/store"

# Danh sach cac category do uong cua Phuc Long
DRINK_CATEGORIES = [
    {"slug": "tra-sua--c01187", "name": "Tra sua"},
    {"slug": "ca-phe--c01189", "name": "Ca phe"},
    {"slug": "tra-trai-cay--c01190", "name": "Tra trai cay"},
    {"slug": "da-xay--c01193", "name": "Da xay"},
    {"slug": "best-seller--c01188", "name": "Best Seller"},
    {"slug": "bst-moi--c011105", "name": "BST Moi"},
    {"slug": "bst-dong-phuong-my-nhan--c011101", "name": "BST Dong Phuong My Nhan"},
]

FOOD_CATEGORIES = [
    {"slug": "banh-lanh--c01194", "name": "Banh lanh"},
    {"slug": "banh-cookies-croissant--c01195", "name": "Banh cookies - croissant"},
    {"slug": "banh-mi--c01196", "name": "Banh mi"},
]

TEA_PRODUCT_CATEGORIES = [
    {"slug": "tra-hop-giay--c0181", "name": "Tra Hop Giay"},
    {"slug": "tra-goi-cao-cap--c0182", "name": "Tra Goi Cao Cap"},
    {"slug": "tra-tui-loc--c0183", "name": "Tra Tui Loc"},
    {"slug": "tra-tui-tam-giac--c0184", "name": "Tra Tui Tam Giac"},
    {"slug": "tra-lai--c0185", "name": "Tra Lai"},
    {"slug": "tra-xanh--c0186", "name": "Tra Xanh"},
    {"slug": "tra-sen--c0187", "name": "Tra Sen"},
    {"slug": "tra-den--c0188", "name": "Tra Den"},
]

ALL_CATEGORIES = DRINK_CATEGORIES + FOOD_CATEGORIES + TEA_PRODUCT_CATEGORIES

# SQL Server connection string
CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=.\\SQLEXPRESS;"
    "DATABASE=NGUYENTRUCTRUONG_DB;"
    "Trusted_Connection=Yes;"
    "TrustServerCertificate=Yes;"
)

# Option Group defaults cho do uong
DEFAULT_OPTION_GROUPS = [
    {
        "name": "Size",
        "is_required": True,
        "max_selectable": 1,
        "values": [
            {"name": "M", "price_surcharge": 0},
            {"name": "L", "price_surcharge": 6000},
        ]
    },
    {
        "name": "Duong",
        "is_required": True,
        "max_selectable": 1,
        "values": [
            {"name": "0%", "price_surcharge": 0},
            {"name": "30%", "price_surcharge": 0},
            {"name": "50%", "price_surcharge": 0},
            {"name": "70%", "price_surcharge": 0},
            {"name": "100%", "price_surcharge": 0},
        ]
    },
    {
        "name": "Da",
        "is_required": True,
        "max_selectable": 1,
        "values": [
            {"name": "Khong da", "price_surcharge": 0},
            {"name": "It da", "price_surcharge": 0},
            {"name": "Binh thuong", "price_surcharge": 0},
            {"name": "Nhieu da", "price_surcharge": 0},
        ]
    },
]


# ============================================================
# PHASE 2: SCRAPE DATA TU API
# ============================================================
def scrape_category(slug, category_name):
    """Goi API lay san pham theo category slug."""
    url = f"{CATEGORY_API}?pageNumber=1&pageSize=100&slug={slug}"
    print(f"  => Dang goi: {url[:80]}...")

    try:
        resp = requests.get(url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
            "Accept": "application/json",
        })
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  [LOI] Khong the goi API: {e}")
        return None, []

    cat_data = data.get("data", {})
    real_name = cat_data.get("name", category_name)
    items = cat_data.get("items", [])

    products = []
    for item in items:
        name = item.get("name", "").strip()
        if not name:
            continue

        # Lay gia
        price = 0
        prices = item.get("prices", [])
        if prices:
            price = prices[0].get("price", 0)
        if not price:
            price = item.get("price", 0)

        # Lay anh
        image_url = ""
        media = item.get("mediaItems", [])
        if media:
            image_url = media[0].get("mediaUrl", "")
        if not image_url:
            image_url = item.get("imageUrl", "")

        # Lay mo ta
        description = item.get("description", "")
        # Xoa HTML tags
        if description:
            description = re.sub(r'<[^>]+>', '', description).strip()

        products.append({
            "external_id": item.get("itemNo", ""),
            "name": name,
            "price": price,
            "image_url": image_url,
            "description": description[:500] if description else "",
            "source_url": f"https://phuclong.com.vn/product/{item.get('seoName', '')}",
        })

    return real_name, products


def absolute_phuclong_url(path):
    """Chuan hoa URL tu API Phuc Long."""
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return "https://phuclong.com.vn/" + path.lstrip("/")


def strip_html(html_text):
    """Xoa HTML tags va thu gon whitespace."""
    if not html_text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', html_text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_full_promotion_content(source_url):
    """Lay full HTML noi dung tu trang chi tiet khuyen mai Phuc Long."""
    if not source_url:
        return ""

    try:
        resp = requests.get(source_url, timeout=20, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
            "Accept": "text/html,application/xhtml+xml",
        })
        resp.raise_for_status()
        page_html = resp.text
    except Exception as e:
        print(f"    [CANH BAO] Khong lay duoc noi dung chi tiet: {source_url} ({e})")
        return ""

    # Match the ql-editor container that contains actual content
    match = re.search(
        r'(<div class="ql-editor html-content">.*?</div>)</div><div class="slug',
        page_html,
        re.S
    )
    if not match:
        match = re.search(
            r'(<div class="ql-editor html-content">.*?</div>)',
            page_html,
            re.S
        )
    if not match:
        match = re.search(
            r'(<div class="ql-editor html-content show-list-style">.*?</div>)',
            page_html,
            re.S
        )

    if not match:
        return ""

    content = html.unescape(match.group(1))
    content = re.sub(r'<!--.*?-->', '', content, flags=re.S)
    return content.strip()


def scrape_banners():
    """Cao banner trang chu Phuc Long tu homepage API."""
    print("\n[+] Banner trang chu")
    print(f"  => Dang goi: {HOMEPAGE_API}")

    try:
        resp = requests.get(HOMEPAGE_API, timeout=20, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
            "Accept": "application/json",
        })
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  [LOI] Khong the cao banner: {e}")
        return []

    raw_banners = data.get("data", {}).get("headerBanner", [])
    banners = []
    seen = set()

    for index, item in enumerate(raw_banners, start=1):
        image_url = item.get("imageUrl", "").strip()
        if not image_url or image_url in seen:
            continue
        seen.add(image_url)

        banners.append({
            "external_id": item.get("id", ""),
            "title": item.get("name", f"Phuc Long Banner {index}"),
            "image_url": image_url,
            "link_url": absolute_phuclong_url(item.get("url", "")),
            "position": "HomeHero",
            "sort_order": index,
        })

    print(f"    => Banner: {len(banners)} anh")
    return banners


def scrape_promotions():
    """Cao bai khuyen mai Phuc Long vao dang Post voi phan trang."""
    print("\n[+] Khuyen mai")
    promotions = []
    seen = set()
    page = 1
    page_size = 50
    max_pages = 10  # Guard limit
    
    while page <= max_pages:
        url = f"{PROMOTION_API}?languageCode=vi&pageNumber={page}&pageSize={page_size}"
        print(f"  => Dang goi: {url}")
        try:
            resp = requests.get(url, timeout=20, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                "Accept": "application/json",
            })
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  [LOI] Khong the cao khuyen mai trang {page}: {e}")
            break

        items = data.get("data", [])
        if not items:
            print("    => Het du lieu khuyen mai.")
            break

        for item in items:
            title = item.get("title", "").strip()
            if not title or title in seen:
                continue
            seen.add(title)

            seo_name = item.get("seoName", "")
            source_url = absolute_phuclong_url(f"khuyen-mai/{seo_name}" if seo_name else "khuyen-mai")
            content = extract_full_promotion_content(source_url)
            if not content:
                content = item.get("sapo", "") or strip_html(item.get("sapo", ""))

            promotions.append({
                "external_id": str(item.get("id", "")),
                "title": title,
                "content": content,
                "image_url": item.get("imageAvatar", ""),
                "source_url": source_url,
                "published_date": item.get("publishedDate", ""),
            })
            time.sleep(0.15)
        
        if len(items) < page_size:
            print("    => So luong tra ve nho hon pageSize, dung phan trang.")
            break
            
        page += 1

    print(f"    => Tong khuyen mai cao duoc: {len(promotions)} bai")
    return promotions


def scrape_stores():
    """Cao danh sach cua hang tu Phuc Long API voi phan trang."""
    print("\n[+] Cua hang")
    stores = []
    seen = set()
    page = 1
    page_size = 100
    max_pages = 20  # Guard limit
    
    while page <= max_pages:
        # activeCall=true, orderByKeyDesc=true
        url = f"{STORE_API}?activeCall=true&orderByDesc=true&pageNumber={page}&pageSize={page_size}"
        print(f"  => Dang goi: {url}")
        try:
            resp = requests.get(url, timeout=20, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                "Accept": "application/json",
            })
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  [LOI] Khong the cao cua hang trang {page}: {e}")
            break

        items = data.get("data", [])
        if not items:
            print("    => Het du lieu cua hang.")
            break

        for item in items:
            store_code = item.get("storeCode", "").strip()
            if not store_code or store_code in seen:
                continue
            seen.add(store_code)

            name = item.get("storeName", "").strip()
            address = item.get("officeAddress", "").strip()
            phone = item.get("contactMobile", "") or item.get("officeNumber", "")
            
            # Map Lat/Lng
            latitude = item.get("latitude")
            longitude = item.get("longitude")
            
            # Ghep link map neu co lat lng
            map_url = ""
            if latitude and longitude:
                map_url = f"https://www.google.com/maps/search/?api=1&query={latitude},{longitude}"

            stores.append({
                "store_code": store_code,
                "name": name,
                "address": address,
                "phone": phone,
                "latitude": float(latitude) if latitude else None,
                "longitude": float(longitude) if longitude else None,
                "google_map_url": map_url,
                "image_url": item.get("avatarUrl", "") or item.get("imageUrl", "")
            })

        if len(items) < page_size:
            print("    => So luong tra ve nho hon pageSize, dung phan trang.")
            break
            
        page += 1

    print(f"    => Tong so cua hang cao duoc: {len(stores)}")
    return stores


def scrape_all():
    """Scrape tat ca categories."""
    print("=" * 60)
    print(" PHUC LONG SCRAPER")
    print(" Dang cao du lieu tu phuclong.com.vn...")
    print("=" * 60)

    all_data = {
        "categories": [],
        "banners": scrape_banners(),
        "promotions": scrape_promotions(),
        "stores": scrape_stores(),
        "scraped_at": datetime.now().isoformat(),
    }
    total_products = 0

    for cat_info in ALL_CATEGORIES:
        slug = cat_info["slug"]
        fallback_name = cat_info["name"]

        print(f"\n[+] Category: {fallback_name} ({slug})")
        real_name, products = scrape_category(slug, fallback_name)

        if real_name is None:
            continue

        # Dedup theo external_id
        seen = set()
        unique_products = []
        for p in products:
            key = p["external_id"] or p["name"]
            if key not in seen:
                seen.add(key)
                unique_products.append(p)

        cat_entry = {
            "name": real_name,
            "slug": slug,
            "product_count": len(unique_products),
            "products": unique_products,
            "is_drink": cat_info in DRINK_CATEGORIES,
        }
        all_data["categories"].append(cat_entry)
        total_products += len(unique_products)

        print(f"    => {real_name}: {len(unique_products)} san pham")
        time.sleep(0.5)  # Rate limiting

    # Ghi ra JSON
    output_file = "phuclong_data.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f" TONG: {total_products} san pham tu {len(all_data['categories'])} danh muc")
    print(f" Da ghi ra file: {output_file}")
    print("=" * 60)

    return all_data


# ============================================================
# PHASE 3: IMPORT VAO SQL SERVER
# ============================================================
def get_or_create_category(cursor, name):
    """Lay hoac tao ProductCategory."""
    cursor.execute("SELECT Id FROM ProductCategories WHERE Name = ? AND IsDeleted = 0", name)
    row = cursor.fetchone()
    if row:
        return row[0], False

    now = datetime.now(timezone.utc)
    cursor.execute(
        """INSERT INTO ProductCategories (Name, Description, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, 0)""",
        name, f"Danh muc: {name}", now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def get_or_create_product(cursor, name, price, image_url, description, category_id):
    """Lay hoac tao Product."""
    cursor.execute("SELECT Id FROM Products WHERE Name = ? AND IsDeleted = 0", name)
    row = cursor.fetchone()
    if row:
        return row[0], False

    now = datetime.now(timezone.utc)
    cursor.execute(
        """INSERT INTO Products (Name, Description, Price, StockQuantity, ImageUrl, ProductCategoryId, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, ?, ?, ?, ?, 0)""",
        name, description, price, 999, image_url, category_id, now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def get_or_create_option_group(cursor, name, is_required, max_selectable):
    """Lay hoac tao OptionGroup."""
    cursor.execute("SELECT Id FROM OptionGroups WHERE Name = ? AND IsDeleted = 0", name)
    row = cursor.fetchone()
    if row:
        return row[0], False

    now = datetime.now(timezone.utc)
    cursor.execute(
        """INSERT INTO OptionGroups (Name, IsRequired, MaxSelectable, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, ?, 0)""",
        name, is_required, max_selectable, now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def get_or_create_option_value(cursor, option_group_id, name, price_surcharge):
    """Lay hoac tao OptionValue."""
    cursor.execute(
        "SELECT Id FROM OptionValues WHERE OptionGroupId = ? AND Name = ? AND IsDeleted = 0",
        option_group_id, name
    )
    row = cursor.fetchone()
    if row:
        return row[0], False

    now = datetime.now(timezone.utc)
    cursor.execute(
        """INSERT INTO OptionValues (OptionGroupId, Name, PriceSurcharge, IsActive, StockQuantity, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, 1, NULL, ?, 0)""",
        option_group_id, name, price_surcharge, now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def link_product_option_group(cursor, product_id, option_group_id):
    """Gan OptionGroup vao Product (bang ProductOptionGroups)."""
    cursor.execute(
        "SELECT 1 FROM ProductOptionGroups WHERE ProductId = ? AND OptionGroupId = ?",
        product_id, option_group_id
    )
    if cursor.fetchone():
        return False

    cursor.execute(
        "INSERT INTO ProductOptionGroups (ProductId, OptionGroupId) VALUES (?, ?)",
        product_id, option_group_id
    )
    return True


def get_or_create_banner(cursor, title, image_url, link_url, position, sort_order):
    """Lay hoac tao Banner."""
    cursor.execute(
        "SELECT Id FROM Banners WHERE ImageUrl = ? AND Position = ? AND IsDeleted = 0",
        image_url, position
    )
    row = cursor.fetchone()
    if row:
        return row[0], False

    now = datetime.now(timezone.utc)
    cursor.execute(
        """INSERT INTO Banners (Title, ImageUrl, LinkUrl, Position, SortOrder, IsActive, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, ?, ?, 1, ?, 0)""",
        title, image_url, link_url or None, position, sort_order, now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def get_or_create_post_category(cursor, name):
    """Lay hoac tao PostCategory."""
    cursor.execute("SELECT Id FROM PostCategories WHERE Name = ? AND IsDeleted = 0", name)
    row = cursor.fetchone()
    if row:
        return row[0], False

    now = datetime.now(timezone.utc)
    cursor.execute(
        """INSERT INTO PostCategories (Name, Description, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, 0)""",
        name, f"Danh muc bai viet: {name}", now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def get_or_create_post(cursor, title, content, image_url, post_category_id, external_id=None, source_url=None, published_date=None):
    """Lay hoac tao Post theo ExternalId (hoac Title fallback) va cap nhat noi dung + metadata."""
    row = None
    if external_id:
        cursor.execute("SELECT Id FROM Posts WHERE ExternalId = ? AND IsDeleted = 0", external_id)
        row = cursor.fetchone()
        
    if not row:
        cursor.execute(
            "SELECT Id FROM Posts WHERE Title = ? AND PostCategoryId = ? AND IsDeleted = 0",
            title, post_category_id
        )
        row = cursor.fetchone()
        
    now = datetime.now(timezone.utc)
    
    # Parse published_date string to datetime if exists
    published_dt = None
    if published_date:
        try:
            # 2026-05-05T09:28:45.807Z or similar ISO formats
            clean_date = published_date.replace("Z", "+00:00")
            published_dt = datetime.fromisoformat(clean_date)
        except Exception:
            published_dt = None

    if row:
        cursor.execute(
            """UPDATE Posts
               SET Content = ?, ImageUrl = ?, ExternalId = ?, SourceUrl = ?, PublishedAt = ?, UpdatedAt = ?
               WHERE Id = ?""",
            content or "", image_url or None, external_id or None, source_url or None, published_dt, now, row[0]
        )
        return row[0], False

    cursor.execute(
        """INSERT INTO Posts (Title, Content, ImageUrl, PostCategoryId, ExternalId, SourceUrl, PublishedAt, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
        title, content or "", image_url or None, post_category_id, external_id or None, source_url or None, published_dt, now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def get_or_create_store(cursor, store_code, name, address, phone, latitude, longitude, google_map_url, image_url):
    """Lay hoac tao Store theo StoreCode (hoac Name + Address fallback) va cap nhat details."""
    row = None
    if store_code:
        cursor.execute("SELECT Id FROM Stores WHERE StoreCode = ? AND IsDeleted = 0", store_code)
        row = cursor.fetchone()
        
    if not row:
        cursor.execute("SELECT Id FROM Stores WHERE Name = ? AND Address = ? AND IsDeleted = 0", name, address)
        row = cursor.fetchone()
        
    now = datetime.now(timezone.utc)
    open_time = "07:00:00"
    close_time = "22:00:00"
    
    if row:
        cursor.execute(
            """UPDATE Stores
               SET Name = ?, Address = ?, Phone = ?, Latitude = ?, Longitude = ?, GoogleMapUrl = ?, ImageUrl = ?, UpdatedAt = ?
               WHERE Id = ?""",
            name, address, phone or None, latitude, longitude, google_map_url or None, image_url or None, now, row[0]
        )
        return row[0], False

    cursor.execute(
        """INSERT INTO Stores (StoreCode, Name, Address, Phone, Latitude, Longitude, GoogleMapUrl, ImageUrl, OpeningTime, ClosingTime, CreatedAt, IsDeleted)
           OUTPUT INSERTED.Id
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)""",
        store_code or None, name, address, phone or None, latitude, longitude, google_map_url or None, image_url or None, open_time, close_time, now
    )
    new_id = int(cursor.fetchone()[0])
    return new_id, True


def import_to_db(data):
    """Import scraped data vao SQL Server."""
    print("\n" + "=" * 60)
    print(" IMPORT VAO SQL SERVER")
    print(f" Database: NGUYENTRUCTRUONG_DB")
    print("=" * 60)

    try:
        conn = pyodbc.connect(CONN_STR)
        cursor = conn.cursor()
        print(" => Ket noi SQL Server thanh cong!")
    except Exception as e:
        print(f" [LOI] Khong the ket noi SQL Server: {e}")
        print(" Kiem tra lai connection string va SQL Server Express dang chay.")
        return

    stats = {
        "categories_new": 0,
        "categories_exist": 0,
        "products_new": 0,
        "products_exist": 0,
        "option_groups_new": 0,
        "option_values_new": 0,
        "links_new": 0,
        "banners_new": 0,
        "banners_exist": 0,
        "post_categories_new": 0,
        "posts_new": 0,
        "posts_exist": 0,
    }

    try:
        # --- Tao OptionGroup mac dinh ---
        print("\n[1/5] Tao OptionGroup mac dinh (Size, Duong, Da)...")
        option_group_ids = {}  # name -> id

        for og in DEFAULT_OPTION_GROUPS:
            og_id, is_new = get_or_create_option_group(
                cursor, og["name"], og["is_required"], og["max_selectable"]
            )
            option_group_ids[og["name"]] = og_id
            if is_new:
                stats["option_groups_new"] += 1
                print(f"    + Tao moi: {og['name']} (ID={og_id})")

                # Tao OptionValue
                for val in og["values"]:
                    ov_id, _ = get_or_create_option_value(
                        cursor, og_id, val["name"], val["price_surcharge"]
                    )
                    stats["option_values_new"] += 1
            else:
                print(f"    = Da co: {og['name']} (ID={og_id})")

        # --- Import Banner trang chu ---
        print(f"\n[2/5] Import {len(data.get('banners', []))} banner trang chu...")
        for banner in data.get("banners", []):
            _, is_new = get_or_create_banner(
                cursor,
                banner["title"],
                banner["image_url"],
                banner.get("link_url", ""),
                banner.get("position", "HomeHero"),
                banner.get("sort_order", 0),
            )
            if is_new:
                stats["banners_new"] += 1
                print(f"    + Banner: {banner['title']}")
            else:
                stats["banners_exist"] += 1

        # --- Import Khuyen mai vao Post ---
        print(f"\n[3/5] Import {len(data.get('promotions', []))} bai khuyen mai vao Posts...")
        promo_cat_id, promo_cat_new = get_or_create_post_category(cursor, "Khuyến mãi")
        if promo_cat_new:
            stats["post_categories_new"] += 1
            print(f"    + Tao PostCategory: Khuyến mãi (ID={promo_cat_id})")

        for promo in data.get("promotions", []):
            content = promo.get("content", "")
            # We don't append "Nguon: source_url" to Content anymore since we store it in SourceUrl column

            _, is_new = get_or_create_post(
                cursor,
                promo["title"],
                content,
                promo.get("image_url", ""),
                promo_cat_id,
                external_id=promo.get("external_id"),
                source_url=promo.get("source_url"),
                published_date=promo.get("published_date")
            )
            if is_new:
                stats["posts_new"] += 1
                print(f"    + Bai viet: {promo['title']}")
            else:
                stats["posts_exist"] += 1

        # --- Import Cua hang vao Stores ---
        print(f"\n[3.5/5] Import {len(data.get('stores', []))} cua hang vao Stores...")
        stats["stores_new"] = 0
        stats["stores_exist"] = 0
        for store in data.get("stores", []):
            _, is_new = get_or_create_store(
                cursor,
                store["store_code"],
                store["name"],
                store["address"],
                store["phone"],
                store["latitude"],
                store["longitude"],
                store["google_map_url"],
                store["image_url"]
            )
            if is_new:
                stats["stores_new"] += 1
            else:
                stats["stores_exist"] += 1

        # --- Import Categories & Products ---
        print(f"\n[4/5] Import {len(data['categories'])} danh muc va san pham...")

        drink_product_ids = []  # Luu lai de gan option

        for cat in data["categories"]:
            cat_name = cat["name"]
            is_drink = cat.get("is_drink", False)

            cat_id, is_new = get_or_create_category(cursor, cat_name)
            if is_new:
                stats["categories_new"] += 1
                print(f"\n  [+] Tao danh muc: {cat_name} (ID={cat_id})")
            else:
                stats["categories_exist"] += 1
                print(f"\n  [=] Da co danh muc: {cat_name} (ID={cat_id})")

            for product in cat["products"]:
                p_id, is_new = get_or_create_product(
                    cursor,
                    product["name"],
                    product["price"],
                    product["image_url"],
                    product.get("description", ""),
                    cat_id
                )
                if is_new:
                    stats["products_new"] += 1
                    print(f"      + {product['name']} - {product['price']:,.0f}d")
                else:
                    stats["products_exist"] += 1

                if is_drink:
                    drink_product_ids.append(p_id)

        # --- Gan OptionGroup vao san pham do uong ---
        print(f"\n[5/5] Gan option (Size/Duong/Da) vao {len(drink_product_ids)} san pham do uong...")

        drink_option_names = ["Size", "Duong", "Da"]
        for p_id in drink_product_ids:
            for og_name in drink_option_names:
                og_id = option_group_ids.get(og_name)
                if og_id:
                    if link_product_option_group(cursor, p_id, og_id):
                        stats["links_new"] += 1

        conn.commit()
        print("\n => COMMIT thanh cong!")

    except Exception as e:
        conn.rollback()
        print(f"\n [LOI] {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

    # --- Bao cao ---
    print(f"\n{'=' * 60}")
    print(" BAO CAO IMPORT")
    print(f"{'=' * 60}")
    print(f"  Danh muc tao moi:    {stats['categories_new']}")
    print(f"  Danh muc da co:      {stats['categories_exist']}")
    print(f"  San pham tao moi:    {stats['products_new']}")
    print(f"  San pham da co:      {stats['products_exist']}")
    print(f"  Option Group moi:    {stats['option_groups_new']}")
    print(f"  Option Value moi:    {stats['option_values_new']}")
    print(f"  Lien ket SP-Option:  {stats['links_new']}")
    print(f"  Banner tao moi:      {stats['banners_new']}")
    print(f"  Banner da co:        {stats['banners_exist']}")
    print(f"  PostCategory moi:    {stats['post_categories_new']}")
    print(f"  Bai viet tao moi:    {stats['posts_new']}")
    print(f"  Bai viet da co:      {stats['posts_exist']}")
    print(f"  Cua hang tao moi:    {stats['stores_new']}")
    print(f"  Cua hang da co:      {stats['stores_exist']}")
    print("=" * 60)


# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    # Buoc 1: Scrape du lieu
    data = scrape_all()

    if not data["categories"]:
        print("\n Khong co du lieu de import. Thoat.")
        sys.exit(1)

    # Buoc 2: Import vao SQL Server
    import_to_db(data)

    print("\n HOAN TAT! Vao trang admin CMS de kiem tra san pham.")
