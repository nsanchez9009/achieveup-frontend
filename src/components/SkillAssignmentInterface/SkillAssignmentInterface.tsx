import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Lightbulb, Save, Zap, Target, Brain, CheckCircle, AlertCircle, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillAssignmentAPI, canvasAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface CanvasCourse {
  id: string;
  name: string;
  code: string;
}

interface CanvasQuiz {
  id: string;
  title: string;
  course_id: string;
}

interface CanvasQuestion {
  id: string;
  question_text: string;
  quiz_id: string;
  question_type?: string;
  points?: number;
}

interface QuestionSkills {
  [questionId: string]: string[];
}

interface Suggestions {
  [questionId: string]: string[];
}

interface QuestionAnalysis {
  questionId: string;
  complexity: 'low' | 'medium' | 'high';
  suggestedSkills: string[];
  confidence: number;
}

interface FormData {
  courseId: string;
  quizId: string;
}

interface AIAnalysisStatus {
  [questionId: string]: 'pending' | 'analyzing' | 'completed' | 'error';
}

interface HumanReviewStatus {
  [questionId: string]: boolean;
}

const SkillAssignmentInterface: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [quizzes, setQuizzes] = useState<CanvasQuiz[]>([]);
  const [questions, setQuestions] = useState<CanvasQuestion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [questionSkills, setQuestionSkills] = useState<QuestionSkills>({});
  const [suggestions, setSuggestions] = useState<Suggestions>({});
  const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([]);
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<AIAnalysisStatus>({});
  const [humanReviewStatus, setHumanReviewStatus] = useState<HumanReviewStatus>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [bulkSkill, setBulkSkill] = useState('');
  const [autoAnalysisInProgress, setAutoAnalysisInProgress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>();

  const watchedCourse = watch('courseId');
  const watchedQuiz = watch('quizId');

  const isInstructor = user?.canvasTokenType === 'instructor';

  // Backend AI analysis for all questions
  const analyzeQuestionsWithAI = useCallback(async (questions: CanvasQuestion[]) => {
    if (!isInstructor) {
      toast.error('Instructor access required for AI analysis');
      return;
    }

    // Detailed validation before making API call
    if (!selectedCourse) {
      toast.error('No course selected. Please select a course first.');
      return;
    }

    if (!selectedQuiz) {
      toast.error('No quiz selected. Please select a quiz first.');
      return;
    }

    if (!questions || questions.length === 0) {
      toast.error('No questions available for analysis. Please select a quiz with questions.');
      return;
    }

    // Log request details for debugging
    console.log('Starting AI analysis with:', {
      courseId: selectedCourse,
      quizId: selectedQuiz,
      questionsCount: questions.length,
      questionIds: questions.map(q => q.id)
    });

    setAutoAnalysisInProgress(true);
    
    try {
      // Set all questions to analyzing status
      const initialStatus: AIAnalysisStatus = {};
      questions.forEach(q => {
        initialStatus[q.id] = 'analyzing';
      });
      setAiAnalysisStatus(initialStatus);

      // Prepare and validate request data
      const requestData = {
        courseId: selectedCourse,
        quizId: selectedQuiz,
        questions: questions.map(q => ({ 
          id: q.id, 
          text: q.question_text || '',
          type: q.question_type || 'multiple_choice_question',
          points: q.points || 1
        }))
      };

      // Log the exact request being sent
      console.log('Sending AI analysis request:', requestData);

      // Validate request data structure
      if (!requestData.courseId) {
        throw new Error('Missing courseId in request');
      }
      if (!requestData.quizId) {
        throw new Error('Missing quizId in request');
      }
      if (!requestData.questions || requestData.questions.length === 0) {
        throw new Error('Missing or empty questions array in request');
      }

      // Call backend for AI analysis
      const response = await skillAssignmentAPI.analyzeQuestions(requestData);
      
      console.log('AI analysis response:', response.data);
      setQuestionAnalysis(response.data);
      
      // Update suggestions and status based on AI analysis
      const newSuggestions: Suggestions = {};
      const completedStatus: AIAnalysisStatus = {};
      
      if (Array.isArray(response.data)) {
        response.data.forEach(analysis => {
          newSuggestions[analysis.questionId] = analysis.suggestedSkills || [];
          completedStatus[analysis.questionId] = 'completed';
        });
      }
      
      setSuggestions(newSuggestions);
      setAiAnalysisStatus(completedStatus);
      
      // Debug information for user
      const totalSuggestions = Object.values(newSuggestions).reduce((acc, skills) => acc + skills.length, 0);
      if (totalSuggestions === 0) {
        toast.error(`⚠️ AI analysis completed but returned no skill suggestions. The backend processed ${questions.length} questions but didn't return any skill recommendations.`);
      } else {
        toast.success(`AI analyzed ${questions.length} questions and provided ${totalSuggestions} skill suggestions`);
      }
    } catch (error: any) {
      console.error('Error analyzing questions with AI:', error);
      
      // Detailed error handling based on status code
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Bad request format';
        toast.error(`AI analysis failed (400): ${errorMsg}. Check console for request details.`);
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
        toast.error(`AI analysis failed: ${error.message || 'Unknown error'}. Please try manual skill assignment.`);
      }
      
      // Set error status for all questions
      const errorStatus: AIAnalysisStatus = {};
      questions.forEach(q => {
        errorStatus[q.id] = 'error';
      });
      setAiAnalysisStatus(errorStatus);
    } finally {
      setAutoAnalysisInProgress(false);
    }
  }, [isInstructor, selectedCourse, selectedQuiz]);

  const loadCourses = useCallback(async (): Promise<void> => {
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

  const loadQuizzes = useCallback(async (courseId: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = isInstructor 
        ? await canvasAPI.getInstructorQuizzes(courseId)
        : await canvasAPI.getQuizzes(courseId);
      
      setQuizzes(response.data);
      setSelectedCourse(courseId);
      
      // Reset quiz selection when course changes
      setSelectedQuiz('');
      setQuestions([]);
      setValue('quizId', '');
      
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes. Please try again.');
      
      // Set empty arrays so UI doesn't break
      setQuizzes([]);
      setSelectedCourse(courseId);
      setSelectedQuiz('');
      setQuestions([]);
      setValue('quizId', '');
    } finally {
      setLoading(false);
    }
  }, [isInstructor, setValue]);

  const loadQuestions = useCallback(async (quizId: string): Promise<void> => {
    try {
      setLoading(true);
      const response = isInstructor 
        ? await canvasAPI.getInstructorQuestions(quizId)
        : await canvasAPI.getQuestions(quizId);
      
      setQuestions(response.data);
      setSelectedQuiz(quizId);
      
      // Initialize question skills and status
      const initialSkills: QuestionSkills = {};
      const initialStatus: AIAnalysisStatus = {};
      const initialReviewStatus: HumanReviewStatus = {};
      
      response.data.forEach((question: CanvasQuestion) => {
        initialSkills[question.id] = [];
        initialStatus[question.id] = 'pending';
        initialReviewStatus[question.id] = false;
      });
      
      setQuestionSkills(initialSkills);
      setAiAnalysisStatus(initialStatus);
      setHumanReviewStatus(initialReviewStatus);
      
      // Auto-analyze questions if instructor and questions exist
      if (isInstructor && response.data.length > 0) {
        analyzeQuestionsWithAI(response.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isInstructor, analyzeQuestionsWithAI]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (watchedCourse) {
      loadQuizzes(watchedCourse);
    }
  }, [watchedCourse, loadQuizzes]);

  useEffect(() => {
    if (watchedQuiz) {
      loadQuestions(watchedQuiz);
    }
  }, [watchedQuiz, loadQuestions]);

  const addSkillToQuestion = (questionId: string, skill: string): void => {
    setQuestionSkills(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), skill]
    }));
  };

  const removeSkillFromQuestion = (questionId: string, skillIndex: number): void => {
    setQuestionSkills(prev => ({
      ...prev,
      [questionId]: prev[questionId].filter((_, index) => index !== skillIndex)
    }));
  };

  const addSuggestionToQuestion = (questionId: string, skill: string): void => {
    if (!questionSkills[questionId]?.includes(skill)) {
      addSkillToQuestion(questionId, skill);
    }
  };

  const bulkAssignSkill = (skill: string): void => {
    if (!skill) return;
    
    const filteredQuestions = getFilteredQuestions();
    const updatedSkills = { ...questionSkills };
    
    filteredQuestions.forEach(question => {
      if (!updatedSkills[question.id]?.includes(skill)) {
        updatedSkills[question.id] = [...(updatedSkills[question.id] || []), skill];
      }
    });
    
    setQuestionSkills(updatedSkills);
    setBulkSkill('');
    toast.success(`Added "${skill}" to ${filteredQuestions.length} questions`);
  };

  const bulkAssignFromSuggestions = (): void => {
    const updatedSkills = { ...questionSkills };
    let assignedCount = 0;
    let questionsWithSuggestions = 0;
    
    // Process all questions (not just filtered ones) that have suggestions
    questions.forEach(question => {
      const questionSuggestions = suggestions[question.id] || [];
      if (questionSuggestions.length > 0) {
        questionsWithSuggestions++;
        questionSuggestions.forEach(skill => {
          if (!updatedSkills[question.id]?.includes(skill)) {
            updatedSkills[question.id] = [...(updatedSkills[question.id] || []), skill];
            assignedCount++;
          }
        });
      }
    });
    
    setQuestionSkills(updatedSkills);
    
    if (assignedCount > 0) {
      toast.success(`Assigned ${assignedCount} skills from AI suggestions to ${questionsWithSuggestions} questions`);
    } else {
      toast.error('No new skills to assign - all AI suggestions are already assigned');
    }
  };

  const getFilteredQuestions = () => {
    if (!Array.isArray(questions)) {
      return [];
    }
    
    return questions.filter(question => {
      const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSkillFilter = skillFilter === 'all' || 
                                 (skillFilter === 'assigned' && questionSkills[question.id]?.length > 0) ||
                                 (skillFilter === 'unassigned' && (!questionSkills[question.id] || questionSkills[question.id].length === 0));
      
      return matchesSearch && matchesSkillFilter;
    });
  };

  const getAssignmentStats = () => {
    const totalQuestions = questions.length;
    const assignedQuestions = Object.values(questionSkills).filter(skills => skills.length > 0).length;
    const totalSkills = Object.values(questionSkills).reduce((acc, skills) => acc + skills.length, 0);
    return { totalQuestions, assignedQuestions, unassignedQuestions: totalQuestions - assignedQuestions, totalSkills };
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    if (!selectedCourse || !selectedQuiz) {
      toast.error('Please select a course and quiz');
      return;
    }

    const hasSkills = Object.values(questionSkills).some(skills => skills.length > 0);
    if (!hasSkills) {
      toast.error('Please assign at least one skill to questions');
      return;
    }

    setLoading(true);
    try {
      const assignmentData = {
        course_id: selectedCourse,
        question_skills: questionSkills
      };

      await skillAssignmentAPI.assign(assignmentData);
      toast.success('Skills assigned successfully!');
    } catch (error) {
      console.error('Error assigning skills:', error);
      toast.error('Failed to assign skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = (questionId: string) => {
    setHumanReviewStatus(prev => ({
      ...prev,
      [questionId]: true
    }));
  };



  const stats = getAssignmentStats();
  const filteredQuestions = getFilteredQuestions();

  if (loading && courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ucf-gold"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card
        title="Skill Assignment Interface"
        subtitle="Assign skills to quiz questions using AI-powered analysis and zero-shot classification"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Course and Quiz Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  {...register('courseId', { required: 'Please select a course' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
                >
                  <option value="">Select a course</option>
                                  {Array.isArray(courses) && courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
                </select>
                {errors.courseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz
                </label>
                <select
                  {...register('quizId', { required: 'Please select a quiz' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
                  disabled={!selectedCourse || loading}
                >
                  <option value="">
                    {!selectedCourse ? 'Select a course first' : 
                     loading ? 'Loading quizzes...' : 
                     'Select a quiz'}
                  </option>
                  {Array.isArray(quizzes) && quizzes.map(quiz => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
                {errors.quizId && (
                  <p className="mt-1 text-sm text-red-600">{errors.quizId.message}</p>
                )}
              </div>
            </div>

            {/* No Course Selected */}
            {!selectedCourse && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course to Get Started</h3>
                <p className="text-gray-600">
                  Choose one of your courses above to view and assign skills to quiz questions.
                </p>
              </div>
            )}

            {/* No Quiz Selected */}
            {selectedCourse && !selectedQuiz && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Quiz</h3>
                <p className="text-gray-600">
                  Choose a quiz from the dropdown above to view its questions and assign skills.
                </p>
                {quizzes.length === 0 && selectedCourse && !loading && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">No Quizzes Found</h4>
                    <p className="text-sm text-blue-700">
                      This course doesn't have any quizzes yet. Create quizzes in Canvas to start assigning skills to questions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Questions Section */}
            {selectedCourse && selectedQuiz && questions.length > 0 && (
              <>
                {/* Stats and Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{stats.totalQuestions}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900">Total Questions</p>
                        <p className="text-xs text-blue-600">Available for assignment</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold">{stats.assignedQuestions}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-900">Assigned</p>
                        <p className="text-xs text-green-600">Have skills assigned</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">{stats.unassignedQuestions}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-900">Unassigned</p>
                        <p className="text-xs text-yellow-600">Need skill assignment</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold">{stats.totalSkills}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-900">Total Skills</p>
                        <p className="text-xs text-purple-600">Assigned across all questions</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Controls */}
                {isInstructor && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Brain className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">AI-Powered Analysis</h3>
                          <p className="text-sm text-gray-600">
                            Let AI analyze questions and suggest skills automatically
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          onClick={() => analyzeQuestionsWithAI(questions)}
                          loading={autoAnalysisInProgress}
                          disabled={questions.length === 0}
                          className="flex items-center"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Analyze Questions
                        </Button>
                        <Button
                          type="button"
                          onClick={bulkAssignFromSuggestions}
                          variant="secondary"
                          disabled={Object.values(suggestions).every(arr => arr.length === 0)}
                          className="flex items-center"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Bulk Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
                  >
                    <option value="all">All Questions</option>
                    <option value="assigned">Assigned Questions</option>
                    <option value="unassigned">Unassigned Questions</option>
                  </select>
                </div>

                {/* Bulk Operations */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter skill name for bulk assignment..."
                        value={bulkSkill}
                        onChange={(e) => setBulkSkill(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => bulkAssignSkill(bulkSkill)}
                        disabled={!bulkSkill}
                        variant="secondary"
                        size="sm"
                      >
                        Add to All
                      </Button>
                      <Button
                        type="button"
                        onClick={bulkAssignFromSuggestions}
                        disabled={Object.values(suggestions).every(arr => arr.length === 0)}
                        variant="secondary"
                        size="sm"
                      >
                        Use AI Suggestions
                      </Button>
                    </div>
                  </div>
                </div>

                              {/* Questions List */}
              <div className="space-y-6">
                {Array.isArray(filteredQuestions) && filteredQuestions.map((question) => {
                    const questionAnalysisData = questionAnalysis.find(a => a.questionId === question.id);
                    const questionSuggestions = suggestions[question.id] || [];
                    const assignedSkills = questionSkills[question.id] || [];
                    const analysisStatus = aiAnalysisStatus[question.id] || 'pending';
                    const isReviewed = humanReviewStatus[question.id] || false;

                    return (
                      <Card key={question.id} className="overflow-hidden">
                        <div className="p-6">
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-900">Question {question.id}</h3>
                                {analysisStatus === 'analyzing' && (
                                  <Clock className="w-4 h-4 text-blue-500 ml-2 animate-spin" />
                                )}
                                {analysisStatus === 'completed' && (
                                  <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                                )}
                                {analysisStatus === 'error' && (
                                  <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                                )}
                                {isReviewed && (
                                  <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Reviewed
                                  </div>
                                )}
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-gray-800 leading-relaxed">{question.question_text}</p>
                              </div>
                            </div>
                          </div>

                          {/* AI Analysis Results */}
                          {questionAnalysisData && (
                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                              <h4 className="text-sm font-medium text-blue-900 mb-2">AI Analysis</h4>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-blue-700">
                                  Complexity: <span className="font-medium">{questionAnalysisData.complexity}</span>
                                </span>
                                <span className="text-blue-700">
                                  Confidence: <span className="font-medium">{Math.round(questionAnalysisData.confidence * 100)}%</span>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* AI Suggestions */}
                          {questionSuggestions.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">AI Suggestions</h4>
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(questionSuggestions) && questionSuggestions.map((skill, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => addSuggestionToQuestion(question.id, skill)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                      assignedSkills.includes(skill)
                                        ? 'bg-green-100 text-green-800 cursor-default'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    }`}
                                    disabled={assignedSkills.includes(skill)}
                                  >
                                    <Lightbulb className="w-3 h-3 inline mr-1" />
                                    {skill}
                                    {assignedSkills.includes(skill) && (
                                      <CheckCircle className="w-3 h-3 inline ml-1" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No AI Suggestions Available */}
                          {analysisStatus === 'completed' && questionSuggestions.length === 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">AI Suggestions</h4>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-center">
                                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                                  <p className="text-sm text-yellow-800">
                                    <strong>No AI suggestions available.</strong> The AI analysis completed but didn't return any skill recommendations for this question. This appears to be a backend issue.
                                  </p>
                                </div>
                                <p className="text-xs text-yellow-700 mt-2">
                                  You can still assign skills manually using the input field below.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Assigned Skills */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Skills</h4>
                            {assignedSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(assignedSkills) && assignedSkills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                  >
                                    {skill}
                                    <button
                                      type="button"
                                      onClick={() => removeSkillFromQuestion(question.id, index)}
                                      className="ml-2 text-green-600 hover:text-green-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No skills assigned yet</p>
                            )}
                          </div>

                          {/* Manual Skill Assignment */}
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Add custom skill..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const target = e.target as HTMLInputElement;
                                  const skill = target.value.trim();
                                  if (skill && !assignedSkills.includes(skill)) {
                                    addSkillToQuestion(question.id, skill);
                                    target.value = '';
                                  }
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => markAsReviewed(question.id)}
                              variant={isReviewed ? "success" : "outline"}
                              size="sm"
                            >
                              {isReviewed ? 'Reviewed' : 'Mark Reviewed'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={stats.assignedQuestions === 0}
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Skill Assignments
                  </Button>
                </div>
              </>
            )}

            {/* No Questions State */}
            {selectedCourse && selectedQuiz && questions.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
                <p className="text-gray-600">
                  This quiz doesn't have any questions yet. Add questions in Canvas to assign skills.
                </p>
              </div>
            )}
          </form>
        </Card>
      </div>
    );
};

export default SkillAssignmentInterface; 