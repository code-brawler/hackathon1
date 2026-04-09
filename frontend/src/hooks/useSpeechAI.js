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
          console.log("Native STT bypass via robust backend WAV encoding applied.");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(16384, 1, 1);
          
          let chunkBuffer = [];

          const sendAudioChunkToBackend = async (pcmData) => {
              const buffer = new ArrayBuffer(44 + pcmData.length * 2);
              const view = new DataView(buffer);
              
              const writeString = (v, offset, string) => {
                  for (let i = 0; i < string.length; i++) {
                      v.setUint8(offset + i, string.charCodeAt(i));
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
              for (let i = 0; i < bytes.byteLength; i++) {
                  binary += String.fromCharCode(bytes[i]);
              }
              const base64 = btoa(binary);
              
              try {
                  const API_URL = import.meta.env.VITE_API_URL || 'https://hackathon1.onrender.com';
                  const response = await fetch(`${API_URL}/api/stt`, {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ audio_base64: base64 })
                  });
                  const data = await response.json();
                  if (data.transcript) {
                      finalTranscriptRef.current += data.transcript + ' ';
                      setTranscript((finalTranscriptRef.current).trim());
                  }
              } catch(e) {
                  console.error("Backend STT error", e);
              }
          };

          processor.onaudioprocess = (e) => {
              if (!isRecordingRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              for (let i = 0; i < inputData.length; i++) {
                  const s = Math.max(-1, Math.min(1, inputData[i]));
                  chunkBuffer.push(s < 0 ? s * 0x8000 : s * 0x7FFF);
              }
              // Send off chunks every ~3-4 seconds (64000 samples)
              if (chunkBuffer.length >= 64000) {
                  const pcmData = new Int16Array(chunkBuffer);
                  chunkBuffer = [];
                  sendAudioChunkToBackend(pcmData);
              }
          };

          source.connect(processor);
          processor.connect(audioContext.destination);

          recognitionRef.current = {
             disconnect: () => {
                 try { processor.disconnect(); source.disconnect(); } catch(err) {}
             },
             stop: () => {
                 try { processor.disconnect(); source.disconnect(); } catch(err) {} 
             },
             start: () => {} 
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
    
    // We use the proxied backend TTS to reliably avoid browser strict CORS restrictions,
    // which Firefox sometimes imposes on external Audio element sources.
    const cleanText = text.replace(/\[|\]|\*|#/g, ''); 
    const API_URL = import.meta.env.VITE_API_URL || 'https://hackathon1.onrender.com';
    const url = `${API_URL}/api/tts?text=${encodeURIComponent(cleanText.substring(0, 300))}`;
    
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

  const latestTranscriptRef = useRef(transcript);
  useEffect(() => {
     latestTranscriptRef.current = transcript;
  }, [transcript]);

  const submitAnswer = useCallback(() => {
    if (isRecordingRef.current) {
        try { recognitionRef.current?.disconnect(); } catch(e){}
        isRecordingRef.current = false;
        setIsRecording(false);
    }
    
    // Slight delay to allow final chunk to process from hook
    setTimeout(() => {
        const finalAnswer = latestTranscriptRef.current;
        if (onTranscriptSubmit) {
            onTranscriptSubmit(finalAnswer);
        }
        setTranscript('');
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
