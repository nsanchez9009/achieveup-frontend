import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lightbulb, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillAssignmentAPI, canvasAPI } from '../../services/api';
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
}

interface QuestionSkills {
  [questionId: string]: string[];
}

interface Suggestions {
  [questionId: string]: string[];
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
  const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(false);
  const [questionSkills, setQuestionSkills] = useState<QuestionSkills>({});
  const [suggestions, setSuggestions] = useState<Suggestions>({});

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
  useEffect(() => {
    if (watchedQuiz) {
      loadQuestions(watchedQuiz);
    }
  }, [watchedQuiz]);

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

  const loadQuestions = async (quizId: string): Promise<void> => {
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
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const getSkillSuggestions = async (questionId: string, questionText: string): Promise<void> => {
    setSuggestionsLoading(true);
    try {
      const response = await skillAssignmentAPI.suggest({
        question_text: questionText,
        course_context: selectedCourse
      });
      
      setSuggestions(prev => ({
        ...prev,
        [questionId]: response.data
      }));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to get skill suggestions');
    } finally {
      setSuggestionsLoading(false);
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

  const bulkAssignSkill = (skill: string): void => {
    const updatedSkills: QuestionSkills = {};
    questions.forEach(question => {
      updatedSkills[question.id] = [...(questionSkills[question.id] || []), skill];
    });
    setQuestionSkills(updatedSkills);
    toast.success(`Skill "${skill}" assigned to all questions`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card
        title="Skill Assignment Interface"
        subtitle="Assign skills to quiz questions for tracking student progress"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Questions and Skill Assignment */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Questions ({questions.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => bulkAssignSkill('JavaScript')}
                    className="text-sm"
                  >
                    Bulk Assign: JavaScript
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => bulkAssignSkill('React')}
                    className="text-sm"
                  >
                    Bulk Assign: React
                  </Button>
                </div>
              </div>

              {questions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Question {index + 1}
                        </h4>
                        <p className="text-gray-700">{question.question_text}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => getSkillSuggestions(question.id, question.question_text)}
                        disabled={suggestionsLoading}
                        className="ml-4"
                      >
                        <Lightbulb className="w-4 h-4 mr-1" />
                        {suggestionsLoading ? 'Loading...' : 'Suggest Skills'}
                      </Button>
                    </div>

                    {/* Assigned Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Skills
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(questionSkills[question.id] || []).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkillFromQuestion(question.id, skillIndex)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a skill..."
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
                      />
                    </div>

                    {/* Skill Suggestions */}
                    {suggestions[question.id] && suggestions[question.id].length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suggested Skills
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {suggestions[question.id].map((skill, skillIndex) => (
                            <button
                              key={skillIndex}
                              type="button"
                              onClick={() => addSuggestionToQuestion(question.id, skill)}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || questions.length === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Assign Skills
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SkillAssignmentInterface; 