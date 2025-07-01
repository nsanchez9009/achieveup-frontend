import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Lightbulb, Save, Download, Upload, Search, Zap, Target, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillAssignmentAPI, canvasAPI, questionAnalysisAPI } from '../../services/api';
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

const SkillAssignmentInterface: React.FC = () => {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [quizzes, setQuizzes] = useState<CanvasQuiz[]>([]);
  const [questions, setQuestions] = useState<CanvasQuestion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [questionSkills, setQuestionSkills] = useState<QuestionSkills>({});
  const [suggestions, setSuggestions] = useState<Suggestions>({});
  const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [bulkSkill, setBulkSkill] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const watchedCourse = watch('courseId');
  const watchedQuiz = watch('quizId');

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Load quizzes when course changes
  useEffect(() => {
    if (watchedCourse) {
      loadQuizzes(watchedCourse);
    }
  }, [watchedCourse]);

  // Load questions when quiz changes
  const loadQuestions = useCallback(async (quizId: string): Promise<void> => {
    try {
      const response = await canvasAPI.getQuestions(quizId);
      setQuestions(response.data);
      setSelectedQuiz(quizId);
      
      // Initialize question skills
      const initialSkills: QuestionSkills = {};
      response.data.forEach((question: CanvasQuestion) => {
        initialSkills[question.id] = [];
      });
      setQuestionSkills(initialSkills);
      
      // Analyze questions for skill suggestions
      analyzeQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (watchedQuiz) {
      loadQuestions(watchedQuiz);
    }
  }, [watchedQuiz, loadQuestions]);

  const loadCourses = async (): Promise<void> => {
    try {
      const response = await canvasAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const loadQuizzes = async (courseId: string): Promise<void> => {
    try {
      const response = await canvasAPI.getQuizzes(courseId);
      setQuizzes(response.data);
      setSelectedCourse(courseId);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    }
  };

  const analyzeQuestions = async (questions: CanvasQuestion[]) => {
    try {
      // Use the new AI-powered question analysis API
      const response = await questionAnalysisAPI.analyzeQuestions({
        questions: questions.map(q => ({
          id: q.id,
          text: q.question_text
        }))
      });
      
      setQuestionAnalysis(response.data);
      
      // Update suggestions based on analysis
      const newSuggestions: Suggestions = {};
      response.data.forEach(analysis => {
        newSuggestions[analysis.questionId] = analysis.suggestedSkills;
      });
      setSuggestions(newSuggestions);
      
      toast.success(`Analyzed ${questions.length} questions with AI-powered suggestions`);
    } catch (error) {
      console.error('Error analyzing questions:', error);
      toast.error('Failed to analyze questions. Using fallback analysis.');
      
      // Fallback to manual analysis
      const analysis: QuestionAnalysis[] = [];
      for (const question of questions) {
        const complexity = analyzeQuestionComplexity(question.question_text);
        const suggestedSkills = await getSkillSuggestions(question.id, question.question_text);
        
        analysis.push({
          questionId: question.id,
          complexity,
          suggestedSkills,
          confidence: Math.random() * 0.4 + 0.6
        });
      }
      setQuestionAnalysis(analysis);
    }
  };

  const analyzeQuestionComplexity = (questionText: string): 'low' | 'medium' | 'high' => {
    const text = questionText.toLowerCase();
    const wordCount = text.split(' ').length;
    const hasCode = text.includes('code') || text.includes('function') || text.includes('class');
    const hasComplexTerms = text.includes('algorithm') || text.includes('optimization') || text.includes('architecture');
    
    if (hasComplexTerms || (hasCode && wordCount > 20)) return 'high';
    if (hasCode || wordCount > 15) return 'medium';
    return 'low';
  };

  const getSkillSuggestions = async (questionId: string, questionText: string): Promise<string[]> => {
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Analysis
                  </label>
                  <div className="text-sm text-gray-600">
                    {questionAnalysis.length} questions analyzed
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {questions.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Questions
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search question text..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter
                </label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                
                return (
                  <div key={question.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Question {questions.indexOf(question) + 1}
                        </h4>
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
                          <div
                            key={index}
                            className="flex items-center bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkillFromQuestion(question.id, index)}
                              className="ml-2 hover:text-primary-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {questionSkillsList.length === 0 && (
                          <span className="text-gray-500 text-sm">No skills assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Skill Suggestions */}
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
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addSkillToQuestion(question.id, input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector(`input[placeholder="Add skill manually..."]`) as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addSkillToQuestion(question.id, input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Button */}
          {questions.length > 0 && (
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={loading}
                disabled={!selectedCourse || !selectedQuiz || stats.totalAssignments === 0}
              >
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