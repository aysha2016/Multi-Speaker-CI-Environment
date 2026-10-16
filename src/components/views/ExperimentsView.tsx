import React, { useState } from 'react';
import {
  SimulationState,
  SimulationMetrics,
  SavedExperiment,
  EnvironmentType,
  SpeakerId,
  SeparationModelType,
} from '../../types/simulation';
import { computeSimulationMetrics } from '../../utils/simulationMath';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  Layers,
  Sparkles,
  Lightbulb,
  Table,
  RefreshCw,
} from 'lucide-react';

interface ExperimentsViewProps {
  state: SimulationState;
  metrics: SimulationMetrics;
  savedExperiments: SavedExperiment[];
  onApplyState: (newState: Partial<SimulationState>) => void;
  onSaveExperiment: (exp: SavedExperiment) => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  state,
  metrics,
  savedExperiments,
  onApplyState,
  onSaveExperiment,
}) => {
  // Form fields for Experiment Builder
  const [expName, setExpName] = useState('Multi-Talker Benchmark Trial 01');
  const [env, setEnv] = useState<EnvironmentType>(state.environment);
  const [speakers, setSpeakers] = useState<number>(state.numberOfSpeakers);
  const [snr, setSnr] = useState<number>(state.snr);
  const [reverb, setReverb] = useState<number>(state.reverberation);
  const [distance, setDistance] = useState<number>(state.speakerDistance);
  const [target, setTarget] = useState<SpeakerId>(state.targetSpeakerId);
  const [spatial, setSpatial] = useState<boolean>(state.spatialFiltering);
  const [attention, setAttention] = useState<boolean>(state.attentionModel);
  const [ciStrat, setCiStrat] = useState<'ACE' | 'CIS' | 'SPEAK'>(state.ciStrategy);

  // Simulation execution state
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [experimentResult, setExperimentResult] = useState<{
    metrics: SimulationMetrics;
    appliedState: any;
  } | null>(null);

  const steps = [
    'Acoustic Environment Synthesis',
    'AI Source Separation',
    'Target Selection & Beamforming',
    '22-Channel CI Tonotopic Encoding',
    'Neural Population Response',
    'Downstream Speech Evaluation',
  ];

  const handleRunExperiment = () => {
    setIsRunning(true);
    setActiveStep(0);
    setExperimentResult(null);

    // Sequential step-by-step deterministic execution
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setActiveStep(currentStep);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setActiveStep(steps.length);

        const testState: SimulationState = {
          ...state,
          environment: env,
          numberOfSpeakers: speakers,
          snr: snr,
          reverberation: reverb,
          speakerDistance: distance,
          targetSpeakerId: target,
          spatialFiltering: spatial,
          attentionModel: attention,
          ciStrategy: ciStrat,
        };

        const resultMetrics = computeSimulationMetrics(testState);
        setExperimentResult({
          metrics: resultMetrics,
          appliedState: testState,
        });

        // Also save to experiment list automatically
        onSaveExperiment({
          id: `exp-${Date.now()}`,
          name: expName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          environment: env,
          numberOfSpeakers: speakers,
          snr,
          reverberation: reverb,
          speakerDistance: distance,
          targetSpeakerId: target,
          spatialFiltering: spatial,
          attentionModel: attention,
          ciChannels: 22,
          separationModel: state.separationModel,
          metrics: {
            separationQuality: resultMetrics.separationQuality,
            targetSnr: resultMetrics.targetSnr,
            speechRecognition: resultMetrics.speechRecognition,
            speakerIdentification: resultMetrics.speakerIdentification,
          },
        });
      }
    }, 450);
  };

  const handleApplyToLiveScene = () => {
    if (experimentResult) {
      onApplyState(experimentResult.appliedState);
    }
  };

  // Pre-configured comparison experiments matching prompt section 18
  const defaultExperiments = [
    {
      name: 'Experiment A (Quiet Baseline)',
      speakers: 2,
      snr: 10,
      spatial: false,
      attention: false,
      sepQuality: 0.91,
      targetSnr: 12.8,
      speechRec: 0.88,
      spkId: 0.94,
    },
    {
      name: 'Experiment B (Dense Cocktail Party)',
      speakers: 4,
      snr: 0,
      spatial: false,
      attention: false,
      sepQuality: 0.68,
      targetSnr: 4.2,
      speechRec: 0.59,
      spkId: 0.82,
    },
    {
      name: 'Experiment C (CI-AI Spatial + Attention)',
      speakers: 4,
      snr: 0,
      spatial: true,
      attention: true,
      sepQuality: 0.82,
      targetSnr: 8.5,
      speechRec: 0.76,
      spkId: 0.88,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Experiment Builder */}
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1677FF] flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Experiment Builder
            </h2>
            <p className="text-xs text-slate-500">
              Configure multi-variable parameter trials and run end-to-end pipeline verification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trial Name
            </label>
            <input
              type="text"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Environment
            </label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value as EnvironmentType)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 cursor-pointer"
            >
              <option value="Quiet Room">Quiet Room</option>
              <option value="Office">Office</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Street">Street</option>
              <option value="Party">Party</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Speaker
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as SpeakerId)}
              className="w-full text-xs font-bold text-[#1677FF] bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 cursor-pointer"
            >
              <option value="A">Speaker A (-60°)</option>
              <option value="B">Speaker B (0°)</option>
              <option value="C">Speaker C (+45°)</option>
              <option value="D">Speaker D (+90°)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Speakers ({speakers})
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={speakers}
              onChange={(e) => setSpeakers(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SNR ({snr} dB)
            </label>
            <input
              type="range"
              min="-10"
              max="20"
              value={snr}
              onChange={(e) => setSnr(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reverberation ({reverb.toFixed(1)} s)
            </label>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.1"
              value={reverb}
              onChange={(e) => setReverb(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Distance ({distance.toFixed(1)} m)
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={spatial}
                onChange={(e) => setSpatial(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <span>Spatial Beamforming</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={attention}
                onChange={(e) => setAttention(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <span>Attention Model</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Pipeline will execute 6 deterministic evaluation stages.
          </div>
          <button
            onClick={handleRunExperiment}
            disabled={isRunning}
            className="px-6 py-2.5 bg-[#1677FF] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Simulation...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>RUN EXPERIMENT</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Stages Bar */}
        {(isRunning || activeStep >= 0) && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800">
              Execution Progress:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {steps.map((s, idx) => {
                const isDone = activeStep > idx;
                const isCurrent = activeStep === idx;
                return (
                  <div
                    key={s}
                    className={`p-2.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : isCurrent
                        ? 'bg-blue-50 border-blue-300 text-[#1677FF] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-ping shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result Callout */}
        {experimentResult && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div className="text-xs text-emerald-900 space-y-0.5">
              <div className="font-bold">Experiment Results Ready:</div>
              <div>
                Separation Quality: <strong className="font-mono">{experimentResult.metrics.separationQuality.toFixed(2)}</strong> · Target SNR: <strong className="font-mono">{experimentResult.metrics.targetSnr.toFixed(1)} dB</strong> · Speech Recognition: <strong className="font-mono">{experimentResult.metrics.speechRecognition.toFixed(2)}</strong>
              </div>
            </div>
            <button
              onClick={handleApplyToLiveScene}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Apply to Live Scene
            </button>
          </div>
        )}
      </div>

      {/* 2. Experiment Comparison Table (Section 18) */}
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Experiment Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Cross-trial parametric analysis of multi-talker separation algorithms
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="py-2.5 px-3">Parameter / Metric</th>
                {defaultExperiments.map((e) => (
                  <th key={e.name} className="py-2.5 px-3">{e.name}</th>
                ))}
                <th className="py-2.5 px-3 bg-blue-50/50 text-[#1677FF]">Current Active State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-500">Speakers Count</td>
                {defaultExperiments.map((e) => (
                  <td key={e.name} className="py-2 px-3 font-mono">{e.speakers} talkers</td>
                ))}
                <td className="py-2 px-3 font-mono font-bold text-blue-700 bg-blue-50/30">{state.numberOfSpeakers} talkers</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-500">Input SNR</td>
                {defaultExperiments.map((e) => (
                  <td key={e.name} className="py-2 px-3 font-mono">{e.snr} dB</td>
                ))}
                <td className="py-2 px-3 font-mono font-bold text-blue-700 bg-blue-50/30">{state.snr} dB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-500">Spatial Beamforming</td>
                {defaultExperiments.map((e) => (
                  <td key={e.name} className="py-2 px-3">{e.spatial ? 'YES' : 'NO'}</td>
                ))}
                <td className="py-2 px-3 font-bold text-blue-700 bg-blue-50/30">{state.spatialFiltering ? 'YES' : 'NO'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-500">Separation Quality</td>
                {defaultExperiments.map((e) => (
                  <td key={e.name} className="py-2 px-3 font-mono font-bold text-slate-900">{e.sepQuality}</td>
                ))}
                <td className="py-2 px-3 font-mono font-bold text-[#1677FF] bg-blue-50/30">{metrics.separationQuality.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-500">Target Output SNR</td>
                {defaultExperiments.map((e) => (
                  <td key={e.name} className="py-2 px-3 font-mono font-bold text-emerald-600">{e.targetSnr} dB</td>
                ))}
                <td className="py-2 px-3 font-mono font-bold text-emerald-700 bg-blue-50/30">{metrics.targetSnr.toFixed(1)} dB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-500">Speech Recognition</td>
                {defaultExperiments.map((e) => (
                  <td key={e.name} className="py-2 px-3 font-mono font-bold text-rose-600">{e.speechRec}</td>
                ))}
                <td className="py-2 px-3 font-mono font-bold text-rose-700 bg-blue-50/30">{metrics.speechRecognition.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-500">Speaker ID Accuracy</td>
                {defaultExperiments.map((e) => (
                  <td key={e.name} className="py-2 px-3 font-mono font-bold text-amber-600">{e.spkId}</td>
                ))}
                <td className="py-2 px-3 font-mono font-bold text-amber-700 bg-blue-50/30">{metrics.speakerIdentification.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Research Insights & Hypotheses (Section 19) */}
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">
            Synthesized Research Insights & Hypotheses
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
              ● SIMULATION OBSERVATIONS
            </span>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Adding talkers from 2 to 4 increases simulated source overlap, decreasing separation quality by 0.14.</li>
              <li>Spatial separation (beamforming toward target) boosts output target SNR by +4.2 dB.</li>
              <li>Reverberation (T60 &gt; 0.6s) reduces envelope clarity and drops recognition accuracy.</li>
              <li>Attention-based target selection successfully isolates target speaker even in -6 dB SNR.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded">
              ◆ RESEARCH HYPOTHESIS
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Combining spatial filtering and auditory attention decoding provides a substantially stronger target-speaker representation for CI users in complex multi-speaker environments by preventing electrical channel cross-talk before the 22-channel filterbank extraction stage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
