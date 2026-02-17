// src/components/NomineeCard.jsx
import { useState } from 'react';

function NomineeCard({ nominee, percentage, disabled, onVote }) {
  const [isPressing, setIsPressing] = useState(false);

  const handlePressStart = (e) => {
    if (disabled) return;

    // For ripple effect - calculate touch position relative to button
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
    onVote(); // only trigger vote on release (more natural on touch devices)
  };

  // Fallback image using ui-avatars (more reliable than picsum for names)
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nominee.name
  )}&background=0d9cf5&color=fff&size=256&bold=true`;

  return (
    <div className="nominee-card">
      <div className="image-wrapper">
        <img
          src={nominee.image || fallbackImage}
          alt={nominee.name}
          className="nominee-image"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
      </div>

      <div className="card-content">
        <h3 className="card-name">{nominee.name}</h3>

        <div className="vote-stats">
          <span>Votes: {nominee.votes}</span>
          <span className="percentage">{percentage}%</span>
        </div>

        <div className="progress-outer">
          <div
            className="progress-inner"
            style={{ width: `${percentage}%` }}
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
            // Prevent double-trigger on desktop (touch events already handled)
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