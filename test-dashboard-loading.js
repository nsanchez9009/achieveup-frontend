const axios = require('axios');

const API_BASE_URL = 'https://gen-ai-prime-3ddeabb35bd7.herokuapp.com';
const TEST_EMAIL = 'nsanchez9009@gmail.com';
const TEST_PASSWORD = 'password123';

async function testDashboardLoading() {
  console.log('🔍 Testing Dashboard Loading Issue...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connectivity...');
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      console.log('✅ Backend is running:', response.data);
    } catch (error) {
      console.log('❌ Backend is not responding:', error.message);
      return;
    }

    // Test 2: Test login
    console.log('\n2. Testing login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      console.log('✅ Login successful');
      console.log('User data:', loginResponse.data.user);
      console.log('Canvas API Token:', loginResponse.data.user.canvasApiToken ? 'Set' : 'Not set');
      
      const token = loginResponse.data.token;
      
      // Test 3: Test Canvas courses endpoint
      console.log('\n3. Testing Canvas courses endpoint...');
      try {
        const coursesResponse = await axios.get(`${API_BASE_URL}/canvas/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Canvas courses endpoint working');
        console.log('Courses found:', coursesResponse.data.length);
      } catch (error) {
        console.log('❌ Canvas courses endpoint failed:', error.response?.status, error.response?.data);
      }

      // Test 4: Test auth/me endpoint
      console.log('\n4. Testing auth/me endpoint...');
      try {
        const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Auth/me endpoint working');
        console.log('User data from /me:', meResponse.data.user);
      } catch (error) {
        console.log('❌ Auth/me endpoint failed:', error.response?.status, error.response?.data);
      }

    } catch (error) {
      console.log('❌ Login failed:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('- If backend is not running: Start the backend server');
  console.log('- If login fails: Check if user exists in database');
  console.log('- If Canvas endpoints return 404: Backend endpoints not implemented yet');
  console.log('- If auth/me fails: Authentication system not working');
}

// Run the test
testDashboardLoading(); 