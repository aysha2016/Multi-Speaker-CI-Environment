import React from 'react';
import {
  AudioWaveform,
  Network,
  Target,
  Cpu,
  Brain,
  ChevronRight,
  Workflow,
} from 'lucide-react';
import { PipelineNodeInfo } from '../types/simulation';

interface ModelPipelineCardProps {
  isPlaying: boolean;
  onSelectNode: (node: PipelineNodeInfo) => void;
}

export const PIPELINE_NODES: PipelineNodeInfo[] = [
  {
    id: 'audio_input',
    stepNumber: '01',
    title: 'Multi-Speaker Audio',
    subtitle: 'Spatial acoustic mixing & room impulse response',
    description:
      'Simulates overlapping acoustic soundwaves from multiple directional talkers convolved with room impulse responses (RIRs) and diffuse restaurant noise.',
    formula: 'x(t) = \\sum_{i=1}^N (s_i(t) * h_i(t)) + n(t)',
    keyParameters: [
      { label: 'Sampling Rate', value: '16 kHz / 48 kHz' },
      { label: 'RIR Reflection', value: 'Image Source Method (ISM)' },
      { label: 'Spatial Microphone Array', value: 'Bilateral CI Dual-Mic' },
    ],
    researchInsight:
      'Binaural level differences (ILD) and time differences (ITD) allow spatial separation, but CI users lack fine structure ITD cues.',
  },
  {
    id: 'source_sep',
    stepNumber: '02',
    title: 'Source Separation',
    subtitle: 'Deep neural speech separation & masking',
    description:
      'Employs time-domain audio separation networks (Conv-TasNet / DPRNN / SepFormer) with learned encoder-decoder bases to estimate clean talker streams.',
    formula: '\\hat{s}_i(t) = \\mathcal{D}(\\mathcal{M}_i \\odot \\mathcal{E}(x(t)))',
    keyParameters: [
      { label: 'Network Architecture', value: 'Dual-Path RNN / Conv-TasNet' },
      { label: 'Loss Objective', value: 'SI-SDR (Scale-Invariant SDR)' },
      { label: 'Latency Budget', value: '< 10 ms real-time buffer' },
    ],
    researchInsight:
      'Permutation invariant training (PIT) resolves talker label permutation ambiguity during gradient descent optimization.',
  },
  {
    id: 'target_sel',
    stepNumber: '03',
    title: 'Target Selection',
    subtitle: 'Spatial MVDR & Auditory Attention Decoding',
    description:
      'Selects the intended conversation partner using spatial azimuth steering or electroencephalography (EEG) auditory attention decoding (AAD).',
    formula: 'w_{opt} = \\frac{R_{nn}^{-1} d}{d^H R_{nn}^{-1} d}',
    keyParameters: [
      { label: 'Steering Vector', value: 'Azimuth beam pointing' },
      { label: 'Attention Weighting', value: 'Softmax cross-entropy focus' },
      { label: 'Interferer Attenuation', value: '8 dB to 16 dB suppression' },
    ],
    researchInsight:
      'Combining visual gaze tracking or neural AAD enables the processor to automatically track which person the CI user is attending to.',
  },
  {
    id: 'ci_encoding',
    stepNumber: '04',
    title: 'CI Encoding',
    subtitle: '22-channel filterbank & envelope extraction',
    description:
      'Transforms clean target speech through 22 logarithmic bandpass filters, envelope full-wave rectification, non-linear logarithmic loudness growth compression, and ACE n-of-m pulse generation.',
    formula: 'I_k(t) = C_k \\cdot \\log(1 + \\alpha_k E_k(t))',
    keyParameters: [
      { label: 'Coding Strategy', value: 'ACE (Advanced Combination Encoders)' },
      { label: 'Electrode Channels', value: '22 intra-cochlear platinum rings' },
      { label: 'Pulse Rate', value: '900 pps / channel biphasic' },
    ],
    researchInsight:
      'Peak-picking (ACE) selects 8 channels with highest spectral energy per frame to conserve battery power and minimize channel interaction.',
  },
  {
    id: 'neural_resp',
    stepNumber: '05',
    title: 'Neural Response',
    subtitle: 'Spiral ganglion cell population discharge',
    description:
      'Simulates auditory nerve fiber (ANF) stochastic action potentials, refractory recovery periods, and tonotopic excitation spread along the cochlear spiral.',
    formula: '\\lambda_k(t) = \\text{SGN}(I_k(t) * g_{spread}(x))',
    keyParameters: [
      { label: 'Fiber Population', value: '30,000 Spiral Ganglion Neurons' },
      { label: 'Current Spread Constant', value: '\\lambda = 2.4 mm' },
      { label: 'Refractory Period', value: 'Absolute: 0.8ms, Relative: 3.5ms' },
    ],
    researchInsight:
      'Electrode current spread in perilymph fluid creates channel cross-talk, limiting perceived pitch channels to effectively 6–8 independent bands.',
  },
];

export const ModelPipelineCard: React.FC<ModelPipelineCardProps> = ({
  isPlaying,
  onSelectNode,
}) => {
  const nodes = [
    {
      info: PIPELINE_NODES[0],
      name: 'Multi-Speaker Audio',
      icon: AudioWaveform,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      info: PIPELINE_NODES[1],
      name: 'Source Separation',
      icon: Network,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      info: PIPELINE_NODES[2],
      name: 'Target Selection',
      icon: Target,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      info: PIPELINE_NODES[3],
      name: 'CI Encoding',
      icon: Cpu,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      info: PIPELINE_NODES[4],
      name: 'Neural Response',
      icon: Brain,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center">
          <Workflow className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
            Model Pipeline
          </h3>
          <p className="text-xs text-slate-500">
            Processing pipeline for multi-speaker CI environment
          </p>
        </div>
      </div>

      {/* 5 Connected Nodes */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
        {nodes.map((n, idx) => {
          const Icon = n.icon;
          return (
            <React.Fragment key={n.info.id}>
              {/* Node Card */}
              <button
                onClick={() => onSelectNode(n.info)}
                className="flex-1 min-w-[70px] flex flex-col items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group text-center"
                title={`Inspect step ${n.info.stepNumber}: ${n.name}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105 ${n.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-[#1677FF] line-clamp-2">
                  {n.name}
                </span>
              </button>

              {/* Connecting arrow */}
              {idx < nodes.length - 1 && (
                <div className="shrink-0 text-slate-300 flex items-center justify-center">
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isPlaying ? 'text-blue-500 animate-pulse' : 'text-slate-300'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
