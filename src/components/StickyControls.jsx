import React from 'react';
import { ArrowUp } from 'lucide-react';
import { playUiTone } from '../utils/audio';

export default function StickyControls({
  scrollProgress,
  isDarkMode,
  onToggleTheme,
  onScrollTop,
}) {
  return (
    <aside className="sticky-footer-bar">
      <div className="footer-control-left">
        <div className="live-scroll-pct">
          EDITION // {Math.round(scrollProgress * 100)}%
        </div>
      </div>

      <div className="footer-control-center">
        <div className="view-mode-pill">
          <button
            className={`mode-btn ${!isDarkMode ? 'active' : ''}`}
            onClick={() => {
              if (isDarkMode) {
                playUiTone(440, 'triangle', 0.08, 0.04);
                onToggleTheme(false);
              }
            }}
          >
            STUDIO
          </button>
          <button
            className={`mode-btn ${isDarkMode ? 'active' : ''}`}
            onClick={() => {
              if (!isDarkMode) {
                playUiTone(380, 'triangle', 0.08, 0.04);
                onToggleTheme(true);
              }
            }}
          >
            DARK
          </button>
        </div>
      </div>

      <div className="footer-control-right">
        <button
          className="btn-top"
          onClick={() => {
            playUiTone(620, 'sine', 0.08, 0.04);
            onScrollTop();
          }}
          aria-label="Back to Top"
        >
          <span>TOP</span>
          <ArrowUp size={14} />
        </button>
      </div>
    </aside>
  );
}
