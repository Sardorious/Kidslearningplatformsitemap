import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { CourseCatalog } from "./pages/CourseCatalog";
import { LessonPlayer } from "./pages/LessonPlayer";
import { StudentDashboard } from "./pages/StudentDashboard";
import { ParentDashboard } from "./pages/ParentDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { MaterialViewer } from "./pages/MaterialViewer";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      // ── Public ────────────────────────────────────────────────────────
      { index: true, Component: Home },
      { path: "courses", Component: CourseCatalog },
      { path: "login", Component: Login },
      { path: "register", Component: Register },

      // ── Any authenticated user ────────────────────────────────────────
      {
        path: "lesson/:courseId/:lessonId",
        element: (
          <ProtectedRoute>
            <LessonPlayer />
          </ProtectedRoute>
        ),
      },
      {
        path: "material/view",
        element: (
          <ProtectedRoute>
            <MaterialViewer />
          </ProtectedRoute>
        ),
      },

      // ── Student ───────────────────────────────────────────────────────
      {
        path: "student",
        element: (
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },

      // ── Parent (Parents + Students can view parent dashboard) ─────────
      {
        path: "parent",
        element: (
          <ProtectedRoute allowedRoles={["PARENT", "STUDENT"]}>
            <ParentDashboard />
          </ProtectedRoute>
        ),
      },

      // ── Teacher ───────────────────────────────────────────────────────
      {
        path: "teacher",
        element: (
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        ),
      },

      // ── Admin ─────────────────────────────────────────────────────────
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      { path: "*", Component: NotFound },
    ],
  },
]);