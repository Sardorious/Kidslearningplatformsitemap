import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Filter, BookOpen, Clock, Star } from "lucide-react";
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

export function CourseCatalog() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAll();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = ["all", ...Array.from(new Set(courses.map(c => c.category || "General")))];
  const ageGroups = ["all", "5-7", "6-8", "7-10", "8-12", "6-12", "7-11"]; // Backend might not have this, giving options
  const levels = ["all", "Beginner", "Intermediate", "Advanced", "All Levels"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesAge = selectedAge === "all" || course.ageGroup === selectedAge;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesAge && matchesLevel;
  });

  if (loading) {
    return <div className="text-center py-20 text-2xl font-bold">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          {t.exploreCourses} 🚀
        </h1>
        <p className="text-lg text-gray-600">
          {t.findPerfectCourse}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-black text-gray-900">{t.filters}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t.searchCourses}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder={t.allCategories} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? t.allCategories : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Age Group Filter */}
          <Select value={selectedAge} onValueChange={setSelectedAge}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder={t.allAges} />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map(age => (
                <SelectItem key={age} value={age}>
                  {age === "all" ? t.allAges : `${t.ages} ${age}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder={t.allLevels} />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level === "all" ? t.allLevels : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || selectedCategory !== "all" || selectedAge !== "all" || selectedLevel !== "all") && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">{t.activeFilters}</span>
            {searchQuery && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {t.search}: "{searchQuery}"
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {selectedCategory}
              </span>
            )}
            {selectedAge !== "all" && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {t.ages} {selectedAge}
              </span>
            )}
            {selectedLevel !== "all" && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {selectedLevel}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedAge("all");
                setSelectedLevel("all");
              }}
              className="text-sm text-purple-600 hover:text-purple-700 underline"
            >
              {t.clearAll}
            </button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {t.foundCourses.replace('{count}', String(filteredCourses.length))}
        </p>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden border-2 hover:border-purple-400 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48">
                <img
                  src={course.image || "https://images.unsplash.com/photo-1685358268305-c621b38e75d8?auto=format&fit=crop&q=80"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {course.category || "General"}
                </div>
                {course.enrolled && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ {t.enrolled}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-black text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span>{course.lessonsCount || 0} {t.lessons}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{course.duration || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Star className="w-4 h-4 text-purple-500" />
                    <span>{course.level || 'Beginner'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {t.ages} {course.ageGroup || "6-12"}
                  </span>
                </div>

                {course.enrolled ? (
                  <Link to={`/lesson/${course.id}/play`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl">
                      {t.continueLearningBtn}
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/lesson/${course.id}/play`}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl">
                      {t.enrollNow}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">{t.noCourses}</h3>
          <p className="text-gray-600 mb-4">{t.tryAdjusting}</p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedAge("all");
              setSelectedLevel("all");
            }}
            variant="outline"
            className="rounded-full"
          >
            {t.clearFilters}
          </Button>
        </Card>
      )}
    </div>
  );
}