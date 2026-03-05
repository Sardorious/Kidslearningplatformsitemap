import { Link, Outlet, useLocation } from "react-router";
import { Home, BookOpen, Play, User, Users, GraduationCap, Shield } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

export function Layout() {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: "/", label: t.home, icon: Home },
    { path: "/courses", label: t.courses, icon: BookOpen },
    { path: "/student", label: t.myLearning, icon: User },
    { path: "/parent", label: t.parentView, icon: Users },
    { path: "/teacher", label: t.teacherView, icon: GraduationCap },
    { path: "/admin", label: t.adminView, icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-purple-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                KidsLearn
              </span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${isActive(item.path)
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "text-gray-700 hover:bg-purple-100"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />

              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center space-x-2 bg-yellow-100 px-3 py-1.5 rounded-full">
                    <span className="text-lg">🏆</span>
                    <span className="font-semibold text-yellow-800">1,250</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-xl font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block font-medium text-gray-700">{user?.name}</span>
                    <Button variant="outline" size="sm" onClick={logout} className="ml-2">Logout</Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login"><Button variant="outline" size="sm">Log In</Button></Link>
                  <Link to="/register"><Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Sign Up</Button></Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-1 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${isActive(item.path)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "text-gray-700 bg-white"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}