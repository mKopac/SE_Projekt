import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginForm from "./forms/LoginForm";
import RegisterForm from "./forms/RegisterForm";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ResetPasswordForm } from "./forms/ResetPasswordForm";
import type { RegisterFormData } from "./forms/RegisterForm";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminRoute from "./components/AdminRoute";

function App() {
  const handleLogin = (email: string, password: string) => {
    console.log("Login:", email, password);
  };

  const handleRegister = (formData: RegisterFormData) => {
    console.log("Register:", formData);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm onSubmit={handleLogin} />} />
        <Route
          path="/register"
          element={<RegisterForm onSubmit={handleRegister} />}
        />
        <Route path="/reset-password" element={<ResetPasswordForm />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/users" element={<AdminUserManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
