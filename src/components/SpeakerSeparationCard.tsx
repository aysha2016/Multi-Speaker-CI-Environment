import React, { useState } from 'react';
import { SimulationState, SeparationModelType, SpeakerConfig } from '../types/simulation';
import { getActiveSpeakers, generateSyntheticWaveform } from '../utils/simulationMath';
import { audioEngine, SPEAKER_TRANSCRIPTS } from '../utils/audioEngine';
import { Play, Pause, Network, CheckCircle2, Mic } from 'lucide-react';

interface SpeakerSeparationCardProps {
  state: SimulationState;
  onUpdateModel: (model: SeparationModelType) => void;
}

export const SpeakerSeparationCard: React.FC<SpeakerSeparationCardProps> = ({
  state,
  onUpdateModel,
}) => {
  const [playingEstId, setPlayingEstId] = useState<string | null>(null);
  const activeSpeakers = getActiveSpeakers(state.numberOfSpeakers);

  const handlePlayEstimated = (spk: SpeakerConfig) => {
    if (playingEstId === spk.id) {
      audioEngine.stopSpeakerAudio('separated');
      setPlayingEstId(null);
    } else {
      audioEngine.stopAll();
      setPlayingEstId(spk.id);
      const otherIds = activeSpeakers.filter((s) => s.id !== spk.id).map((s) => s.id);
      audioEngine.playSeparatedSpeech(
        spk.id,
        otherIds,
        state.spatialFiltering,
        () => {
          setPlayingEstId(null);
        }
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header with Title and Model Selector */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
              Speaker Separation
            </h3>
            <p className="text-xs text-slate-500">
              AI-based real speech separation & enhancement
            </p>
          </div>
        </div>

        {/* Model Selector */}
        <select
          value={state.separationModel}
          onChange={(e) => onUpdateModel(e.target.value as SeparationModelType)}
          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="Demonstration Model">Demonstration Model</option>
          <option value="DPRNN">DPRNN-TasNet</option>
          <option value="Conv-TasNet">Conv-TasNet</option>
          <option value="Transformer">SepFormer / Transformer</option>
        </select>
      </div>

      {/* Estimated Speaker Rows */}
      <div className="space-y-2">
        {activeSpeakers.map((spk) => {
          const isTarget = spk.id === state.targetSpeakerId;
          const realWave = audioEngine.getWaveformData(spk.id);
          const waveData = realWave || generateSyntheticWaveform(40, spk.id, 0.4, spk.voice);
          const transcript = SPEAKER_TRANSCRIPTS[spk.id]?.text || '';

          return (
            <div
              key={`est-${spk.id}`}
              className={`flex flex-col p-2 rounded-xl border transition-all ${
                isTarget ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="w-24 shrink-0 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: spk.color }}
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Estimated {spk.id}
                  </span>
                </div>

                {/* Clean separated waveform */}
                <div className="flex-1 h-7 bg-white rounded-lg border border-slate-200/60 px-1.5 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-5" preserveAspectRatio="none" viewBox="0 0 100 24">
                    <path
                      d={generateCleanWavePath(waveData, 100, 24)}
                      fill="none"
                      stroke={spk.color}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handlePlayEstimated(spk)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-white transition-all cursor-pointer shadow-xs ${
                    playingEstId === spk.id
                      ? 'bg-red-500 scale-95'
                      : 'bg-[#1677FF] hover:bg-blue-600'
                  }`}
                  title={`Play separated real speech for ${spk.name}`}
                >
                  {playingEstId === spk.id ? (
                    <Pause className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  )}
                </button>

                <div className="w-14 text-right text-[10px] font-mono text-emerald-600 font-semibold shrink-0 flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>+{(14.2 - (spk.id === state.targetSpeakerId ? 0 : 2.5)).toFixed(1)}dB</span>
                </div>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="mt-0.5 pl-6 text-[10px] italic text-slate-400 truncate">
                  {transcript}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scientific disclaimer badge */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>Model: {state.separationModel}</span>
        <span className="font-semibold text-slate-500 tracking-wider">REAL SPEECH SEPARATION</span>
      </div>
    </div>
  );
};

function generateCleanWavePath(wave: number[], width: number, height: number): string {
  const midY = height / 2;
  const step = width / (wave.length - 1);
  let path = `M 0 ${midY + wave[0] * (height * 0.42)}`;
  for (let i = 1; i < wave.length; i++) {
    const x = i * step;
    const y = midY + wave[i] * (height * 0.42);
    path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path;
}
