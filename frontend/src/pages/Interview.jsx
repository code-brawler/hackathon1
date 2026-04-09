import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, Target, AlertCircle, Play } from 'lucide-react';
import { useSpeechAI } from '../hooks/useSpeechAI';
import { useBodyLanguage } from '../hooks/useBodyLanguage';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const targetRole = location.state?.role || "Software Engineering";
  
  const videoRef = useRef(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(`Hi! Thanks for taking the time to interview today. To start off, could you tell me about your background and what you're looking for in your next role as a ${targetRole}?`);
  const [questionId, setQuestionId] = useState(0);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  
  // Custom Hooks
  const { confidenceScore, issues } = useBodyLanguage(videoRef);
  const { 
    isRecording, 
    transcript, 
    isSpeaking, 
    toggleRecording, 
    speakText, 
    submitAnswer,
    setTranscript 
  } = useSpeechAI(handleAnswerSubmit);

  // Initialize camera only (no early speaking)
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Could not get camera or mic permissions", err));
  }, []);

  
  const startSession = () => {
      setSessionStarted(true);
      // Now it's safe to speak (user gesture registered)
      speakText(currentQuestion);
  };

  async function handleAnswerSubmit(finalTranscript) {
    if (finalTranscript.trim().length === 0) return;
    
    // Check if we hit the closing question previously
    if (questionId === 99) {
        endInterview();
        return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          transcript: finalTranscript,
          confidence_score: confidenceScore,
          target_role: targetRole
        })
      });
      
      const data = await response.json();
      setCurrentQuestion(data.next_question.text);
      setQuestionId(data.next_question.id);
      setScoreHistory(prev => [...prev, data.scores]);
      setLastEvaluation({
         score: data.scores.depth,
         feedback: data.scores.feedback,
         improvement: data.scores.improvement
      });
      
      speakText(data.next_question.text, () => {
          if (data.next_question.id === 99) {
              // Automatically stop if it's the final wrap up question
              setTimeout(() => endInterview(data.scores), 5000);
          }
      });
      
    } catch (e) {
      console.error("Backend error", e);
      speakText("I seem to be having connection issues. Could you repeat that?");
    }
  }

  const endInterview = (finalScoresToInclude) => {
    // Calculate averages to pass to dashboard
    // finalScoresToInclude handles async state updates. If it's already in the array it's fine, but we'll use a local copy.
    const history = finalScoresToInclude ? [...scoreHistory.filter(s => s !== finalScoresToInclude), finalScoresToInclude] : scoreHistory;
    let avgTech = 0, avgComm = 0, avgDepth = 0;
    
    if (history.length > 0) {
        avgTech = history.reduce((acc, curr) => acc + curr.technical, 0) / history.length;
        avgComm = history.reduce((acc, curr) => acc + curr.communication, 0) / history.length;
        avgDepth = history.reduce((acc, curr) => acc + curr.depth, 0) / history.length;
    }
    
    
    navigate('/dashboard', { state: { 
        completed: true, 
        metrics: {
            technical: avgTech.toFixed(1),
            communication: avgComm.toFixed(1),
            confidence: confidenceScore,
            depth: avgDepth.toFixed(1),
            sessions: history.length
        }
    }});
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col max-w-7xl mx-auto h-screen max-h-screen relative">
      {!sessionStarted && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-black/5 text-center max-w-md">
                <Target size={48} className="text-coral mx-auto mb-4" />
                <h2 className="text-3xl font-black text-darkText mb-2">Ready to begin?</h2>
                <p className="text-mutedText mb-8">Ensure your volume is up, and look directly at the camera.</p>
                <button onClick={startSession} className="bg-coral text-darkText px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-coral/30 flex items-center justify-center w-full gap-2 hover:scale-105 transition-all outline-none">
                    <Play size={20} fill="currentColor" /> Start Session
                </button>
            </div>
        </div>
      )}
      
      {/* Header Info */}
      <header className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-coral/20 text-coral p-2 rounded-full"><Target size={24} /></div>
          <div>
            <h2 className="font-bold text-darkText leading-none">{targetRole}</h2>
            <span className="text-xs text-mutedText font-medium uppercase tracking-wider">Mock Session</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-mutedText mb-1">Confidence Score: <span className="font-bold text-darkText">{confidenceScore}</span></span>
            <div className="flex gap-1 w-full bg-black/10 rounded-full h-3 overflow-hidden">
               <div className="bg-coral h-full transition-all duration-300" style={{width: `${(confidenceScore/10)*100}%`}}></div>
            </div>
          </div>
          <button onClick={endInterview} className="bg-darkText text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-500 transition-colors">
            End
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        
        {/* AI Column */}
        <div className="bg-sage/40 border border-sage rounded-[2rem] p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-white/70 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-darkText flex items-center gap-1.5 z-10">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-coral' : 'bg-green-500'} animate-pulse`}></div>
            {isSpeaking ? 'Interviewer Speaking' : 'AI Orchestrator'}
          </div>
          
          <div className="flex-1 flex items-center justify-center">
             <div className="w-48 h-48 rounded-full bg-white shadow-xl shadow-sage/50 flex items-center justify-center relative">
               {isSpeaking && <div className="absolute inset-0 rounded-full border-4 border-coral/30 animate-ping opacity-80"></div>}
               <svg viewBox="0 0 100 100" className={`w-32 h-32 ${isSpeaking ? 'text-coral' : 'text-darkText/80'} transition-colors`}>
                 <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.1" />
                 <path d="M30 40 Q50 30 70 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5"/>
                 <circle cx="35" cy="45" r="4" fill="currentColor" />
                 <circle cx="65" cy="45" r="4" fill="currentColor" />
                 <path d={isSpeaking ? "M40 65 Q50 85 60 65" : "M40 65 Q50 75 60 65"} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" className="origin-center transition-all duration-200"/>
               </svg>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl mt-4 shadow-sm border border-black/5 relative min-h-[120px]">
            <div className="absolute top-0 left-6 -translate-y-1/2 bg-coral text-white text-xs font-bold px-2 py-0.5 rounded-full">Current Question</div>
            <p className="text-lg font-medium text-darkText leading-relaxed">
              "{currentQuestion}"
            </p>
          </div>

          {lastEvaluation && (
            <div className="bg-white p-6 rounded-3xl mt-4 shadow-sm border border-black/5 relative min-h-[100px] animate-in fade-in slide-in-from-bottom-4">
              <div className="absolute top-0 left-6 -translate-y-1/2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Feedback (Score: {lastEvaluation.score}/10)</div>
              <p className="text-sm font-medium text-darkText mb-2 mt-2">"{lastEvaluation.feedback}"</p>
              <div className="bg-coral/10 p-3 rounded-xl border border-coral/20">
                 <p className="text-sm text-coral font-medium">💡 Tip: {lastEvaluation.improvement}</p>
              </div>
            </div>
          )}
        </div>

        {/* User Column */}
        <div className="flex flex-col gap-6 h-full">
          <div className="h-2/3 bg-black rounded-[2rem] border border-black/10 overflow-hidden relative group flex items-center justify-center">
            
            {issues.length > 0 && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 z-10 animate-pulse">
                <AlertCircle size={14} className="text-yellow-400" />
                {issues[0]}
              </div>
            )}
            
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10 bg-black/40 backdrop-blur p-2 rounded-full">
              <button 
                onClick={toggleRecording}
                className={`p-4 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`}
              >
                {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white/70 backdrop-blur-md rounded-[2rem] border border-white shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-darkText flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                Live Transcript
              </h3>
            </div>
            <div className="flex-1 text-mutedText font-medium text-lg leading-relaxed overflow-y-auto flex flex-col">
              <div className="flex-1 mb-2">
                 {transcript.length > 0 ? transcript : <span className="opacity-50 italic">Listening or type below...</span>}
                 {isRecording && <span className="inline-block w-2 h-5 bg-coral ml-1 animate-pulse align-middle"></span>}
              </div>
              <textarea 
                 className="w-full bg-black/5 rounded-xl border-none p-3 text-sm text-darkText placeholder-black/30 focus:ring-2 focus:ring-coral/50 resize-none h-24"
                 placeholder="Browser STT not working? Type your answer manually here..."
                 value={transcript}
                 onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 flex justify-between">
              <button 
                className="text-sm font-semibold text-mutedText hover:text-darkText transition-colors flex items-center gap-1"
                onClick={() => setTranscript("I don't know the answer to this one.")}
              >
                Skip Question &rarr;
              </button>
              <button 
                className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-all ${transcript.length > 0 ? 'bg-coral text-darkText shadow-coral/30 hover:scale-105' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                onClick={submitAnswer}
                disabled={transcript.length === 0}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Interview;
