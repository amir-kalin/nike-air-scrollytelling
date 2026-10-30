import React from 'react';

export default function Preloader({ progress, isLoaded }) {
  return (
    <div className={`preloader ${isLoaded ? 'fade-out' : ''}`}>
      <div className="loader-content">
        <div className="brand-badge">
          <svg className="swoosh-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.71 6.32C17.47 8.35 12.38 11.23 8.3 14.39C6.67 15.65 5.37 16.92 4.49 18.14C3.89 18.97 3.5 19.82 3.5 20.65C3.5 21.6 4.15 22 5.09 22C6.41 22 8.42 21.05 10.74 19.34C15.02 16.19 19.85 11.66 22 6.55L21.71 6.32Z" />
          </svg>
          <span className="brand-text">JORDAN // ARCHIVE</span>
        </div>
        <h1 className="loader-title">AIR JORDAN IV RETRO</h1>
        <p className="loader-subtitle">REACT SCROLLYTELLING SHOWCASE</p>

        <div className="loader-bar-wrap">
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loader-percent">{progress}%</div>
        <p className="loader-hint">Loading 241 high-definition motion frames...</p>
      </div>
    </div>
  );
}
