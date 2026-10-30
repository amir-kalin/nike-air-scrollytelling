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
  const [currentFrame, setCurrentFrame] = useState(1);
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const lenisRef = useRef(null);
  const isManualScrubbingRef = useRef(false);
  const lastPlayedFrameRef = useRef(1);

  // --- 1. Canvas Rendering Engine ---
  const renderFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clampedIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIdx)));
    const img = imagesRef.current[clampedIdx - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Aspect ratio containment
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const screenRatio = width / height;

    let drawW, drawH, drawX, drawY;

    if (screenRatio > 1.2) {
      // Landscape desktop: smoothly shift shoe to left as user advances through story
      drawH = height * 0.88;
      drawW = drawH * imgRatio;

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollPct = window.scrollY / maxScroll;
      const targetCenterX = gsap.utils.interpolate(width * 0.5, width * 0.34, Math.min(1, scrollPct * 2.2));

      drawX = targetCenterX - drawW / 2;
      drawY = (height - drawH) / 2;
    } else {
      // Mobile / Portrait: centered
      drawW = width * 0.95;
      drawH = drawW / imgRatio;
      drawX = (width - drawW) / 2;
      drawY = (height - drawH) / 2;
    }

    // Studio background gradient matching video perimeter
    if (!isDarkMode) {
      const gradient = ctx.createLinearGradient(0, drawY, 0, drawY + drawH);
      gradient.addColorStop(0, '#9c9c9e');
      gradient.addColorStop(0.35, '#b6b6b6');
      gradient.addColorStop(1, '#b6b6b6');
      ctx.fillStyle = gradient;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0e0f12');
      gradient.addColorStop(0.5, '#131418');
      gradient.addColorStop(1, '#18191d');
      ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, width, height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Top edge feather
    const topFeatherH = Math.min(drawH * 0.08, 60);
    const topGrad = ctx.createLinearGradient(0, drawY, 0, drawY + topFeatherH);
    topGrad.addColorStop(0, isDarkMode ? '#0e0f12' : '#9c9c9e');
    topGrad.addColorStop(1, isDarkMode ? 'rgba(14, 15, 18, 0)' : 'rgba(156, 156, 158, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(drawX - 2, drawY - 2, drawW + 4, topFeatherH + 2);

    // Left and Right edge feather
    const sideFeatherW = Math.min(drawW * 0.16, 100);

    const leftGrad = ctx.createLinearGradient(drawX, 0, drawX + sideFeatherW, 0);
    leftGrad.addColorStop(0, isDarkMode ? '#0e0f12' : '#b6b6b6');
    leftGrad.addColorStop(1, isDarkMode ? 'rgba(14, 15, 18, 0)' : 'rgba(182, 182, 182, 0)');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(drawX - 2, drawY, sideFeatherW + 2, drawH);

    const rightGrad = ctx.createLinearGradient(drawX + drawW, 0, drawX + drawW - sideFeatherW, 0);
    rightGrad.addColorStop(0, isDarkMode ? '#0e0f12' : '#b6b6b6');
    rightGrad.addColorStop(1, isDarkMode ? 'rgba(14, 15, 18, 0)' : 'rgba(182, 182, 182, 0)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(drawX + drawW - sideFeatherW, drawY, sideFeatherW + 2, drawH);

    setCurrentFrame(clampedIdx);
  }, [isDarkMode]);

  // Handle Canvas Resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    renderFrame(currentFrame);
  }, [renderFrame, currentFrame]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // --- 2. Frame Preloading Engine ---
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
  }, [handleResize]);

  // --- 3. Lenis & GSAP ScrollTrigger Integration ---
  useEffect(() => {
    if (!isLoaded) return;

    handleResize();

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
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
        scrub: 0.6,
        onUpdate: () => {
          if (!isManualScrubbingRef.current) {
            renderFrame(frameObj.frame);

            if (Math.abs(frameObj.frame - lastPlayedFrameRef.current) > 28) {
              lastPlayedFrameRef.current = frameObj.frame;
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
      x: -80,
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
      x: 80,
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
      y: 60,
      scale: 0.94,
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
  }, [isLoaded, renderFrame, handleResize]);

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
    renderFrame(targetFrame);
    playUiTone(300 + targetFrame * 2, 'sine', 0.04, 0.02);

    clearTimeout(window.__scrubTimeout);
    window.__scrubTimeout = setTimeout(() => {
      isManualScrubbingRef.current = false;
    }, 300);
  };

  // Theme switch
  const handleToggleTheme = (dark) => {
    setIsDarkMode(dark);
    if (dark) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    renderFrame(currentFrame);
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
        currentFrame={currentFrame}
        activeChapter={activeChapter}
      />

      {/* Main Scrollytelling Sections */}
      <main className="scrolly-container" id="scrollyContainer">
        <StorySection onNavigate={handleNavigate} />
        <Showroom
          currentFrame={currentFrame}
          totalFrames={TOTAL_FRAMES}
          onManualScrub={handleManualScrub}
          onAddToCart={handleAddToCart}
        />
      </main>

      <StickyControls
        scrollProgress={scrollProgress}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onScrollTop={handleScrollTop}
      />

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </>
  );
}
