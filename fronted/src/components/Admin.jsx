// src/pages/Admin.jsx
import { useState, useEffect } from 'react';

function Admin() {
  const [nominees, setNominees] = useState([]);
  const [form, setForm] = useState({ category: '', name: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNominees();
  }, []);

  const fetchNominees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/nominees/all');
      const data = await res.json();
      setNominees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/nominees/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage('Nominee added successfully!');
      setForm({ category: '', name: '', image_url: '' });
      fetchNominees(); // refresh list
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin - Manage Nominees</h1>

      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Category</label><br />
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Best Artist"
            required
            style={{ width: '100%', padding: '0.8rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Name</label><br />
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Dagmawi Dejene"
            required
            style={{ width: '100%', padding: '0.8rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Image URL (Imgur or other direct link)</label><br />
          <input
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://i.imgur.com/XXXXXX.jpg"
            style={{ width: '100%', padding: '0.8rem' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.9rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '999px' }}>
          Add Nominee
        </button>
      </form>

      <h2>Current Nominees</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {nominees.map(n => (
          <li key={n.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '1rem' }}>
            <strong>{n.name}</strong> ({n.category})<br />
            <small>{n.image_url ? <img src={n.image_url} alt={n.name} width="80" style={{ borderRadius: '8px' }} /> : 'No photo'}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;