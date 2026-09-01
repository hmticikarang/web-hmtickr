import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, Tag, ImageOff, ImageIcon, FolderKanban } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 300;

const FALLBACK_PROJECTS = {
  'dummy-1': {
    id: 'dummy-1',
    title: 'Seminar Nasional Kepemimpinan',
    division_name: 'BPH',
    description:
      'Seminar nasional yang menghadirkan para pemimpin inspiratif untuk berbagi pengalaman dan wawasan kepemimpinan kepada mahasiswa Teknologi Informasi Cikarang.',
    event_date: '2025-05-10',
    photos_urls: [],
  },
  'dummy-2': {
    id: 'dummy-2',
    title: 'Pelatihan Desain & Media Kreatif',
    division_name: 'KOMINFO',
    description:
      'Program pelatihan intensif di bidang desain grafis dan media kreatif untuk memperkuat kapasitas visual dan komunikasi digital mahasiswa.',
    event_date: '2025-06-15',
    photos_urls: [],
  },
  'dummy-3': {
    id: 'dummy-3',
    title: 'Riset Kepuasan Mahasiswa',
    division_name: 'LITBANG',
    description:
      'Riset mendalam tentang kepuasan mahasiswa terhadap layanan akademik dan organisasi untuk mendorong perbaikan yang berkelanjutan.',
    event_date: '2025-07-20',
    photos_urls: [],
  },
  'dummy-4': {
    id: 'dummy-4',
    title: 'Pelatihan Pengembangan Diri Anggota',
    division_name: 'PSDM',
    description:
      'Kegiatan pembekalan soft skill dan pelatihan kepemimpinan internal untuk mengembangkan potensi seluruh anggota himpunan.',
    event_date: '2025-08-05',
    photos_urls: [],
  },
};

async function getProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, event_date, background, achievements, photos_urls, division_id, divisions(name)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return FALLBACK_PROJECTS[id] || null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description || data.background || '',
    event_date: data.event_date,
    photos_urls: data.photos_urls || [],
    division_name: data.divisions?.name || 'Umum',
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
  const proker = await getProject(id);
  if (!proker) return { title: 'Program Kerja Tidak Ditemukan | HMTI Cikarang' };
  return {
    title: `${proker.title} | HMTI Cikarang`,
    description: proker.description?.slice(0, 160),
  };
}

export default async function ProkerDetailPage({ params }) {
  const { id } = await params;
  const proker = await getProject(id);

  if (!proker) notFound();

  const mainPhoto = proker.photos_urls?.[0];

  return (
    <div>
      {/* HEADER */}
      <section className="bg-[#0F172A] py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/proker"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Katalog Proker
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
            {proker.title}
          </h1>

          {proker.event_date && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>{formatDate(proker.event_date)}</span>
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
                alt={proker.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] max-h-[350px] w-full flex-col items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-8 text-center">
              <FolderKanban className="mb-3 h-14 w-14 text-white/30" />
              <p className="text-sm font-medium text-slate-300">Foto utama proker belum diunggah</p>
            </div>
          )}
        </div>

        {/* DESKRIPSI PROGRAM KERJA */}
        <div className="mb-10 rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#1E3A8A]/10 p-2.5">
              <FileText className="h-5 w-5 text-[#1E3A8A]" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Deskripsi Program Kerja</h2>
          </div>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 sm:text-base whitespace-pre-line">
            {proker.description}
          </div>
        </div>

        {/* GALERI FOTO PROKER */}
        <div>
          <div className="mb-5 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-bold text-[#0F172A]">Dokumentasi Foto Program Kerja</h2>
          </div>

          {proker.photos_urls && proker.photos_urls.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {proker.photos_urls.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-sm"
                >
                  <Image
                    src={url}
                    alt={`Dokumentasi ${proker.title} foto ${idx + 1}`}
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
              <p className="text-sm text-slate-400">Belum ada galeri foto dokumentasi untuk program kerja ini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
