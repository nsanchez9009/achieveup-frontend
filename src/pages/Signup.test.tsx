import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Signup from './Signup';

// Mock the AuthContext
const mockSignup = jest.fn();
const mockAuthContext = {
  user: null,
  logout: jest.fn(),
  backendAvailable: true,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  signup: mockSignup,
  refreshUser: jest.fn(),
};

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock react-hot-toast
const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
};

jest.mock('react-hot-toast', () => ({
  toast: mockToast,
}));

// Mock API
const mockValidateCanvasToken = jest.fn();
jest.mock('../services/api', () => ({
  authAPI: {
    validateCanvasToken: mockValidateCanvasToken,
  },
}));

const SignupWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form correctly', () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    expect(screen.getByText('Create Instructor Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/canvas api token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('displays Canvas token instructions', () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    expect(screen.getByText(/How to get your Canvas API Token/i)).toBeInTheDocument();
    expect(screen.getByText(/Log into your Canvas account/i)).toBeInTheDocument();
    expect(screen.getByText(/Go to Account → Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Scroll down to "Approved Integrations"/i)).toBeInTheDocument();
    expect(screen.getByText(/Click "\+ New Access Token"/i)).toBeInTheDocument();
  });

  test('validates all required fields', async () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      expect(screen.getByText('Canvas API token is required')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  test('validates password confirmation', async () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('validates Canvas token format', async () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(tokenInput, { target: { value: 'short-token' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Canvas token must be at least 64 characters')).toBeInTheDocument();
    });
  });

  test('validates Canvas token with backend', async () => {
    mockValidateCanvasToken.mockResolvedValue({ data: { valid: false, message: 'Invalid token' } });

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const validToken = '7~' + 'a'.repeat(62); // 64 character token

    fireEvent.change(tokenInput, { target: { value: validToken } });
    fireEvent.blur(tokenInput);

    await waitFor(() => {
      expect(mockValidateCanvasToken).toHaveBeenCalledWith({
        canvasApiToken: validToken,
        canvasTokenType: 'instructor'
      });
      expect(mockToast.error).toHaveBeenCalledWith('Invalid token');
    });
  });

  test('handles successful Canvas token validation', async () => {
    mockValidateCanvasToken.mockResolvedValue({ data: { valid: true } });

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const validToken = '7~' + 'a'.repeat(62);

    fireEvent.change(tokenInput, { target: { value: validToken } });
    fireEvent.blur(tokenInput);

    await waitFor(() => {
      expect(mockValidateCanvasToken).toHaveBeenCalledWith({
        canvasApiToken: validToken,
        canvasTokenType: 'instructor'
      });
      expect(mockToast.success).toHaveBeenCalledWith('Canvas token validated successfully');
    });
  });

  test('handles successful signup', async () => {
    mockSignup.mockResolvedValue(true);
    mockValidateCanvasToken.mockResolvedValue({ data: { valid: true } });

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    const validToken = '7~' + 'a'.repeat(62);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(tokenInput, { target: { value: validToken } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        canvasApiToken: validToken,
        canvasTokenType: 'instructor'
      });
    });
  });

  test('handles signup failure', async () => {
    mockSignup.mockResolvedValue(false);

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    const validToken = '7~' + 'a'.repeat(62);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(tokenInput, { target: { value: validToken } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  test('shows loading state during signup', async () => {
    let resolveSignup: (value: boolean) => void;
    const signupPromise = new Promise<boolean>((resolve) => {
      resolveSignup = resolve;
    });
    mockSignup.mockReturnValue(signupPromise);

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    const validToken = '7~' + 'a'.repeat(62);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(tokenInput, { target: { value: validToken } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();

    // Resolve the promise
    resolveSignup!(true);
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('login link navigation', () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const loginLink = screen.getByText('Sign in here');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('handles Canvas token validation error', async () => {
    mockValidateCanvasToken.mockRejectedValue(new Error('Network error'));

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const validToken = '7~' + 'a'.repeat(62);

    fireEvent.change(tokenInput, { target: { value: validToken } });
    fireEvent.blur(tokenInput);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Unable to validate token. Please check your connection.');
    });
  });

  test('handles special characters in name', async () => {
    mockSignup.mockResolvedValue(true);

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    const specialName = "José María O'Connor-Smith";
    const validToken = '7~' + 'a'.repeat(62);

    fireEvent.change(nameInput, { target: { value: specialName } });
    fireEvent.change(emailInput, { target: { value: 'jose@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(tokenInput, { target: { value: validToken } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          name: specialName
        })
      );
    });
  });

  test('handles long names', async () => {
    mockSignup.mockResolvedValue(true);

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const longName = 'Professor Dr. John William Alexander Smith-Richardson III';

    fireEvent.change(nameInput, { target: { value: longName } });
    expect(nameInput).toHaveValue(longName);
  });

  test('clears validation errors on input change', async () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Trigger validation error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });

    // Type in name field
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    // Error should clear
    await waitFor(() => {
      expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
    });
  });

  test('handles keyboard navigation', () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    nameInput.focus();
    expect(nameInput).toHaveFocus();

    fireEvent.keyDown(nameInput, { key: 'Tab' });
    expect(emailInput).toHaveFocus();
  });

  test('handles backend unavailable state', () => {
    const offlineAuthContext = {
      ...mockAuthContext,
      backendAvailable: false,
    };

    jest.mocked(require('../contexts/AuthContext').useAuth).mockReturnValue(offlineAuthContext);

    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    // Should still render the form even when backend is unavailable
    expect(screen.getByText('Create Instructor Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('prevents submission with invalid Canvas token format even if it passes client validation', async () => {
    render(
      <SignupWrapper>
        <Signup />
      </SignupWrapper>
    );

    const tokenInput = screen.getByLabelText(/canvas api token/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Token that's 64 characters but doesn't start with proper prefix
    const invalidToken = 'x'.repeat(64);

    fireEvent.change(tokenInput, { target: { value: invalidToken } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Canvas token must be at least 64 characters')).toBeInTheDocument();
    });
  });
}); 