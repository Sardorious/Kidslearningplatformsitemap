import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BookOpen, Trophy, Clock, Star, Sparkles, ArrowRight, Flame, TrendingUp } from "lucide-react";
import { studentProgress, courses as mockCourses } from "../data/mockData";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import { userService, courseService } from "../api/services";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="h-10 bg-gray-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-gray-100 rounded-2xl p-4 animate-pulse h-24" />
  );
}

const statCards = [
  { key: "coursesInProgress", label: (t: any) => t.coursesInProgress, icon: BookOpen, from: "from-blue-500", to: "to-cyan-400", bg: "from-blue-50 to-cyan-50", text: "text-blue-700", border: "border-blue-100" },
  { key: "completedLessons", label: (t: any) => t.lessonsCompleted, icon: Trophy, from: "from-emerald-500", to: "to-green-400", bg: "from-emerald-50 to-green-50", text: "text-emerald-700", border: "border-emerald-100" },
  { key: "time", label: (t: any) => t.learningTime, icon: Clock, from: "from-amber-500", to: "to-yellow-400", bg: "from-amber-50 to-yellow-50", text: "text-amber-700", border: "border-amber-100", value: "12h" },
  { key: "achievements", label: (t: any) => t.achievements, icon: Star, from: "from-purple-500", to: "to-pink-400", bg: "from-purple-50 to-pink-50", text: "text-purple-700", border: "border-purple-100" },
];

export function Home() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, coursesData] = await Promise.all([
          userService.getProfile(),
          courseService.getAll()
        ]);
        setProfile(profData);
        setEnrolledCourses(coursesData ? coursesData.slice(0, 3) : []);
      } catch (error) {
        console.error("Failed to load home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayProfile = {
    ...studentProgress,
    name: profile?.name || studentProgress.name,
    points: profile?.xp || studentProgress.points,
    coursesInProgress: enrolledCourses.length
  };

  const statsValues: Record<string, any> = {
    coursesInProgress: displayProfile.coursesInProgress,
    completedLessons: displayProfile.completedLessons,
    time: "12h",
    achievements: displayProfile.achievements.filter((a: any) => a.earned).length,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-6 md:p-10 text-white shadow-xl overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-wider">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-black mb-2">
              {t.welcomeBack}, {displayProfile.name}! 🎉
            </h1>
            <p className="text-white/85 text-base md:text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-300" />
              {t.learningStreak.replace('{streak}', String(displayProfile.streak))}
            </p>
            <div className="mt-5">
              <Link to="/courses">
                <Button className="bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-xl px-6 py-2.5 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 min-w-[80px]">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-2xl font-black leading-none">{displayProfile.streak}</div>
              <div className="text-xs opacity-80 mt-1">{t.dayStreak}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 min-w-[80px]">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-2xl font-black leading-none">{displayProfile.points}</div>
              <div className="text-xs opacity-80 mt-1">{t.points}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className={`bg-gradient-to-br ${s.bg} rounded-2xl p-4 border ${s.border} group hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${s.text} opacity-70 mb-1`}>{s.label(t)}</p>
                    <p className={`text-3xl font-black ${s.text}`}>{statsValues[s.key]}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.from} ${s.to} shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Continue Learning */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            {t.continueLearning}
          </h2>
          <Link to="/courses">
            <Button variant="outline" className="rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 gap-1.5 text-sm">
              {t.browseAll} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-purple-200">
            <BookOpen className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-4">No courses yet. Start exploring!</p>
            <Link to="/courses">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden border border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group rounded-2xl"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={course.image || course.imageUrl || "https://images.unsplash.com/photo-1685358268305-c621b38e75d8?auto=format&fit=crop&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-purple-700">
                      {course.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-black text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{t.progress}</span>
                      <span className="font-bold text-purple-600">65%</span>
                    </div>
                    <Progress value={65} className="h-1.5" />
                  </div>

                  <Link to={`/lesson/${course.id}/play`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-sm font-bold transition-all hover:shadow-md">
                      {t.continueLearningBtn} →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recent Achievements */}
      <section>
        <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          {t.recentAchievements}
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {displayProfile.achievements.map((achievement: any) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl text-center transition-all border-2 ${achievement.earned
                  ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-300 shadow-sm hover:shadow-md hover:scale-105"
                  : "bg-gray-50 border-gray-100 opacity-40 grayscale"
                }`}
            >
              <div className="text-3xl mb-1.5">{achievement.icon}</div>
              <p className="text-xs font-semibold text-gray-900 leading-tight">{achievement.title}</p>
              {achievement.earned && (
                <div className="w-2 h-2 bg-amber-400 rounded-full mx-auto mt-2" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}