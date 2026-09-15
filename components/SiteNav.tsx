'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame } from 'lucide-react';

const MOBILE_LINKS = [
  { href: '/beats', label: 'Beats', icon: true },
  { href: '#pricing', label: 'Licensing' },
  { href: '#how', label: 'How it works' },
];

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav
        className="fixed top-3 md:top-4 inset-x-3 md:inset-x-6 lg:inset-x-12 z-50
          bg-white/90 backdrop-blur border border-neutral-200
          rounded-full shadow-lg hover:shadow-xl
          px-5 md:px-7 py-2.5 md:py-3 transition-shadow duration-300"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-black text-2xl tracking-tight" onClick={closeMenu}>
            <Image src="/logo.png" alt="WISHAM" width={110} height={60} className="object-cover md:w-[120px]" />
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

          {/* Morphing hamburger — 3 bars twist into an X inside a filled circle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className={`md:hidden relative w-9 h-9 rounded-full flex items-center justify-center
              transition-colors duration-300 ${isOpen ? 'bg-red-600' : 'bg-neutral-900'}`}
          >
            <span
              className={`absolute block h-[2px] w-4 rounded-full bg-white transition-all duration-300 ease-out
                ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-[5px]'}`}
            />
            <span
              className={`absolute block h-[2px] w-4 rounded-full bg-white transition-all duration-200 ease-out
                ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
            />
            <span
              className={`absolute block h-[2px] w-4 rounded-full bg-white transition-all duration-300 ease-out
                ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-[5px]'}`}
            />
          </button>
        </div>
      </nav>

      {/* Full-screen menu overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-neutral-950 flex flex-col justify-center px-8
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[radial-gradient(circle_at_top_right,#dc2626,transparent_60%)]" />

        <div className="relative flex flex-col gap-2">
          {MOBILE_LINKS.map((link, i) => {
            const El = link.href.startsWith('/') ? Link : 'a';
            return (
              <El
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                style={{ transitionDelay: isOpen ? `${i * 75 + 100}ms` : '0ms' }}
                className={`group flex items-baseline gap-4 py-3 border-b border-white/10
                  transition-all duration-500 ease-out
                  ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              >
                <span className="text-xs font-mono text-red-500">0{i + 1}</span>
                <span className="text-4xl font-black tracking-tight text-white group-hover:text-red-500 transition-colors flex items-center gap-3">
                  {link.icon && <Flame className="w-6 h-6 text-red-500" />}
                  {link.label}
                </span>
              </El>
            );
          })}
        </div>

        <p
          style={{ transitionDelay: isOpen ? '350ms' : '0ms' }}
          className={`relative mt-10 text-xs text-neutral-500 font-semibold uppercase tracking-widest
            transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
        >
          WISHAM: Own your sound.
        </p>
      </div>
    </>
  );
}

export default SiteNav;