import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const outputDir = path.resolve(__dirname, '../public/audio');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const speakers = [
  {
    id: 'speaker_A',
    voice: 'Fenrir', // Male
    text: 'The birch canoe slid on the smooth dark water.',
    style: 'Clear, natural male speech, neutral laboratory pacing',
  },
  {
    id: 'speaker_B',
    voice: 'Kore', // Female
    text: 'Four hours of steady work faced us this morning.',
    style: 'Clear, articulate female speech, neutral pacing',
  },
  {
    id: 'speaker_C',
    voice: 'Puck', // Male
    text: 'The strong oak gives generous shade in the summer.',
    style: 'Warm, clear male speaker',
  },
  {
    id: 'speaker_D',
    voice: 'Zephyr', // Female
    text: 'The tea was hot and had a sweet lemon flavor.',
    style: 'Crisp, natural female speaker',
  },
  {
    id: 'speaker_E',
    voice: 'Charon', // Male
    text: 'A gold ring will please the young bride.',
    style: 'Deep, clear male voice',
  },
  {
    id: 'speaker_F',
    voice: 'Kore', // Female
    text: 'The glass cracked with a sharp and loud sound.',
    style: 'Expressive, clear female voice',
  },
];

async function generateAll() {
  console.log('Generating real human speech WAV files using gemini-3.8-flash-lite-tts...');
  for (const spk of speakers) {
    const targetFile = path.join(outputDir, `${spk.id}.wav`);
    if (fs.existsSync(targetFile)) {
      console.log(`Already exists: ${spk.id}.wav`);
      continue;
    }

    console.log(`Generating speech for ${spk.id} (${spk.voice}): "${spk.text}"`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: spk.text,
                speechMetadata: {
                  style: spk.style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: spk.voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const buffer = Buffer.from(base64Audio, 'base64');
        fs.writeFileSync(targetFile, buffer);
        console.log(`✓ Saved ${spk.id}.wav (${buffer.length} bytes)`);
      } else {
        console.warn(`No audio data returned for ${spk.id}`);
      }
    } catch (err: any) {
      console.error(`Failed to generate ${spk.id}:`, err.message);
    }
  }
  console.log('Speech generation complete!');
}

generateAll();
