import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Onboard from './pages/Onboard';
import Interview from './pages/Interview';
import Dashboard from './pages/Dashboard';
import GrainOverlay from './components/ui/GrainOverlay';
import FloatingBlob from './components/ui/FloatingBlob';

function App() {
  return (
    <Router>
      <GrainOverlay />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <FloatingBlob color="#FFE4E1" className="top-[-10%] left-[-10%] w-[60vw] h-[60vw] opacity-60" delay={0} />
        <FloatingBlob color="#E6E6FA" className="bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] opacity-50" delay={2} />
      </div>
      
      <div className="relative z-10 min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
