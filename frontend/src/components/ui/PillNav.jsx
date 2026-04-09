import { Link, useLocation, useNavigate } from 'react-router-dom';

const PillNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (id) => {
    if (location.pathname !== '/') {
      navigate('/' + '#' + id);
      // Let React Route shift first then scroll
      setTimeout(() => document.getElementById(id)?.scrollIntoView({behavior: 'smooth'}), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-40 flex justify-center px-4">
      <nav className="flex items-center gap-8 py-3 px-8 bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5 rounded-full">
        <div className="font-accent text-3xl font-bold text-darkText tracking-tighter cursor-pointer" onClick={() => { if(location.pathname !== '/') navigate('/'); else window.scrollTo(0,0); }}>
          InterviewIQ
        </div>
        <div className="hidden md:flex gap-6 text-mutedText font-medium text-sm">
          <button onClick={() => handleNav('features')} className="hover:text-darkText transition-colors">Features</button>
          <button onClick={() => handleNav('about')} className="hover:text-darkText transition-colors">About</button>
        </div>
        <Link 
          to="/onboard"
          className="bg-darkText text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-black transition-all hover:scale-105 active:scale-95"
        >
          Start Free
        </Link>
      </nav>
    </div>
  );
};

export default PillNav;
