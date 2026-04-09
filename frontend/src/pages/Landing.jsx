import React from 'react';
import { Link } from 'react-router-dom';
import PillNav from '../components/ui/PillNav';
import { motion } from 'framer-motion';

const Landing = () => {
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
            <button className="bg-white/50 backdrop-blur-sm border border-white/60 text-darkText px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/80 transition-all">
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
        </motion.div>

      </main>
    </div>
  );
};

export default Landing;
