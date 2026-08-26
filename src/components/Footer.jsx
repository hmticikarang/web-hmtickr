import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, MapPin } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang Kami' },
  { href: '/struktur', label: 'Struktur Organisasi' },
  { href: '/proker', label: 'Program Kerja' },
  { href: '/aspirasi', label: 'Forum Aspirasi' },
  { href: '/oprec', label: 'Open Recruitment' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Kolom 1: Profil */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10">
                <Image
                  src="/logo-himpunan.png"
                  alt="Logo Himpunan"
                  fill
                  sizes="48px"
                  className="object-contain p-1.5"
                />
              </div>
              <span className="text-base font-bold text-white">Himpunan Mahasiswa</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Menjadi organisasi mahasiswa Teknologi Informasi yang unggul, inovatif, dan
              berdampak positif bagi masyarakat.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Navigasi Cepat
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Kontak Kami
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span>
                  Cikarang Square, Jl. Cibarusah Raya No.168, Pasirsari, Cikarang Sel,
                  Kabupaten Bekasi, Jawa Barat 17550.
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <a href="mailto:hmti.cikarang@gmail.com" className="transition-colors hover:text-white">
                  hmti.cikarang@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Instagram className="h-4 w-4 shrink-0 text-slate-500" />
                <a
                  href="https://www.instagram.com/hmti.cikarang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  @hmti.cikarang
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          &copy; {year} HMTI Cikarang. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
