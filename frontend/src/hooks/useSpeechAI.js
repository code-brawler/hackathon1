import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechAI = (onTranscriptSubmit) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
         recognitionRef.current.disconnect();
      }
    };
  }, []);

  const sendAudioChunkToBackend = async (pcmData) => {
     let binary = '';
     const bytes = new Uint8Array(pcmData.buffer);
     for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
     }
     const base64 = btoa(binary);
     
     try {
         const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
         const response = await fetch(`${API_URL}/api/stt`, {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ audio_base64: base64 })
         });
         const data = await response.json();
         if (data.transcript) {
             setTranscript(prev => prev + " " + data.transcript);
         }
     } catch(e) {
         console.error("Backend STT error", e);
     }
  };

  const startAudioCapture = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(16384, 1, 1);
          
          let chunkBuffer = [];
          
          processor.onaudioprocess = (e) => {
              if (!isRecordingRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              for (let i = 0; i < inputData.length; i++) {
                  const s = Math.max(-1, Math.min(1, inputData[i]));
                  chunkBuffer.push(s < 0 ? s * 0x8000 : s * 0x7FFF);
              }
              
              // Process every ~3 seconds (48000 samples at 16kHz) to avoid overloading backend
              if (chunkBuffer.length >= 48000) {
                  const pcmData = new Int16Array(chunkBuffer);
                  chunkBuffer = [];
                  sendAudioChunkToBackend(pcmData);
              }
          };
          
          source.connect(processor);
          processor.connect(audioContext.destination);
          
          recognitionRef.current = {
             disconnect: () => {
                 try {
                     processor.disconnect();
                     source.disconnect();
                     // Process remaining buffer
                     if (chunkBuffer.length > 0) {
                         const pcmData = new Int16Array(chunkBuffer);
                         sendAudioChunkToBackend(pcmData);
                     }
                 } catch(err) {}
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

  const speakText = useCallback((text, onComplete) => {
    // Stop recording while the AI talks to prevent feedback loop
    if (isRecordingRef.current) {
        try { recognitionRef.current?.stop(); } catch(e){}
    }

    setIsSpeaking(true);
    
    // We use the proxied backend TTS to reliably avoid browser AdBlocks and CORS restrictions,
    // which were breaking the direct request to StreamElements.
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${API_URL}/api/tts?text=${encodeURIComponent(text.substring(0, 300))}`;
    
    // Clean up previous audio if any
    if (window.currentAudioElement) {
       window.currentAudioElement.pause();
    }
    
    const audio = new Audio(url);
    window.currentAudioElement = audio;
    
    audio.onended = () => {
       setIsSpeaking(false);
       if (onComplete) onComplete();
       if (isRecordingRef.current) {
           try { recognitionRef.current?.start(); } catch(e){}
       }
    };
    
    audio.onerror = () => {
       console.error("StreamElements TTS failed");
       setIsSpeaking(false);
       if (onComplete) onComplete();
       if (isRecordingRef.current) {
           try { recognitionRef.current?.start(); } catch(e){}
       }
    };

    audio.play().catch(e => {
       console.error("Audio block: " + e);
       audio.onerror();
    });

  }, []);

  const submitAnswer = useCallback(() => {
    if (isRecordingRef.current) {
        try { recognitionRef.current?.disconnect(); } catch(e){}
        isRecordingRef.current = false;
        setIsRecording(false);
    }
    
    // Slight delay to allow final chunk to process from hook
    setTimeout(() => {
        setTranscript(currentTranscript => {
            const finalAnswer = currentTranscript;
            if (onTranscriptSubmit) {
                onTranscriptSubmit(finalAnswer);
            }
            return '';
        });
        finalTranscriptRef.current = '';
    }, 1000);
    
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
