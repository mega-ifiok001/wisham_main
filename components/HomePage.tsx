import Link from 'next/link';
import { Music, Download, Zap, ArrowRight, Flame } from 'lucide-react';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { BeatsStrip } from '@/components/BeatsStrip';
import { PricingSection } from '@/components/PricingSection';

const STEPS = [
  {
    icon: Flame,
    title: '1 · Choose your beat',
    desc: 'Preview every beat with tags, BPM and key find the one that fits.',
  },
  {
    icon: Zap,
    title: '2 · Pay securely',
    desc: 'Checkout with Paystack. Cards from anywhere in the world are accepted.',
  },
  {
    icon: Download,
    title: '3 · Files in your inbox',
    desc: 'Master WAV, stems and your license are emailed instantly with secure download links.',
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteNav />

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-red-100 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-neutral-100 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-bold text-red-600 uppercase tracking-wider mb-6">
             Original beats · Global delivery
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Buy Beats.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              Own the Sound.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mt-6 leading-relaxed">
            Exclusive and inclusive instrumentals delivered straight to your inbox with stems and official
            licenses when you go exclusive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/beats"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base transition-colors shadow-xl shadow-red-600/25"
            >
              Browse Beats <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 font-bold text-base transition-colors"
            >
              See Pricing
            </a>
          </div>
        </div>
      </header>

      <BeatsStrip />
      <PricingSection />

      <section id="how" className="py-20 px-6 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center mb-14">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
            {STEPS.map((s) => (
              <div key={s.title} className="p-6">
                <span className="inline-flex w-12 h-12 rounded-xl bg-red-600 text-white items-center justify-center mb-4">
                  <s.icon className="w-6 h-6" />
                </span>
                <h3 className="font-extrabold text-lg">{s.title}</h3>
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-2xl mx-auto">
          Your next hit is one beat away
        </h2>
        <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
          Every exclusive purchase removes the beat from the store forever.
        </p>
        <Link
          href="/beats"
          className="inline-flex items-center gap-2 mt-8 px-10 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold transition-colors shadow-xl shadow-red-600/25"
        >
          Browse the catalog <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}

export default HomePage;