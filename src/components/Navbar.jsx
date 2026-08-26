'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang Kami' },
  { href: '/struktur', label: 'Struktur Organisasi' },
  { href: '/proker', label: 'Proker' },
  { href: '/aspirasi', label: 'Aspirasi' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [oprecOpen, setOprecOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Ambil status oprec dari Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchOprecStatus() {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'oprec_status')
        .single();

      if (!error && data && isMounted) {
        setOprecOpen(data.value === 'open');
      }
    }

    fetchOprecStatus();

    // Realtime listener supaya navbar langsung update saat admin toggle status
    const channel = supabase
      .channel('settings-oprec-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'key=eq.oprec_status' },
        (payload) => {
          if (isMounted) setOprecOpen(payload.new.value === 'open');
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Tutup menu mobile saat pindah halaman
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Efek shadow saat scroll (pakai rAF throttle + passive listener
  // supaya tidak membebani main thread saat pengguna scroll)
  useEffect(() => {
    let ticking = false;
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
              <Image
                src="/logo-kampus.png"
                alt="Logo Kampus"
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            </div>
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
              <Image
                src="/logo-himpunan.png"
                alt="Logo Himpunan"
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            </div>
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-bold text-[#0F172A]">Himpunan Mahasiswa</span>
            <span className="text-xs text-slate-500">Program Studi</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#0F172A]/5 text-[#0F172A]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA Button (Desktop) */}
        <div className="hidden lg:block">
          {oprecOpen && (
            <Link
              href="/oprec"
              className="group flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0F172A]/20 transition-all hover:bg-[#1E3A8A] hover:shadow-lg hover:shadow-[#1E3A8A]/30"
            >
              Open Recruitment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-[#0F172A] hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? 'max-h-96 border-t border-slate-100' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#0F172A]/5 text-[#0F172A]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {oprecOpen && (
            <Link
              href="/oprec"
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white shadow-md"
            >
              Open Recruitment
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
