import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Trophy, Flame, Star, TrendingUp, BookOpen, Clock, Target, Award, Coins, Sparkles, MessageSquare, Globe, Edit } from "lucide-react";
import { studentProgress } from "../data/mockData";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import { Input } from "../components/ui/input";
import { userService, courseService, assignmentService } from "../api/services";

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
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittingAssignment, setSubmittingAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, progData, coursesData, leaderboardData, badgesData] = await Promise.all([
          userService.getProfile(),
          userService.getProgress(),
          courseService.getAll(),
          userService.getLeaderboard().catch(() => []),
          userService.getMyBadges().catch(() => []),
        ]);
        setProfile(profData);
        setProgress(progData || []);
        setCourses(coursesData ? coursesData.slice(0, 3) : []);
        setLeaderboard(leaderboardData || []);
        setBadges(badgesData || []);

        const allAssignments = [];
        if (coursesData && coursesData.length > 0) {
          for (const c of coursesData.slice(0, 3)) {
            const courseAssignments = await assignmentService.getByCourse(c.id).catch(() => []);
            allAssignments.push(...courseAssignments.map((a: any) => ({ ...a, courseTitle: c.title })));
          }
        }
        setAssignments(allAssignments);

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
                <span className="font-bold text-sm">{badges.length} Badges</span>
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

          {/* AI Language Mode Card */}
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-xl border border-white/30">
                🌍
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black mb-2">Language Learning Mode</h2>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                  Practice English, Arabic, Spanish, Turkish, or Russian with our native-level AI tutor and get instant grammar coaching!
                </p>
                <Link to="/ai-tutor">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-black rounded-xl px-8">
                    Start Learning
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Pending Assignments */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4">Pending Assignments</h2>
            <Card className="divide-y divide-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              {assignments.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm italic">No pending assignments! 🎉</div>
              ) : (
                assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                      <Edit className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{assignment.title}</p>
                      <p className="text-xs text-gray-500 truncate">{assignment.courseTitle}</p>
                    </div>
                    {submittingAssignment?.id === assignment.id ? (
                      <div className="flex items-center gap-2 mt-3 md:mt-0 w-full md:w-auto">
                        <Input
                          placeholder="Your answer..."
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          className="flex-1 w-full md:w-48 text-sm"
                        />
                        <Button 
                          size="sm" 
                          onClick={async () => {
                            if (!submissionText.trim()) return;
                            await assignmentService.submit(assignment.id, { submissionText });
                            setSubmittingAssignment(null);
                            setSubmissionText("");
                            alert("Assignment submitted successfully!");
                          }}
                        >
                          Send
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSubmittingAssignment(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="text-right shrink-0 mt-3 md:mt-0">
                        <Button size="sm" variant="outline" onClick={() => setSubmittingAssignment(assignment)}>
                          Submit Work
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </Card>
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
          {/* AI Tutor Card */}
          <Card className="p-5 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-3xl shadow-xl shadow-purple-200 border-none relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/30 shadow-inner">
                  🤖
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">Zappy Chat</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-purple-100">Online</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-purple-50 leading-relaxed mb-4 font-medium">
                "Hi! I'm Zappy! Need help with your homework or want to learn something cool?"
              </p>
              <Link to="/ai-tutor">
                <Button className="w-full bg-white text-purple-600 hover:bg-purple-50 font-black rounded-xl shadow-lg border-none py-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Chat with Zappy
                </Button>
              </Link>
            </div>
          </Card>

          {/* Achievements */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-3">{t.achievements}</h2>
            <Card className="p-4 rounded-2xl border border-gray-100">
              {badges.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">Complete lessons to earn badges! 🏅</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((badge: any, i: number) => {
                    const icons: Record<string, string> = {
                      FirstLesson: "🎓", QuizMaster: "🏆", CourseChampion: "🌟", SevenDayStreak: "🔥"
                    };
                    return (
                      <div key={i} className="aspect-square rounded-xl flex flex-col items-center justify-center p-2 bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-300 shadow-sm">
                        <div className="text-2xl mb-0.5">{icons[badge.badgeType] || "🎖️"}</div>
                        <div className="text-xs text-center font-semibold text-gray-900 leading-tight">{badge.badgeType?.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-3">🏆 Leaderboard</h2>
              <Card className="p-4 rounded-2xl border border-gray-100 space-y-2">
                {leaderboard.slice(0, 5).map((entry: any, i: number) => (
                  <div key={entry.id} className={`flex items-center gap-3 p-2 rounded-xl ${i === 0 ? 'bg-amber-50 border border-amber-100' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${
                      i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>{i + 1}</div>
                    <span className="flex-1 text-sm font-semibold text-gray-900 truncate">{entry.name}</span>
                    <span className="text-xs font-bold text-purple-600">{entry.xp} XP</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

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