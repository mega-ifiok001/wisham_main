import Link from 'next/link';
import { Music } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
        <div className="flex items-center gap-3 font-black text-xl text-neutral-900">
        <img src="/logo.png" width={130} alt="" />
        </div>
       
        <p className="text-xs text-neutral-400">© {new Date().getFullYear()} WISHAM · Global beat store</p>
      </div>
    </footer>
  );
}

export default SiteFooter;