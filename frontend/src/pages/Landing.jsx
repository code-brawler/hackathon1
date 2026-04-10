import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PillNav from '../components/ui/PillNav';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <div className="min-h-screen flex flex-col relative w-full items-center">
      <PillNav />

      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-32 pb-20 text-center z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-sage text-[#4A5D4E] text-sm font-medium tracking-wide">
            Next-Gen AI Mock Interviews
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-darkText tracking-tighter leading-[1.1] mb-6">
            Practice smarter,<br />
            crack interviews<br />
            <span className="relative inline-block mt-2">
              with <span className="font-accent font-normal text-7xl md:text-[110px] text-coral ml-2 italic -rotate-2 inline-block">confidence</span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-mutedText mb-10 max-w-2xl font-light">
            Zero-cost, agentic AI mock interviews tailored to your resume, role, and real-time body language.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link 
              to="/onboard"
              className="bg-coral text-darkText px-8 py-4 rounded-full text-lg font-bold hover:bg-[#FF9B94] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-coral/30"
            >
              Start Free →
            </Link>
            <button 
              onClick={() => setShowDemo(true)}
              className="bg-white/50 backdrop-blur-sm border border-white/60 text-darkText px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/80 transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full"
          id="features"
        >
          {[
            { tag: "Resume Agent", title: "Tailored to You", desc: "Upload your resume and get questions based directly on your claimed skills and experience depth." },
            { tag: "Voice AI", title: "Real-time Voice Interactions", desc: "Speak naturally with an adaptive AI interviewer powered by Gemini Live for zero latency." },
            { tag: "Feedback", title: "30-Day Growth Plan", desc: "Get an actionable roadmap pinpointing weak topics with resources to drill before your real interview." }
          ].map((feature, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-xl shadow-black/5 flex flex-col items-start text-left hover:scale-[1.02] transition-transform duration-300">
              <span className="px-3 py-1 bg-lavender text-[#5B5575] rounded-full text-xs font-bold mb-4">{feature.tag}</span>
              <h3 className="text-2xl font-bold text-darkText mb-2">{feature.title}</h3>
              <p className="text-mutedText leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* About Section */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-32 mb-20 w-full bg-sage/30 rounded-[3rem] p-12 md:p-16 text-left border border-white/40 shadow-xl shadow-black/5"
          id="about"
        >
          <h2 className="text-4xl font-black text-darkText mb-6 tracking-tight">Built for nervous candidates.</h2>
          <p className="text-lg text-mutedText max-w-3xl leading-relaxed mb-6">
            InterviewIQ was built during a hackathon to solve a massive problem: practicing for technical interviews is either too expensive, intimidating, or completely unrealistic. 
          </p>
          <p className="text-lg text-mutedText max-w-3xl leading-relaxed">
            By combining completely free, privacy-first browser API logic with dynamic Python heuristics, we created a localized agentic experience that dynamically adapts to your weaknesses without costing a dime in API calls. 
            Because you deserve a space to practice that breathes.
          </p>
          
          <div className="mt-8 pt-8 border-t border-black/10">
            <h3 className="text-xl font-bold text-darkText mb-4 flex items-center gap-2">Connect with the developer</h3>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <a href="https://github.com/code-brawler/" target="_blank" rel="noreferrer" className="text-darkText font-semibold hover:text-coral transition-colors flex items-center gap-2">
                GitHub: @code-brawler
              </a>
              <span className="hidden sm:inline text-black/20">|</span>
              <a href="mailto:way2utkarshraj@gmail.com" className="text-darkText font-semibold hover:text-coral transition-colors flex items-center gap-2">
                Email: way2utkarshraj@gmail.com
              </a>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Demo Walkthrough Modal */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDemo(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute top-6 right-6 text-mutedText hover:text-coral transition-colors p-3 bg-gray-100 hover:bg-white rounded-full z-10"
                onClick={() => setShowDemo(false)}
              >
                ✕
              </button>
              
              <h2 className="text-3xl md:text-4xl font-black text-darkText mb-4 tracking-tight text-center">How InterviewIQ Works</h2>
              <p className="text-mutedText text-center max-w-2xl mx-auto mb-12">Just two simple steps before you're mock-interviewing with state-of-the-art vision and voice AI.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col items-center">
                  <div className="w-full bg-sage/20 border border-black/5 rounded-3xl overflow-hidden mb-6 shadow-lg shadow-black/5">
                    <img src="/demo1.jpg" alt="Step 1: Select Role" className="w-full h-auto object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-darkText">1. Choose Your Target Role</h3>
                  <p className="text-mutedText text-center leading-relaxed">
                    Once you hit Start, the system configures your specific domain. Select "Frontend Developer" or "Data Scientist" and add your experience level so Gemini structures relevant technical questions.
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-full bg-sage/20 border border-black/5 rounded-3xl overflow-hidden mb-6 shadow-lg shadow-black/5">
                    <img src="/demo2.jpg" alt="Step 2: Start Mock Interview" className="w-full h-auto object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-darkText">2. Grant Face & Voice Access</h3>
                  <p className="text-mutedText text-center leading-relaxed">
                    Hit "Start Session" to allow browser pipeline permissions. We securely spin up the MediaPipe Computer Vision tracker and native Audio processing stream to analyze your actual body language and delivery.
                  </p>
                </div>
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
