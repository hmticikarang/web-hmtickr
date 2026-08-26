import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Users, FolderKanban } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ISR: cache 60 detik. Beranda tidak perlu di-generate ulang di setiap
// request karena proker terbaru & status oprec tidak berubah tiap detik.
export const revalidate = 60;

// Fallback dummy data jika Supabase kosong / belum terkoneksi
const FALLBACK_PROJECTS = [
  {
    id: 'dummy-1',
    title: 'Seminar Nasional Kepemimpinan',
    division_name: 'BPH',
    background: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    photos_urls: [],
  },
  {
    id: 'dummy-2',
    title: 'Pelatihan Desain & Media Kreatif',
    division_name: 'KOMINFO',
    background: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
    photos_urls: [],
  },
  {
    id: 'dummy-3',
    title: 'Riset Kepuasan Mahasiswa',
    division_name: 'LITBANG',
    background: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    photos_urls: [],
  },
];

async function getOprecStatus() {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'oprec_status')
    .single();
  return data?.value === 'open';
}

async function getLatestProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, background, photos_urls, division_id, divisions(name)')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) return FALLBACK_PROJECTS;

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    background: p.background,
    photos_urls: p.photos_urls || [],
    division_name: p.divisions?.name || 'Umum',
  }));
}

export default async function HomePage() {
  const [oprecOpen, projects] = await Promise.all([getOprecStatus(), getLatestProjects()]);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0F172A]">
        {/* Dekorasi latar pakai radial-gradient (CSS murni, tanpa filter blur
            yang mahal di-paint saat scroll) — hasil visual serupa, lebih ringan */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(30,58,138,0.5), transparent 45%), radial-gradient(circle at 85% 85%, rgba(100,116,139,0.35), transparent 45%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              Wadah Aspirasi & Kolaborasi Mahasiswa
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Himpunan Mahasiswa
              <span className="block text-slate-300">Bergerak, Berkarya, Berdampak.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/proker"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] shadow-lg transition-transform hover:scale-[1.02] sm:w-auto"
              >
                Jelajahi Proker
                <FolderKanban className="h-4 w-4" />
              </Link>
              {oprecOpen && (
                <Link
                  href="/oprec"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
                >
                  Daftar Open Recruitment
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SAMBUTAN KETUA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
              <Image
                src="/ketua-himpunan.jpg"
                alt="Ketua Himpunan Mahasiswa"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
              Sambutan Ketua Himpunan
            </span>
            <h2 className="mt-3 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              "Mari tumbuh bersama, berkarya untuk sesama."
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-[#0F172A]">Nama Ketua Himpunan</p>
              <p className="text-xs text-slate-500">Ketua Umum Periode 2025/2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROKER UNGGULAN */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
                Program Kerja
              </span>
              <h2 className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl">
                Proker Unggulan Terbaru
              </h2>
            </div>
            <Link
              href="/proker"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1E3A8A] hover:text-[#0F172A]"
            >
              Lihat Semua Proker
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((proker) => (
              <Link
                key={proker.id}
                href={`/proker/${proker.id}`}
                className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {proker.photos_urls?.[0] ? (
                    <Image
                      src={proker.photos_urls[0]}
                      alt={proker.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]">
                      <FolderKanban className="h-10 w-10 text-white/40" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-[#1E3A8A]/10 px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
                    {proker.division_name}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-[#0F172A] group-hover:text-[#1E3A8A]">
                    {proker.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{proker.background}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-[#0F172A] p-8 text-center sm:flex-row sm:text-left lg:p-12">
          <div className="flex items-center gap-4">
            <div className="hidden shrink-0 rounded-full bg-white/10 p-3 sm:block">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white sm:text-xl">
                Ingin tahu lebih jauh tentang kami?
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.
              </p>
            </div>
          </div>
          <Link
            href="/tentang"
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Tentang Kami
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
