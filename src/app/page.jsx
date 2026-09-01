import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Users, FolderKanban, Folder, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { InteractiveHoverButton } from '../components/ui/InteractiveHoverButton';

// ISR: cache 60 detik. Beranda tidak perlu di-generate ulang di setiap
// request karena proker terbaru & status oprec tidak berubah tiap detik.
export const revalidate = 60;

// Fallback dummy data jika Supabase kosong / belum terkoneksi
const FALLBACK_PROJECTS = [
  {
    id: 'dummy-1',
    title: 'Seminar Nasional Kepemimpinan',
    division_name: 'BPH',
    background: 'Seminar nasional yang menghadirkan para pemimpin inspiratif untuk berbagi pengalaman kepada mahasiswa Teknologi Informasi Cikarang.',
    photos_urls: [],
  },
  {
    id: 'dummy-2',
    title: 'Pelatihan Desain & Media Kreatif',
    division_name: 'KOMINFO',
    background: 'Program pelatihan intensif di bidang desain grafis dan media kreatif untuk memperkuat kapasitas mahasiswa dalam komunikasi visual.',
    photos_urls: [],
  },
  {
    id: 'dummy-3',
    title: 'Riset Kepuasan Mahasiswa',
    division_name: 'LITBANG',
    background: 'Riset mendalam tentang kepuasan mahasiswa terhadap layanan akademik dan organisasi untuk mendorong perbaikan yang berkelanjutan.',
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

// Fallback dummy data kegiatan
const FALLBACK_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'Bagi-Bagi Takjil Ramadhan',
    description:
      'HMTI Cikarang membagikan ratusan paket takjil kepada masyarakat sekitar kampus sebagai wujud kepedulian di bulan suci Ramadhan.',
    event_date: '2025-03-15',
    photos_urls: [],
  },
  {
    id: 'act-2',
    title: 'Buka Bersama Keluarga Besar HMTI',
    description:
      'Acara buka puasa bersama seluruh anggota, alumni, dan keluarga besar HMTI Cikarang untuk mempererat tali silaturahmi.',
    event_date: '2025-03-20',
    photos_urls: [],
  },
  {
    id: 'act-3',
    title: 'Penggalangan Dana untuk NTT',
    description:
      'HMTI Cikarang menggalang dana dan menyalurkan bantuan kepada korban bencana di Nusa Tenggara Timur.',
    event_date: '2025-04-05',
    photos_urls: [],
  },
];

async function getLatestActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('id, title, description, event_date, photos_urls')
    .order('event_date', { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) return FALLBACK_ACTIVITIES;
  return data;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function HomePage() {
  const [oprecOpen, projects, activities] = await Promise.all([
    getOprecStatus(),
    getLatestProjects(),
    getLatestActivities(),
  ]);

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
            {/* Pill Badge */}

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Himpunan Mahasiswa
              <span className="block text-slate-300">Teknologi Informasi Cikarang</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Website resmi Himpunan Mahasiswa Teknologi Informasi (HMTI) Universitas Bina Sarana Informatika Cikarang sebagai pusat informasi organisasi, kegiatan, program kerja, dan aspirasi mahasiswa.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/proker">
                <InteractiveHoverButton
                  text="Jelajahi Proker"
                  className="border-white bg-white text-[#0F172A] shadow-lg"
                />
              </Link>
              {oprecOpen && (
                <Link href="/oprec">
                  <InteractiveHoverButton text="Daftar Open Recruitment" />
                </Link>
              )}
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

      {/* GALERI KEGIATAN */}
      <section className="bg-slate-50/50 border-t border-slate-100 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
                <Folder className="h-3.5 w-3.5" />
                Kegiatan Sosial & Komunitas
              </span>
              <h2 className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl">
                Galeri Kegiatan Terkini
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-500">
                Kegiatan sosial dan kemasyarakatan yang kami laksanakan di luar program kerja resmi — wujud nyata kepedulian HMTI Cikarang.
              </p>
            </div>
            <Link
              href="/kegiatan"
              className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#1E3A8A] hover:text-[#0F172A]"
            >
              Lihat Semua Kegiatan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/kegiatan/${activity.id}`}
                className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {activity.photos_urls?.[0] ? (
                    <Image
                      src={activity.photos_urls[0]}
                      alt={activity.title}
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
                  {activity.event_date && (
                    <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(activity.event_date)}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors">
                    {activity.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{activity.description}</p>
                  <span className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                    Lihat Detail
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
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
                Kenali visi, misi, dan struktur organisasi kami untuk memahami lebih dalam semangat yang menggerakkan HMTI Cikarang.
              </p>
            </div>
          </div>
          <Link href="/tentang">
            <InteractiveHoverButton
              text="Tentang Kami"
              className="border-white bg-white text-[#0F172A]"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
