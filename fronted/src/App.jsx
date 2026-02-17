import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import NomineeCard from './components/NomineeCard';
import VotePopup from './components/VotePopup';
// import Admin from './components/Admin';

function App() {
  const [categories, setCategories] = useState([]);
  const [votedCategories, setVotedCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [votedNomineeName, setVotedNomineeName] = useState('');

  useEffect(() => {
    const fetchNominees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/nominees');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNominees();
  }, []);

  const totalVotes = categories.reduce((sum, cat) =>
    sum + cat.nominees.reduce((s, n) => s + n.votes, 0), 0);

  const handleVote = async (categoryIndex, nomineeId) => {
    const categoryTitle = categories[categoryIndex].title;
    if (votedCategories[categoryTitle]) return;

    try {
      const response = await fetch('http://localhost:5000/api/votes/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominee_id: nomineeId, category: categoryTitle })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Vote failed');
      }

      const data = await response.json();
      setCategories(data.nominees);

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

  return (
    <div className="container">
      <header>
        <h1>Telegram Awards 2026</h1>
        <p>Vote for your favorites • One vote per category</p>
        {totalVotes > 0 && <div className="total-votes">Total votes cast: {totalVotes}</div>}
      </header>

      <main>
        {categories.map((category, catIndex) => (
          <section key={category.title} className="category-section">
            <h2>{category.title}</h2>
            <p>{category.description}</p>

            <div className="nominees-wrapper">
              {category.nominees.map(nominee => {
                const percentage = totalVotes > 0
                  ? Math.round((nominee.votes / totalVotes) * 100)
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
        ))}
      </main>

      <footer>
        <p>Community Voting Platform • Central Ethiopia Regional State • 2026</p>
      </footer>

      {showPopup && (
        <VotePopup nomineeName={votedNomineeName} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default App;