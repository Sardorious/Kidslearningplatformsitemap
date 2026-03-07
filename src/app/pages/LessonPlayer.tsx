import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play, BookOpen, FileQuestion, Gamepad2, Menu, X, ArrowLeft, Lock, FileText } from "lucide-react";
import { courseService, lessonService, userService } from "../api/services";
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
        const normalizedLessons = (lessonsData || []).map((l: any) => ({
          ...l,
          id: l.id ?? l.Id,
          title: l.title ?? l.Title,
          description: l.description ?? l.Description,
          type: (l.type ?? l.Type ?? "video").toLowerCase(),
          contentUrl: l.contentUrl ?? l.ContentUrl ?? l.url ?? l.Url,
          duration: l.duration ?? l.Duration,
          completed: l.completed ?? l.Completed
        }));

        setCourseLessons(normalizedLessons);

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

  if (!course || !currentLesson) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-xl font-bold text-gray-700 mb-2">Course or lesson not found</p>
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
    return !courseLessons[index - 1]?.completed;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video": return Play;
      case "interactive": return Gamepad2;
      case "quiz": return FileQuestion;
      case "reading": return BookOpen;
      case "listening": return BookOpen;
      case "pdf":
      case "document": return FileText;
      default: return Play;
    }
  };

  const lessonTypeColors: Record<string, string> = {
    video: "text-purple-600 bg-purple-50",
    interactive: "text-blue-600 bg-blue-50",
    quiz: "text-amber-600 bg-amber-50",
    reading: "text-emerald-600 bg-emerald-50",
    listening: "text-blue-600 bg-blue-50",
    pdf: "text-red-600 bg-red-50",
    document: "text-blue-600 bg-blue-50",
    default: "text-gray-600 bg-gray-100",
  };

  const handleNext = async () => {
    try {
      if (!currentLesson.completed) {
        setCompleting(true);
        await userService.completeLesson({ lessonId: currentLesson.id });
        const newLessons = [...courseLessons];
        newLessons[currentLessonIndex].completed = true;
        setCourseLessons(newLessons);

        let newXp = earnedXp + xpPerLesson;
        const potentialTotal = (currentLessonIndex + 1) * xpPerLesson + newXp;

        // Give bonus completion XP if reaching threshold
        if (potentialTotal >= 85 && !showCompletionMessage) {
          newXp += potentialTotal; // Bonus equal to current xp
          setShowCompletionMessage(true);
        }
        setEarnedXp(newXp);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete", err);
    } finally {
      setCompleting(false);
    }

    if (currentLessonIndex < courseLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Breadcrumb + Mobile Sidebar Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/courses" className="hover:text-purple-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.backToCourses}</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[160px] sm:max-w-xs">{course.title}</span>
          <span className="ml-4 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold text-xs flex items-center gap-1">
            🏆 {totalXp} XP Minimum 100 XP
          </span>
        </div>

        {/* Mobile lesson list toggle */}
        <button
          className="lg:hidden flex items-center gap-2 bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          Lessons ({currentLessonIndex + 1}/{courseLessons.length})
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lesson Sidebar — mobile collapsible, desktop always visible */}
        <div className={`${sidebarOpen ? "block" : "hidden"} lg:block lg:col-span-1`}>
          <Card className="p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-base font-black text-gray-900 mb-3">{t.courseLessons}</h2>
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
                        <span>{lesson.type}</span>
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
        <div className="lg:col-span-2 space-y-4">
          {/* Video/Content Area */}
          <Card className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <div className={`bg-gradient-to-br from-gray-900 to-gray-800 ${(currentLesson.type === 'pdf' || currentLesson.type === 'document') ? 'h-[600px]' : 'aspect-video'} flex items-center justify-center relative`}>
              {currentLesson.type === "video" && (
                currentLesson.contentUrl ? (
                  <video
                    controls
                    playsInline
                    src={currentLesson.contentUrl}
                    className="w-full h-full object-contain"
                    poster={course.imageUrl || course.image}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <>
                    <img src={course.imageUrl || course.image || "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80"} alt={currentLesson.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <button className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-2xl">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-purple-600 ml-1 fill-purple-600" />
                    </button>
                  </>
                )
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
              {(currentLesson.type === "pdf" || currentLesson.type === "document") && (
                currentLesson.contentUrl ? (
                  <iframe
                    src={currentLesson.contentUrl}
                    className="w-full h-full border-0 rounded-b-2xl bg-white"
                    title="Document Viewer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

                <Button
                  onClick={handleNext}
                  disabled={completing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-4 sm:px-8 text-white font-bold shadow-md flex-1 sm:flex-none"
                >
                  {currentLesson.completed ? (
                    <><CheckCircle className="w-4 h-4 mr-1.5" /> {t.completed || "Completed"}</>
                  ) : currentLesson.type === "video" ? (
                    <><Play className="w-4 h-4 mr-1.5 fill-white" /> {t.watchNow}</>
                  ) : (
                    <><Gamepad2 className="w-4 h-4 mr-1.5" /> {t.startActivity}</>
                  )}
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={completing || currentLessonIndex === courseLessons.length - 1}
                  variant="outline"
                  className="rounded-xl border-gray-200 hover:border-purple-300 disabled:opacity-40 flex-1 sm:flex-none"
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
    </div>
  );
}