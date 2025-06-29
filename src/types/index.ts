// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  hasCanvasToken?: boolean;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  canvasApiToken?: string;
}

// Skill Matrix Types
export interface SkillMatrix {
  _id: string;
  course_id: string;
  matrix_name: string;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateSkillMatrixRequest {
  course_id: string;
  matrix_name: string;
  skills: string[];
}

export interface UpdateSkillMatrixRequest {
  skills: string[];
}

// Skill Assignment Types
export interface QuestionSkillAssignment {
  [questionId: string]: string[];
}

export interface SkillAssignmentRequest {
  course_id: string;
  question_skills: QuestionSkillAssignment;
}

export interface SkillSuggestionRequest {
  question_text: string;
  course_context?: string;
}

// Badge Types
export interface Badge {
  _id: string;
  student_id: string;
  course_id: string;
  skill: string;
  badge_type: 'skill_master' | 'consistent_learner' | 'quick_learner' | 'persistent';
  description: string;
  earned_at: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface GenerateBadgeRequest {
  student_id: string;
  course_id: string;
  skill_levels: {
    [skillName: string]: 'beginner' | 'intermediate' | 'advanced';
  };
}

// Progress Types
export interface SkillProgress {
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  total_questions: number;
  correct_answers: number;
}

export interface StudentProgress {
  student_id: string;
  course_id: string;
  skill_progress: {
    [skillName: string]: SkillProgress;
  };
  last_updated: string;
}

export interface UpdateProgressRequest {
  student_id: string;
  course_id: string;
  skill_updates: {
    [skillName: string]: {
      score: number;
      notes?: string;
    };
  };
}

// Analytics Types
export interface GraphData {
  timeSeriesData?: Array<{
    date: string;
    [skillName: string]: number | string;
  }>;
  performance?: PerformanceData[];
  distribution?: SkillDistributionData[];
  trends?: TrendData[];
  radar?: RadarData[];
  summary?: {
    totalStudents: number;
    averageScore: number;
    badgesEarned: number;
    skillsTracked: number;
  };
}

export interface CourseData {
  skill_matrices: SkillMatrix[];
  badges: Badge[];
  skill_progress: StudentProgress[];
}

export interface ImportCourseDataRequest {
  course_id: string;
  data: CourseData;
}

// Canvas Types
export interface CanvasCourse {
  id: string;
  name: string;
  code: string;
}

export interface CanvasQuiz {
  id: string;
  title: string;
  course_id: string;
}

export interface CanvasQuestion {
  id: string;
  question_text: string;
  quiz_id: string;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

export interface BadgeCardProps {
  badge: Badge;
  onViewDetails: (badge: Badge) => void;
  onShare: (badge: Badge) => void;
}

export interface BadgeDisplaySystemProps {
  studentId: string;
}

export interface ProgressDashboardProps {
  studentId: string;
  courseId: string;
}

export interface AnalyticsDashboardProps {
  courseId: string;
}

// Form Types
export interface SkillMatrixFormData {
  courseId: string;
  matrixName: string;
}

export interface SkillAssignmentFormData {
  courseId: string;
  quizId: string;
}

// Filter Types
export interface BadgeFilters {
  search: string;
  badgeType: string;
  level: string;
  dateRange: string;
}

export interface AnalyticsFilters {
  skillLevel: string;
  performanceRange: string;
  dateRange: string;
}

// Chart Data Types
export interface PerformanceData {
  studentId: string;
  averageScore: number;
  totalSkills: number;
  masteredSkills: number;
  needsImprovement: number;
}

export interface SkillDistributionData {
  skill: string;
  count: number;
  percentage: number;
}

export interface TrendData {
  skill: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
} 