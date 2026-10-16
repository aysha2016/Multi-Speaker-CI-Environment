import React, { useState, useEffect, useRef } from 'react';
import {
  SimulationState,
  SpeakerConfig,
  SpeakerId,
  SimulationMetrics,
} from '../types/simulation';
import { getActiveSpeakers } from '../utils/simulationMath';
import { Disc, RotateCcw, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface AcousticSceneProps {
  state: SimulationState;
  metrics: SimulationMetrics;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onSelectTarget: (id: SpeakerId) => void;
}

export const AcousticScene: React.FC<AcousticSceneProps> = ({
  state,
  metrics,
  onUpdateState,
  onSelectTarget,
}) => {
  const [hoveredSpeaker, setHoveredSpeaker] = useState<SpeakerConfig | null>(null);
  const [rotation, setRotation] = useState<number>(0); // degrees
  const [zoom, setZoom] = useState<number>(1);
  const [animTime, setAnimTime] = useState<number>(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, rot: 0 });

  // Animation frame loop for sound wave propagation and moving speakers
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setAnimTime((prev) => {
        const speed = state.animationSpeed * (state.isPlaying ? 1.5 : 0.8);
        return prev + dt * speed;
      });

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [state.animationSpeed, state.isPlaying]);

  const activeSpeakers = getActiveSpeakers(
    state.numberOfSpeakers,
    undefined,
    state.movingSpeakers ? animTime : 0
  );

  // Mouse drag handlers for 3D view rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (state.viewMode !== '3d') return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, rot: rotation };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    setRotation(dragStartRef.current.rot + dx * 0.4);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs relative overflow-hidden flex flex-col select-none">
      {/* Top Header of Card */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A] leading-tight">
            3D Acoustic Scene Simulation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-speaker environment. Select a target speaker and adjust conditions.
          </p>
        </div>

        {/* View Mode Segmented Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onUpdateState({ viewMode: 'top' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              state.viewMode === 'top'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top View
          </button>
          <button
            onClick={() => onUpdateState({ viewMode: '3d' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              state.viewMode === '3d'
                ? 'bg-[#1677FF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D View
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div
        className="w-full h-[340px] rounded-xl relative overflow-hidden bg-gradient-to-b from-[#F3F6FA] to-[#E5EDF7] border border-slate-200 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {state.viewMode === '3d' ? (
          /* ==========================================================
             3D PERSPECTIVE VIEW
             ========================================================== */
          <div
            className="w-full h-full relative flex items-center justify-center transition-transform"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Realistic Room Backdrop elements */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              {/* Back Wall & Horizon line */}
              <div className="w-full h-1/2 bg-gradient-to-b from-[#E8EEF5] to-[#DDE7F2] border-b border-slate-300/60" />
              {/* Room floor with wood grain lines */}
              <div className="w-full h-1/2 bg-gradient-to-b from-[#DFE7F0] to-[#CFDAE8]" />
              {/* Left potted plant silhouette */}
              <div className="absolute bottom-16 left-6 w-16 h-36 bg-gradient-to-t from-emerald-800/15 to-transparent rounded-t-full filter blur-[1px]" />
              {/* Right shelf unit silhouette */}
              <div className="absolute bottom-20 right-8 w-20 h-40 border-r-2 border-t-2 border-slate-400/20" />
            </div>

            {/* 3D Circular Floor Grid with Azimuth Degree Arcs */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `rotate(${rotation * 0.15}deg)`,
                transformOrigin: '400px 320px',
              }}
            >
              <defs>
                <radialGradient id="floorGlow" cx="50%" cy="80%" r="60%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#DDE7F4" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#CFDAE8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Perspective floor ellipse */}
              <ellipse cx="400" cy="300" rx="360" ry="110" fill="url(#floorGlow)" stroke="#BAC9DC" strokeWidth="1.5" />
              <ellipse cx="400" cy="300" rx="270" ry="82" fill="none" stroke="#BAC9DC" strokeWidth="1" strokeDasharray="4 4" />
              <ellipse cx="400" cy="300" rx="180" ry="55" fill="none" stroke="#BAC9DC" strokeWidth="1" strokeDasharray="3 3" />

              {/* Azimuth angle radial lines from listener (at 400, 310) */}
              {[-90, -60, -45, 0, 45, 60, 90].map((deg) => {
                const rad = (deg - 90) * (Math.PI / 180);
                const rx = 360;
                const ry = 110;
                const x = 400 + Math.cos(rad) * rx;
                const y = 300 + Math.sin(rad) * ry;
                return (
                  <g key={deg}>
                    <line
                      x1="400"
                      y1="300"
                      x2={x}
                      y2={y}
                      stroke="#BAC9DC"
                      strokeWidth="1"
                      strokeDasharray={deg === 0 ? 'none' : '2 2'}
                    />
                  </g>
                );
              })}

              {/* Floor Degree Text Labels */}
              <text x="75" y="305" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">-90°</text>
              <text x="210" y="375" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">-45°</text>
              <text x="400" y="392" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">0°</text>
              <text x="590" y="375" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">+45°</text>
              <text x="725" y="305" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">+90°</text>
            </svg>

            {/* ACOUSTIC WAVE PROPAGATION (Concentric Arcs radiating from each speaker to listener) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid meet"
            >
              {activeSpeakers.map((spk) => {
                // Approximate 3D screen position for speaker
                const rad = (spk.angle - 90) * (Math.PI / 180);
                const rx = 280;
                const ry = 80;
                const sx = 400 + Math.cos(rad) * rx;
                const sy = 280 + Math.sin(rad) * ry - 30; // elevated head height

                const isTarget = spk.id === state.targetSpeakerId;

                // Generate 4 animated propagating wave arcs toward listener (400, 270)
                const waveCount = isTarget ? 5 : 3;
                const arcs = [];
                for (let w = 0; w < waveCount; w++) {
                  const phase = (animTime * 1.6 + w * 0.3) % 1.0;
                  const wx = sx + (400 - sx) * phase;
                  const wy = sy + (270 - sy) * phase;
                  const r = phase * 48 + 12;
                  const opacity = (1 - phase) * (isTarget ? 0.8 : 0.45);

                  arcs.push(
                    <circle
                      key={`${spk.id}-wave-${w}`}
                      cx={wx}
                      cy={wy}
                      r={r}
                      fill="none"
                      stroke={spk.color}
                      strokeWidth={isTarget ? 2.2 : 1.4}
                      strokeDasharray="6 3"
                      opacity={opacity}
                    />
                  );
                }

                // Direct beam line if spatial filtering is active and this is target
                if (isTarget && state.spatialFiltering) {
                  arcs.push(
                    <line
                      key={`${spk.id}-beam`}
                      x1={sx}
                      y1={sy + 20}
                      x2="400"
                      y2="280"
                      stroke={spk.color}
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      opacity="0.6"
                    />
                  );
                }

                return <g key={spk.id}>{arcs}</g>;
              })}
            </svg>

            {/* 3D SPEAKER BUSTS / AVATARS */}
            <div className="absolute inset-0 pointer-events-none">
              {activeSpeakers.map((spk) => {
                // Compute screen coordinates
                const rad = (spk.angle - 90) * (Math.PI / 180);
                const rx = 310;
                const ry = 95;
                const sx = 400 + Math.cos(rad) * rx;
                const sy = 270 + Math.sin(rad) * ry;

                const isTarget = spk.id === state.targetSpeakerId;

                return (
                  <div
                    key={spk.id}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group"
                    style={{
                      left: `${(sx / 800) * 100}%`,
                      top: `${(sy / 400) * 100}%`,
                      zIndex: isTarget ? 30 : 20,
                    }}
                    onClick={() => onSelectTarget(spk.id)}
                    onMouseEnter={() => setHoveredSpeaker(spk)}
                    onMouseLeave={() => setHoveredSpeaker(null)}
                  >
                    {/* Speaker Label Tag above head */}
                    <div
                      className={`mb-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight text-center whitespace-nowrap shadow-sm border transition-all ${
                        isTarget
                          ? 'bg-white border-2 scale-105 shadow-md'
                          : 'bg-white/95 border-slate-200 group-hover:scale-105'
                      }`}
                      style={{
                        borderColor: isTarget ? spk.color : '#E2E8F0',
                        color: spk.color,
                      }}
                    >
                      <div className="leading-none">{spk.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {spk.angle > 0 ? `+${spk.angle}°` : `${spk.angle}°`}
                      </div>
                    </div>

                    {/* Translucent 3D Bust SVG */}
                    <div
                      className={`relative w-16 h-20 flex items-center justify-center transition-all ${
                        isTarget ? 'drop-shadow-lg scale-105' : 'group-hover:scale-105 opacity-90'
                      }`}
                    >
                      <svg viewBox="0 0 64 80" className="w-full h-full">
                        {/* Glow halo for target speaker */}
                        {isTarget && (
                          <ellipse
                            cx="32"
                            cy="68"
                            rx="28"
                            ry="9"
                            fill={spk.color}
                            opacity="0.35"
                            className="animate-pulse"
                          />
                        )}

                        {/* Head & Torso with stylized gradients */}
                        <defs>
                          <linearGradient id={`grad-${spk.id}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                            <stop offset="40%" stopColor={spk.color} stopOpacity="0.8" />
                            <stop offset="100%" stopColor={spk.color} stopOpacity="0.95" />
                          </linearGradient>
                        </defs>

                        {/* Torso/Shoulders */}
                        <path
                          d="M12 74 C12 55, 20 48, 32 48 C44 48, 52 55, 52 74 Z"
                          fill={`url(#grad-${spk.id})`}
                          stroke={spk.color}
                          strokeWidth="1.2"
                        />
                        {/* Neck */}
                        <rect
                          x="27"
                          y="40"
                          width="10"
                          height="10"
                          rx="2"
                          fill={`url(#grad-${spk.id})`}
                        />
                        {/* Head */}
                        <ellipse
                          cx="32"
                          cy="26"
                          rx="14"
                          ry="17"
                          fill={`url(#grad-${spk.id})`}
                          stroke={spk.color}
                          strokeWidth="1.2"
                        />
                        {/* Subtle face profile line */}
                        <path
                          d="M32 20 Q36 28 32 35"
                          stroke="#FFFFFF"
                          strokeWidth="1"
                          fill="none"
                          opacity="0.6"
                        />
                      </svg>

                      {/* Small speaker soundwaves radiating from mouth */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none">
                        <span
                          className="block w-2 h-2 rounded-full border"
                          style={{ borderColor: spk.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LISTENER / CI USER IN CENTER FOREGROUND */}
            <div
              className="absolute left-1/2 bottom-4 -translate-x-1/2 pointer-events-auto flex flex-col items-center z-30 group cursor-pointer"
              title="CI User / Listener: Positioned at origin (0, 0) facing 0°"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* 3D Listener Mannequin Bust seen from back-angle */}
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
                  <defs>
                    <radialGradient id="headGrad" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="50%" stopColor="#CBD5E1" />
                      <stop offset="100%" stopColor="#94A3B8" />
                    </radialGradient>
                    <radialGradient id="torsoGrad" cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#E2E8F0" />
                      <stop offset="100%" stopColor="#64748B" />
                    </radialGradient>
                  </defs>

                  {/* Shoulders / Torso */}
                  <path
                    d="M10 98 C10 70, 30 62, 50 62 C70 62, 90 70, 90 98 Z"
                    fill="url(#torsoGrad)"
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                  {/* Neck */}
                  <rect x="43" y="52" width="14" height="14" rx="3" fill="#94A3B8" />
                  {/* Head (occipital/back-right perspective) */}
                  <ellipse cx="50" cy="36" rx="20" ry="24" fill="url(#headGrad)" stroke="#64748B" strokeWidth="1.5" />

                  {/* COCHLEAR IMPLANT DEVICE OVERLAY ON EAR */}
                  {/* Ear contour */}
                  <path d="M68 32 C72 32, 74 38, 70 44 C67 48, 66 46, 68 32" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                  {/* BTE Speech Processor on ear */}
                  <path d="M70 28 C73 26, 75 31, 73 37 C71 41, 69 39, 70 28" fill="#1E293B" stroke="#0F172A" strokeWidth="0.8" />
                  {/* Magnetic RF Headpiece / Coil */}
                  <circle cx="61" cy="22" r="5.5" fill="#334155" stroke="#0F172A" strokeWidth="1.2" />
                  <circle cx="61" cy="22" r="2.5" fill="#38BDF8" />
                  {/* Cable link */}
                  <path d="M72 30 Q68 25 61 22" fill="none" stroke="#0F172A" strokeWidth="1.2" />
                  {/* Internal Cochlea & Electrode Array glowing representation */}
                  <path
                    d="M56 34 C58 36, 59 39, 56 40 C54 41, 52 39, 53 37"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1.4"
                    strokeDasharray="1.5 1.5"
                    className="animate-pulse"
                  />
                </svg>

                {/* Subtitle pill for listener */}
                <div className="absolute -bottom-2 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>CI Listener (22-ch)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================================
             TOP VIEW (2D RADAR POLAR ACOUSTIC MAP)
             ========================================================== */
          <div className="w-full h-full relative flex items-center justify-center p-4">
            <svg
              className="w-full h-full max-w-[500px]"
              viewBox="0 0 400 400"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Radial polar distance rings: 1m, 2m, 3m */}
              <circle cx="200" cy="200" r="60" fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
              <text x="205" y="145" fill="#94A3B8" fontSize="9" fontWeight="500">1.0 m</text>
              <circle cx="200" cy="200" r="120" fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
              <text x="205" y="85" fill="#94A3B8" fontSize="9" fontWeight="500">2.0 m</text>
              <circle cx="200" cy="200" r="170" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <text x="205" y="35" fill="#94A3B8" fontSize="9" fontWeight="500">3.0 m</text>

              {/* Angle axis lines */}
              {[-90, -60, -45, -30, 0, 30, 45, 60, 90].map((deg) => {
                const rad = (deg - 90) * (Math.PI / 180);
                const x2 = 200 + Math.cos(rad) * 175;
                const y2 = 200 + Math.sin(rad) * 175;
                return (
                  <g key={deg}>
                    <line x1="200" y1="200" x2={x2} y2={y2} stroke="#CBD5E1" strokeWidth="0.8" />
                    <text
                      x={200 + Math.cos(rad) * 188}
                      y={200 + Math.sin(rad) * 188 + 3}
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {deg > 0 ? `+${deg}°` : `${deg}°`}
                    </text>
                  </g>
                );
              })}

              {/* Spatial beamforming cone if spatial filtering is active */}
              {state.spatialFiltering && (
                <path
                  d="M200 200 L160 30 A180 180 0 0 1 240 30 Z"
                  fill="#3B82F6"
                  fillOpacity="0.12"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}

              {/* Center Listener icon */}
              <circle cx="200" cy="200" r="14" fill="#0F172A" />
              <circle cx="200" cy="200" r="6" fill="#38BDF8" />
              {/* Nose indicator pointing forward (0°) */}
              <polygon points="196,186 204,186 200,178" fill="#0F172A" />
              {/* CI processor on left ear */}
              <circle cx="184" cy="200" r="3.5" fill="#EF4444" />

              {/* Speaker nodes in top view */}
              {activeSpeakers.map((spk) => {
                const rad = (spk.angle - 90) * (Math.PI / 180);
                const distR = (spk.distance / 2.0) * 120;
                const sx = 200 + Math.cos(rad) * distR;
                const sy = 200 + Math.sin(rad) * distR;
                const isTarget = spk.id === state.targetSpeakerId;

                // Propagating circular waves towards listener
                const waves = [];
                for (let w = 0; w < 3; w++) {
                  const phase = (animTime * 1.5 + w * 0.33) % 1.0;
                  const wr = phase * 45 + 10;
                  waves.push(
                    <circle
                      key={`top-wave-${spk.id}-${w}`}
                      cx={sx}
                      cy={sy}
                      r={wr}
                      fill="none"
                      stroke={spk.color}
                      strokeWidth="1"
                      opacity={(1 - phase) * 0.6}
                    />
                  );
                }

                return (
                  <g
                    key={`top-spk-${spk.id}`}
                    onClick={() => onSelectTarget(spk.id)}
                    className="cursor-pointer"
                  >
                    {waves}
                    {isTarget && (
                      <circle cx={sx} cy={sy} r="18" fill={spk.color} fillOpacity="0.2" className="animate-ping" />
                    )}
                    <circle
                      cx={sx}
                      cy={sy}
                      r="12"
                      fill={spk.color}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                    <text
                      x={sx}
                      y={sy + 3.5}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {spk.id}
                    </text>
                    <text
                      x={sx}
                      y={sy - 15}
                      fill="#0F172A"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {spk.name} ({spk.angle > 0 ? `+${spk.angle}°` : `${spk.angle}°`})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Viewport HUD Overlays (Top-left & Bottom-left) */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-3 text-[11px] font-semibold text-slate-700 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeSpeakers.find(s => s.id === state.targetSpeakerId)?.color || '#EF4444' }} />
            <span>Target: {activeSpeakers.find(s => s.id === state.targetSpeakerId)?.name || 'Speaker B'}</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-mono">
            Azimuth: {activeSpeakers.find(s => s.id === state.targetSpeakerId)?.angle}°
          </span>
        </div>

        {/* 3D Camera Controls (Bottom-right) */}
        {state.viewMode === '3d' && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs pointer-events-auto">
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setRotation(0);
                setZoom(1);
              }}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Tooltip when hovering over a speaker */}
        {hoveredSpeaker && (
          <div className="absolute top-12 left-3 bg-slate-900/95 text-white p-2.5 rounded-lg text-xs space-y-1 shadow-lg border border-slate-700 pointer-events-none z-50 min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
            <div className="font-bold flex items-center justify-between" style={{ color: hoveredSpeaker.color }}>
              <span>{hoveredSpeaker.name}</span>
              <span className="text-[10px] text-slate-300 font-normal">
                {hoveredSpeaker.id === state.targetSpeakerId ? '★ Target' : 'Interferer'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-x-2">
              <span>Azimuth Angle:</span>
              <span className="font-mono text-white text-right">{hoveredSpeaker.angle > 0 ? `+${hoveredSpeaker.angle}°` : `${hoveredSpeaker.angle}°`}</span>
              <span>Distance:</span>
              <span className="font-mono text-white text-right">{state.speakerDistance.toFixed(1)} m</span>
              <span>Relative SNR:</span>
              <span className="font-mono text-white text-right">{hoveredSpeaker.id === state.targetSpeakerId ? `+${metrics.targetSnr} dB` : `-4.2 dB`}</span>
              <span>Attention:</span>
              <span className="font-mono text-emerald-400 text-right">{metrics.attentionWeights[hoveredSpeaker.id] || 0}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
