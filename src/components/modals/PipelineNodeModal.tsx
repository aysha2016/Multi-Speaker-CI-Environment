import React from 'react';
import { X, Cpu, BookOpen, Layers, Lightbulb } from 'lucide-react';
import { PipelineNodeInfo } from '../../types/simulation';

interface PipelineNodeModalProps {
  node: PipelineNodeInfo | null;
  onClose: () => void;
}

export const PipelineNodeModal: React.FC<PipelineNodeModalProps> = ({
  node,
  onClose,
}) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#1677FF] font-mono font-bold text-xs flex items-center justify-center">
              {node.stepNumber}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {node.title}
              </h3>
              <p className="text-xs text-slate-500">{node.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Algorithmic Mechanism</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {node.description}
            </p>
          </div>

          {/* Mathematical Formulation */}
          <div>
            <div className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Mathematical Model</span>
            </div>
            <div className="p-2.5 bg-slate-900 text-cyan-300 font-mono text-xs rounded-xl text-center shadow-inner tracking-wide">
              {node.formula}
            </div>
          </div>

          {/* Key Parameters */}
          <div>
            <div className="text-xs font-semibold text-slate-800 mb-1.5">
              Operating Parameters
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {node.keyParameters.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-slate-500">{p.label}:</span>
                  <span className="font-semibold font-mono text-slate-800">{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Research Insight */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-bold block mb-0.5">RESEARCH INSIGHT</strong>
              {node.researchInsight}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
