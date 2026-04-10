import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechAI = (onTranscriptSubmit) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const latestTranscriptRef = useRef('');

  useEffect(() => {
     latestTranscriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
        try { recognitionRef.current.disconnect(); } catch(e){}
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const startAudioCapture = async () => {
      try {
          const SpeechRecognitionLocal = window.SpeechRecognition || window.webkitSpeechRecognition;
          
          if (SpeechRecognitionLocal) {
              const recognition = new SpeechRecognitionLocal();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = 'en-US';

              recognition.onresult = (event) => {
                  let interimTrans = '';
                  for (let i = event.resultIndex; i < event.results.length; ++i) {
                      if (event.results[i].isFinal) {
                          finalTranscriptRef.current += event.results[i][0].transcript + ' ';
                      } else {
                          interimTrans += event.results[i][0].transcript;
                      }
                  }
                  setTranscript((finalTranscriptRef.current + interimTrans).trim());
              };

              recognition.onerror = (e) => {
                  console.error("Microphone STT error: ", e.error);
              };

              recognition.onend = () => {
                  if (isRecordingRef.current) {
                      try { recognition.start(); } catch(e){} 
                  }
              };

              recognition.start();

              recognitionRef.current = {
                 disconnect: () => recognition.stop(),
                 stop: () => recognition.stop(),
                 start: () => {
                     try { recognition.start(); } catch(e){}
                 }
              };
              return;
          }

          // -------------------------------------------------------------
          // FIREFOX FALLBACK (Backend STT Pipeline converting PCM to WAV)
          // -------------------------------------------------------------
          console.log("Native STT bypass via robust backend WAV encoding applied for Firefox.");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
          if (audioContext.state === 'suspended') {
              await audioContext.resume();
          }
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);
          
          let cumulativeBuffer = [];
          let lastTransmission = Date.now();
          let isTranscribing = false;

          const sendAudioChunkToBackend = async (pcmData) => {
              if (isTranscribing) return;
              isTranscribing = true;
              const buffer = new ArrayBuffer(44 + pcmData.length * 2);
              const view = new DataView(buffer);
              
              const writeString = (view, offset, string) => {
                  for (let i = 0; i < string.length; i++) {
                      view.setUint8(offset + i, string.charCodeAt(i));
                  }
              };

              writeString(view, 0, 'RIFF');
              view.setUint32(4, 36 + pcmData.length * 2, true);
              writeString(view, 8, 'WAVE');
              writeString(view, 12, 'fmt ');
              view.setUint32(16, 16, true);
              view.setUint16(20, 1, true);
              view.setUint16(22, 1, true);
              view.setUint32(24, 16000, true);
              view.setUint32(28, 16000 * 2, true);
              view.setUint16(32, 2, true);
              view.setUint16(34, 16, true);
              writeString(view, 36, 'data');
              view.setUint32(40, pcmData.length * 2, true);

              let offset = 44;
              for (let i = 0; i < pcmData.length; i++, offset += 2) {
                  view.setInt16(offset, pcmData[i], true);
              }

              let binary = '';
              const bytes = new Uint8Array(buffer);
              const chunkSize = 8192;
              for (let i = 0; i < bytes.length; i += chunkSize) {
                  binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
              }
              const base64 = btoa(binary);

              try {
                  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                  const response = await fetch(`${API_URL}/api/stt`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ audio_base64: base64 })
                  });
                  const data = await response.json();
                  if (data.transcript) {
                      setTranscript(data.transcript);
                  }
              } catch(e) {
                  console.error("Backend STT error", e);
              } finally {
                  isTranscribing = false;
              }
          };

          processor.onaudioprocess = (e) => {
              if (!isRecordingRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              for (let i = 0; i < inputData.length; i++) {
                  const s = Math.max(-1, Math.min(1, inputData[i]));
                  cumulativeBuffer.push(s < 0 ? s * 0x8000 : s * 0x7FFF);
              }

              const now = Date.now();
              if (now - lastTransmission >= 4500 && cumulativeBuffer.length > 32000) {
                  lastTransmission = now;
                  const pcmData = new Int16Array(cumulativeBuffer);
                  sendAudioChunkToBackend(pcmData).catch(()=>{});
              }
          };

          source.connect(processor);
          processor.connect(audioContext.destination);

          recognitionRef.current = {
              disconnect: () => {
                  try { source.disconnect(); } catch(e) {}
                  try { processor.disconnect(); } catch(e) {}
                  try { audioContext.close(); } catch(e) {}
                  stream.getTracks().forEach(track => track.stop());
              }
          };

      } catch (err) {
          console.error("Microphone access failed", err);
      }
  };

  const toggleRecording = useCallback(() => {
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      try { recognitionRef.current?.disconnect(); } catch(e) {}
    } else {
      finalTranscriptRef.current = '';
      setTranscript(''); 
      isRecordingRef.current = true;
      setIsRecording(true);
      startAudioCapture();
    }
  }, []);

  const speakText = useCallback((text, onComplete = () => {}) => {
    if (!text) return;
    
    // Check support
    if (!window.speechSynthesis) {
        console.error("speechSynthesis not supported natively.");
        return;
    }
    
    // Stop any current reading
    window.speechSynthesis.cancel();

    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Protect utterance from Chrome GC bug natively
    window.utterances = window.utterances || [];
    window.utterances.push(utterance);
    
    // Select highest quality OS-level human-sounding voice available
    const setOptimizedVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const premium = voices.find(v => v.name.includes('Premium') || v.name.includes('Natural') || v.name.includes('Google US'));
        if (premium) utterance.voice = premium;
    };
    setOptimizedVoice();
    // Some browsers load voices async, listener applies fallback map natively
    window.speechSynthesis.onvoiceschanged = setOptimizedVoice;
    
    // Optimized playback parameters to sound clear and conversational
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
        setIsSpeaking(false);
        onComplete();
    };
    
    utterance.onerror = (e) => {
        console.error("TTS Output Error", e);
        setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    
  }, []);

  const submitAnswer = useCallback(() => {
    if (isRecordingRef.current) {
        try { recognitionRef.current?.disconnect(); } catch(e){}
        isRecordingRef.current = false;
        setIsRecording(false);
    }
    setTimeout(() => {
        const finalAnswer = latestTranscriptRef.current;
        if (onTranscriptSubmit) {
            onTranscriptSubmit(finalAnswer);
        }
        setTranscript('');
        finalTranscriptRef.current = '';
    }, 500);
  }, [onTranscriptSubmit]);

  return {
    isRecording,
    transcript,
    isSpeaking,
    toggleRecording,
    speakText,
    submitAnswer,
    setTranscript
  };
};
