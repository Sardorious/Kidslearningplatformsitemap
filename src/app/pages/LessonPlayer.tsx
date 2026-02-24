import { useState } from "react";
import { useParams, Link } from "react-router";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play, BookOpen, FileQuestion, Gamepad2 } from "lucide-react";
import { courses, lessons } from "../data/mockData";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";

export function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(parseInt(lessonId || "1") - 1);
  const { t } = useLanguage();

  const course = courses.find(c => c.id === courseId);
  const courseLessons = lessons[courseId as keyof typeof lessons] || [];
  const currentLesson = courseLessons[currentLessonIndex];

  if (!course || !currentLesson) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Course or lesson not found</p>
        <Link to="/courses">
          <Button className="mt-4 rounded-full">{t.backToCourses}</Button>
        </Link>
      </div>
    );
  }

  const progress = ((currentLessonIndex + 1) / courseLessons.length) * 100;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video": return Play;
      case "interactive": return Gamepad2;
      case "quiz": return FileQuestion;
      case "reading": return BookOpen;
      default: return Play;
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < courseLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/courses" className="hover:text-purple-600">{t.courses}</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{course.title}</span>
      </div>

      {/* Course Progress */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black mb-1">{course.title}</h1>
            <p className="opacity-90">{t.lesson} {currentLessonIndex + 1} {t.of} {courseLessons.length}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{Math.round(progress)}%</div>
            <div className="text-sm opacity-90">{t.complete}</div>
          </div>
        </div>
        <Progress value={progress} className="h-3 bg-white/20" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson List */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-black text-gray-900 mb-4">{t.courseLessons}</h2>
          <div className="space-y-2">
            {courseLessons.map((lesson, index) => {
              const LessonIcon = getLessonIcon(lesson.type);
              const isActive = index === currentLessonIndex;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : lesson.completed
                      ? "bg-green-50 hover:bg-green-100"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                  ) : (
                    <Circle className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-900"}`}>
                      {lesson.title}
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${isActive ? "text-white/80" : "text-gray-500"}`}>
                      <LessonIcon className="w-3 h-3" />
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video/Content Area */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 aspect-video flex items-center justify-center relative">
              {currentLesson.type === "video" && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all">
                      <Play className="w-10 h-10 text-purple-600 ml-1" />
                    </button>
                  </div>
                  <img
                    src={course.image}
                    alt={currentLesson.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                </>
              )}
              {currentLesson.type === "interactive" && (
                <div className="text-center p-8">
                  <Gamepad2 className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                  <p className="text-white text-xl font-semibold">Interactive Activity</p>
                  <p className="text-gray-300 mt-2">Click "Start Activity" to begin!</p>
                </div>
              )}
              {currentLesson.type === "quiz" && (
                <div className="text-center p-8">
                  <FileQuestion className="w-20 h-20 text-blue-400 mx-auto mb-4" />
                  <p className="text-white text-xl font-semibold">Quiz Time!</p>
                  <p className="text-gray-300 mt-2">Test your knowledge</p>
                </div>
              )}
              {currentLesson.type === "reading" && (
                <div className="text-center p-8">
                  <BookOpen className="w-20 h-20 text-green-400 mx-auto mb-4" />
                  <p className="text-white text-xl font-semibold">Reading Exercise</p>
                  <p className="text-gray-300 mt-2">Let's read together!</p>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                {getLessonIcon(currentLesson.type)({
                  className: "w-5 h-5 text-purple-600"
                })}
                <span className="text-sm font-semibold text-purple-600 uppercase">
                  {currentLesson.type}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">
                {currentLesson.title}
              </h2>
              <p className="text-gray-600 mb-6">
                This is a {currentLesson.type} lesson that will help you master the concepts. 
                Take your time and enjoy the learning experience!
              </p>

              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePrevious}
                  disabled={currentLessonIndex === 0}
                  variant="outline"
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {t.previous}
                </Button>

                {currentLesson.type === "video" ? (
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-8">
                    <Play className="w-4 h-4 mr-2" />
                    {t.watchNow}
                  </Button>
                ) : (
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-8">
                    {t.startActivity}
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={currentLessonIndex === courseLessons.length - 1}
                  variant="outline"
                  className="rounded-xl"
                >
                  {t.next}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Fun Facts */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-black text-gray-900 mb-2">{t.didYouKnow}</h3>
                <p className="text-gray-700">
                  {t.greatJob}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}