import { useState } from "react";
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star,
  MessageSquare,
  Mic,
  PenTool,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  Search,
  Filter,
  BarChart3
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { teacherData } from "../data/teacherData";

export function TeacherDashboard() {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const pendingAssignments = teacherData.assignments.filter(a => a.status === "pending");
  const gradedToday = teacherData.assignments.filter(a => 
    a.status === "graded" && a.gradedDate === t.today
  ).length;

  const filteredStudents = teacherData.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{t.teacherDashboard}</h1>
          <p className="text-gray-600">{t.manageStudentsAndAssignments}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 px-4 py-2 rounded-xl">
            <div className="text-sm text-gray-600">{t.totalStudents}</div>
            <div className="text-2xl font-black text-purple-600">{teacherData.students.length}</div>
          </div>
          <div className="bg-white border-2 px-4 py-2 rounded-xl">
            <div className="text-sm text-gray-600">{t.pendingReview}</div>
            <div className="text-2xl font-black text-orange-600">{pendingAssignments.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-900 mb-1">
            {teacherData.students.length}
          </div>
          <div className="text-sm text-blue-700">{t.activeStudents}</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-black text-orange-900 mb-1">
            {pendingAssignments.length}
          </div>
          <div className="text-sm text-orange-700">{t.pendingReview}</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-black text-green-900 mb-1">
            {gradedToday}
          </div>
          <div className="text-sm text-green-700">{t.gradedToday}</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-8 h-8 text-purple-600" />
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-900 mb-1">87%</div>
          <div className="text-sm text-purple-700">{t.classAverage}</div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="bg-white border shadow-sm rounded-xl p-1">
          <TabsTrigger value="assignments" className="rounded-lg">{t.assignments}</TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg">{t.students}</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">{t.analytics}</TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          {/* Filter Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl">
                  <SelectValue placeholder={t.allSubjects} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allSubjects}</SelectItem>
                  <SelectItem value="writing">{t.writing}</SelectItem>
                  <SelectItem value="speaking">{t.speaking}</SelectItem>
                  <SelectItem value="reading">{t.reading}</SelectItem>
                  <SelectItem value="math">{t.math}</SelectItem>
                  <SelectItem value="science">{t.science}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl">
                  <SelectValue placeholder={t.allClasses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allClasses}</SelectItem>
                  <SelectItem value="Grade 2A">Grade 2A</SelectItem>
                  <SelectItem value="Grade 2B">Grade 2B</SelectItem>
                  <SelectItem value="Grade 3A">Grade 3A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Pending Assignments */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-600" />
              {t.pendingReview} ({pendingAssignments.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingAssignments
                .filter(a => selectedSubject === "all" || a.subject === selectedSubject)
                .filter(a => selectedClass === "all" || a.studentClass === selectedClass)
                .map((assignment) => (
                <Card key={assignment.id} className="p-5 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      assignment.type === "writing" ? "bg-blue-100" :
                      assignment.type === "speaking" ? "bg-purple-100" :
                      assignment.type === "reading" ? "bg-green-100" :
                      "bg-orange-100"
                    }`}>
                      {assignment.type === "writing" && <PenTool className="w-6 h-6 text-blue-600" />}
                      {assignment.type === "speaking" && <Mic className="w-6 h-6 text-purple-600" />}
                      {assignment.type === "reading" && <BookOpen className="w-6 h-6 text-green-600" />}
                      {assignment.type === "quiz" && <FileText className="w-6 h-6 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-black text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600">{assignment.studentName} • {assignment.studentClass}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          assignment.priority === "high" ? "bg-red-100 text-red-700" :
                          assignment.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {assignment.priority === "high" ? t.highPriority :
                           assignment.priority === "medium" ? t.mediumPriority :
                           t.lowPriority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{assignment.subject}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {t.submitted}: {assignment.submittedDate}
                        </span>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          onClick={() => setSelectedStudent(assignment.id)}
                        >
                          {t.review}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recently Graded */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              {t.recentlyGraded}
            </h2>
            <div className="space-y-3">
              {teacherData.assignments
                .filter(a => a.status === "graded")
                .slice(0, 5)
                .map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{assignment.title}</p>
                        <p className="text-sm text-gray-600">{assignment.studentName} • {assignment.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-green-600">{assignment.grade}%</div>
                      <p className="text-xs text-gray-500">{assignment.gradedDate}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t.searchStudents}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl">
                  <SelectValue placeholder={t.allClasses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allClasses}</SelectItem>
                  <SelectItem value="Grade 2A">Grade 2A</SelectItem>
                  <SelectItem value="Grade 2B">Grade 2B</SelectItem>
                  <SelectItem value="Grade 3A">Grade 3A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Student List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-5 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl">
                    {student.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.class}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Star className="w-3 h-3 fill-yellow-600" />
                        <span className="font-semibold">{student.averageGrade}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{t.completionRate}</span>
                      <span className="font-semibold text-purple-600">{student.completionRate}%</span>
                    </div>
                    <Progress value={student.completionRate} className="h-1.5" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="text-lg font-black text-blue-600">{student.assignmentsCompleted}</div>
                      <div className="text-xs text-gray-600">{t.completed}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2">
                      <div className="text-lg font-black text-orange-600">{student.assignmentsPending}</div>
                      <div className="text-xs text-gray-600">{t.pending}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="text-lg font-black text-purple-600">{student.streak}</div>
                      <div className="text-xs text-gray-600">{t.days}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-full">
                    {t.viewProfile}
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                    {t.feedback}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                {t.subjectPerformance}
              </h3>
              <div className="space-y-4">
                {[
                  { subject: t.writing, score: 85, color: "blue" },
                  { subject: t.speaking, score: 78, color: "purple" },
                  { subject: t.reading, score: 92, color: "green" },
                  { subject: t.math, score: 88, color: "orange" },
                  { subject: t.science, score: 81, color: "pink" },
                ].map((item) => (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-semibold text-gray-700">{item.subject}</span>
                      <span className={`font-bold text-${item.color}-600`}>{item.score}%</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Performers */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                {t.topPerformers}
              </h3>
              <div className="space-y-3">
                {teacherData.students
                  .sort((a, b) => b.averageGrade - a.averageGrade)
                  .slice(0, 5)
                  .map((student, index) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      {student.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-purple-600">{student.averageGrade}%</div>
                      <div className="text-xs text-gray-500">{t.average}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Needs Attention */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                {t.needsAttention}
              </h3>
              <div className="space-y-3">
                {teacherData.students
                  .filter(s => s.averageGrade < 75 || s.assignmentsPending > 2)
                  .map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      {student.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">
                        {student.averageGrade < 75 && `${t.lowGrade}: ${student.averageGrade}%`}
                        {student.averageGrade < 75 && student.assignmentsPending > 2 && " • "}
                        {student.assignmentsPending > 2 && `${student.assignmentsPending} ${t.pendingAssignments}`}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full">
                      {t.contact}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Assignment Types Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {t.assignmentDistribution}
              </h3>
              <div className="space-y-4">
                {[
                  { type: t.writing, count: 45, icon: PenTool, color: "blue" },
                  { type: t.speaking, count: 32, icon: Mic, color: "purple" },
                  { type: t.reading, count: 38, icon: BookOpen, color: "green" },
                  { type: "Quiz", count: 28, icon: FileText, color: "orange" },
                ].map((item) => {
                  const Icon = item.icon;
                  const total = 45 + 32 + 38 + 28;
                  const percentage = Math.round((item.count / total) * 100);
                  
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${item.color}-600`} />
                          <span className="text-sm font-semibold text-gray-700">{item.type}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.count} ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assignment Review Modal (Simple version) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.reviewAssignment}</h2>
                <Button variant="outline" onClick={() => setSelectedStudent(null)} className="rounded-full">
                  {t.close}
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-black text-gray-900 mb-2">{t.studentWork}</h3>
                  <p className="text-gray-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.grade} (0-100)
                  </label>
                  <Input type="number" placeholder="85" className="rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.feedbackForStudent}
                  </label>
                  <textarea
                    className="w-full border-2 rounded-xl p-3 min-h-[120px]"
                    placeholder={t.enterFeedback}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                    onClick={() => setSelectedStudent(null)}
                  >
                    {t.submitGrade}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setSelectedStudent(null)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}