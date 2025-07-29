import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen, Brain, Save, Edit2, Trash2, Plus, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillMatrixAPI, canvasAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SkillMatrix } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';

interface SkillMatrixCreatorProps {
  courseId?: string;
  onMatrixCreated?: (matrix: SkillMatrix) => void;
}

interface CanvasCourse {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface SkillSuggestion {
  skill: string;
  relevance: number;
  description: string;
}

const SkillMatrixCreator: React.FC<SkillMatrixCreatorProps> = ({ 
  courseId, 
  onMatrixCreated 
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '');
  const [selectedCourseData, setSelectedCourseData] = useState<CanvasCourse | null>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<SkillSuggestion[]>([]);
  const [finalSkills, setFinalSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [step, setStep] = useState<'select-course' | 'get-suggestions' | 'review-skills'>('select-course');
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const isInstructor = user?.canvasTokenType === 'instructor';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<{ matrixName: string; description?: string }>();

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = isInstructor 
        ? await canvasAPI.getInstructorCourses()
        : await canvasAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses. Please check your Canvas integration.');
    } finally {
      setLoading(false);
    }
  }, [isInstructor]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(courseId);
    setSelectedCourseData(course || null);
    
    if (course) {
      setValue('matrixName', `${course.name} - Skills Matrix`);
      setStep('get-suggestions');
    }
  };

  const getSkillSuggestions = async () => {
    if (!selectedCourseData) {
      toast.error('Please select a course first');
      return;
    }

    if (!isInstructor) {
      toast.error('Instructor access required for AI skill suggestions');
      return;
    }

    // Detailed request logging for debugging
    console.log('Starting skill suggestions request with:', {
      courseId: selectedCourse,
      courseName: selectedCourseData.name,
      courseCode: selectedCourseData.code,
      courseDescription: selectedCourseData.description || 'No description available'
    });

    setSuggestionsLoading(true);
    try {
      // Prepare and validate request data
      const requestData = {
        courseId: selectedCourse,
        courseName: selectedCourseData.name,
        courseCode: selectedCourseData.code,
        courseDescription: selectedCourseData.description
      };

      // Log the exact request being sent
      console.log('Sending skill suggestions request:', requestData);

      // Validate request data structure
      if (!requestData.courseId) {
        throw new Error('Missing courseId in request');
      }
      if (!requestData.courseName) {
        throw new Error('Missing courseName in request');
      }
      if (!requestData.courseCode) {
        throw new Error('Missing courseCode in request');
      }

      // Call backend for AI skill suggestions
      const response = await skillMatrixAPI.getSkillSuggestions(requestData);
      
      console.log('AI skill suggestions response:', response.data);
      
      // Handle different possible response formats
      let suggestions: SkillSuggestion[] = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        suggestions = response.data;
      } else if (response.data && Array.isArray((response.data as any).suggestedSkills)) {
        // Wrapped in suggestedSkills property
        suggestions = (response.data as any).suggestedSkills;
      } else if (response.data && (response.data as any).data && Array.isArray((response.data as any).data)) {
        // Double-wrapped response
        suggestions = (response.data as any).data;
      }
      
      // Ensure suggestions have the right format
      suggestions = suggestions.map((item: any) => {
        if (typeof item === 'string') {
          // If it's just a string, convert to SkillSuggestion format
          return {
            skill: item,
            relevance: 0.8, // Default relevance
            description: `Suggested skill for ${selectedCourseData.name}`
          };
        } else if (item && typeof item === 'object') {
          // If it's an object, ensure it has all required properties
          return {
            skill: item.skill || item.name || 'Unknown Skill',
            relevance: item.relevance || item.confidence || 0.8,
            description: item.description || `Suggested skill for ${selectedCourseData.name}`
          };
        }
        return item;
      }).filter(item => item && item.skill); // Remove any invalid items
      
      setSkillSuggestions(suggestions);
      
      // Auto-select all suggestions as starting point
      const suggestedSkills = suggestions.map((s: SkillSuggestion) => s.skill);
      setFinalSkills(suggestedSkills);
      
      setStep('review-skills');
      
      if (suggestions.length > 0) {
        toast.success(`Got ${suggestions.length} skill suggestions for ${selectedCourseData.name}`);
      } else {
        toast.error('⚠️ AI analysis completed but returned no skill suggestions. This appears to be a backend issue.');
      }
    } catch (error: any) {
      console.error('Error getting skill suggestions:', error);
      
      // Detailed error handling based on status code
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Bad request format';
        toast.error(`Skill suggestions failed (400): ${errorMsg}. Check console for request details.`);
        console.error('400 Error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          config: {
            url: error.response.config?.url,
            method: error.response.config?.method,
            data: error.response.config?.data
          }
        });
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please check your instructor token in Settings.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Instructor permissions required.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to get skill suggestions: ${errorMessage}. You can add skills manually.`);
      }
      
      // If backend fails, allow manual skill entry
      setStep('review-skills');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFinalSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const editSkill = (index: number, newValue: string) => {
    if (newValue.trim()) {
      setFinalSkills(prev => 
        prev.map((skill, i) => i === index ? newValue.trim() : skill)
      );
    }
    setEditingSkill(null);
  };

  const removeSkill = (index: number) => {
    setFinalSkills(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomSkill = () => {
    if (newSkill.trim() && !finalSkills.includes(newSkill.trim())) {
      setFinalSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
      toast.success(`Added "${newSkill.trim()}" to skills list`);
    } else if (finalSkills.includes(newSkill.trim())) {
      toast.error('This skill is already in the list');
    }
  };

  const onSubmit = async (data: { matrixName: string; description?: string }) => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (finalSkills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const matrixData = {
        course_id: selectedCourse,
        matrix_name: data.matrixName,
        skills: finalSkills,
        description: data.description
      };

      console.log('Creating skill matrix with data:', matrixData);
      const response = await skillMatrixAPI.create(matrixData);
      
      onMatrixCreated?.(response.data);
      toast.success('Skill matrix created successfully!');
      
      // Reset form
      setStep('select-course');
      setSelectedCourse('');
      setSelectedCourseData(null);
      setSkillSuggestions([]);
      setFinalSkills([]);
      setValue('matrixName', '');
      setValue('description', '');
    } catch (error) {
      console.error('Error creating skill matrix:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create skill matrix: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Loading state for initial course load
  if (loading && courses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ucf-gold"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card
        title="Skill Matrix Creator"
        subtitle="Select a course and get AI-powered skill suggestions, then customize as needed"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Course Selection */}
          {step === 'select-course' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Step 1: Select Course
              </h3>
              
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {courses.map(course => (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.name}</h4>
                          <p className="text-sm text-gray-600">{course.code}</p>
                          {course.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                          )}
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h4>
                  <p className="text-gray-600 mb-4">
                    Make sure your Canvas instructor token is set up correctly.
                  </p>
                  <a
                    href="/settings"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-ucf-gold hover:bg-yellow-600"
                  >
                    Configure Canvas Token
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Get Skill Suggestions */}
          {step === 'get-suggestions' && selectedCourseData && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Step 2: Get Skill Suggestions
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Selected Course</h4>
                <p className="text-blue-800">{selectedCourseData.name}</p>
                <p className="text-sm text-blue-600">{selectedCourseData.code}</p>
                {selectedCourseData.description && (
                  <p className="text-xs text-blue-600 mt-2">{selectedCourseData.description}</p>
                )}
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Our AI will analyze "{selectedCourseData.name}" and suggest relevant skills 
                  that students should develop in this course.
                </p>
                
                {isInstructor ? (
                  <Button
                    type="button"
                    onClick={getSkillSuggestions}
                    loading={suggestionsLoading}
                    disabled={suggestionsLoading}
                    className="flex items-center"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {suggestionsLoading ? 'Getting Skill Suggestions...' : 'Get AI Skill Suggestions'}
                  </Button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        <strong>Instructor access required</strong> for AI skill suggestions.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSkillSuggestions([]);
                      setFinalSkills([]);
                      setStep('review-skills');
                    }}
                  >
                    Skip and Add Skills Manually
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review and Edit Skills */}
          {step === 'review-skills' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Edit2 className="w-5 h-5 mr-2 text-green-600" />
                Step 3: Review and Customize Skills
              </h3>

              {/* Matrix Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrix Name
                </label>
                <input
                  {...register('matrixName', { required: 'Matrix name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
                  placeholder="e.g., Web Development - Skills Matrix"
                />
                {errors.matrixName && (
                  <p className="text-red-600 text-sm mt-1">{errors.matrixName.message}</p>
                )}
              </div>

              {/* Matrix Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
                  placeholder="Describe what skills this matrix covers..."
                />
              </div>

              {/* AI Suggested Skills */}
              {skillSuggestions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    AI Suggested Skills ({skillSuggestions.length} skills)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {skillSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => toggleSkill(suggestion.skill)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          finalSkills.includes(suggestion.skill)
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{suggestion.skill}</span>
                          <CheckCircle className={`w-4 h-4 ${
                            finalSkills.includes(suggestion.skill)
                              ? 'text-green-600'
                              : 'text-gray-300'
                          }`} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${suggestion.relevance * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Relevance: {Math.round(suggestion.relevance * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No AI Suggestions Message */}
              {step === 'review-skills' && skillSuggestions.length === 0 && isInstructor && (
                <div className="mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">No AI Suggestions Available</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          The AI service didn't return any skill suggestions. This appears to be a backend issue. 
                          You can add skills manually using the input below.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Skills List */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Skills List ({finalSkills.length} skills)
                </h4>
                
                {finalSkills.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No skills added yet. Add skills below.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {finalSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        {editingSkill === index ? (
                          <input
                            type="text"
                            defaultValue={skill}
                            autoFocus
                            onBlur={(e) => editSkill(index, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                editSkill(index, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span 
                            className="flex-1 cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingSkill(index)}
                          >
                            {skill}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingSkill(index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit skill"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Skill */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add custom skill..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addCustomSkill}
                    disabled={!newSkill.trim()}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('get-suggestions')}
                >
                  Back
                </Button>
                
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || finalSkills.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Skill Matrix
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default SkillMatrixCreator;