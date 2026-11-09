"use client";

import React, { useState } from "react";

interface DiscoveryCard {
  id: string;
  number: string;
  title: string;
  japanese: string;
  category: string;
  accentColor: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  specs: { label: string; value: string }[];
  visualType: "doraemon" | "door" | "copter" | "time" | "world" | "pocket";
}

const CARDS: DiscoveryCard[] = [
  {
    id: "card-doraemon",
    number: "01",
    title: "DORAEMON",
    japanese: "ドラえもん",
    category: "CHARACTER",
    accentColor: "from-sky-500/25 via-sky-950/20 to-black",
    accentBorder: "group-hover:border-sky-400/50",
    badgeBg: "bg-sky-500/15 border-sky-400/30 text-sky-300",
    badgeText: "text-sky-300",
    description:
      "The adorable blue robotic cat from the 22nd century, sent to help Nobita with futuristic technology.",
    specs: [
      { label: "GENESIS", value: "2112.09.03" },
      { label: "STATURE", value: "129.3 CM" },
      { label: "HEART", value: "BENEVOLENT" },
    ],
    visualType: "doraemon",
  },
  {
    id: "card-door",
    number: "02",
    title: "ANYWHERE DOOR",
    japanese: "どこでもドア",
    category: "FUTURISTIC GADGET",
    accentColor: "from-pink-500/25 via-rose-950/20 to-black",
    accentBorder: "group-hover:border-pink-400/50",
    badgeBg: "bg-pink-500/15 border-pink-400/30 text-pink-300",
    badgeText: "text-pink-300",
    description:
      "A magical pink door that allows instant travel to any destination in the world.",
    specs: [
      { label: "LATENCY", value: "0.00 MS" },
      { label: "RANGE", value: "10 LIGHT YRS" },
      { label: "MODE", value: "SPATIAL WARP" },
    ],
    visualType: "door",
  },
  {
    id: "card-copter",
    number: "03",
    title: "TAKE-COPTER",
    japanese: "タケコプター",
    category: "FLIGHT TECHNOLOGY",
    accentColor: "from-amber-500/25 via-yellow-950/20 to-black",
    accentBorder: "group-hover:border-amber-400/50",
    badgeBg: "bg-amber-500/15 border-amber-400/30 text-amber-300",
    badgeText: "text-amber-300",
    description:
      "A tiny helicopter gadget that lets anyone fly freely through the sky.",
    specs: [
      { label: "VELOCITY", value: "80 KM/H" },
      { label: "BATTERY", value: "8 HOURS" },
      { label: "MOUNT", value: "ANTI-GRAVITY" },
    ],
    visualType: "copter",
  },
  {
    id: "card-time",
    number: "04",
    title: "TIME MACHINE",
    japanese: "タイムマシン",
    category: "TIME TRAVEL",
    accentColor: "from-cyan-500/25 via-blue-950/20 to-black",
    accentBorder: "group-hover:border-cyan-400/50",
    badgeBg: "bg-cyan-500/15 border-cyan-400/30 text-cyan-300",
    badgeText: "text-cyan-300",
    description:
      "An extraordinary invention that allows journeys across different timelines and historical periods.",
    specs: [
      { label: "CHRONOLOGY", value: "±100M YRS" },
      { label: "DRIVE", value: "TACHYON WARP" },
      { label: "STATUS", value: "ACTIVE FLUX" },
    ],
    visualType: "time",
  },
  {
    id: "card-world",
    number: "05",
    title: "NOBITA'S WORLD",
    japanese: "のび太の日常と世界",
    category: "ADVENTURE",
    accentColor: "from-emerald-500/25 via-teal-950/20 to-black",
    accentBorder: "group-hover:border-emerald-400/50",
    badgeBg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
    badgeText: "text-emerald-300",
    description:
      "Discover Nobita's neighborhood, school, home, and the places where unforgettable adventures begin.",
    specs: [
      { label: "LOCALITY", value: "NERIMA, TOKYO" },
      { label: "SEASON", value: "SPRING BLOSSOMS" },
      { label: "SPIRIT", value: "ENDLESS WONDER" },
    ],
    visualType: "world",
  },
  {
    id: "card-pocket",
    number: "06",
    title: "FOUR-DIMENSIONAL POCKET",
    japanese: "四次元ポケット",
    category: "TECHNOLOGY",
    accentColor: "from-sky-400/25 via-indigo-950/20 to-black",
    accentBorder: "group-hover:border-sky-300/50",
    badgeBg: "bg-sky-400/15 border-sky-300/30 text-sky-200",
    badgeText: "text-sky-200",
    description:
      "Explore Doraemon's magical pocket filled with incredible inventions from the future.",
    specs: [
      { label: "CAPACITY", value: "INFINITE (∞)" },
      { label: "DIMENSION", value: "4-SPACE FOLD" },
      { label: "GADGETS", value: "4,500+ STOCKED" },
    ],
    visualType: "pocket",
  },
];

export default function DoraemonDiscoverySection() {
  const [selectedCard, setSelectedCard] = useState<DiscoveryCard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Play subtle web audio chime on click/hover
  const playChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio not supported
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-[#000000] text-white overflow-hidden select-none font-sans border-t border-white/10">
      {/* ------------------------------------------------------------------- */}
      {/* OVERSIZED FLOATING WORDS IN BACKGROUND (PARALLAX ATMOSPHERE)       */}
      {/* ------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[6%] -left-[4%] text-[14vw] font-black uppercase text-white/[0.025] tracking-tighter leading-none">
          FUTURE
        </div>
        <div className="absolute top-[28%] -right-[6%] text-[15vw] font-black uppercase text-white/[0.02] tracking-tighter leading-none">
          ADVENTURE
        </div>
        <div className="absolute top-[55%] -left-[8%] text-[13vw] font-black uppercase text-white/[0.025] tracking-tighter leading-none">
          TECHNOLOGY
        </div>
        <div className="absolute bottom-[14%] right-[2%] text-[12vw] font-black uppercase text-white/[0.02] tracking-tighter leading-none">
          22ND CENTURY
        </div>

        {/* Ambient radial lighting glows inspired by Doraemon's signature palette */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-sky-600/[0.05] blur-[140px]" />
        <div className="absolute top-2/3 right-1/4 w-[700px] h-[700px] rounded-full bg-pink-600/[0.04] blur-[160px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/[0.03] blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-16 pt-24 sm:pt-32 pb-20">
        {/* ------------------------------------------------------------------- */}
        {/* 1. DISCOVERY SECTION HEADER                                         */}
        {/* ------------------------------------------------------------------- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-24 pb-8 border-b border-white/10">
          <div className="max-w-3xl">
            {/* Archival metadata breadcrumb */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-sky-400 font-semibold">
                ARCHIVE EXHIBITION // VOL. 2112
              </span>
              <span className="text-white/20 font-mono">/</span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-white/50">
                CLASSIFIED ARTIFACTS
              </span>
            </div>

            {/* Section Headline */}
            <h2
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-[-0.03em] leading-[0.9] text-white"
              style={{
                fontFamily:
                  "Impact, 'Arial Black', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              DISCOVER
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-sky-400">
                DORAEMON
              </span>
            </h2>
          </div>

          {/* Short introduction paragraph & coordinates */}
          <div className="max-w-md md:text-right flex flex-col md:items-end justify-between">
            <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed mb-4">
              Explore the extraordinary world of Doraemon: his futuristic inventions,
              mysterious gadgets, unforgettable adventures, and the timeless bond of friendship.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">
              <span>LAT 35.6895° N</span>
              <span>•</span>
              <span>LONG 139.6917° E</span>
              <span>•</span>
              <span className="text-sky-400/80">MATSUBA 2112</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 2. ASYMMETRIC EDITORIAL GRID (4-6 CARDS)                            */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* -------------------------------------------------- */}
          {/* CARD 1: DORAEMON (Character) - 7 cols on desktop   */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => {
              setSelectedCard(CARDS[0]);
              playChime();
            }}
            onMouseEnter={() => setHoveredCard("doraemon")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group col-span-12 lg:col-span-7 rounded-2xl border border-white/15 hover:border-sky-400/50 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(56,189,248,0.18)] cursor-pointer min-h-[460px] sm:min-h-[500px] flex flex-col justify-between"
          >
            {/* Visual Background Element */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <img
                src="/doraemon_face.jpg"
                alt="Doraemon Close-up"
                className="w-full h-full object-cover object-top opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black" />
            </div>

            {/* Top metadata row */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono tracking-widest font-semibold uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  CHARACTER
                </span>
                <span className="text-white/40 font-mono text-xs">#01</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white/20 group-hover:text-sky-400/50 transition-colors">
                ドラえもん
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-24">
              <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-sky-400 mb-1">
                MS-903-D // ARCHIVAL CORE
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-3 group-hover:text-sky-200 transition-colors">
                DORAEMON
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 max-w-lg mb-6 leading-relaxed">
                The adorable blue robotic cat from the 22nd century, sent to help Nobita with futuristic technology.
              </p>

              {/* Specs pill badges */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {CARDS[0].specs.map((s, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-white/70"
                  >
                    <span className="text-white/40 mr-1.5">{s.label}:</span>
                    <span className="text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* CARD 2: ANYWHERE DOOR (Gadget) - 5 cols on desktop */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => {
              setSelectedCard(CARDS[1]);
              playChime();
            }}
            onMouseEnter={() => setHoveredCard("door")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group col-span-12 lg:col-span-5 rounded-2xl border border-white/15 hover:border-pink-400/50 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(244,63,94,0.18)] cursor-pointer min-h-[460px] sm:min-h-[500px] flex flex-col justify-between"
          >
            {/* Visual: Glowing Anywhere Door Illusion */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="w-[180px] sm:w-[220px] h-[300px] sm:h-[340px] rounded-t-xl rounded-b-md border-4 border-pink-500/60 bg-gradient-to-b from-pink-900/40 via-purple-950/60 to-black relative shadow-[0_0_60px_rgba(244,63,94,0.35)] group-hover:scale-105 group-hover:border-pink-400 transition-all duration-700">
                {/* Door Frame Inner Panels */}
                <div className="absolute top-4 left-4 right-4 h-32 rounded border border-pink-400/40 bg-pink-500/10 flex items-center justify-center">
                  <div className="text-[10px] font-mono text-pink-300/80 tracking-widest text-center px-2">
                    [WARP MATRIX]
                    <br />
                    INFINITY LINK
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 h-32 rounded border border-pink-400/40 bg-pink-500/10" />
                {/* Brass Door Knob */}
                <div className="absolute top-1/2 right-3 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>

            {/* Top metadata row */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono tracking-widest font-semibold uppercase bg-pink-500/20 text-pink-300 border border-pink-400/30">
                  FUTURISTIC GADGET
                </span>
                <span className="text-white/40 font-mono text-xs">#02</span>
              </div>
              <span className="text-xl sm:text-2xl font-black font-mono text-white/20 group-hover:text-pink-400/50 transition-colors">
                どこでもドア
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-24">
              <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-pink-400 mb-1">
                INSTANT SPATIAL TRANSIT
              </div>
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-pink-200 transition-colors">
                ANYWHERE DOOR
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
                A magical pink door that allows instant travel to any destination in the world.
              </p>

              {/* Specs */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                {CARDS[1].specs.map((s, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[9px] font-mono text-white/70"
                  >
                    <span className="text-white/40 mr-1">{s.label}:</span>
                    <span className="text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* CARD 3: TAKE-COPTER (Flight) - 4 cols on desktop   */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => {
              setSelectedCard(CARDS[2]);
              playChime();
            }}
            onMouseEnter={() => setHoveredCard("copter")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group col-span-12 md:col-span-6 lg:col-span-4 rounded-2xl border border-white/15 hover:border-amber-400/50 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 p-6 sm:p-7 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)] cursor-pointer min-h-[400px] flex flex-col justify-between"
          >
            {/* Visual: Glowing Rotor Turbine Illustration */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="relative w-44 h-44 rounded-full border border-amber-400/30 flex items-center justify-center animate-spin [animation-duration:14s]">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                <div className="absolute h-full w-1 bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
            </div>

            {/* Top metadata */}
            <div className="relative z-10 flex items-start justify-between">
              <span className="px-2.5 py-1 rounded text-[10px] font-mono tracking-widest font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                FLIGHT TECHNOLOGY
              </span>
              <span className="text-white/40 font-mono text-xs">#03</span>
            </div>

            {/* Content */}
            <div className="relative z-10 pt-16">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 mb-1">
                AERODYNAMIC ROTOR
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-amber-200 transition-colors">
                TAKE-COPTER
              </h3>
              <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
                A tiny helicopter gadget that lets anyone fly freely through the sky.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10 text-[9px] font-mono text-white/70">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  SPEED: 80 KM/H
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  GRAV-SUCTION
                </span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* CARD 4: TIME MACHINE (Travel) - 8 cols on desktop  */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => {
              setSelectedCard(CARDS[3]);
              playChime();
            }}
            onMouseEnter={() => setHoveredCard("time")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group col-span-12 md:col-span-6 lg:col-span-8 rounded-2xl border border-white/15 hover:border-cyan-400/50 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(6,182,212,0.18)] cursor-pointer min-h-[400px] flex flex-col justify-between"
          >
            {/* Visual: Spacetime Vortex Rings */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-end overflow-hidden pr-6">
              <div className="relative w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-cyan-400/25 flex items-center justify-center opacity-40 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700">
                <div className="w-56 h-56 rounded-full border border-dashed border-cyan-300/40 animate-spin [animation-duration:20s]" />
                <div className="w-40 h-40 rounded-full border border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]" />
                <div className="w-20 h-20 rounded-full bg-cyan-400/20" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
            </div>

            {/* Top metadata */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono tracking-widest font-semibold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  TIME TRAVEL
                </span>
                <span className="text-white/40 font-mono text-xs">#04</span>
              </div>
              <span className="text-lg sm:text-xl font-mono text-white/30">
                タイムマシン
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 pt-16 max-w-lg">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 mb-1">
                CHRONO-SPATIAL TRAVERSAL
              </div>
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-cyan-200 transition-colors">
                TIME MACHINE
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
                An extraordinary invention that allows journeys across different timelines and historical periods.
              </p>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10 text-[9px] font-mono text-white/70">
                {CARDS[3].specs.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/10"
                  >
                    <span className="text-white/40 mr-1">{s.label}:</span>
                    {s.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* CARD 5: NOBITA'S WORLD (Adventure) - 6 cols       */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => {
              setSelectedCard(CARDS[4]);
              playChime();
            }}
            onMouseEnter={() => setHoveredCard("world")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group col-span-12 lg:col-span-6 rounded-2xl border border-white/15 hover:border-emerald-400/50 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] cursor-pointer min-h-[440px] flex flex-col justify-between"
          >
            {/* Visual: Nobita's Neighborhood Daytime Scene */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <img
                src="/bg_image_1.jpg"
                alt="Nobita's House and Neighborhood"
                className="w-full h-full object-cover object-center opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
            </div>

            {/* Top metadata */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono tracking-widest font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ADVENTURE
                </span>
                <span className="text-white/40 font-mono text-xs">#05</span>
              </div>
              <span className="text-sm font-mono text-white/40">NERIMA, TOKYO</span>
            </div>

            {/* Content */}
            <div className="relative z-10 pt-20">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 mb-1">
                MEMORIES & PLACES
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-emerald-200 transition-colors">
                NOBITA&apos;S WORLD
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
                Discover Nobita&apos;s neighborhood, school, home, and the places where unforgettable adventures begin.
              </p>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10 text-[9px] font-mono text-white/70">
                <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                  OPEN LOT (空き地)
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                  DESK DRAWER NEXUS
                </span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* CARD 6: FOUR-DIMENSIONAL POCKET - 6 cols           */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => {
              setSelectedCard(CARDS[5]);
              playChime();
            }}
            onMouseEnter={() => setHoveredCard("pocket")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group col-span-12 lg:col-span-6 rounded-2xl border border-white/15 hover:border-sky-300/50 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(56,189,248,0.18)] cursor-pointer min-h-[440px] flex flex-col justify-between"
          >
            {/* Visual: Dimensional Pocket Half-Moon Graphic */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="w-56 h-28 rounded-b-full border-4 border-white/40 bg-gradient-to-b from-sky-900/30 to-sky-500/10 shadow-[0_0_50px_rgba(56,189,248,0.25)] group-hover:border-white/80 group-hover:scale-105 transition-all duration-700 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>

            {/* Top metadata */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono tracking-widest font-semibold uppercase bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  TECHNOLOGY
                </span>
                <span className="text-white/40 font-mono text-xs">#06</span>
              </div>
              <span className="text-sm font-mono text-white/40">四次元ポケット</span>
            </div>

            {/* Content */}
            <div className="relative z-10 pt-20">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-300 mb-1">
                SUB-DIMENSIONAL CONTINUUM
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-sky-100 transition-colors">
                FOUR-DIMENSIONAL POCKET
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
                Explore Doraemon&apos;s magical pocket filled with incredible inventions from the future.
              </p>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10 text-[9px] font-mono text-white/70">
                <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                  CAPACITY: INFINITY (∞)
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                  DIRECT MIND LINK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. STRONG CENTERED CALL TO ACTION: "ENTER DORAEMON'S WORLD →"       */}
        {/* ------------------------------------------------------------------- */}
        <div className="mt-24 sm:mt-32 pt-16 border-t border-white/10 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-mono tracking-[0.35em] text-sky-400 uppercase mb-3">
            CONTINUE THE EXPEDITION
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase mb-8 max-w-xl">
            READY TO EXPLORE THE UNIVERSE OF 2112?
          </h3>

          <button
            onClick={() => {
              playChime();
              scrollToTop();
            }}
            className="group relative inline-flex items-center gap-3.5 px-8 sm:px-12 py-4 sm:py-5 rounded-full border-2 border-white/40 bg-white/5 hover:bg-white text-white hover:text-black font-bold tracking-[0.2em] uppercase text-xs sm:text-sm transition-all duration-500 shadow-[0_0_35px_rgba(56,189,248,0.25)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] cursor-pointer"
          >
            <span>ENTER DORAEMON&apos;S WORLD →</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. FLORIA-STYLE TYPOGRAPHIC FOOTER — DORAEMON EDITION              */}
      {/* ------------------------------------------------------------------- */}
      <footer className="relative z-10 w-full border-t border-white/15 pt-16 sm:pt-24 pb-12 sm:pb-16 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          {/* Upper Footer Navigation & Statement */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-16 sm:pb-20 border-b border-white/10">
            {/* Statement Column */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-sky-400 block mb-3">
                  ART EXHIBITION ARCHIVE // 2112
                </span>
                <p className="text-xl sm:text-2xl font-light text-white leading-relaxed max-w-sm">
                  &ldquo;A journey through imagination, futuristic inventions, and endless adventures.&rdquo;
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3 text-xs text-white/50 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>EXHIBIT STATUS: PERMANENT ARCHIVE</span>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="md:col-span-3 lg:col-span-3">
              <h4 className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 mb-4">
                EXPLORATION
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium tracking-wide">
                <li>
                  <button
                    onClick={scrollToTop}
                    className="hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <a href="#discover" className="hover:text-sky-300 transition-colors">
                    Discover
                  </a>
                </li>
                <li>
                  <a href="#characters" className="hover:text-sky-300 transition-colors">
                    Characters
                  </a>
                </li>
                <li>
                  <a href="#gadgets" className="hover:text-sky-300 transition-colors">
                    Gadgets
                  </a>
                </li>
                <li>
                  <a href="#adventures" className="hover:text-sky-300 transition-colors">
                    Adventures
                  </a>
                </li>
              </ul>
            </div>

            {/* Social & Curatorial Links */}
            <div className="md:col-span-3 lg:col-span-4 flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 mb-4">
                  DIGITAL ARCHIVE // CONNECT
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm font-mono tracking-wider text-white/80">
                  <li>
                    <a
                      href="#instagram"
                      className="hover:text-white transition-colors"
                    >
                      /INSTAGRAM
                    </a>
                  </li>
                  <li>
                    <a
                      href="#behance"
                      className="hover:text-white transition-colors"
                    >
                      /BEHANCE
                    </a>
                  </li>
                  <li>
                    <a
                      href="#x"
                      className="hover:text-white transition-colors"
                    >
                      /X (TWITTER)
                    </a>
                  </li>
                  <li>
                    <a
                      href="#archive"
                      className="hover:text-white transition-colors"
                    >
                      /ARCHIVE 2112
                    </a>
                  </li>
                </ul>
              </div>

              {/* Scroll to Top Link */}
              <div className="mt-8">
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <span>BACK TO TOP</span>
                  <span>↑</span>
                </button>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* FLORIA-STYLE OVERSIZED TYPOGRAPHIC HERO WORD         */}
          {/* ---------------------------------------------------- */}
          <div className="py-10 sm:py-14 select-none flex items-center justify-center overflow-hidden">
            <h1
              className="w-full text-center text-[16vw] font-black tracking-[-0.04em] leading-[0.8] uppercase text-white/[0.9] hover:text-white transition-colors select-none"
              style={{
                fontFamily:
                  "Impact, 'Arial Black', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              DORAEMON
            </h1>
          </div>

          {/* Bottom Copyright & Fine Print Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-[11px] font-mono text-white/45 tracking-widest uppercase">
            <span>© 2112 FUJIKO PRO • DORAEMON ARCHIVE • ALL RIGHTS RESERVED</span>
            <div className="flex items-center gap-6">
              <span>EXHIBITION CATALOGUE NO. 2112-903</span>
              <span>TOKYO, JAPAN</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------------- */}
      {/* INTERACTIVE DETAIL MODAL FOR GADGET SCHEMATIC                       */}
      {/* ------------------------------------------------------------------- */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-neutral-950 text-white rounded-2xl border border-white/20 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400">
                  SPECIMEN #{selectedCard.number} // {selectedCard.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white mt-0.5">
                  {selectedCard.title}
                </h3>
                <span className="text-xs font-mono text-white/50">{selectedCard.japanese}</span>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-white/70 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              {selectedCard.description}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-white/[0.04] border border-white/10">
              {selectedCard.specs.map((s, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-[9px] font-mono text-white/40 block mb-0.5">
                    {s.label}
                  </span>
                  <span className="text-xs font-bold font-mono text-white">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedCard(null)}
              className="w-full py-3 rounded-lg border border-sky-400/50 hover:border-sky-300 text-sky-300 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
            >
              Close Dossier [ESC]
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

