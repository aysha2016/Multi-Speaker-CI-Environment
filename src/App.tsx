import React, { useState, useEffect, useRef } from 'react';
import {
  SimulationState,
  SimulationMetrics,
  ActivePage,
  SpeakerId,
  SeparationModelType,
  SavedExperiment,
  PipelineNodeInfo,
  GitHubUser,
} from './types/simulation';
import { computeSimulationMetrics, BASE_SPEAKERS } from './utils/simulationMath';
import { audioEngine } from './utils/audioEngine';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Main Workspace Components
import { AcousticScene } from './components/AcousticScene';
import { AudioSignals } from './components/AudioSignals';
import { SpectrogramCard } from './components/SpectrogramCard';
import { SpeakerSeparationCard } from './components/SpeakerSeparationCard';
import { CIProcessingCard } from './components/CIProcessingCard';
import { EnvironmentSettings } from './components/EnvironmentSettings';
import { TargetSpeakerSelection } from './components/TargetSpeakerSelection';
import { ModelPipelineCard } from './components/ModelPipelineCard';
import { PerformanceMetricsCard } from './components/PerformanceMetricsCard';

// Dedicated Sub-Views
import { OverviewView } from './components/views/OverviewView';
import { AudioSceneView } from './components/views/AudioSceneView';
import { SeparationView } from './components/views/SeparationView';
import { CIEncodingView } from './components/views/CIEncodingView';
import { NeuralResponseView } from './components/views/NeuralResponseView';
import { EvaluationView } from './components/views/EvaluationView';
import { ExperimentsView } from './components/views/ExperimentsView';

// Modals
import { StatusModal } from './components/modals/StatusModal';
import { SaveModal } from './components/modals/SaveModal';
import { ExportModal } from './components/modals/ExportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { PipelineNodeModal } from './components/modals/PipelineNodeModal';
import { GitHubAuthModal } from './components/modals/GitHubAuthModal';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<ActivePage>('multiple-speakers');

  // Centralized Simulation State (Factory default per Section 23 of prompt)
  const [state, setState] = useState<SimulationState>({
    environment: 'Restaurant',
    numberOfSpeakers: 4,
    snr: 0,
    reverberation: 0.6,
    speakerDistance: 2.0,
    movingSpeakers: false,
    targetSpeakerId: 'B',
    spatialFiltering: true,
    attentionModel: true,
    ciChannels: 22,
    separationModel: 'Demonstration Model',
    ciStrategy: 'ACE',
    pulseRate: 900,
    isPlaying: false,
    simulationTime: 0.0,
    viewMode: '3d',
    animationSpeed: 1,
    vocoderMode: false,
  });

  // Dynamic Performance Metrics calculated directly from the state
  const metrics: SimulationMetrics = computeSimulationMetrics(state);

  // Saved Experiments history (persisted in localStorage)
  const [savedExperiments, setSavedExperiments] = useState<SavedExperiment[]>(() => {
    try {
      const stored = localStorage.getItem('ci_ai_saved_experiments');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  // GitHub User state (persisted in localStorage)
  const [gitHubUser, setGitHubUser] = useState<GitHubUser | null>(() => {
    try {
      const stored = localStorage.getItem('ci_ai_github_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });

  // Modal visibility states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(true); // Open upon user request
  const [selectedPipelineNode, setSelectedPipelineNode] = useState<PipelineNodeInfo | null>(null);

  const handleGitHubLoginSuccess = (user: GitHubUser) => {
    setGitHubUser(user);
    try {
      localStorage.setItem('ci_ai_github_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleGitHubLogout = () => {
    setGitHubUser(null);
    try {
      localStorage.removeItem('ci_ai_github_user');
    } catch (e) {}
  };

  // Simulation playback timer loop
  useEffect(() => {
    let timer: number | null = null;
    if (state.isPlaying) {
      timer = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          simulationTime: Number(((prev.simulationTime + 0.1 * prev.animationSpeed) % 5.0).toFixed(1)),
        }));
      }, 100);
    } else {
      setState((prev) => ({ ...prev, simulationTime: 0.0 }));
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isPlaying, state.animationSpeed]);

  // Handler for state updates
  const handleUpdateState = (updates: Partial<SimulationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Factory Reset function (Section 23 of prompt)
  const handleResetDefaults = () => {
    audioEngine.stopAll();
    setState({
      environment: 'Restaurant',
      numberOfSpeakers: 4,
      snr: 0,
      reverberation: 0.6,
      speakerDistance: 2.0,
      movingSpeakers: false,
      targetSpeakerId: 'B',
      spatialFiltering: true,
      attentionModel: true,
      ciChannels: 22,
      separationModel: 'Demonstration Model',
      ciStrategy: 'ACE',
      pulseRate: 900,
      isPlaying: false,
      simulationTime: 0.0,
      viewMode: '3d',
      animationSpeed: 1,
      vocoderMode: false,
    });
  };

  const handleTogglePlayScene = () => {
    if (state.isPlaying) {
      audioEngine.stopAll();
      handleUpdateState({ isPlaying: false });
    } else {
      handleUpdateState({ isPlaying: true });
      if (state.vocoderMode) {
        audioEngine.playCIVocodedSpeech(state.targetSpeakerId, () => {
          handleUpdateState({ isPlaying: false });
        });
      } else {
        const activeSpeakers = BASE_SPEAKERS.slice(0, state.numberOfSpeakers);
        const angles: Record<string, number> = {};
        activeSpeakers.forEach((s) => {
          angles[s.id] = s.angle;
        });
        audioEngine.playMixedAudio(
          activeSpeakers.map((s) => s.id),
          state.snr,
          state.reverberation,
          angles,
          () => {
            handleUpdateState({ isPlaying: false });
          }
        );
      }
    }
  };

  const handleSelectTargetSpeaker = (id: SpeakerId) => {
    handleUpdateState({ targetSpeakerId: id });
  };

  const handleSaveExperiment = (exp: SavedExperiment) => {
    const updated = [exp, ...savedExperiments];
    setSavedExperiments(updated);
    try {
      localStorage.setItem('ci_ai_saved_experiments', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleLoadExperiment = (exp: SavedExperiment) => {
    setState((prev) => ({
      ...prev,
      environment: exp.environment,
      numberOfSpeakers: exp.numberOfSpeakers,
      snr: exp.snr,
      reverberation: exp.reverberation,
      speakerDistance: exp.speakerDistance,
      targetSpeakerId: exp.targetSpeakerId,
      spatialFiltering: exp.spatialFiltering,
      attentionModel: exp.attentionModel,
      ciChannels: exp.ciChannels,
      separationModel: exp.separationModel,
    }));
  };

  const handleDeleteExperiment = (id: string) => {
    const updated = savedExperiments.filter((e) => e.id !== id);
    setSavedExperiments(updated);
    try {
      localStorage.setItem('ci_ai_saved_experiments', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col antialiased">
      {/* 1. Header (64px) */}
      <Header
        onOpenStatus={() => setIsStatusOpen(true)}
        onOpenSave={() => setIsSaveOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenGitHub={() => setIsGitHubOpen(true)}
        gitHubUser={gitHubUser}
      />

      {/* 2. Main Body: Left Sidebar + Central Content (+ Right Panel when on Multiple Speakers) */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        {/* Left Sidebar (approx 220px) */}
        <Sidebar activePage={activePage} onSelectPage={setActivePage} />

        {/* Central Workspace Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activePage === 'multiple-speakers' ? (
            /* =========================================================================
               MAIN WORKSPACE: MULTI-SPEAKER CI ENVIRONMENT (MATCHING REFERENCE EXACTLY)
               ========================================================================= */
            <div className="space-y-5">
              {/* Page Title & Subtitle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                      Multi-Speaker CI Environment
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300">
                      RESEARCH PROTOTYPE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Separate, identify and process multiple speakers for cochlear implant users
                  </p>
                </div>

                {/* Persistent Simulation Status / Playhead HUD */}
                {state.isPlaying && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1677FF]">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span>Live Simulation Time: {state.simulationTime.toFixed(1)}s / 5.0s</span>
                  </div>
                )}
              </div>

              {/* Two Column Grid: Left Central Area (Acoustic Scene + Signals + Separation) vs Right Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                {/* Left Central Column: 7 cols */}
                <div className="xl:col-span-7 space-y-5">
                  {/* Central 3D Acoustic Scene Simulation */}
                  <AcousticScene
                    state={state}
                    metrics={metrics}
                    onUpdateState={handleUpdateState}
                    onSelectTarget={handleSelectTargetSpeaker}
                  />

                  {/* Audio Signals & Spectrogram Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <AudioSignals
                      state={state}
                      onUpdateSpeakerVoice={(id, voice) => {
                        // Handled in audio engine / state
                      }}
                    />
                    <SpectrogramCard state={state} />
                  </div>

                  {/* Speaker Separation & CI Processing Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <SpeakerSeparationCard
                      state={state}
                      onUpdateModel={(model: SeparationModelType) =>
                        handleUpdateState({ separationModel: model })
                      }
                    />
                    <CIProcessingCard
                      state={state}
                      onSelectTarget={handleSelectTargetSpeaker}
                    />
                  </div>
                </div>

                {/* Right Column: 5 cols (approx 440-480px) */}
                <div className="xl:col-span-5 space-y-5">
                  {/* Environment Settings */}
                  <EnvironmentSettings
                    state={state}
                    onUpdateState={handleUpdateState}
                    onTogglePlay={handleTogglePlayScene}
                  />

                  {/* Target Speaker Selection */}
                  <TargetSpeakerSelection
                    state={state}
                    metrics={metrics}
                    onSelectTarget={handleSelectTargetSpeaker}
                    onUpdateState={handleUpdateState}
                  />

                  {/* Model Pipeline */}
                  <ModelPipelineCard
                    isPlaying={state.isPlaying}
                    onSelectNode={(node) => setSelectedPipelineNode(node)}
                  />

                  {/* Performance Metrics (Simulated) */}
                  <PerformanceMetricsCard metrics={metrics} />
                </div>
              </div>
            </div>
          ) : activePage === 'overview' ? (
            <OverviewView
              state={state}
              metrics={metrics}
              onNavigate={(page) => setActivePage(page)}
            />
          ) : activePage === 'audio-scene' ? (
            <AudioSceneView state={state} />
          ) : activePage === 'separation' ? (
            <SeparationView
              state={state}
              onUpdateModel={(model) => handleUpdateState({ separationModel: model })}
            />
          ) : activePage === 'ci-encoding' ? (
            <CIEncodingView state={state} onUpdateState={handleUpdateState} />
          ) : activePage === 'neural-response' ? (
            <NeuralResponseView state={state} />
          ) : activePage === 'evaluation' ? (
            <EvaluationView state={state} metrics={metrics} />
          ) : (
            <ExperimentsView
              state={state}
              metrics={metrics}
              savedExperiments={savedExperiments}
              onApplyState={handleUpdateState}
              onSaveExperiment={handleSaveExperiment}
            />
          )}
        </main>
      </div>

      {/* 3. Footer */}
      <Footer />

      {/* Modals */}
      <StatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
      />
      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        state={state}
        metrics={metrics}
        savedExperiments={savedExperiments}
        onSaveExperiment={handleSaveExperiment}
        onLoadExperiment={handleLoadExperiment}
        onDeleteExperiment={handleDeleteExperiment}
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
        metrics={metrics}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateState={handleUpdateState}
        onResetDefaults={handleResetDefaults}
      />
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        state={state}
        metrics={metrics}
      />
      <PipelineNodeModal
        node={selectedPipelineNode}
        onClose={() => setSelectedPipelineNode(null)}
      />
      <GitHubAuthModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
        currentUser={gitHubUser}
        onLoginSuccess={handleGitHubLoginSuccess}
        onLogout={handleGitHubLogout}
      />
    </div>
  );
}
