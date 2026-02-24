import { Link } from "react-router";
import { Trophy, Flame, Star, TrendingUp, BookOpen, Clock, Target } from "lucide-react";
import { studentProgress, courses, lessons } from "../data/mockData";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";

export function StudentDashboard() {
  const enrolledCourses = courses.filter(c => c.enrolled);
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl border-4 border-white/30">
            {studentProgress.avatar}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black mb-1">{studentProgress.name}</h1>
            <p className="text-lg opacity-90 mb-3">{studentProgress.grade} • {t.learningChampion} 🏆</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">{studentProgress.streak} {t.dayStreak}</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span className="font-bold">{studentProgress.points} {t.points}</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold">
                    {studentProgress.achievements.filter(a => a.earned).length} Badges
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-900 mb-1">
            {studentProgress.coursesInProgress}
          </div>
          <div className="text-sm text-blue-700">{t.activeCourses}</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-green-600" />
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-black text-green-900 mb-1">
            {studentProgress.completedLessons}
          </div>
          <div className="text-sm text-green-700">{t.lessonsCompleted}</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-purple-600" />
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-900 mb-1">12.5h</div>
          <div className="text-sm text-purple-700">{t.learningTime}</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-8 h-8 text-yellow-600" />
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-yellow-900 mb-1">92%</div>
          <div className="text-sm text-yellow-700">{t.averageScore}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">{t.myCourses}</h2>
            <div className="space-y-4">
              {enrolledCourses.map((course) => {
                const courseLessons = lessons[course.id as keyof typeof lessons] || [];
                const completedLessons = courseLessons.filter(l => l.completed).length;
                const progress = courseLessons.length > 0 ? (completedLessons / courseLessons.length) * 100 : 0;

                return (
                  <Card key={course.id} className="p-4 hover:shadow-lg transition-all">
                    <div className="flex gap-4">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-black text-gray-900">{course.title}</h3>
                            <p className="text-sm text-gray-600">{course.category}</p>
                          </div>
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="mb-3">
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {t.completedOf.replace('{completed}', String(completedLessons)).replace('{total}', String(courseLessons.length))}
                          </p>
                          <Link to={`/lesson/${course.id}/1`}>
                            <Button size="sm" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                              {t.continue}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">{t.recentActivity}</h2>
            <Card className="divide-y">
              {studentProgress.recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.course}</p>
                      <p className="text-sm text-gray-600">{activity.lesson}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{activity.date}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">{t.achievements}</h2>
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {studentProgress.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-3 transition-all ${
                      achievement.earned
                        ? "bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400"
                        : "bg-gray-100 opacity-40"
                    }`}
                  >
                    <div className="text-3xl mb-1">{achievement.icon}</div>
                    <div className="text-xs text-center font-semibold text-gray-900">
                      {achievement.title}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Daily Goal */}
          <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              {t.todaysGoal}
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-700">{t.completeLessons}</span>
                  <span className="font-bold text-green-600">1/2</span>
                </div>
                <Progress value={50} className="h-2 bg-green-100" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-700">{t.minutesLearning}</span>
                  <span className="font-bold text-green-600">15/20</span>
                </div>
                <Progress value={75} className="h-2 bg-green-100" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {t.almostThere} 💪
            </p>
          </Card>

          {/* Leaderboard Preview */}
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              {t.weeklyLeaderboard}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🥇</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t.you}</p>
                  <p className="text-xs text-gray-600">1,250 {t.points.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🥈</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Alex M.</p>
                  <p className="text-xs text-gray-600">1,180 {t.points.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🥉</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Sam K.</p>
                  <p className="text-xs text-gray-600">1,120 {t.points.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}