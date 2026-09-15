import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Music, ShieldCheck, Download, Zap, ArrowRight, Flame, Settings, Play } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { Beat, api } from './lib/api';
import { BeatsCatalog } from './pages/BeatsCatalog';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

const LICENSE_TIERS = [
  { name: 'Inclusive', price: '$30', desc: 'Lease a beat for unlimited commercial use.',
    features: ['Master WAV', 'Unlimited streams & sales', 'No stems', 'No license document'], popular: false },
  { name: 'Inclusive + Stems', price: '$40', desc: 'Everything in Inclusive, plus the full trackout.',
    features: ['Master WAV', 'Full stems (trackout)', 'Unlimited streams & sales', 'No license document'], popular: false },
  { name: 'Exclusive', price: '$60', desc: 'The beat is yours — no one else can buy it.',
    features: ['Master WAV + Full stems', 'Official license sent to email', 'Beat removed from the store', 'Full ownership'], popular: true },
];

const HomePage = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  useEffect(() => {
    api.getBeats().then((res) => setBeats(res.beats)).catch(() => {});
  }, []);

  return (
  <div className="min-h-screen bg-white text-neutral-900">
    {/* Navbar */}
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-black text-2xl tracking-tight text-neutral-900">
          <img src="/logo.png" width={130} alt="" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-500">
          <Link to="/beats" className="hover:text-red-600 transition-colors flex items-center gap-1.5"><Flame className="w-4 h-4 text-red-500" /> Beats</Link>
          <a href="#pricing" className="hover:text-red-600 transition-colors">Licensing</a>
          <a href="#how" className="hover:text-red-600 transition-colors">How it works</a>
        </div>
        <Link to="/admin/login" className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 flex items-center gap-1.5 transition-colors">
          <Settings className="w-3.5 h-3.5" /> Admin
        </Link>
      </div>
    </nav>

    {/* Hero */}
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-red-100 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-neutral-100 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-bold text-red-600 uppercase tracking-wider mb-6">
          <Zap className="w-4 h-4 fill-current" /> Original beats · Global delivery
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto">
          Buy Beats.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">Own the Sound.</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mt-6 leading-relaxed">
          Exclusive and inclusive instrumentals delivered straight to your inbox — with stems and official licenses when you go exclusive.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link to="/beats" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base transition-colors shadow-xl shadow-red-600/25">
            Browse Beats <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 font-bold text-base transition-colors">
            See Pricing
          </a>
        </div>
      </div>
    </header>

    {/* Latest beats */}
    {beats.length > 0 && (
      <section id="beats" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Fresh on the store</h2>
              <p className="text-neutral-500 mt-3">Live from the WISHAM catalog — updated in real time.</p>
            </div>
            <Link to="/beats" className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:underline">
              Browse all beats <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {beats.slice(0, 4).map((b) => (
              <div key={b.id} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all">
                <div className={`relative h-32 bg-gradient-to-br ${b.coverGradient}`}>
                  <a href="/beats" className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <span className="w-11 h-11 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </span>
                  </a>
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur">
                    {b.genre}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-sm truncate">{b.title}</h3>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-neutral-500">{b.bpm} BPM · {b.keySignature}</span>
                    <span className="font-black text-red-600">${b.exclusivePrice}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400">${b.inclusivePrice} lease · ${b.inclusiveStemsPrice} +stems</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )}

    <section id="pricing" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Simple licensing</h2>
          <p className="text-neutral-500 mt-3 max-w-xl mx-auto">One-time payments. No subscriptions — every beat is sold per license.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {LICENSE_TIERS.map((tier) => (
            <div key={tier.name}
              className={`relative p-8 rounded-2xl border-2 flex flex-col transition-shadow hover:shadow-xl ${tier.popular ? 'border-red-600 bg-red-50/50 shadow-lg shadow-red-600/10' : 'border-neutral-200 bg-white'}`}>
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1 rounded-full">
                  Most common
                </span>
              )}
              <h3 className="font-extrabold text-lg">{tier.name}</h3>
              <p className="text-neutral-500 text-sm mt-1">{tier.desc}</p>
              <div className="mt-6 mb-6">
                <span className="text-5xl font-black tracking-tight">{tier.price}</span>
                <span className="text-neutral-400 font-semibold text-sm"> / one-time</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-neutral-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/beats" className={`mt-8 py-3.5 rounded-xl text-center font-bold text-sm transition-colors ${tier.popular ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-2 border-neutral-200 hover:border-neutral-300'}`}>
                Find a beat
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section id="how" className="py-20 px-6 bg-neutral-50 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">How it works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          {[
            { icon: Flame, title: '1 · Choose your beat', desc: 'Preview every beat with tags, BPM and key — find the one that fits.' },
            { icon: Zap, title: '2 · Pay securely', desc: 'Checkout with Paystack. Cards from anywhere in the world are accepted.' },
            { icon: Download, title: '3 · Files in your inbox', desc: 'Master WAV, stems and your license are emailed instantly with secure download links.' },
          ].map((s) => (
            <div key={s.title} className="p-6">
              <span className="inline-flex w-12 h-12 rounded-xl bg-red-600 text-white items-center justify-center mb-4"><s.icon className="w-6 h-6" /></span>
              <h3 className="font-extrabold text-lg">{s.title}</h3>
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-2xl mx-auto">Your next hit is one beat away</h2>
      <p className="text-neutral-500 mt-3 max-w-xl mx-auto">Every exclusive purchase removes the beat from the store forever.</p>
      <Link to="/beats" className="inline-flex items-center gap-2 mt-8 px-10 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold transition-colors shadow-xl shadow-red-600/25">
        Browse the catalog <ArrowRight className="w-5 h-5" />
      </Link>
    </section>

    {/* Footer */}
    <footer className="border-t border-neutral-200 bg-neutral-50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
        <div className="flex items-center gap-3 font-black text-xl text-neutral-900">
          <span className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white"><Music className="w-4 h-4" /></span>
          WISHAM
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold">
          <Link to="/beats" className="hover:text-red-600 transition-colors">Beats</Link>
          <Link to="/admin/login" className="hover:text-red-600 transition-colors">Admin</Link>
        </div>
        <p className="text-xs text-neutral-400">© {new Date().getFullYear()} WISHAM · Global beat store</p>
      </div>
    </footer>
  </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beats" element={<BeatsCatalog />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;