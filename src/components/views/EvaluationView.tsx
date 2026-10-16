import React, { useState } from 'react';
import { SimulationState, SimulationMetrics } from '../../types/simulation';
import { BarChart3, TrendingUp, Filter, CheckCircle2 } from 'lucide-react';

interface EvaluationViewProps {
  state: SimulationState;
  metrics: SimulationMetrics;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  state,
  metrics,
}) => {
  const [activeTab, setActiveTab] = useState<
    'separation' | 'identification' | 'recognition' | 'spatial' | 'ci'
  >('separation');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1677FF] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Multi-Speaker Evaluation Benchmark
              </h2>
              <p className="text-xs text-slate-500">
                Parametric psychoacoustic and computational performance curves
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
            SIMULATED EVALUATION
          </span>
        </div>

        {/* Evaluation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 mb-6 overflow-x-auto">
          {[
            { id: 'separation', label: 'Separation vs SNR' },
            { id: 'recognition', label: 'Speech Recognition vs Speakers' },
            { id: 'identification', label: 'Speaker ID vs SNR' },
            { id: 'spatial', label: 'Localization vs Azimuth' },
            { id: 'ci', label: 'Target SNR vs Reverberation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Chart Display based on Tab */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
          {activeTab === 'separation' && (
            <ChartSeparationVsSnr currentSnr={state.snr} currentQuality={metrics.separationQuality} />
          )}
          {activeTab === 'recognition' && (
            <ChartRecognitionVsSpeakers currentSpeakers={state.numberOfSpeakers} currentRec={metrics.speechRecognition} />
          )}
          {activeTab === 'identification' && (
            <ChartIdVsSnr currentSnr={state.snr} currentId={metrics.speakerIdentification} />
          )}
          {activeTab === 'spatial' && (
            <ChartLocalizationVsSeparation spatialFiltering={state.spatialFiltering} />
          )}
          {activeTab === 'ci' && (
            <ChartSnrVsReverberation currentReverb={state.reverberation} currentSnr={metrics.targetSnr} />
          )}
        </div>
      </div>
    </div>
  );
};

// 1. Separation Quality vs SNR Chart
function ChartSeparationVsSnr({ currentSnr, currentQuality }: { currentSnr: number; currentQuality: number }) {
  const snrPoints = [-10, -5, 0, 5, 10, 15, 20];
  const baselineValues = [0.45, 0.58, 0.70, 0.81, 0.88, 0.92, 0.95];
  const beamformingValues = [0.58, 0.72, 0.82, 0.89, 0.94, 0.96, 0.98];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Separation Quality vs Input SNR</h4>
          <p className="text-xs text-slate-500">Evaluates talker isolation across noisy SNR regimes (-10 to +20 dB)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-blue-600">
            <span className="w-3 h-0.5 bg-blue-600 rounded" />
            <span>AI + Beamforming</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 bg-slate-400 rounded" />
            <span>Single-Channel AI</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full bg-white rounded-xl p-4 border border-slate-200 relative">
        <svg className="w-full h-48" viewBox="0 0 500 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 50, 100, 150].map((y) => (
            <line key={y} x1="30" y1={y} x2="480" y2={y} stroke="#F1F5F9" strokeWidth="1" />
          ))}

          {/* Baseline Curve */}
          <path
            d="M 30 145 L 105 125 L 180 100 L 255 78 L 330 60 L 405 50 L 480 42"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* AI + Beamforming Curve */}
          <path
            d="M 30 120 L 105 92 L 180 70 L 255 52 L 330 38 L 405 32 L 480 26"
            fill="none"
            stroke="#1677FF"
            strokeWidth="3"
          />

          {/* Current Operating Point Marker */}
          {(() => {
            const normX = 30 + ((currentSnr + 10) / 30) * 450;
            const normY = 190 - currentQuality * 170;
            return (
              <g>
                <circle cx={normX} cy={normY} r="7" fill="#1677FF" stroke="#FFFFFF" strokeWidth="2.5" />
                <text x={normX} y={normY - 12} fill="#1677FF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Current ({currentQuality.toFixed(2)})
                </text>
              </g>
            );
          })()}
        </svg>

        <div className="flex justify-between text-[11px] font-mono text-slate-500 px-6 pt-1">
          {snrPoints.map((p) => (
            <span key={p}>{p > 0 ? `+${p}` : p} dB</span>
          ))}
        </div>
        <div className="text-center text-[11px] font-semibold text-slate-400 mt-0.5">Input SNR (dB)</div>
      </div>
    </div>
  );
}

// 2. Speech Recognition vs Number of Speakers
function ChartRecognitionVsSpeakers({ currentSpeakers, currentRec }: { currentSpeakers: number; currentRec: number }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">Speech Recognition vs Number of Competing Speakers</h4>
        <p className="text-xs text-slate-500">Intelligibility retention curve as competing talker density increases from 1 to 6</p>
      </div>

      <div className="h-64 w-full bg-white rounded-xl p-4 border border-slate-200 relative">
        <svg className="w-full h-48" viewBox="0 0 500 200" preserveAspectRatio="none">
          {[0, 50, 100, 150].map((y) => (
            <line key={y} x1="40" y1={y} x2="480" y2={y} stroke="#F1F5F9" strokeWidth="1" />
          ))}

          {/* Normal Hearing theoretical limit */}
          <path
            d="M 50 30 L 130 38 L 210 52 L 290 70 L 370 92 L 450 115"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* CI with AI Separation */}
          <path
            d="M 50 45 L 130 58 L 210 78 L 290 102 L 370 128 L 450 152"
            fill="none"
            stroke="#F43F5E"
            strokeWidth="3"
          />

          {/* Current Operating Point */}
          {(() => {
            const x = 50 + ((currentSpeakers - 1) / 5) * 400;
            const y = 190 - currentRec * 170;
            return (
              <g>
                <circle cx={x} cy={y} r="7" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2.5" />
                <text x={x} y={y - 12} fill="#F43F5E" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Current ({currentRec.toFixed(2)})
                </text>
              </g>
            );
          })()}
        </svg>

        <div className="flex justify-between text-[11px] font-mono text-slate-500 px-8 pt-1">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <span key={s}>{s} Talkers</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Speaker ID vs SNR
function ChartIdVsSnr({ currentSnr, currentId }: { currentSnr: number; currentId: number }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">Speaker Identification Accuracy vs SNR</h4>
        <p className="text-xs text-slate-500">Embedding-based neural speaker verification accuracy across SNR conditions</p>
      </div>
      <div className="h-64 w-full bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-3xl font-mono font-bold text-amber-600">{(currentId * 100).toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Current Identification Accuracy at {currentSnr} dB SNR</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Deep d-vector speaker embeddings maintain robust talker clustering above -5 dB SNR with less than 4% speaker confusion rate.
          </p>
        </div>
      </div>
    </div>
  );
}

// 4. Localization vs Azimuth
function ChartLocalizationVsSeparation({ spatialFiltering }: { spatialFiltering: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">Spatial Release from Masking (SRM) & Azimuth Resolution</h4>
        <p className="text-xs text-slate-500">Mean localization root-mean-square (RMS) angular error across spatial separations</p>
      </div>
      <div className="h-64 w-full bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-3xl font-mono font-bold text-[#1677FF]">
            {spatialFiltering ? '±8.5° Error' : '±28.0° Error'}
          </div>
          <div className="text-xs text-slate-500">
            Spatial Filtering is currently {spatialFiltering ? 'ENABLED (High Azimuth Precision)' : 'DISABLED (Diffuse)'}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Target SNR vs Reverberation
function ChartSnrVsReverberation({ currentReverb, currentSnr }: { currentReverb: number; currentSnr: number }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">Target Output SNR vs Room Reverberation (T60)</h4>
        <p className="text-xs text-slate-500">Decay of target signal-to-noise ratio as room reverberation increases from 0.0s to 1.5s</p>
      </div>
      <div className="h-64 w-full bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-3xl font-mono font-bold text-emerald-600">
            {currentSnr.toFixed(1)} dB Target SNR
          </div>
          <div className="text-xs text-slate-500">
            Current Room Reverberation T60: {currentReverb.toFixed(2)} seconds
          </div>
        </div>
      </div>
    </div>
  );
}
