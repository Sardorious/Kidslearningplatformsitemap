import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Users, BookOpen, CheckCircle, Clock, Star, MessageSquare,
  Mic, PenTool, FileText, TrendingUp, Calendar, Award,
  AlertCircle, Search, BarChart3, X, Send, UserCircle, Phone,
  Plus, FolderOpen, Trash2, Filter, CheckCircle2, Sparkles, Wand2, Check
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { userService, courseService, materialService, lessonService, fileService, aiService } from "../api/services";
import { Course, User } from "../types";

function TeacherSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-lg w-56" />
          <div className="h-4 bg-gray-100 rounded w-40" />
        </div>
        <div className="flex gap-3">
          <div className="h-16 w-28 bg-gray-200 rounded-xl" />
          <div className="h-16 w-28 bg-gray-200 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );
}

type ModalType = "review" | "profile" | "feedback" | "contact" | null;

export function TeacherDashboard() {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<ModalType>(null);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("courses");

  // AI Tools State
  const [aiLoading, setAiLoading] = useState(false);
  const [writingText, setWritingText] = useState("");
  const [writingImage, setWritingImage] = useState<File | null>(null);
  const [writingResult, setWritingResult] = useState<any>(null);
  const [speakingFile, setSpeakingFile] = useState<File | null>(null);
  const [speakingResult, setSpeakingResult] = useState<any>(null);
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonPlanResult, setLessonPlanResult] = useState<any>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, coursesData] = await Promise.all([
          userService.getAllUsers(),
          courseService.getTeacherCourses()
        ]);
        const teacherStudents = usersData.filter((u: any) => u.role === 'STUDENT');
        setStudents(teacherStudents);
        setCourses(coursesData || []);

        // Mocking assignments from fetched students since there's no direct teacher assignments endpoint visible
        // In a real app, we'd have a specific endpoint for this.
        const mockAssignments = [
          {
            id: "a1",
            studentName: "Emma Wilson",
            studentClass: "Grade 2A",
            title: "Creative Story Writing",
            subject: "Writing",
            type: "writing",
            status: "pending",
            submittedDate: "Today",
            priority: "high",
          }
        ];
        setAssignments(mockAssignments);
      } catch (error) {
        console.error("Failed to load teacher dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <TeacherSkeleton />;

  const pendingAssignments = assignments.filter(a => a.status === "pending");
  const filteredStudents = students.filter(student => {
    const name = `${student.firstName || ''} ${student.lastName || ''}`.trim();
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "all" || student.grade === selectedClass;
    return matchesSearch && matchesClass;
  });

  const openReview = (assignment: any) => {
    setActiveAssignment(assignment);
    setGradeValue("");
    setFeedbackText("");
    setModal("review");
  };

  const openProfile = (student: any) => {
    setActiveStudent(student);
    setModal("profile");
  };

  const openFeedback = (student: any) => {
    setActiveStudent(student);
    setFeedbackText("");
    setModal("feedback");
  };

  const openContact = (student: any) => {
    setActiveStudent(student);
    setContactMessage("");
    setModal("contact");
  };

  const closeModal = () => {
    setModal(null);
    setActiveAssignment(null);
    setActiveStudent(null);
    setSuccessMsg("");
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => { closeModal(); }, 1500);
  };

  const handleSubmitGrade = async () => {
    if (!gradeValue || parseInt(gradeValue) < 0 || parseInt(gradeValue) > 100) {
      alert("Please enter a grade between 0 and 100.");
      return;
    }
    setSubmitting(true);
    await new Promise(res => setTimeout(res, 600)); // simulate API call
    setAssignments((prev: any[]) => prev.map((a: any) =>
      a.id === activeAssignment?.id
        ? { ...a, status: "graded", grade: parseInt(gradeValue), gradedDate: "Today" }
        : a
    ));
    setSubmitting(false);
    showSuccess(`✅ Grade ${gradeValue}% submitted successfully!`);
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) { alert("Please write some feedback first."); return; }
    setSubmitting(true);
    await new Promise(res => setTimeout(res, 500));
    setSubmitting(false);
    showSuccess(`✅ Feedback sent to ${activeStudent?.name}!`);
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) { alert("Please write a message first."); return; }
    setSubmitting(true);
    await new Promise(res => setTimeout(res, 500));
    setSubmitting(false);
    showSuccess(`✅ Message sent to ${activeStudent?.name}!`);
  };

  // AI Tool Handlers
  const handleCheckWriting = async () => {
    if (!writingText.trim() && !writingImage) return;
    setAiLoading(true);
    setWritingResult(null);
    try {
      const res = await aiService.checkWriting(writingText, "Grade 4", writingImage || undefined);
      setWritingResult(res);
    } catch {
      alert("AI Writing Check failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCheckSpeaking = async () => {
    if (!speakingFile) return;
    setAiLoading(true);
    setSpeakingResult(null);
    try {
      const res = await aiService.checkSpeaking(speakingFile);
      setSpeakingResult(res);
    } catch {
      alert("AI Speaking Evaluation failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateLessonPlan = async () => {
    if (!lessonTopic.trim()) return;
    setAiLoading(true);
    setLessonPlanResult(null);
    try {
      const res = await aiService.generateLessonPlan(lessonTopic, 10, "Intermediate");
      setLessonPlanResult(res);
    } catch {
      alert("AI Lesson Plan generation failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const typeColors: Record<string, string> = {
    writing: "bg-blue-100 text-blue-600",
    speaking: "bg-purple-100 text-purple-600",
    reading: "bg-green-100 text-green-600",
    quiz: "bg-orange-100 text-orange-600",
  };

  const typeIcons: Record<string, any> = {
    writing: PenTool, speaking: Mic, reading: BookOpen, quiz: FileText,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{t.teacherDashboard}</h1>
          <p className="text-gray-500">{t.manageStudentsAndAssignments}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-purple-100 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-gray-500">{t.totalStudents}</div>
            <div className="text-2xl font-black text-purple-600">{students.length}</div>
          </div>
          <div className="bg-white border-2 border-orange-100 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-gray-500">{t.myCourses}</div>
            <div className="text-2xl font-black text-orange-600">{courses.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: t.activeStudents, value: students.length, color: "blue" },
          { icon: Clock, label: t.pendingReview, value: pendingAssignments.length, color: "orange" },
          { icon: CheckCircle, label: t.gradedToday, value: assignments.filter(a => a.status === "graded" && a.gradedDate === "Today").length, color: "green" },
          { icon: Star, label: t.classAverage, value: "87%", color: "purple" },
        ].map((s) => {
          const Icon = s.icon;
          const colors: Record<string, string> = {
            blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-900",
            orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-900",
            green: "from-green-50 to-green-100 border-green-200 text-green-900",
            purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-900",
          };
          return (
            <Card key={s.label} className={`p-4 bg-gradient-to-br ${colors[s.color]} border-2 border-opacity-50 rounded-2xl`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <div>
                  <div className={`text-xl font-black text-${s.color}-900`}>{s.value}</div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider opacity-60 text-${s.color}-700`}>{s.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm rounded-xl p-1">
          <TabsTrigger value="courses" className="rounded-lg">{t.myCourses}</TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-lg">{t.assignments}</TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg">{t.students}</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">{t.analytics}</TabsTrigger>
          <TabsTrigger value="ai-tools" className="rounded-lg">✨ AI Tools</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card className="p-4 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-gray-900">{t.manageYourCourses}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 italic">No courses created yet.</div>
              ) : (
                courses.map((course) => (
                  <Card key={course.id} className="p-4 hover:shadow-lg transition-all border-gray-100 rounded-2xl group">
                    <div className="aspect-video rounded-xl bg-gray-100 mb-3 overflow-hidden relative">
                      <img
                        src={course.imageUrl || course.image || `https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{course.description}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl text-xs"
                        onClick={async () => {
                          setSelectedCourse(course);
                          setIsMaterialsModalOpen(true);
                          setUploadingMaterial(true);
                          try {
                            const mats = await materialService.getAll();
                            setCourseMaterials(mats.filter((m: any) => m.courseId === course.id));
                          } finally {
                            setUploadingMaterial(false);
                          }
                        }}
                      >
                        {t.materials}
                      </Button>
                      <Link to={`/lesson/${course.id}/play`} className="flex-1">
                        <Button size="sm" className="w-full bg-gray-900 rounded-xl text-xs">
                          {t.view}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl"><SelectValue placeholder={t.allSubjects} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allSubjects}</SelectItem>
                  <SelectItem value="writing">{t.writing}</SelectItem>
                  <SelectItem value="speaking">{t.speaking}</SelectItem>
                  <SelectItem value="reading">{t.reading}</SelectItem>
                  <SelectItem value="math">{t.math}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl"><SelectValue placeholder={t.allClasses} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allClasses}</SelectItem>
                  <SelectItem value="Grade 2A">Grade 2A</SelectItem>
                  <SelectItem value="Grade 2B">Grade 2B</SelectItem>
                  <SelectItem value="Grade 3A">Grade 3A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-600" />
              {t.pendingReview} ({pendingAssignments.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingAssignments
                .filter(a => selectedSubject === "all" || a.subject === selectedSubject)
                .filter(a => selectedClass === "all" || a.studentClass === selectedClass)
                .map((assignment) => {
                  const TypeIcon = typeIcons[assignment.type] || FileText;
                  return (
                    <Card key={assignment.id} className="p-5 hover:shadow-lg transition-all rounded-2xl border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeColors[assignment.type] || "bg-gray-100 text-gray-600"}`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div>
                              <h3 className="font-black text-gray-900 text-sm">{assignment.title}</h3>
                              <p className="text-xs text-gray-500">{assignment.studentName} · {assignment.studentClass}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${assignment.priority === "high" ? "bg-red-100 text-red-700" : assignment.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                              {assignment.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">{assignment.subject} · Submitted: {assignment.submittedDate}</p>
                          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs" onClick={() => openReview(assignment)}>
                            {t.review}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              {t.recentlyGraded}
            </h2>
            <div className="space-y-3">
              {assignments.filter(a => a.status === "graded").slice(0, 5).map((a) => (
                <Card key={a.id} className="p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-500">{a.studentName} · {a.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-green-600">{a.grade}%</div>
                      <p className="text-xs text-gray-400">{a.gradedDate}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card className="p-4 rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="text" placeholder={t.searchStudents} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-xl" />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl"><SelectValue placeholder={t.allClasses} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allClasses}</SelectItem>
                  <SelectItem value="Grade 2A">Grade 2A</SelectItem>
                  <SelectItem value="Grade 2B">Grade 2B</SelectItem>
                  <SelectItem value="Grade 3A">Grade 3A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-5 hover:shadow-lg transition-all rounded-2xl border border-gray-100 group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl shrink-0">
                    {student.avatar || "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 truncate">{student.firstName} {student.lastName}</h3>
                    <p className="text-sm text-gray-500">{student.class}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-600">{student.averageGrade}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{t.completionRate}</span>
                    <span className="font-bold text-purple-600">{student.completionRate}%</span>
                  </div>
                  <Progress value={student.completionRate} className="h-1.5" />
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="text-base font-black text-blue-600">{student.assignmentsCompleted}</div>
                      <div className="text-xs text-gray-500">{t.completed}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2">
                      <div className="text-base font-black text-orange-600">{student.assignmentsPending}</div>
                      <div className="text-xs text-gray-500">{t.pending}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="text-base font-black text-purple-600">{student.streak}</div>
                      <div className="text-xs text-gray-500">{t.days}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs border-gray-200" onClick={() => openProfile(student)}>
                    {t.viewProfile}
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-xs" onClick={() => openFeedback(student)}>
                    {t.feedback}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" /> {t.subjectPerformance}
              </h3>
              <div className="space-y-4">
                {[
                  { subject: t.writing, score: 85, color: "blue" },
                  { subject: t.speaking, score: 78, color: "purple" },
                  { subject: t.reading, score: 92, color: "green" },
                  { subject: t.math, score: 88, color: "orange" },
                  { subject: t.science, score: 81, color: "pink" },
                ].map((item) => (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="font-semibold text-gray-700">{item.subject}</span>
                      <span className="font-bold text-gray-900">{item.score}%</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> {t.topPerformers}
              </h3>
              <div className="space-y-3">
                {students.sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0)).slice(0, 5).map((student, index) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}</div>
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-sm">{student.avatar || "👤"}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500">{student.grade || student.class}</p>
                    </div>
                    <div className="text-base font-black text-purple-600">{student.averageGrade || 0}%</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" /> {t.needsAttention}
              </h3>
              <div className="space-y-3">
                {students.filter(s => (s.averageGrade || 0) < 75 || (s.assignmentsPending || 0) > 2).map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-sm">{student.avatar || "👤"}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500">{(student.averageGrade || 0) < 75 && `Low grade: ${student.averageGrade}%`}{(student.averageGrade || 0) < 75 && (student.assignmentsPending || 0) > 2 && " · "}{(student.assignmentsPending || 0) > 2 && `${student.assignmentsPending} pending`}</p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => openContact(student)}>
                      {t.contact}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai-tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Writing Checker */}
            <Card className="p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">AI Writing Checker</h3>
                  <p className="text-sm text-gray-500">Analyze grammar, tone, and vocabulary</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4 h-40">
                <textarea
                  value={writingText}
                  onChange={e => setWritingText(e.target.value)}
                  placeholder="Paste student writing here..."
                  className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
                />
                
                {/* Image Upload Area for handwriting */}
                <div className="w-40 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group flex flex-col items-center justify-center p-2 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => setWritingImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full"
                  />
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    {writingImage ? <FileText className="w-5 h-5 text-blue-600" /> : <PenTool className="w-5 h-5 text-gray-400" />}
                  </div>
                  <p className="font-bold text-gray-600 text-xs line-clamp-2">{writingImage ? writingImage.name : "Upload Handwriting Photo"}</p>
                </div>
              </div>

              <Button
                onClick={handleCheckWriting}
                disabled={aiLoading || (!writingText.trim() && !writingImage)}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold py-6"
              >
                {aiLoading ? "Analyzing..." : "Check Writing with AI"}
              </Button>

              {writingResult && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2 rounded-xl text-center">
                      <div className="text-xl font-black text-blue-700">{writingResult.grammarScore}%</div>
                      <div className="text-[10px] text-blue-600 font-bold uppercase">Grammar</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-xl text-center">
                      <div className="text-xl font-black text-purple-700">{writingResult.vocabularyScore}%</div>
                      <div className="text-[10px] text-purple-600 font-bold uppercase">Vocab</div>
                    </div>
                    <div className="bg-pink-50 p-2 rounded-xl text-center">
                      <div className="text-xl font-black text-pink-700">{writingResult.clarityScore}%</div>
                      <div className="text-[10px] text-pink-600 font-bold uppercase">Clarity</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AI Feedback</p>
                    <p className="text-sm text-gray-700 leading-relaxed italic">"{writingResult.feedback}"</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Corrected Version
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{writingResult.correctedText}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Speaking Evaluation */}
            <Card className="p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">AI Speaking Evaluation</h3>
                  <p className="text-sm text-gray-500">Upload audio to check pronunciation</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-gray-100/50 transition-colors mb-4 relative overflow-hidden group">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={e => setSpeakingFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    {speakingFile ? <FileText className="w-6 h-6 text-purple-600" /> : <Mic className="w-6 h-6 text-gray-400" />}
                  </div>
                  <p className="font-bold text-gray-600 mb-1">{speakingFile ? speakingFile.name : "Select Audio File"}</p>
                  <p className="text-xs text-gray-400">MP3, WAV, or Ogg files supported</p>
                </div>
              </div>

              <Button
                onClick={handleCheckSpeaking}
                disabled={aiLoading || !speakingFile}
                className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl font-bold py-6"
              >
                {aiLoading ? "Processing Audio..." : "Evaluate Speaking"}
              </Button>

              {speakingResult && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg border border-gray-800">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Transcription</p>
                    <p className="text-sm font-medium leading-relaxed">"{speakingResult.transcription}"</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-indigo-50 p-3 rounded-xl text-center">
                      <div className="text-xl font-black text-indigo-700">{speakingResult.fluencyScore}%</div>
                      <div className="text-[10px] text-indigo-600 font-bold uppercase">Fluency</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-xl text-center">
                      <div className="text-xl font-black text-orange-700">{speakingResult.pronunciationScore}%</div>
                      <div className="text-[10px] text-orange-600 font-bold uppercase">Pronunciation</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl text-center">
                      <div className="text-xl font-black text-blue-700">{speakingResult.grammarScore}%</div>
                      <div className="text-[10px] text-blue-600 font-bold uppercase">Grammar</div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Coach's Advice</p>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{speakingResult.feedback}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Lesson Plan Generator */}
            <Card className="p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 bg-gradient-to-br from-white to-orange-50/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">AI Lesson Plan Generator</h3>
                  <p className="text-sm text-gray-500">Create structured lesson plans in seconds</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input
                  value={lessonTopic}
                  onChange={e => setLessonTopic(e.target.value)}
                  placeholder="Enter topic (e.g., 'Introduction to Ancient Rome', 'The Water Cycle')"
                  className="flex-1 rounded-2xl py-6 border-2 border-gray-100 focus:border-orange-400"
                />
                <Button
                  onClick={handleGenerateLessonPlan}
                  disabled={aiLoading || !lessonTopic.trim()}
                  className="bg-orange-600 hover:bg-orange-700 px-8 rounded-2xl font-black shadow-lg shadow-orange-200"
                >
                  {aiLoading ? "Generating..." : "Magic Generate"}
                </Button>
              </div>

              {lessonPlanResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700 mt-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-tight">
                        <Sparkles className="w-4 h-4 text-orange-500" /> Objectives
                      </h4>
                      <p className="text-sm text-gray-600 bg-white p-4 rounded-2xl border border-gray-100 whitespace-pre-wrap">{lessonPlanResult.objectives}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-tight">
                        <TrendingUp className="w-4 h-4 text-orange-500" /> Warm Up
                      </h4>
                      <p className="text-sm text-gray-600 bg-white p-4 rounded-2xl border border-gray-100 whitespace-pre-wrap">{lessonPlanResult.warmUp}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-tight">
                        <BookOpen className="w-4 h-4 text-orange-500" /> Main Activity
                      </h4>
                      <div className="text-sm text-gray-700 bg-orange-50/50 p-5 rounded-3xl border border-orange-100 leading-relaxed whitespace-pre-wrap">
                        {lessonPlanResult.mainActivity}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Assessment</h4>
                        <p className="text-sm text-gray-700">{lessonPlanResult.assessment}</p>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-gray-50">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Homework</h4>
                        <p className="text-sm text-gray-700">{lessonPlanResult.homework}</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 text-white p-5 rounded-3xl space-y-2 shadow-xl">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3 h-3 text-orange-500" /> Teacher Notes
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-medium">{lessonPlanResult.teacherNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ──── MODALS ──── */}

      {/* Review Assignment Modal */}
      {modal === "review" && activeAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-gray-900">{t.reviewAssignment}</h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>

              {successMsg ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-lg font-bold text-green-700">{successMsg}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-bold text-gray-700 mb-1">{activeAssignment.title}</p>
                    <p className="text-xs text-gray-500 mb-3">{activeAssignment.studentName} · {activeAssignment.subject}</p>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">{t.studentWork}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.grade} (0–100) *</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 85"
                      value={gradeValue}
                      onChange={e => setGradeValue(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.feedbackForStudent}</label>
                    <textarea
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 min-h-[100px] text-sm focus:outline-none focus:border-purple-400 focus:bg-white transition-all resize-none"
                      placeholder={t.enterFeedback}
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold disabled:opacity-60"
                      onClick={handleSubmitGrade}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : t.submitGrade}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={closeModal}>{t.cancel}</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* View Profile Modal */}
      {modal === "profile" && activeStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-gray-900">{t.viewProfile}</h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
                  {activeStudent.avatar}
                </div>
                <h3 className="text-xl font-black text-gray-900">{activeStudent.name}</h3>
                <p className="text-gray-500">{activeStudent.class}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Average Grade", value: `${activeStudent.averageGrade}%`, color: "purple" },
                  { label: "Completion Rate", value: `${activeStudent.completionRate}%`, color: "green" },
                  { label: "Assignments Done", value: activeStudent.assignmentsCompleted, color: "blue" },
                  { label: "Streak", value: `${activeStudent.streak} days`, color: "orange" },
                ].map(s => (
                  <div key={s.label} className={`bg-${s.color}-50 rounded-xl p-3 text-center`}>
                    <div className={`text-2xl font-black text-${s.color}-700`}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-purple-600">{activeStudent.completionRate}%</span>
                  </div>
                  <Progress value={activeStudent.completionRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Average Grade</span>
                    <span className="font-bold text-green-600">{activeStudent.averageGrade}%</span>
                  </div>
                  <Progress value={activeStudent.averageGrade} className="h-2" />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-sm" onClick={() => { closeModal(); openFeedback(activeStudent); }}>
                  <MessageSquare className="w-4 h-4 mr-1.5" /> Send Feedback
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl text-sm" onClick={() => { closeModal(); openContact(activeStudent); }}>
                  <Phone className="w-4 h-4 mr-1.5" /> Contact
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Feedback Modal */}
      {modal === "feedback" && activeStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Send Feedback</h2>
                  <p className="text-sm text-gray-500">To: {activeStudent.name}</p>
                </div>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              </div>

              {successMsg ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-lg font-bold text-green-700">{successMsg}</p>
                </div>
              ) : (
                <>
                  <textarea
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 min-h-[140px] text-sm focus:outline-none focus:border-purple-400 focus:bg-white transition-all resize-none mb-4"
                    placeholder="Write constructive feedback for the student..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold"
                      onClick={handleSendFeedback}
                      disabled={submitting}
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      {submitting ? "Sending..." : "Send Feedback"}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={closeModal}>{t.cancel}</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Contact Modal */}
      {modal === "contact" && activeStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Contact Student</h2>
                  <p className="text-sm text-gray-500">Message: {activeStudent.firstName} {activeStudent.lastName}</p>
                </div>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              </div>

              {successMsg ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📨</div>
                  <p className="text-lg font-bold text-green-700">{successMsg}</p>
                </div>
              ) : (
                <>
                  <textarea
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 min-h-[140px] text-sm focus:outline-none focus:border-purple-400 focus:bg-white transition-all resize-none mb-4"
                    placeholder="Write a message to the student or their parents..."
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold"
                      onClick={handleSendMessage}
                      disabled={submitting}
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={closeModal}>{t.cancel}</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Add/Edit Course Modal (View Only for Teachers now, but keeping modal structure if needed later, though usually they shouldn't edit) */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{editingCourse?.title}</h2>
                <Button variant="outline" onClick={() => setIsCourseModalOpen(false)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setIsCourseModalOpen(false);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t.courseTitle}</label>
                    <Input name="title" defaultValue={editingCourse?.title} disabled className="rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t.category}</label>
                      <Select name="category" defaultValue={editingCourse?.category || "Math"} disabled>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t.level}</label>
                      <Select name="level" defaultValue={editingCourse?.level || "Beginner"} disabled>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">{t.beginner}</SelectItem>
                          <SelectItem value="Intermediate">{t.intermediate}</SelectItem>
                          <SelectItem value="Advanced">{t.advanced}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t.description}</label>
                    <textarea
                      name="description"
                      defaultValue={editingCourse?.description}
                      disabled
                      className="w-full border-2 border-gray-100 rounded-xl p-3 min-h-[100px] text-sm focus:outline-none transition-all resize-none bg-gray-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t.ageRange}</label>
                      <Input name="ageRange" defaultValue={editingCourse?.targetAgeGroup || editingCourse?.ageRange || "6-8"} disabled className="rounded-xl bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t.emoji}</label>
                      <Input name="image" defaultValue={editingCourse?.imageUrl || editingCourse?.image || "🔢"} disabled className="rounded-xl bg-gray-50" />
                    </div>
                  </div>

                  {/* Inline Materials Management */}
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-purple-600" /> {t.courseMaterials}
                    </h3>

                    {editingCourse ? (
                      <div className="space-y-3">
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                          {courses.find(c => c.id === editingCourse.id)?.materials?.map((mat: any) => (
                            <div key={mat.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl group hover:border-purple-200">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">{mat.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-500 italic">No materials.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)} className="rounded-xl w-full">
                    {t.close}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Manage Materials Modal */}
      {isMaterialsModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-900">{t.materials}</h2>
                <p className="text-xs text-gray-500">{selectedCourse.title}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsMaterialsModalOpen(false)} className="rounded-full">
                {t.close}
              </Button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Removed upload section for teachers */}

              <div className="space-y-2">
                {uploadingMaterial ? (
                  <div className="py-8 text-center text-gray-400 italic">Loading materials...</div>
                ) : courseMaterials.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 italic">No materials uploaded yet.</div>
                ) : (
                  courseMaterials.map((mat) => (
                    <div key={mat.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                          <FileText className="w-4 h-4 text-gray-50" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{mat.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{mat.type || 'DOCUMENT'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* AI Exam button removed for teachers */}
                        {/* Delete button removed for teachers */}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}