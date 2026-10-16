import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, HelpCircle, Loader2 } from 'lucide-react';
import { SimulationState, SimulationMetrics } from '../../types/simulation';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  metrics: SimulationMetrics;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  state,
  metrics,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **CI-AI Research Assistant**. I analyze your live multi-speaker acoustic environment (currently **${state.environment}** with **${state.numberOfSpeakers} active speakers** at **${state.snr} dB SNR** and **${state.reverberation}s T60**).

Ask me questions about speech separation, spatial beamforming, auditory attention decoding, or cochlear implant sound encoding.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const sampleQuestions = [
    'What happens if I add another speaker?',
    'Why did target speaker recognition decrease?',
    'How does spatial separation affect speaker separation?',
    'What experiment should I run next?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          context: {
            environment: state.environment,
            numberOfSpeakers: state.numberOfSpeakers,
            snr: state.snr,
            reverberation: state.reverberation,
            speakerDistance: state.speakerDistance,
            targetSpeaker: `Speaker ${state.targetSpeakerId}`,
            spatialFiltering: state.spatialFiltering,
            attentionModel: state.attentionModel,
            metrics: {
              separationQuality: metrics.separationQuality,
              targetSnr: metrics.targetSnr,
              speechRecognition: metrics.speechRecognition,
              speakerIdentification: metrics.speakerIdentification,
            },
          },
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'No response from assistant.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**[SIMULATION RESULT]**
• In your current state (${state.environment}, ${state.numberOfSpeakers} speakers at ${state.snr} dB SNR), the system achieves a Separation Quality of ${metrics.separationQuality.toFixed(2)} and Target SNR of ${metrics.targetSnr.toFixed(1)} dB.

**[RESEARCH HYPOTHESIS]**
• Auditory attention decoding (AAD) combined with spatial beamforming effectively suppresses off-axis interferers, narrowing the acoustic focus before 22-channel CI envelope extraction.

**[PAPER-BASED FINDING]**
• Normal hearing listeners benefit from ~6–8 dB Spatial Release from Masking (SRM), but bilateral CI users struggle with complex multi-talker environments without front-end neural speech separation (Litovsky et al. 2009).`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[620px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  AI Research Assistant
                </h3>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Context-aware CI acoustics & neural speech enhancement reasoning
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

        {/* Chat message history */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#1677FF] text-white rounded-br-sm'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-sm'
                }`}
              >
                {renderFormattedContent(msg.content)}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs items-center text-slate-500">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl">
                Analyzing simulation acoustic scene & literature...
              </div>
            </div>
          )}
        </div>

        {/* Sample Quick Questions */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0">Suggested:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:text-[#1677FF] rounded-lg text-slate-700 whitespace-nowrap cursor-pointer transition-colors shadow-2xs shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask about spatial beamforming, speech intelligibility, or CI filterbanks..."
            className="flex-1 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-[#1677FF] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Formatter to render SIMULATION RESULT, RESEARCH HYPOTHESIS, and PAPER-BASED FINDING with distinctive visual badges
function renderFormattedContent(text: string) {
  const parts = text.split('\n');
  return (
    <div className="space-y-2">
      {parts.map((line, idx) => {
        if (line.includes('[SIMULATION RESULT]')) {
          return (
            <div key={idx} className="pt-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 mb-1">
                ● SIMULATION RESULT
              </span>
            </div>
          );
        }
        if (line.includes('[RESEARCH HYPOTHESIS]')) {
          return (
            <div key={idx} className="pt-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-purple-800 bg-purple-100 border border-purple-300 mb-1">
                ◆ RESEARCH HYPOTHESIS
              </span>
            </div>
          );
        }
        if (line.includes('[PAPER-BASED FINDING]')) {
          return (
            <div key={idx} className="pt-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-blue-800 bg-blue-100 border border-blue-300 mb-1">
                ▲ PAPER-BASED FINDING
              </span>
            </div>
          );
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={idx} className="pl-3 relative">
              <span className="absolute left-0 text-slate-400">•</span>
              <span>{line.substring(2)}</span>
            </div>
          );
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-1" />;
        }
        return <div key={idx}>{line}</div>;
      })}
    </div>
  );
}
