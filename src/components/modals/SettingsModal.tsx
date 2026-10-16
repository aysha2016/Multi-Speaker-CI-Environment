import React from 'react';
import { X, Settings, RotateCcw, Volume2, Gauge, Zap } from 'lucide-react';
import { SimulationState } from '../../types/simulation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Prototype Settings</h3>
              <p className="text-xs text-slate-500">Configure visual rendering & acoustic engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Animation Speed */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">Animation Speed</div>
              <div className="text-[11px] text-slate-500">Wavefront & propagation velocity</div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onUpdateState({ animationSpeed: spd })}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    state.animationSpeed === spd
                      ? 'bg-white text-[#1677FF] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* CI Channels */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">Electrode Channels</div>
              <div className="text-[11px] text-slate-500">Number of intracochlear contacts</div>
            </div>
            <select
              value={state.ciChannels}
              onChange={(e) => onUpdateState({ ciChannels: parseInt(e.target.value) })}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="12">12 Channels (Med-El Flex)</option>
              <option value="16">16 Channels (Advanced Bionics)</option>
              <option value="22">22 Channels (Cochlear Contour)</option>
            </select>
          </div>

          {/* CI Vocoder Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
            <div>
              <div className="text-xs font-semibold text-blue-900">CI Vocoder Acoustic Mode</div>
              <div className="text-[11px] text-blue-700">Simulate how CI users hear via 22 carrier bands</div>
            </div>
            <button
              onClick={() => onUpdateState({ vocoderMode: !state.vocoderMode })}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                state.vocoderMode ? 'bg-[#1677FF]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  state.vocoderMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset to Default */}
          <div className="pt-2">
            <button
              onClick={() => {
                onResetDefaults();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Factory Defaults (Sec. 23)</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
