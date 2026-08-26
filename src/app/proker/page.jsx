import Link from 'next/link';
import Image from 'next/image';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const metadata = {
  title: 'Program Kerja | Himpunan Mahasiswa',
};

// ISR: katalog proker jarang berubah, cache 5 menit agar ringan
export const revalidate = 300;

// Fallback dummy data jika Supabase kosong / belum terkoneksi
const FALLBACK_PROJECTS = [
  {
    id: 'dummy-1',
    title: 'Seminar Nasional Kepemimpinan',
    division_name: 'BPH',
    background: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.',
    photos_urls: [],
  },
  {
    id: 'dummy-2',
    title: 'Pelatihan Desain & Media Kreatif',
    division_name: 'KOMINFO',
    background: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
    photos_urls: [],
  },
  {
    id: 'dummy-3',
    title: 'Riset Kepuasan Mahasiswa',
    division_name: 'LITBANG',
    background: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.',
    photos_urls: [],
  },
  {
    id: 'dummy-4',
    title: 'Pelatihan Pengembangan Diri Anggota',
    division_name: 'PSDM',
    background: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
    photos_urls: [],
  },
];

async function getAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, background, photos_urls, division_id, created_at, divisions(name)')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return FALLBACK_PROJECTS;

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    background: p.background,
    photos_urls: p.photos_urls || [],
    division_name: p.divisions?.name || 'Umum',
  }));
}

export default async function ProkerPage() {
  const projects = await getAllProjects();

  return (
    <div>
      {/* HEADER */}
      <section className="bg-[#0F172A] py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Katalog Kegiatan
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Program Kerja</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </section>

      {/* GRID PROKER */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        {projects.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Belum ada program kerja yang dipublikasikan.</p>
        ) : (
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
                  <span className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                    Lihat Detail
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
