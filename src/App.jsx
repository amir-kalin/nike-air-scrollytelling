import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from './components/Header';
import Preloader from './components/Preloader';
import ChapterTracker from './components/ChapterTracker';
import Hotspots from './components/Hotspots';
import StorySection from './components/StorySection';
import Showroom from './components/Showroom';
import VideoModal from './components/VideoModal';
import StickyControls from './components/StickyControls';
import { initAudio, playSwooshSound, playUiTone } from './utils/audio';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 241;
const FRAME_PATH = (idx) => `/frames_webp/frame_${String(idx).padStart(4, '0')}.webp`;

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayFrame, setDisplayFrame] = useState(1);
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const canvasRef = useRef(null);
  const offCanvasRef = useRef(null);
  const imagesRef = useRef([]);
  const lenisRef = useRef(null);
  const isManualScrubbingRef = useRef(false);
  const lastPlayedFrameRef = useRef(1);
  const currentFrameRef = useRef(1);

  // --- 1. Canvas Rendering Engine ---
  const renderFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clampedIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIdx)));
    currentFrameRef.current = clampedIdx;

    const img = imagesRef.current[clampedIdx - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mathematically sampled studio gradient matching the photography studio exactly
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#9d9d9e');
    grad.addColorStop(0.2, '#9e9e9e');
    grad.addColorStop(0.4, '#ababab');
    grad.addColorStop(0.5, '#b6b6b8');
    grad.addColorStop(0.68, '#c4c3c6');
    grad.addColorStop(0.85, '#c0c0c2');
    grad.addColorStop(1, '#b6b6b6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Image sizing & positioning
    const imgRatio = img.naturalWidth / img.naturalHeight; // 800 / 1422 = ~0.5626
    const drawH = height;
    const drawW = Math.round(drawH * imgRatio);
    const drawY = 0;

    let drawX;
    if (width >= 1024) {
      // Landscape: center shoe slightly to the right to leave comfortable breathing room for story cards
      const scrollPct = scrollProgress;
      const targetCenterX = gsap.utils.interpolate(width * 0.52, width * 0.46, Math.min(1, scrollPct * 2));
      drawX = Math.round(targetCenterX - drawW / 2);
    } else {
      // Mobile / Tablet: centered
      drawX = Math.round((width - drawW) / 2);
    }

    // High performance offscreen feathering for 100% invisible edge transitions
    if (!offCanvasRef.current) {
      offCanvasRef.current = document.createElement('canvas');
    }
    const offCanvas = offCanvasRef.current;
    if (offCanvas.width !== drawW || offCanvas.height !== drawH) {
      offCanvas.width = drawW;
      offCanvas.height = drawH;
    }
    const offCtx = offCanvas.getContext('2d');
    if (offCtx) {
      offCtx.clearRect(0, 0, drawW, drawH);
      offCtx.drawImage(img, 0, 0, drawW, drawH);

      // Feather left and right edges seamlessly
      const featherW = Math.min(36, drawW * 0.1);
      offCtx.globalCompositeOperation = 'destination-in';
      const maskGrad = offCtx.createLinearGradient(0, 0, drawW, 0);
      maskGrad.addColorStop(0, 'rgba(0,0,0,0)');
      maskGrad.addColorStop(featherW / drawW, 'rgba(0,0,0,1)');
      maskGrad.addColorStop(1 - featherW / drawW, 'rgba(0,0,0,1)');
      maskGrad.addColorStop(1, 'rgba(0,0,0,0)');
      offCtx.fillStyle = maskGrad;
      offCtx.fillRect(0, 0, drawW, drawH);
      offCtx.globalCompositeOperation = 'source-over';

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offCanvas, drawX, drawY);
    } else {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }, [scrollProgress]);

  // Handle Canvas Resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // --- 2. Frame Preloading Engine (Runs STRICTLY ONCE on Mount) ---
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    let loaded = 0;
    const loadedImages = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loaded++;
        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
        setLoadProgress(pct);

        if (i === 1) {
          handleResize();
        }

        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
          document.body.classList.remove('loading-state');
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
          document.body.classList.remove('loading-state');
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 3. Lenis & GSAP ScrollTrigger Integration (Runs ONLY when loaded) ---
  useEffect(() => {
    if (!isLoaded) return;

    handleResize();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      setScrollProgress(e.progress);
    });

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Frame Scrubbing Timeline
    const frameObj = { frame: 1 };

    const scrubAnim = gsap.to(frameObj, {
      frame: TOTAL_FRAMES,
      ease: 'none',
      scrollTrigger: {
        trigger: '#scrollyContainer',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: () => {
          if (!isManualScrubbingRef.current) {
            const current = Math.round(frameObj.frame);
            renderFrame(current);

            // Only update display state if it changed by at least 2 frames to avoid React overhead
            if (Math.abs(current - lastPlayedFrameRef.current) >= 2) {
              setDisplayFrame(current);
            }

            if (Math.abs(current - lastPlayedFrameRef.current) > 28) {
              lastPlayedFrameRef.current = current;
              playSwooshSound();
            }
          }
        },
      },
    });

    // Chapter Triggers
    const sections = ['#section-hero', '#section-elevation', '#section-tactile', '#section-specs'];
    const triggers = sections.map((sel, idx) =>
      ScrollTrigger.create({
        trigger: sel,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setActiveChapter(idx),
        onEnterBack: () => setActiveChapter(idx),
      })
    );

    // Section 2 side card entrance
    const card1Anim = gsap.from('#cardElevation1', {
      x: -60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#section-elevation',
        start: 'top 65%',
        toggleActions: 'play reverse play reverse',
      },
    });

    const card2Anim = gsap.from('#cardElevation2', {
      x: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#section-elevation',
        start: 'top 55%',
        toggleActions: 'play reverse play reverse',
      },
    });

    // Section 3 tactile entrance
    const tactileAnim = gsap.from('#tactileBox', {
      y: 50,
      scale: 0.96,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#section-tactile',
        start: 'top 60%',
        toggleActions: 'play reverse play reverse',
      },
    });

    return () => {
      gsap.ticker.remove(updateLenis);
      scrubAnim.kill();
      triggers.forEach((t) => t.kill());
      card1Anim.kill();
      card2Anim.kill();
      tactileAnim.kill();
      lenis.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Navigate to section
  const handleNavigate = (index) => {
    const sections = ['#section-hero', '#section-elevation', '#section-tactile', '#section-specs'];
    const selector = sections[index];
    if (!selector) return;

    const el = document.querySelector(selector);
    if (lenisRef.current && el) {
      lenisRef.current.scrollTo(el, { offset: -40 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to Top
  const handleScrollTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Manual 360 Scrubber
  const handleManualScrub = (targetFrame) => {
    isManualScrubbingRef.current = true;
    setDisplayFrame(targetFrame);
    renderFrame(targetFrame);
    playUiTone(300 + targetFrame * 2, 'sine', 0.04, 0.02);

    clearTimeout(window.__scrubTimeout);
    window.__scrubTimeout = setTimeout(() => {
      isManualScrubbingRef.current = false;
    }, 300);
  };

  // Audio Toggle
  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) {
      initAudio();
      playUiTone(880, 'triangle', 0.1, 0.06);
    }
  };

  // Add to Cart
  const handleAddToCart = (size) => {
    alert(`Nike Air Jordan IV "Sail" Retro (Size: ${size}) added to your bag!`);
  };

  return (
    <>
      <Preloader progress={loadProgress} isLoaded={isLoaded} />

      <Header
        activeChapter={activeChapter}
        onNavigate={handleNavigate}
        onOpenVideo={() => setIsVideoOpen(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        onGetAccess={() => handleNavigate(3)}
      />

      <ChapterTracker
        activeChapter={activeChapter}
        onNavigate={handleNavigate}
      />

      {/* Fixed Canvas Viewport */}
      <div className="canvas-viewport" id="canvasViewport">
        <canvas ref={canvasRef} id="motionCanvas" />
        <div className="canvas-glow" />
      </div>

      {/* Hotspots for Sections 1, 2, 3 */}
      <Hotspots
        currentFrame={displayFrame}
        activeChapter={activeChapter}
      />

      {/* Main Scrollytelling Sections */}
      <main className="scrolly-container" id="scrollyContainer">
        <StorySection onNavigate={handleNavigate} />
        <Showroom
          currentFrame={displayFrame}
          totalFrames={TOTAL_FRAMES}
          onManualScrub={handleManualScrub}
          onAddToCart={handleAddToCart}
        />
      </main>

      <StickyControls
        scrollProgress={scrollProgress}
        onScrollTop={handleScrollTop}
      />

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </>
  );
}
