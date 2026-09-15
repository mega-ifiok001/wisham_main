import Link from 'next/link';
import Image from 'next/image';
import { Flame, Settings, ArrowRight } from 'lucide-react';

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-black text-2xl tracking-tight">
            <Image src="/logo.png" alt="WISHAM" width={130} height={70} className="object-cover" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-500">
          <Link href="/beats" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-500" /> Beats
          </Link>
          <a href="#pricing" className="hover:text-red-600 transition-colors">
            Licensing
          </a>
          <a href="#how" className="hover:text-red-600 transition-colors">
            How it works
          </a>
        </div>

        <Link
              href="/beats"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base transition-colors shadow-xl shadow-red-600/25"
            >
              Browse Beats <ArrowRight className="w-5 h-5" />
            </Link>
      </div>
    </nav>
  );
}

export default SiteNav;