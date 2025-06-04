import { useState } from "react";
import { loginUser } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const Login = ({ setToken }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(username, password);
      const token = response.data.access;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Update state and redirect
      setToken(token); // This updates App.jsx state
      navigate('/');   // Redirect to dashboard
      
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed!");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      
      <div className="auth-footer">
        <p>Not a user? 
          <button 
            onClick={() => navigate('/register')} 
            className="link-button"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;