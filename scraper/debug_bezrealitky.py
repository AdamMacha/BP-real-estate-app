import asyncio
from playwright.async_api import async_playwright

async def check_bezrealitky_structure():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Vypneme headless pro debugging
        page = await browser.new_page()
        
        url = "https://www.bezrealitky.cz/vypis/prodej/byty"
        print(f"Navigating to: {url}")
        
        await page.goto(url, wait_until="networkidle", timeout=30000)
        
        # Počkejme chvíli
        await asyncio.sleep(3)
        
        # Zkusíme najít různé možné selektory
        selectors_to_try = [
            ".product__link",
            ".product",
            "article",
            "[data-qa='product']",
            ".PropertyCard",
            ".property-card"
        ]
        
        print("\nTrying different selectors:")
        for selector in selectors_to_try:
            try:
                element = await page.query_selector(selector)
                if element:
                    print(f"✓ Found: {selector}")
                    # Získejme HTML prvního elementu
                    html = await element.inner_html()
                    print(f"  First 200 chars: {html[:200]}")
                else:
                    print(f"✗ Not found: {selector}")
            except Exception as e:
                print(f"✗ Error with {selector}: {e}")
        
        # Uložme celý HTML pro analýzu
        content = await page.content()
        with open('/Users/adammacha/Desktop/bezrealitky_page.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("\nFull HTML saved to: /Users/adammacha/Desktop/bezrealitky_page.html")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(check_bezrealitky_structure())
