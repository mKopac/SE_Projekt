import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginForm from "./forms/LoginForm";
import { useState } from 'react'
import RegisterForm from "./forms/RegisterForm";
import type { RegisterFormData } from "./forms/RegisterForm";

function App() {
  const handleLogin = (email: string, password: string) => {
  };

  const handleRegister = (formData: RegisterFormData) => {
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm onSubmit={handleLogin} />} />
        <Route path="/register" element={<RegisterForm onSubmit={handleRegister} />} />
      </Routes>
    </Router>
  );
}

export default App;
