// src/components/VotePopup.jsx
import { useEffect } from 'react';

function VotePopup({ nomineeName, onClose }) {
  const appLink = window.location.origin; // or hardcode your deployed URL later
  const shareText = `I just voted for ${nomineeName} in the Telegram Awards 2026! Come vote too! 🎉\n${appLink}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Telegram Awards 2026',
          text: shareText,
          url: appLink,
        });
      } catch (err) {
        console.log('Share failed', err);
        fallbackCopy();
      }
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    navigator.clipboard.writeText(shareText);
    alert('Link copied to clipboard! Paste it in Telegram or WhatsApp.');
  };

  // Auto-close after 5 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Vote Successful!</h2>
        <p>Thank you for voting for <strong>{nomineeName}</strong>!</p>
        <p>Your vote has been counted.</p>

        <button className="share-btn" onClick={handleShare}>
          Share Your Vote
        </button>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default VotePopup;