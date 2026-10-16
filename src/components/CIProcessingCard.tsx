import React, { useEffect, useRef, useState } from 'react';
import { SimulationState, SpeakerId } from '../types/simulation';
import { getActiveSpeakers } from '../utils/simulationMath';
import { audioEngine, SPEAKER_TRANSCRIPTS } from '../utils/audioEngine';
import { Cpu, Zap, Play, Pause, Headphones } from 'lucide-react';

interface CIProcessingCardProps {
  state: SimulationState;
  onSelectTarget: (id: SpeakerId) => void;
}

export const CIProcessingCard: React.FC<CIProcessingCardProps> = ({
  state,
  onSelectTarget,
}) => {
  const ciCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stimCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingVocoder, setIsPlayingVocoder] = useState(false);

  const activeSpeakers = getActiveSpeakers(state.numberOfSpeakers);
  const targetSpeaker =
    activeSpeakers.find((s) => s.id === state.targetSpeakerId) || activeSpeakers[0];

  const handleToggleVocoderAudio = () => {
    if (isPlayingVocoder) {
      audioEngine.stopSpeakerAudio('ci_vocoder');
      setIsPlayingVocoder(false);
    } else {
      audioEngine.stopAll();
      setIsPlayingVocoder(true);
      audioEngine.playCIVocodedSpeech(state.targetSpeakerId, () => {
        setIsPlayingVocoder(false);
      });
    }
  };

  // Render CI Filterbank Spectrogram and Electrode Stimulation Rasters
  useEffect(() => {
    // 1. CI Spectrogram (22 Tonotopic Channels)
    const ciCanvas = ciCanvasRef.current;
    if (ciCanvas) {
      const ctx = ciCanvas.getContext('2d');
      if (ctx) {
        const w = ciCanvas.width;
        const h = ciCanvas.height;
        ctx.fillStyle = '#061328';
        ctx.fillRect(0, 0, w, h);

        const channels = 22;
        const timeSteps = 45;
        const cellW = w / timeSteps;
        const cellH = h / channels;

        const targetPitchFactor = targetSpeaker ? targetSpeaker.pitch / 150 : 1.0;

        for (let ch = 0; ch < channels; ch++) {
          for (let t = 0; t < timeSteps; t++) {
            const timeSec = (t / timeSteps) * 5.0;
            // Tonotopic resonance
            const channelFreqWeight = Math.sin((ch / channels) * Math.PI * targetPitchFactor);
            const timeEnvelope =
              Math.max(0, Math.sin(timeSec * 2.8)) * 0.7 +
              Math.max(0, Math.cos(timeSec * 4.6)) * 0.3;

            const intensity = Math.min(1.0, Math.max(0, channelFreqWeight * timeEnvelope + Math.random() * 0.08));

            // Cyan/Electric Blue CI palette
            if (intensity > 0.15) {
              const r = Math.round(intensity * 40);
              const g = Math.round(intensity * 180 + 30);
              const b = Math.round(intensity * 255);
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx.fillRect(t * cellW, ch * cellH, cellW - 0.5, cellH - 0.5);
            }
          }
        }
      }
    }

    // 2. Electrode Stimulation Pattern (Biphasic Pulse Trains)
    const stimCanvas = stimCanvasRef.current;
    if (stimCanvas) {
      const ctx = stimCanvas.getContext('2d');
      if (ctx) {
        const w = stimCanvas.width;
        const h = stimCanvas.height;
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, w, h);

        const channels = 22;
        const timeSteps = 60;
        const cellW = w / timeSteps;
        const cellH = h / channels;

        // Draw light grid lines
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 0.5;
        for (let ch = 0; ch <= channels; ch += 5) {
          ctx.beginPath();
          ctx.moveTo(0, ch * cellH);
          ctx.lineTo(w, ch * cellH);
          ctx.stroke();
        }

        // Draw blue stimulation pulses (ACE strategy: selecting 8 maxima out of 22)
        ctx.strokeStyle = '#1677FF';
        ctx.lineWidth = 1.4;

        for (let t = 0; t < timeSteps; t++) {
          const timeSec = (t / timeSteps) * 5.0;
          const isVocalBurst = Math.sin(timeSec * 2.8) > -0.2;

          if (isVocalBurst) {
            for (let ch = 0; ch < channels; ch++) {
              const pulseProbability = Math.sin(ch * 0.4 + timeSec * 3) * 0.5 + 0.5;
              if (pulseProbability > 0.6) {
                const y1 = ch * cellH + 1;
                const y2 = (ch + 1) * cellH - 1;
                const x = t * cellW + cellW / 2;

                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();
              }
            }
          }
        }
      }
    }
  }, [state.targetSpeakerId, state.numberOfSpeakers, targetSpeaker]);

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header with Target Dropdown & Vocoder Listen Button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
              CI Processing (Target Speaker)
            </h3>
            <p className="text-xs text-slate-500">
              Encode the selected speaker into CI representation
            </p>
          </div>
        </div>

        {/* Target Speaker Dropdown & Vocoder button */}
        <div className="flex items-center gap-2">
          <select
            value={state.targetSpeakerId}
            onChange={(e) => onSelectTarget(e.target.value as SpeakerId)}
            className="text-xs font-bold text-[#1677FF] bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
          >
            {activeSpeakers.map((spk) => (
              <option key={spk.id} value={spk.id}>
                {spk.name} ({spk.angle > 0 ? `+${spk.angle}°` : `${spk.angle}°`})
              </option>
            ))}
          </select>

          {/* Real CI Vocoder Audio Button */}
          <button
            onClick={handleToggleVocoderAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isPlayingVocoder
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title="Listen to how this real speech sentence sounds through a 22-channel CI simulation"
          >
            {isPlayingVocoder ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause CI Audio</span>
              </>
            ) : (
              <>
                <Headphones className="w-3 h-3" />
                <span>Listen to CI Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Two side-by-side plots: CI Spectrogram & Electrode Stimulation */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Left: CI Spectrogram */}
        <div className="flex flex-col">
          <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>CI Spectrogram</span>
            <span className="text-[10px] text-slate-400 font-mono">22 Filterbanks</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Y Ticks */}
            <div className="flex flex-col justify-between h-[100px] text-[9px] text-slate-400 font-mono text-right select-none">
              <span>1</span>
              <span>6</span>
              <span>22</span>
            </div>
            {/* Canvas */}
            <div className="flex-1 h-[100px] rounded-lg overflow-hidden border border-slate-300 shadow-inner bg-[#061328]">
              <canvas
                ref={ciCanvasRef}
                width={200}
                height={100}
                className="w-full h-full block"
              />
            </div>
          </div>
          {/* X Ticks */}
          <div className="flex justify-between text-[9px] text-slate-400 font-mono pl-4 pr-1 pt-0.5 select-none">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <div className="text-center text-[9px] text-slate-400 font-medium -mt-1 select-none">
            Time (s)
          </div>
        </div>

        {/* Right: Electrode Stimulation */}
        <div className="flex flex-col">
          <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Electrode Stimulation</span>
            <span className="text-[10px] text-emerald-600 font-mono">ACE Strategy</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Y Ticks */}
            <div className="flex flex-col justify-between h-[100px] text-[9px] text-slate-400 font-mono text-right select-none">
              <span>1</span>
              <span>6</span>
              <span>22</span>
            </div>
            {/* Canvas */}
            <div className="flex-1 h-[100px] rounded-lg overflow-hidden border border-slate-300 shadow-inner bg-slate-50">
              <canvas
                ref={stimCanvasRef}
                width={200}
                height={100}
                className="w-full h-full block"
              />
            </div>
          </div>
          {/* X Ticks */}
          <div className="flex justify-between text-[9px] text-slate-400 font-mono pl-4 pr-1 pt-0.5 select-none">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <div className="text-center text-[9px] text-slate-400 font-medium -mt-1 select-none">
            Time (s)
          </div>
        </div>
      </div>
    </div>
  );
};
