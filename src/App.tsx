import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Zap, Disc, Flame, BookOpen, Settings, Shield, Play, ArrowRight, CheckCircle, HelpCircle, Music, Layers } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { BeatsCatalog } from './pages/BeatsCatalog';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { DashboardModal } from './components/DashboardModal';
import { useState } from 'react';

// Home Page Component
const HomePage = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-neutral-100 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-15%] w-[650px] h-[650px] rounded-full bg-orange-600/15 blur-[160px]" />
        <div className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-neutral-900 bg-[#0A0A0C]/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-black text-2xl tracking-wider text-white">
           
            WISHAM
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-400">
            <Link to="/beats" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" /> Beats
            </Link>
            <a href="#classes" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-purple-400" /> Classes
            </a>
            <a href="#pricing" className="hover:text-white transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" /> Pricing
            </a>
          </div>

         
        </div>
      </nav>

      {/* Hero Section */}
<header className="relative max-w-7xl mx-auto px-6 pt-6 md:pt-28 pb-20 text-center z-10">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-orange-400 font-bold mb-3 animate-fade-in-down">
    <Zap className="w-4 h-4 fill-current text-orange-500" /> Every beat is deleted forever after purchase
  </div>
  
  {/* Main Heading */}
  <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-8">
    <span className="block animate-fade-in-up [animation-delay:100ms]">
      Buy Exclusive Beats.
    </span>
    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 animate-fade-in-up [animation-delay:200ms]">
      They Disappear After You Buy.
    </span>
  </h1>
  
  {/* Description */}
  <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up [animation-delay:300ms]">
    Each beat is sold only once. When you buy it, <span className="text-orange-400 font-bold">it gets deleted from the site immediately</span>. No one else can ever buy it again. Plus, learn beat making with Cubase and FL Studio.
  </p>

  {/* CTA Buttons */}
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
    <Link 
      to="/beats" 
      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-black font-extrabold text-base flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/25 hover:opacity-95 hover:scale-[1.02] transition-all animate-fade-in-up [animation-delay:400ms]"
    >
      <Play className="w-5 h-5 fill-current" /> Browse Beats
    </Link>
    <a 
      href="#classes" 
      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 font-bold text-neutral-200 transition-all flex items-center justify-center gap-2 animate-fade-in-up [animation-delay:500ms]"
    >
      <Disc className="w-5 h-5 text-purple-400" /> Join Classes
    </a>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-6 space-y-24 pb-40 z-10 relative">
        
        {/* How It Works */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-white text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Browse Beats</h3>
              <p className="text-sm text-neutral-400">Find the perfect beat for your next song. Listen to previews and check the details.</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Buy It</h3>
              <p className="text-sm text-neutral-400">Complete your purchase. The beat is instantly removed from the site.</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. It's Yours</h3>
              <p className="text-sm text-neutral-400">Get all the files (WAV, stems) and full ownership. No one else can ever buy it.</p>
            </div>
          </div>
        </section>

        {/* Classes Section */}
        <section id="classes" className="space-y-8 pt-12 border-t border-neutral-900">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 uppercase">
              <Disc className="w-4 h-4" /> Music Production Classes
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Learn Beat Making & Arrangements
            </h2>
            <p className="text-neutral-300">
              Learn how to make beats and arrange songs using Cubase and FL Studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Beginner Class */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-950/30 to-neutral-900 border border-neutral-800 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 uppercase">
                  Beginner's Class
                </div>
                <Music className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">$15/month</h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                Learn the basics of making beats. Covers Cubase and FL Studio basics, sound selection, and simple drum patterns.
              </p>
              <ul className="space-y-2 text-sm text-neutral-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Basic beat making</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Cubase & FL Studio intro</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Weekly practice exercises</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-colors">
                Start Learning
              </button>
            </div>

            {/* Arrangements Class */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-950/30 to-neutral-900 border border-orange-500/30 relative">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-orange-500 text-black text-[10px] font-bold uppercase">
                Popular
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400 uppercase">
                  Arrangements
                </div>
                <Layers className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">$20/month</h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                Learn how to arrange your beats into full songs. Covers song structure, transitions, and creating energy throughout a track.
              </p>
              <ul className="space-y-2 text-sm text-neutral-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-400" /> Song structure & flow</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-400" /> Creating drops & builds</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-400" /> Advanced arrangement tips</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white  font-bold text-sm transition-colors">
                Start Learning
              </button>
            </div>
          </div>
        </section>

  

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto space-y-8 pt-12 border-t border-neutral-900">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-orange-500" /> Questions?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <h5 className="font-bold text-white mb-2">What happens when I buy a beat?</h5>
              <p className="text-sm text-neutral-400">
                The beat gets removed from the site immediately. You'll get all the files and it becomes 100% yours.
              </p>
            </div>
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <h5 className="font-bold text-white mb-2">What files do I get?</h5>
              <p className="text-sm text-neutral-400">
                You get high quality WAV files and all the individual track stems so you can mix it however you want.
              </p>
            </div>
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <h5 className="font-bold text-white mb-2">Can I cancel my class subscription?</h5>
              <p className="text-sm text-neutral-400">
                Yes, you can cancel anytime. No contracts or hidden fees.
              </p>
            </div>
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <h5 className="font-bold text-white mb-2">What DAWs do the classes cover?</h5>
              <p className="text-sm text-neutral-400">
                The classes teach Cubase and FL Studio - two of the most popular DAWs for beat making.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-black text-white mb-4">Ready to make music?</h2>
          <p className="text-neutral-400 mb-8">Browse our exclusive beats and start creating today.</p>
          <Link 
            to="/beats"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-black font-extrabold text-base shadow-2xl shadow-orange-500/25 hover:opacity-95 transition-opacity"
          >
            Browse All Beats <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-[#08080A] py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-neutral-400 mb-8">
          <div>
            <div className="flex items-center gap-2 font-black text-xl text-white mb-3">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-black">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              WISHAM
            </div>
            <p className="text-xs text-neutral-500">
              Buy exclusive beats that delete themselves after purchase. Learn beat making with Cubase and FL Studio.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase mb-3">Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/beats" className="hover:text-white">Browse Beats</Link></li>
              <li><a href="#classes" className="hover:text-white">Classes</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase mb-3">Classes</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#classes" className="hover:text-white">Beginner's Class ($15/mo)</a></li>
              <li><a href="#classes" className="hover:text-white">Arrangements ($20/mo)</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-neutral-900 text-xs text-neutral-600">
          © {new Date().getFullYear()} Wisham Inc. All beats are exclusive.
        </div>
      </footer>

      {/* Dashboard Modal */}
      <DashboardModal 
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        purgedTracks={[]}
      />
    </div>
  );
};

// Main App Component with Router
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beats" element={<BeatsCatalog />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
