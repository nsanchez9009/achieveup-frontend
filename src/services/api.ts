import axios, { AxiosResponse } from 'axios';
import {
  SkillMatrix,
  CreateSkillMatrixRequest,
  UpdateSkillMatrixRequest,
  SkillAssignmentRequest,
  SkillSuggestionRequest,
  Badge,
  GenerateBadgeRequest,
  StudentProgress,
  UpdateProgressRequest,
  GraphData,
  CourseData,
  ImportCourseDataRequest,
  CanvasCourse,
  CanvasQuiz,
  CanvasQuestion
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Skill Matrix Management
export const skillMatrixAPI = {
  create: (data: CreateSkillMatrixRequest): Promise<AxiosResponse<SkillMatrix>> => 
    api.post('/achieveup/matrix/create', data),
  get: (matrixId: string): Promise<AxiosResponse<SkillMatrix>> => 
    api.get(`/achieveup/matrix/${matrixId}`),
  update: (matrixId: string, data: UpdateSkillMatrixRequest): Promise<AxiosResponse<SkillMatrix>> => 
    api.put(`/achieveup/matrix/${matrixId}`, data),
};

// Skill Assignment
export const skillAssignmentAPI = {
  assign: (data: SkillAssignmentRequest): Promise<AxiosResponse<void>> => 
    api.post('/achieveup/skills/assign', data),
  suggest: (data: SkillSuggestionRequest): Promise<AxiosResponse<string[]>> => 
    api.post('/achieveup/skills/suggest', data),
};

// Badge Management
export const badgeAPI = {
  generate: (data: GenerateBadgeRequest): Promise<AxiosResponse<Badge[]>> => 
    api.post('/achieveup/badges/generate', data),
  getStudentBadges: (studentId: string): Promise<AxiosResponse<Badge[]>> => 
    api.get(`/achieveup/badges/${studentId}`),
};

// Progress Tracking
export const progressAPI = {
  getSkillProgress: (studentId: string, courseId: string): Promise<AxiosResponse<StudentProgress>> => 
    api.get(`/achieveup/progress/${studentId}/${courseId}`),
  updateSkillProgress: (data: UpdateProgressRequest): Promise<AxiosResponse<void>> => 
    api.post('/achieveup/progress/update', data),
};

// Analytics and Visualization
export const analyticsAPI = {
  getIndividualGraphs: (studentId: string): Promise<AxiosResponse<GraphData>> => 
    api.get(`/achieveup/graphs/individual/${studentId}`),
  exportCourseData: (courseId: string): Promise<AxiosResponse<CourseData>> => 
    api.get(`/achieveup/export/${courseId}`),
  importCourseData: (data: ImportCourseDataRequest): Promise<AxiosResponse<void>> => 
    api.post('/achieveup/import', data),
};

// Canvas Integration
export const canvasAPI = {
  getCourses: (): Promise<AxiosResponse<CanvasCourse[]>> => 
    api.get('/canvas/courses'),
  getQuizzes: (courseId: string): Promise<AxiosResponse<CanvasQuiz[]>> => 
    api.get(`/canvas/courses/${courseId}/quizzes`),
  getQuestions: (quizId: string): Promise<AxiosResponse<CanvasQuestion[]>> => 
    api.get(`/canvas/quizzes/${quizId}/questions`),
};

export default api; 