import React from 'react';
import { SimulationState } from '../../types/simulation';
import { Cpu, Zap, Activity, Info } from 'lucide-react';

interface CIEncodingViewProps {
  state: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
}

export const CIEncodingView: React.FC<CIEncodingViewProps> = ({
  state,
  onUpdateState,
}) => {
  // 22 Cochlear implant electrode channels (Apex to Base)
  const channels = Array.from({ length: 22 }, (_, i) => {
    const chNum = i + 1;
    // Greenwood cochlear tonotopic position formula
    const freq = Math.round(165.4 * (Math.pow(10, 0.06 * (22 - i)) - 0.88));
    return {
      channel: chNum,
      position: chNum <= 6 ? 'Basal (High Freq)' : chNum <= 15 ? 'Middle Turn' : 'Apical (Low Freq)',
      centerFreq: freq,
      impedance: (4.2 + Math.sin(i * 1.5) * 0.8).toFixed(1), // kOhm
      active: chNum % 2 === 0 || chNum % 3 === 0, // ACE 8-of-22 selected maxima
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Cochlear Implant Sound Coding Strategies
              </h2>
              <p className="text-xs text-slate-500">
                22-channel tonotopic filterbanks, envelope extraction, and biphasic pulse train generation
              </p>
            </div>
          </div>

          {/* Strategy Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Strategy:</span>
            <select
              value={state.ciStrategy}
              onChange={(e) =>
                onUpdateState({ ciStrategy: e.target.value as 'ACE' | 'CIS' | 'SPEAK' })
              }
              className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="ACE">ACE (8-of-22 Maxima)</option>
              <option value="CIS">CIS (Continuous Interleaved)</option>
              <option value="SPEAK">SPEAK (Spectral Peak)</option>
            </select>
          </div>
        </div>

        {/* Strategy comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Channel Selection</div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {state.ciStrategy === 'ACE' ? '8 Maxima out of 22' : 'All 22 Channels Fired'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {state.ciStrategy === 'ACE'
                ? 'Selects highest envelope energy bins to avoid channel interaction'
                : 'Fixed temporal stimulation across all electrodes'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Biphasic Pulse Rate</div>
            <div className="text-base font-bold font-mono text-[#1677FF] mt-1">
              {state.pulseRate} pulses / sec / ch
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Phase duration: 25 μs, Interphase gap: 8 μs
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Loudness Growth Function</div>
            <div className="text-base font-bold text-emerald-600 mt-1">
              Modified Power Law (Q = 20)
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Acoustic 60 dB range → 10 dB electrical dynamic range
            </div>
          </div>
        </div>

        {/* 22 Electrode Array Table */}
        <div className="mt-6">
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>22-Electrode Tonotopic Distribution (Greenwood Frequency Map)</span>
            <span className="text-[11px] font-mono text-slate-500">Base (High Freq) → Apex (Low Freq)</span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                <tr>
                  <th className="py-2 px-3 font-semibold">Ch #</th>
                  <th className="py-2 px-3 font-semibold">Cochlear Region</th>
                  <th className="py-2 px-3 font-semibold">Center Frequency (Hz)</th>
                  <th className="py-2 px-3 font-semibold">Impedance</th>
                  <th className="py-2 px-3 font-semibold">ACE State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {channels.map((ch) => (
                  <tr key={ch.channel} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-900">E{ch.channel}</td>
                    <td className="py-1.5 px-3 text-slate-600">{ch.position}</td>
                    <td className="py-1.5 px-3 font-mono text-[#1677FF] font-semibold">{ch.centerFreq} Hz</td>
                    <td className="py-1.5 px-3 font-mono text-slate-500">{ch.impedance} kΩ</td>
                    <td className="py-1.5 px-3">
                      {ch.active ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ● Selected Maxima
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Idle</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
