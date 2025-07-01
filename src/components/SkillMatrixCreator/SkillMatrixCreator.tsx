import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Save, Download, Upload, Copy, Settings, Layers, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillMatrixAPI, canvasAPI } from '../../services/api';
import { SkillMatrix, CanvasCourse } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface SkillMatrixCreatorProps {
  courseId?: string;
  onMatrixCreated?: (matrix: SkillMatrix) => void;
}

interface Skill {
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  dependencies?: string[];
  category?: string;
  weight?: number;
}

interface MatrixTemplate {
  name: string;
  description: string;
  skills: Skill[];
}

const SkillMatrixCreator: React.FC<SkillMatrixCreatorProps> = ({ 
  courseId, 
  onMatrixCreated 
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    description: '',
    level: 'beginner',
    category: '',
    weight: 1
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<{ matrixName: string; description?: string }>();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await canvasAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  // Predefined matrix templates
  const matrixTemplates: MatrixTemplate[] = [
    {
      name: 'Web Development Fundamentals',
      description: 'Core skills for modern web development',
      skills: [
        { name: 'HTML', description: 'Markup language for web pages', level: 'beginner', category: 'Frontend', weight: 1 },
        { name: 'CSS', description: 'Styling and layout', level: 'beginner', category: 'Frontend', weight: 1 },
        { name: 'JavaScript', description: 'Programming language for web', level: 'intermediate', category: 'Frontend', weight: 2 },
        { name: 'React', description: 'Frontend framework', level: 'intermediate', category: 'Frontend', weight: 2 },
        { name: 'Node.js', description: 'Backend runtime', level: 'intermediate', category: 'Backend', weight: 2 },
        { name: 'TypeScript', description: 'Typed JavaScript', level: 'advanced', category: 'Frontend', weight: 3 }
      ]
    },
    {
      name: 'Data Science Essentials',
      description: 'Skills for data analysis and machine learning',
      skills: [
        { name: 'Python', description: 'Programming language', level: 'beginner', category: 'Programming', weight: 1 },
        { name: 'Pandas', description: 'Data manipulation', level: 'intermediate', category: 'Data Analysis', weight: 2 },
        { name: 'NumPy', description: 'Numerical computing', level: 'intermediate', category: 'Data Analysis', weight: 2 },
        { name: 'Matplotlib', description: 'Data visualization', level: 'intermediate', category: 'Visualization', weight: 2 },
        { name: 'Scikit-learn', description: 'Machine learning', level: 'advanced', category: 'ML', weight: 3 },
        { name: 'Deep Learning', description: 'Neural networks', level: 'advanced', category: 'ML', weight: 4 }
      ]
    },
    {
      name: 'Software Engineering',
      description: 'Professional software development skills',
      skills: [
        { name: 'Git', description: 'Version control', level: 'beginner', category: 'Tools', weight: 1 },
        { name: 'Testing', description: 'Unit and integration testing', level: 'intermediate', category: 'Quality', weight: 2 },
        { name: 'CI/CD', description: 'Continuous integration', level: 'intermediate', category: 'DevOps', weight: 2 },
        { name: 'System Design', description: 'Architecture patterns', level: 'advanced', category: 'Architecture', weight: 3 },
        { name: 'Performance Optimization', description: 'Code optimization', level: 'advanced', category: 'Quality', weight: 3 }
      ]
    }
  ];

  const addSkill = () => {
    if (!newSkill.name?.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    if (skills.some(skill => skill.name.toLowerCase() === newSkill.name?.toLowerCase())) {
      toast.error('Skill already exists');
      return;
    }

    setSkills(prev => [...prev, {
      name: newSkill.name!,
      description: newSkill.description || '',
      level: newSkill.level || 'beginner',
      category: newSkill.category || 'General',
      weight: newSkill.weight || 1,
      dependencies: newSkill.dependencies || []
    }]);

    setNewSkill({
      name: '',
      description: '',
      level: 'beginner',
      category: '',
      weight: 1
    });

    toast.success('Skill added successfully');
  };

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
    toast.success('Skill removed');
  };

  const loadTemplate = (template: MatrixTemplate) => {
    setSkills(template.skills);
    setShowTemplates(false);
    toast.success(`Loaded ${template.name} template`);
  };

  const exportMatrix = () => {
    const matrixData = {
      name: 'Skill Matrix',
      skills: skills,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(matrixData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skill-matrix-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Matrix exported successfully');
  };

  const importMatrix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.skills && Array.isArray(data.skills)) {
          setSkills(data.skills);
          toast.success('Matrix imported successfully');
        } else {
          toast.error('Invalid matrix file format');
        }
      } catch (error) {
        toast.error('Error parsing matrix file');
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = async (data: { matrixName: string; description?: string }) => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const response = await skillMatrixAPI.create({
        course_id: selectedCourse,
        matrix_name: data.matrixName,
        skills: skills.map(skill => skill.name)
      });

      toast.success('Skill matrix created successfully!');
      onMatrixCreated?.(response.data);
      reset();
      setSkills([]);
    } catch (error) {
      console.error('Error creating skill matrix:', error);
      toast.error('Failed to create skill matrix');
    } finally {
      setLoading(false);
    }
  };

  const getSkillCategories = () => {
    const categories = skills.map(skill => skill.category).filter(Boolean);
    return ['All', ...Array.from(new Set(categories))];
  };

  const getSkillsByCategory = (category: string) => {
    if (category === 'All') return skills;
    return skills.filter(skill => skill.category === category);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card
        title="Skill Matrix Creator"
        subtitle="Create comprehensive skill matrices for course assessment"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Matrix Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matrix Name
              </label>
              <Input
                {...register('matrixName', { required: 'Matrix name is required' })}
                placeholder="e.g., Web Development Skills"
                error={errors.matrixName?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <Input
                {...register('description')}
                placeholder="Brief description of the skill matrix"
              />
            </div>
          </div>

          {/* Template and Import/Export */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Layers className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportMatrix}
              disabled={skills.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importMatrix}
                className="hidden"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Templates Modal */}
          {showTemplates && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Choose a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matrixTemplates.map((template, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border cursor-pointer hover:border-primary-300 transition-colors"
                    onClick={() => loadTemplate(template)}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-xs text-gray-500">
                      {template.skills.length} skills • {template.skills.filter(s => s.level === 'advanced').length} advanced
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Skill */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Add New Skill</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name
                </label>
                <Input
                  value={newSkill.name || ''}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., JavaScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Input
                  value={newSkill.category}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Frontend"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addSkill} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </div>
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    value={newSkill.description}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Skill description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={newSkill.weight?.toString() || ''}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, weight: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="1-5"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Skills List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Skills ({skills.length})</h3>
              {skills.length > 0 && (
                <div className="text-sm text-gray-500">
                  {skills.filter(s => s.level === 'beginner').length} beginner • 
                  {skills.filter(s => s.level === 'intermediate').length} intermediate • 
                  {skills.filter(s => s.level === 'advanced').length} advanced
                </div>
              )}
            </div>

            {skills.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No skills added yet. Add skills or load a template to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getSkillCategories().map(category => {
                  const categorySkills = getSkillsByCategory(category);
                  if (categorySkills.length === 0) return null;
                  
                  return (
                    <div key={category} className="bg-white border rounded-lg">
                      <div className="px-4 py-2 bg-gray-50 border-b">
                        <h4 className="font-medium text-gray-700">{category}</h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categorySkills.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{skill.name}</div>
                                <div className="text-sm text-gray-600">{skill.description}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    skill.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                    skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {skill.level}
                                  </span>
                                  {skill.weight && skill.weight > 1 && (
                                    <span className="text-xs text-gray-500">Weight: {skill.weight}</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSkill(skills.indexOf(skill))}
                                className="ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              disabled={!selectedCourse || skills.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Create Skill Matrix
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SkillMatrixCreator;