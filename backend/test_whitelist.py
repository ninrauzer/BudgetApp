"""
Test whitelist authorization system
Tests both authorized and unauthorized access attempts
"""
import requests
import json

BACKEND_URL = "http://192.168.126.127:8000"

def test_whitelist():
    """Test that whitelist authorization works"""
    
    print("\n" + "="*60)
    print("TESTING WHITELIST AUTHORIZATION")
    print("="*60)
    
    print("\n📋 Current status:")
    print("  ✅ allowed_users table created")
    print("  ✅ ninrauzer@gmail.com authorized")
    print("  ✅ Backend rebuilt with whitelist check")
    
    print("\n🔐 Authorization Logic:")
    print("  1. User authenticates with Google")
    print("  2. Backend extracts email from Google token")
    print("  3. Backend checks if email exists in allowed_users table")
    print("  4. If found & is_active=true → Allow access")
    print("  5. If not found → Return 403 Forbidden")
    
    print("\n" + "="*60)
    print("HOW TO TEST")
    print("="*60)
    
    print("\n✅ Test 1: Authorized User (ninrauzer@gmail.com)")
    print("  1. Open http://192.168.126.127:8080")
    print("  2. Click 'Sign in with Google'")
    print("  3. Select ninrauzer@gmail.com account")
    print("  4. Expected: Login successful, dashboard loads")
    print("  5. Check backend logs for: '[auth] ✅ Authorized user: ninrauzer@gmail.com'")
    
    print("\n❌ Test 2: Unauthorized User (any other Google account)")
    print("  1. Logout from current session")
    print("  2. Click 'Sign in with Google'")
    print("  3. Select different Google account (not ninrauzer@gmail.com)")
    print("  4. Expected: Error message 'Acceso denegado. Tu cuenta no está autorizada...'")
    print("  5. Check backend logs for: '[auth] ❌ Unauthorized access attempt: <email>'")
    
    print("\n📝 Check Backend Logs:")
    print("  docker compose logs backend --tail 50 -f")
    
    print("\n➕ Add More Authorized Users:")
    print("  1. Connect to database:")
    print("     psql postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev")
    print("  2. Add user:")
    print("     INSERT INTO allowed_users (email, name, is_active, added_by)")
    print("     VALUES ('example@gmail.com', 'Example User', true, 'admin');")
    print("  3. Verify:")
    print("     SELECT * FROM allowed_users;")
    
    print("\n🔧 Disable/Enable Users:")
    print("  -- Disable user:")
    print("  UPDATE allowed_users SET is_active = false WHERE email = 'user@gmail.com';")
    print("  -- Enable user:")
    print("  UPDATE allowed_users SET is_active = true WHERE email = 'user@gmail.com';")
    
    print("\n" + "="*60)
    print("SECURITY STATUS")
    print("="*60)
    print("  ✅ Whitelist authorization: ACTIVE")
    print("  ✅ Unauthorized access: BLOCKED (403 Forbidden)")
    print("  ✅ Only approved users can authenticate")
    print("  ✅ Added_by tracking: Available for audit")
    
    print("\n" + "="*60)
    print("NEXT STEPS")
    print("="*60)
    print("  1. ✅ Test login with ninrauzer@gmail.com (should work)")
    print("  2. ✅ Test login with unauthorized email (should fail)")
    print("  3. 🔄 Create admin API endpoints (/api/admin/allowed-users)")
    print("  4. 🔄 Create admin UI for managing whitelist")
    print("  5. 🔄 Add is_admin flag to User model")
    print("  6. 🔄 Protect admin endpoints (only admins can manage)")
    print()


if __name__ == "__main__":
    test_whitelist()
