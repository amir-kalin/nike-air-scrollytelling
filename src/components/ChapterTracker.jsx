import React from 'react';
import { playUiTone } from '../utils/audio';

export default function ChapterTracker({ activeChapter, onNavigate }) {
  const chapters = [
    { num: '01', name: 'SILHOUETTE' },
    { num: '02', name: 'ELEVATION' },
    { num: '03', name: 'MACRO GRAIN' },
    { num: '04', name: 'SPECIFICATIONS' },
  ];

  return (
    <aside className="chapter-tracker">
      {chapters.map((ch, idx) => (
        <React.Fragment key={ch.num}>
          <div
            className={`chapter-item ${activeChapter === idx ? 'active' : ''}`}
            onClick={() => {
              playUiTone(560, 'sine', 0.08, 0.04);
              onNavigate(idx);
            }}
          >
            <span className="chapter-num">{ch.num}</span>
            <span className="chapter-name">{ch.name}</span>
          </div>
          {idx < chapters.length - 1 && <div className="chapter-line" />}
        </React.Fragment>
      ))}
    </aside>
  );
}
