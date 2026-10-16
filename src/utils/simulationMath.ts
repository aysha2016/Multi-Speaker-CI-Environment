import {
  SimulationState,
  SimulationMetrics,
  SpeakerConfig,
  SpeakerId,
  MetricSparklines,
} from '../types/simulation';

export const BASE_SPEAKERS: SpeakerConfig[] = [
  {
    id: 'A',
    name: 'Speaker A',
    angle: -60,
    voice: 'Male',
    color: '#2563EB', // Blue
    lightBg: '#EFF6FF',
    borderColor: '#3B82F6',
    distance: 2.0,
    relativeLevel: 0,
    pitch: 125,
  },
  {
    id: 'B',
    name: 'Speaker B',
    angle: 0,
    voice: 'Female',
    color: '#EF4444', // Red/Pink
    lightBg: '#FEF2F2',
    borderColor: '#EF4444',
    distance: 2.0,
    relativeLevel: 0,
    pitch: 210,
  },
  {
    id: 'C',
    name: 'Speaker C',
    angle: 45,
    voice: 'Male',
    color: '#10B981', // Green
    lightBg: '#ECFDF5',
    borderColor: '#10B981',
    distance: 2.0,
    relativeLevel: 0,
    pitch: 140,
  },
  {
    id: 'D',
    name: 'Speaker D',
    angle: 90,
    voice: 'Female',
    color: '#F59E0B', // Orange
    lightBg: '#FFFBEB',
    borderColor: '#F59E0B',
    distance: 2.0,
    relativeLevel: 0,
    pitch: 230,
  },
  {
    id: 'E',
    name: 'Speaker E',
    angle: -30,
    voice: 'Male',
    color: '#8B5CF6', // Purple
    lightBg: '#F5F3FF',
    borderColor: '#8B5CF6',
    distance: 2.2,
    relativeLevel: -1.0,
    pitch: 115,
  },
  {
    id: 'F',
    name: 'Speaker F',
    angle: 70,
    voice: 'Female',
    color: '#EC4899', // Pink
    lightBg: '#FDF2F8',
    borderColor: '#EC4899',
    distance: 2.4,
    relativeLevel: -1.5,
    pitch: 220,
  },
];

// Calculate active speakers based on number of speakers
export function getActiveSpeakers(
  count: number,
  speakers: SpeakerConfig[] = BASE_SPEAKERS,
  movingOffset: number = 0
): SpeakerConfig[] {
  const clamped = Math.max(1, Math.min(6, count));
  return speakers.slice(0, clamped).map((spk, idx) => {
    let angle = spk.angle;
    if (movingOffset !== 0) {
      // Small sinusoidal spatial movement
      const phase = idx * 1.2;
      angle = Math.round(spk.angle + Math.sin(movingOffset * 0.8 + phase) * 12);
    }
    return {
      ...spk,
      angle,
    };
  });
}

// Compute attention weights across speakers
export function calculateAttentionWeights(
  activeSpeakers: SpeakerConfig[],
  targetId: SpeakerId,
  attentionEnabled: boolean
): Record<SpeakerId, number> {
  const result: Record<SpeakerId, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  };
  const count = activeSpeakers.length;
  if (count === 0) return result;

  if (!attentionEnabled) {
    const uniform = Math.round(100 / count);
    activeSpeakers.forEach((s) => {
      result[s.id] = uniform;
    });
    return result;
  }

  // Attention model concentrates energy on target speaker
  const targetWeight = Math.min(85, Math.max(55, 68 - (count - 2) * 4));
  const remaining = 100 - targetWeight;
  const otherCount = Math.max(1, count - 1);
  const otherShare = Math.floor(remaining / otherCount);

  activeSpeakers.forEach((s) => {
    if (s.id === targetId) {
      result[s.id] = targetWeight;
    } else {
      result[s.id] = otherShare;
    }
  });

  return result;
}

// Mathematical calculation of performance metrics
export function computeSimulationMetrics(state: SimulationState): SimulationMetrics {
  const {
    numberOfSpeakers,
    snr,
    reverberation,
    speakerDistance,
    spatialFiltering,
    attentionModel,
    separationModel,
    targetSpeakerId,
  } = state;

  // Base values for default state (4 speakers, SNR 0, T60 0.6s, distance 2m, spatial ON, attention ON)
  // Matching reference image:
  // Separation Quality: 0.82 (+12%)
  // Target SNR: 8.5 dB (+3.1)
  // Speech Recognition: 0.76 (+10%)
  // Speaker Identification: 0.88 (+6%)

  // Speaker interference penalty
  const speakerPenalty = (numberOfSpeakers - 4) * 0.05;

  // SNR factor (-10 to +20 dB normalized)
  const snrFactor = snr * 0.015;

  // Reverberation penalty (T60 0 to 1.5s, centered at 0.6s)
  const reverbPenalty = (reverberation - 0.6) * 0.18;

  // Distance penalty (2.0m baseline)
  const distPenalty = (speakerDistance - 2.0) * 0.04;

  // Spatial filtering boost (+0.12 quality, +3.5 dB SNR)
  const spatialQualityBoost = spatialFiltering ? 0.08 : -0.14;
  const spatialSnrBoost = spatialFiltering ? 4.2 : -3.8;

  // Attention model boost
  const attentionBoost = attentionModel ? 0.06 : -0.08;

  // Model capability factor
  let modelFactor = 0;
  if (separationModel === 'Transformer') modelFactor = 0.06;
  if (separationModel === 'DPRNN') modelFactor = 0.03;
  if (separationModel === 'Conv-TasNet') modelFactor = 0.01;

  // 1. Separation Quality (0 to 1.0)
  let sepQuality = 0.82 - speakerPenalty + snrFactor - reverbPenalty - distPenalty + spatialQualityBoost + attentionBoost + modelFactor;
  sepQuality = Math.min(0.98, Math.max(0.32, Number(sepQuality.toFixed(2))));

  // 2. Target SNR (dB)
  let targetSnrVal = 8.5 + (snr * 0.6) - ((numberOfSpeakers - 4) * 1.8) - ((reverberation - 0.6) * 3.5) - ((speakerDistance - 2.0) * 1.2) + spatialSnrBoost + (attentionModel ? 1.5 : -1.8);
  targetSnrVal = Number(Math.max(-5.0, Math.min(22.0, targetSnrVal)).toFixed(1));

  // 3. Speech Recognition (0 to 1.0 simulated score)
  let speechRec = 0.76 - (speakerPenalty * 1.1) + (snr * 0.012) - (reverbPenalty * 1.2) - (distPenalty * 0.8) + (spatialFiltering ? 0.07 : -0.12) + (attentionModel ? 0.05 : -0.07);
  speechRec = Math.min(0.96, Math.max(0.25, Number(speechRec.toFixed(2))));

  // 4. Speaker Identification (0 to 1.0 accuracy)
  let spkId = 0.88 - (speakerPenalty * 0.8) + (snr * 0.008) - (reverbPenalty * 0.6) + (attentionModel ? 0.06 : -0.10);
  spkId = Math.min(0.99, Math.max(0.40, Number(spkId.toFixed(2))));

  // Compute realistic deltas relative to baseline
  const sepDelta = Math.round((sepQuality - 0.70) * 100);
  const snrDelta = Number((targetSnrVal - 5.4).toFixed(1));
  const recDelta = Math.round((speechRec - 0.66) * 100);
  const idDelta = Math.round((spkId - 0.82) * 100);

  // Generate sparklines reflecting the trajectory
  const sparklines: MetricSparklines = {
    separationQuality: generateSparkline(sepQuality, 12, 0.04),
    targetSnr: generateSparkline(targetSnrVal, 12, 0.8),
    speechRecognition: generateSparkline(speechRec, 12, 0.05),
    speakerIdentification: generateSparkline(spkId, 12, 0.03),
  };

  const active = getActiveSpeakers(numberOfSpeakers);
  const attentionWeights = calculateAttentionWeights(active, targetSpeakerId, attentionModel);

  return {
    separationQuality: sepQuality,
    separationQualityDelta: sepDelta,
    targetSnr: targetSnrVal,
    targetSnrDelta: snrDelta,
    speechRecognition: speechRec,
    speechRecognitionDelta: recDelta,
    speakerIdentification: spkId,
    speakerIdentificationDelta: idDelta,
    attentionWeights,
    sparklines,
  };
}

function generateSparkline(current: number, points: number = 10, variance: number = 0.05): number[] {
  const result: number[] = [];
  let val = current * 0.88;
  for (let i = 0; i < points - 1; i++) {
    const noise = (Math.sin(i * 1.5) + Math.cos(i * 0.8)) * variance * 0.5;
    val += (current - val) * 0.25 + noise;
    result.push(Number(val.toFixed(2)));
  }
  result.push(current);
  return result;
}

// Generate realistic synthetic speech waveform array for a speaker
export function generateSyntheticWaveform(
  sampleCount: number,
  speakerId: SpeakerId,
  timeOffset: number = 0,
  voiceType: 'Male' | 'Female' = 'Male'
): number[] {
  const wave: number[] = new Array(sampleCount);
  const f0 = voiceType === 'Male' ? 120 : 210;
  const idOffset = speakerId.charCodeAt(0) * 17.3;

  for (let i = 0; i < sampleCount; i++) {
    const t = (i / sampleCount) * 5.0 + timeOffset;
    // Syllable / phoneme envelope (bursts of vocal energy separated by stop consonants/pauses)
    const envelope =
      Math.max(0, Math.sin(t * 2.2 + idOffset)) * 0.7 +
      Math.max(0, Math.sin(t * 5.1 + idOffset * 0.5)) * 0.3;

    // Harmonic formants
    const harm1 = Math.sin(2 * Math.PI * f0 * (t * 0.05) + idOffset);
    const harm2 = 0.5 * Math.sin(4 * Math.PI * f0 * (t * 0.05) + idOffset);
    const harm3 = 0.25 * Math.sin(6 * Math.PI * f0 * (t * 0.05));
    const noise = (Math.random() - 0.5) * 0.1;

    wave[i] = (harm1 + harm2 + harm3 + noise) * envelope;
  }
  return wave;
}
