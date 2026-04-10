import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillNav from '../components/ui/PillNav';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';

const Onboard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState('');
  const [exp, setExp] = useState('');
  const [tech, setTech] = useState('');
  const [focus, setFocus] = useState('');

  const roles = [
    "Frontend Developer", "Backend Developer", "Full Stack Engineer", 
    "Data Scientist", "UI/UX Designer", "Product Manager", "DevOps Engineer"
  ];
  
  const exps = [
      "Entry-Level (0-2 YOE)", "Mid-Level (3-5 YOE)", 
      "Senior Staff (5-8 YOE)", "Principal/Lead (8+ YOE)"
  ];
  
  const techs = [
      "React / Frontend Ecosystem", "Python / ML Ecosystem", 
      "Java / Enterprise Backend", "Node.js / Express", 
      "C++ / Systems", "Go / Cloud Native", 
      "General Scope"
  ];
  
  const focuses = [
      "Strictly Technical / Architecture", "Strictly Behavioral / Leadership", 
      "Mixed / Standard Interview"
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      setLoading(true);
      setTimeout(() => {
        navigate('/interview', { state: { role, exp, tech, focus }});
      }, 800);
    }
  };
  
  const renderGrid = (items, selected, setter) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 pb-2">
          {items.map(item => (
            <button 
              key={item}
              onClick={() => setter(item)}
              className={`p-4 rounded-2xl flex items-center gap-4 border transition-all text-left ${selected === item ? 'border-coral bg-coral/10 shadow-sm' : 'border-black/5 bg-white/50 hover:bg-white'}`}
            >
              <div className={`p-2 rounded-full flex-shrink-0 ${selected === item ? 'bg-coral text-white' : 'bg-sage text-[#4A5D4E]'}`}>
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-semibold text-darkText leading-tight text-sm sm:text-base">{item}</span>
            </button>
          ))}
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center pt-32 px-4 pb-20">
      <PillNav />

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-black/5 rounded-[3rem] p-8 sm:p-10 relative overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-bold font-sans text-darkText">Configuring Evaluator AI...</h3>
            <p className="text-mutedText mt-2">Generating personalized technical thresholds based on your Rank.</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-coral' : 'w-4 bg-mutedText/30'}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-mutedText tracking-widest uppercase">Phase {step}/4</span>
        </div>

        <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h2 className="text-3xl font-black text-darkText tracking-tight mb-2">Target Role</h2>
                <p className="text-mutedText mb-6">What position are you actually interviewing for?</p>
                {renderGrid(roles, role, setRole)}
                <div className="mt-8 flex justify-end">
                  <button onClick={handleNext} disabled={!role} className="bg-coral text-darkText px-8 py-3 rounded-full font-bold hover:bg-[#FF9B94] transition-all flex items-center gap-2 disabled:opacity-50">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h2 className="text-3xl font-black text-darkText tracking-tight mb-2">Experience Rank</h2>
                <p className="text-mutedText mb-6">We map AI evaluation strictness based on your expected seniority.</p>
                {renderGrid(exps, exp, setExp)}
                <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-mutedText font-medium hover:text-darkText">Back</button>
                  <button onClick={handleNext} disabled={!exp} className="bg-coral text-darkText px-8 py-3 rounded-full font-bold hover:bg-[#FF9B94] transition-all flex items-center gap-2 disabled:opacity-50">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
            
            {step === 3 && (
              <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h2 className="text-3xl font-black text-darkText tracking-tight mb-2">Primary Domain</h2>
                <p className="text-mutedText mb-6">Which technology stack represents your strongest ecosystem?</p>
                {renderGrid(techs, tech, setTech)}
                <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="text-mutedText font-medium hover:text-darkText">Back</button>
                  <button onClick={handleNext} disabled={!tech} className="bg-coral text-darkText px-8 py-3 rounded-full font-bold hover:bg-[#FF9B94] transition-all flex items-center gap-2 disabled:opacity-50">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
            
            {step === 4 && (
              <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h2 className="text-3xl font-black text-darkText tracking-tight mb-2">Assessment Focus</h2>
                <p className="text-mutedText mb-6">What type of parameters should the AI dynamically prioritize?</p>
                <div className="flex flex-col gap-3">
                  {focuses.map(f => (
                    <button 
                      key={f}
                      onClick={() => setFocus(f)}
                      className={`p-4 rounded-2xl flex items-center gap-4 border transition-all text-left ${focus === f ? 'border-coral bg-coral/10 shadow-sm' : 'border-black/5 bg-white/50 hover:bg-white'}`}
                    >
                      <div className={`p-2 rounded-full flex-shrink-0 ${focus === f ? 'bg-coral text-white' : 'bg-sage text-[#4A5D4E]'}`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-darkText">{f}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setStep(3)} className="text-mutedText font-medium hover:text-darkText">Back</button>
                  <button onClick={handleNext} disabled={!focus} className="bg-coral text-darkText px-8 py-3 rounded-full font-black hover:bg-[#FF9B94] transition-all flex items-center gap-2 disabled:opacity-50 shadow-md">
                    Start Interview <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboard;
