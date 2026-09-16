import Link from 'next/link';
import Image from 'next/image';
import { FolderKanban, ArrowRight, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const metadata = {
  title: 'Program Kerja | Himpunan Mahasiswa Teknologi Informasi Cikarang',
  description: 'Katalog program kerja unggulan HMTI Cikarang yang dilaksanakan secara berkala oleh berbagai divisi.',
};

// ISR: katalog proker jarang berubah, cache 5 menit agar ringan
export const revalidate = 300;

function sortByEventDateDesc(list) {
  if (!list || !Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const timeA = a.event_date ? new Date(a.event_date).getTime() : 0;
    const timeB = b.event_date ? new Date(b.event_date).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return createdB - createdA;
  });
}

// Fallback dummy data jika Supabase kosong / belum terkoneksi
const FALLBACK_PROJECTS = [
  {
    id: 'dummy-4',
    title: 'Pelatihan Pengembangan Diri Anggota',
    description: 'Kegiatan pembekalan soft skill dan pelatihan kepemimpinan internal untuk pengembangan anggota.',
    event_date: '2025-08-05',
    photos_urls: [],
  },
  {
    id: 'dummy-3',
    title: 'Riset Kepuasan Mahasiswa',
    description: 'Riset mendalam tentang kepuasan mahasiswa terhadap layanan akademik dan organisasi untuk memperkuat evaluasi himpunan.',
    event_date: '2025-07-20',
    photos_urls: [],
  },
  {
    id: 'dummy-2',
    title: 'Pelatihan Desain & Media Kreatif',
    description: 'Program pelatihan intensif di bidang desain grafis dan media kreatif untuk memperkuat kapasitas visual mahasiswa.',
    event_date: '2025-06-15',
    photos_urls: [],
  },
  {
    id: 'dummy-1',
    title: 'Seminar Nasional Kepemimpinan',
    description: 'Seminar nasional yang menghadirkan para pemimpin inspiratif untuk berbagi pengalaman kepada mahasiswa Teknologi Informasi Cikarang.',
    event_date: '2025-05-10',
    photos_urls: [],
  },
];

async function getAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, event_date, background, thumbnail_url, photos_urls, created_at')
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return sortByEventDateDesc(FALLBACK_PROJECTS);

  const mapped = data.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.background || '',
    event_date: p.event_date,
    thumbnail_url: p.thumbnail_url,
    photos_urls: p.photos_urls || [],
    created_at: p.created_at,
  }));

  return sortByEventDateDesc(mapped);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
            Temukan berbagai program kerja unggulan yang dirancang HMTI Cikarang untuk
            meningkatkan kompetensi, kreativitas, dan semangat kolaborasi antar mahasiswa Teknologi Informasi.
          </p>
        </div>
      </section>

      {/* GRID PROKER */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        {projects.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Belum ada program kerja yang dipublikasikan.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((proker) => {
              const thumbnailSrc = proker.thumbnail_url || proker.photos_urls?.[0];
              return (
                <Link
                  key={proker.id}
                  href={`/proker/${proker.id}`}
                  className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      {thumbnailSrc ? (
                        <Image
                          src={thumbnailSrc}
                          alt={proker.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 400px"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]">
                          <FolderKanban className="h-10 w-10 text-white/40" />
                        </div>
                      )}
                    </div>
                  <div className="p-5">
                    {proker.event_date && (
                      <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(proker.event_date)}
                      </span>
                    )}
                    <h3 className="mt-2 text-base font-bold text-[#0F172A] transition-colors duration-300 group-hover:text-[#1E3A8A]">
                      {proker.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{proker.description}</p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                    Lihat Detail
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </section>
    </div>
  );
}
