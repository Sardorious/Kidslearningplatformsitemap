export interface User {
    id: number;
    name: string;
    phoneNumber: string;
    role: string;
    xp: number;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    category?: string;
    ageGroup?: string;
    level?: string;
    imageUrl?: string;
    image?: string;
    difficultyLevel?: string;
    targetAgeGroup?: string;
    imageSource?: string;
    lessonCount?: number;
    enrolledStudents?: number;
    createdAt?: string;
    status?: string;
    ageRange?: string;
}

export interface Lesson {
    id: number;
    courseId: number;
    title: string;
    description?: string;
    duration?: string;
    type?: string;
    contentUrl?: string;
    xpReward?: number;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ProgressData {
    id: number;
    userId: number;
    courseId: number;
    lessonId: number;
    isCompleted: boolean;
    score?: number;
}
