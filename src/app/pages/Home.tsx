import { Link } from "react-router";
import { BookOpen, Trophy, Clock, TrendingUp, Star, Sparkles } from "lucide-react";
import { courses, studentProgress } from "../data/mockData";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";

export function Home() {
  const enrolledCourses = courses.filter(c => c.enrolled);
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black mb-2">
              {t.welcomeBack}, {studentProgress.name}! 🎉
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {t.learningStreak.replace('{streak}', String(studentProgress.streak))}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-2xl font-black">{studentProgress.streak}</div>
              <div className="text-sm opacity-90">{t.dayStreak}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-2xl font-black">{studentProgress.points}</div>
              <div className="text-sm opacity-90">{t.points}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">{t.coursesInProgress}</p>
              <p className="text-3xl font-black text-blue-900">{studentProgress.coursesInProgress}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-100 to-green-200 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">{t.lessonsCompleted}</p>
              <p className="text-3xl font-black text-green-900">{studentProgress.completedLessons}</p>
            </div>
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">{t.learningTime}</p>
              <p className="text-3xl font-black text-yellow-900">12h</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1">{t.achievements}</p>
              <p className="text-3xl font-black text-purple-900">
                {studentProgress.achievements.filter(a => a.earned).length}
              </p>
            </div>
            <Star className="w-10 h-10 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            {t.continueLearning}
          </h2>
          <Link to="/courses">
            <Button variant="outline" className="rounded-full">{t.browseAll}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden border-2 hover:border-purple-400 transition-all hover:shadow-xl">
              <div className="relative h-40">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {course.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-black text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t.progress}</span>
                    <span className="font-semibold text-purple-600">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <Link to={`/lesson/${course.id}/1`}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl">
                    {t.continueLearningBtn}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          {t.recentAchievements}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {studentProgress.achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-4 text-center transition-all ${
                achievement.earned
                  ? "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 border-2"
                  : "bg-gray-100 opacity-50"
              }`}
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <p className="text-xs font-semibold text-gray-900">{achievement.title}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}