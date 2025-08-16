import requests
import sys
import json
from datetime import datetime

class CarWashAPITester:
    def __init__(self, base_url="https://washwizard-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.car_id = None
        self.service_id = None
        self.booking_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_get_services(self):
        """Test getting services (should work without auth)"""
        success, response = self.run_test(
            "Get Services",
            "GET", 
            "api/services",
            200
        )
        if success and response:
            services = response
            print(f"   Found {len(services)} services")
            expected_services = [
                "Quick Touchless Wash", "Quick Wash", "Inside Out Wash", 
                "Polish", "Silver Wash", "Gold Wash"
            ]
            for service in services:
                if service.get('name') in expected_services:
                    print(f"   ✓ Service: {service.get('name')} - ${service.get('price')}")
                    if not self.service_id:
                        self.service_id = service.get('id')
            return len(services) == 6
        return False

    def test_auth_me_without_token(self):
        """Test /api/auth/me without authentication (should fail)"""
        success, response = self.run_test(
            "Auth Me (No Token)",
            "GET",
            "api/auth/me", 
            401
        )
        return success

    def test_create_car_without_auth(self):
        """Test creating car without authentication (should fail)"""
        car_data = {
            "make": "Toyota",
            "model": "Camry", 
            "year": 2022,
            "license_plate": "TEST123"
        }
        success, response = self.run_test(
            "Create Car (No Auth)",
            "POST",
            "api/cars",
            401,
            data=car_data
        )
        return success

    def test_get_cars_without_auth(self):
        """Test getting cars without authentication (should fail)"""
        success, response = self.run_test(
            "Get Cars (No Auth)",
            "GET",
            "api/cars",
            401
        )
        return success

    def test_get_bookings_without_auth(self):
        """Test getting bookings without authentication (should fail)"""
        success, response = self.run_test(
            "Get Bookings (No Auth)",
            "GET", 
            "api/bookings",
            401
        )
        return success

    def test_invalid_login(self):
        """Test login with invalid session ID"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "api/auth/login?session_id=invalid_session",
            400
        )
        return success

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*50}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed - check logs above")

def main():
    print("🚗 Car Wash API Testing Suite")
    print("=" * 50)
    
    tester = CarWashAPITester()
    
    # Test public endpoints
    print("\n📋 Testing Public Endpoints...")
    tester.test_health_check()
    tester.test_get_services()
    
    # Test authentication requirements
    print("\n🔒 Testing Authentication Requirements...")
    tester.test_auth_me_without_token()
    tester.test_create_car_without_auth()
    tester.test_get_cars_without_auth()
    tester.test_get_bookings_without_auth()
    tester.test_invalid_login()
    
    # Print final summary
    tester.print_summary()
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())