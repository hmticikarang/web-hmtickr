'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { InteractiveHoverButton } from './ui/InteractiveHoverButton';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang Kami' },
  { href: '/struktur', label: 'Struktur Organisasi' },
  { href: '/proker', label: 'Proker' },
  { href: '/kegiatan', label: 'Kegiatan' },
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
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3">
          {/* Logo BSI — gunakan width/height eksplisit, bukan fill, agar tidak blur */}
          <Image
            src="/logo-bsi.png"
            alt="Logo Universitas BSI"
            width={36}
            height={36}
            quality={100}
            className="shrink-0 rounded-md"
          />

          {/* Vertical Divider */}
          <div className="h-7 w-px bg-slate-200" />

          {/* Logo HMTI */}
          <Image
            src="/logo-hmti.png"
            alt="Logo HMTI"
            width={36}
            height={36}
            quality={100}
            className="shrink-0 rounded-full"
          />

          {/* Brand Text */}
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-bold text-[#0F172A]">HMTI Cikarang</span>
            <span className="text-[11px] text-slate-400">Universitas BSI</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <InteractiveHoverButton
                  text={link.label}
                  showIcon={false}
                  className={`h-auto min-h-0 min-w-0 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-sm'
                      : 'border-transparent bg-transparent text-slate-600 hover:border-[#0F172A]'
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* CTA Button (Desktop) */}
        <div className="hidden lg:block">
          {oprecOpen && (
            <Link href="/oprec">
              <InteractiveHoverButton
                text="Open Recruitment"
                showIcon={true}
                className="h-auto min-h-0 min-w-0 border-[#0F172A] bg-[#0F172A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md"
              />
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
        <div className="flex flex-col gap-1.5 px-4 py-4 sm:px-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="w-full">
                <InteractiveHoverButton
                  text={link.label}
                  showIcon={false}
                  className={`h-auto min-h-0 w-full min-w-0 justify-center px-4 py-2 text-xs font-medium ${
                    active
                      ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-sm'
                      : 'border-transparent bg-slate-50 text-slate-600 hover:border-[#0F172A]'
                  }`}
                />
              </Link>
            );
          })}

          {oprecOpen && (
            <Link href="/oprec" className="mt-1 w-full">
              <InteractiveHoverButton
                text="Open Recruitment"
                showIcon={true}
                className="h-auto min-h-0 w-full min-w-0 justify-center border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white shadow-md"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
