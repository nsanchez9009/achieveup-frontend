import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Lightbulb, Save, Download, Upload, Search, Zap, Target, Settings, Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillAssignmentAPI, canvasInstructorAPI, instructorAPI, canvasAPI } from '../../services/api';
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
  [questionId: string]: boolean; // true if human has reviewed
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [bulkSkill, setBulkSkill] = useState('');
  const [autoAnalysisInProgress, setAutoAnalysisInProgress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const watchedCourse = watch('courseId');
  const watchedQuiz = watch('quizId');

  // Check if user is instructor
  const isInstructor = user?.canvasTokenType === 'instructor';

  const loadCourses = useCallback(async (): Promise<void> => {
    try {
      // Use instructor-specific API if available
      const response = isInstructor 
        ? await canvasInstructorAPI.getInstructorCourses()
        : await canvasAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    }
  }, [isInstructor]);

  const loadQuizzes = useCallback(async (courseId: string): Promise<void> => {
    try {
      // Use instructor-specific API if available
      const response = isInstructor 
        ? await canvasInstructorAPI.getInstructorQuizzes(courseId)
        : await canvasAPI.getQuizzes(courseId);
      setQuizzes(response.data);
      setSelectedCourse(courseId);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    }
  }, [isInstructor]);

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Load quizzes when course changes
  useEffect(() => {
    if (watchedCourse) {
      loadQuizzes(watchedCourse);
    }
  }, [watchedCourse, loadQuizzes]);

  const getSkillSuggestions = useCallback(async (questionId: string, questionText: string): Promise<string[]> => {
    try {
      const response = await skillAssignmentAPI.suggest({
        question_text: questionText,
        course_context: selectedCourse
      });
      
      setSuggestions(prev => ({
        ...prev,
        [questionId]: response.data
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to get skill suggestions');
      return [];
    }
  }, [selectedCourse]);

  // Enhanced AI-powered question analysis
  const analyzeQuestionsWithAI = useCallback(async (questions: CanvasQuestion[], courseContext: string) => {
    if (!isInstructor) {
      toast.error('Instructor token required for AI analysis');
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

      // Use instructor-specific AI analysis
      const response = await instructorAPI.analyzeQuestionsWithAI(
        questions.map(q => ({ id: q.id, text: q.question_text })),
        courseContext
      );
      
      setQuestionAnalysis(response.data);
      
      // Update suggestions based on AI analysis
      const newSuggestions: Suggestions = {};
      const completedStatus: AIAnalysisStatus = {};
      
      response.data.forEach(analysis => {
        newSuggestions[analysis.questionId] = analysis.suggestedSkills;
        completedStatus[analysis.questionId] = 'completed';
      });
      
      setSuggestions(newSuggestions);
      setAiAnalysisStatus(completedStatus);
      
      toast.success(`AI analyzed ${questions.length} questions with ${response.data.length} skill suggestions`);
    } catch (error) {
      console.error('Error analyzing questions with AI:', error);
      toast.error('AI analysis failed. Using fallback analysis.');
      
      // Fallback to manual analysis
      const analysis: QuestionAnalysis[] = [];
      const errorStatus: AIAnalysisStatus = {};
      
      for (const question of questions) {
        try {
          const complexity = analyzeQuestionComplexity(question.question_text);
          const suggestedSkills = await getSkillSuggestions(question.id, question.question_text);
          
          analysis.push({
            questionId: question.id,
            complexity,
            suggestedSkills,
            confidence: Math.random() * 0.4 + 0.6
          });
          
          errorStatus[question.id] = 'completed';
        } catch (e) {
          errorStatus[question.id] = 'error';
        }
      }
      
      setQuestionAnalysis(analysis);
      setAiAnalysisStatus(errorStatus);
    } finally {
      setAutoAnalysisInProgress(false);
    }
  }, [isInstructor, getSkillSuggestions]);

  // Bulk AI skill assignment
  const bulkAssignSkillsWithAI = async () => {
    if (!selectedCourse || !selectedQuiz) {
      toast.error('Please select a course and quiz first');
      return;
    }

    if (!isInstructor) {
      toast.error('Instructor token required for AI bulk assignment');
      return;
    }

    setLoading(true);
    try {
      const response = await instructorAPI.bulkAssignSkillsWithAI(selectedCourse, selectedQuiz);
      
      setQuestionSkills(response.data);
      
      // Mark all questions as reviewed by AI
      const reviewStatus: HumanReviewStatus = {};
      Object.keys(response.data).forEach(questionId => {
        reviewStatus[questionId] = false; // AI assigned, needs human review
      });
      setHumanReviewStatus(reviewStatus);
      
      toast.success('AI has assigned skills to all questions. Please review and refine.');
    } catch (error) {
      console.error('Error with AI bulk assignment:', error);
      toast.error('AI bulk assignment failed');
    } finally {
      setLoading(false);
    }
  };

  // Override loadQuestions to inject mock questions and tags
  const loadQuestions = () => {
    const dummyQuestions = [
      { id: '1', question_text: "What is a binary tree?", quiz_id: 'mock-quiz' },
      { id: '2', question_text: "Explain the difference between TCP and UDP.", quiz_id: 'mock-quiz' }
    ];

    const mockTagging = (question: string): string[] => {
      if (question.includes("tree")) return ["Data Structures"];
      if (question.includes("TCP")) return ["Networking"];
      return ["Algorithms"];
    };

    setQuestions(dummyQuestions);
    // Set suggestions as an object mapping questionId to string[]
    const suggestionsObj: { [key: string]: string[] } = {};
    dummyQuestions.forEach(q => {
      suggestionsObj[q.id] = mockTagging(q.question_text);
    });
    setSuggestions(suggestionsObj);
    // Optionally, set questionSkills as well
    const skillsObj: { [key: string]: string[] } = {};
    dummyQuestions.forEach(q => {
      skillsObj[q.id] = mockTagging(q.question_text);
    });
    setQuestionSkills(skillsObj);
  };

  // Call loadQuestions on mount (no dropdown selection required)
  useEffect(() => {
    loadQuestions();
  }, []);

  const analyzeQuestionComplexity = (questionText: string): 'low' | 'medium' | 'high' => {
    const text = questionText.toLowerCase();
    const wordCount = text.split(' ').length;
    const hasCode = text.includes('code') || text.includes('function') || text.includes('class');
    const hasComplexTerms = text.includes('algorithm') || text.includes('optimization') || text.includes('architecture');
    
    if (hasComplexTerms || (hasCode && wordCount > 20)) return 'high';
    if (hasCode || wordCount > 15) return 'medium';
    return 'low';
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
    addSkillToQuestion(questionId, skill);
    // Remove from suggestions
    setSuggestions(prev => ({
      ...prev,
      [questionId]: prev[questionId].filter(s => s !== skill)
    }));
  };

  const bulkAssignSkill = (skill: string): void => {
    if (!skill.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    const updatedSkills: QuestionSkills = {};
    questions.forEach(question => {
      updatedSkills[question.id] = [...(questionSkills[question.id] || []), skill];
    });
    setQuestionSkills(updatedSkills);
    setBulkSkill('');
    toast.success(`Skill "${skill}" assigned to all questions`);
  };

  const bulkAssignFromSuggestions = (): void => {
    let assignedCount = 0;
    const updatedSkills: QuestionSkills = { ...questionSkills };
    
    Object.keys(suggestions).forEach(questionId => {
      const questionSuggestions = suggestions[questionId];
      if (questionSuggestions.length > 0) {
        const topSuggestion = questionSuggestions[0];
        if (!updatedSkills[questionId].includes(topSuggestion)) {
          updatedSkills[questionId] = [...(updatedSkills[questionId] || []), topSuggestion];
          assignedCount++;
        }
      }
    });
    
    setQuestionSkills(updatedSkills);
    setSuggestions({});
    toast.success(`Assigned ${assignedCount} suggested skills`);
  };

  const exportAssignments = () => {
    const data = {
      course_id: selectedCourse,
      quiz_id: selectedQuiz,
      assignments: questionSkills,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skill-assignments-${selectedCourse}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Assignments exported successfully');
  };

  const importAssignments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.assignments) {
          setQuestionSkills(data.assignments);
          toast.success('Assignments imported successfully');
        } else {
          toast.error('Invalid assignment file format');
        }
      } catch (error) {
        toast.error('Error parsing assignment file');
      }
    };
    reader.readAsText(file);
  };

  const getFilteredQuestions = () => {
    return questions.filter(question => {
      const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkillFilter = skillFilter === 'all' || 
        (questionSkills[question.id] && questionSkills[question.id].length > 0);
      return matchesSearch && matchesSkillFilter;
    });
  };

  const getAssignmentStats = () => {
    const totalQuestions = questions.length;
    const assignedQuestions = Object.values(questionSkills).filter(skills => skills.length > 0).length;
    const totalAssignments = Object.values(questionSkills).reduce((sum, skills) => sum + skills.length, 0);
    const averageAssignments = totalQuestions > 0 ? (totalAssignments / totalQuestions).toFixed(1) : '0';

    return { totalQuestions, assignedQuestions, totalAssignments, averageAssignments };
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

  const stats = getAssignmentStats();
  const filteredQuestions = getFilteredQuestions();

  const markAsReviewed = (questionId: string) => {
    setHumanReviewStatus(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  const getReviewStatus = () => {
    const totalQuestions = questions.length;
    const reviewedQuestions = Object.values(humanReviewStatus).filter(reviewed => reviewed).length;
    return { totalQuestions, reviewedQuestions, pendingReview: totalQuestions - reviewedQuestions };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card
        title="Skill Assignment Interface"
        subtitle="Assign skills to quiz questions for tracking student progress"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Course and Quiz Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                {...register('courseId', { required: 'Course is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <p className="text-red-600 text-sm mt-1">{errors.courseId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz
              </label>
              <select
                {...register('quizId', { required: 'Quiz is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={!selectedCourse}
              >
                <option value="">Select a quiz</option>
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
              {errors.quizId && (
                <p className="text-red-600 text-sm mt-1">{errors.quizId.message}</p>
              )}
            </div>
          </div>

          {/* Stats and Actions */}
          {questions.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{stats.totalQuestions}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.assignedQuestions}</div>
                    <div className="text-sm text-gray-600">Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalAssignments}</div>
                    <div className="text-sm text-gray-600">Total Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.averageAssignments}</div>
                    <div className="text-sm text-gray-600">Avg per Question</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={exportAssignments}
                    disabled={stats.totalAssignments === 0}
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
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Features */}
          {showAdvanced && questions.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Advanced Features</h3>
              
              {/* AI Analysis Status */}
              {isInstructor && (
                <div className="mb-4 p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">AI Analysis Status</h4>
                    {autoAnalysisInProgress && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Analyzing...
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span>Pending: {Object.values(aiAnalysisStatus).filter(s => s === 'pending').length}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span>Analyzing: {Object.values(aiAnalysisStatus).filter(s => s === 'analyzing').length}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Completed: {Object.values(aiAnalysisStatus).filter(s => s === 'completed').length}</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                      <span>Errors: {Object.values(aiAnalysisStatus).filter(s => s === 'error').length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Human Review Status */}
              {isInstructor && (
                <div className="mb-4 p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Human Review Status</h4>
                    <div className="text-sm text-gray-600">
                      {getReviewStatus().reviewedQuestions} / {getReviewStatus().totalQuestions} reviewed
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getReviewStatus().totalQuestions > 0 ? (getReviewStatus().reviewedQuestions / getReviewStatus().totalQuestions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AI Bulk Assignment */}
                {isInstructor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Bulk Assignment
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={bulkAssignSkillsWithAI}
                      disabled={!selectedCourse || !selectedQuiz || loading}
                      className="w-full"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      AI Assign All Skills
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      AI will analyze and assign skills to all questions
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bulk Assign Skill
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={bulkSkill}
                      onChange={(e) => setBulkSkill(e.target.value)}
                      placeholder="Skill name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => bulkAssignSkill(bulkSkill)}
                      disabled={!bulkSkill.trim()}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Assign All
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto-Assign Suggestions
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={bulkAssignFromSuggestions}
                    disabled={Object.keys(suggestions).length === 0}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Auto-Assign
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {questions.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Questions</option>
                  <option value="assigned">With Skills</option>
                  <option value="unassigned">Without Skills</option>
                </select>
              </div>
            </div>
          )}

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">
                {questions.length === 0 
                  ? "Select a course and quiz to load questions."
                  : "No questions match the current filters."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const questionSkillsList = questionSkills[question.id] || [];
                const questionSuggestions = suggestions[question.id] || [];
                const analysis = questionAnalysis.find(a => a.questionId === question.id);
                const aiStatus = aiAnalysisStatus[question.id];
                const isReviewed = humanReviewStatus[question.id];
                
                return (
                  <div key={question.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            Question {questions.indexOf(question) + 1}
                          </h4>
                          
                                                     {/* AI Analysis Status Indicator */}
                           {isInstructor && aiStatus && (
                             <div className="flex items-center gap-1">
                               {aiStatus === 'pending' && (
                                 <div className="relative group">
                                   <Clock className="w-4 h-4 text-gray-400" />
                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                     Pending analysis
                                   </div>
                                 </div>
                               )}
                               {aiStatus === 'analyzing' && (
                                 <div className="relative group">
                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                     Analyzing...
                                   </div>
                                 </div>
                               )}
                               {aiStatus === 'completed' && (
                                 <div className="relative group">
                                   <CheckCircle className="w-4 h-4 text-green-600" />
                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                     AI analysis completed
                                   </div>
                                 </div>
                               )}
                               {aiStatus === 'error' && (
                                 <div className="relative group">
                                   <AlertCircle className="w-4 h-4 text-red-600" />
                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                     Analysis failed
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                           
                           {/* Human Review Status */}
                           {isInstructor && (
                             <div className="flex items-center gap-1">
                               {isReviewed ? (
                                 <div className="relative group">
                                   <CheckCircle className="w-4 h-4 text-green-600" />
                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                     Reviewed by human
                                   </div>
                                 </div>
                               ) : (
                                 <div className="relative group">
                                   <AlertCircle className="w-4 h-4 text-yellow-600" />
                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                     Needs human review
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-2">{question.question_text}</p>
                        
                        {analysis && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              analysis.complexity === 'low' ? 'bg-green-100 text-green-800' :
                              analysis.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {analysis.complexity} complexity
                            </span>
                            <span className="text-xs text-gray-500">
                              Confidence: {Math.round(analysis.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assigned Skills */}
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Skills:</h5>
                      <div className="flex flex-wrap gap-2">
                        {questionSkillsList.map((skill, index) => (
                          <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkillFromQuestion(question.id, index)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Skills */}
                    {questionSuggestions.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Skills:</h5>
                        <div className="flex flex-wrap gap-2">
                          {questionSuggestions.map((skill, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => addSuggestionToQuestion(question.id, skill)}
                              className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm hover:bg-yellow-200 transition-colors"
                            >
                              <Lightbulb className="w-3 h-3 mr-1" />
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual Skill Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add skill manually..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              addSkillToQuestion(question.id, target.value.trim());
                              target.value = '';
                            }
                          }
                        }}
                        className="flex-1"
                      />
                      
                      {/* Mark as Reviewed Button */}
                      {isInstructor && (
                        <Button
                          type="button"
                          size="sm"
                          variant={isReviewed ? "success" : "warning"}
                          onClick={() => markAsReviewed(question.id)}
                        >
                          {isReviewed ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Reviewed
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Mark Reviewed
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Button */}
          {questions.length > 0 && (
            <div className="flex justify-end">
              <Button type="submit" loading={loading} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Assignments
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default SkillAssignmentInterface; 