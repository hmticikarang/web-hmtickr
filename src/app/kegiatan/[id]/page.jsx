import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, Folder, ImageOff, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FALLBACK_ACTIVITIES = {
  'dummy-1': {
    id: 'dummy-1',
    title: 'Bagi-Bagi Takjil Ramadhan',
    description:
      'HMTI Cikarang membagikan ratusan paket takjil gratis kepada masyarakat, pengendara, dan warga sekitar kampus sebagai bentuk kepedulian sosial di bulan suci Ramadhan. Kegiatan ini bertujuan mempererat hubungan antara mahasiswa Teknologi Informasi Cikarang dan warga sekitar, serta menumbuhkan rasa empati dan semangat berbagi.',
    event_date: '2025-03-15',
    photos_urls: [],
  },
  'act-1': {
    id: 'act-1',
    title: 'Bagi-Bagi Takjil Ramadhan',
    description:
      'HMTI Cikarang membagikan ratusan paket takjil gratis kepada masyarakat, pengendara, dan warga sekitar kampus sebagai bentuk kepedulian sosial di bulan suci Ramadhan. Kegiatan ini bertujuan mempererat hubungan antara mahasiswa Teknologi Informasi Cikarang dan warga sekitar, serta menumbuhkan rasa empati dan semangat berbagi.',
    event_date: '2025-03-15',
    photos_urls: [],
  },
  'dummy-2': {
    id: 'dummy-2',
    title: 'Buka Bersama Keluarga Besar HMTI',
    description:
      'Acara kebersamaan dan buka puasa bersama seluruh pengurus, anggota, alumnus, dan pembina HMTI Cikarang. Momen ini dimanfaatkan untuk mempererat tali silaturahmi, berbagi pengalaman seputar dunia perkuliahan dan karir, serta memperkuat solidaritas antar angkatan.',
    event_date: '2025-03-20',
    photos_urls: [],
  },
  'act-2': {
    id: 'act-2',
    title: 'Buka Bersama Keluarga Besar HMTI',
    description:
      'Acara kebersamaan dan buka puasa bersama seluruh pengurus, anggota, alumnus, dan pembina HMTI Cikarang. Momen ini dimanfaatkan untuk mempererat tali silaturahmi, berbagi pengalaman seputar dunia perkuliahan dan karir, serta memperkuat solidaritas antar angkatan.',
    event_date: '2025-03-20',
    photos_urls: [],
  },
  'dummy-3': {
    id: 'dummy-3',
    title: 'Penggalangan Dana untuk NTT',
    description:
      'HMTI Cikarang menggelar aksi tanggap bencana dan penggalangan dana dari mahasiswa dan masyarakat umum untuk membantu korban bencana alam di Nusa Tenggara Timur (NTT). Seluruh donasi yang terkumpul disalurkan secara langsung melalui lembaga penyalur bantuan terpercaya.',
    event_date: '2025-04-05',
    photos_urls: [],
  },
  'act-3': {
    id: 'act-3',
    title: 'Penggalangan Dana untuk NTT',
    description:
      'HMTI Cikarang menggelar aksi tanggap bencana dan penggalangan dana dari mahasiswa dan masyarakat umum untuk membantu korban bencana alam di Nusa Tenggara Timur (NTT). Seluruh donasi yang terkumpul disalurkan secara langsung melalui lembaga penyalur bantuan terpercaya.',
    event_date: '2025-04-05',
    photos_urls: [],
  },
};

async function getActivity(id) {
  const { data, error } = await supabase
    .from('activities')
    .select('id, title, description, event_date, photos_urls, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    if (FALLBACK_ACTIVITIES[id]) {
      return FALLBACK_ACTIVITIES[id];
    }
    notFound();
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    event_date: data.event_date,
    photos_urls: data.photos_urls || [],
  };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) return { title: 'Kegiatan Tidak Ditemukan | HMTI Cikarang' };
  return {
    title: `${activity.title} | HMTI Cikarang`,
    description: activity.description?.slice(0, 160),
  };
}

export default async function KegiatanDetailPage({ params }) {
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) notFound();

  const mainPhoto = activity.photos_urls?.[0];
  const additionalPhotos = activity.photos_urls?.slice(1) || [];

  return (
    <div>
      {/* HEADER */}
      <section className="bg-[#0F172A] py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/kegiatan"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Galeri Kegiatan
          </Link>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <Folder className="h-3 w-3 text-blue-400" />
              Kegiatan Sosial & Komunitas
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
            {activity.title}
          </h1>

          {activity.event_date && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>{formatDate(activity.event_date)}</span>
            </div>
          )}
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* GAMBAR UTAMA */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-md">
          {mainPhoto ? (
            <div className="relative aspect-[16/9] w-full max-h-[440px] overflow-hidden">
              <Image
                src={mainPhoto}
                alt={activity.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] max-h-[350px] w-full flex-col items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-8 text-center">
              <Folder className="mb-3 h-14 w-14 text-white/30" />
              <p className="text-sm font-medium text-slate-300">Dokumentasi foto utama belum diunggah</p>
            </div>
          )}
        </div>

        {/* DESKRIPSI LENGKAP */}
        <div className="mb-10 rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#1E3A8A]/10 p-2.5">
              <FileText className="h-5 w-5 text-[#1E3A8A]" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Deskripsi Kegiatan</h2>
          </div>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 sm:text-base whitespace-pre-line">
            {activity.description}
          </div>
        </div>

        {/* DOKUMENTASI FOTO TAMBAHAN */}
        <div>
          <div className="mb-5 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-bold text-[#0F172A]">Dokumentasi Foto Kegiatan</h2>
          </div>

          {activity.photos_urls && activity.photos_urls.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activity.photos_urls.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-sm"
                >
                  <Image
                    src={url}
                    alt={`Dokumentasi ${activity.title} foto ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
                    <span className="text-xs font-semibold text-white">Foto #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
              <ImageOff className="mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-400">Belum ada galeri dokumentasi foto tambahan.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
