import React from 'react';
import {
  SimulationState,
  SpeakerConfig,
  SpeakerId,
  SimulationMetrics,
} from '../types/simulation';
import { BASE_SPEAKERS } from '../utils/simulationMath';
import { Target, Check } from 'lucide-react';

interface TargetSpeakerSelectionProps {
  state: SimulationState;
  metrics: SimulationMetrics;
  onSelectTarget: (id: SpeakerId) => void;
  onUpdateState: (updates: Partial<SimulationState>) => void;
}

export const TargetSpeakerSelection: React.FC<TargetSpeakerSelectionProps> = ({
  state,
  metrics,
  onSelectTarget,
  onUpdateState,
}) => {
  // Show active speakers up to 4 for buttons (or up to numberOfSpeakers if > 4)
  const speakersToShow = BASE_SPEAKERS.slice(0, Math.max(4, state.numberOfSpeakers));

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center">
          <Target className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
            Target Speaker Selection
          </h3>
          <p className="text-xs text-slate-500">
            Choose which speaker to focus on
          </p>
        </div>
      </div>

      {/* 4 Speaker Selection Cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        {speakersToShow.slice(0, 4).map((spk) => {
          const isSelected = spk.id === state.targetSpeakerId;
          const attentionPct = metrics.attentionWeights[spk.id] || 0;

          return (
            <button
              key={spk.id}
              onClick={() => onSelectTarget(spk.id)}
              className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center relative flex flex-col items-center justify-center ${
                isSelected
                  ? 'border-2 scale-[1.02] shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300 opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: spk.lightBg,
                borderColor: isSelected ? spk.color : '#E2E8F0',
              }}
            >
              {isSelected && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: spk.color }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <div
                className="text-xs font-bold leading-tight"
                style={{ color: spk.color }}
              >
                {spk.name}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {spk.angle > 0 ? `+${spk.angle}°` : `${spk.angle}°`}
              </div>
              {state.attentionModel && (
                <div className="mt-1 text-[10px] font-mono font-bold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded">
                  {attentionPct}%
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Two Toggles: Spatial Filtering & Attention Model */}
      <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100">
        {/* Enable Spatial Filtering */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 leading-tight">
            Enable Spatial Filtering
          </span>
          <button
            onClick={() =>
              onUpdateState({ spatialFiltering: !state.spatialFiltering })
            }
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
              state.spatialFiltering ? 'bg-[#1677FF]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                state.spatialFiltering ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Enable Attention Model */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 leading-tight">
            Enable Attention Model
          </span>
          <button
            onClick={() =>
              onUpdateState({ attentionModel: !state.attentionModel })
            }
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
              state.attentionModel ? 'bg-[#1677FF]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                state.attentionModel ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
