import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play, BookOpen, FileQuestion, Gamepad2, Menu, X, ArrowLeft, Lock, FileText } from "lucide-react";
import { courseService, lessonService, userService, lessonQuestionService } from "../api/services";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";

function LessonSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="aspect-video bg-gray-200 rounded-2xl" />
    </div>
  );
}

export function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [lessonQuestionsMap, setLessonQuestionsMap] = useState<Record<number, any[]>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [pendingAction, setPendingAction] = useState<'next' | 'finish' | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!courseId) return;
        const [courseData, lessonsData] = await Promise.all([
          courseService.getById(parseInt(courseId)),
          lessonService.getByCourse(parseInt(courseId))
        ]);

        // Normalize course data
        const normalizedCourse = courseData ? {
          ...courseData,
          id: (courseData as any).id ?? (courseData as any).Id,
          title: (courseData as any).title ?? (courseData as any).Title,
          imageUrl: (courseData as any).imageUrl ?? (courseData as any).ImageUrl ?? (courseData as any).image ?? (courseData as any).Image
        } : null;

        setCourse(normalizedCourse);

        // Normalize lessons data
        const normalizedLessons = (lessonsData || []).map((l: any) => {
          const rawType = (l.type ?? l.Type ?? '').toLowerCase().trim();
          const videoUrl = l.videoUrl ?? l.VideoUrl ?? '';
          const contentUrl = l.contentUrl ?? l.ContentUrl ?? l.url ?? l.Url ?? videoUrl ?? '';
          const content = l.content ?? l.Content ?? '';

          // Smart type detection: use explicit type if set, otherwise infer from URL
          let resolvedType = rawType;
          if (!resolvedType) {
            const url = contentUrl.toLowerCase();
            if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/)) resolvedType = 'video';
            else if (url.match(/\.(mp3|wav|ogg|aac|m4a)(\?.*)?$/)) resolvedType = 'audio';
            else if (url.match(/\.pdf(\?.*)?$/)) resolvedType = 'pdf';
            else if (url.match(/\.(doc|docx)(\?.*)?$/)) resolvedType = 'document';
            else if (videoUrl) resolvedType = 'video';
            else if (content) resolvedType = 'reading';
            else resolvedType = 'video';
          }

          return {
            ...l,
            id: l.id ?? l.Id,
            title: l.title ?? l.Title,
            description: l.description ?? l.Description ?? content,
            type: resolvedType,
            contentUrl: contentUrl,
            duration: l.duration ?? l.Duration,
            completed: l.completed ?? l.Completed
          };
        });


        setCourseLessons(normalizedLessons);

        // Load questions for all lessons
        const qMap: Record<number, any[]> = {};
        await Promise.all(normalizedLessons.map(async (l: any) => {
          try {
            const qs = await lessonQuestionService.getByLesson(l.id);
            qMap[l.id] = (qs || []).map((q: any) => ({
              ...q,
              options: JSON.parse(q.optionsJson || '[]')
            }));
          } catch { qMap[l.id] = []; }
        }));
        setLessonQuestionsMap(qMap);

        if (lessonId && normalizedLessons.length > 0) {
          const idx = normalizedLessons.findIndex((l: any) => l.id === parseInt(lessonId));
          if (idx !== -1) setCurrentLessonIndex(idx);
        }
      } catch (error) {
        console.error("Failed to load lesson data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <LessonSkeleton />
      </div>
    );
  }

  const currentLesson = courseLessons[currentLessonIndex];

  if (!course) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-xl font-bold text-gray-700 mb-2">Course not found</p>
        <p className="text-gray-500 mb-6">This course may have been removed or doesn't exist.</p>
        <Link to="/courses">
          <Button className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToCourses}
          </Button>
        </Link>
      </div>
    );
  }

  // Handle courses with zero lessons gracefully
  if (courseLessons.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 flex-1">
            <Link to="/courses" className="hover:text-purple-600 transition-colors flex items-center gap-1 shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backToCourses}</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-gray-900 font-semibold truncate">{course.title}</span>
          </div>
        </div>
        <Card className="text-center py-20 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4 text-gray-300">📚</div>
          <p className="text-xl font-bold text-gray-700 mb-2">No content available yet</p>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">This course doesn't have any lessons or materials added to it yet. Check back later!</p>
        </Card>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-xl font-bold text-gray-700 mb-2">Lesson not found</p>
        <p className="text-gray-500 mb-6">This lesson may have been removed or doesn't exist.</p>
        <Link to="/courses">
          <Button className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToCourses}
          </Button>
        </Link>
      </div>
    );
  }

  const progress = courseLessons.length > 0
    ? ((currentLessonIndex + 1) / courseLessons.length) * 100
    : 0;

  const xpPerLesson = Math.floor(100 / (courseLessons.length || 1));
  const totalXp = currentLessonIndex * xpPerLesson + (currentLesson.completed ? xpPerLesson : 0) + earnedXp;

  // Check if a specific lesson index should be locked
  const isLessonLocked = (index: number) => {
    if (index === 0) return false;
    // Locked if the previous lesson is not completed
    // Bypass lock for easier testing of different material types
    if (localStorage.getItem('bypassLocks') === 'true') return false;
    return !courseLessons[index - 1]?.completed;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video": return Play;
      case "interactive": return Gamepad2;
      case "quiz": return FileQuestion;
      case "reading": return BookOpen;
      case "listening": return BookOpen;
      case "audio": return Play;
      case "pdf":
      case "document":
      case "doc": return FileText;
      default: return Play;
    }
  };

  const lessonTypeColors: Record<string, string> = {
    video: "text-purple-600 bg-purple-50",
    interactive: "text-blue-600 bg-blue-50",
    quiz: "text-amber-600 bg-amber-50",
    reading: "text-emerald-600 bg-emerald-50",
    listening: "text-blue-600 bg-blue-50",
    audio: "text-indigo-600 bg-indigo-50",
    pdf: "text-red-600 bg-red-50",
    document: "text-blue-600 bg-blue-50",
    doc: "text-blue-600 bg-blue-50",
    default: "text-gray-600 bg-gray-100",
  };

  const currentLessonQuestions = currentLesson ? (lessonQuestionsMap[currentLesson.id] || []) : [];

  const completeAndAdvance = async (action: 'next' | 'finish') => {
    try {
      if (!currentLesson.completed) {
        setCompleting(true);
        await userService.completeLesson({ lessonId: currentLesson.id });
        const newLessons = [...courseLessons];
        newLessons[currentLessonIndex].completed = true;
        setCourseLessons(newLessons);
        setEarnedXp(prev => prev + xpPerLesson);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete", err);
    } finally {
      setCompleting(false);
    }
    if (action === 'finish') {
      setShowCompletionMessage(true);
    } else {
      if (currentLessonIndex < courseLessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleNext = () => {
    if (currentLessonQuestions.length > 0 && !currentLesson.completed) {
      // Show quiz first
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizPassed(false);
      setPendingAction('next');
      setShowQuiz(true);
    } else {
      completeAndAdvance('next');
    }
  };

  const handleFinishCourse = () => {
    if (currentLessonQuestions.length > 0 && !currentLesson.completed) {
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizPassed(false);
      setPendingAction('finish');
      setShowQuiz(true);
    } else {
      completeAndAdvance('finish');
    }
  };

  const handleQuizSubmit = () => {
    const allCorrect = currentLessonQuestions.every(q => quizAnswers[q.id] === q.correctAnswer);
    setQuizSubmitted(true);
    setQuizPassed(allCorrect);
    if (allCorrect && pendingAction) {
      // Short delay to show the "Correct!" state before advancing
      setTimeout(() => {
        setShowQuiz(false);
        completeAndAdvance(pendingAction);
        setPendingAction(null);
      }, 1200);
    }
  };



  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const LessonTypeIcon = getLessonIcon(currentLesson.type);
  const typeColor = lessonTypeColors[currentLesson.type] || lessonTypeColors.default;

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-3 sm:px-4 md:px-6">
      {/* Breadcrumb + Mobile Sidebar Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 flex-1">
          <Link to="/courses" className="hover:text-purple-600 transition-colors flex items-center gap-1 shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.backToCourses}</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <span className="shrink-0">/</span>
          <span className="text-gray-900 font-semibold truncate">{course.title}</span>
          <span className="shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold text-xs flex items-center gap-1 whitespace-nowrap">
            🏆 {totalXp} XP
          </span>
        </div>

        {/* Mobile lesson list toggle */}
        <button
          className="md:hidden flex items-center gap-1.5 bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {currentLessonIndex + 1}/{courseLessons.length}
        </button>
      </div>

      {/* Course Progress Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-4 md:p-6 text-white shadow-md">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-black mb-0.5 truncate">{course.title}</h1>
            <p className="text-white/80 text-sm">
              {t.lesson} {currentLessonIndex + 1} {t.of} {courseLessons.length}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl md:text-3xl font-black">{Math.round(progress)}%</div>
            <div className="text-xs text-white/80">{t.complete}</div>
          </div>
        </div>
        <Progress value={progress} className="h-2.5 bg-white/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lesson Sidebar — mobile overlay, desktop always visible */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className={`${sidebarOpen
          ? 'fixed top-16 left-0 right-0 z-50 px-3 pb-4 md:static md:px-0 md:pb-0 md:z-auto'
          : 'hidden md:block'
          } md:col-span-1`}>
          <Card className="p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-gray-900">{t.courseLessons}</h2>
              <button
                className="md:hidden p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {courseLessons.map((lesson, index) => {
                const LessonIcon = getLessonIcon(lesson.type);
                const isActive = index === currentLessonIndex;
                const locked = isLessonLocked(index);

                return (
                  <button
                    key={lesson.id}
                    disabled={locked}
                    onClick={() => { setCurrentLessonIndex(index); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${locked ? "opacity-50 cursor-not-allowed bg-gray-50" :
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : lesson.completed
                          ? "bg-emerald-50 hover:bg-emerald-100"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                  >
                    {locked ? (
                      <Lock className="w-5 h-5 shrink-0 text-gray-400" />
                    ) : lesson.completed ? (
                      <CheckCircle className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
                    ) : (
                      <Circle className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-gray-300"}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isActive ? "text-white" : locked ? "text-gray-500" : "text-gray-900"}`}>
                        {lesson.title}
                      </div>
                      <div className={`text-xs flex items-center gap-1.5 mt-0.5 ${isActive ? "text-white/80" : "text-gray-400"}`}>
                        <LessonIcon className="w-3 h-3" />
                        <span className="capitalize">{lesson.type}</span>
                        {lesson.duration && <><span>·</span><span>{lesson.duration}</span></>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Lesson Content */}
        <div className="md:col-span-2 space-y-4 min-w-0">
          {/* Video/Content Area */}
          <Card className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm w-full">
            <div className={`bg-gradient-to-br from-gray-900 to-gray-800 w-full relative ${['pdf', 'document', 'doc'].includes(currentLesson.type)
              ? 'h-[75vh]'
              : currentLesson.type === 'audio'
                ? 'h-64 sm:h-72'
                : 'aspect-video'
              } flex items-center justify-center`}>

              {currentLesson.type === "video" && (
                (() => {
                  const videoSrc = currentLesson.contentUrl || currentLesson.videoUrl || currentLesson.VideoUrl;
                  return videoSrc ? (
                    <video
                      controls
                      playsInline
                      src={videoSrc}
                      className="absolute inset-0 w-full h-full object-contain bg-black"
                      poster={course.imageUrl || course.image}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="relative z-10 text-center px-6">
                      <img src={course.imageUrl || course.image || "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80"} alt={currentLesson.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                      <div className="relative z-10 text-center">
                        <p className="text-white font-bold text-lg">{currentLesson.title}</p>
                        <p className="text-gray-300 text-sm mt-2">No video URL configured. Edit this step in Admin → Courses → Steps.</p>
                      </div>
                    </div>
                  );
                })()
              )}

              {currentLesson.type === "interactive" && (
                <div className="text-center p-8">
                  <Gamepad2 className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                  <p className="text-white text-xl font-bold">Interactive Activity</p>
                  <p className="text-gray-300 mt-1 text-sm">Click "Start Activity" to begin!</p>
                </div>
              )}
              {currentLesson.type === "quiz" && (
                <div className="text-center p-8">
                  <FileQuestion className="w-16 h-16 text-amber-400 mx-auto mb-3" />
                  <p className="text-white text-xl font-bold">Quiz Time! 🎯</p>
                  <p className="text-gray-300 mt-1 text-sm">Test your knowledge</p>
                </div>
              )}
              {currentLesson.type === "reading" && (
                <div className="text-center p-8">
                  <BookOpen className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                  <p className="text-white text-xl font-bold">Reading Exercise 📖</p>
                  <p className="text-gray-300 mt-1 text-sm">Let's read together!</p>
                </div>
              )}
              {currentLesson.type === "listening" && (
                <div className="text-center p-8">
                  <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                  <p className="text-white text-xl font-bold">Listening Activity 🎧</p>
                  <p className="text-gray-300 mt-1 text-sm">Listen carefully and learn!</p>
                </div>
              )}
              {currentLesson.type === "audio" && (
                <div className="flex flex-col items-center justify-center w-full h-full px-6 py-8 gap-5">
                  <div className="text-5xl">🎵</div>
                  <p className="text-white text-lg font-bold text-center">{currentLesson.title}</p>
                  {currentLesson.contentUrl ? (
                    <audio
                      controls
                      src={currentLesson.contentUrl}
                      className="w-full max-w-xl"
                      style={{ height: '54px' }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p className="text-gray-400 text-sm">Audio content not available.</p>
                  )}
                </div>
              )}
              {["pdf", "document", "doc"].includes(currentLesson.type) && (
                currentLesson.contentUrl ? (
                  <iframe
                    src={currentLesson.type === 'doc'
                      ? `https://docs.google.com/gview?url=${currentLesson.contentUrl}&embedded=true`
                      : currentLesson.contentUrl}
                    className="absolute inset-0 w-full h-full border-0 bg-white"
                    title="Document Viewer"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-8 text-white">
                    <FileText className="w-16 h-16 text-red-400 mx-auto mb-3" />
                    <p className="text-xl font-bold">Document not found</p>
                    <p className="text-gray-400 mt-1 text-sm">Please check if the material was properly linked.</p>
                  </div>
                )
              )}
              {/* Catch-all fallback if type is unknown but expected to be video or something else */}
              {!["video", "interactive", "quiz", "reading", "pdf", "document", "listening"].includes(currentLesson.type) && (
                <div className="text-center p-8">
                  <Play className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-white text-xl font-bold">{currentLesson.title}</p>
                  <p className="text-gray-400 mt-1 text-sm text-wrap">Lesson type: {currentLesson.type || 'undefined'}</p>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6">
              {/* Lesson Type Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${typeColor} mb-3`}>
                <LessonTypeIcon className="w-3.5 h-3.5" />
                {currentLesson.type || "video"} lesson
              </div>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                {currentLesson.title}
              </h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6">
                {currentLesson.description || `This is a ${currentLesson.type} lesson that will help you master the concepts. Take your time and enjoy the learning experience!`}
              </p>

              {showCompletionMessage && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl shadow border border-emerald-300">
                  <h3 className="font-black text-lg flex items-center gap-2">🎉 Congratulations!</h3>
                  <p className="text-sm font-medium">You reached 85 XP and successfully completed this course! We've awarded you a bonus! Keep up the great work.</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  onClick={handlePrevious}
                  disabled={currentLessonIndex === 0}
                  variant="outline"
                  className="rounded-xl border-gray-200 hover:border-purple-300 disabled:opacity-40 flex-1 sm:flex-none"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{t.previous}</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                {/* Last lesson: show Complete Course button */}
                {currentLessonIndex === courseLessons.length - 1 ? (
                  showCompletionMessage ? (
                    <Link to="/courses" className="flex-1 sm:flex-none">
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl px-4 sm:px-8 text-white font-bold shadow-md">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Back to Courses
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={handleFinishCourse}
                      disabled={completing}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-xl px-4 sm:px-8 text-white font-bold shadow-md"
                    >
                      {completing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-1.5" /> Complete Course 🎉</>
                      )}
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={completing}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-4 sm:px-8 text-white font-bold shadow-md flex-1 sm:flex-none"
                  >
                    {completing ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">{t.next}</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>

            </div>
          </Card>

          {/* Fun Facts */}
          <Card className="p-4 md:p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-black text-gray-900 mb-1">{t.didYouKnow}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{t.greatJob}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quiz Modal Overlay */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`p-5 rounded-t-3xl text-white ${quizSubmitted && quizPassed ? 'bg-gradient-to-r from-emerald-500 to-green-500' : quizSubmitted ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'}`}>
              <div className="text-center">
                {quizSubmitted ? (
                  quizPassed ? (
                    <><div className="text-4xl mb-1">🎉</div><h2 className="text-xl font-black">All Correct! Well done!</h2><p className="text-white/80 text-sm mt-1">+{xpPerLesson} XP earned. Moving to next step...</p></>
                  ) : (
                    <><div className="text-4xl mb-1">❌</div><h2 className="text-xl font-black">Some answers were wrong</h2><p className="text-white/80 text-sm mt-1">Review the correct answers below and try again.</p></>
                  )
                ) : (
                  <>
                    <div className="text-4xl mb-1">📝</div>
                    <h2 className="text-xl font-black">Step Quiz</h2>
                    <p className="text-white/80 text-sm mt-1">Answer all questions correctly to proceed to the next step.</p>
                    <p className="text-white/60 text-xs mt-1">{currentLessonQuestions.length} question{currentLessonQuestions.length !== 1 ? 's' : ''}</p>
                  </>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="p-5 space-y-6">
              {currentLessonQuestions.map((q, qi) => {
                const answered = quizAnswers[q.id];
                const isCorrect = answered === q.correctAnswer;
                return (
                  <div key={q.id}>
                    <p className="font-bold text-gray-900 mb-3 text-sm">Q{qi + 1}. {q.questionText}</p>
                    <div className="space-y-2">
                      {q.options.map((opt: string, oi: number) => {
                        let cls = "w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ";
                        if (!quizSubmitted) {
                          cls += answered === opt
                            ? "border-purple-500 bg-purple-50 text-purple-800"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-gray-700";
                        } else {
                          if (opt === q.correctAnswer) cls += "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                          else if (answered === opt && !isCorrect) cls += "border-red-400 bg-red-50 text-red-700 line-through";
                          else cls += "border-gray-100 bg-gray-50 text-gray-400";
                        }
                        return (
                          <button key={oi} disabled={quizSubmitted} className={cls}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                            {quizSubmitted && opt === q.correctAnswer && <span className="float-right text-emerald-600">✓</span>}
                            {quizSubmitted && answered === opt && !isCorrect && <span className="float-right text-red-500">✗</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="p-5 pt-0 flex gap-3">
              {!quizSubmitted ? (
                <>
                  <Button variant="outline" className="rounded-xl border-gray-200" onClick={() => setShowQuiz(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold"
                    disabled={Object.keys(quizAnswers).length < currentLessonQuestions.length}
                    onClick={handleQuizSubmit}
                  >
                    Submit Answers
                  </Button>
                </>
              ) : !quizPassed ? (
                <>
                  <Button variant="outline" className="rounded-xl border-gray-200 flex-1" onClick={() => setShowQuiz(false)}>
                    Back to Lesson
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold"
                    onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false); }}
                  >
                    Try Again 🔄
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}