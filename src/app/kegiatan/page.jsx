import Link from 'next/link';
import Image from 'next/image';
import { Folder, Calendar, ArrowRight, FolderKanban } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const metadata = {
  title: 'Galeri Kegiatan | Himpunan Mahasiswa Teknologi Informasi Cikarang',
  description:
    'Dokumentasi kegiatan sosial dan non-proker HMTI Cikarang — bagi-bagi takjil, buka bersama, bakti sosial, dan berbagai kegiatan kemanusiaan lainnya.',
};

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

const FALLBACK_ACTIVITIES = [
  {
    id: 'dummy-3',
    title: 'Penggalangan Dana untuk NTT',
    description:
      'HMTI Cikarang menggalang dana dan menyalurkan bantuan kepada korban bencana di Nusa Tenggara Timur.',
    event_date: '2025-04-05',
    photos_urls: [],
  },
  {
    id: 'dummy-2',
    title: 'Buka Bersama Keluarga Besar HMTI',
    description:
      'Acara buka puasa bersama seluruh anggota, alumni, dan keluarga besar HMTI Cikarang untuk mempererat tali silaturahmi.',
    event_date: '2025-03-20',
    photos_urls: [],
  },
  {
    id: 'dummy-1',
    title: 'Bagi-Bagi Takjil Ramadhan',
    description:
      'HMTI Cikarang membagikan ratusan paket takjil kepada masyarakat sekitar kampus sebagai wujud kepedulian di bulan suci Ramadhan.',
    event_date: '2025-03-15',
    photos_urls: [],
  },
];

async function getAllActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('id, title, description, event_date, thumbnail_url, photos_urls, created_at')
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return sortByEventDateDesc(FALLBACK_ACTIVITIES);
  return sortByEventDateDesc(data);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function KegiatanPage() {
  const activities = await getAllActivities();

  return (
    <div>
      {/* HEADER */}
      <section className="bg-[#0F172A] py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(30,58,138,0.6), transparent 50%), radial-gradient(circle at 80% 20%, rgba(100,116,139,0.3), transparent 50%)',
          }}
        />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-sm">
            <Folder className="h-3.5 w-3.5 text-blue-400" />
            Kegiatan Sosial & Komunitas
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Galeri Kegiatan HMTI
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            Dokumentasi kegiatan sosial dan kemasyarakatan yang dilaksanakan oleh HMTI Cikarang di
            luar program kerja resmi — karena kepedulian tidak mengenal batas administratif.
          </p>
        </div>
      </section>

      {/* GRID KEGIATAN */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Folder className="mb-4 h-12 w-12 text-slate-200" />
            <p className="text-sm text-slate-500">Belum ada kegiatan yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => {
              const thumbnailSrc = activity.thumbnail_url || activity.photos_urls?.[0];
              return (
                <Link
                  key={activity.id}
                  href={`/kegiatan/${activity.id}`}
                  className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {/* Foto */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    {thumbnailSrc ? (
                      <Image
                        src={thumbnailSrc}
                        alt={activity.title}
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

                {/* Konten */}
                <div className="p-5">
                  {activity.event_date && (
                    <span className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(activity.event_date)}
                    </span>
                  )}
                  <h2 className="text-base font-bold text-[#0F172A] transition-colors duration-300 group-hover:text-[#1E3A8A]">
                    {activity.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {activity.description}
                  </p>

                  <span className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
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
