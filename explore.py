from playwright.sync_api import sync_playwright

def explore():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        url = "https://www.iplt20.com/stats/2024"
        print(f"Navigating to {url}")
        
        try:
            page.goto(url, wait_until="networkidle", timeout=60000)
            print("Page title:", page.title())
            html = page.content()
            
            # Check if there is a table row containing 'Kohli'
            if "Kohli" in html:
                print("Data rendered! 'Kohli' found.")
            else:
                print("Data not found in HTML.")
        except Exception as e:
            print("Error navigating:", e)
            
        browser.close()

if __name__ == "__main__":
    explore()
