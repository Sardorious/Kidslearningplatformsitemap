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
    completeLesson: async (lessonData: { lessonId: number, score?: number, timeSpentSeconds?: number }): Promise<any> => {
        const response = await api.post('/progress/complete-lesson', lessonData);
        return response.data;
    },
    getCourseProgressSummary: async (courseId: number): Promise<any> => {
        const response = await api.get(`/progress/course/${courseId}/summary`);
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
    },
    getLeaderboard: async (): Promise<any[]> => {
        const response = await api.get('/leaderboard');
        return response.data;
    },
    getMyBadges: async (): Promise<any[]> => {
        const response = await api.get('/users/my-badges');
        return response.data;
    },
    getChildProgress: async (childId: number): Promise<any> => {
        const response = await api.get(`/users/${childId}/progress`);
        return response.data;
    },
    getMyChildren: async (): Promise<any[]> => {
        const response = await api.get('/users/my-children');
        return response.data;
    },
};

// Courses API
export const courseService = {
    getAll: async (search?: string, category?: string): Promise<Course[]> => {
        const response = await api.get<Course[]>('/courses', { params: { search, category } });
        return response.data;
    },
    getById: async (id: number): Promise<Course> => {
        const response = await api.get<Course>(`/courses/${id}`);
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
    },
    enroll: async (courseId: number): Promise<any> => {
        const response = await api.post(`/courses/${courseId}/enroll`);
        return response.data;
    },
    getMyEnrollments: async (): Promise<any[]> => {
        const response = await api.get('/users/my-enrollments');
        return response.data;
    },
    getEnrolledStudents: async (courseId: number): Promise<any[]> => {
        const response = await api.get(`/admin/courses/${courseId}/students`);
        return response.data;
    },
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
    },
    getStudents: async (classId: number) => {
        const response = await api.get(`/admin/classes/${classId}/students`);
        return response.data;
    },
    addStudent: async (classId: number, studentId: number) => {
        const response = await api.post(`/admin/classes/${classId}/students`, { studentId });
        return response.data;
    },
    removeStudent: async (classId: number, studentId: number) => {
        const response = await api.delete(`/admin/classes/${classId}/students/${studentId}`);
        return response.data;
    },
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
            headers: { 'Content-Type': 'multipart/form-data' },
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
    create: async (data: { lessonId: number; questionText: string; optionsJson: string; correctAnswer: string; orderIndex: number; questionType?: string }) => {
        const response = await api.post('/admin/lesson-questions', data);
        return response.data;
    },
    update: async (id: number, data: { questionText: string; optionsJson: string; correctAnswer: string; orderIndex: number; questionType?: string }) => {
        const response = await api.put(`/admin/lesson-questions/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/admin/lesson-questions/${id}`);
    }
};

// Announcements API
export const announcementService = {
    getMy: async (): Promise<any[]> => {
        const response = await api.get('/notifications/my');
        return response.data;
    },
    getAll: async (): Promise<any[]> => {
        const response = await api.get('/admin/announcements');
        return response.data;
    },
    create: async (data: { title: string; body: string; targetRole: string }): Promise<any> => {
        const response = await api.post('/admin/announcements', data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/announcements/${id}`);
    },
};

// AI Service API
export const aiService = {
    tutorChatStream: async (message: string, subject: string, grade: string, onUpdate: (text: string) => void): Promise<string> => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5247/ai/tutor-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ message, subject, grade })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullReply = "";

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataText = line.substring(6);
                        if (dataText === '[DONE]') {
                            break;
                        } else {
                            // Backend replaced \n with \\n, so we revert it back here for display
                            const unescapedText = dataText.replace(/\\n/g, '\n');
                            fullReply += unescapedText;
                            onUpdate(fullReply);
                        }
                    }
                }
            }
        }
        return fullReply;
    },
    checkWriting: async (text: string, grade: string, imageFile?: File): Promise<{
        grammarScore: number; vocabularyScore: number; clarityScore: number;
        toneAnalysis: string; feedback: string; correctedText: string;
    }> => {
        const formData = new FormData();
        if (text) formData.append('text', text);
        formData.append('grade', grade);
        if (imageFile) formData.append('image', imageFile);

        const response = await api.post('/ai/check-writing', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    checkSpeaking: async (audioFile: File): Promise<{
        transcription: string; fluencyScore: number; grammarScore: number;
        pronunciationScore: number; feedback: string;
    }> => {
        const formData = new FormData();
        formData.append('audio', audioFile);
        const response = await api.post('/ai/check-speaking', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    generateLessonPlan: async (topic: string, ageGroup: number, level: string): Promise<{
        topic: string; ageGroup: number; objectives: string; warmUp: string;
        mainActivity: string; assessment: string; homework: string; teacherNotes: string;
    }> => {
        const response = await api.post('/ai/lesson-plan', { topic, ageGroup, level });
        return response.data;
    },
    getProgressReport: async (childId?: number): Promise<{
        summary: string; strengths: string; areasToImprove: string; recommendations: string;
    }> => {
        const url = childId ? `/ai/progress-report?childId=${childId}` : '/ai/progress-report';
        const response = await api.get(url);
        return response.data;
    },
};

// Assignments API
export const assignmentService = {
    getByCourse: async (courseId: number): Promise<any[]> => {
        const response = await api.get(`/courses/${courseId}/assignments`);
        return response.data;
    },
    getById: async (assignmentId: number): Promise<any> => {
        const response = await api.get(`/assignments/${assignmentId}`);
        return response.data;
    },
    create: async (data: { courseId: number; title: string; description: string; dueDate?: string; maxScore: number }): Promise<any> => {
        const response = await api.post('/admin/assignments', data);
        return response.data;
    },
    getSubmissions: async (assignmentId: number): Promise<any[]> => {
        const response = await api.get(`/assignments/${assignmentId}/submissions`);
        return response.data;
    },
    submit: async (assignmentId: number, data: { submissionText: string; fileUrl?: string }): Promise<any> => {
        const response = await api.post(`/assignments/${assignmentId}/submit`, data);
        return response.data;
    },
    gradeSubmission: async (submissionId: number, data: { score: number; feedback?: string }): Promise<any> => {
        const response = await api.post(`/submissions/${submissionId}/grade`, data);
        return response.data;
    }
};
