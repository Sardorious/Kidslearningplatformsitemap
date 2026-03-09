import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Filter, BookOpen, Clock, Star, X, SlidersHorizontal } from "lucide-react";
import { courseService } from "../api/services";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-12" />
        </div>
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl pt-3" />
      </div>
    </div>
  );
}

const categoryEmoji: Record<string, string> = {
  Math: "🔢", Science: "🔬", Reading: "📖", Writing: "✍️",
  Art: "🎨", Music: "🎵", Coding: "💻", General: "📚", default: "🎓",
};

export function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAll();
        setCourses(data || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedAge, selectedLevel]);

  const categories = ["all", ...Array.from(new Set(courses.map((c) => c.category || "General")))];
  const ageGroups = ["all", "5-7", "6-8", "7-10", "8-12", "6-12", "7-11"];
  const levels = ["all", "Beginner", "Intermediate", "Advanced", "All Levels"];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesAge = selectedAge === "all" || course.ageGroup === selectedAge;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesAge && matchesLevel;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedAge !== "all" || selectedLevel !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAge("all");
    setSelectedLevel("all");
  };

  return (
    <div className="space-y-6">
      {/* Hero Header - Mobile Toggle only */}
      <div className="md:hidden flex justify-center py-2 px-4">
        <button
          className="inline-flex items-center gap-2 bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {hasActiveFilters && <span className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">!</span>}
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`${filtersOpen ? "block" : "hidden"} md:block`}>
        <Card className="p-5 bg-white shadow-sm border border-gray-100 rounded-2xl">
          {hasActiveFilters && (
            <div className="flex justify-end mb-2">
              <button
                onClick={clearFilters}
                className="text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                <X className="w-2.5 h-2.5" /> {t.clearAll}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t.searchCourses}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-colors h-10"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50 h-10">
                  <SelectValue placeholder={t.allCategories} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? t.allCategories : `${categoryEmoji[cat] || categoryEmoji.default} ${cat}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-36">
              <Select value={selectedAge} onValueChange={setSelectedAge}>
                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50 h-10">
                  <SelectValue placeholder={t.allAges} />
                </SelectTrigger>
                <SelectContent>
                  {ageGroups.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age === "all" ? t.allAges : `${t.ages} ${age}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50 h-10">
                  <SelectValue placeholder={t.allLevels} />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === "all" ? t.allLevels : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  "{searchQuery}" <button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  {selectedCategory} <button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedAge !== "all" && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  {t.ages} {selectedAge} <button onClick={() => setSelectedAge("all")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedLevel !== "all" && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  {selectedLevel} <button onClick={() => setSelectedLevel("all")}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500 font-medium">
            {t.foundCourses.replace("{count}", String(filteredCourses.length))}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      )}

      {/* Course Table List */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-bold text-gray-500">Preview</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-gray-500">{t.courseTitle}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-gray-500 hidden sm:table-cell">{t.level}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-gray-500 hidden md:table-cell">{t.lessons}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-gray-500 hidden lg:table-cell">Duration</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-bold text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="w-12 h-12 bg-gray-100 rounded-lg" /></TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-100 rounded w-48 mb-2" />
                    <div className="h-3 bg-gray-50 rounded w-24" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><div className="h-4 bg-gray-50 rounded w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="h-4 bg-gray-50 rounded w-12" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><div className="h-4 bg-gray-50 rounded w-16" /></TableCell>
                  <TableCell className="text-right"><div className="h-9 bg-gray-100 rounded-xl w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : paginatedCourses.length > 0 ? (
              paginatedCourses.map((course) => (
                <TableRow key={course.id} className="group hover:bg-purple-50/30 transition-colors">
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <img
                        src={course.imageUrl || course.image || `https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=100`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{course.title}</span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        {categoryEmoji[course.category || "General"] || categoryEmoji.default} {course.category || "General"}
                        {course.enrolled && <span className="text-emerald-600 font-bold ml-1 flex items-center gap-0.5"><span className="w-1 h-1 bg-emerald-600 rounded-full" /> Enrolled</span>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {course.level || "Beginner"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      {course.lessonsCount || 0}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {course.duration || "Flexible"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {course.enrolled ? (
                      <Link to={`/lesson/${course.id}/play`}>
                        <Button size="sm" className="h-9 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md">
                          Continue →
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Link to={`/lesson/${course.id}/play`}>
                          <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-gray-200">
                            {t.view}
                          </Button>
                        </Link>
                        {user?.role !== 'TEACHER' && (
                          <Link to={`/lesson/${course.id}/play`}>
                            <Button size="sm" className="h-9 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md">
                              Enroll →
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="text-4xl opacity-50">🔍</div>
                    <div className="font-bold text-gray-900">{t.noCourses}</div>
                    <p className="text-xs text-gray-500 max-w-xs">{t.tryAdjusting}</p>
                    <Button onClick={clearFilters} variant="outline" size="sm" className="rounded-full border-purple-200 text-purple-700 h-8 text-[10px]">
                      {t.clearFilters}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-center gap-2 bg-gray-50/30">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="rounded-xl border-gray-200 text-gray-600 h-8 px-3"
            >
              ← Previous
            </Button>
            <div className="flex gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="rounded-xl border-gray-200 text-gray-600 h-8 px-3"
            >
              Next →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}