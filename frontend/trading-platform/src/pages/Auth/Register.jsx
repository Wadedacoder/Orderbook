import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/login'); // Redirect to login after registration
    } catch (error) {
      alert('Registration failed!');
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <button type="submit">Register</button>
      </form>
      
      <div className="auth-footer">
        <p>Already have an account? 
          <button 
            onClick={() => navigate('/login')} 
            className="link-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}