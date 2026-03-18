import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AppLayout from "./components/layout/AppLayout";
import LoginPage     from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import IssuesPage    from "./pages/IssuesPage";
import ReturnsPage   from "./pages/ReturnsPage";
import ReportsPage   from "./pages/ReportsPage";
import UsersPage     from "./pages/UsersPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { Spinner }   from "./components/ui";

// ─── Role Access Map ──────────────────────────────────────────────────────────
const ROLE_ACCESS = {
  admin:   ["/dashboard", "/inventory", "/issues", "/returns", "/reports", "/users"],
  teacher: ["/dashboard", "/inventory", "/issues", "/returns", "/reports"],
  student: ["/dashboard", "/inventory"],
};

function ProtectedRoute({ children, path, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Spinner size="lg" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { user } = useAuth();

  const redirectAfterLogin = () => {
    if (!user) return "/login";
    return "/dashboard";
  };

  return (
    <Routes>
      <Route path="/login"        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* All roles */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin","teacher","student"]}><DashboardPage /></ProtectedRoute>} />
      <Route path="/inventory"  element={<ProtectedRoute allowedRoles={["admin","teacher","student"]}><InventoryPage /></ProtectedRoute>} />

      {/* Admin + Teacher only */}
      <Route path="/issues"  element={<ProtectedRoute allowedRoles={["admin","teacher"]}><IssuesPage /></ProtectedRoute>} />
      <Route path="/returns" element={<ProtectedRoute allowedRoles={["admin","teacher"]}><ReturnsPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin","teacher"]}><ReportsPage /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />

      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: "10px", fontSize: "14px", fontFamily: "DM Sans, sans-serif" },
          success: { iconTheme: { primary: "#0284c7", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
