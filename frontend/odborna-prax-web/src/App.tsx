import './App.css'
import LoginForm from './forms/LoginForm';

function App() {
  const handleLogin = (email: string, password: string) => {
    console.log("Prihlásenie:", { email, password });
  };

  return <LoginForm onSubmit={handleLogin} />;
}

export default App
