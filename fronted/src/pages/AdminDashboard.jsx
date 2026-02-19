import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [nominees, setNominees] = useState([]);
  const [form, setForm] = useState({
    category: '',
    name: '',
    image_url: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple auth check (from login page)
    if (!localStorage.getItem('isAdmin')) {
      navigate('/admin/login');
    }
    fetchNominees();
  }, [navigate]);

  const fetchNominees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/nominees/all');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNominees(data);
    } catch (err) {
      setMessage('Error loading nominees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/nominees/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      
      setMessage('Nominee added successfully!');
      setForm({ category: '', name: '', image_url: '' });
      fetchNominees(); // refresh list
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
      background: '#0f172a',
      minHeight: '100vh',
      color: '#e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <button
          onClick={logout}
          style={{
            padding: '0.8rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {message && (
        <p style={{
          color: message.includes('Error') ? '#ff4444' : '#4ade80',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: message.includes('Error') ? '#7f1d1d' : '#14532d',
          borderRadius: '8px'
        }}>
          {message}
        </p>
      )}

      {/* Add New Nominee Form */}
      <section style={{
        background: '#1e293b',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginTop: 0 }}>Add New Nominee</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Best Artist"
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Dagmawi Dejene"
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL (Imgur direct link)</label>
            <input
              type="url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://i.imgur.com/XXXXXX.jpg"
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.9rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Add Nominee
          </button>
        </form>
      </section>

      {/* List of Nominees */}
      <section>
        <h2>All Nominees ({nominees.length})</h2>
        {nominees.length === 0 ? (
          <p>No nominees yet. Add one above.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {nominees.map(nom => (
              <div key={nom.id} style={{
                background: '#1e293b',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #334155'
              }}>
                <strong>{nom.name}</strong>
                <br />
                <small style={{ color: '#94a3b8' }}>{nom.category}</small>
                <br />
                {nom.image_url ? (
                  <img 
                    src={nom.image_url} 
                    alt={nom.name} 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      marginTop: '0.5rem',
                      border: '2px solid #334155'
                    }} 
                  />
                ) : (
                  <small>No photo</small>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;