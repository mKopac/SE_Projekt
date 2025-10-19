import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./forms/LoginForm";
import RegisterForm from "./forms/RegisterForm";
import type { RegisterFormData } from "./forms/RegisterForm";

function App() {
  const handleLogin = (email: string, password: string) => {
    console.log("Prihlásenie:", { email, password });
  };

  const handleRegister = (formData: RegisterFormData) => {
    console.log("Registrácia:", formData);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm onSubmit={handleLogin} />} />
        <Route path="/register" element={<RegisterForm onSubmit={handleRegister} />} />
      </Routes>
    </Router>
  );
}

export default App;
