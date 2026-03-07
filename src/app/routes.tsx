import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
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
      { index: true, Component: Home },
      { path: "courses", Component: CourseCatalog },
      { path: "lesson/:courseId/:lessonId", Component: LessonPlayer },
      { path: "student", Component: StudentDashboard },
      { path: "parent", Component: ParentDashboard },
      { path: "teacher", Component: TeacherDashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "material/view", Component: MaterialViewer },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "*", Component: NotFound },
    ],
  },
]);