from playwright.sync_api import sync_playwright, expect
import time

def verify_dashboard(page):
    # Listen for console logs and errors
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

    print("Navigating to Dashboard...")
    page.goto("http://localhost:5173/dashboard")

    # Wait for dashboard to load
    print("Waiting for dashboard load...")
    expect(page.get_by_role("heading", name="Stakeholder Dashboard")).to_be_visible(timeout=5000)

    print("Checking default state...")
    warning_locator = page.get_by_text("Day 1 Cash Insolvency Risk")
    expect(warning_locator).not_to_be_visible()

    page.screenshot(path="/home/jules/verification/1_dashboard_default.png")

    print("Adjusting parameters to trigger warning...")

    # Use XPath to find the input associated with the label "Investor Down Payment"
    # Structure: <div> <div> <label>Text</label> </div> <input> </div>
    # So: label -> parent -> parent -> input
    range_input = page.locator("//label[text()='Investor Down Payment']/../following-sibling::input")

    print("Setting Investor Down Payment to minimum (100k)...")
    range_input.fill("100000")
    range_input.dispatch_event("change")

    time.sleep(1)

    print("Checking for warning...")
    expect(warning_locator).to_be_visible()

    page.screenshot(path="/home/jules/verification/2_dashboard_warning.png")
    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_dashboard(page)
        except Exception as e:
            print(f"Script Failed: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
