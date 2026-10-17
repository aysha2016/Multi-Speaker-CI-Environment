# CI-AI Research Lab — Multi-Speaker Cochlear Implant Research Prototype

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

A computational biomedical research prototype investigating how AI source separation, auditory attention decoding, and spatial beamforming enhance target speech before 22-channel cochlear implant (CI) sound coding in complex cocktail-party environments.

> **Notice**: Computational research simulation prototype. Not an FDA/CE medical device. Not clinically validated.

---

## 🎯 Research Problem

How can front-end AI algorithms separate, prioritize, and encode an intended target speaker in multi-talker acoustic environments before stimulation across a 22-electrode intracochlear array?

### Core Computational Pipeline
```
Multiple Talkers (A, B, C, D)
       ↓
Spatial Acoustic Mixture + Reverberation (T60) + SNR Noise
       ↓
AI Source Separation (Conv-TasNet / DPRNN-TasNet / SepFormer)
       ↓
Target Speaker Selection & Auditory Attention Decoding (AAD)
       ↓
Bilateral Spatial Beamforming (MVDR)
       ↓
22-Channel Tonotopic Filterbank (Greenwood Map: 250 Hz – 8.5 kHz)
       ↓
Envelope Extraction & ACE / CIS Loudness Compression
       ↓
Biphasic Pulse Trains (900 pps) & Neural Excitation Spread (λ = 2.4 mm)
       ↓
Simulated Speech Recognition & Intelligibility
```

---

## ⚡ Key Features

- **Interactive 3D / Top Acoustic Scene**:
  - Perspective room simulation with radial azimuth angles (`-90°`, `-45°`, `0°`, `+45°`, `+90°`).
  - Color-coded talker busts with animated radiating acoustic wave propagation.
  - Listener head model with cochlear implant BTE processor, RF headpiece magnet, and electrode array.
  - Moving speakers mode with real-time spatial angular drift.
- **Real Human Speech Audio Engine**:
  - Authentic spoken IEEE/Harvard psychoacoustic benchmark sentences for all speakers.
  - Real-time spatial mixing with Web Audio API `StereoPannerNode` and reverberation delay.
  - Isolated clean target speech with beamforming interference suppression.
  - **22-Channel CI Acoustic Vocoder DSP**: Listen directly to the acoustic simulation of what CI users perceive.
- **Dynamic 2D Spectrogram**:
  - Time-frequency energy distribution (0.1–8 kHz vs 0–5 s) rendered via Canvas with inferno/plasma colormaps.
- **22-Channel CI Processing & Raster Electrodogram**:
  - Real-time filterbank spectrogram and biphasic pulse train stimulation rasters.
- **Parametric Evaluation & Experiment Builder**:
  - Real-time simulated metrics: Separation Quality, Target SNR (dB), Speech Recognition, and Speaker Identification.
  - 6-stage deterministic experiment runner with trial comparison matrix.
- **AI Research Assistant**:
  - Context-aware reasoning backed by Gemini 3.8 Flash, categorizing insights into `[SIMULATION RESULT]`, `[RESEARCH HYPOTHESIS]`, and `[PAPER-BASED FINDING]`.
- **GitHub Account Integration**:
  - Quick connect and OAuth authentication to sync researcher profiles and repositories.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/amunawwara/ci-ai-research-lab.git
cd ci-ai-research-lab

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 🔬 Scientific Foundations

1. **Spatial Release from Masking (SRM)**: Litovsky et al. (2009); Bronkhorst (2000).
2. **Cochlear Tonotopic Greenwood Frequency Function**: $f = 165.4 \times (10^{0.06 x} - 0.88)$.
3. **Advanced Combination Encoders (ACE)**: Vandali et al. (2000) selecting $N$-of-$M$ (8 of 22) spectral maxima.
4. **Time-Domain Speech Separation**: Luo & Mesgarani (2019) Conv-TasNet; Luo et al. (2020) DPRNN-TasNet.

---

## 📄 License

Apache License 2.0. See LICENSE for details.
