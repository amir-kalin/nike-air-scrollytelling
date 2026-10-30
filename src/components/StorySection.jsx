import React from 'react';
import { Sparkles, Check, Feather, Grid, Wind, ArrowRight } from 'lucide-react';
import { playUiTone } from '../utils/audio';

export default function StorySection({ onNavigate }) {
  return (
    <>
      {/* SECTION 1: HERO OVERVIEW */}
      <section className="scrolly-section" id="section-hero">
        <div className="section-content hero-content">
          <div className="glass-tag">
            <span className="pulse-dot" />
            <span>SPECIAL ARCHIVE RELEASE • 2026</span>
          </div>

          <h1 className="hero-main-title">
            <span className="reveal-word">AIR </span>
            <span className="reveal-word">JORDAN </span>
            <span className="reveal-word text-outline">IV</span>
          </h1>

          <div className="hero-split">
            <div className="hero-desc-block">
              <h2 className="hero-subtitle">THE "SAIL" DECONSTRUCTION</h2>
              <p className="hero-description">
                A masterclass in textural minimalism. Sculpted with genuine tumbled
                leather, translucent TPU lattice wings, and raw-edge exposed foam
                architecture.
              </p>
              <div className="hero-cta-group">
                <button
                  className="btn-primary"
                  onClick={() => {
                    playUiTone(560, 'sine', 0.08, 0.04);
                    onNavigate(1);
                  }}
                >
                  <span>EXPLORE ARCHITECTURE</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="hero-stats-block">
              <div className="stat-item">
                <span className="stat-number">1989</span>
                <span className="stat-label">ORIGINAL ARCHITECTURE</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">RAW</span>
                <span className="stat-label">SAIL / PEACH PALETTE</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">MAX</span>
                <span className="stat-label">ENCAPSULATED AIR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TOP-DOWN DUAL ELEVATION */}
      <section className="scrolly-section" id="section-elevation">
        <div className="section-content elevation-content">
          <div className="story-side-card" id="cardElevation1">
            <span className="card-eyebrow">02 // PERSPECTIVE ROTATION</span>
            <h2 className="card-title">DUAL PAIR SYMMETRY</h2>
            <p className="card-body">
              As perspective shifts 90 degrees overhead, the dual toe-box proportion reveals
              Tinker Hatfield's legendary anatomical contouring.
            </p>
            <ul className="micro-features">
              <li>
                <Check size={16} /> Dual-density footbed with Infrared Jumpman
              </li>
              <li>
                <Check size={16} /> Reinforced lace anchor cage
              </li>
              <li>
                <Check size={16} /> Sculpted breathable quarter mesh
              </li>
            </ul>
          </div>

          <div className="story-side-card" id="cardElevation2">
            <span className="card-eyebrow">ENGINEERING SPEC</span>
            <h3 className="card-sub-title">VARIABLE LACING</h3>
            <p className="card-body">
              18-hole customizable lacing grid powered by translucent TPU wings allows
              bespoke lateral lockdown.
            </p>
            <div className="card-badge">
              <span>LOCKDOWN PERFORMANCE</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MACRO GRAIN & CRAFTSMANSHIP */}
      <section className="scrolly-section" id="section-tactile">
        <div className="section-content tactile-content">
          <div className="tactile-hero-box" id="tactileBox">
            <div className="glass-tag gold">
              <Sparkles size={14} />
              <span>MACRO RESOLUTION VIEW</span>
            </div>
            <h2 className="tactile-title">OBSESSIVE TEXTURE. ZERO COMPROMISE.</h2>
            <p className="tactile-intro">
              Every millimeter of the upper is calibrated with high-grade full-grain leather,
              featuring natural pebbled striations and hand-finished stitching.
            </p>

            <div className="spec-grid-interactive">
              <div className="spec-card">
                <div className="spec-icon-wrap">
                  <Feather size={18} />
                </div>
                <div className="spec-val">FULL GRAIN</div>
                <div className="spec-sub">Natural pebble leather</div>
              </div>
              <div className="spec-card">
                <div className="spec-icon-wrap">
                  <Grid size={18} />
                </div>
                <div className="spec-val">MOLDED MESH</div>
                <div className="spec-sub">Polyurethane dipped cage</div>
              </div>
              <div className="spec-card">
                <div className="spec-icon-wrap">
                  <Wind size={18} />
                </div>
                <div className="spec-val">AIR CHAMBER</div>
                <div className="spec-sub">Dual-pressure heel unit</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
