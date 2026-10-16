import React from 'react';
import { SimulationState, EnvironmentType } from '../types/simulation';
import { Sliders, Play, Pause, Compass } from 'lucide-react';

interface EnvironmentSettingsProps {
  state: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onTogglePlay: () => void;
}

export const EnvironmentSettings: React.FC<EnvironmentSettingsProps> = ({
  state,
  onUpdateState,
  onTogglePlay,
}) => {
  const environments: {
    name: EnvironmentType;
    label: string;
    img: string;
  }[] = [
    {
      name: 'Quiet Room',
      label: 'Quiet',
      img: '/src/assets/images/env_quiet_1792089141640.jpg',
    },
    {
      name: 'Office',
      label: 'Office',
      img: '/src/assets/images/env_office_1792089141462.jpg',
    },
    {
      name: 'Restaurant',
      label: 'Restaurant',
      img: '/src/assets/images/env_restaurant_1792089143086.jpg',
    },
    {
      name: 'Street',
      label: 'Street',
      img: '/src/assets/images/env_street_1792089143660.jpg',
    },
    {
      name: 'Party',
      label: 'Party',
      img: '/src/assets/images/env_party_1792089143052.jpg',
    },
  ];

  const handleSelectEnv = (env: EnvironmentType) => {
    let newSnr = state.snr;
    let newReverb = state.reverberation;

    if (env === 'Quiet Room') {
      newSnr = 15;
      newReverb = 0.2;
    } else if (env === 'Office') {
      newSnr = 6;
      newReverb = 0.4;
    } else if (env === 'Restaurant') {
      newSnr = 0;
      newReverb = 0.6;
    } else if (env === 'Street') {
      newSnr = -3;
      newReverb = 0.8;
    } else if (env === 'Party') {
      newSnr = -6;
      newReverb = 1.0;
    }

    onUpdateState({
      environment: env,
      snr: newSnr,
      reverberation: newReverb,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
            Environment Settings
          </h3>
        </div>

        {/* Environment Dropdown */}
        <div className="w-48">
          <select
            value={state.environment}
            onChange={(e) => handleSelectEnv(e.target.value as EnvironmentType)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Quiet Room">Quiet Room (Single/Few)</option>
            <option value="Office">Office (Diffuse chatter)</option>
            <option value="Restaurant">Restaurant (Multi-speaker)</option>
            <option value="Street">Street (Ambient traffic)</option>
            <option value="Party">Party (High cocktail overlap)</option>
            <option value="Car">Car Cabin (Low-freq rumble)</option>
            <option value="Public Transport">Public Transport</option>
          </select>
        </div>
      </div>

      {/* 5 Environment Photo Thumbnails */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {environments.map((env) => {
          const isSelected = state.environment === env.name;
          return (
            <button
              key={env.name}
              onClick={() => handleSelectEnv(env.name)}
              className={`flex flex-col items-center gap-1 cursor-pointer group text-center focus:outline-none`}
            >
              <div
                className={`w-full aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#1677FF] ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200/90 group-hover:border-slate-300 opacity-80 group-hover:opacity-100'
                }`}
              >
                <img
                  src={env.img}
                  alt={env.label}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Styled CSS fallback container
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback pattern if image fails */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-600 to-slate-400 -z-10" />
              </div>
              <span
                className={`text-[11px] font-semibold tracking-tight ${
                  isSelected ? 'text-[#1677FF]' : 'text-slate-600'
                }`}
              >
                {env.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sliders Container */}
      <div className="space-y-3">
        {/* Number of Speakers */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-700 w-36 shrink-0">
            Number of Speakers
          </span>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={state.numberOfSpeakers}
              onChange={(e) =>
                onUpdateState({ numberOfSpeakers: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
            <span className="text-xs font-mono font-bold text-slate-900 w-8 text-right">
              {state.numberOfSpeakers}
            </span>
          </div>
        </div>

        {/* SNR (dB) */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-700 w-36 shrink-0">
            SNR (dB)
          </span>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min="-10"
              max="20"
              step="1"
              value={state.snr}
              onChange={(e) => onUpdateState({ snr: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
            <span className="text-xs font-mono font-bold text-slate-900 w-8 text-right">
              {state.snr}
            </span>
          </div>
        </div>

        {/* Reverberation (T60) */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-700 w-36 shrink-0">
            Reverberation (T60)
          </span>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.1"
              value={state.reverberation}
              onChange={(e) =>
                onUpdateState({ reverberation: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
            <span className="text-xs font-mono font-bold text-slate-900 w-8 text-right">
              {state.reverberation.toFixed(1)} s
            </span>
          </div>
        </div>

        {/* Speaker Distance */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-700 w-36 shrink-0">
            Speaker Distance
          </span>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={state.speakerDistance}
              onChange={(e) =>
                onUpdateState({ speakerDistance: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
            <span className="text-xs font-mono font-bold text-slate-900 w-8 text-right">
              {state.speakerDistance.toFixed(1)} m
            </span>
          </div>
        </div>

        {/* Moving Speakers Toggle & Play Scene Button */}
        <div className="flex items-center justify-between pt-2">
          {/* Moving Speakers Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-700">Moving Speakers</span>
            <button
              onClick={() =>
                onUpdateState({ movingSpeakers: !state.movingSpeakers })
              }
              className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                state.movingSpeakers ? 'bg-[#1677FF]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  state.movingSpeakers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Big Play Scene Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm ${
              state.isPlaying
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-[#1677FF] hover:bg-blue-600 active:scale-98'
            }`}
          >
            {state.isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Scene</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Scene</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
