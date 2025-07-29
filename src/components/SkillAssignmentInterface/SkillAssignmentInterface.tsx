import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Lightbulb, Save, Download, Upload, Zap, Target, Brain, CheckCircle, AlertCircle, Clock, BookOpen } from 'lucide-react';
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

    setAutoAnalysisInProgress(true);
    
    try {
      // Set all questions to analyzing status
      const initialStatus: AIAnalysisStatus = {};
      questions.forEach(q => {
        initialStatus[q.id] = 'analyzing';
      });
      setAiAnalysisStatus(initialStatus);

      // Call backend for AI analysis
      const response = await skillAssignmentAPI.analyzeQuestions({
        courseId: selectedCourse,
        quizId: selectedQuiz,
        questions: questions.map(q => ({ 
          id: q.id, 
          text: q.question_text,
          type: q.question_type,
          points: q.points
        }))
      });
      
      setQuestionAnalysis(response.data);
      
      // Update suggestions and status based on AI analysis
      const newSuggestions: Suggestions = {};
      const completedStatus: AIAnalysisStatus = {};
      
      response.data.forEach(analysis => {
        newSuggestions[analysis.questionId] = analysis.suggestedSkills;
        completedStatus[analysis.questionId] = 'completed';
      });
      
      setSuggestions(newSuggestions);
      setAiAnalysisStatus(completedStatus);
      
      toast.success(`AI analyzed ${questions.length} questions successfully`);
    } catch (error) {
      console.error('Error analyzing questions with AI:', error);
      toast.error('AI analysis failed. Please try manual skill assignment.');
      
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
      const errorMessage = (error as any)?.response?.status === 401 
        ? 'Authentication failed. Please check your Canvas instructor token in Settings.'
        : 'Failed to load quizzes. Please try again or contact support.';
      toast.error(errorMessage);
      
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
    try {
      if (watchedCourse) {
        loadQuizzes(watchedCourse);
      }
    } catch (error) {
      console.error('Error in watchedCourse useEffect:', error);
    }
  }, [watchedCourse, loadQuizzes]);

  useEffect(() => {
    try {
      if (watchedQuiz) {
        loadQuestions(watchedQuiz);
      }
    } catch (error) {
      console.error('Error in watchedQuiz useEffect:', error);
    }
  }, [watchedQuiz, loadQuestions]);

  // Bulk AI skill assignment
  const bulkAssignSkillsWithAI = async () => {
    if (!selectedCourse || !selectedQuiz) {
      toast.error('Please select a course and quiz first');
      return;
    }

    if (!isInstructor) {
      toast.error('Instructor access required for AI bulk assignment');
      return;
    }

    setLoading(true);
    
    try {
      const response = await skillAssignmentAPI.bulkAssignWithAI({
        courseId: selectedCourse,
        quizId: selectedQuiz
      });
      
      setQuestionSkills(response.data);
      toast.success('Skills assigned to all questions using AI');
    } catch (error) {
      console.error('Error with AI bulk assignment:', error);
      toast.error('AI bulk assignment failed. Please assign skills manually.');
    } finally {
      setLoading(false);
    }
  };

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
    const filteredQuestions = getFilteredQuestions();
    const updatedSkills = { ...questionSkills };
    let assignedCount = 0;
    
    filteredQuestions.forEach(question => {
      const questionSuggestions = suggestions[question.id] || [];
      questionSuggestions.forEach(skill => {
        if (!updatedSkills[question.id]?.includes(skill)) {
          updatedSkills[question.id] = [...(updatedSkills[question.id] || []), skill];
          assignedCount++;
        }
      });
    });
    
    setQuestionSkills(updatedSkills);
    toast.success(`Assigned ${assignedCount} skills from AI suggestions`);
  };

  const exportAssignments = () => {
    const exportData = {
      courseId: selectedCourse,
      quizId: selectedQuiz,
      assignments: questionSkills,
      metadata: {
        exportedAt: new Date().toISOString(),
        questionCount: questions.length,
        totalSkills: Object.values(questionSkills).reduce((acc, skills) => acc + skills.length, 0)
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-assignments-${selectedCourse}-${selectedQuiz}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAssignments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        setQuestionSkills(importData.assignments || {});
        toast.success('Skill assignments imported successfully');
      } catch (error) {
        toast.error('Failed to import assignments. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const getFilteredQuestions = () => {
    try {
      if (!Array.isArray(questions)) {
        console.warn('questions is not an array:', questions);
        return [];
      }
      
      return questions.filter(question => {
        if (!question || typeof question.question_text !== 'string' || typeof question.id !== 'string') {
          console.warn('Invalid question object:', question);
          return false;
        }
        
        const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             question.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSkillFilter = skillFilter === 'all' || 
                                   (skillFilter === 'assigned' && questionSkills[question.id]?.length > 0) ||
                                   (skillFilter === 'unassigned' && (!questionSkills[question.id] || questionSkills[question.id].length === 0));
        
        return matchesSearch && matchesSkillFilter;
      });
    } catch (error) {
      console.error('Error in getFilteredQuestions:', error);
      return [];
    }
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

  // Add error boundary protection
  try {
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
                  disabled={!selectedCourse}
                >
                  <option value="">
                    {selectedCourse ? 'Select a quiz' : 'Select a course first'}
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
                {quizzes.length === 0 && selectedCourse && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">No Quizzes Available</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      This could be due to:
                    </p>
                    <ul className="text-sm text-yellow-700 text-left space-y-1">
                      <li>• No quizzes created in this Canvas course yet</li>
                      <li>• Canvas authentication issues</li>
                      <li>• Backend API connectivity problems</li>
                    </ul>
                    <div className="mt-4">
                      <a
                        href="/settings"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
                      >
                        Check Canvas Settings
                      </a>
                    </div>
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
                          onClick={bulkAssignSkillsWithAI}
                          variant="secondary"
                          disabled={questions.length === 0}
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
                        disabled={Object.keys(suggestions).length === 0}
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

                {/* Export/Import Controls */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      onClick={exportAssignments}
                      variant="outline"
                      className="flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importAssignments}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center pointer-events-none"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </label>
                  </div>

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
  } catch (error) {
    console.error('Error rendering SkillAssignmentInterface:', error);
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card
          title="Error"
          subtitle="An unexpected error occurred while loading the skill assignment interface."
        >
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <p className="text-gray-600">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </Card>
      </div>
    );
  }
};

export default SkillAssignmentInterface; 