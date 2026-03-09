import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import NomineeCard from './components/NomineeCard';
import VotePopup from './components/VotePopup';

function App() {
  const [categories, setCategories] = useState([]);
  const [votedCategories, setVotedCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [votedNomineeName, setVotedNomineeName] = useState('');

  useEffect(() => {
    const fetchNominees = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        // Use environment variable for live deployment (Vercel)
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        console.log('Frontend: Fetching from:', `${API_URL}/api/nominees`);

        const response = await fetch(`${API_URL}/api/nominees`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          cache: 'no-cache'
        });

        console.log('Frontend: Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Backend error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Frontend: Full data received:', data);
        console.log('Frontend: Is array?', Array.isArray(data));
        console.log('Frontend: Number of categories:', data?.length || 0);
        console.log('Frontend: First category title:', data?.[0]?.title || 'none');

        if (!Array.isArray(data)) {
          throw new Error('Backend data is not an array');
        }

        setCategories(data);
      } catch (err) {
        console.error('Frontend fetch failed:', err);
        setFetchError(err.message || 'Failed to load awards');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNominees();
  }, []);

  const totalVotes = categories.reduce((sum, cat) => {
    return sum + (cat?.nominees || []).reduce((s, n) => s + (n?.votes || 0), 0);
  }, 0);

  const handleVote = async (categoryIndex, nomineeId) => {
    const categoryTitle = categories[categoryIndex]?.title;
    if (!categoryTitle || votedCategories[categoryTitle]) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/votes/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominee_id: nomineeId, category: categoryTitle })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Vote failed');
      }

      // Refresh data after vote
      const refresh = await fetch(`${API_URL}/api/nominees`);
      const refreshed = await refresh.json();
      setCategories(refreshed);

      const nomineeName = categories[categoryIndex]?.nominees.find(n => n.id === nomineeId)?.name || "this nominee";
      setVotedNomineeName(nomineeName);
      setShowPopup(true);
      setVotedCategories(prev => ({ ...prev, [categoryTitle]: true }));

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.message || 'Could not vote');
    }
  };

  if (isLoading) return <div className="loading-screen">Loading awards...</div>;

  if (fetchError) return <div className="error-screen">Error: {fetchError}</div>;

  return (
    <div className="container">
      <header>
        <h1>Telegram Awards 2026</h1>
        <p>Vote for your favorites • One vote per category</p>

        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem', color: '#94a3b8' }}>
          Developed by Tarko Melkie • UI/UX Design by Fikr Getaneh
        </p>

        {totalVotes > 0 && <div className="total-votes">Total votes cast: {totalVotes}</div>}
      </header>

      <main>
        {categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', margin: '2rem 0' }}>
            No categories loaded yet. Check console (F12) for fetch details.
          </p>
        ) : (
          categories.map((category, catIndex) => (
            <section key={category.title} className="category-section">
              <h2>{category.title}</h2>

              <div className="nominees-wrapper">
                {category.nominees?.map(nominee => {
                  const percentage = totalVotes > 0
                    ? Math.round(((nominee.votes || 0) / totalVotes) * 100)
                    : 0;

                  return (
                    <NomineeCard
                      key={nominee.id}
                      nominee={nominee}
                      percentage={percentage}
                      disabled={votedCategories[category.title]}
                      onVote={() => handleVote(catIndex, nominee.id)}
                    />
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      <footer style={{
        marginTop: 'auto',
        padding: '2.5rem 1rem',
        textAlign: 'center',
        background: 'linear-gradient(to top, #0f172a, #1e293b)',
        color: '#94a3b8',
        fontSize: '0.95rem',
        borderTop: '1px solid #334155'
      }}>
        <p style={{ marginBottom: '0.8rem', fontSize: '1.1rem', fontWeight: '600' }}>
          © 2026 Telegram Awards. All rights reserved. Community showcase of appreciation for the best in the Telegram ecosystem.
        </p>

        <p style={{ margin: '0.5rem 0' }}>
          Developed by <strong>Tarko Melkie</strong> •
          <a
            href="https://t.me/hucs145"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#60a5fa',
              textDecoration: 'none',
              marginLeft: '0.4rem',
              fontWeight: '500'
            }}
          >
            codewars
          </a>
        </p>

        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          UI & UX Design by <strong>Fikr Getaneh</strong>
        </p>
      </footer>

      {showPopup && (
        <VotePopup nomineeName={votedNomineeName} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default App;