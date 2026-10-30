import React, { useState } from 'react';
import { RotateCw, Ruler, ShoppingBag, Heart, Truck, Shield, RefreshCw } from 'lucide-react';
import { playUiTone } from '../utils/audio';

export default function Showroom({ currentFrame, totalFrames, onManualScrub, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('US 9.5');
  const [isFavorite, setIsFavorite] = useState(false);

  const sizes = [
    'US 7.5', 'US 8.0', 'US 8.5', 'US 9.0', 'US 9.5',
    'US 10.0', 'US 10.5', 'US 11.0', 'US 11.5', 'US 12.0'
  ];

  return (
    <section className="scrolly-section" id="section-specs">
      <div className="section-content showroom-content">
        <div className="showroom-wrapper">
          <div className="showroom-header">
            <span className="card-eyebrow">04 // COMPLETE ARCHIVE</span>
            <h2 className="showroom-title">AIR JORDAN IV "SAIL"</h2>
            <div className="price-tag">
              $220 USD <span className="edition-badge">LIMITED ALLOCATION</span>
            </div>
          </div>

          {/* Interactive 360 Scrubber Bar */}
          <div className="interactive-scrubber-box">
            <div className="scrubber-header">
              <div className="scrubber-label">
                <RotateCw size={14} />
                <span>INTERACTIVE 360° FRAME CONTROLLER</span>
              </div>
              <div className="frame-counter">
                FRAME: {currentFrame} / {totalFrames}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max={totalFrames}
              value={currentFrame}
              onChange={(e) => onManualScrub(parseInt(e.target.value, 10))}
              className="custom-slider"
              aria-label="Manual 360 rotation slider"
            />
            <div className="scrubber-hint">
              Drag slider to examine any angle of the sneaker
            </div>
          </div>

          {/* Size & Purchase Box */}
          <div className="purchase-card">
            <div className="selector-row">
              <span className="selector-title">SELECT SIZE (US MEN):</span>
              <button
                className="size-guide-btn"
                onClick={() => playUiTone(500, 'sine', 0.05, 0.03)}
              >
                <Ruler size={13} />
                <span>SIZE GUIDE</span>
              </button>
            </div>

            <div className="size-grid">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSize(sz);
                    playUiTone(520, 'sine', 0.05, 0.03);
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>

            <div className="purchase-actions">
              <button
                className="btn-purchase"
                onClick={() => {
                  playUiTone(880, 'triangle', 0.15, 0.08);
                  onAddToCart(selectedSize);
                }}
              >
                <ShoppingBag size={18} />
                <span>ADD TO BAG — $220</span>
              </button>

              <button
                className={`btn-favorite ${isFavorite ? 'active' : ''}`}
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  playUiTone(!isFavorite ? 740 : 400, 'sine', 0.1, 0.05);
                }}
                aria-label="Save to Wishlist"
              >
                <Heart size={20} fill={isFavorite ? '#ff3a21' : 'none'} />
              </button>
            </div>

            <div className="guarantee-list">
              <div className="guar-item">
                <Truck size={14} />
                <span>Complimentary Express Delivery</span>
              </div>
              <div className="guar-item">
                <Shield size={14} />
                <span>100% Certified Authentic</span>
              </div>
              <div className="guar-item">
                <RefreshCw size={14} />
                <span>30-Day Hassle-Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
