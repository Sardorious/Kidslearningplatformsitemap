import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Trophy, Flame, Star, TrendingUp, BookOpen, Clock, Target, Award } from "lucide-react";
import { studentProgress } from "../data/mockData";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import { userService, courseService } from "../api/services";

function StudentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, progData, coursesData] = await Promise.all([
          userService.getProfile(),
          userService.getProgress(),
          courseService.getAll()
        ]);
        setProfile(profData);
        setProgress(progData || []);
        setCourses(coursesData ? coursesData.slice(0, 3) : []);
      } catch (error) {
        console.error("Failed to load student dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <StudentSkeleton />;

  const completedLessonsCount = progress.filter((p: any) => p.isCompleted).length;
  const displayProfile = {
    ...studentProgress,
    name: profile?.name || studentProgress.name,
    points: profile?.xp || studentProgress.points,
    completedLessons: completedLessonsCount,
  };

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-2xl overflow-hidden relative">
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative">
          {/* Avatar removed as per user request */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black mb-0.5">{displayProfile.name}</h1>
            <p className="opacity-90 mb-3 text-sm">{displayProfile.grade} · {t.learningChampion} 🏆</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="font-bold text-sm">{displayProfile.streak} {t.dayStreak}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="font-bold text-sm">{displayProfile.points} XP</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="font-bold text-sm">{displayProfile.achievements.filter((a: any) => a.earned).length} Badges</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: t.activeCourses, value: courses.length, color: "blue" },
          { icon: Target, label: t.lessonsCompleted, value: completedLessonsCount, color: "green" },
          { icon: Clock, label: t.learningTime, value: "12.5h", color: "purple" },
          { icon: Star, label: t.averageScore, value: "92%", color: "yellow" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={`p-3 bg-gradient-to-br from-${s.color}-50 to-${s.color}-100 border-2 border-${s.color}-200 rounded-2xl`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 text-${s.color}-600`} />
                <TrendingUp className={`w-3 h-3 text-${s.color}-400`} />
              </div>
              <div className={`text-xl font-black text-${s.color}-900 mb-0.5`}>{s.value}</div>
              <div className={`text-[10px] uppercase tracking-wider font-bold text-${s.color}-700 opacity-80`}>{s.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4">{t.myCourses}</h2>
            {courses.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-2 border-gray-200 rounded-2xl">
                <div className="text-4xl mb-3">📚</div>
                <p className="font-bold text-gray-600 mb-3">No enrolled courses yet</p>
                <Link to="/courses">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">Browse Courses</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {courses.map((course: any) => {
                  const courseProgress = progress.filter((p: any) => p.courseId === course.id);
                  const completedCount = courseProgress.filter((p: any) => p.isCompleted).length;
                  const totalCount = course.lessonCount || 1;
                  const pct = Math.round((completedCount / totalCount) * 100);

                  return (
                    <Card key={course.id} className="p-4 hover:shadow-md transition-all rounded-2xl border border-gray-100 group">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 shrink-0">
                          <img
                            src={course.imageUrl || course.image || `https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=200`}
                            alt={course.title}
                            className="w-20 h-20 object-cover rounded-xl group-hover:scale-105 transition-transform"
                            onError={(e: any) => { e.target.src = `https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=200`; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-black text-gray-900 text-sm truncate">{course.title}</h3>
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold shrink-0">{pct}%</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{course.category || "General"}</p>
                          <Progress value={pct} className="h-1.5 mb-2" />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">{completedCount}/{totalCount} lessons</p>
                            <Link to={`/lesson/${course.id}/play`}>
                              <Button size="sm" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs h-7 px-3">
                                {t.continue} →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4">{t.recentActivity}</h2>
            <Card className="divide-y divide-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              {progress.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm italic">No recent activity yet. Start a lesson!</div>
              ) : (
                progress
                  .filter((p: any) => p.isCompleted)
                  .sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
                  .slice(0, 5)
                  .map((activity: any, index: number) => {
                    const course = courses.find(c => c.id === activity.courseId);
                    return (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{activity.lessonTitle || "Lesson Completed"}</p>
                          <p className="text-xs text-gray-500 truncate">{course?.title || "In enrolled course"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">{activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : 'Today'}</p>
                          <p className="text-xs text-gray-400">{activity.completedAt ? new Date(activity.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        </div>
                      </div>
                    );
                  })
              )}
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Achievements */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-3">{t.achievements}</h2>
            <Card className="p-4 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 1, title: "Math Whiz", icon: "🏆", condition: completedLessonsCount >= 5 },
                  { id: 2, title: "Reading Star", icon: "⭐", condition: profile?.xp >= 50 },
                  { id: 3, title: "Perfect Week", icon: "🎯", condition: profile?.xp >= 100 },
                  { id: 4, title: "Music Master", icon: "🎵", condition: profile?.xp >= 200 },
                  { id: 5, title: "Science Genius", icon: "🔬", condition: completedLessonsCount >= 10 },
                  { id: 6, title: "Art Creator", icon: "🎨", condition: completedLessonsCount >= 1 },
                ].map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${achievement.condition ? "bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-300 shadow-sm" : "bg-gray-100 opacity-40"}`}
                  >
                    <div className="text-2xl mb-0.5">{achievement.icon}</div>
                    <div className="text-xs text-center font-semibold text-gray-900 leading-tight">{achievement.title}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Daily Goal */}
          <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
            <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-green-600" /> {t.todaysGoal}
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-gray-600">{t.completeLessons}</span>
                  <span className="font-bold text-green-600">{Math.min(completedLessonsCount, 2)}/2</span>
                </div>
                <Progress value={Math.min(completedLessonsCount / 2 * 100, 100)} className="h-2 bg-green-100" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-gray-600">{t.minutesLearning}</span>
                  <span className="font-bold text-green-600">15/20</span>
                </div>
                <Progress value={75} className="h-2 bg-green-100" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">{t.almostThere} 💪</p>
          </Card>

          {/* Browse More Courses */}
          <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl text-center">
            <Award className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <h3 className="font-black text-gray-900 mb-1 text-sm">Discover More</h3>
            <p className="text-xs text-gray-500 mb-3">Find new courses to expand your skills</p>
            <Link to="/courses">
              <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-xs">
                Browse Courses →
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}