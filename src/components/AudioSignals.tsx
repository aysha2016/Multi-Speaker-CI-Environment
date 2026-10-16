import React, { useState, useEffect } from 'react';
import { SimulationState, SpeakerConfig, SpeakerId } from '../types/simulation';
import { getActiveSpeakers, generateSyntheticWaveform } from '../utils/simulationMath';
import { audioEngine, SPEAKER_TRANSCRIPTS } from '../utils/audioEngine';
import { Play, Pause, User, Volume2, Mic } from 'lucide-react';

interface AudioSignalsProps {
  state: SimulationState;
  onUpdateSpeakerVoice: (id: SpeakerId, voice: 'Male' | 'Female') => void;
}

export const AudioSignals: React.FC<AudioSignalsProps> = ({
  state,
  onUpdateSpeakerVoice,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [animOffset, setAnimOffset] = useState<number>(0);

  const activeSpeakers = getActiveSpeakers(state.numberOfSpeakers);

  // Preload real speech audio on mount
  useEffect(() => {
    audioEngine.preloadAudio();
  }, []);

  // Animation ticker for dynamic waveform scrolling when playing
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const tick = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      if (state.isPlaying || playingId) {
        setAnimOffset((prev) => (prev + dt * 1.5) % 5.0);
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [state.isPlaying, playingId]);

  const handleTogglePlaySpeaker = (spk: SpeakerConfig) => {
    if (playingId === spk.id) {
      audioEngine.stopSpeakerAudio(spk.id);
      setPlayingId(null);
    } else {
      audioEngine.stopAll();
      setPlayingId(spk.id);
      audioEngine.playSpeakerAudio(spk.id, () => {
        setPlayingId(null);
      });
    }
  };

  const handleTogglePlayMixed = () => {
    if (playingId === 'mixed') {
      audioEngine.stopSpeakerAudio('mixed');
      setPlayingId(null);
    } else {
      audioEngine.stopAll();
      setPlayingId('mixed');
      const angles: Record<string, number> = {};
      activeSpeakers.forEach((s) => {
        angles[s.id] = s.angle;
      });
      audioEngine.playMixedAudio(
        activeSpeakers.map((s) => s.id),
        state.snr,
        state.reverberation,
        angles,
        () => {
          setPlayingId(null);
        }
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center">
            <Volume2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
              Audio Signals
            </h3>
            <p className="text-xs text-slate-500">
              Real human speech audio mixture
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Mic className="w-2.5 h-2.5 text-emerald-600" />
          <span>REAL SPEECH</span>
        </span>
      </div>

      {/* Speaker Rows */}
      <div className="space-y-2.5">
        {activeSpeakers.map((spk) => {
          const isPlayingThis = playingId === spk.id || (state.isPlaying && playingId === null);
          const transcript = SPEAKER_TRANSCRIPTS[spk.id]?.text || 'Speech utterance';
          const realWave = audioEngine.getWaveformData(spk.id);
          const waveData = realWave || generateSyntheticWaveform(
            48,
            spk.id,
            isPlayingThis ? animOffset : 0,
            spk.voice
          );

          return (
            <div
              key={spk.id}
              className={`flex flex-col p-2 rounded-xl border transition-all ${
                spk.id === state.targetSpeakerId
                  ? 'border-blue-200 bg-blue-50/20'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Speaker Info */}
                <div className="flex items-center gap-2 w-28 shrink-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: spk.color }}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {spk.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      ({spk.angle > 0 ? `+${spk.angle}°` : `${spk.angle}°`})
                    </div>
                  </div>
                </div>

                {/* Waveform Canvas */}
                <div className="flex-1 h-8 bg-white rounded-lg border border-slate-200/60 px-1.5 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-6" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <path
                      d={generateSvgWavePath(waveData, 100, 30)}
                      fill="none"
                      stroke={spk.color}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handleTogglePlaySpeaker(spk)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs ${
                    playingId === spk.id
                      ? 'bg-red-500 scale-95'
                      : 'bg-[#1677FF] hover:bg-blue-600'
                  }`}
                  title={`Play real speech for ${spk.name} (${spk.voice})`}
                >
                  {playingId === spk.id ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Voice Type Selector */}
                <select
                  value={spk.voice}
                  onChange={(e) =>
                    onUpdateSpeakerVoice(spk.id, e.target.value as 'Male' | 'Female')
                  }
                  className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shrink-0"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Real Speech Spoken Sentence Transcript */}
              <div className="mt-1 pl-9 text-[10.5px] italic text-slate-500 truncate">
                {transcript}
              </div>
            </div>
          );
        })}

        {/* Mixed Audio Row */}
        <div className="flex flex-col p-2 rounded-xl border border-slate-200 bg-slate-100/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-28 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-slate-900">Mixed Audio</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {activeSpeakers.length} spk · {state.snr}dB
                </div>
              </div>
            </div>

            {/* Mixed Waveform Canvas */}
            <div className="flex-1 h-8 bg-white rounded-lg border border-slate-200/80 px-1.5 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-6" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path
                  d={generateMixedWavePath(activeSpeakers.length, state.snr, animOffset)}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Play Mixed Audio Button */}
            <button
              onClick={handleTogglePlayMixed}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs ${
                playingId === 'mixed'
                  ? 'bg-red-500 scale-95'
                  : 'bg-slate-800 hover:bg-slate-900'
              }`}
              title="Play Mixed Multi-Speaker Acoustic Audio with real voices & spatial panning"
            >
              {playingId === 'mixed' ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            <div className="w-[72px] text-center text-[11px] font-semibold text-slate-500 shrink-0">
              Spatial Mix
            </div>
          </div>
          <div className="mt-1 pl-9 text-[10px] text-slate-400">
            Simultaneous spatial overlap with azimuth stereo panning & reverberation
          </div>
        </div>
      </div>
    </div>
  );
};

function generateSvgWavePath(wave: number[], width: number, height: number): string {
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

function generateMixedWavePath(speakers: number, snr: number, offset: number): string {
  const points = 50;
  const wave: number[] = [];
  const noiseScale = Math.max(0.05, 0.2 - snr * 0.008);

  for (let i = 0; i < points; i++) {
    const t = (i / points) * 5.0 + offset;
    let sum = 0;
    for (let s = 1; s <= speakers; s++) {
      sum += Math.sin(t * (2.0 + s * 1.3)) * Math.cos(t * 0.8 + s);
    }
    const noise = (Math.sin(i * 99) * 0.5) * noiseScale;
    wave.push((sum / (Math.sqrt(speakers) * 1.5)) + noise);
  }

  return generateSvgWavePath(wave, 100, 30);
}
