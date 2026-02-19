import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // install if missing: npm i react-router-dom

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Simple success - save flag (upgrade to real auth later)
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#1e293b', borderRadius: '16px' }}>
      <h2>Admin Login</h2>
      {error && <p style={{ color: '#ff4444' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username (e.g. tarko)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px' }}
          required
        />
        <input
          type="password"
          placeholder="Password (simple one you set)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0', borderRadius: '8px' }}
          required
        />
        <button 
          type="submit" 
          style={{ width: '100%', padding: '0.9rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '999px', marginTop: '1rem' }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;