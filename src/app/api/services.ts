import { authService } from './auth';
import api from './axios';
import { User, Course, Lesson, ProgressData } from '../types';

// Users API
export const userService = {
    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },
    getProgress: async (courseId?: number): Promise<ProgressData[]> => {
        const response = await api.get('/progress', { params: { courseId } });
        return response.data;
    },
    completeLesson: async (lessonData: { lessonId: number, score?: number }): Promise<ProgressData> => {
        const response = await api.post<ProgressData>('/progress/complete-lesson', lessonData);
        return response.data;
    },
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },
    deleteUser: async (id: number): Promise<void> => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },
    create: async (userData: Omit<User, 'id'> & { password?: string }): Promise<User> => {
        const response = await api.post<User>('/users', userData);
        return response.data;
    }
};

// Courses API
export const courseService = {
    getAll: async (): Promise<Course[]> => {
        const response = await api.get<Course[]>('/courses');
        return response.data;
    },
    getById: async (id: number): Promise<Course> => {
        const response = await await api.get<Course>(`/courses/${id}`);
        return response.data;
    },
    create: async (courseData: Omit<Course, 'id'>): Promise<Course> => {
        const response = await api.post<Course>('/admin/courses', courseData);
        return response.data;
    },
    update: async (id: number, courseData: Partial<Course>): Promise<Course> => {
        const response = await api.put<Course>(`/admin/courses/${id}`, courseData);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        const response = await api.delete(`/admin/courses/${id}`);
        return response.data;
    },
    getTeacherCourses: async (): Promise<Course[]> => {
        const response = await api.get<Course[]>('/courses/teacher');
        return response.data;
    }
};

// Lessons API
export const lessonService = {
    getById: async (id: number): Promise<Lesson> => {
        const response = await api.get<Lesson>(`/lessons/${id}`);
        return response.data;
    },
    getByCourse: async (courseId: number): Promise<Lesson[]> => {
        const response = await api.get<Lesson[]>(`/lessons/course/${courseId}`);
        return response.data;
    },
    create: async (lessonData: Omit<Lesson, 'id'>): Promise<Lesson> => {
        const response = await api.post<Lesson>('/admin/lessons', lessonData);
        return response.data;
    },
    update: async (id: number, lessonData: Partial<Lesson>): Promise<Lesson> => {
        const response = await api.put<Lesson>(`/admin/lessons/${id}`, lessonData);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        const response = await api.delete(`/admin/lessons/${id}`);
        return response.data;
    }
};

// Classes API
export const classService = {
    getAll: async () => {
        const response = await api.get('/admin/classes');
        return response.data;
    },
    create: async (classData: any) => {
        const response = await api.post('/admin/classes', classData);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/admin/classes/${id}`);
        return response.data;
    }
};

// Materials API
export const materialService = {
    getAll: async () => {
        const response = await api.get('/admin/materials');
        return response.data;
    },
    create: async (materialData: any) => {
        const response = await api.post('/admin/materials', materialData);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/admin/materials/${id}`);
        return response.data;
    },
    // AI Question Generation Endpoints
    generateQuestions: async (materialId: number, count: number = 5) => {
        const response = await api.post(`/admin/materials/${materialId}/generate-questions`, { count });
        return response.data;
    },
    getQuestions: async (materialId: number) => {
        const response = await api.get(`/admin/materials/${materialId}/questions`);
        return response.data;
    },
    saveQuestions: async (materialId: number, questions: any[]) => {
        const response = await api.post(`/admin/materials/${materialId}/questions`, { questions });
        return response.data;
    }
};

// Files API
export const fileService = {
    upload: async (file: File, onProgress?: (percent: number) => void) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
        return response.data;
    }
};

// Lesson Questions API
export const lessonQuestionService = {
    getByLesson: async (lessonId: number) => {
        const response = await api.get(`/lesson-questions/lesson/${lessonId}`);
        return response.data;
    },
    create: async (data: { lessonId: number; questionText: string; optionsJson: string; correctAnswer: string; orderIndex: number }) => {
        const response = await api.post('/admin/lesson-questions', data);
        return response.data;
    },
    update: async (id: number, data: { questionText: string; optionsJson: string; correctAnswer: string; orderIndex: number }) => {
        const response = await api.put(`/admin/lesson-questions/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/admin/lesson-questions/${id}`);
    }
};
