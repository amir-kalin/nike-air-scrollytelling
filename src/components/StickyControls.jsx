import React from 'react';
import { ArrowUp, Disc3 } from 'lucide-react';
import { playUiTone } from '../utils/audio';

export default function StickyControls({
  scrollProgress,
  onScrollTop,
}) {
  return (
    <aside className="sticky-footer-bar">
      <div className="footer-control-left">
        <div className="live-scroll-pct">
          <Disc3 size={14} className="spin-slow" />
          <span>EDITION // {Math.round(scrollProgress * 100)}%</span>
        </div>
      </div>

      <div className="footer-control-center">
        <div className="view-mode-pill">
          <span className="edition-tagline">OFF-WHITE // RETRO "SAIL" ARCHIVE</span>
        </div>
      </div>

      <div className="footer-control-right">
        <button
          className="btn-top"
          onClick={() => {
            playUiTone(620, 'sine', 0.08, 0.04);
            onScrollTop();
          }}
          aria-label="Scroll back to top"
        >
          <span>TOP</span>
          <ArrowUp size={14} />
        </button>
      </div>
    </aside>
  );
}
