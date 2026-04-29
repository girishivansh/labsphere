import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AppLayout from "./components/layout/AppLayout";
import HomePage       from "./pages/HomePage";
import LoginPage      from "./pages/LoginPage";
import SignupPage     from "./pages/SignupPage";
import OtpVerifyPage  from "./pages/OtpVerifyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AcceptInvitePage   from "./pages/AcceptInvitePage";
import DashboardPage  from "./pages/DashboardPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import InventoryPage  from "./pages/InventoryPage";
import IssuesPage     from "./pages/IssuesPage";
import ReturnsPage    from "./pages/ReturnsPage";
import ReportsPage    from "./pages/ReportsPage";
import MembersPage    from "./pages/MembersPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { Spinner }    from "./components/ui";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
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

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/"      element={<HomePage />} />
      <Route path="/login"  element={user ? <Navigate to={user.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'} replace /> : <LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-otp" element={<OtpVerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Super Admin */}
      <Route path="/super-admin" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><SuperAdminPage /></ProtectedRoute>} />

      {/* All Tenant roles */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["INSTITUTE_ADMIN","LAB_INCHARGE","STUDENT"]}><DashboardPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={["INSTITUTE_ADMIN","LAB_INCHARGE","STUDENT"]}><InventoryPage /></ProtectedRoute>} />
      <Route path="/issues"    element={<ProtectedRoute allowedRoles={["INSTITUTE_ADMIN","LAB_INCHARGE","STUDENT"]}><IssuesPage /></ProtectedRoute>} />
      <Route path="/returns"   element={<ProtectedRoute allowedRoles={["INSTITUTE_ADMIN","LAB_INCHARGE","STUDENT"]}><ReturnsPage /></ProtectedRoute>} />

      {/* Admin + Lab Incharge only */}
      <Route path="/reports"   element={<ProtectedRoute allowedRoles={["INSTITUTE_ADMIN","LAB_INCHARGE"]}><ReportsPage /></ProtectedRoute>} />

      {/* Institute Admin only */}
      <Route path="/members"   element={<ProtectedRoute allowedRoles={["INSTITUTE_ADMIN"]}><MembersPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            padding: "12px 16px",
          },
          success: { iconTheme: { primary: "#1b5cf5", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
