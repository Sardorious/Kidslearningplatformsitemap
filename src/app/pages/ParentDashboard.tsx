import { useState } from "react";
import { Calendar, TrendingUp, Clock, AlertCircle, CheckCircle, Award, BarChart3 } from "lucide-react";
import { childrenData } from "../data/mockData";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";

export function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(childrenData[0].id);
  const child = childrenData.find(c => c.id === selectedChild) || childrenData[0];
  const { t } = useLanguage();

  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
  const activityData = [3.5, 4.2, 5.8, 4.5, 6.2, 5.5, 4.8];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{t.parentDashboard}</h1>
          <p className="text-gray-600">{t.monitorChildren}</p>
        </div>
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {childrenData.map(child => (
              <SelectItem key={child.id} value={child.id}>
                {child.avatar} {child.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Child Profile Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl border-4 border-white/30">
            {child.avatar}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black mb-1">{child.name}</h2>
            <p className="text-lg opacity-90 mb-3">{child.grade} • {child.age} {t.yearsOld}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-sm opacity-80">{t.courses}</div>
                <div className="text-xl font-bold">{child.coursesEnrolled}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-sm opacity-80">{t.completionRate}</div>
                <div className="text-xl font-bold">{child.completionRate}%</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-sm opacity-80">{t.thisWeek}</div>
                <div className="text-xl font-bold">{child.weeklyHours}h</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border shadow-sm rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg">{t.overview}</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg">{t.performance}</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg">{t.activity}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-900 mb-1">{child.weeklyHours}h</div>
              <div className="text-sm text-blue-700">{t.thisWeek}</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-black text-green-900 mb-1">{child.completionRate}%</div>
              <div className="text-sm text-green-700">{t.completionRate}</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-8 h-8 text-purple-600" />
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-purple-900 mb-1">
                {child.recentScores[child.recentScores.length - 1]}%
              </div>
              <div className="text-sm text-purple-700">{t.latestScore}</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-black text-orange-900 mb-1">
                {Math.round(child.recentScores.reduce((a, b) => a + b, 0) / child.recentScores.length)}%
              </div>
              <div className="text-sm text-orange-700">{t.averageScore}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths & Areas to Improve */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">{t.performanceInsights}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">{t.strengths}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {child.strengths.map(strength => (
                      <span
                        key={strength}
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-gray-900">{t.areasToImprove}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {child.needsImprovement.map(area => (
                      <span
                        key={area}
                        className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Course Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">{t.courseProgress}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-700">Fun with Math</span>
                    <span className="font-semibold text-purple-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-700">Reading Adventures</span>
                    <span className="font-semibold text-purple-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-700">Music Makers</span>
                    <span className="font-semibold text-purple-600">58%</span>
                  </div>
                  <Progress value={58} className="h-2" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t.recentTestScores}</h3>
            <div className="space-y-4">
              {child.recentScores.map((score, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">{t.quiz} {index + 1}</span>
                      <span className="font-bold text-gray-900">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    score >= 90 ? "bg-green-100 text-green-700" :
                    score >= 80 ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {score >= 90 ? t.excellent : score >= 80 ? t.good : t.fair}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{t.improving}</h3>
                  <p className="text-sm text-gray-600">{t.consistentProgress}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {child.name} has shown steady improvement in Math and Reading over the past month. 
                Keep encouraging this great progress! 🌟
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{t.recommendation}</h3>
                  <p className="text-sm text-gray-600">{t.suggestedFocus}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Consider spending more time on Science topics to strengthen this area. 
                Interactive experiments could help boost engagement! 🔬
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t.weeklyActivity}</h3>
            <div className="flex items-end justify-between h-64 gap-2">
              {activityData.map((hours, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg relative group"
                    style={{ height: `${(hours / 7) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {hours}h
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{weekDays[index]}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                {t.recentSessions}
              </h3>
              <div className="space-y-3">
                {[
                  { date: t.today, course: "Fun with Math", time: "45 min", completed: true },
                  { date: t.yesterday, course: "Reading Adventures", time: "30 min", completed: true },
                  { date: t.daysAgo.replace('{count}', '2'), course: "Music Makers", time: "35 min", completed: true },
                  { date: t.daysAgo.replace('{count}', '3'), course: "Fun with Math", time: "40 min", completed: true },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{session.course}</p>
                      <p className="text-xs text-gray-600">{session.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple-600 text-sm">{session.time}</p>
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">{t.learningStreakTitle}</h3>
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🔥</div>
                <div className="text-4xl font-black text-orange-600 mb-1">7 {t.days}</div>
                <p className="text-gray-600">{t.currentStreak}</p>
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <div
                    key={day}
                    className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  >
                    ✓
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}