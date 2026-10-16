import React from 'react';
import { SimulationState } from '../../types/simulation';
import { AudioWaveform, Waves, Compass, Activity, Volume2 } from 'lucide-react';

interface AudioSceneViewProps {
  state: SimulationState;
}

export const AudioSceneView: React.FC<AudioSceneViewProps> = ({ state }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1677FF] flex items-center justify-center">
            <AudioWaveform className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Acoustic Environment & Spatial Reverberation
            </h2>
            <p className="text-xs text-slate-500">
              Room Impulse Response (RIR), early reflections, and spatial head-related transfer functions (HRTF)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-semibold">Active Environment</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{state.environment}</div>
            <div className="text-xs text-slate-500 mt-1">
              Estimated diffuse sound level: {Math.max(45, 75 - state.snr)} dBA
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-semibold">Reverberation Time (T60)</div>
            <div className="text-lg font-bold font-mono text-[#1677FF] mt-1">{state.reverberation.toFixed(2)} s</div>
            <div className="text-xs text-slate-500 mt-1">
              Sabine formula estimation (V = 180 m³, α = {state.reverberation < 0.4 ? '0.42' : '0.18'})
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-semibold">Critical Distance (dc)</div>
            <div className="text-lg font-bold font-mono text-emerald-600 mt-1">
              {(1.8 / Math.max(0.3, Math.sqrt(state.reverberation))).toFixed(2)} m
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Direct-to-reverberant ratio (DRR) boundary
            </div>
          </div>
        </div>

        {/* Room Impulse Response (RIR) SVG Curve */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Simulated Room Impulse Response (RIR) h(t)
            </span>
            <span className="text-[11px] font-mono text-slate-500">Early Reflections + Late Exponential Decay</span>
          </div>
          <div className="h-44 w-full bg-[#070D1E] rounded-xl p-3 border border-slate-300 relative overflow-hidden flex flex-col justify-end">
            <svg className="w-full h-36" viewBox="0 0 600 120" preserveAspectRatio="none">
              {/* Direct path spike */}
              <line x1="30" y1="120" x2="30" y2="10" stroke="#38BDF8" strokeWidth="2.5" />
              {/* Early reflections */}
              {[45, 65, 80, 105, 125, 145].map((x, i) => (
                <line
                  key={i}
                  x1={x}
                  y1="120"
                  x2={x}
                  y2={120 - (90 / (1 + i * 0.4))}
                  stroke="#818CF8"
                  strokeWidth="1.8"
                />
              ))}
              {/* Late diffuse reverberation decay tail */}
              <path
                d={generateReverbDecayPath(state.reverberation, 600, 120)}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="1.4"
                opacity="0.85"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>0 ms (Direct Sound)</span>
              <span>50 ms (Early Reflections)</span>
              <span>250 ms</span>
              <span>500 ms (Late Diffuse Tail)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateReverbDecayPath(t60: number, width: number, height: number): string {
  let path = 'M 160 120';
  const decayRate = 3.5 / Math.max(0.2, t60);
  for (let x = 160; x < width; x += 3) {
    const t = (x - 160) / (width - 160);
    const amp = Math.exp(-t * decayRate) * (Math.sin(x * 1.5) * 25 + Math.cos(x * 0.8) * 15);
    const y = 120 - Math.abs(amp);
    path += ` L ${x} ${y.toFixed(1)}`;
  }
  return path;
}
