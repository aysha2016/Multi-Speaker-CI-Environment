import React from 'react';
import { SimulationMetrics } from '../types/simulation';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceMetricsCardProps {
  metrics: SimulationMetrics;
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  metrics,
}) => {
  const metricCards = [
    {
      label: 'Separation Quality',
      value: metrics.separationQuality.toFixed(2),
      delta: `${metrics.separationQualityDelta >= 0 ? '↑' : '↓'} ${Math.abs(metrics.separationQualityDelta)}%`,
      isPositive: metrics.separationQualityDelta >= 0,
      sparkline: metrics.sparklines.separationQuality,
      strokeColor: '#3B82F6', // Blue
      fillColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Target SNR (dB)',
      value: metrics.targetSnr.toFixed(1),
      delta: `${metrics.targetSnrDelta >= 0 ? '↑' : '↓'} ${Math.abs(metrics.targetSnrDelta)}`,
      isPositive: metrics.targetSnrDelta >= 0,
      sparkline: metrics.sparklines.targetSnr,
      strokeColor: '#10B981', // Green
      fillColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Speech Recognition',
      value: metrics.speechRecognition.toFixed(2),
      delta: `${metrics.speechRecognitionDelta >= 0 ? '↑' : '↓'} ${Math.abs(metrics.speechRecognitionDelta)}%`,
      isPositive: metrics.speechRecognitionDelta >= 0,
      sparkline: metrics.sparklines.speechRecognition,
      strokeColor: '#F43F5E', // Pink/Red
      fillColor: 'rgba(244, 63, 94, 0.1)',
    },
    {
      label: 'Speaker Identification',
      value: metrics.speakerIdentification.toFixed(2),
      delta: `${metrics.speakerIdentificationDelta >= 0 ? '↑' : '↓'} ${Math.abs(metrics.speakerIdentificationDelta)}%`,
      isPositive: metrics.speakerIdentificationDelta >= 0,
      sparkline: metrics.sparklines.speakerIdentification,
      strokeColor: '#F59E0B', // Orange/Amber
      fillColor: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF3] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
              Performance Metrics (Simulated)
            </h3>
            <p className="text-xs text-slate-500">
              Key evaluation metrics for target speaker recognition
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
          SIMULATED
        </span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
          >
            {/* Metric Label */}
            <div className="text-[11px] font-medium text-slate-500 truncate" title={m.label}>
              {m.label}
            </div>

            {/* Value & Delta */}
            <div className="flex items-baseline justify-between mt-1 mb-1.5">
              <span className="text-xl font-bold font-mono text-[#0F172A] tracking-tight">
                {m.value}
              </span>
              <span
                className={`text-[10px] font-bold font-mono px-1 py-0.5 rounded ${
                  m.isPositive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-700 bg-rose-50'
                }`}
              >
                {m.delta}
              </span>
            </div>

            {/* Sparkline Canvas/SVG */}
            <div className="h-6 w-full overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 80 24" preserveAspectRatio="none">
                <path
                  d={generateSparklineSvgPath(m.sparkline, 80, 24)}
                  fill="none"
                  stroke={m.strokeColor}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function generateSparklineSvgPath(data: number[], width: number, height: number): string {
  if (!data || data.length < 2) return `M 0 ${height / 2} L ${width} ${height / 2}`;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const step = width / (data.length - 1);
  let path = '';

  data.forEach((val, i) => {
    const x = i * step;
    // Invert Y so higher values are higher
    const y = height - 3 - ((val - min) / range) * (height - 6);
    if (i === 0) {
      path += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  });

  return path;
}
