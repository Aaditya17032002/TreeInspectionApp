import { SpeechConfig, AudioConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

require('dotenv').config({ path: '.env.local' });

let speechConfig: SpeechConfig | null = null;

try {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (subscriptionKey && region) {
    speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
    speechConfig.speechRecognitionLanguage = 'en-US';
  } else {
    console.warn('Azure Speech Service credentials are missing. Speech-to-text functionality will be disabled.');
  }
} catch (error) {
  console.error('Error initializing Azure Speech Service:', error);
}

export function createSpeechRecognizer(): SpeechRecognizer | null {
  if (!speechConfig) {
    console.warn('Speech recognizer cannot be created due to missing configuration.');
    return null;
  }

  const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
  return new SpeechRecognizer(speechConfig, audioConfig);
}

export async function recognizeSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognizer = createSpeechRecognizer();

    if (!recognizer) {
      reject(new Error('Speech recognizer is not available.'));
      return;
    }

    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();
        resolve(result.text);
      },
      (error) => {
        recognizer.close();
        reject(error);
      }
    );
  });
}
