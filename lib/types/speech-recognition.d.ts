export interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
  
  export interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  
  export interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
  }
  
  export interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
  }
  
  export interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
  
  export interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    abort(): void;
    start(): void;
    stop(): void;
  }
  
  export interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
  }
  
  declare global {
    interface Window {
      SpeechRecognition: SpeechRecognitionStatic;
      webkitSpeechRecognition: SpeechRecognitionStatic;
    }
  }
  
  