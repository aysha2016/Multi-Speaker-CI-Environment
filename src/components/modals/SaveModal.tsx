import React, { useState } from 'react';
import { X, Save, Check, Trash2, FolderOpen } from 'lucide-react';
import { SimulationState, SimulationMetrics, SavedExperiment } from '../../types/simulation';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  metrics: SimulationMetrics;
  savedExperiments: SavedExperiment[];
  onSaveExperiment: (exp: SavedExperiment) => void;
  onLoadExperiment: (exp: SavedExperiment) => void;
  onDeleteExperiment: (id: string) => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  state,
  metrics,
  savedExperiments,
  onSaveExperiment,
  onLoadExperiment,
  onDeleteExperiment,
}) => {
  const [expName, setExpName] = useState(`Experiment-${Date.now().toString().slice(-4)}`);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: SavedExperiment = {
      id: `exp-${Date.now()}`,
      name: expName.trim() || `Experiment-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      environment: state.environment,
      numberOfSpeakers: state.numberOfSpeakers,
      snr: state.snr,
      reverberation: state.reverberation,
      speakerDistance: state.speakerDistance,
      targetSpeakerId: state.targetSpeakerId,
      spatialFiltering: state.spatialFiltering,
      attentionModel: state.attentionModel,
      ciChannels: state.ciChannels,
      separationModel: state.separationModel,
      metrics: {
        separationQuality: metrics.separationQuality,
        targetSnr: metrics.targetSnr,
        speechRecognition: metrics.speechRecognition,
        speakerIdentification: metrics.speakerIdentification,
      },
    };

    onSaveExperiment(newExp);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1677FF] flex items-center justify-center">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Save Simulation Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Record active multi-speaker parameters & metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experiment Name
            </label>
            <input
              type="text"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 4-Spk Restaurant with Beamforming"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5 text-slate-600">
            <div className="font-semibold text-slate-800">Parameters Snapshot:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div>Environment: <strong className="text-slate-900">{state.environment}</strong></div>
              <div>Speakers: <strong className="text-slate-900">{state.numberOfSpeakers} talkers</strong></div>
              <div>SNR: <strong className="text-slate-900">{state.snr} dB</strong></div>
              <div>Reverb (T60): <strong className="text-slate-900">{state.reverberation} s</strong></div>
              <div>Target: <strong className="text-slate-900">Speaker {state.targetSpeakerId}</strong></div>
              <div>Spatial Beam: <strong className="text-slate-900">{state.spatialFiltering ? 'ON' : 'OFF'}</strong></div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
              savedSuccess ? 'bg-emerald-600' : 'bg-[#1677FF] hover:bg-blue-600'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Experiment</span>
              </>
            )}
          </button>
        </form>

        {/* Saved Experiments List */}
        {savedExperiments.length > 0 && (
          <div className="mt-2 pt-3 border-t border-slate-100 flex-1 overflow-y-auto">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Previously Saved Configurations ({savedExperiments.length})</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {savedExperiments.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all text-xs"
                >
                  <div className="leading-tight">
                    <div className="font-semibold text-slate-900">{exp.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {exp.environment} · {exp.numberOfSpeakers}spk · {exp.snr}dB · Sep: {exp.metrics.separationQuality.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onLoadExperiment(exp);
                        onClose();
                      }}
                      className="px-2 py-1 bg-blue-50 text-[#1677FF] hover:bg-blue-100 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteExperiment(exp.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
