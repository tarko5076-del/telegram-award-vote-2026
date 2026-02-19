# Telegram Awards 2026

**Full-stack community voting platform** built for the Sidama Region (Awasa, Ethiopia) — celebrating local creators, artists, athletes, entrepreneurs, and more.

A modern, mobile-first web application where users vote once per category, see real-time results, and share their support — all wrapped in a sleek dark theme, smooth touch interactions, glowing avatars, and live updates.

Built from scratch with ❤️ in Awasa to give voice and visibility to Sidama talents.

## 🔥 Live Demo
👉 [https://telegram-awards-2026.vercel.app](https://telegram-awards-2026.vercel.app)  
(Frontend on Vercel | Backend + MySQL on Render)

## Screenshots
(Coming soon — will add: homepage, glowing nominee card, vote success popup, mobile view)

## Key Features
- **7 real categories** celebrating Sidama/Ethiopian talent  
  Best Informative • Best Memer • Best Editor & Designer • Lifestyle • Businessman • Best Football Player • Best Artist
- Real nominees with **actual photos** (hosted on Imgur)
- **One vote per category** — duplicate votes prevented via IP tracking
- **Real-time vote updates** — counts refresh instantly (no page reload)
- **Mobile-first design** with smooth touch feedback (scale + ripple on press)
- **Confetti celebration** + success popup with auto-close & scroll-to-top
- **Dark theme** with glowing circular avatars + hover lift effects
- **Responsive grid** — adapts from 1 to 3 columns
- **Secure backend** — Express REST API with MySQL/MariaDB connection pool

## Tech Stack (Full-Stack)
| Layer            | Technology              | Purpose                                      |
|------------------|--------------------------|----------------------------------------------|
| Frontend         | React + Vite            | Fast UI, components, real-time state         |
| Styling          | Custom CSS (dark theme) | Glowing effects, ripple, mobile touch        |
| Backend          | Node.js + Express       | REST API, voting logic, duplicate prevention |
| Database         | MySQL / MariaDB         | Nominees, votes, referential integrity       |
| Hosting          | Vercel (frontend) + Render (backend & DB) | Free, fast, auto-deploys                     |
| Image Hosting    | Imgur                   | Direct links for real nominee photos         |
| Extras           | canvas-confetti         | Celebration animation on vote                |

## Project Structure
telegram-vote/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # NomineeCard, VotePopup
│   │   ├── pages/          # Admin (future)
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── backend/                # Node.js + Express server
│   ├── routes/
│   ├── models/
│   ├── config/db.js
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md

## Local Setup (Development)

### Prerequisites
- Node.js v18+
- MySQL or MariaDB running locally
- Git

