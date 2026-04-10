import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PillNav from '../components/ui/PillNav';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Download, PlayCircle, BookOpen, Target } from 'lucide-react';


const Dashboard = () => {
  const location = useLocation();
  const metrics = location.state?.metrics || {
      technical: '7.8',
      communication: '8.4',
      confidence: '6.5',
      depth: '8.0',
      sessions: 4
  };
  
  const lineData = useMemo(() => [
    { name: 'S1', score: 4.2 },
    { name: 'S2', score: 5.8 },
    { name: 'S3', score: 6.1 },
    { name: `S${metrics.sessions || 4}`, score: parseFloat(metrics.depth) },
  ], [metrics]);
  
  const radarData = useMemo(() => [
    { subject: 'Technical', A: (parseFloat(metrics.technical)/10)*100, fullMark: 100 },
    { subject: 'Communication', A: (parseFloat(metrics.communication)/10)*100, fullMark: 100 },
    { subject: 'Confidence', A: (parseFloat(metrics.confidence)/10)*100, fullMark: 100 },
    { subject: 'Depth', A: (parseFloat(metrics.depth)/10)*100, fullMark: 100 },
  ], [metrics]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      metrics,
      behaviorData,
      summaryData
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "interview_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const [behaviorData, setBehaviorData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingBehavior, setLoadingBehavior] = useState(true);

  useEffect(() => {
      if (!metrics.behavior) {
          setLoadingBehavior(false);
          return;
      }
      const fetchBehavior = async () => {
          try {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
              const response = await fetch(`${API_URL}/api/interview/behavior`, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                      motion_flags: metrics.behavior.motionFlags || 0,
                      multi_face_flags: metrics.behavior.multiplePeopleFlags || 0,
                      confidence: parseFloat(metrics.confidence) || 5.0
                  })
              });
              const data = await response.json();
              setBehaviorData(data);
          } catch(e) {
              console.error("Behavior processing failed.", e);
          } finally {
              setLoadingBehavior(false);
          }
      };
      
      const fetchSummary = async () => {
          if (!metrics.answerHistory) return;
          try {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
              const response = await fetch(`${API_URL}/api/interview/summary`, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                      history: metrics.answerHistory,
                      role: metrics.role || "Software Engineer",
                      exp: metrics.exp || "Mid-Level"
                  })
              });
              const data = await response.json();
              setSummaryData(data);
          } catch(e) {
              console.error("Summary processing failed.", e);
          }
      };
      
      fetchBehavior();
      fetchSummary();
  }, [metrics]);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <PillNav />

      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-darkText tracking-tight mb-2">Welcome back, Candidate</h1>
          <p className="text-mutedText text-lg">Your mock interview progress is looking stellar. ✦</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white border border-black/10 px-4 py-2 rounded-xl shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <Download size={16} /> Export Data
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completion', val: `${metrics.questionsAttempted || 0}/${metrics.totalQuestions || 5}`, detail: 'Questions Attempted', alert: (metrics.questionsAttempted || 0) < (metrics.totalQuestions || 5) },
            { label: 'Avg Feedback Rank', val: metrics.technical, detail: 'Score out of 10' },
            { label: 'Confidence Proxy', val: metrics.confidence, detail: parseFloat(metrics.confidence) < 7.0 ? 'Needs work' : 'Strong presence', alert: parseFloat(metrics.confidence) < 7.0 },
            { label: 'Sessions Completed', val: metrics.sessions, detail: 'Total ran' },
          ].map((kpi, i) => (
            <div key={i} className={`bg-white/60 backdrop-blur rounded-[2rem] p-6 border ${kpi.alert ? 'border-coral/50 shadow-coral/10' : 'border-white'} shadow-sm`}>
              <span className="text-mutedText text-sm font-medium">{kpi.label}</span>
              <div className="text-4xl font-black text-darkText mt-2 mb-1">{kpi.val}</div>
              <div className={`text-xs font-semibold ${kpi.alert ? 'text-coral' : 'text-green-600'}`}>
                {kpi.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-lg shadow-black/5 p-8">
          <h3 className="text-xl font-bold text-darkText mb-6">Score Trajectory</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716C', fontSize: 12}} dy={10} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#78716C', fontSize: 12}} dx={-10} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="score" stroke="#FFB7B2" strokeWidth={4} dot={{r: 6, fill: '#FFB7B2', strokeWidth: 2, stroke: '#FFF'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-sage/30 rounded-[2.5rem] border border-sage/50 p-8 flex flex-col justify-center items-center text-center">
           <h3 className="text-lg font-bold text-darkText mb-2">Skill Balance</h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#4A5D4E', fontSize: 11, fontWeight: 600}} />
                <Radar name="Student" dataKey="A" stroke="#4A5D4E" fill="#E8EFE8" fillOpacity={0.8} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Proctoring & Behavioral Analysis Component */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-darkText flex items-center gap-2">
            <Target className="text-coral" /> Proctoring & Demeanor Analysis
          </h3>
          <span className="bg-coral/20 text-coral px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Computer Vision AI Generated</span>
        </div>
        
        {loadingBehavior ? (
           <div className="flex items-center justify-center p-8"><div className="w-8 h-8 rounded-full border-2 border-coral border-t-transparent animate-spin"></div></div>
        ) : behaviorData ? (
           <div className="flex flex-col gap-6">
              <p className="text-lg font-medium text-darkText leading-relaxed bg-coral/5 p-4 rounded-xl border border-coral/20">"{behaviorData.summary}"</p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-2">
                <div className="border border-green-200 bg-green-50 rounded-2xl p-6 relative">
                  <h4 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> DO's in Real Interviews</h4>
                  <ul className="space-y-3">
                     {behaviorData.dos?.map((item, i) => (
                         <li key={i} className="text-sm font-medium text-green-900 border-b border-green-200/50 pb-2">{item}</li>
                     ))}
                  </ul>
                </div>
                <div className="border border-red-200 bg-red-50 rounded-2xl p-6 relative">
                  <h4 className="font-bold text-lg mb-4 text-red-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> DONT's in Real Interviews</h4>
                  <ul className="space-y-3">
                     {behaviorData.donts?.map((item, i) => (
                         <li key={i} className="text-sm font-medium text-red-900 border-b border-red-200/50 pb-2">{item}</li>
                     ))}
                  </ul>
                </div>
              </div>
           </div>
        ) : (
           <p className="text-mutedText p-4 bg-gray-50 rounded-xl border border-black/5 text-center font-medium">Detailed physical telemetry flags were not detected during this run. Ensure camera runs unblocked next time.</p>
        )}
      </div>

      {/* Aggregate Strengths & Weaknesses */}
      {summaryData && (
          <div className="bg-white rounded-[2.5rem] p-8 mt-6 border border-black/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-darkText flex items-center gap-2">
                <BookOpen className="text-coral" /> Combined Aggregate Feedback
              </h3>
            </div>
            <p className="text-lg font-medium text-darkText leading-relaxed bg-black/5 p-4 rounded-xl border border-black/10 mb-6 font-mono">"{summaryData.remarks}"</p>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="border border-green-200 bg-green-50 rounded-2xl p-6">
                 <h4 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">Detected Strengths</h4>
                 <ul className="space-y-3">
                    {summaryData.strengths?.map((item, i) => (
                        <li key={i} className="text-sm font-medium text-green-900 border-b border-green-200/50 pb-2 flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" /> {item}</li>
                    ))}
                 </ul>
               </div>
               <div className="border border-coral/30 bg-coral/5 rounded-2xl p-6">
                 <h4 className="font-bold text-lg mb-4 text-red-800 flex items-center gap-2">Identified Weaknesses</h4>
                 <ul className="space-y-3">
                    {summaryData.weaknesses?.map((item, i) => (
                        <li key={i} className="text-sm font-medium text-red-900 border-b border-red-200/50 pb-2 flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {item}</li>
                    ))}
                 </ul>
               </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
