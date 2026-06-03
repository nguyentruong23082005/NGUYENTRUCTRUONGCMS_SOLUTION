"""
Phúc Long API Discovery
========================
Mở phuclong.com.vn bằng Playwright headless Chrome,
lắng nghe tất cả network response để tìm ra API endpoint
chứa dữ liệu sản phẩm / menu / category.

Kết quả ghi ra file: phuclong_api_discovery.json

Cách chạy:
    python phuclong_discover.py
"""

import sys
import os
import json
import time

# Fix Windows console encoding
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

URLS_TO_VISIT = [
    "https://phuclong.com.vn/",
    "https://phuclong.com.vn/collections/thuc-uong",
    "https://phuclong.com.vn/collections/ca-phe",
    "https://phuclong.com.vn/collections/tra",
    "https://phuclong.com.vn/collections/tra-sua",
    "https://phuclong.com.vn/collections/da-xay",
    "https://phuclong.com.vn/collections/banh",
    "https://phuclong.com.vn/menu",
    "https://phuclong.com.vn/product",
    "https://phuclong.com.vn/san-pham",
]

def run():
    print("=" * 60)
    print(" PHÚC LONG API DISCOVERY")
    print(" Đang dò tìm API endpoints...")
    print("=" * 60)

    discovered_apis = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        page = browser.new_page()

        def handle_response(response):
            url = response.url
            status = response.status
            content_type = response.headers.get("content-type", "")

            # Chỉ quan tâm các response JSON hoặc API-like
            if any(keyword in content_type.lower() for keyword in ["json", "javascript"]):
                # Bỏ qua static assets
                if any(skip in url for skip in [
                    ".js", ".css", ".png", ".jpg", ".gif", ".svg", ".woff",
                    "google", "facebook", "clarity", "webengage", "zalo",
                    "analytics", "gtag", "fonts", "cdn.widgets"
                ]):
                    return

                body_text = ""
                try:
                    body_text = response.text()
                except Exception:
                    pass

                entry = {
                    "url": url,
                    "status": status,
                    "content_type": content_type,
                    "body_preview": body_text[:500] if body_text else "",
                    "body_length": len(body_text) if body_text else 0,
                    "has_product_keywords": any(kw in body_text.lower() for kw in [
                        "product", "price", "category", "menu", "item",
                        "name", "image", "description", "size", "topping"
                    ]) if body_text else False
                }
                discovered_apis.append(entry)
                
                marker = "⭐" if entry["has_product_keywords"] else "  "
                print(f"  {marker} [{status}] {url[:100]}... ({len(body_text)} bytes)")

        page.on("response", handle_response)

        for url in URLS_TO_VISIT:
            print(f"\n=> Đang truy cập: {url}")
            try:
                page.goto(url, timeout=15000, wait_until="domcontentloaded")
                time.sleep(3)
                
                # Cuộn trang để trigger lazy load
                for i in range(3):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(1)
                    
            except Exception as e:
                print(f"   [Lỗi] {e}")

        # Thử tìm các link menu trên trang chủ
        print("\n=> Tìm kiếm link menu trên trang chủ...")
        try:
            page.goto("https://phuclong.com.vn/", timeout=15000, wait_until="networkidle")
            time.sleep(3)
            
            links = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('a[href]')).map(a => ({
                    href: a.href,
                    text: a.textContent.trim().substring(0, 100)
                })).filter(l => l.text.length > 0 && l.href.includes('phuclong'))
            }""")
            
            print(f"   Tìm thấy {len(links)} link trên trang:")
            for link in links[:30]:
                print(f"   - {link['text']}: {link['href']}")
                
            # Thử truy cập từng link menu
            menu_links = [l for l in links if any(kw in l['href'].lower() or kw in l['text'].lower() 
                         for kw in ['menu', 'product', 'collection', 'thuc-uong', 'ca-phe', 'tra', 'banh'])]
            
            for link in menu_links[:5]:
                print(f"\n=> Đang truy cập link menu: {link['href']}")
                try:
                    page.goto(link['href'], timeout=15000, wait_until="domcontentloaded")
                    time.sleep(3)
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(2)
                except Exception as e:
                    print(f"   [Lỗi] {e}")
                    
        except Exception as e:
            print(f"   [Lỗi tìm link] {e}")

        browser.close()

    # Ghi kết quả
    output_file = "phuclong_api_discovery.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(discovered_apis, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f" KẾT QUẢ: Tìm thấy {len(discovered_apis)} API endpoints")
    print(f" Đã ghi ra file: {output_file}")
    
    # Hiện các endpoint có chứa keyword sản phẩm
    product_apis = [a for a in discovered_apis if a["has_product_keywords"]]
    if product_apis:
        print(f"\n ⭐ {len(product_apis)} endpoint CÓ CHỨA keyword sản phẩm:")
        for api in product_apis:
            print(f"   [{api['status']}] {api['url'][:120]}")
            print(f"         Preview: {api['body_preview'][:200]}")
            print()
    else:
        print("\n ❌ Không tìm thấy endpoint nào chứa keyword sản phẩm.")
        print("    Có thể web dùng SSR hoặc cần click vào menu cụ thể.")

    print("=" * 60)


if __name__ == "__main__":
    run()
