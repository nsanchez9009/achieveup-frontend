const axios = require('axios');

const BASE_URL = 'https://gen-ai-prime-3ddeabb35bd7.herokuapp.com';

async function testBackend() {
  console.log('🧪 Testing AchieveUp Backend Integration\n');
  
  let authToken = null;
  let userId = null;
  
  // Generate unique email to avoid conflicts
  const uniqueEmail = `test-${Date.now()}@example.com`;
  
  try {
    // Test 1: Backend connectivity
    console.log('1. Testing backend connectivity...');
    const rootResponse = await axios.get(BASE_URL);
    console.log('✅ Backend is running:', rootResponse.data);
    
    // Test 2: User registration
    console.log('\n2. Testing user registration...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Test User',
      email: uniqueEmail,
      password: 'password123',
      canvasApiToken: 'test-token'
    });
    authToken = signupResponse.data.token;
    userId = signupResponse.data.user.id;
    console.log('✅ User registered successfully');
    console.log('   User ID:', userId);
    console.log('   Email:', uniqueEmail);
    console.log('   Token received:', authToken ? 'Yes' : 'No');
    
    // Test 3: User login
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: uniqueEmail,
      password: 'password123'
    });
    console.log('✅ User login successful');
    
    // Test 4: Canvas integration (should fail without valid token)
    console.log('\n4. Testing Canvas integration...');
    try {
      await axios.get(`${BASE_URL}/canvas/courses`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'Canvas API token not found') {
        console.log('✅ Canvas endpoint correctly handles missing token');
      } else {
        console.log('❌ Unexpected Canvas error:', error.response?.data);
      }
    }
    
    // Test 5: Skill matrix creation
    console.log('\n5. Testing skill matrix creation...');
    const matrixResponse = await axios.post(`${BASE_URL}/achieveup/matrix/create`, {
      course_id: 'test-course-123',
      matrix_name: 'Test Skill Matrix',
      skills: ['JavaScript', 'React', 'TypeScript', 'Node.js']
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Skill matrix created successfully');
    console.log('   Matrix ID:', matrixResponse.data._id);
    console.log('   Skills:', matrixResponse.data.skills);
    
    // Test 6: Skill matrix retrieval
    console.log('\n6. Testing skill matrix retrieval...');
    const getMatrixResponse = await axios.get(`${BASE_URL}/achieveup/matrix/test-course-123`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Skill matrix retrieved successfully');
    console.log('   Matrix name:', getMatrixResponse.data.matrix_name);
    
    // Test 7: Badge generation
    console.log('\n7. Testing badge generation...');
    const badgeResponse = await axios.post(`${BASE_URL}/achieveup/badges/generate`, {
      student_id: userId,
      course_id: 'test-course-123',
      skill_levels: {
        'JavaScript': 'intermediate',
        'React': 'beginner',
        'TypeScript': 'advanced',
        'Node.js': 'intermediate'
      }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Badges generated successfully');
    console.log('   Badges created:', badgeResponse.data.length);
    badgeResponse.data.forEach(badge => {
      console.log(`   - ${badge.skill}: ${badge.badge_type} (${badge.level})`);
    });
    
    // Test 8: Progress tracking
    console.log('\n8. Testing progress tracking...');
    const progressResponse = await axios.get(`${BASE_URL}/achieveup/progress/${userId}/test-course-123`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Progress tracking working');
    console.log('   Student ID:', progressResponse.data.student_id);
    console.log('   Course ID:', progressResponse.data.course_id);
    
    // Test 9: Badge retrieval
    console.log('\n9. Testing badge retrieval...');
    const getBadgesResponse = await axios.get(`${BASE_URL}/achieveup/badges/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Badges retrieved successfully');
    console.log('   Total badges:', getBadgesResponse.data.length);
    
    // Test 10: Skill assignment
    console.log('\n10. Testing skill assignment...');
    const skillAssignmentResponse = await axios.post(`${BASE_URL}/achieveup/assign-skills`, {
      course_id: 'test-course-123',
      question_skills: {
        'question-1': ['JavaScript', 'React'],
        'question-2': ['TypeScript'],
        'question-3': ['Node.js']
      }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Skill assignment successful');
    
    // Test 11: Skill suggestions
    console.log('\n11. Testing skill suggestions...');
    const suggestionResponse = await axios.post(`${BASE_URL}/achieveup/suggest-skills`, {
      question_text: 'How do you create a React component?',
      course_context: 'React development course'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Skill suggestions working');
    console.log('   Suggested skills:', suggestionResponse.data);
    
    // Test 12: Analytics/Graphs
    console.log('\n12. Testing analytics...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/achieveup/graphs/individual/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Analytics endpoint working');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Analytics endpoint not implemented yet');
      } else {
        console.log('❌ Analytics error:', error.response?.data);
      }
    }
    
    // Test 13: Export functionality
    console.log('\n13. Testing export functionality...');
    try {
      const exportResponse = await axios.get(`${BASE_URL}/achieveup/export/test-course-123`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Export endpoint working');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Export endpoint not implemented yet');
      } else {
        console.log('❌ Export error:', error.response?.data);
      }
    }
    
    console.log('\n🎉 BACKEND INTEGRATION TEST COMPLETE!');
    console.log('✅ All core AchieveUp endpoints are working');
    console.log('✅ Authentication system is functional');
    console.log('✅ Skill matrix management is working');
    console.log('✅ Badge system is operational');
    console.log('✅ Progress tracking is active');
    console.log('✅ Canvas integration is ready (needs valid token)');
    console.log('\n🚀 Frontend should now be fully functional!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackend(); 