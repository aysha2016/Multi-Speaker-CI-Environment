import React from 'react';
import { SimulationState, SeparationModelType } from '../../types/simulation';
import { Network, CheckCircle, Cpu, Zap, ArrowRight } from 'lucide-react';

interface SeparationViewProps {
  state: SimulationState;
  onUpdateModel: (model: SeparationModelType) => void;
}

export const SeparationView: React.FC<SeparationViewProps> = ({
  state,
  onUpdateModel,
}) => {
  const models: {
    name: SeparationModelType;
    params: string;
    sisdri: string;
    stoi: string;
    pesq: string;
    latency: string;
    desc: string;
  }[] = [
    {
      name: 'Demonstration Model',
      params: '1.2M',
      sisdri: '+12.4 dB',
      stoi: '0.86',
      pesq: '2.84',
      latency: '8 ms',
      desc: 'Lightweight low-latency baseline tuned for real-time mobile cochlear implant processors.',
    },
    {
      name: 'DPRNN',
      params: '2.6M',
      sisdri: '+15.2 dB',
      stoi: '0.91',
      pesq: '3.15',
      latency: '14 ms',
      desc: 'Dual-Path Recurrent Neural Network splitting speech into intra-chunk and inter-chunk modeling.',
    },
    {
      name: 'Conv-TasNet',
      params: '5.1M',
      sisdri: '+14.6 dB',
      stoi: '0.89',
      pesq: '3.02',
      latency: '10 ms',
      desc: 'Time-domain dilated convolutional architecture with depthwise separable filters.',
    },
    {
      name: 'Transformer',
      params: '26M',
      sisdri: '+17.8 dB',
      stoi: '0.94',
      pesq: '3.42',
      latency: '35 ms',
      desc: 'SepFormer multiscale transformer with learned temporal self-attention masks.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E3EAF3] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                AI Speech Separation & Enhancement
              </h2>
              <p className="text-xs text-slate-500">
                Time-domain masking networks and deep clustering benchmarked for CI sound coding
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
            SIMULATED BENCHMARK
          </span>
        </div>

        {/* Model Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-4">
          {models.map((m) => {
            const isSelected = state.separationModel === m.name;
            return (
              <div
                key={m.name}
                onClick={() => onUpdateModel(m.name)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1677FF] bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{m.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#1677FF]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-y-1 text-[11px]">
                  <span className="text-slate-400">SI-SDRi:</span>
                  <span className="font-mono font-bold text-emerald-600 text-right">{m.sisdri}</span>
                  <span className="text-slate-400">STOI:</span>
                  <span className="font-mono font-bold text-slate-800 text-right">{m.stoi}</span>
                  <span className="text-slate-400">Latency:</span>
                  <span className="font-mono font-bold text-slate-800 text-right">{m.latency}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Permutation Invariant Training & SI-SDR loss explanation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 block font-semibold mb-1">
            Permutation Invariant Training (uPIT) & Scale-Invariant SDR (SI-SDR):
          </strong>
          Separation models optimize over the minimum permutation loss between estimated speaker waveforms and ground truth references. In cochlear implant users, preserving low-frequency envelope modulations is vastly more crucial than fine spectral phase, since current clinical implants discard phase information above ~300 Hz.
        </div>
      </div>
    </div>
  );
};
