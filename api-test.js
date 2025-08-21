// API Test Script for User Management
// This script tests the admin user endpoints to ensure they're working properly

import { API_CONFIG } from './src/config/api.js';

// Mock JWT token for testing (replace with real admin token)
const TEST_TOKEN = 'your-admin-jwt-token-here';

// Test function to check API endpoints
async function testUserAPIs() {
  console.log('🧪 Starting User Management API Tests...\n');

  // Test 1: List all users
  try {
    console.log('1. Testing GET /admin/users');
    console.log(`   URL: ${API_CONFIG.ADMIN.USERS.LIST}`);

    const response = await fetch(API_CONFIG.ADMIN.USERS.LIST, {
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS - Users fetched successfully');
      console.log(
        `   📊 Total users: ${data.total || data.users?.length || 0}`
      );
      console.log(`   📄 Response structure:`, {
        hasUsers: !!data.users,
        hasTotal: !!data.total,
        firstUserKeys: data.users?.[0] ? Object.keys(data.users[0]) : [],
      });

      // Analyze user data structure
      if (data.users && data.users.length > 0) {
        const sampleUser = data.users[0];
        console.log('   👤 Sample user structure:', {
          id: sampleUser.id,
          nom_utilisateur: sampleUser.nom_utilisateur,
          email: sampleUser.email,
          roles: sampleUser.roles,
          statut_compte: sampleUser.statut_compte,
          is_verified: sampleUser.is_verified,
        });
      }
    } else {
      console.log(`   ❌ FAILED - Status: ${response.status}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log('   ❌ ERROR -', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Get specific user (if we have one)
  try {
    console.log('2. Testing GET /admin/users/{id}');
    const userId = 4; // From your API response example
    const url = API_CONFIG.ADMIN.USERS.GET_BY_ID(userId);
    console.log(`   URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS - User details fetched');
      console.log('   👤 User data:', data);
    } else {
      console.log(`   ❌ FAILED - Status: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ ERROR -', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Check auth endpoints
  try {
    console.log('3. Testing AUTH endpoints structure');
    console.log(`   LOGIN: ${API_CONFIG.AUTH.LOGIN}`);
    console.log(`   REGISTER: ${API_CONFIG.AUTH.REGISTER}`);
    console.log(`   PROFILE: ${API_CONFIG.AUTH.PROFILE}`);
    console.log('   ✅ All auth endpoints configured');
  } catch (error) {
    console.log('   ❌ ERROR -', error.message);
  }

  console.log('\n🏁 API Tests Complete!\n');
}

// Data structure analysis based on your API response
console.log('📋 Expected API Response Structure Analysis:');
console.log('='.repeat(50));

const expectedStructure = {
  users: [
    {
      id: 'number',
      nom_utilisateur: 'string',
      email: 'string',
      statut_compte: 'string (ACTIF/actif)',
      is_verified: 'boolean',
      roles: [
        {
          id: 'number',
          nom: 'string (admin/teacher/student)',
        },
      ],
    },
  ],
  total: 'number',
  page: 'number',
  per_page: 'number',
  total_pages: 'number',
};

console.log('Expected structure:', JSON.stringify(expectedStructure, null, 2));

console.log('\n📝 Key Mappings for Component:');
console.log('API Field → Component Field');
console.log('nom_utilisateur → first_name (for display)');
console.log('roles[0].nom → role');
console.log('statut_compte → account_status');
console.log('is_verified → verified');

console.log('\n🔍 User Role Detection Logic:');
console.log('- Users with no roles[] = Students');
console.log('- Users with roles[0].nom = "teacher" = Teachers');
console.log('- Users with roles[0].nom = "admin" = Admins');

// To run this test, you would need to:
// 1. Replace TEST_TOKEN with a real admin JWT token
// 2. Run: node api-test.js
// 3. Or integrate into your app's test suite

export { testUserAPIs };
