import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, Save, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillMatrixAPI } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface SkillMatrix {
  _id: string;
  course_id: string;
  matrix_name: string;
  skills: string[];
  created_at: string;
  updated_at: string;
}

interface FormData {
  courseId: string;
  matrixName: string;
}

const SkillMatrixCreator: React.FC = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingMatrix, setEditingMatrix] = useState<SkillMatrix | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const addSkill = (): void => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number): void => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const matrixData = {
        course_id: data.courseId,
        matrix_name: data.matrixName,
        skills: skills,
      };

      if (editingMatrix) {
        await skillMatrixAPI.update(editingMatrix._id, { skills });
        toast.success('Skill matrix updated successfully!');
      } else {
        await skillMatrixAPI.create(matrixData);
        toast.success('Skill matrix created successfully!');
      }

      reset();
      setSkills([]);
      setEditingMatrix(null);
    } catch (error) {
      console.error('Error saving skill matrix:', error);
      toast.error('Failed to save skill matrix. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card
        title={editingMatrix ? 'Edit Skill Matrix' : 'Create Skill Matrix'}
        subtitle="Define skills for your course to track student progress"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Course ID"
              {...register('courseId', { required: 'Course ID is required' })}
              error={errors.courseId?.message}
              placeholder="e.g., CS101"
            />
            <Input
              label="Matrix Name"
              {...register('matrixName', { required: 'Matrix name is required' })}
              error={errors.matrixName?.message}
              placeholder="e.g., Programming Fundamentals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a skill (e.g., JavaScript, React, API Design)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addSkill}
                disabled={!newSkill.trim()}
                className="px-4"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Added Skills ({skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={loading}
              disabled={skills.length === 0}
            >
              {editingMatrix ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Matrix
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Matrix
                </>
              )}
            </Button>
            {editingMatrix && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingMatrix(null);
                  reset();
                  setSkills([]);
                }}
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Preview Section */}
      {skills.length > 0 && (
        <Card
          title="Matrix Preview"
          subtitle="Preview of your skill matrix"
          className="mt-6"
        >
          <div className="space-y-4">
            <div>
              <strong>Course ID:</strong> {editingMatrix?.course_id || 'N/A'}
            </div>
            <div>
              <strong>Matrix Name:</strong> {editingMatrix?.matrix_name || 'N/A'}
            </div>
            <div>
              <strong>Skills ({skills.length}):</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {skills.map((skill, index) => (
                  <li key={index} className="text-gray-700">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SkillMatrixCreator; 