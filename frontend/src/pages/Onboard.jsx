import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillNav from '../components/ui/PillNav';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, Briefcase, FileCode2 } from 'lucide-react';

const Onboard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const [fileAdded, setFileAdded] = useState(false);

  const [file, setFile] = useState(null);

  const roles = [
    "Frontend Developer", "Backend Developer", "Full Stack Engineer", 
    "Data Scientist", "UI/UX Designer", "Product Manager", "DevOps Engineer"
  ];

  const handleNext = async () => {
    if (step < 2) setStep(step + 1);
    else {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file || new Blob(['mock content'], { type: 'application/pdf' }));
        formData.append('target_role', role);
        const API_URL = import.meta.env.VITE_API_URL || 'https://hackathon1.onrender.com';
        await fetch(`${API_URL}/api/resume/parse`, {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error("Failed to parse resume", err);
      }
      setTimeout(() => {
        navigate('/interview', { state: { role }});
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-32 px-4 pb-20">
      <PillNav />

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-black/5 rounded-[3rem] p-10 relative overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-bold font-sans text-darkText">Building your profile...</h3>
            <p className="text-mutedText mt-2">ResumeIntel is parsing your skills and configuring the orchestrator.</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-coral' : 'w-4 bg-mutedText/30'}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-coral' : 'w-4 bg-mutedText/30'}`} />
          </div>
          <span className="text-sm font-semibold text-mutedText">Step {step} of 2</span>
        </div>

        {step === 1 && (
          <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-3xl font-black text-darkText tracking-tight mb-2">Upload your resume</h2>
            <p className="text-mutedText mb-8">We'll tailor the interview questions based on your experience.</p>
            
            <label className="border-2 border-dashed border-coral/40 bg-coral/5 rounded-3xl p-12 flex flex-col items-center text-center cursor-pointer hover:bg-coral/10 transition-colors group relative">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" onChange={(e) => { 
                if(e.target.files.length>0) {
                  setFileAdded(true);
                  setFile(e.target.files[0]);
                } 
              }} />
              <div className={`p-4 rounded-full shadow-sm mb-4 transition-transform ${fileAdded ? 'bg-green-500 text-white' : 'bg-white text-coral group-hover:scale-110'}`}>
                {fileAdded ? <FileCode2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
              <h4 className="text-lg font-bold text-darkText">{fileAdded ? "Resume Attached Successfully!" : "Drag & drop your PDF"}</h4>
              <p className="text-sm text-mutedText mt-1">{fileAdded ? "Ready to proceed" : "or click to browse files"}</p>
            </label>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleNext}
                disabled={!fileAdded}
                className={`px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${fileAdded ? 'bg-darkText text-white hover:bg-black' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-3xl font-black text-darkText tracking-tight mb-2">Target Role</h2>
            <p className="text-mutedText mb-8">What position are you interviewing for?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 pb-2">
              {roles.map(r => (
                <button 
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-4 rounded-2xl flex items-center gap-4 border transition-all text-left ${role === r ? 'border-coral bg-coral/10 shadow-sm' : 'border-black/5 bg-white/50 hover:bg-white'}`}
                >
                  <div className={`p-2 rounded-full ${role === r ? 'bg-coral text-white' : 'bg-sage text-[#4A5D4E]'}`}>
                    {r.includes("Data") ? <FileCode2 className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                  </div>
                  <span className="font-semibold text-darkText">{r}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between items-center">
              <button onClick={() => setStep(1)} className="text-mutedText font-medium hover:text-darkText">Back</button>
              <button 
                onClick={handleNext}
                disabled={!role}
                className="bg-coral text-darkText px-8 py-3 rounded-full font-bold hover:bg-[#FF9B94] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                Start Interview <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboard;
