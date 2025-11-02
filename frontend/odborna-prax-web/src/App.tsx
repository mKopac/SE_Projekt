import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginForm from "./forms/LoginForm";
import RegisterForm from "./forms/RegisterForm";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import type { RegisterFormData } from "./forms/RegisterForm";

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
        <Route path="/register" element={<RegisterForm onSubmit={handleRegister} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;