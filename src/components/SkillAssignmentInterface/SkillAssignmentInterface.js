import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Lightbulb, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillAssignmentAPI, canvasAPI } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

const SkillAssignmentInterface = () => {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [questionSkills, setQuestionSkills] = useState({});
  const [suggestions, setSuggestions] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

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

  const loadCourses = async () => {
    try {
      const response = await canvasAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const loadQuizzes = async (courseId) => {
    try {
      const response = await canvasAPI.getQuizzes(courseId);
      setQuizzes(response.data);
      setSelectedCourse(courseId);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    }
  };

  const loadQuestions = async (quizId) => {
    try {
      const response = await canvasAPI.getQuestions(quizId);
      setQuestions(response.data);
      setSelectedQuiz(quizId);
      
      // Initialize question skills
      const initialSkills = {};
      response.data.forEach(question => {
        initialSkills[question.id] = [];
      });
      setQuestionSkills(initialSkills);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const getSkillSuggestions = async (questionId, questionText) => {
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

  const addSkillToQuestion = (questionId, skill) => {
    setQuestionSkills(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), skill]
    }));
  };

  const removeSkillFromQuestion = (questionId, skillIndex) => {
    setQuestionSkills(prev => ({
      ...prev,
      [questionId]: prev[questionId].filter((_, index) => index !== skillIndex)
    }));
  };

  const addSuggestionToQuestion = (questionId, skill) => {
    addSkillToQuestion(questionId, skill);
    // Remove from suggestions
    setSuggestions(prev => ({
      ...prev,
      [questionId]: prev[questionId].filter(s => s !== skill)
    }));
  };

  const onSubmit = async (data) => {
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

  const bulkAssignSkill = (skill) => {
    const updatedSkills = {};
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

          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => bulkAssignSkill('Problem Solving')}
                  >
                    Bulk Assign: Problem Solving
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => bulkAssignSkill('Critical Thinking')}
                  >
                    Bulk Assign: Critical Thinking
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Question {index + 1}
                          </h4>
                          <p className="text-gray-700 mt-1">{question.question_text}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => getSkillSuggestions(question.id, question.question_text)}
                          disabled={suggestionsLoading}
                        >
                          <Lightbulb className="w-4 h-4 mr-1" />
                          Get Suggestions
                        </Button>
                      </div>

                      {/* Skill Suggestions */}
                      {suggestions[question.id] && suggestions[question.id].length > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">
                            AI Suggestions:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {suggestions[question.id].map((skill, skillIndex) => (
                              <button
                                key={skillIndex}
                                type="button"
                                onClick={() => addSuggestionToQuestion(question.id, skill)}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                              >
                                + {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assigned Skills */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assigned Skills
                        </label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add a skill"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const skill = e.target.value.trim();
                                if (skill) {
                                  addSkillToQuestion(question.id, skill);
                                  e.target.value = '';
                                }
                              }
                            }}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(questionSkills[question.id] || []).map((skill, skillIndex) => (
                            <div
                              key={skillIndex}
                              className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => removeSkillFromQuestion(question.id, skillIndex)}
                                className="ml-2 hover:text-primary-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={loading}
              disabled={questions.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Assignments
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setQuestionSkills({});
                setSuggestions({});
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SkillAssignmentInterface; 