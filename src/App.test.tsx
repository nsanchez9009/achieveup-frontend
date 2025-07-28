import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the API service
jest.mock('./services/api', () => ({
  authAPI: {
    me: jest.fn().mockRejectedValue(new Error('Not authenticated')),
    login: jest.fn(),
    signup: jest.fn(),
    validateCanvasToken: jest.fn(),
  },
  canvasInstructorAPI: {
    getInstructorCourses: jest.fn().mockResolvedValue({ data: [] }),
  },
  instructorAPI: {
    getInstructorDashboard: jest.fn().mockResolvedValue({ 
      data: { totalCourses: 0, totalStudents: 0, averageProgress: 0, recentActivity: [] }
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

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows login page when not authenticated', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/AchieveUp Instructor Portal/i)).toBeInTheDocument();
    });
    
    // Check for login form elements
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders toaster component', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});

describe('App Routes', () => {
  test('redirects to login when not authenticated', async () => {
    render(<App />);
    
    await waitFor(() => {
      // Should show login page content
      expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
    });
  });

  test('shows login page features', () => {
    render(<App />);
    
    // Check for feature list on login page
    expect(screen.getByText(/AI-powered skill suggestions for your courses/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-shot classification for quiz questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Track student progress and skill mastery/i)).toBeInTheDocument();
  });
});

describe('Error Handling', () => {
  test('handles API errors gracefully', () => {
    // The app should render even if API calls fail
    render(<App />);
    expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
  });
});

describe('App Structure', () => {
  test('has proper routing structure', () => {
    render(<App />);
    
    // Should render the login page when not authenticated
    expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  test('includes signup link', () => {
    render(<App />);
    
    const signupLink = screen.getByText('Create account');
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });
}); 