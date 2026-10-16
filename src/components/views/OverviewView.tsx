import React from 'react';
import {
  HelpCircle,
  Lightbulb,
  Workflow,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Users,
} from 'lucide-react';
import { SimulationState, SimulationMetrics, ActivePage } from '../../types/simulation';

interface OverviewViewProps {
  state: SimulationState;
  metrics: SimulationMetrics;
  onNavigate: (page: ActivePage) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  metrics,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Research Question & Hypothesis Card (Section 20 in Prompt) */}
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677FF] flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <div className="text-xs font-bold text-[#1677FF] uppercase tracking-wider">
                CORE RESEARCH QUESTION
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                “How can AI separate, identify, select, and enhance a target speaker before cochlear implant encoding in a complex multi-speaker environment?”
              </h2>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <strong className="text-slate-900 block font-semibold">
                RESEARCH HYPOTHESIS:
              </strong>
              <p>
                Spatial separation + speaker attention + CI-aware processing may improve target-speaker representation under multi-speaker conditions. Combining front-end neural beamforming with auditory attention decoding protects cochlear electrode filterbanks from catastrophic energetic and informational masking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Configuration & Quick Launch Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current State Snapshot */}
        <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              CURRENT SIMULATION SETUP
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Environment:</span>
                <span className="font-semibold text-slate-900">{state.environment}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Speakers:</span>
                <span className="font-semibold text-slate-900">{state.numberOfSpeakers} talkers</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Input SNR:</span>
                <span className="font-mono font-semibold text-slate-900">{state.snr} dB</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Target Speaker:</span>
                <span className="font-semibold text-[#1677FF]">Speaker {state.targetSpeakerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Spatial Filtering:</span>
                <span className="font-semibold text-emerald-600">{state.spatialFiltering ? 'ENABLED' : 'DISABLED'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('multiple-speakers')}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            <span>Open Main 3D Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Metrics Summary */}
        <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              TARGET SPEAKER METRICS (SIMULATED)
            </div>
            <div className="grid grid-cols-2 gap-3 text-center my-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Separation</div>
                <div className="text-xl font-mono font-bold text-[#1677FF]">{metrics.separationQuality.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Target SNR</div>
                <div className="text-xl font-mono font-bold text-emerald-600">{metrics.targetSnr.toFixed(1)} dB</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Recognition</div>
                <div className="text-xl font-mono font-bold text-rose-600">{metrics.speechRecognition.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Speaker ID</div>
                <div className="text-xl font-mono font-bold text-amber-600">{metrics.speakerIdentification.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('evaluation')}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <span>View Full Evaluation Curves</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CI Research Pipeline Card */}
        <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              PIPELINE ARCHITECTURE
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                From microphone array spatial input down to auditory nerve fiber (ANF) discharge, the system models each computational stage in real-time.
              </p>
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 font-mono">
                Audio → Separation → Target Attention → 22-Ch CI → SGN Discharge
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('experiments')}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            <span>Launch Experiment Runner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
