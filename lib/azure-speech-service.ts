import { SpeechConfig, AudioConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

const speechConfig = SpeechConfig.fromSubscription(process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!, process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!);
speechConfig.speechRecognitionLanguage = 'en-US';

export function createSpeechRecognizer(): SpeechRecognizer {
  const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
  return new SpeechRecognizer(speechConfig, audioConfig);
}

export async function recognizeSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognizer = createSpeechRecognizer();

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

