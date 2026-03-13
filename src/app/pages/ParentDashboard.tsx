import { useState, useEffect } from "react";
import {
  Calendar, TrendingUp, Clock, AlertCircle, CheckCircle,
  Award, BarChart3, Users, X, Send, BookOpen, Sparkles, FileText, Brain
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { userService, aiService } from "../api/services";

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
  const [childData, setChildData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>(fallbackChildren);
  const [selectedChildId, setSelectedChildId] = useState(fallbackChildren[0].id);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMsg, setContactMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // AI Report State
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        // Try to fetch the real linked child's progress first
        const realChildProgress = await userService.getChildProgress().catch(() => null);
        if (realChildProgress) {
          setChildData(realChildProgress);
          const mapped = [{
            id: String(realChildProgress.childId),
            name: realChildProgress.childName,
            avatar: "👧",
            grade: "Enrolled Student",
            age: 0,
            coursesEnrolled: 0,
            completionRate: 0,
            weeklyHours: 0,
            recentScores: [],
            strengths: ["Learning"],
            needsImprovement: [],
          }];
          setChildren(mapped);
          setSelectedChildId(mapped[0].id);
        } else {
          // Fallback: load all students
          const users = await userService.getAllUsers();
          const students = users.filter((u: any) => u.role === 'STUDENT');
          if (students.length > 0) {
            const mapped = students.map((s: any, i: number) => ({
              id: String(s.id),
              name: s.name,
              avatar: ["👧", "👦", "🧒", "👶"][i % 4],
              grade: `Grade ${(i % 6) + 1}`,
              age: 6 + (i % 7),
              coursesEnrolled: 2,
              completionRate: 60 + Math.round(Math.random() * 35),
              weeklyHours: 3 + Math.round(Math.random() * 4),
              recentScores: [70, 75, 80, 82, 85].map(sc => sc + Math.round(Math.random() * 10 - 5)),
              strengths: ["Reading", "Math"].slice(0, 1 + (i % 2)),
              needsImprovement: ["Science", "Writing"].slice(0, 1 + (i % 2)),
            }));
            setChildren(mapped);
            setSelectedChildId(mapped[0].id);
          }
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

  const handleGenerateAiReport = async () => {
    setAiReportLoading(true);
    setAiReport(null);
    try {
      // In a real app, child.id would be used to fetch actual DB data
      const report = await aiService.getProgressReport();
      setAiReport(report);
    } catch {
      alert("AI Report generation failed. Try again.");
    } finally {
      setAiReportLoading(false);
    }
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
            <p className="text-white/80 mb-3 text-sm">{child.grade}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {childData ? (
                <>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                    <div className="text-xs opacity-80">XP Earned</div>
                    <div className="text-lg font-black">{childData.xp}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                    <div className="text-xs opacity-80">🪙 Coins</div>
                    <div className="text-lg font-black">{childData.coins}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                    <div className="text-xs opacity-80">Lessons Done</div>
                    <div className="text-lg font-black">{childData.completedLessons}</div>
                  </div>
                </>
              ) : [
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
          <TabsTrigger value="achievements" className="rounded-lg">{t.achievements}</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg">{t.activity}</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg">Fees & Payments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* AI Magic Report Section */}
          <Card className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl overflow-hidden shadow-xl shadow-purple-100">
            <div className="bg-white m-0.5 rounded-[calc(1.5rem-2px)] p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <Sparkles className="w-7 h-7 text-purple-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">AI Magic Progress Report</h3>
                    <p className="text-sm text-gray-500">Get deep insights into {child.name}'s learning journey</p>
                  </div>
                </div>
                {!aiReport && (
                  <Button
                    onClick={handleGenerateAiReport}
                    disabled={aiReportLoading}
                    className="bg-gray-900 hover:bg-black text-white px-8 py-6 rounded-2xl font-black transition-all hover:scale-105"
                  >
                    {aiReportLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Generate Now
                      </>
                    )}
                  </Button>
                )}
              </div>

              {aiReport && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-8 duration-700">
                  <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 relative">
                    <div className="absolute top-4 right-4 text-xs font-black text-indigo-300 uppercase tracking-widest">AI Summary</div>
                    <p className="text-gray-700 leading-relaxed font-medium">"{aiReport.summary}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                      <h4 className="flex items-center gap-2 text-xs font-black text-green-700 uppercase tracking-widest mb-3">
                        <CheckCircle className="w-4 h-4" /> Bright Spots
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{aiReport.strengths}</p>
                    </div>
                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                      <h4 className="flex items-center gap-2 text-xs font-black text-orange-700 uppercase tracking-widest mb-3">
                        <AlertCircle className="w-4 h-4" /> Focus Areas
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{aiReport.areasToImprove}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 text-white p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />
                    <h4 className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-4">
                      <TrendingUp className="w-4 h-4" /> Next Steps & Recommendations
                    </h4>
                    <p className="text-sm text-gray-200 leading-relaxed relative z-10">{aiReport.recommendations}</p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" className="text-xs text-purple-300 hover:text-white hover:bg-white/10" onClick={() => setAiReport(null)}>
                        Regenerate Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

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
              {childData?.recentProgress?.length > 0 ? (
                <div className="space-y-3">
                  {childData.recentProgress.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.lessonTitle}</p>
                        <p className="text-xs text-gray-400">{p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.score >= 90 ? 'bg-green-100 text-green-700' : p.score >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{p.score ?? '--'}%</span>
                    </div>
                  ))}
                </div>
              ) : (
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
              )}
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
          {/* Performance Tab content... */}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card className="p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" /> Earned Badges & Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { id: 1, title: "Math Whiz", icon: "🏆", date: "2024-05-15", color: "amber" },
                { id: 2, title: "Reading Star", icon: "⭐", date: "2024-05-10", color: "yellow" },
                { id: 3, title: "Perfect Week", icon: "🎯", date: "2024-05-01", color: "blue" },
                { id: 4, title: "Artist", icon: "🎨", date: "2024-04-20", color: "pink" },
                { id: 5, title: "Science Hero", icon: "🔬", date: "2024-04-15", color: "green" },
              ].map((achievement) => (
                <div key={achievement.id} className="group relative flex flex-col items-center p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-purple-200 transition-all hover:scale-105 cursor-default">
                  <div className="text-4xl mb-3 drop-shadow-sm group-hover:scale-110 transition-transform">{achievement.icon}</div>
                  <h4 className="font-bold text-gray-900 text-sm text-center mb-1">{achievement.title}</h4>
                  <p className="text-[10px] text-gray-500">{new Date(achievement.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">🚀</div>
              <div>
                <h3 className="font-black text-gray-900 leading-tight">Next Milestone: Knowledge Master</h3>
                <p className="text-sm text-gray-600 mt-0.5">Complete 10 more lessons to earn this prestigious badge!</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold text-purple-700 mb-1.5 px-1">
                <span>Progress to Badge</span>
                <span>80%</span>
              </div>
              <Progress value={80} className="h-2.5 bg-white shadow-inner" />
            </div>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Outstanding Balance */}
            <Card className="lg:col-span-2 p-6 rounded-2xl border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Education Fees</h3>
                  <p className="text-sm text-gray-500 italic">Manage your subscriptions and payments</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Due Amount</div>
                  <div className="text-4xl font-black text-red-600">$120.00</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { id: 1, label: "Monthly Tuition Fee (June)", amount: 80.00, dueDate: "2024-06-15", status: "unpaid" },
                  { id: 2, label: "Special Art Materials", amount: 40.00, dueDate: "2024-06-10", status: "unpaid" },
                  { id: 3, label: "Platform Membership (Yearly)", amount: 150.00, dueDate: "2024-05-15", status: "paid" },
                ].map(fee => (
                  <div key={fee.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${fee.status === 'paid' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-red-50 hover:border-red-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fee.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {fee.status === 'paid' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{fee.label}</p>
                        <p className="text-xs text-gray-500">Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${fee.status === 'paid' ? 'text-gray-500' : 'text-red-600'}`}>${fee.amount.toFixed(2)}</p>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${fee.status === 'paid' ? 'text-green-600' : 'text-red-400'}`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full space-y-2">
                  <p className="text-sm font-bold text-gray-700">Quick Pay via:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-14 rounded-2xl border-2 border-cyan-100 hover:border-cyan-400 hover:bg-cyan-50 group transition-all"
                      onClick={() => alert("Redirecting to Payme...")}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-cyan-600 font-black italic text-lg group-hover:scale-110 transition-transform">Payme</span>
                        {/* <span className="text-[10px] text-gray-400">Checkout Securely</span> */}
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 rounded-2xl border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 group transition-all"
                      onClick={() => alert("Redirecting to Click...")}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-blue-600 font-black italic text-lg group-hover:scale-110 transition-transform">CLICK</span>
                        {/* <span className="text-[10px] text-gray-400">Merchant Payment</span> */}
                      </div>
                    </Button>
                  </div>
                </div>
                <Button className="w-full sm:w-auto h-14 px-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-lg font-black shadow-lg hover:scale-[1.03] transition-all">
                  Pay Now
                </Button>
              </div>
            </Card>

            {/* Payment History sidebar */}
            <div className="space-y-6">
              <Card className="p-5 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Payment History</h3>
                <div className="space-y-4">
                  {[
                    { id: 1, date: "2024-05-14", amount: 150.00, method: "Payme" },
                    { id: 2, date: "2024-04-12", amount: 80.00, method: "Click" },
                    { id: 3, date: "2024-03-10", amount: 80.00, method: "VISA" },
                  ].map(h => (
                    <div key={h.id} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Payment ID #{h.id}582</p>
                        <p className="text-[10px] text-gray-500">{new Date(h.date).toLocaleDateString()} via {h.method}</p>
                      </div>
                      <p className="font-black text-sm text-gray-700 font-mono">${h.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-xs text-purple-600 font-bold hover:bg-purple-50 rounded-xl">
                  Download All Receipts
                </Button>
              </Card>

              <Card className="p-5 bg-indigo-900 text-white rounded-2xl overflow-hidden relative">
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                <h3 className="font-bold mb-2 relative">Help & Billing</h3>
                <p className="text-xs text-indigo-100 mb-4 relative opacity-80">Have questions about your billing or need assistance with payments?</p>
                <Button variant="link" className="text-white p-0 h-auto font-black text-sm relative hover:no-underline">
                  Contact Support →
                </Button>
              </Card>
            </div>
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