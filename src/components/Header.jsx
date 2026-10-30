import React from 'react';
import { PlayCircle, Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { playUiTone } from '../utils/audio';

export default function Header({
  activeChapter,
  onNavigate,
  onOpenVideo,
  audioEnabled,
  onToggleAudio,
  onGetAccess,
}) {
  const navItems = [
    { label: '01 // OVERVIEW', target: 0 },
    { label: '02 // GEOMETRY', target: 1 },
    { label: '03 // CRAFT', target: 2 },
    { label: '04 // SHOWROOM', target: 3 },
  ];

  return (
    <header className="site-header">
      <div className="header-left">
        <button
          className="brand-logo"
          onClick={() => onNavigate(0)}
          aria-label="Home"
        >
          <svg className="header-swoosh" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.71 6.32C17.47 8.35 12.38 11.23 8.3 14.39C6.67 15.65 5.37 16.92 4.49 18.14C3.89 18.97 3.5 19.82 3.5 20.65C3.5 21.6 4.15 22 5.09 22C6.41 22 8.42 21.05 10.74 19.34C15.02 16.19 19.85 11.66 22 6.55L21.71 6.32Z" />
          </svg>
          <span className="edition-label">AIR JORDAN IV</span>
        </button>
      </div>

      <nav className="header-center">
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.target}>
              <button
                className={`nav-link ${activeChapter === item.target ? 'active' : ''}`}
                onClick={() => {
                  playUiTone(580, 'sine', 0.08, 0.04);
                  onNavigate(item.target);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-right">
        <button
          className="video-modal-btn"
          onClick={() => {
            playUiTone(620, 'sine', 0.08, 0.04);
            onOpenVideo();
          }}
        >
          <PlayCircle size={15} />
          <span>WATCH REEL</span>
        </button>

        <button
          className="audio-btn"
          onClick={onToggleAudio}
          aria-label="Toggle Sound"
        >
          {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{audioEnabled ? 'SOUND: ON' : 'SOUND: OFF'}</span>
        </button>

        <button
          className="action-pill"
          onClick={() => {
            playUiTone(880, 'triangle', 0.12, 0.07);
            onGetAccess();
          }}
        >
          <span>GET ACCESS</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </header>
  );
}
