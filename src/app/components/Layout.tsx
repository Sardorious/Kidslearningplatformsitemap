import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Home, BookOpen, User, Users, GraduationCap, Shield, Menu, X, Play, LogOut, ChevronRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

export function Layout() {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role ?? "";

  // Define all nav items with optional role restrictions
  const allNavItems = [
    { path: "/", label: t.home, icon: Home, roles: ["STUDENT", "PARENT", "ADMIN", ""] },
    { path: "/courses", label: t.courses, icon: BookOpen, roles: [] },
    { path: "/student", label: t.myLearning, icon: User, roles: ["STUDENT"] },
    { path: "/parent", label: t.parentView, icon: Users, roles: ["PARENT", "STUDENT"] },
    { path: "/teacher", label: t.teacherView, icon: GraduationCap, roles: ["TEACHER"] },
    { path: "/admin", label: t.adminView, icon: Shield, roles: ["ADMIN"] },
  ];

  // Show public items always; show role-specific items only when role matches
  const navItems = allNavItems.filter(
    (item) => item.roles.length === 0 || (isAuthenticated && item.roles.includes(role))
  );

  // Human-readable role badge
  const roleBadge: Record<string, { label: string; color: string }> = {
    ADMIN: { label: "Admin", color: "bg-red-100 text-red-700" },
    TEACHER: { label: "Teacher", color: "bg-blue-100 text-blue-700" },
    STUDENT: { label: "Student", color: "bg-green-100 text-green-700" },
    PARENT: { label: "Parent", color: "bg-amber-100 text-amber-700" },
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 shrink-0" onClick={closeMobileMenu}>
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                KidsLearn
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                    <span className="text-base">🏆</span>
                    <span className="text-sm font-bold text-amber-700">{user?.xp || 0} XP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="hidden md:flex flex-col">
                      <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                        {user?.name}
                      </span>
                      {role && roleBadge[role] && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full w-fit ${roleBadge[role].color}`}>
                          {roleBadge[role].label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={logout}
                      className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-sm hover:shadow-md transition-all">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">KidsLearn</span>
            </div>
            <button onClick={closeMobileMenu} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* User Info */}
          {isAuthenticated && (
            <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-purple-600 font-medium">🏆 {user?.xp || 0} XP</p>
                  {role && roleBadge[role] && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${roleBadge[role].color}`}>
                      {roleBadge[role].label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-50 ${isActive(item.path) ? "text-white" : ""}`} />
                </Link>
              );
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-100 space-y-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); closeMobileMenu(); }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full rounded-xl text-sm border-purple-200">Log In</Button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu}>
                  <Button className="w-full rounded-xl text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
        <Outlet />
      </main>
    </div>
  );
}