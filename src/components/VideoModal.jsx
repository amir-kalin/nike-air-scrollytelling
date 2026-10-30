import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { playUiTone } from '../utils/audio';

export default function VideoModal({ isOpen, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className={`video-modal ${isOpen ? 'open' : ''}`}>
      <div
        className="video-modal-backdrop"
        onClick={() => {
          playUiTone(400, 'sine', 0.08, 0.04);
          onClose();
        }}
      />
      <div className="video-modal-content">
        <div className="video-modal-header">
          <span className="video-modal-title">
            ORIGINAL FOOTAGE // NIKE AIR JORDAN IV
          </span>
          <button
            className="video-close-btn"
            onClick={() => {
              playUiTone(400, 'sine', 0.08, 0.04);
              onClose();
            }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src="/nike_air_jordan.mp4"
            controls
            loop
            playsInline
          />
        </div>
      </div>
    </div>
  );
}
