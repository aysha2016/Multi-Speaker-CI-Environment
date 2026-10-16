import React, { useEffect, useRef } from 'react';
import { SimulationState } from '../types/simulation';
import { Activity } from 'lucide-react';

interface SpectrogramCardProps {
  state: SimulationState;
}

export const SpectrogramCard: React.FC<SpectrogramCardProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw dark navy/black background
    ctx.fillStyle = '#060B18';
    ctx.fillRect(0, 0, width, height);

    // Number of time bins and frequency bins
    const timeBins = 80;
    const freqBins = 48;
    const cellW = width / timeBins;
    const cellH = height / freqBins;

    const snrNorm = (state.snr + 10) / 30; // 0 to 1
    const reverbSmear = Math.max(0, state.reverberation * 1.5);
    const speakerDensity = state.numberOfSpeakers;

    // Generate deterministic 2D energy matrix with speech harmonic formants
    const energy: number[][] = [];
    for (let f = 0; f < freqBins; f++) {
      energy[f] = [];
      const freqNorm = f / freqBins; // 0 = high freq (8kHz), 1 = low freq (0.1kHz)

      for (let t = 0; t < timeBins; t++) {
        const timeSec = (t / timeBins) * 5.0;

        // Formant energy bands
        let e = 0;
        for (let s = 0; s < speakerDensity; s++) {
          const sOffset = s * 0.8;
          // Pitch harmonics and vocal bursts
          const burst = Math.sin(timeSec * 3.5 + sOffset) * Math.cos(timeSec * 1.8 + s);
          if (burst > 0.1) {
            // Formant peaks at typical speech frequencies (apical/basal distribution)
            const fPeak1 = 0.8 - (s % 2) * 0.15; // F1 ~ 500-800Hz
            const fPeak2 = 0.55 - (s % 3) * 0.1; // F2 ~ 1500-2200Hz
            const fPeak3 = 0.3 - (s % 2) * 0.08; // F3 ~ 2800Hz

            const dist1 = Math.abs(freqNorm - fPeak1);
            const dist2 = Math.abs(freqNorm - fPeak2);
            const dist3 = Math.abs(freqNorm - fPeak3);

            e += Math.exp(-dist1 * 18) * 0.8 * burst;
            e += Math.exp(-dist2 * 15) * 0.6 * burst;
            e += Math.exp(-dist3 * 12) * 0.4 * burst;
          }
        }

        // Add background noise floor modulated by SNR
        const noiseFloor = (1 - snrNorm) * 0.35 + 0.04;
        e += (Math.sin(f * 33 + t * 47) * 0.5 + 0.5) * noiseFloor;

        energy[f][t] = Math.min(1.0, e);
      }
    }

    // Apply horizontal reverberation smearing if T60 > 0.1
    if (reverbSmear > 0.2) {
      for (let f = 0; f < freqBins; f++) {
        for (let t = 1; t < timeBins; t++) {
          energy[f][t] = energy[f][t] * 0.7 + energy[f][t - 1] * 0.3 * Math.min(0.9, reverbSmear);
        }
      }
    }

    // Render cells with Plasma/Inferno colormap
    for (let f = 0; f < freqBins; f++) {
      for (let t = 0; t < timeBins; t++) {
        const val = Math.min(1, Math.max(0, energy[f][t]));
        ctx.fillStyle = getInfernoColor(val);
        ctx.fillRect(t * cellW, f * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Subtle horizontal harmonic grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((ratio) => {
      ctx.beginPath();
      ctx.moveTo(0, ratio * height);
      ctx.lineTo(width, ratio * height);
      ctx.stroke();
    });

    // Draw active playhead cursor if simulation is playing
    if (state.isPlaying) {
      const playheadX = ((state.simulationTime % 5.0) / 5.0) * width;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [state.snr, state.reverberation, state.numberOfSpeakers, state.isPlaying, state.simulationTime]);

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
            Spectrogram (Mixed Audio)
          </h3>
          <p className="text-xs text-slate-500">
            Time-frequency energy distribution (0.1–8 kHz)
          </p>
        </div>
      </div>

      {/* Spectrogram Canvas with Axes */}
      <div className="flex gap-2 items-center flex-1">
        {/* Y-Axis Label & Ticks */}
        <div className="flex flex-col justify-between h-[180px] text-[10px] text-slate-500 font-mono text-right py-1 shrink-0 select-none">
          <span className="font-semibold text-slate-700">8</span>
          <span>4</span>
          <span>2</span>
          <span>0.5</span>
          <span className="font-semibold text-slate-700">0.1</span>
        </div>

        {/* Rotated Axis Title */}
        <div className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-tight -rotate-90 -ml-3 -mr-2 select-none">
          Frequency (kHz)
        </div>

        {/* Canvas Display */}
        <div className="flex-1 flex flex-col">
          <div className="h-[180px] w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-[#060B18]">
            <canvas
              ref={canvasRef}
              width={360}
              height={180}
              className="w-full h-full block"
            />
          </div>

          {/* X-Axis Ticks */}
          <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1.5 px-1 select-none">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <div className="text-center text-[10px] text-slate-400 font-medium select-none -mt-1">
            Time (s)
          </div>
        </div>
      </div>
    </div>
  );
};

// Inferno/Plasma style colormap mapping 0.0..1.0 to realistic spectrogram colors
function getInfernoColor(t: number): string {
  // 0.0: deep dark navy/black
  // 0.2: indigo/purple
  // 0.5: crimson/magenta
  // 0.75: amber/orange
  // 1.0: bright yellow/white
  if (t < 0.2) {
    const f = t / 0.2;
    return `rgb(${Math.round(8 + f * 50)}, ${Math.round(12 + f * 20)}, ${Math.round(35 + f * 80)})`;
  } else if (t < 0.5) {
    const f = (t - 0.2) / 0.3;
    return `rgb(${Math.round(58 + f * 130)}, ${Math.round(32 + f * 10)}, ${Math.round(115 + f * 20)})`;
  } else if (t < 0.8) {
    const f = (t - 0.5) / 0.3;
    return `rgb(${Math.round(188 + f * 57)}, ${Math.round(42 + f * 90)}, ${Math.round(135 - f * 110)})`;
  } else {
    const f = (t - 0.8) / 0.2;
    return `rgb(${Math.round(245 + f * 10)}, ${Math.round(132 + f * 118)}, ${Math.round(25 + f * 190)})`;
  }
}
