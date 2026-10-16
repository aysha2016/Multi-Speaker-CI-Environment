import React from 'react';
import { SimulationState } from '../../types/simulation';
import { Brain, Activity, Zap, Layers } from 'lucide-react';

interface NeuralResponseViewProps {
  state: SimulationState;
}

export const NeuralResponseView: React.FC<NeuralResponseViewProps> = ({ state }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Auditory Nerve & Neural Population Response
            </h2>
            <p className="text-xs text-slate-500">
              Biophysical simulation of spiral ganglion neuron (SGN) action potentials, refractory recovery, and electrical current spread
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">Simulated SGN Fiber Pool</div>
            <div className="text-lg font-bold text-slate-900 mt-1">30,000 Neurons</div>
            <div className="text-xs text-slate-500 mt-1">
              High-SR (60%), Medium-SR (25%), Low-SR (15%) fiber types
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">Spread of Excitation (λ)</div>
            <div className="text-lg font-bold font-mono text-cyan-600 mt-1">2.4 mm constant</div>
            <div className="text-xs text-slate-500 mt-1">
              Exponential current decay in perilymph fluid
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">Neural Phase Locking Limit</div>
            <div className="text-lg font-bold font-mono text-emerald-600 mt-1">~300 Hz</div>
            <div className="text-xs text-slate-500 mt-1">
              Electrical stimulation bypasses hair-cell lowpass filtering
            </div>
          </div>
        </div>

        {/* Neural Excitation Spatial Profile SVG */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Spatial Spread of Neural Excitation along Cochlear Spiral
            </span>
            <span className="text-[11px] font-mono text-slate-500">Cochlear Position (0 mm = Base, 32 mm = Apex)</span>
          </div>
          <div className="h-44 w-full bg-[#070D1E] rounded-xl p-4 border border-slate-300 relative flex flex-col justify-end">
            <svg className="w-full h-32" viewBox="0 0 600 100" preserveAspectRatio="none">
              {/* Target speaker excitation profile (E10 middle electrode) */}
              <path
                d="M 50 100 Q 150 100 220 95 Q 280 20 300 10 Q 320 20 380 95 Q 450 100 550 100 Z"
                fill="rgba(56, 189, 248, 0.25)"
                stroke="#38BDF8"
                strokeWidth="2.5"
              />
              {/* Interferer cross-talk profile */}
              <path
                d="M 120 100 Q 200 100 240 85 Q 260 50 270 45 Q 280 50 310 85 Q 360 100 480 100 Z"
                fill="rgba(244, 63, 94, 0.15)"
                stroke="#F43F5E"
                strokeWidth="1.8"
                strokeDasharray="4 2"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>0 mm (Basal High Freq)</span>
              <span>10 mm</span>
              <span>20 mm (Target E10 Centroid)</span>
              <span>32 mm (Apical Low Freq)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
