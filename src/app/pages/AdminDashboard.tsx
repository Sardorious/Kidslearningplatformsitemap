import { useState } from "react";
import { Link } from "react-router";
import {
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  Eye,
  Mail,
  Shield,
  TrendingUp,
  Activity,
  Calendar,
  Video,
  FileText,
  Image as ImageIcon,
  Music,
  Code,
  Sparkles,
  Wand2,
  Check
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect } from "react";
import { userService, courseService, lessonService, fileService, classService, materialService, lessonQuestionService } from "../api/services";

export function AdminDashboard() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string, id: string, name: string } | null>(null);

  const [data, setData] = useState({
    students: [] as any[],
    teachers: [] as any[],
    courses: [] as any[],
    materials: [] as any[],
    classes: [] as any[] // Assuming we'll derive or fetch this if needed, otherwise empty for now
  });

  const [loading, setLoading] = useState(true);

  // Form states for creating entities
  const [courseForm, setCourseForm] = useState({ title: '', category: '', level: '', description: '', ageRange: '', emoji: '', status: 'draft' });
  const [materialForm, setMaterialForm] = useState({ name: '', type: '', courseId: '', file: null as File | null });
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: 'Password123!', phone: '' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: 'Password123!', PhoneNumber: '' });
  const [classForm, setClassForm] = useState({ name: '', grade: '', teacherId: '', schedule: '', room: '' });
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<any>(null);
  const [lessonsForSelectedCourse, setLessonsForSelectedCourse] = useState<any[]>([]);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', duration: '', type: 'video', contentUrl: '', materialId: '' });
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonQuestions, setLessonQuestions] = useState<any[]>([]);
  const [questionForm, setQuestionForm] = useState({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '' });
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("teachers");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // AI Question Generation State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [selectedAiMaterial, setSelectedAiMaterial] = useState<any>(null);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // In a complete app, we'd have dedicated admin endpoints.
        // For now, we'll fetch what we can from the existing endpoints.
        const [users, coursesData, classesData, materialsData] = await Promise.all([
          userService.getAllUsers(),
          courseService.getAll(),
          classService.getAll(),
          materialService.getAll()
        ]);

        const students = users.filter((u: any) => u.role === 'STUDENT' || u.role === 'Student');
        const teachers = users.filter((u: any) => u.role === 'TEACHER' || u.role === 'Teacher' || u.role === 'ADMIN' || u.role === 'Admin');

        setData({
          students,
          teachers,
          courses: coursesData,
          materials: materialsData,
          classes: classesData
        });
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const stats = {
    totalStudents: data.students.length,
    totalTeachers: data.teachers.length,
    totalCourses: data.courses.length,
    totalClasses: data.classes.length,
  };

  const handleEdit = (type: string, item: any) => {
    setEditingItem(item);
    if (type === 'course') {
      setCourseForm({
        title: item.title || '',
        category: item.category || '',
        level: item.level || 'Beginner',
        description: item.description || '',
        ageRange: item.ageRange || '',
        emoji: item.imageUrl || '',
        status: item.status || 'published'
      });
    } else if (type === 'teacher') {
      setTeacherForm({
        name: item.name || `${item.firstName} ${item.lastName}`,
        email: item.email || '',
        password: '',
        phone: item.phoneNumber || ''
      });
    } else if (type === 'student') {
      setStudentForm({
        name: item.name || `${item.firstName} ${item.lastName}`,
        email: item.email || '',
        password: '',
        PhoneNumber: item.phoneNumber || ''
      });
    } else if (type === 'class') {
      setClassForm({
        name: item.name || '',
        grade: item.grade || '',
        teacherId: item.teacherId?.toString() || '',
        schedule: item.schedule || '',
        room: item.room || ''
      });
    }
    setSelectedModal(`edit${type.charAt(0).toUpperCase() + type.slice(1)}`);
  };

  const handleDelete = (type: string, id: string, name: string) => {
    setDeleteConfirm({ type, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'course') {
        await courseService.delete(parseInt(deleteConfirm.id));
        setData(prev => ({
          ...prev,
          courses: prev.courses.filter(c => c.id !== parseInt(deleteConfirm.id))
        }));
      } else if (deleteConfirm.type === 'teacher' || deleteConfirm.type === 'student') {
        await userService.deleteUser(parseInt(deleteConfirm.id));
        setData(prev => ({
          ...prev,
          teachers: prev.teachers.filter(t => t.id !== parseInt(deleteConfirm.id)),
          students: prev.students.filter(s => s.id !== parseInt(deleteConfirm.id))
        }));
      } else if (deleteConfirm.type === 'class') {
        await classService.delete(parseInt(deleteConfirm.id));
        setData(prev => ({
          ...prev,
          classes: prev.classes.filter(c => c.id !== parseInt(deleteConfirm.id))
        }));
      } else if (deleteConfirm.type === 'material') {
        await materialService.delete(parseInt(deleteConfirm.id));
        setData(prev => ({
          ...prev,
          materials: prev.materials.filter(m => m.id !== parseInt(deleteConfirm.id))
        }));
      }

      console.log(`Deleted ${deleteConfirm.type} with id ${deleteConfirm.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleExportData = () => {
    setSelectedModal("exportData");
  };

  const handleCreateCourse = async () => {
    try {
      const newCourse = await courseService.create({
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category, // Using category instead of subject
        difficultyLevel: courseForm.level,
        targetAgeGroup: courseForm.ageRange,
        imageSource: courseForm.emoji,
        imageUrl: courseForm.emoji
      });
      // Currently our API endpoint doesn't strictly take 'status', we append to local data
      setData(prev => ({
        ...prev,
        courses: [...prev.courses, { ...newCourse, status: courseForm.status }]
      }));
      setSelectedModal(null);
      setCourseForm({ title: '', category: '', level: '', description: '', ageRange: '', emoji: '', status: 'draft' }); // reset form
    } catch (err) {
      console.error("Error creating course", err);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      if (!editingItem) return;
      const updatedCourse = await courseService.update(editingItem.id, {
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        imageUrl: courseForm.emoji
      });
      setData(prev => ({
        ...prev,
        courses: prev.courses.map(c => c.id === editingItem.id ? { ...c, ...updatedCourse, status: courseForm.status } : c)
      }));
      setSelectedModal(null);
      setEditingItem(null);
      setCourseForm({ title: '', category: '', level: '', description: '', ageRange: '', emoji: '', status: 'draft' });
    } catch (err) {
      console.error("Error updating course", err);
    }
  };

  const handleCreateTeacher = async () => {
    try {
      const newUser = await userService.create({
        name: teacherForm.name,
        phoneNumber: teacherForm.phone,
        password: teacherForm.password,
        role: 'TEACHER',
        xp: 0
      });
      setData(prev => ({
        ...prev,
        teachers: [...prev.teachers, newUser]
      }));
      setSelectedModal(null);
      setTeacherForm({ name: '', email: '', password: 'Password123!', phone: '' });
    } catch (err) {
      console.error("Error creating teacher", err);
    }
  };

  const handleCreateStudent = async () => {
    try {
      const newUser = await userService.create({
        name: studentForm.name,
        phoneNumber: studentForm.PhoneNumber,
        password: studentForm.password,
        role: 'STUDENT',
        xp: 0
      });
      setData(prev => ({
        ...prev,
        students: [...prev.students, newUser]
      }));
      setSelectedModal(null);
      setStudentForm({ name: '', email: '', password: 'Password123!', PhoneNumber: '' });
    } catch (err) {
      console.error("Error creating student", err);
    }
  };

  const handleCreateClass = async () => {
    try {
      const newClass = await classService.create({
        name: classForm.name,
        grade: classForm.grade,
        teacherId: parseInt(classForm.teacherId) || 0,
        schedule: classForm.schedule,
        room: classForm.room
      });
      setData(prev => ({
        ...prev,
        classes: [...prev.classes, newClass]
      }));
      setSelectedModal(null);
      setClassForm({ name: '', grade: '', teacherId: '', schedule: '', room: '' });
    } catch (err) {
      console.error("Error creating class", err);
    }
  };

  const handleUploadMaterial = async () => {
    try {
      if (!materialForm.file) return alert("Please select a file first.");
      if (!materialForm.courseId) return alert("Please select a course first.");

      setUploadProgress(0);
      const res = await fileService.upload(materialForm.file, (percent) => {
        setUploadProgress(percent);
      });

      const newMaterial = await materialService.create({
        name: materialForm.name,
        type: materialForm.type,
        courseId: parseInt(materialForm.courseId),
        url: res.url || res.Url || res,
        size: Math.round(materialForm.file.size / 1024) + " KB"
      });

      setData(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial]
      }));
      setUploadProgress(null);
      setSelectedModal(null);
      setMaterialForm({ name: '', type: '', courseId: '', file: null });
    } catch (err) {
      setUploadProgress(null);
      console.error("Error uploading material", err);
      alert("Failed to upload material. Please try again.");
    }
  };

  const handleSettings = () => {
    setSelectedModal("settings");
  };

  const handleOpenManageLessons = async (course: any) => {
    setSelectedCourseForLessons(course);
    try {
      const lessons = await lessonService.getByCourse(course.id);
      setLessonsForSelectedCourse(lessons);
      setSelectedModal("manageLessons");
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  };

  const handleAddLesson = async () => {
    if (!selectedCourseForLessons) return;
    try {
      const newLesson = await lessonService.create({
        courseId: selectedCourseForLessons.id,
        title: lessonForm.title,
        description: lessonForm.description,
        duration: lessonForm.duration,
        type: lessonForm.type,
        contentUrl: lessonForm.contentUrl
      });
      setLessonsForSelectedCourse(prev => [...prev, newLesson]);
      setLessonForm({ title: '', description: '', duration: '', type: 'video', contentUrl: '', materialId: '' });
    } catch (err) {
      console.error("Failed to add lesson", err);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await lessonService.delete(lessonId);
      setLessonsForSelectedCourse(prev => prev.filter(l => l.id !== lessonId));
      if (editingLesson?.id === lessonId) {
        setEditingLesson(null);
        setLessonForm({ title: '', description: '', duration: '', type: 'video', contentUrl: '', materialId: '' });
      }
    } catch (err) {
      console.error("Failed to delete lesson", err);
    }
  };

  const handleEditLesson = async (lesson: any) => {
    const contentUrl = lesson.contentUrl || lesson.ContentUrl || lesson.videoUrl || lesson.VideoUrl || '';
    // Try to find matching material by URL
    const matchingMaterial = data.materials.find((m: any) =>
      (m.url || m.Url || '') === contentUrl && contentUrl !== ''
    );
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || lesson.Title || '',
      description: lesson.content || lesson.Content || lesson.description || lesson.Description || '',
      duration: lesson.duration || lesson.Duration || '',
      type: lesson.type || lesson.Type || 'video',
      contentUrl,
      materialId: matchingMaterial ? String(matchingMaterial.id) : ''
    });
    // Load questions for this lesson
    setLessonQuestions([]);
    setAddingQuestion(false);
    setQuestionForm({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '' });
    try {
      setQuestionsLoading(true);
      const qs = await lessonQuestionService.getByLesson(lesson.id);
      const parsed = (qs || []).map((q: any) => {
        const opts = JSON.parse(q.optionsJson || '[]');
        return { ...q, optionA: opts[0] || '', optionB: opts[1] || '', optionC: opts[2] || '', optionD: opts[3] || '' };
      });
      setLessonQuestions(parsed);
    } catch (e) { console.error('Failed to load questions', e); }
    finally { setQuestionsLoading(false); }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;
    try {
      const updated = await lessonService.update(editingLesson.id, {
        courseId: selectedCourseForLessons.id,
        title: lessonForm.title,
        description: lessonForm.description,
        duration: lessonForm.duration,
        type: lessonForm.type,
        contentUrl: lessonForm.contentUrl
      });
      setLessonsForSelectedCourse(prev =>
        prev.map(l => l.id === editingLesson.id ? { ...l, ...updated, title: lessonForm.title, content: lessonForm.description, duration: lessonForm.duration, type: lessonForm.type, contentUrl: lessonForm.contentUrl } : l)
      );
      // keep editingLesson open so admin can manage questions
    } catch (err) {
      console.error("Failed to update lesson", err);
    }
  };

  const handleAddQuestion = async () => {
    if (!editingLesson || !questionForm.questionText || !questionForm.correctAnswer) return;
    const options = [questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD].filter(Boolean);
    if (options.length < 2) return;
    try {
      const q = await lessonQuestionService.create({
        lessonId: editingLesson.id,
        questionText: questionForm.questionText,
        optionsJson: JSON.stringify(options),
        correctAnswer: questionForm.correctAnswer,
        orderIndex: lessonQuestions.length
      });
      const opts = JSON.parse(q.optionsJson || '[]');
      setLessonQuestions(prev => [...prev, { ...q, optionA: opts[0] || '', optionB: opts[1] || '', optionC: opts[2] || '', optionD: opts[3] || '' }]);
      setQuestionForm({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '' });
      setAddingQuestion(false);
    } catch (e) { console.error('Failed to add question', e); }
  };

  const handleDeleteQuestion = async (qId: number) => {
    try {
      await lessonQuestionService.delete(qId);
      setLessonQuestions(prev => prev.filter(q => q.id !== qId));
    } catch (e) { console.error('Failed to delete question', e); }
  };

  const handleMaterialSelect = (materialIdStr: string) => {
    const matId = parseInt(materialIdStr);
    const mat = data.materials.find((m: any) => m.id === matId);
    if (mat) {
      setLessonForm({
        ...lessonForm,
        materialId: materialIdStr,
        type: mat.type || 'video',
        contentUrl: mat.url || mat.Url || ''
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{t.adminDashboard}</h1>
          <p className="text-gray-600">{t.manageEntirePlatform}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl" onClick={handleExportData}>
            <FileText className="w-4 h-4 mr-2" />
            {t.exportData}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={handleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            {t.settings}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card
          className="px-3 py-2 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-3"
          onClick={() => setActiveTab("students")}
        >
          <div className="p-1.5 bg-white/50 rounded-lg shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-blue-900 leading-none mb-0.5">
              {stats.totalStudents}
            </div>
            <div className="text-[9px] uppercase tracking-wider font-bold text-blue-700 opacity-70 truncate">
              {t.totalStudents}
            </div>
          </div>
        </Card>

        <Card
          className="px-3 py-2 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-3"
          onClick={() => setActiveTab("teachers")}
        >
          <div className="p-1.5 bg-white/50 rounded-lg shrink-0">
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-purple-900 leading-none mb-0.5">
              {stats.totalTeachers}
            </div>
            <div className="text-[9px] uppercase tracking-wider font-bold text-purple-700 opacity-70 truncate">
              {t.totalTeachers}
            </div>
          </div>
        </Card>

        <Card
          className="px-3 py-2 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-3"
          onClick={() => setActiveTab("courses")}
        >
          <div className="p-1.5 bg-white/50 rounded-lg shrink-0">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-green-900 leading-none mb-0.5">
              {stats.totalCourses}
            </div>
            <div className="text-[9px] uppercase tracking-wider font-bold text-green-700 opacity-70 truncate">
              {t.totalCourses}
            </div>
          </div>
        </Card>

        <Card
          className="px-3 py-2 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-3"
          onClick={() => setActiveTab("classes")}
        >
          <div className="p-1.5 bg-white/50 rounded-lg shrink-0">
            <FolderOpen className="w-5 h-5 text-orange-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-orange-900 leading-none mb-0.5">
              {stats.totalClasses}
            </div>
            <div className="text-[9px] uppercase tracking-wider font-bold text-orange-700 opacity-70 truncate">
              {t.totalClasses}
            </div>
          </div>
        </Card>

        {/* Materials stat removed */}
      </div>

      {/* Unified Filter Bar — lives alongside stats, applies to the active tab */}
      <Card className="p-2 border border-gray-100 shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, teachers, courses, classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-gray-50"
            />
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-xs" onClick={() => setSelectedModal("addTeacher")}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Teacher
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-xs" onClick={() => setSelectedModal("addStudent")}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Student
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-xs" onClick={() => setSelectedModal("addCourse")}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Course
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl text-xs" onClick={() => setSelectedModal("addClass")}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Class
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">


        {/* Teachers Tab */}
        <TabsContent value="teachers" className="mt-0">
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Teacher</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Joined</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading teachers...</td></tr>
                  ) : (
                    (() => {
                      const filtered = data.teachers.filter(t => !searchQuery || `${t.firstName} ${t.lastName} ${t.email}`.toLowerCase().includes(searchQuery.toLowerCase()));
                      const totalPages = Math.ceil(filtered.length / itemsPerPage);
                      const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                      if (filtered.length === 0) {
                        return <tr><td colSpan={7} className="text-center py-8 text-gray-400">No teachers found.</td></tr>;
                      }

                      return (
                        <>
                          {paginated.map((teacher, idx) => (
                            <tr key={teacher.id} className={`border-b border-gray-100 hover:bg-purple-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {teacher.firstName ? teacher.firstName.charAt(0).toUpperCase() : "T"}
                                  </div>
                                  <span className="font-semibold text-gray-900">{teacher.firstName} {teacher.lastName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{teacher.email || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${teacher.role === 'ADMIN' || teacher.role === 'Admin' || teacher.role === 'admin'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-purple-100 text-purple-700'
                                  }`}>{teacher.role || 'Teacher'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>{teacher.status === 'active' ? 'Active' : 'Inactive'}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : '—'}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-xs" onClick={() => handleEdit("teacher", teacher)}>
                                    <Edit className="w-3 h-3 mr-1" />{t.edit}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete("teacher", teacher.id, teacher.firstName)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {totalPages > 1 && (
                            <tr>
                              <td colSpan={7} className="p-4 bg-gray-50/30">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Previous
                                  </Button>
                                  <div className="flex gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                      <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? "bg-purple-600 text-white" : "text-gray-400"}`}
                                      >
                                        {i + 1}
                                      </Button>
                                    ))}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Next
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-0">
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Student</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">XP</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Enrolled</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading students...</td></tr>
                  ) : (
                    (() => {
                      const filtered = data.students.filter(s => !searchQuery || `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchQuery.toLowerCase()));
                      const totalPages = Math.ceil(filtered.length / itemsPerPage);
                      const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                      if (filtered.length === 0) {
                        return <tr><td colSpan={7} className="text-center py-8 text-gray-400">No students found.</td></tr>;
                      }

                      return (
                        <>
                          {paginated.map((student, idx) => (
                            <tr key={student.id} className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {student.firstName ? student.firstName.charAt(0).toUpperCase() : "S"}
                                  </div>
                                  <span className="font-semibold text-gray-900">{student.firstName} {student.lastName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{student.email || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{student.phoneNumber || '—'}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{student.xp ?? 0} XP</span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-xs" onClick={() => handleEdit("student", student)}>
                                    <Edit className="w-3 h-3 mr-1" />{t.edit}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete("student", student.id, student.firstName)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {totalPages > 1 && (
                            <tr>
                              <td colSpan={7} className="p-4 bg-gray-50/30">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Previous
                                  </Button>
                                  <div className="flex gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                      <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400"}`}
                                      >
                                        {i + 1}
                                      </Button>
                                    ))}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Next
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="mt-0">
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Class Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Grade</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Teacher</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Schedule</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Room</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Students</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading classes...</td></tr>
                  ) : (
                    (() => {
                      const filtered = data.classes.filter(c => !searchQuery || (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
                      const totalPages = Math.ceil(filtered.length / itemsPerPage);
                      const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                      if (filtered.length === 0) {
                        return <tr><td colSpan={8} className="text-center py-8 text-gray-400">No classes found.</td></tr>;
                      }

                      return (
                        <>
                          {paginated.map((classItem, idx) => (
                            <tr key={classItem.id} className={`border-b border-gray-100 hover:bg-orange-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900">{classItem.name}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{classItem.grade || '—'}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{classItem.teacher || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{classItem.schedule || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{classItem.room || '—'}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{classItem.studentCount ?? 0}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-xs" onClick={() => handleEdit("class", classItem)}>
                                    <Edit className="w-3 h-3 mr-1" />{t.edit}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete("class", classItem.id, classItem.name)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {totalPages > 1 && (
                            <tr>
                              <td colSpan={8} className="p-4 bg-gray-50/30">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Previous
                                  </Button>
                                  <div className="flex gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                      <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? "bg-orange-600 text-white" : "text-gray-400"}`}
                                      >
                                        {i + 1}
                                      </Button>
                                    ))}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Next
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-0">
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Course</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Level</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Lessons</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Students</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Created</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading courses...</td></tr>
                  ) : (
                    (() => {
                      const filtered = data.courses.filter(c => !searchQuery || (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
                      const totalPages = Math.ceil(filtered.length / itemsPerPage);
                      const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                      if (filtered.length === 0) {
                        return <tr><td colSpan={9} className="text-center py-8 text-gray-400">No courses found.</td></tr>;
                      }

                      return (
                        <>
                          {paginated.map((course, idx) => (
                            <tr key={course.id} className={`border-b border-gray-100 hover:bg-green-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-lg shrink-0 overflow-hidden">
                                    {course.image ? <img src={course.image} className="w-full h-full object-cover" alt="" /> : '📚'}
                                  </div>
                                  <span className="font-semibold text-gray-900">{course.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{course.category || '—'}</td>
                              <td className="px-4 py-3">
                                {course.level ? <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{course.level}</span> : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(course.status || 'published') === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>{(course.status || 'published') === 'published' ? 'Published' : 'Draft'}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{course.lessonCount ?? '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{course.enrolledStudents ?? '—'}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '—'}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-xs text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => handleOpenManageLessons(course)}>
                                    <BookOpen className="w-3 h-3 mr-1" />Steps
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-xs text-cyan-600 border-cyan-200 hover:bg-cyan-50" onClick={() => { setSelectedCourseForLessons(course); setSelectedModal("manageCourseMaterials"); }}>
                                    <FolderOpen className="w-3 h-3 mr-1" />Materials
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete("course", course.id, course.title)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {totalPages > 1 && (
                            <tr>
                              <td colSpan={9} className="p-4 bg-gray-50/30">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Previous
                                  </Button>
                                  <div className="flex gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                      <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? "bg-green-600 text-white" : "text-gray-400"}`}
                                      >
                                        {i + 1}
                                      </Button>
                                    ))}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="rounded-xl h-8 px-3"
                                  >
                                    Next
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Standalone Materials tab content removed */}
      </Tabs>

      {/* Add Teacher Modal */}
      {selectedModal === "addTeacher" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.addTeacher}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.fullName}
                    </label>
                    <Input type="text" placeholder="John Doe" className="rounded-xl" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact}
                    </label>
                    <Input type="text" placeholder="123456789" className="rounded-xl" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.role}
                    </label>
                    <Select defaultValue="teacher">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">{t.teacher}</SelectItem>
                        <SelectItem value="admin">{t.admin}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.active}
                    </label>
                    <Select defaultValue="active">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t.active}</SelectItem>
                        <SelectItem value="inactive">{t.inactive}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.subjects}
                  </label>
                  <Input type="text" placeholder="Math, Science, Reading" className="rounded-xl" />
                  <p className="text-xs text-gray-500 mt-1">{t.separateWithCommas}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.assignClasses}
                  </label>
                  <Input type="text" placeholder="Grade 2A, Grade 3B" className="rounded-xl" />
                  <p className="text-xs text-gray-500 mt-1">{t.separateWithCommas}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                    onClick={handleCreateTeacher}
                  >
                    {t.addTeacher}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Student Modal */}
      {selectedModal === "addStudent" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.addStudent}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.fullName}
                    </label>
                    <Input type="text" placeholder="Emma Wilson" className="rounded-xl" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact}
                    </label>
                    <Input type="text" placeholder="987654321" className="rounded-xl" value={studentForm.PhoneNumber} onChange={(e) => setStudentForm({ ...studentForm, PhoneNumber: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.age}
                    </label>
                    <Input type="number" placeholder="8" className="rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.gradeLevel}
                    </label>
                    <Select defaultValue="">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 2A">Grade 2A</SelectItem>
                        <SelectItem value="Grade 2B">Grade 2B</SelectItem>
                        <SelectItem value="Grade 3A">Grade 3A</SelectItem>
                        <SelectItem value="Grade 3B">Grade 3B</SelectItem>
                        <SelectItem value="Grade 4A">Grade 4A</SelectItem>
                        <SelectItem value="Grade 4B">Grade 4B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.parentEmail}
                  </label>
                  <Input type="email" placeholder="parent@email.com" className="rounded-xl" />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"
                    onClick={handleCreateStudent}
                  >
                    {t.addStudent}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Class Modal */}
      {selectedModal === "addClass" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.addClass}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.className}
                    </label>
                    <Input type="text" placeholder="Grade 2A" className="rounded-xl" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.gradeLevel}
                    </label>
                    <Select value={classForm.grade} onValueChange={(val) => setClassForm({ ...classForm, grade: val })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 1">Grade 1</SelectItem>
                        <SelectItem value="Grade 2">Grade 2</SelectItem>
                        <SelectItem value="Grade 3">Grade 3</SelectItem>
                        <SelectItem value="Grade 4">Grade 4</SelectItem>
                        <SelectItem value="Grade 5">Grade 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.assignTeacher}
                  </label>
                  <Select value={classForm.teacherId} onValueChange={(val) => setClassForm({ ...classForm, teacherId: val })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.teachers.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.name || `${teacher.firstName} ${teacher.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.schedule}
                    </label>
                    <Input type="text" placeholder="Mon-Fri 9:00-15:00" className="rounded-xl" value={classForm.schedule} onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.room}
                    </label>
                    <Input type="text" placeholder="Room 201" className="rounded-xl" value={classForm.room} onChange={(e) => setClassForm({ ...classForm, room: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"
                    onClick={handleCreateClass}
                  >
                    {t.addClass}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Course Modal */}
      {selectedModal === "addCourse" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.addCourse}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.courseTitle}
                  </label>
                  <Input
                    type="text"
                    placeholder="Math Adventures"
                    className="rounded-xl"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.category}
                    </label>
                    <Select value={courseForm.category} onValueChange={(val) => setCourseForm({ ...courseForm, category: val })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Reading">Reading</SelectItem>
                        <SelectItem value="Writing">Writing</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Coding">Coding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.level}
                    </label>
                    <Select value={courseForm.level} onValueChange={(val) => setCourseForm({ ...courseForm, level: val })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.description}
                  </label>
                  <textarea
                    className="w-full border-2 rounded-xl p-3 min-h-[100px]"
                    placeholder="Enter course description..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.ageRange}
                    </label>
                    <Input
                      type="text"
                      placeholder="6-8"
                      className="rounded-xl"
                      value={courseForm.ageRange}
                      onChange={(e) => setCourseForm({ ...courseForm, ageRange: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.emoji}
                    </label>
                    <Input
                      type="text"
                      placeholder="🔢"
                      className="rounded-xl"
                      value={courseForm.emoji}
                      onChange={(e) => setCourseForm({ ...courseForm, emoji: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.active}
                  </label>
                  <Select value={courseForm.status} onValueChange={(val) => setCourseForm({ ...courseForm, status: val })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t.draft}</SelectItem>
                      <SelectItem value="published">{t.published}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl"
                    onClick={handleCreateCourse}
                  >
                    {t.addCourse}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Course Modal */}
      {selectedModal === "editCourse" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.editCourse}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.courseTitle}
                  </label>
                  <Input
                    type="text"
                    placeholder="Math Adventures"
                    className="rounded-xl"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.category}
                    </label>
                    <Select value={courseForm.category} onValueChange={(val) => setCourseForm({ ...courseForm, category: val })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Reading">Reading</SelectItem>
                        <SelectItem value="Writing">Writing</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Coding">Coding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.level}
                    </label>
                    <Select value={courseForm.level} onValueChange={(val) => setCourseForm({ ...courseForm, level: val })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.description}
                  </label>
                  <textarea
                    className="w-full border-2 rounded-xl p-3 min-h-[100px]"
                    placeholder="Enter course description..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.ageRange}
                    </label>
                    <Input
                      type="text"
                      placeholder="6-8"
                      className="rounded-xl"
                      value={courseForm.ageRange}
                      onChange={(e) => setCourseForm({ ...courseForm, ageRange: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.emoji}
                    </label>
                    <Input
                      type="text"
                      placeholder="🔢"
                      className="rounded-xl"
                      value={courseForm.emoji}
                      onChange={(e) => setCourseForm({ ...courseForm, emoji: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.active}
                  </label>
                  <Select value={courseForm.status} onValueChange={(val) => setCourseForm({ ...courseForm, status: val })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t.draft}</SelectItem>
                      <SelectItem value="published">{t.published}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                    onClick={handleUpdateCourse}
                  >
                    {t.saveChanges}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Material Modal */}
      {selectedModal === "uploadMaterial" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.uploadMaterial}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.materialName}
                  </label>
                  <Input
                    type="text"
                    placeholder="Introduction to Addition"
                    className="rounded-xl"
                    value={materialForm.name}
                    onChange={(e: any) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.materialType}
                    </label>
                    <Select value={materialForm.type} onValueChange={(val: any) => setMaterialForm({ ...materialForm, type: val })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">{t.video}</SelectItem>
                        <SelectItem value="document">{t.document}</SelectItem>
                        <SelectItem value="image">{t.image}</SelectItem>
                        <SelectItem value="audio">{t.audio}</SelectItem>
                        <SelectItem value="interactive">{t.interactive}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.course}
                    </label>
                    <Select value={materialForm.courseId} onValueChange={(val: any) => setMaterialForm({ ...materialForm, courseId: val })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.courses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.uploadFile}
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${uploadProgress !== null ? 'border-purple-400 bg-purple-50' : 'hover:border-purple-400'}`}>
                    {uploadProgress === null ? (
                      <>
                        <Input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e: any) => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                        />
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {materialForm.file ? materialForm.file.name : t.clickToUpload}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.supportedFormats}
                        </p>
                      </>
                    ) : (
                      <div className="py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-purple-700">Uploading {materialForm.file?.name}...</span>
                          <span className="text-xs font-bold text-purple-700">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-purple-600 mt-2">Please stay on this page until upload completes.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl"
                    onClick={handleUploadMaterial}
                  >
                    {t.uploadMaterial}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.confirmDelete}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <p className="text-center text-gray-700">
                  {t.deleteWarning} <span className="font-bold">{deleteConfirm.name}</span>?
                </p>
                <p className="text-center text-sm text-gray-500">
                  {t.cannotUndo}
                </p>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
                    onClick={confirmDelete}
                  >
                    {t.delete}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Export Data Modal */}
      {selectedModal === "exportData" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.exportData}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.selectDataType}
                  </label>
                  <Select defaultValue="all">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allData}</SelectItem>
                      <SelectItem value="students">{t.students}</SelectItem>
                      <SelectItem value="teachers">{t.teachers}</SelectItem>
                      <SelectItem value="courses">{t.courses}</SelectItem>
                      <SelectItem value="classes">{t.classes}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.exportFormat}
                  </label>
                  <Select defaultValue="csv">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
                    onClick={() => {
                      console.log("Exporting data...");
                      setSelectedModal(null);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t.export}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {selectedModal === "settings" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.platformSettings}</h2>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{t.generalSettings}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.platformName}
                      </label>
                      <Input type="text" defaultValue="Kids Learning Platform" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.contactEmail}
                      </label>
                      <Input type="email" defaultValue="admin@platform.com" className="rounded-xl" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{t.notificationSettings}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">{t.emailNotifications}</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">{t.parentUpdates}</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">{t.teacherAlerts}</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{t.systemSettings}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.maxStudentsPerClass}
                      </label>
                      <Input type="number" defaultValue="30" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.sessionTimeout}
                      </label>
                      <Select defaultValue="30">
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 {t.minutes}</SelectItem>
                          <SelectItem value="30">30 {t.minutes}</SelectItem>
                          <SelectItem value="60">60 {t.minutes}</SelectItem>
                          <SelectItem value="120">120 {t.minutes}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.saveSettings}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setSelectedModal(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Manage Course Materials Modal */}
      {selectedModal === "manageCourseMaterials" && selectedCourseForLessons && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Manage Materials</h2>
                  <p className="text-sm text-gray-500">{selectedCourseForLessons.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl"
                    onClick={() => {
                      setMaterialForm({ ...materialForm, courseId: selectedCourseForLessons.id.toString() });
                      setSelectedModal("uploadMaterial");
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                    {t.close}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Size</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Uploaded</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const courseMaterials = data.materials.filter((m: any) =>
                        m.courseId === selectedCourseForLessons.id ||
                        m.course === selectedCourseForLessons.title
                      );

                      if (courseMaterials.length === 0) {
                        return <tr><td colSpan={6} className="text-center py-8 text-gray-400">No materials found for this course.</td></tr>;
                      }

                      return courseMaterials.map((material: any, idx: number) => (
                        <tr key={material.id} className={`border-b border-gray-100 hover:bg-cyan-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900 max-w-[200px] truncate">{material.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {material.type === 'video' && <Video className="w-4 h-4 text-red-500 shrink-0" />}
                              {material.type === 'document' && <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
                              {material.type === 'image' && <ImageIcon className="w-4 h-4 text-green-500 shrink-0" />}
                              {material.type === 'audio' && <Music className="w-4 h-4 text-purple-500 shrink-0" />}
                              {material.type === 'interactive' && <Code className="w-4 h-4 text-orange-500 shrink-0" />}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${material.type === 'video' ? 'bg-red-100 text-red-700' :
                                material.type === 'document' ? 'bg-blue-100 text-blue-700' :
                                  material.type === 'image' ? 'bg-green-100 text-green-700' :
                                    material.type === 'audio' ? 'bg-purple-100 text-purple-700' :
                                      'bg-orange-100 text-orange-700'
                                }`}>{material.type || 'file'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{material.size || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{material.uploadDate || (material.createdAt ? new Date(material.createdAt).toLocaleDateString() : '—')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {material.url ? (
                                <Link to={`/material/view?url=${encodeURIComponent(material.url)}&type=${encodeURIComponent(material.type || '')}&name=${encodeURIComponent(material.name)}`}>
                                  <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-xs text-purple-700 border-purple-200 hover:bg-purple-50">
                                    <Eye className="w-3 h-3 mr-1" />View
                                  </Button>
                                </Link>
                              ) : (
                                <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-xs" disabled>
                                  <Eye className="w-3 h-3 mr-1" />No File
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg h-7 px-2 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                onClick={async () => {
                                  setSelectedAiMaterial(material);
                                  setIsAiModalOpen(true);
                                  setGeneratingAi(true);
                                  try {
                                    const existing = await materialService.getQuestions(material.id);
                                    if (existing && existing.length > 0) {
                                      setAiQuestions(existing);
                                    } else {
                                      const generated = await materialService.generateQuestions(material.id, 5);
                                      setAiQuestions(generated);
                                    }
                                  } catch (err) {
                                    console.error("Failed to load/generate questions:", err);
                                    setAiQuestions([]);
                                  } finally {
                                    setGeneratingAi(false);
                                  }
                                }}
                              >
                                <Sparkles className="w-3 h-3 mr-1" /> Exam
                              </Button>

                              <Button size="sm" variant="outline" className="rounded-lg h-7 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete("material", material.id, material.name)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Manage Lessons Modal */}
      {selectedModal === "manageLessons" && selectedCourseForLessons && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Manage Lessons</h2>
                  <p className="text-sm text-gray-500">{selectedCourseForLessons.title}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedModal(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side: List of Steps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Current Steps</h3>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                    {lessonsForSelectedCourse.length === 0 ? (
                      <p className="text-gray-500 italic">No steps yet. Add one on the right!</p>
                    ) : (
                      lessonsForSelectedCourse.map((lesson, idx) => (
                        <div key={lesson.id} className={`p-3 border rounded-xl flex items-start justify-between transition-colors ${editingLesson?.id === lesson.id ? 'bg-purple-50 border-purple-300' : 'bg-gray-50'}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h4 className="font-bold text-gray-900 truncate">{lesson.title || lesson.Title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{lesson.description || lesson.Description || lesson.content || lesson.Content}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-gray-600 capitalize">
                                {lesson.type || lesson.Type || 'video'}
                              </span>
                              {(lesson.duration || lesson.Duration) && <span className="text-[10px] text-gray-400">{lesson.duration || lesson.Duration}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 h-8 w-8 p-0"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right side: Add/Edit Step Form */}
                <div className={`space-y-4 p-4 rounded-2xl border ${editingLesson ? 'bg-amber-50/60 border-amber-200' : 'bg-purple-50/50 border-purple-100'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${editingLesson ? 'text-amber-900' : 'text-purple-900'}`}>
                      {editingLesson ? '✏️ Edit Step' : 'Add New Step'}
                    </h3>
                    {editingLesson && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:bg-gray-100 text-xs px-2 h-7"
                        onClick={() => {
                          setEditingLesson(null);
                          setLessonForm({ title: '', description: '', duration: '', type: 'video', contentUrl: '', materialId: '' });
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${editingLesson ? 'text-amber-700' : 'text-purple-700'}`}>Step Title</label>
                    <Input
                      placeholder="e.g. Introduction to Math"
                      className={`rounded-xl ${editingLesson ? 'border-amber-200' : 'border-purple-200'}`}
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${editingLesson ? 'text-amber-700' : 'text-purple-700'}`}>Description</label>
                    <Input
                      placeholder="What will students learn?"
                      className={`rounded-xl ${editingLesson ? 'border-amber-200' : 'border-purple-200'}`}
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${editingLesson ? 'text-amber-700' : 'text-purple-700'}`}>Duration</label>
                      <Input
                        placeholder="15 min"
                        className={`rounded-xl ${editingLesson ? 'border-amber-200' : 'border-purple-200'}`}
                        value={lessonForm.duration}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${editingLesson ? 'text-amber-700' : 'text-purple-700'}`}>Type</label>
                      <Select value={lessonForm.type} onValueChange={(val) => setLessonForm({ ...lessonForm, type: val })}>
                        <SelectTrigger className={`rounded-xl bg-white ${editingLesson ? 'border-amber-200' : 'border-purple-200'}`}>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="interactive">Interactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${editingLesson ? 'text-amber-700' : 'text-purple-700'}`}>Content URL</label>
                    <Input
                      placeholder="https://..."
                      className={`rounded-xl ${editingLesson ? 'border-amber-200' : 'border-purple-200'}`}
                      value={lessonForm.contentUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${editingLesson ? 'text-amber-700' : 'text-purple-700'}`}>Or Link a Material</label>
                    <Select value={lessonForm.materialId} onValueChange={handleMaterialSelect}>
                      <SelectTrigger className={`rounded-xl bg-white ${editingLesson ? 'border-amber-200' : 'border-purple-200'}`}>
                        <SelectValue placeholder="Link material" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.materials.length === 0 ? (
                          <SelectItem value="none" disabled>No materials found</SelectItem>
                        ) : (
                          data.materials.map((m: any) => (
                            <SelectItem key={m.id} value={m.id.toString()}>
                              {m.name} ({m.type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    {editingLesson ? (
                      <Button
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold shadow-md"
                        onClick={handleUpdateLesson}
                        disabled={!lessonForm.title}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold shadow-md"
                        onClick={handleAddLesson}
                        disabled={!lessonForm.title}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step to Course
                      </Button>
                    )}
                  </div>

                  {/* Quiz Questions Section — shown only when editing a step */}
                  {editingLesson && (
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-amber-900">📝 Quiz Questions ({lessonQuestions.length})</h4>
                        <div className="flex gap-2">
                          {lessonForm.materialId && lessonForm.materialId !== "none" && (
                            <Button
                              size="sm"
                              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 rounded-xl h-7"
                              disabled={generatingAi}
                              onClick={async () => {
                                setGeneratingAi(true);
                                try {
                                  // Call AI question generation API (defaults to 5)
                                  const generated = await materialService.generateQuestions(parseInt(lessonForm.materialId), 5);

                                  // Loop through generated questions and create them for this lesson
                                  const newQuestions = [];
                                  for (const gq of generated) {
                                    const q = await lessonQuestionService.create({
                                      lessonId: editingLesson.id,
                                      questionText: gq.questionText || gq.QuestionText,
                                      optionsJson: gq.optionsJson || gq.OptionsJson,
                                      correctAnswer: gq.correctAnswer || gq.CorrectAnswer,
                                      orderIndex: lessonQuestions.length + newQuestions.length
                                    });

                                    const opts = JSON.parse(q.optionsJson || '[]');
                                    newQuestions.push({ ...q, optionA: opts[0] || '', optionB: opts[1] || '', optionC: opts[2] || '', optionD: opts[3] || '' });
                                  }

                                  setLessonQuestions(prev => [...prev, ...newQuestions]);
                                } catch (err) {
                                  console.error("Failed to generate AI questions:", err);
                                  alert("Failed to generate AI questions. Please try again.");
                                } finally {
                                  setGeneratingAi(false);
                                }
                              }}
                            >
                              <Wand2 className={`w-3 h-3 mr-1 ${generatingAi ? 'animate-pulse' : ''}`} />
                              {generatingAi ? 'Generating...' : 'Generate with AI'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 rounded-xl h-7"
                            onClick={() => { setAddingQuestion(!addingQuestion); setQuestionForm({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '' }); }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Question
                          </Button>
                        </div>
                      </div>

                      {questionsLoading && <p className="text-xs text-gray-400 text-center py-2">Loading questions...</p>}

                      {/* Existing Questions */}
                      {lessonQuestions.map((q, qi) => (
                        <div key={q.id} className="mb-2 p-2.5 bg-white border border-amber-100 rounded-xl text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 mb-1">Q{qi + 1}. {q.questionText}</p>
                              <div className="grid grid-cols-2 gap-1">
                                {JSON.parse(q.optionsJson || '[]').map((opt: string, oi: number) => (
                                  <span key={oi} className={`px-1.5 py-0.5 rounded text-[10px] ${opt === q.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                                    {String.fromCharCode(65 + oi)}. {opt} {opt === q.correctAnswer ? '✓' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 h-6 w-6 p-0 shrink-0" onClick={() => handleDeleteQuestion(q.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {lessonQuestions.length === 0 && !questionsLoading && !addingQuestion && (
                        <p className="text-xs text-amber-600/70 italic text-center py-2">No questions yet. Students can proceed without a quiz.</p>
                      )}

                      {/* Add Question Form */}
                      {addingQuestion && (
                        <div className="mt-2 p-3 bg-white border border-amber-200 rounded-xl space-y-2">
                          <Input
                            placeholder="Question text..."
                            className="rounded-lg text-xs h-8 border-amber-200"
                            value={questionForm.questionText}
                            onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((key, i) => (
                              <Input key={key} placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="rounded-lg text-xs h-8 border-amber-200"
                                value={questionForm[key]}
                                onChange={e => setQuestionForm({ ...questionForm, [key]: e.target.value })}
                              />
                            ))}
                          </div>
                          <Select value={questionForm.correctAnswer} onValueChange={val => setQuestionForm({ ...questionForm, correctAnswer: val })}>
                            <SelectTrigger className="rounded-lg text-xs h-8 bg-white border-amber-200">
                              <SelectValue placeholder="Select correct answer..." />
                            </SelectTrigger>
                            <SelectContent>
                              {[questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD]
                                .filter(Boolean)
                                .map((opt, i) => (
                                  <SelectItem key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-xl h-7"
                              onClick={handleAddQuestion}
                              disabled={!questionForm.questionText || !questionForm.correctAnswer || !questionForm.optionA || !questionForm.optionB}>
                              Save Question
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs rounded-xl h-7 border-amber-200" onClick={() => setAddingQuestion(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </Card>
        </div>
      )}

      {/* AI Generate/Review Modal */}
      {isAiModalOpen && selectedAiMaterial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border border-indigo-100">
            <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">AI Exam Generation</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Generating from: <span className="font-semibold text-indigo-700">{selectedAiMaterial.name}</span></p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAiModalOpen(false)} className="rounded-full shadow-sm">
                Close
              </Button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {generatingAi ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 animate-pulse">Analyzing material & generating exam questions...</p>
                  <p className="text-xs text-gray-400">This usually takes a few seconds.</p>
                </div>
              ) : aiQuestions.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-600">Failed to generate questions, or none exist.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiQuestions.map((q, idx) => {
                    let options: string[] = [];
                    try { options = JSON.parse(q.optionsJson); } catch (e) { options = [q.optionsJson]; }

                    return (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

                        <div className="flex justify-between items-start mb-3 pl-2">
                          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">Question {idx + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            onClick={() => setAiQuestions(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="pl-2 space-y-4">
                          <textarea
                            className="w-full text-sm font-bold text-gray-900 border-0 border-b-2 border-transparent hover:border-indigo-100 focus:border-indigo-500 focus:ring-0 p-0 resize-none transition-colors"
                            value={q.questionText}
                            rows={2}
                            onChange={(e) => {
                              const newQs = [...aiQuestions];
                              newQs[idx].questionText = e.target.value;
                              setAiQuestions(newQs);
                            }}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {options.map((opt, optIdx) => {
                              const isCorrect = opt === q.correctAnswer;
                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${isCorrect
                                    ? 'bg-green-50 border-green-200 shadow-sm'
                                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                                    }`}
                                  onClick={() => {
                                    const newQs = [...aiQuestions];
                                    newQs[idx].correctAnswer = opt;
                                    setAiQuestions(newQs);
                                  }}
                                >
                                  <div className={`w-4 h-4 rounded-full border-2 flex shrink-0 items-center justify-center ${isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                    }`}>
                                    {isCorrect && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <input
                                    className="text-xs font-medium bg-transparent border-none p-0 focus:ring-0 w-full text-gray-700"
                                    value={opt}
                                    onChange={(e) => {
                                      const newQs = [...aiQuestions];
                                      let newOpts = [...options];
                                      newOpts[optIdx] = e.target.value;
                                      newQs[idx].optionsJson = JSON.stringify(newOpts);
                                      if (isCorrect) newQs[idx].correctAnswer = e.target.value;
                                      setAiQuestions(newQs);
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-dashed border-gray-300 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                onClick={() => {
                  setAiQuestions(prev => [
                    ...prev,
                    {
                      materialId: selectedAiMaterial.id,
                      questionText: "New Question...",
                      optionsJson: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
                      correctAnswer: "Option A",
                      orderIndex: prev.length
                    }
                  ]);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Manual Question
              </Button>

              <div className="flex gap-2 text-sm">
                <Button
                  disabled={generatingAi || aiQuestions.length === 0}
                  className="bg-gray-900 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                  onClick={async () => {
                    try {
                      await materialService.saveQuestions(selectedAiMaterial.id, aiQuestions);
                      alert("Saved successfully!");
                      setIsAiModalOpen(false);
                    } catch (err) {
                      console.error("Save failed:", err);
                      alert("Failed to save questions.");
                    }
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Save Exam
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}