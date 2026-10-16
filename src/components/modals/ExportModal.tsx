import React from 'react';
import { X, Download, FileText, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import { SimulationState, SimulationMetrics } from '../../types/simulation';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  metrics: SimulationMetrics;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  state,
  metrics,
}) => {
  if (!isOpen) return null;

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      project: 'CI-AI Research Lab',
      prototype: 'Multi-Speaker Cochlear Implant Research Prototype',
      exportedAt: new Date().toISOString(),
      disclaimer: 'Research simulation only. Not a medical device. Not clinically validated.',
      parameters: state,
      metrics: {
        separationQuality: metrics.separationQuality,
        targetSnr_dB: metrics.targetSnr,
        speechRecognition: metrics.speechRecognition,
        speakerIdentification: metrics.speakerIdentification,
        attentionWeights: metrics.attentionWeights,
      },
    };
    downloadFile(JSON.stringify(data, null, 2), 'ci_ai_simulation_experiment.json', 'application/json');
    onClose();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Parameter / Metric', 'Value', 'Unit'],
      ['Environment', state.environment, 'preset'],
      ['Number of Speakers', state.numberOfSpeakers, 'count'],
      ['Input SNR', state.snr, 'dB'],
      ['Reverberation (T60)', state.reverberation, 'seconds'],
      ['Speaker Distance', state.speakerDistance, 'meters'],
      ['Target Speaker', state.targetSpeakerId, 'identifier'],
      ['Spatial Filtering', state.spatialFiltering ? 'ENABLED' : 'DISABLED', 'boolean'],
      ['Attention Model', state.attentionModel ? 'ENABLED' : 'DISABLED', 'boolean'],
      ['CI Electrode Channels', state.ciChannels, 'channels'],
      ['Separation Model', state.separationModel, 'architecture'],
      ['Separation Quality (Simulated)', metrics.separationQuality, '0..1 score'],
      ['Target Output SNR (Simulated)', metrics.targetSnr, 'dB'],
      ['Speech Recognition (Simulated)', metrics.speechRecognition, '0..1 score'],
      ['Speaker Identification (Simulated)', metrics.speakerIdentification, '0..1 accuracy'],
    ];

    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    downloadFile(csvContent, 'ci_ai_metrics_data.csv', 'text/csv');
    onClose();
  };

  const handleExportReport = () => {
    const report = `# CI-AI Research Lab — Simulation Experiment Report
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Applet: Multi-Speaker Cochlear Implant Research Prototype

## 1. Research Problem & Configuration
• Environment: ${state.environment}
• Active Talkers: ${state.numberOfSpeakers}
• Input SNR: ${state.snr} dB
• Reverberation Time (T60): ${state.reverberation} s
• Speaker Distance: ${state.speakerDistance} m
• Target Speaker: Speaker ${state.targetSpeakerId}
• Spatial Beamforming: ${state.spatialFiltering ? 'Active (+4.2 dB beam boost)' : 'Inactive'}
• Auditory Attention Model: ${state.attentionModel ? 'Active' : 'Inactive'}
• Separation Architecture: ${state.separationModel}

## 2. Simulated Downstream Metrics
• Separation Quality: ${metrics.separationQuality.toFixed(2)} (${metrics.separationQualityDelta >= 0 ? '+' : ''}${metrics.separationQualityDelta}%)
• Target Speaker SNR: ${metrics.targetSnr.toFixed(1)} dB (${metrics.targetSnrDelta >= 0 ? '+' : ''}${metrics.targetSnrDelta} dB)
• Speech Recognition: ${metrics.speechRecognition.toFixed(2)} (${metrics.speechRecognitionDelta >= 0 ? '+' : ''}${metrics.speechRecognitionDelta}%)
• Speaker Identification: ${metrics.speakerIdentification.toFixed(2)} (${metrics.speakerIdentificationDelta >= 0 ? '+' : ''}${metrics.speakerIdentificationDelta}%)

## 3. Scientific Observations
1. Multi-Talker Masking: Overlapping speakers induce both energetic masking in cochlear filterbanks and informational masking during phonemic segmentation.
2. Spatial Filtering Benefit: Narrowing the spatial sensitivity lobe towards ${state.targetSpeakerId} suppresses off-axis talkers, restoring up to +5 dB speech reception threshold (SRT).
3. CI Channel Cross-Talk: The 22-channel electrode array exhibits current spread in perilymph, making front-end separation essential for speech intelligibility.

NOTICE: Research simulation only. Not a medical device. Not clinically validated.
`;
    downloadFile(report, 'ci_ai_simulation_report.md', 'text/markdown');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1677FF] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Experiment Data</h3>
              <p className="text-xs text-slate-500">Download formatted files for external analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2.5">
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1677FF] flex items-center justify-center shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-[#1677FF]">
                Export Experiment JSON
              </div>
              <div className="text-[11px] text-slate-500">
                Complete simulation parameters and metric trees
              </div>
            </div>
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                Export CSV Metrics
              </div>
              <div className="text-[11px] text-slate-500">
                Tabular spreadsheet format for Python/R/MATLAB
              </div>
            </div>
          </button>

          <button
            onClick={handleExportReport}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                Export Simulation Report
              </div>
              <div className="text-[11px] text-slate-500">
                Formatted academic summary with research observations
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
