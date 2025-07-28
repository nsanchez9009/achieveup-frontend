import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkillMatrixCreator from './SkillMatrixCreator';

// Mock API calls
const mockGetInstructorCourses = jest.fn();
const mockGetSkillSuggestions = jest.fn();
const mockCreateMatrix = jest.fn();

jest.mock('../../services/api', () => ({
  canvasInstructorAPI: {
    getInstructorCourses: mockGetInstructorCourses,
  },
  skillMatrixAPI: {
    getSkillSuggestions: mockGetSkillSuggestions,
    create: mockCreateMatrix,
  },
}));

// Mock react-hot-toast
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

jest.mock('react-hot-toast', () => ({
  toast: mockToast,
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(() => ({ onChange: jest.fn(), onBlur: jest.fn(), name: 'test', ref: jest.fn() })),
    handleSubmit: jest.fn((fn) => fn),
    setValue: jest.fn(),
    formState: { errors: {} },
  }),
}));

describe('SkillMatrixCreator Component', () => {
  const mockCourses = [
    {
      id: 'course1',
      name: 'Introduction to Web Development',
      code: 'COP3530',
      description: 'Learn HTML, CSS, and JavaScript fundamentals'
    },
    {
      id: 'course2',
      name: 'Advanced Database Systems',
      code: 'CDA4010',
      description: 'Advanced concepts in database design and optimization'
    }
  ];

  const mockSkillSuggestions = [
    {
      skill: 'HTML/CSS Fundamentals',
      relevance: 0.95,
      description: 'Core web markup and styling skills'
    },
    {
      skill: 'JavaScript Programming',
      relevance: 0.90,
      description: 'Client-side scripting and DOM manipulation'
    },
    {
      skill: 'Responsive Design',
      relevance: 0.85,
      description: 'Mobile-first design principles'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInstructorCourses.mockResolvedValue({ data: mockCourses });
    mockGetSkillSuggestions.mockResolvedValue({ data: mockSkillSuggestions });
    mockCreateMatrix.mockResolvedValue({ data: { id: 'matrix1', matrix_name: 'Test Matrix' } });
  });

  test('renders initial course selection step', async () => {
    render(<SkillMatrixCreator />);

    await waitFor(() => {
      expect(screen.getByText('Skill Matrix Creator')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Select Course')).toBeInTheDocument();
      expect(mockGetInstructorCourses).toHaveBeenCalled();
    });
  });

  test('displays courses from API', async () => {
    render(<SkillMatrixCreator />);

    await waitFor(() => {
      expect(screen.getByText('Introduction to Web Development')).toBeInTheDocument();
      expect(screen.getByText('COP3530')).toBeInTheDocument();
      expect(screen.getByText('Advanced Database Systems')).toBeInTheDocument();
      expect(screen.getByText('CDA4010')).toBeInTheDocument();
    });
  });

  test('handles course selection and moves to skill suggestions step', async () => {
    render(<SkillMatrixCreator />);

    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      expect(screen.getByText('Step 2: Get Skill Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Selected Course')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Web Development')).toBeInTheDocument();
    });
  });

  test('handles AI skill suggestion process', async () => {
    render(<SkillMatrixCreator />);

    // Select course
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    // Click get suggestions button
    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      expect(mockGetSkillSuggestions).toHaveBeenCalledWith({
        courseId: 'course1',
        courseName: 'Introduction to Web Development',
        courseCode: 'COP3530',
        courseDescription: 'Learn HTML, CSS, and JavaScript fundamentals'
      });
    });
  });

  test('displays AI-suggested skills with relevance scores', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to suggestions step and get suggestions
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Step 3: Review and Customize Skills')).toBeInTheDocument();
      expect(screen.getByText('AI Suggested Skills (3 skills)')).toBeInTheDocument();
      expect(screen.getByText('HTML/CSS Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Programming')).toBeInTheDocument();
      expect(screen.getByText('Responsive Design')).toBeInTheDocument();
      expect(screen.getByText('Relevance: 95%')).toBeInTheDocument();
    });
  });

  test('allows toggling of suggested skills', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to review step
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      const skillCard = screen.getByText('HTML/CSS Fundamentals').closest('div');
      expect(skillCard).toHaveClass('border-green-300', 'bg-green-50'); // Should be selected by default
      
      fireEvent.click(skillCard!);
      expect(skillCard).toHaveClass('border-gray-200'); // Should be deselected
    });
  });

  test('allows adding custom skills', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to review step
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      const customSkillInput = screen.getByPlaceholderText('Add custom skill...');
      fireEvent.change(customSkillInput, { target: { value: 'Custom Skill' } });
      
      const addButton = screen.getByRole('button', { name: '' }); // Plus icon button
      fireEvent.click(addButton);
      
      expect(screen.getByText('Custom Skill')).toBeInTheDocument();
    });
  });

  test('allows editing existing skills', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to review step with skills
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      // Find and click edit button for a skill
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(btn => btn.querySelector('svg')); // Edit icon
      if (editButton) {
        fireEvent.click(editButton);
        
        // Should show input field for editing
        const editInput = screen.getByDisplayValue('HTML/CSS Fundamentals');
        fireEvent.change(editInput, { target: { value: 'Updated HTML/CSS Skills' } });
        fireEvent.blur(editInput);
        
        expect(screen.getByText('Updated HTML/CSS Skills')).toBeInTheDocument();
      }
    });
  });

  test('allows removing skills', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to review step
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      // Find and click remove button for a skill
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(btn => btn.querySelector('svg')); // Trash icon
      if (removeButton) {
        fireEvent.click(removeButton);
        
        // Skill should be removed from final skills list
        expect(screen.queryByText('HTML/CSS Fundamentals')).not.toBeInTheDocument();
      }
    });
  });

  test('handles matrix creation with valid data', async () => {
    const onMatrixCreated = jest.fn();
    render(<SkillMatrixCreator onMatrixCreated={onMatrixCreated} />);

    // Navigate through all steps
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      const createButton = screen.getByText('Create Skill Matrix');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(mockCreateMatrix).toHaveBeenCalledWith({
        course_id: 'course1',
        matrix_name: 'Introduction to Web Development - Skills Matrix',
        skills: ['HTML/CSS Fundamentals', 'JavaScript Programming', 'Responsive Design'],
        description: undefined
      });
      expect(onMatrixCreated).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Skill matrix created successfully!');
    });
  });

  test('prevents creation with no skills selected', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to review step
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      // Deselect all skills
      const skillCards = screen.getAllByText(/HTML\/CSS|JavaScript|Responsive/).map(text => text.closest('div'));
      skillCards.forEach(card => card && fireEvent.click(card));
      
      const createButton = screen.getByText('Create Skill Matrix');
      expect(createButton).toBeDisabled();
    });
  });

  test('handles API error for course loading', async () => {
    mockGetInstructorCourses.mockRejectedValue(new Error('Network error'));
    
    render(<SkillMatrixCreator />);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to load courses');
    });
  });

  test('handles API error for skill suggestions', async () => {
    mockGetSkillSuggestions.mockRejectedValue(new Error('AI service unavailable'));
    
    render(<SkillMatrixCreator />);

    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to get skill suggestions. You can add skills manually.');
      expect(screen.getByText('Step 3: Review and Customize Skills')).toBeInTheDocument();
    });
  });

  test('handles matrix creation failure', async () => {
    mockCreateMatrix.mockRejectedValue(new Error('Database error'));
    
    render(<SkillMatrixCreator />);

    // Navigate through steps and attempt creation
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      const createButton = screen.getByText('Create Skill Matrix');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to create skill matrix');
    });
  });

  test('allows skipping AI suggestions and manual entry', async () => {
    render(<SkillMatrixCreator />);

    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const skipButton = screen.getByText('Skip and Add Skills Manually');
      fireEvent.click(skipButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Step 3: Review and Customize Skills')).toBeInTheDocument();
      expect(screen.queryByText('AI Suggested Skills')).not.toBeInTheDocument();
      expect(screen.getByText('No skills added yet. Add skills below.')).toBeInTheDocument();
    });
  });

  test('shows loading state during skill suggestions', async () => {
    let resolvePromise: (value: any) => void;
    const loadingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetSkillSuggestions.mockReturnValue(loadingPromise);

    render(<SkillMatrixCreator />);

    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    let suggestionsButton: HTMLElement | null = null;
    await waitFor(() => {
      suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    // Should show loading state
    expect(screen.getByText('Getting Skill Suggestions...')).toBeInTheDocument();
    expect(suggestionsButton!).toBeDisabled();

    // Resolve the promise
    resolvePromise!({ data: mockSkillSuggestions });
    
    await waitFor(() => {
      expect(screen.queryByText('Getting Skill Suggestions...')).not.toBeInTheDocument();
    });
  });

  test('shows loading state during matrix creation', async () => {
    let resolvePromise: (value: any) => void;
    const loadingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockCreateMatrix.mockReturnValue(loadingPromise);

    render(<SkillMatrixCreator />);

    // Navigate to creation step
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    let createButton: HTMLElement | null = null;
    await waitFor(() => {
      createButton = screen.getByText('Create Skill Matrix');
      fireEvent.click(createButton);
    });

    // Should show loading state
    expect(createButton!).toBeDisabled();

    // Resolve the promise
    resolvePromise!({ data: { id: 'matrix1' } });
    
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });
  });

  test('handles keyboard navigation for custom skill input', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to review step
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const skipButton = screen.getByText('Skip and Add Skills Manually');
      fireEvent.click(skipButton);
    });

    await waitFor(() => {
      const customSkillInput = screen.getByPlaceholderText('Add custom skill...');
      fireEvent.change(customSkillInput, { target: { value: 'Keyboard Skill' } });
      fireEvent.keyPress(customSkillInput, { key: 'Enter', code: 'Enter' });
      
      expect(screen.getByText('Keyboard Skill')).toBeInTheDocument();
    });
  });

  test('prevents duplicate custom skills', async () => {
    render(<SkillMatrixCreator />);

    // Navigate to review step with existing skills
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      const customSkillInput = screen.getByPlaceholderText('Add custom skill...');
      fireEvent.change(customSkillInput, { target: { value: 'HTML/CSS Fundamentals' } }); // Duplicate
      
      const addButton = screen.getByRole('button', { name: '' });
      fireEvent.click(addButton);
      
      // Should not add duplicate - count should remain the same
      const skillElements = screen.getAllByText('HTML/CSS Fundamentals');
      expect(skillElements).toHaveLength(1); // Only original, not duplicate
    });
  });

  test('handles back navigation between steps', async () => {
    render(<SkillMatrixCreator />);

    // Navigate forward
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Step 3: Review and Customize Skills')).toBeInTheDocument();
      
      // Click back button
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      expect(screen.getByText('Step 2: Get Skill Suggestions')).toBeInTheDocument();
    });
  });

  test('resets form state on successful creation', async () => {
    render(<SkillMatrixCreator />);

    // Complete creation process
    await waitFor(() => {
      const courseCard = screen.getByText('Introduction to Web Development').closest('div');
      fireEvent.click(courseCard!);
    });

    await waitFor(() => {
      const suggestionsButton = screen.getByText('Get Skill Suggestions');
      fireEvent.click(suggestionsButton);
    });

    await waitFor(() => {
      const createButton = screen.getByText('Create Skill Matrix');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      // Should reset to step 1
      expect(screen.getByText('Step 1: Select Course')).toBeInTheDocument();
    });
  });
}); 