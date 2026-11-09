"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import CinematicStorySection from "@/components/CinematicStorySection";
import DoraemonDiscoverySection from "@/components/DoraemonDiscoverySection";

const Doraemon3D = dynamic(() => import("@/components/Doraemon3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin opacity-40" />
    </div>
  ),
});

interface Creature {
  id: string;
  name: string;
  japanese: string;
  species: string;
  era: string;
  summary: string;
  traits: string[];
}

const CREATURES: Creature[] = [
  {
    id: "01",
    name: "PIISUKE",
    japanese: "ピー助",
    species: "Futabasaurus (Plesiosaur)",
    era: "Cretaceous Era (100M B.C.)",
    summary:
      "A gentle aquatic reptile hatched from a fossilized egg using the Time Cloth. Possesses profound emotional intelligence and loyalty.",
    traits: ["Aquatic", "Herbivore", "Telepathic Bond", "Ancient DNA"],
  },
  {
    id: "02",
    name: "FUUKO",
    japanese: "フー子",
    species: "Sentient Atmospheric Whirlwind",
    era: "Micro-Meteorological Entity",
    summary:
      "A playful miniature cyclone born of condensed wind and atmospheric curiosity. Expresses devotion through gentle breezes and protective gales.",
    traits: ["Aerokinetic", "Sentient Vapor", "High Agility", "Emotional Wind"],
  },
  {
    id: "03",
    name: "PEKO",
    japanese: "ペコ (クンタック王子)",
    species: "Royal Canid of Bow-Wango",
    era: "Hidden Mist Continent",
    summary:
      "Crown prince of an isolated canine civilization deep in the African rift valley, master of stealth, courage, and ancient royal lore.",
    traits: ["Bipedal Tactician", "Ancient Lineage", "Canine Empathy", "Swordsmanship"],
  },
  {
    id: "04",
    name: "CHAMMY",
    japanese: "チャミー",
    species: "Leporine Telepath",
    era: "Planet Koya Koya",
    summary:
      "A quick-witted extraterrestrial being with oversized ears sensitive to cosmic electromagnetic shifts. Loyal guardian of planetary peace.",
    traits: ["Cosmic Perception", "Sub-Light Reflexes", "Telepathic", "Zero-G Native"],
  },
  {
    id: "05",
    name: "KIBO",
    japanese: "キー坊",
    species: "Sentient Botanical Entity",
    era: "Green Planet Cycle",
    summary:
      "An enchanted sapling awakened by botanical evolution fluid. Bridges the spiritual bond between plant life and human compassion.",
    traits: ["Photosynthetic Will", "Cellular Regeneration", "Flora Whisperer", "Infinite Growth"],
  },
];

export default function Home() {
  const [isSaved, setIsSaved] = useState(false);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [showCreaturesModal, setShowCreaturesModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);

  // Cursor-following spotlight reveal state & lerp animation refs
  const [isHovering, setIsHovering] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: -1000, y: -1000 });
  const targetPosRef = useRef({ x: -1000, y: -1000 });
  const currentPosRef = useRef({ x: -1000, y: -1000 });
  const isHoveringRef = useRef(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth easing / lerp animation loop for cursor tracking
  useEffect(() => {
    const loop = () => {
      if (isHoveringRef.current) {
        const lerp = 0.12;
        const dx = targetPosRef.current.x - currentPosRef.current.x;
        const dy = targetPosRef.current.y - currentPosRef.current.y;

        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
          currentPosRef.current.x += dx * lerp;
          currentPosRef.current.y += dy * lerp;
          setSpotlightPos({
            x: Math.round(currentPosRef.current.x * 10) / 10,
            y: Math.round(currentPosRef.current.y * 10) / 10,
          });
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Cursor & touch event handlers covering the full screen
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    targetPosRef.current = { x, y };

    if (!isHoveringRef.current) {
      isHoveringRef.current = true;
      setIsHovering(true);
      currentPosRef.current = { x, y };
      setSpotlightPos({ x, y });
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    targetPosRef.current = { x, y };
    currentPosRef.current = { x, y };
    setSpotlightPos({ x, y });
    isHoveringRef.current = true;
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    setIsHovering(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!heroRef.current || e.touches.length === 0) return;
    const rect = heroRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    targetPosRef.current = { x, y };
    if (!isHoveringRef.current) {
      isHoveringRef.current = true;
      setIsHovering(true);
      currentPosRef.current = { x, y };
      setSpotlightPos({ x, y });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleTouchMove(e);
  };

  const handleTouchEnd = () => {
    isHoveringRef.current = false;
    setIsHovering(false);
  };

  // Play subtle mysterious synth chime using Web Audio API
  const playSubtleChime = (type: "soft" | "sparkle" | "click" = "click") => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "soft") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "sparkle") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // Audio not supported or blocked by policy
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCreaturesModal(false);
        setShowExploreModal(false);
        setSelectedCreature(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* HERO SECTION - 100% PRESERVED EXACTLY AS DESIGNED */}
      {/* ---------------------------------------------------- */}
      <div
        ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between selection:bg-white selection:text-sky-900 font-sans select-none bg-black"
    >
      {/* 1. BASE BACKGROUND IMAGE (BG_IMAGE_1) - Full View Edge-to-Edge */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/bg_image_1.jpg"
          alt="Doraemon World - Daytime Base"
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
        {/* Soft top gradient scrim for crystal-clear navigation readability */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/45 via-black/20 to-transparent pointer-events-none" />
        {/* Soft bottom gradient scrim for typography & button readability */}
        <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-black/55 via-black/25 to-transparent pointer-events-none" />
      </div>

      {/* 2. REVEAL IMAGE LAYER (BG_IMAGE_2) - Cursor-Following Spotlight Reveal */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none select-none overflow-hidden"
        style={{
          opacity: isHovering ? 1 : 0,
          maskImage: isHovering
            ? `radial-gradient(circle 260px at ${spotlightPos.x}px ${spotlightPos.y}px, black 0%, black 140px, rgba(0, 0, 0, 0.6) 200px, transparent 260px)`
            : "none",
          WebkitMaskImage: isHovering
            ? `radial-gradient(circle 260px at ${spotlightPos.x}px ${spotlightPos.y}px, black 0%, black 140px, rgba(0, 0, 0, 0.6) 200px, transparent 260px)`
            : "none",
          transition: "opacity 0.25s ease-out",
        }}
      >
        <img
          src="/bg_image_2.jpg"
          alt="Doraemon World - Night Reveal"
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
      </div>

      {/* 3. SOFT FEATHERED / GLOWING SPOTLIGHT EDGE EFFECT */}
      {isHovering && (
        <div
          className="absolute pointer-events-none z-[2] transition-opacity duration-300"
          style={{
            left: `${spotlightPos.x}px`,
            top: `${spotlightPos.y}px`,
            transform: "translate(-50%, -50%)",
            width: "520px", // 260px radius
            height: "520px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, transparent 200px, rgba(255, 255, 255, 0.18) 245px, rgba(147, 197, 253, 0.28) 255px, transparent 260px)",
            filter: "drop-shadow(0 0 16px rgba(186, 230, 253, 0.35))",
          }}
        />
      )}

      {/* Subtle Screentone Texture (Manga / Cartoon Feel) */}
      <div className="absolute inset-0 z-[3] pointer-events-none opacity-[0.04] screentone-pattern" />

      {/* Celestial Accents (✦) */}
      <div className="absolute top-[18%] right-[14%] z-[3] text-white/35 text-xl sm:text-2xl pointer-events-none animate-pulse select-none">
        ✦
      </div>
      <div className="absolute bottom-[30%] left-[10%] z-[3] text-white/25 text-sm sm:text-base pointer-events-none select-none">
        ✦
      </div>
      <div className="absolute top-[38%] left-[22%] z-[3] text-white/20 text-xs pointer-events-none select-none">
        ✦
      </div>

      {/* 4. TOP NAVIGATION BAR */}
      <header className="relative z-20 w-full px-6 sm:px-10 md:px-14 lg:px-16 pt-7 sm:pt-9 flex items-center justify-between select-none">
        {/* Brand Title (Left): DOREAMON */}
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-black tracking-[0.28em] uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            DOREAMON
          </span>
          <span className="hidden sm:inline-block text-[9px] tracking-[0.2em] uppercase font-mono px-2 py-0.5 rounded border border-white/30 text-white/80 bg-black/20 backdrop-blur-sm">
            ARCHIVE 2112
          </span>
        </div>

        {/* Center Indicator: SAVE FOR LATER */}
        <div className="flex items-center">
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              playSubtleChime("sparkle");
            }}
            className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 text-[10px] sm:text-[11px] tracking-[0.25em] font-medium uppercase backdrop-blur-md cursor-pointer border ${
              isSaved
                ? "bg-white/25 border-white text-white shadow-lg"
                : "bg-black/25 border-white/25 text-white/90 hover:text-white hover:border-white/60"
            }`}
            title="Save for Later"
          >
            <span>{isSaved ? "SAVED FOR LATER" : "SAVE FOR LATER"}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isSaved ? "scale-110 fill-current" : "fill-none stroke-current"
              }`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
          </button>
        </div>

        {/* Nav Links (Right): /INSTAGRAM /BEHANCE /X */}
        <nav className="flex items-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-white/85">
          <a
            href="#instagram"
            onClick={(e) => {
              e.preventDefault();
              playSubtleChime();
            }}
            className="hover:text-white transition-all duration-200 hover:tracking-[0.28em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          >
            /INSTAGRAM
          </a>
          <a
            href="#behance"
            onClick={(e) => {
              e.preventDefault();
              playSubtleChime();
            }}
            className="hover:text-white transition-all duration-200 hover:tracking-[0.28em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          >
            /BEHANCE
          </a>
          <a
            href="#x"
            onClick={(e) => {
              e.preventDefault();
              playSubtleChime();
            }}
            className="hover:text-white transition-all duration-200 hover:tracking-[0.28em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          >
            /X
          </a>
        </nav>
      </header>

      {/* 5. CENTER HERO SECTION - Centered horizontally, elevated ~16% toward top */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center text-center -translate-y-[12%] sm:-translate-y-[16%] transition-transform duration-300 w-full px-4 select-none">
        {/* Supporting Text: "Enter a world where creatures come alive" */}
        <div className="mb-2 sm:mb-3 text-center relative z-10">
          <span className="inline-block text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.28em] uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] select-none">
            Enter a world where creatures come alive
          </span>
        </div>

        {/* Oversized Headline: "DOREAMON" */}
        <div className="w-full relative flex flex-col items-center justify-center">
          <h1
            className="w-full text-center text-[15vw] sm:text-[14vw] md:text-[13.8vw] lg:text-[14vw] font-black tracking-[-0.035em] leading-[0.84] select-none uppercase text-white drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            style={{
              fontFamily:
                "Impact, 'Arial Black', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            DOREAMON
          </h1>

          {/* Minimalist Japanese Editorial Typography Stamp */}
          <div className="mt-3 flex items-center justify-center gap-3 select-none">
            <span className="text-[10px] tracking-[0.3em] font-mono text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              ドラえもん / WORLD
            </span>
            <span className="w-1 h-1 rounded-full bg-white/70"></span>
            <span className="text-[9px] tracking-[0.2em] font-mono text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              EST. 2112 TOKYO
            </span>
          </div>
        </div>
      </main>

      {/* 6. 3D INTERACTIVE DORAEMON MODEL - Over Center Hero (Tracks Cursor Head & Eyes) */}
      <div className="absolute inset-0 z-[15] pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full max-w-[480px] sm:max-w-[580px] md:max-w-[680px] lg:max-w-[760px] max-h-[480px] sm:max-h-[580px] md:max-h-[660px] lg:max-h-[720px] flex items-center justify-center pointer-events-none translate-y-[3%] sm:translate-y-[6%]">
          <Doraemon3D />
        </div>
      </div>

      {/* 7. BOTTOM SECTION: Description (Left), Creator Credit (Center), and Buttons (Right) */}
      <footer className="relative z-20 w-full px-6 sm:px-10 md:px-14 lg:px-16 pb-7 sm:pb-9 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6 select-none">
        {/* Description Text (Bottom-Left) */}
        <div className="max-w-[320px] sm:max-w-md lg:max-w-lg">
          <p className="text-[13px] sm:text-sm md:text-[15px] font-normal leading-[1.65] tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            An immersive world of curious creatures, magical places, and stories waiting to be discovered.
          </p>
        </div>

        {/* Subtle Creator Credit (Center) */}
        <div className="hidden lg:flex items-center gap-2.5 text-[10px] tracking-[0.25em] font-medium uppercase text-white/75 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          <span>CREATED BY</span>
          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/50 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white font-bold text-[9px]">
            D
          </div>
          <span className="text-white font-semibold">FUJIKO F. FUJIO</span>
        </div>

        {/* CTA Buttons (Bottom-Right) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Button 1: "Explore the word →" */}
          <button
            onClick={() => {
              setShowExploreModal(true);
              playSubtleChime("soft");
            }}
            className="group px-5 sm:px-6 py-2.5 sm:py-3 border border-white/40 bg-black/25 hover:bg-white text-white hover:text-sky-950 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2.5 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <span>Explore the word →</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          {/* Button 2: "Meet the Creatures →" */}
          <button
            onClick={() => {
              setShowCreaturesModal(true);
              playSubtleChime("sparkle");
            }}
            className="group px-5 sm:px-6 py-2.5 sm:py-3 border border-white/40 bg-black/25 hover:bg-white text-white hover:text-sky-950 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2.5 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <span>Meet the Creatures →</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </footer>
    </div>

    {/* ---------------------------------------------------- */}
    {/* NEXT SECTION: CINEMATIC SCROLL-DRIVEN STORYTELLING */}
    {/* ---------------------------------------------------- */}
    <CinematicStorySection />

    {/* ---------------------------------------------------- */}
    {/* DORAEMON DISCOVERY & FLORIA TYPOGRAPHIC FOOTER      */}
    {/* ---------------------------------------------------- */}
    <DoraemonDiscoverySection />

    {/* MODAL 1: Meet The Creatures Editorial Dossier */}
    {showCreaturesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#0e1d2c]/95 text-white rounded-lg border border-sky-400/40 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] font-mono text-sky-400 uppercase block mb-1">
                  ARCHIVAL SPECIMENS / DOSSIER
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  CURIOUS CREATURES
                </h2>
                <p className="text-xs sm:text-sm text-sky-200/80 mt-1 max-w-lg">
                  Immersive beings born of ancient epochs, distant galaxies, and atmospheric phenomena.
                </p>
              </div>
              <button
                onClick={() => setShowCreaturesModal(false)}
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-white/70 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Creatures Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CREATURES.map((creature) => (
                <div
                  key={creature.id}
                  onClick={() => {
                    setSelectedCreature(creature);
                    playSubtleChime("soft");
                  }}
                  className={`p-4 rounded border transition-all duration-200 cursor-pointer ${
                    selectedCreature?.id === creature.id
                      ? "border-sky-400 bg-sky-950/60"
                      : "border-white/10 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-sky-400 tracking-wider">
                      SPECIMEN #{creature.id}
                    </span>
                    <span className="text-xs text-white/60 font-mono">
                      {creature.japanese}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {creature.name}
                  </h3>
                  <p className="text-xs text-sky-200/70 mb-2">
                    {creature.species}
                  </p>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                    {creature.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {creature.traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-900/40 border border-sky-400/20 text-sky-300"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-mono">
              <span>5 RECORDED LIFEFORMS</span>
              <button
                onClick={() => setShowCreaturesModal(false)}
                className="px-4 py-2 border border-sky-400/50 hover:border-sky-300 text-sky-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                Close Archive [ESC]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Explore The World Interactive Overview */}
      {showExploreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0c1824]/95 text-white rounded-lg border border-sky-400/40 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] font-mono text-sky-400 uppercase block mb-1">
                  EXPEDITION DISCOVERY
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  EXPLORE THE WORLD
                </h2>
                <p className="text-xs sm:text-sm text-sky-200/80 mt-1">
                  Unfolding dimensions across 2112, parallel timelines, and ancient realms.
                </p>
              </div>
              <button
                onClick={() => setShowExploreModal(false)}
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-white/70 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <div className="p-3.5 rounded bg-sky-950/40 border border-sky-400/20">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1">
                  01 / The Anywhere Dimension (どこでもドア)
                </h4>
                <p className="text-neutral-300 text-xs">
                  Instantaneous spatial traversal connecting metropolitan Tokyo with undiscovered planetary biomes.
                </p>
              </div>
              <div className="p-3.5 rounded bg-sky-950/40 border border-sky-400/20">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1">
                  02 / The Time Stream Nexus (タイムマシン)
                </h4>
                <p className="text-neutral-300 text-xs">
                  Temporal channels bridging the Cretaceous period, modern nostalgia, and 22nd-century robotics.
                </p>
              </div>
              <div className="p-3.5 rounded bg-sky-950/40 border border-sky-400/20">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1">
                  03 / Curious Creature Sanctuaries
                </h4>
                <p className="text-neutral-300 text-xs">
                  Preserved sanctuaries harboring prehistoric reptilians, sentient cloud beings, and intergalactic travelers.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
              <span className="font-mono">STATUS: UNCHARTED TERRITORY</span>
              <button
                onClick={() => setShowExploreModal(false)}
                className="px-4 py-2 border border-sky-400/50 hover:border-sky-300 text-sky-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                Dismiss [ESC]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
