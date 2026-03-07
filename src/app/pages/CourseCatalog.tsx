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
import { useLanguage } from "../contexts/LanguageContext";

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
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedAge !== "all" || selectedLevel !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAge("all");
    setSelectedLevel("all");
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
          {t.exploreCourses} 🚀
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto">
          {t.findPerfectCourse}
        </p>

        {/* Mobile filter toggle */}
        <button
          className="mt-4 md:hidden inline-flex items-center gap-2 bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {hasActiveFilters && <span className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">!</span>}
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`${filtersOpen ? "block" : "hidden"} md:block`}>
        <Card className="p-5 bg-white shadow-sm border border-gray-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-gray-900">{t.filters}</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
              >
                <X className="w-3 h-3" /> {t.clearAll}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t.searchCourses}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50">
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

            <Select value={selectedAge} onValueChange={setSelectedAge}>
              <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50">
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

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50">
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
        <p className="text-sm text-gray-500 font-medium">
          {t.foundCourses.replace("{count}", String(filteredCourses.length))}
        </p>
      )}

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden border border-gray-100 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                <img
                  src={
                    course.imageUrl ||
                    course.image ||
                    `https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600`
                  }
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e: any) => {
                    e.target.src = `https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-purple-700 shadow-sm">
                    {categoryEmoji[course.category || "General"] || categoryEmoji.default} {course.category || "General"}
                  </span>
                </div>
                {course.enrolled && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      ✓ Enrolled
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-lg font-black text-gray-900 mb-1.5 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                  {course.description || "Start your learning journey with this course."}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    {course.lessonsCount || 0} {t.lessons}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {course.level || "Beginner"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {course.duration || "Flexible"}
                  </span>
                </div>

                {course.enrolled ? (
                  <Link to={`/lesson/${course.id}/play`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-sm font-bold transition-all hover:shadow-md">
                      Continue Learning →
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/lesson/${course.id}/play`}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-sm font-bold transition-all hover:shadow-md">
                      {t.enrollNow} →
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">{t.noCourses}</h3>
          <p className="text-gray-500 mb-6 max-w-xs mx-auto">{t.tryAdjusting}</p>
          <Button onClick={clearFilters} variant="outline" className="rounded-full border-purple-200 text-purple-700">
            {t.clearFilters}
          </Button>
        </div>
      )}
    </div>
  );
}