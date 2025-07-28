import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock all API calls
const mockLogin = jest.fn();
const mockSignup = jest.fn();
const mockMe = jest.fn();
const mockValidateCanvasToken = jest.fn();
const mockGetInstructorCourses = jest.fn();
const mockGetInstructorQuizzes = jest.fn();
const mockGetInstructorQuestions = jest.fn();
const mockGetSkillSuggestions = jest.fn();
const mockCreateMatrix = jest.fn();
const mockAnalyzeQuestions = jest.fn();
const mockAssignSkills = jest.fn();

jest.mock('../services/api', () => ({
  authAPI: {
    login: mockLogin,
    signup: mockSignup,
    me: mockMe,
    validateCanvasToken: mockValidateCanvasToken,
  },
  canvasInstructorAPI: {
    getInstructorCourses: mockGetInstructorCourses,
    getInstructorQuizzes: mockGetInstructorQuizzes,
    getInstructorQuestions: mockGetInstructorQuestions,
  },
  skillMatrixAPI: {
    getSkillSuggestions: mockGetSkillSuggestions,
    create: mockCreateMatrix,
  },
  skillAssignmentAPI: {
    analyzeQuestions: mockAnalyzeQuestions,
    assign: mockAssignSkills,
  },
  instructorAPI: {
    getInstructorDashboard: jest.fn().mockResolvedValue({
      data: { totalCourses: 3, totalStudents: 45, averageProgress: 78, recentActivity: [] }
    }),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AchieveUp App Integration Tests', () => {
  const mockUser = {
    id: 'user1',
    name: 'Dr. Jane Smith',
    email: 'jane.smith@ucf.edu',
    role: 'instructor' as const,
    canvasTokenType: 'instructor' as const,
    hasCanvasToken: true,
  };

  const mockCourses = [
    {
      id: 'course1',
      name: 'Web Development Fundamentals',
      code: 'COP3530',
      description: 'Introduction to modern web development'
    },
    {
      id: 'course2',
      name: 'Database Systems',
      code: 'CDA4010',
      description: 'Relational database design and SQL'
    }
  ];

  const mockQuizzes = [
    {
      id: 'quiz1',
      title: 'HTML & CSS Fundamentals Quiz',
      course_id: 'course1'
    },
    {
      id: 'quiz2',
      title: 'JavaScript Basics Quiz',
      course_id: 'course1'
    }
  ];

  const mockQuestions = [
    {
      id: 'q1',
      question_text: 'What is the purpose of the HTML DOCTYPE declaration?',
      quiz_id: 'quiz1',
      question_type: 'multiple_choice',
      points: 5
    },
    {
      id: 'q2',
      question_text: 'How do you create a CSS class selector?',
      quiz_id: 'quiz1',
      question_type: 'multiple_choice',
      points: 5
    }
  ];

  const mockSkillSuggestions = [
    {
      skill: 'HTML Fundamentals',
      relevance: 0.95,
      description: 'Basic HTML structure and elements'
    },
    {
      skill: 'CSS Styling',
      relevance: 0.90,
      description: 'CSS selectors and styling properties'
    },
    {
      skill: 'JavaScript Basics',
      relevance: 0.85,
      description: 'Variables, functions, and DOM manipulation'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup default successful responses
    mockLogin.mockResolvedValue(true);
    mockMe.mockResolvedValue({ data: mockUser });
    mockGetInstructorCourses.mockResolvedValue({ data: mockCourses });
    mockGetInstructorQuizzes.mockResolvedValue({ data: mockQuizzes });
    mockGetInstructorQuestions.mockResolvedValue({ data: mockQuestions });
    mockGetSkillSuggestions.mockResolvedValue({ data: mockSkillSuggestions });
    mockCreateMatrix.mockResolvedValue({ data: { id: 'matrix1', matrix_name: 'Test Matrix' } });
    mockAnalyzeQuestions.mockResolvedValue({ 
      data: [
        { questionId: 'q1', complexity: 'medium', suggestedSkills: ['HTML Fundamentals'], confidence: 0.9 },
        { questionId: 'q2', complexity: 'medium', suggestedSkills: ['CSS Styling'], confidence: 0.85 }
      ]
    });
    mockAssignSkills.mockResolvedValue({ data: { success: true } });
  });

  describe('Complete User Journey: Login → Dashboard → Skill Matrix → Skill Assignment', () => {
    test('instructor can complete full workflow successfully', async () => {
      // Initially not authenticated
      mockMe.mockRejectedValueOnce(new Error('Not authenticated'));
      
      render(<App />);

      // 1. LOGIN FLOW
      await waitFor(() => {
        expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'jane.smith@ucf.edu' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Mock successful login
      mockMe.mockResolvedValue({ data: mockUser });
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      
      fireEvent.click(loginButton);

      // 2. DASHBOARD VERIFICATION
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Dr. Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // Total courses
        expect(screen.getByText('45')).toBeInTheDocument(); // Total students
      });

      // Verify navigation is available
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Skill Matrix')).toBeInTheDocument();
      expect(screen.getByText('Skill Assignment')).toBeInTheDocument();

      // 3. SKILL MATRIX CREATION FLOW
      const skillMatrixLink = screen.getByText('Skill Matrix');
      fireEvent.click(skillMatrixLink);

      await waitFor(() => {
        expect(screen.getByText('Skill Matrix Creator')).toBeInTheDocument();
        expect(screen.getByText('Step 1: Select Course')).toBeInTheDocument();
      });

      // Select a course
      await waitFor(() => {
        const courseCard = screen.getByText('Web Development Fundamentals').closest('div');
        fireEvent.click(courseCard!);
      });

      await waitFor(() => {
        expect(screen.getByText('Step 2: Get Skill Suggestions')).toBeInTheDocument();
        expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument();
      });

      // Get AI skill suggestions
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        expect(screen.getByText('Step 3: Review and Customize Skills')).toBeInTheDocument();
        expect(screen.getByText('HTML Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('CSS Styling')).toBeInTheDocument();
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      });

      // Create the skill matrix
      const createMatrixButton = screen.getByText('Create Skill Matrix');
      fireEvent.click(createMatrixButton);

      await waitFor(() => {
        expect(mockCreateMatrix).toHaveBeenCalledWith({
          course_id: 'course1',
          matrix_name: 'Web Development Fundamentals - Skills Matrix',
          skills: ['HTML Fundamentals', 'CSS Styling', 'JavaScript Basics'],
          description: undefined
        });
      });

      // 4. SKILL ASSIGNMENT FLOW
      const skillAssignmentLink = screen.getByText('Skill Assignment');
      fireEvent.click(skillAssignmentLink);

      await waitFor(() => {
        expect(screen.getByText('Skill Assignment Interface')).toBeInTheDocument();
      });

      // Select course and quiz
      const courseSelect = screen.getByDisplayValue('');
      fireEvent.change(courseSelect, { target: { value: 'course1' } });

      await waitFor(() => {
        const quizSelect = screen.getAllByDisplayValue('')[1]; // Second select for quiz
        fireEvent.change(quizSelect, { target: { value: 'quiz1' } });
      });

      // Wait for questions to load and AI analysis
      await waitFor(() => {
        expect(screen.getByText('Question 1')).toBeInTheDocument();
        expect(screen.getByText('What is the purpose of the HTML DOCTYPE declaration?')).toBeInTheDocument();
        expect(screen.getByText('Question 2')).toBeInTheDocument();
      });

      // Verify AI analysis completed
      await waitFor(() => {
        expect(mockAnalyzeQuestions).toHaveBeenCalledWith({
          courseId: 'course1',
          quizId: 'quiz1',
          questions: expect.arrayContaining([
            expect.objectContaining({ id: 'q1', text: 'What is the purpose of the HTML DOCTYPE declaration?' }),
            expect.objectContaining({ id: 'q2', text: 'How do you create a CSS class selector?' })
          ])
        });
      });

      // Save skill assignments
      const saveButton = screen.getByText('Save Assignments');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAssignSkills).toHaveBeenCalledWith({
          course_id: 'course1',
          question_skills: expect.any(Object)
        });
      });

      // Verify success
      expect(mockLogin).toHaveBeenCalledWith('jane.smith@ucf.edu', 'password123');
      expect(mockGetInstructorCourses).toHaveBeenCalled();
      expect(mockGetSkillSuggestions).toHaveBeenCalled();
      expect(mockCreateMatrix).toHaveBeenCalled();
      expect(mockAssignSkills).toHaveBeenCalled();
    });
  });

  describe('Error Handling Throughout Application', () => {
    test('handles authentication errors gracefully', async () => {
      mockMe.mockRejectedValue(new Error('Not authenticated'));
      mockLogin.mockResolvedValue(false);

      render(<App />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('wrong@email.com', 'wrongpassword');
        // Should remain on login page
        expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
      });
    });

    test('handles API failures during skill matrix creation', async () => {
      // Setup authenticated user
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Dr. Jane Smith')).toBeInTheDocument();
      });

      // Navigate to skill matrix
      fireEvent.click(screen.getByText('Skill Matrix'));

      await waitFor(() => {
        const courseCard = screen.getByText('Web Development Fundamentals').closest('div');
        fireEvent.click(courseCard!);
      });

      // Simulate AI service failure
      mockGetSkillSuggestions.mockRejectedValueOnce(new Error('AI service unavailable'));

      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        // Should gracefully handle error and allow manual entry
        expect(screen.getByText('Step 3: Review and Customize Skills')).toBeInTheDocument();
        expect(screen.getByText('No skills added yet. Add skills below.')).toBeInTheDocument();
      });
    });

    test('handles network failures during skill assignment', async () => {
      // Setup authenticated user
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Skill Assignment'));
      });

      await waitFor(() => {
        const courseSelect = screen.getByDisplayValue('');
        fireEvent.change(courseSelect, { target: { value: 'course1' } });
      });

      // Simulate quiz loading failure
      mockGetInstructorQuizzes.mockRejectedValueOnce(new Error('Network error'));

      await waitFor(() => {
        // Should handle error gracefully
        expect(screen.getByText('Skill Assignment Interface')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and State Management', () => {
    test('maintains state when navigating between pages', async () => {
      // Setup authenticated user
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
      });

      // Navigate to settings
      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('Account Settings')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Dr. Jane Smith')).toBeInTheDocument();
      });

      // Navigate back to dashboard
      fireEvent.click(screen.getByText('Dashboard'));

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Dr. Jane Smith')).toBeInTheDocument();
        // User info should still be available
        expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
      });
    });

    test('handles logout and cleanup', async () => {
      // Setup authenticated user
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
      });

      // Logout
      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      });
    });
  });

  describe('Responsive Design and Accessibility', () => {
    test('renders correctly on mobile viewports', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
      });

      // Mobile navigation should work
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Skill Matrix')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        const dashboardLink = screen.getByText('Dashboard');
        dashboardLink.focus();
        expect(dashboardLink).toHaveFocus();

        // Tab navigation
        fireEvent.keyDown(dashboardLink, { key: 'Tab' });
        const skillMatrixLink = screen.getByText('Skill Matrix');
        expect(skillMatrixLink).toHaveFocus();
      });
    });
  });

  describe('Performance and Loading States', () => {
    test('shows loading states during API calls', async () => {
      let resolveLogin: (value: boolean) => void;
      const loginPromise = new Promise<boolean>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      render(<App />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.click(loginButton);

      // Should show loading state
      expect(loginButton).toBeDisabled();

      // Resolve login
      resolveLogin!(true);
      mockMe.mockResolvedValue({ data: mockUser });
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Dr. Jane Smith')).toBeInTheDocument();
      });
    });

    test('handles slow network conditions', async () => {
      // Simulate slow API responses
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      mockGetInstructorCourses.mockImplementation(() => 
        delay(100).then(() => ({ data: mockCourses }))
      );

      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
      });

      // Navigate to skill matrix
      fireEvent.click(screen.getByText('Skill Matrix'));

      // Should eventually load courses
      await waitFor(() => {
        expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Edge Cases and Data Validation', () => {
    test('handles empty data responses', async () => {
      mockGetInstructorCourses.mockResolvedValue({ data: [] });
      
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Skill Matrix'));
      });

      await waitFor(() => {
        expect(screen.getByText('No courses found. Please check your Canvas integration.')).toBeInTheDocument();
      });
    });

    test('handles malformed API responses', async () => {
      mockGetInstructorCourses.mockResolvedValue({ data: null });
      
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockMe.mockResolvedValue({ data: mockUser });

      render(<App />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Skill Matrix'));
      });

      // Should handle gracefully without crashing
      expect(screen.getByText('Skill Matrix Creator')).toBeInTheDocument();
    });
  });
}); 