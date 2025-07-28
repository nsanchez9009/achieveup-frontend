import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from './Login';

// Mock the AuthContext
const mockLogin = jest.fn();
const mockAuthContext = {
  user: null,
  logout: jest.fn(),
  backendAvailable: true,
  isAuthenticated: false,
  loading: false,
  login: mockLogin,
  signup: jest.fn(),
  refreshUser: jest.fn(),
};

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const LoginWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  test('displays all feature highlights', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    expect(screen.getByText(/AI-powered skill suggestions for your courses/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-shot classification for quiz questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Track student progress and skill mastery/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate verifiable skill badges/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    mockLogin.mockResolvedValue(true);

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('handles login failure', async () => {
    mockLogin.mockResolvedValue(false);

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });
  });

  test('shows loading state during login', async () => {
    let resolveLogin: (value: boolean) => void;
    const loginPromise = new Promise<boolean>((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValue(loginPromise);

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolveLogin!(true);
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('handles keyboard navigation', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    emailInput.focus();
    expect(emailInput).toHaveFocus();

    fireEvent.keyDown(emailInput, { key: 'Tab' });
    expect(passwordInput).toHaveFocus();
  });

  test('handles form submission with Enter key', async () => {
    mockLogin.mockResolvedValue(true);

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.keyDown(passwordInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('signup link navigation', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const signupLink = screen.getByText('Create account');
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  test('handles backend unavailable state', () => {
    const offlineAuthContext = {
      ...mockAuthContext,
      backendAvailable: false,
    };

    jest.mocked(require('../contexts/AuthContext').useAuth).mockReturnValue(offlineAuthContext);

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    // Should still render the form even when backend is unavailable
    expect(screen.getByText('AchieveUp Instructor Portal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('clears form validation errors on input change', async () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Trigger validation error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // Type in email field
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Error should clear
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  test('handles special characters in password', async () => {
    mockLogin.mockResolvedValue(true);

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    const specialPassword = 'P@ssw0rd!#$%^&*()';
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: specialPassword } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', specialPassword);
    });
  });

  test('handles long email addresses', async () => {
    mockLogin.mockResolvedValue(true);

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    const longEmail = 'very.long.email.address.that.might.cause.issues@example.com';
    fireEvent.change(emailInput, { target: { value: longEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(longEmail, 'password123');
    });
  });
}); 