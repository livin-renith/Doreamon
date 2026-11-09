"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

export default function CinematicStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef<number | null>(null);

  // Measure window dimensions reliably across mobile, tablet, and desktop
  useEffect(() => {
    const updateSize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize, { passive: true });
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Compute scroll progress through the section (0 = start of sticky, 1 = end of sticky)
  const calculateProgress = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    if (scrollableDistance <= 0) return;

    // rawProgress is 0 when rect.top == 0, and 1 when rect.top == -scrollableDistance
    const rawProgress = -rect.top / scrollableDistance;
    const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
    setProgress(clampedProgress);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(calculateProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    calculateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [calculateProgress]);

  // Subtle interactive light reflection for the final immersive state
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewport.width === 0 || viewport.height === 0) return;
    setMousePos({
      x: e.clientX / viewport.width,
      y: e.clientY / viewport.height,
    });
  };

  // Cubic smooth easing for natural physical expansion
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const p = progress;
  const expansion = easeInOutCubic(p);

  // Compute initial portrait size (exact 9:16 portrait ratio) with generous negative space
  let initialWidth = 320;
  if (viewport.width < 640) {
    // Mobile: ~220px wide with ample negative space around
    initialWidth = Math.min(viewport.width * 0.60, 220);
  } else if (viewport.width < 1024) {
    // Tablet: ~270px wide
    initialWidth = Math.min(viewport.width * 0.38, 270);
  } else {
    // Desktop: ~320px wide in a 1440+ px canvas (>75% negative space)
    initialWidth = Math.min(viewport.width * 0.23, 330);
  }
  const initialHeight = initialWidth * (16 / 9);

  // Smoothly interpolate dimensions from portrait box to full viewport
  const currentWidth = initialWidth + (viewport.width - initialWidth) * expansion;
  const currentHeight = initialHeight + (viewport.height - initialHeight) * expansion;
  const currentRadius = (1 - expansion) * 16;
  const currentBorderOpacity = Math.max(0, (1 - p * 2.2) * 0.3);

  // Helper for staggered exit animations of the editorial text items
  const getExitStyle = (
    start: number,
    end: number,
    slideX: number,
    slideY: number,
    baseRotate: number,
    extraRotate: number,
    scaleFactor = 0.12
  ) => {
    const t = Math.min(Math.max((p - start) / (end - start), 0), 1);
    const ease = t * (2 - t); // Quad ease-out
    const opacity = 1 - ease;
    const currentSlideX = ease * slideX;
    const currentSlideY = ease * slideY;
    const currentRotate = baseRotate + ease * extraRotate;
    const currentScale = 1 - ease * scaleFactor;

    return {
      opacity,
      transform: `translate3d(${currentSlideX}px, ${currentSlideY}px, 0) rotate(${currentRotate}deg) scale(${currentScale})`,
      pointerEvents: opacity < 0.05 ? ("none" as const) : ("auto" as const),
      visibility: opacity <= 0 ? ("hidden" as const) : ("visible" as const),
      transition: "opacity 0.05s linear",
    };
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[320vh] bg-[#000000] text-white select-none overflow-visible"
    >
      {/* STICKY FULL-VIEWPORT STAGE */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#000000]">
        {/* Subtle gallery background ambience */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(14,35,60,0.18)_0%,_transparent_75%)] pointer-events-none" />

        {/* Delicate exhibition corner crosshairs (fades out early) */}
        <div
          style={{ opacity: Math.max(0, 1 - p * 3.5) }}
          className="absolute inset-0 z-10 pointer-events-none p-6 sm:p-10 flex flex-col justify-between"
        >
          <div className="flex justify-between text-white/20 font-mono text-xs">
            <span>+</span>
            <span>+</span>
          </div>
          <div className="flex justify-between text-white/20 font-mono text-xs">
            <span>+</span>
            <span>+</span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ASYMMETRIC EDITORIAL "ORGANIZED CHAOS" TEXT ELEMENTS */}
        {/* ---------------------------------------------------- */}

        {/* 1. TOP-CENTER: Exhibition Title Banner */}
        <div
          style={getExitStyle(0.02, 0.28, 0, -60, 0, 0)}
          className="absolute top-[3%] sm:top-[4%] left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none select-none"
        >
          <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.35em] text-white/50 uppercase block mb-0.5">
            INTERACTIVE DIGITAL ART EXHIBITION
          </span>
          <h2 className="text-xs sm:text-sm font-bold tracking-[0.25em] text-white/90 uppercase">
            DOREAMON // THE GAZE OF WONDER
          </h2>
        </div>

        {/* 2. TOP-LEFT: Archival Specification Designation */}
        <div
          style={getExitStyle(0.04, 0.36, -90, -40, -2.5, -8)}
          className="absolute top-[8%] sm:top-[9%] left-[4%] sm:left-[8%] z-20 max-w-[210px] select-none"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.25em] text-sky-300 uppercase">
              SPECIMEN IDENTIFIER
            </span>
          </div>
          <div className="font-mono text-xs text-white font-bold tracking-wider">
            TYPE MS-903 // GEN-22
          </div>
          <div className="text-[9px] text-neutral-400 font-mono tracking-widest mt-0.5">
            MATSUBA ROBOTICS TOKYO
          </div>
        </div>

        {/* 3. TOP-RIGHT: Optical Matrix 2.0 Sensor Card */}
        <div
          style={getExitStyle(0.07, 0.40, 110, -50, 2.0, 10)}
          className="absolute top-[8%] sm:top-[10%] right-[4%] sm:right-[8%] z-20 max-w-[240px] select-none"
        >
          <div className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/15 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-[9px] font-mono text-sky-400 mb-1">
              <span>OPTICAL MATRIX 2.0</span>
              <span className="text-white/60">500 MP</span>
            </div>
            <p className="text-[11px] text-white/85 font-sans leading-tight">
              Dual ocular multi-spectrum infrared lenses with dynamic gaze tracking.
            </p>
          </div>
        </div>

        {/* 4. FAR RIGHT UPPER: Exhibition Essay Thought (Tablet & Desktop) */}
        <div
          style={getExitStyle(0.10, 0.44, 140, -20, 1.2, -6)}
          className="absolute top-[23%] right-[2%] sm:right-[5%] z-20 max-w-[210px] hidden sm:block select-none"
        >
          <div className="border-l-2 border-sky-400/60 pl-3 py-0.5">
            <p className="font-serif italic text-xs text-neutral-300 leading-snug">
              “In the quiet curve of a mechanical gaze, the future learned to dream.”
            </p>
            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-neutral-500 mt-1 block">
              TOKYO ESSAY // ARCHIVE 2112
            </span>
          </div>
        </div>

        {/* 5. MID-LEFT: Canonical Proportions Numeral (129.3) */}
        <div
          style={getExitStyle(0.12, 0.46, -130, 20, -1.0, -5)}
          className="absolute top-[34%] left-[3%] sm:left-[6%] z-20 select-none"
        >
          <span className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white/[0.12] block select-none leading-none">
            129.3
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-sky-300 font-semibold">
              STATURE: 129.3 CM • 129.3 KG
            </span>
          </div>
          <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block">
            CANONICAL MATRIX // EST. 2112
          </span>
        </div>

        {/* 6. MID-RIGHT: Radar Vibrissae Telemetry */}
        <div
          style={getExitStyle(0.14, 0.50, 130, 20, -1.8, 8)}
          className="absolute top-[37%] right-[3%] sm:right-[7%] z-20 select-none"
        >
          <div className="px-3.5 py-2.5 rounded-lg border border-white/15 bg-black/50 backdrop-blur-md shadow-lg max-w-[210px]">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400 uppercase tracking-wider mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>RADAR VIBRISSAE (6 UNITS)</span>
            </div>
            <div className="text-xs font-semibold text-white/95">
              Ultrasonic Proximity Array
            </div>
            <div className="text-[9px] font-mono text-sky-300/80 mt-1">
              RANGE: 820M // 43.2 KHZ
            </div>
          </div>
        </div>

        {/* 7. BOTTOM-LEFT: 4D Pocket Continuum Node */}
        <div
          style={getExitStyle(0.18, 0.56, -120, 60, 2.5, 12)}
          className="absolute bottom-[11%] left-[4%] sm:left-[8%] z-20 max-w-[230px] select-none"
        >
          <div className="px-3.5 py-2.5 rounded-lg bg-sky-950/40 border border-sky-400/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-sky-300 tracking-wider uppercase font-semibold">
                4D POCKET CONTINUUM
              </span>
            </div>
            <p className="text-[10px] text-neutral-300 leading-tight">
              Spatial sub-warp manifold linked directly to 22nd century reserves.
            </p>
            <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-neutral-400 border-t border-white/10 pt-1.5">
              <span>CAPACITY: ∞</span>
              <span className="text-emerald-400 font-bold">SYNC ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 8. BOTTOM-RIGHT: Olfactory Reboot Switch Node */}
        <div
          style={getExitStyle(0.20, 0.60, 120, 60, -2.2, -10)}
          className="absolute bottom-[11%] right-[4%] sm:right-[8%] z-20 max-w-[220px] select-none"
        >
          <div className="px-3.5 py-2.5 rounded-lg bg-red-950/25 border border-red-500/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              <span>OLFACTORY SWITCH NODE</span>
            </div>
            <div className="text-xs font-semibold text-white">
              Emergency Diagnostic Switch
            </div>
            <div className="text-[9px] text-neutral-400 mt-0.5 font-mono">
              Direct reboot & cranial sensor reset
            </div>
          </div>
        </div>

        {/* 9. BOTTOM-CENTER: Scroll Prompt */}
        <div
          style={getExitStyle(0.03, 0.26, 0, 45, 0, 0)}
          className="absolute bottom-[4%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 select-none pointer-events-none"
        >
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/60">
            SCROLL TO IMMERSE
          </span>
          <div className="w-4 h-6 rounded-full border border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-white animate-bounce" />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CENTER SCALING IMAGE CONTAINER (9:16 -> FULL SCREEN) */}
        {/* ---------------------------------------------------- */}
        <div
          className="relative z-15 overflow-hidden flex items-center justify-center transition-shadow duration-300"
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            borderRadius: `${currentRadius}px`,
            border: currentBorderOpacity > 0.01 ? `1px solid rgba(255, 255, 255, ${currentBorderOpacity})` : "none",
            boxShadow:
              p < 0.8
                ? "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.12)"
                : "none",
            willChange: "width, height, border-radius",
          }}
        >
          {/* Main Portrait Artwork */}
          <img
            src="/doraemon_face.jpg"
            alt="Doraemon Face Close-up"
            className="w-full h-full object-cover object-center select-none"
            style={{
              transform: `scale(${1 + p * 0.08})`,
              transition: "transform 0.1s ease-out",
            }}
            draggable={false}
          />

          {/* Subtle Vignette Scrim (fades out as it becomes full-screen) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: Math.max(0, 1 - p * 1.5) * 0.25,
              background: "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* Interactive museum lighting shine that glides with mouse in final immersive state */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              opacity: Math.max(0, (p - 0.7) / 0.3) * 0.25,
              background: `radial-gradient(circle 350px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255, 255, 255, 0.4) 0%, transparent 80%)`,
              mixBlendMode: "overlay",
            }}
          />
        </div>
      </div>
    </section>
  );
}

