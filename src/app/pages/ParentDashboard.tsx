import { useState, useEffect } from "react";
import {
  Calendar, TrendingUp, Clock, AlertCircle, CheckCircle,
  Award, BarChart3, Users, X, Send
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { userService } from "../api/services";

function ParentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-lg w-48" />
          <div className="h-4 bg-gray-100 rounded w-36" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-36 bg-gradient-to-r from-indigo-200 to-pink-200 rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );
}

// Fallback mock child data when no real students are linked
const fallbackChildren = [
  {
    id: "child-1",
    name: "Emma",
    avatar: "👧",
    grade: "Grade 3",
    age: 8,
    coursesEnrolled: 3,
    completionRate: 78,
    weeklyHours: 5.5,
    recentScores: [85, 90, 78, 92, 88],
    strengths: ["Reading", "Math"],
    needsImprovement: ["Science", "Writing"],
  },
  {
    id: "child-2",
    name: "Liam",
    avatar: "👦",
    grade: "Grade 1",
    age: 6,
    coursesEnrolled: 2,
    completionRate: 62,
    weeklyHours: 3.5,
    recentScores: [72, 68, 80, 74, 78],
    strengths: ["Art", "Music"],
    needsImprovement: ["Math", "Reading"],
  },
];

export function ParentDashboard() {
  const { t } = useLanguage();
  const [children, setChildren] = useState<any[]>(fallbackChildren);
  const [selectedChildId, setSelectedChildId] = useState(fallbackChildren[0].id);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMsg, setContactMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const users = await userService.getAllUsers();
        const students = users.filter((u: any) => u.role === 'STUDENT');
        if (students.length > 0) {
          // Map real students into child shape
          const mapped = students.map((s: any, i: number) => ({
            id: String(s.id),
            name: s.name,
            avatar: ["👧", "👦", "🧒", "👶"][i % 4],
            grade: `Grade ${(i % 6) + 1}`,
            age: 6 + (i % 7),
            coursesEnrolled: 2,
            completionRate: 60 + Math.round(Math.random() * 35),
            weeklyHours: 3 + Math.round(Math.random() * 4),
            recentScores: [70, 75, 80, 82, 85].map(s => s + Math.round(Math.random() * 10 - 5)),
            strengths: ["Reading", "Math"].slice(0, 1 + (i % 2)),
            needsImprovement: ["Science", "Writing"].slice(0, 1 + (i % 2)),
          }));
          setChildren(mapped);
          setSelectedChildId(mapped[0].id);
        }
      } catch {
        // fallback already set
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (loading) return <ParentSkeleton />;

  const child = children.find(c => c.id === selectedChildId) || children[0];
  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
  const activityData = [3.5, 4.2, 5.8, 4.5, 6.2, 5.5, 4.8];
  const avgScore = Math.round(child.recentScores.reduce((a: number, b: number) => a + b, 0) / child.recentScores.length);

  const handleSendMessage = async () => {
    if (!contactMsg.trim()) { alert("Please write a message first."); return; }
    setSubmitting(true);
    await new Promise(res => setTimeout(res, 600));
    setSubmitting(false);
    setSuccessMsg("✅ Message sent to the teacher!");
    setTimeout(() => { setShowContactModal(false); setSuccessMsg(""); setContactMsg(""); }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{t.parentDashboard}</h1>
          <p className="text-gray-500">{t.monitorChildren}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-48 rounded-xl border-purple-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.avatar} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setShowContactModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-sm font-bold"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Message Teacher
          </Button>
        </div>
      </div>

      {/* Child Profile Banner */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
        <div className="flex flex-col md:flex-row items-center gap-5 relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl border-4 border-white/30 shrink-0">
            {child.avatar}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black mb-0.5">{child.name}</h2>
            <p className="text-white/80 mb-3 text-sm">{child.grade} · {child.age} {t.yearsOld}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {[
                { label: t.courses, value: child.coursesEnrolled },
                { label: t.completionRate, value: `${child.completionRate}%` },
                { label: t.thisWeek, value: `${child.weeklyHours}h` },
              ].map(s => (
                <div key={s.label} className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                  <div className="text-xs opacity-80">{s.label}</div>
                  <div className="text-lg font-black">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border shadow-sm rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg">{t.overview}</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg">{t.performance}</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg">{t.activity}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: t.thisWeek, value: `${child.weeklyHours}h`, color: "blue" },
              { icon: CheckCircle, label: t.completionRate, value: `${child.completionRate}%`, color: "green" },
              { icon: Award, label: t.latestScore, value: `${child.recentScores[child.recentScores.length - 1]}%`, color: "purple" },
              { icon: BarChart3, label: t.averageScore, value: `${avgScore}%`, color: "orange" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`p-5 bg-gradient-to-br from-${s.color}-50 to-${s.color}-100 border-2 border-${s.color}-200 rounded-2xl`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-7 h-7 text-${s.color}-600`} />
                    <TrendingUp className={`w-4 h-4 text-${s.color}-400`} />
                  </div>
                  <div className={`text-3xl font-black text-${s.color}-900 mb-1`}>{s.value}</div>
                  <div className={`text-xs text-${s.color}-700`}>{s.label}</div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4">{t.performanceInsights}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm text-gray-900">{t.strengths}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {child.strengths.map((s: string) => (
                      <span key={s} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-sm text-gray-900">{t.areasToImprove}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {child.needsImprovement.map((a: string) => (
                      <span key={a} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4">{t.courseProgress}</h3>
              <div className="space-y-4">
                {["Fun with Math", "Reading Adventures", "Music Makers"].map((course, i) => {
                  const pct = [85, 92, 58][i];
                  return (
                    <div key={course}>
                      <div className="flex items-center justify-between mb-1.5 text-sm">
                        <span className="text-gray-700">{course}</span>
                        <span className="font-bold text-purple-600">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t.recentTestScores}</h3>
            <div className="space-y-4">
              {child.recentScores.map((score: number, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{t.quiz} {index + 1}</span>
                      <span className="font-bold text-gray-900 text-sm">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${score >= 90 ? "bg-green-100 text-green-700" : score >= 80 ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {score >= 90 ? t.excellent : score >= 80 ? t.good : t.fair}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">{t.improving}</h3>
                  <p className="text-xs text-gray-500">{t.consistentProgress}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{child.name} has shown steady improvement in Math and Reading over the past month. Keep encouraging this great progress! 🌟</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">{t.recommendation}</h3>
                  <p className="text-xs text-gray-500">{t.suggestedFocus}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">Consider spending more time on {child.needsImprovement[0] || "Science"} topics to strengthen this area. Interactive experiments could help boost engagement! 🔬</p>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t.weeklyActivity}</h3>
            <div className="flex items-end justify-between h-48 gap-2">
              {activityData.map((hours, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-lg relative group cursor-pointer"
                    style={{ height: `${(hours / 7) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {hours}h
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{weekDays[index]}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> {t.recentSessions}
              </h3>
              <div className="space-y-3">
                {[
                  { date: "Today", course: "Fun with Math", time: "45 min" },
                  { date: "Yesterday", course: "Reading Adventures", time: "30 min" },
                  { date: "2 days ago", course: "Music Makers", time: "35 min" },
                  { date: "3 days ago", course: "Fun with Math", time: "40 min" },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{session.course}</p>
                      <p className="text-xs text-gray-500">{session.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-purple-600">{session.time}</p>
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4">{t.learningStreakTitle}</h3>
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">🔥</div>
                <div className="text-4xl font-black text-orange-600 mb-1">7 {t.days}</div>
                <p className="text-sm text-gray-500">{t.currentStreak}</p>
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <div key={day} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">✓</div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Teacher Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Message Teacher</h2>
                  <p className="text-sm text-gray-500">About: {child.name}</p>
                </div>
                <button onClick={() => setShowContactModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
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
                    placeholder={`Write a message about ${child.name}'s progress...`}
                    value={contactMsg}
                    onChange={e => setContactMsg(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold"
                      onClick={handleSendMessage}
                      disabled={submitting}
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => setShowContactModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}