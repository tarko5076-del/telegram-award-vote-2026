import { useState } from 'react';

function NomineeCard({ nominee, percentage, disabled, onVote }) {
  const [isPressing, setIsPressing] = useState(false);

  const handlePressStart = (e) => {
    if (disabled) return;

    // Calculate touch position for ripple
    if (e.touches && e.touches.length > 0) {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;

      btn.style.setProperty('--touch-x', `${x}%`);
      btn.style.setProperty('--touch-y', `${y}%`);
    }

    setIsPressing(true);
  };

  const handlePressEnd = () => {
    if (disabled) return;
    setIsPressing(false);
    onVote(); // Trigger vote on release
  };

  // Very reliable fallback — uses ui-avatars with name
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nominee.name || 'Unknown'
  )}&background=0d9cf5&color=fff&size=256&bold=true&rounded=true`;

  // Debug: log when component renders and what URL is used
  console.log('NomineeCard rendered:', {
    name: nominee.name,
    imageUrl: nominee.image || nominee.image_url || 'no url',
    fallback: fallbackImage
  });

  return (
    <div className="nominee-card">
      <div className="image-wrapper">
        <img
          src={nominee.image || nominee.image_url || fallbackImage}  // ← try image first, then image_url, then fallback
          alt={nominee.name || 'Nominee'}
          className="nominee-image"
          loading="lazy"  // improves performance
          crossOrigin="anonymous"  // helps with some CORS edge cases
          onLoad={() => console.log('Image loaded OK:', nominee.name)}
          onError={(e) => {
            console.error('Image FAILED to load:', {
              name: nominee.name,
              attemptedUrl: e.target.src,
              fallbackUsed: fallbackImage
            });
            e.target.src = fallbackImage; // switch to fallback
            e.target.onerror = null; // prevent infinite loop
          }}
        />
      </div>

      <div className="card-content">
        <h3 className="card-name">{nominee.name || 'Unnamed'}</h3>

        <div className="vote-stats">
          <span>Votes: {nominee.votes || 0}</span>
          <span className="percentage">{percentage}%</span>
        </div>

        <div className="progress-outer">
          <div
            className="progress-inner"
            style={{ width: `${percentage || 0}%` }}
          />
        </div>

        <button
          className={`vote-btn ${disabled ? 'disabled' : 'active'} ${
            isPressing ? 'pressing' : ''
          }`}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onClick={(e) => {
            if (!('ontouchstart' in window)) {
              onVote();
            }
          }}
          disabled={disabled}
          type="button"
        >
          {disabled ? 'Already Voted' : 'Vote'}
        </button>
      </div>
    </div>
  );
}

export default NomineeCard;