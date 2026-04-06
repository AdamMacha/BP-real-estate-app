import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(name, method, path, expected_status=200):
    url = f"{BASE_URL}{path}"
    print(f"Testing {name} ({method} {path})...", end=" ", flush=True)
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, timeout=5)
        
        if response.status_code == expected_status:
            print("✅ PASSED")
            return True
        else:
            print(f"❌ FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def run_tests():
    print("=== Real Estate Scraper API Testing Suite ===\n")
    
    results = []
    results.append(test_endpoint("Root Endpoint", "GET", "/"))
    results.append(test_endpoint("Health Check", "GET", "/health"))
    results.append(test_endpoint("Scraping Status", "GET", "/scrape/status"))
    results.append(test_endpoint("Invalid Detail ID", "GET", "/property/non-existent-id", 404))
    
    # Optional: Test triggering a small scrape (commented out to avoid accidental load)
    # results.append(test_endpoint("Trigger Sreality (1 page)", "POST", "/scrape/sreality?max_pages=1"))
    
    passed = results.count(True)
    total = len(results)
    
    print(f"\nFinal Results: {passed}/{total} passed")
    
    if passed == total:
        print("\nAll systems operational! 🚀")
    else:
        print("\nSome tests failed. Check if the server is running.")

if __name__ == "__main__":
    run_tests()
