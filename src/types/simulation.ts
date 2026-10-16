export type EnvironmentType =
  | 'Quiet Room'
  | 'Office'
  | 'Restaurant'
  | 'Street'
  | 'Party'
  | 'Car'
  | 'Public Transport';

export type SpeakerId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface SpeakerConfig {
  id: SpeakerId;
  name: string;
  angle: number; // in degrees: -90 to +90
  voice: 'Male' | 'Female';
  color: string;
  lightBg: string;
  borderColor: string;
  distance: number; // meters
  relativeLevel: number; // dB
  pitch: number; // Hz
}

export type SeparationModelType =
  | 'Demonstration Model'
  | 'DPRNN'
  | 'Conv-TasNet'
  | 'Transformer';

export interface SimulationState {
  environment: EnvironmentType;
  numberOfSpeakers: number; // 1 to 6
  snr: number; // -10 dB to +20 dB
  reverberation: number; // 0.0 s to 1.5 s
  speakerDistance: number; // 0.5 m to 5.0 m
  movingSpeakers: boolean;
  targetSpeakerId: SpeakerId;
  spatialFiltering: boolean;
  attentionModel: boolean;
  ciChannels: number;
  separationModel: SeparationModelType;
  ciStrategy: 'ACE' | 'CIS' | 'SPEAK';
  pulseRate: number; // pulses per second
  isPlaying: boolean;
  simulationTime: number; // 0 to 5.0 s
  viewMode: '3d' | 'top';
  animationSpeed: number; // 0.5, 1, 2
  vocoderMode: boolean; // whether audio preview plays vocoded CI sound
}

export interface MetricSparklines {
  separationQuality: number[];
  targetSnr: number[];
  speechRecognition: number[];
  speakerIdentification: number[];
}

export interface SimulationMetrics {
  separationQuality: number;
  separationQualityDelta: number;
  targetSnr: number;
  targetSnrDelta: number;
  speechRecognition: number;
  speechRecognitionDelta: number;
  speakerIdentification: number;
  speakerIdentificationDelta: number;
  attentionWeights: Record<SpeakerId, number>;
  sparklines: MetricSparklines;
}

export interface SavedExperiment {
  id: string;
  name: string;
  timestamp: string;
  environment: EnvironmentType;
  numberOfSpeakers: number;
  snr: number;
  reverberation: number;
  speakerDistance: number;
  targetSpeakerId: SpeakerId;
  spatialFiltering: boolean;
  attentionModel: boolean;
  ciChannels: number;
  separationModel: SeparationModelType;
  metrics: {
    separationQuality: number;
    targetSnr: number;
    speechRecognition: number;
    speakerIdentification: number;
  };
}

export type ActivePage =
  | 'overview'
  | 'multiple-speakers'
  | 'audio-scene'
  | 'separation'
  | 'ci-encoding'
  | 'neural-response'
  | 'evaluation'
  | 'experiments';

export interface PipelineNodeInfo {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  formula: string;
  keyParameters: { label: string; value: string }[];
  researchInsight: string;
}

export interface GitHubUser {
  id: number | string;
  login: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  public_repos?: number;
  followers?: number;
  html_url?: string;
}

