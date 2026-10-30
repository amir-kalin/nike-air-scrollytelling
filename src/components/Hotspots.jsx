import React from 'react';

export default function Hotspots({ currentFrame, activeChapter }) {
  // Suppress in showroom section 4 (activeChapter === 3 or frame > 180)
  if (activeChapter === 3 || currentFrame > 180) {
    return null;
  }

  const inTopDown = currentFrame >= 75 && currentFrame <= 135;
  const inProfile = currentFrame >= 15 && currentFrame <= 70;

  return (
    <div className="hotspots-container">
      {/* Hotspot 1: Flight Tongue */}
      <div
        className={`hotspot ${inTopDown ? 'visible' : ''}`}
        id="hotspotTongue"
      >
        <div className="hotspot-pulse" />
        <div className="hotspot-card">
          <span className="hotspot-tag">ORIGINAL DETAIL</span>
          <h4>EMBOSSED FLIGHT TONGUE</h4>
          <p>Inverted Flight script with Infrared Jumpman interior lining.</p>
        </div>
      </div>

      {/* Hotspot 2: Netting */}
      <div
        className={`hotspot ${inProfile || inTopDown ? 'visible' : ''}`}
        id="hotspotNetting"
      >
        <div className="hotspot-pulse" />
        <div className="hotspot-card">
          <span className="hotspot-tag">AERODYNAMICS</span>
          <h4>URETHANE-COATED NETTING</h4>
          <p>Tinker Hatfield's game-changing 1989 weight-reduction mesh.</p>
        </div>
      </div>

      {/* Hotspot 3: Air Sole Unit */}
      <div
        className={`hotspot ${inProfile ? 'visible' : ''}`}
        id="hotspotAir"
      >
        <div className="hotspot-pulse" />
        <div className="hotspot-card">
          <span className="hotspot-tag">CUSHIONING</span>
          <h4>VISIBLE AIR-SOLE UNIT</h4>
          <p>Pressurized gas pod encased in a peachy polyurethane midsole.</p>
        </div>
      </div>
    </div>
  );
}
