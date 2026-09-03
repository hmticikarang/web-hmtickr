import { supabase } from '@/lib/supabaseClient';
import StrukturFilter from '@/components/StrukturFilter';

export const metadata = {
  title: 'Struktur Organisasi | Himpunan Mahasiswa',
};

// ISR: halaman ini di-generate ulang paling sering tiap 5 menit,
// bukan di setiap request -> jauh lebih ringan untuk trafik publik.
export const revalidate = 300;

// Data pengurus HMTI Cikarang
const FALLBACK_OFFICERS = [
  // BPH
  { id: 'h1', full_name: 'Fathir Muhammad Pachruzi', position: 'Ketua Cabang', division_name: 'BPH', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h2', full_name: 'Muhammad Farel Baarikil', position: 'Wakil Ketua Cabang', division_name: 'BPH', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h3', full_name: 'Lintang Aulia Ramadani', position: 'Sekertaris', division_name: 'BPH', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h4', full_name: 'Alifa Azka Aqmarina', position: 'Bendahara', division_name: 'BPH', photo_url: null, linkedin_url: null, instagram_url: null },

  // PSDM
  { id: 'h5', full_name: 'Arifin', position: 'Ketua Divisi', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h6', full_name: 'Rifqy Ardian Adinata', position: 'Wakil Ketua Divisi', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h7', full_name: 'Muhammad Raihan Aulia', position: 'Anggota', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h8', full_name: 'Feren Olivia', position: 'Anggota', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h9', full_name: 'Davina Azizah Melandri', position: 'Anggota', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h10', full_name: 'Muhammad Afif Zulfanshar', position: 'Anggota', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h11', full_name: 'Cheril Aprilia Putri', position: 'Anggota', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h12', full_name: 'Fitria Haryani', position: 'Anggota', division_name: 'PSDM', photo_url: null, linkedin_url: null, instagram_url: null },

  // KOMINFO
  { id: 'h13', full_name: 'Nandira Nurul Mustopa', position: 'Ketua Divisi', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h14', full_name: 'Andrew Setiawan', position: 'Wakil Ketua Divisi', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h15', full_name: 'Nabila Mutiara Ramadhani', position: 'Anggota', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h16', full_name: 'Anthoni Firmansyah Putra', position: 'Anggota', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h17', full_name: 'Aisyah Nurwahyu Khoirunnisa', position: 'Anggota', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h18', full_name: 'Muhammad Rasyad', position: 'Anggota', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h19', full_name: 'Muhammad Aditya Ramdani', position: 'Anggota', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h20', full_name: 'Maurucio Rafael', position: 'Anggota', division_name: 'KOMINFO', photo_url: null, linkedin_url: null, instagram_url: null },

  // LITBANG
  { id: 'h21', full_name: 'Hibban As Salafi', position: 'Ketua Divisi', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h22', full_name: 'Reza Mahendra', position: 'Wakil Ketua Divisi', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h23', full_name: 'Dicky Eka Prasetya', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h24', full_name: 'Mursid Kadafi', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h25', full_name: 'Muhammad Faris Aprizal', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h26', full_name: 'Noufal Rizqullah Pratama', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h27', full_name: 'Moh Nizuar Zulmi', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h28', full_name: 'Fathir Rasyad', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h29', full_name: 'Ghaza Abdilah Al Ghifary', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
  { id: 'h30', full_name: 'Wildan Abdu Rachman', position: 'Anggota', division_name: 'LITBANG', photo_url: null, linkedin_url: null, instagram_url: null },
];

const DIVISION_ORDER = {
  BPH: 1,
  PSDM: 2,
  KOMINFO: 3,
  LITBANG: 4,
};

function getDivisionRank(divisionName = '') {
  const name = divisionName.toUpperCase().trim();
  return DIVISION_ORDER[name] ?? 99;
}

function getPositionRank(position = '') {
  const pos = position.toLowerCase().trim();

  // 1: Ketua / Ketua Cabang / Ketua Divisi
  if (pos.includes('ketua') && !pos.includes('wakil')) {
    return 1;
  }
  // 2: Wakil Ketua / Wakil Ketua Cabang / Wakil Ketua Divisi
  if (pos.includes('wakil')) {
    return 2;
  }
  // 3: Sekretaris / Sekertaris / Bendahara
  if (pos.includes('sekretaris') || pos.includes('sekertaris') || pos.includes('bendahara')) {
    return 3;
  }
  // 4: Anggota / Staff
  if (pos.includes('anggota') || pos.includes('staff')) {
    return 4;
  }

  return 5;
}

function sortOfficers(officersList) {
  if (!Array.isArray(officersList)) return [];

  return [...officersList].sort((a, b) => {
    // 1. Urutan kelompok divisi (Khusus 'Semua' & hirarki antar divisi)
    const divRankA = getDivisionRank(a.division_name);
    const divRankB = getDivisionRank(b.division_name);
    if (divRankA !== divRankB) {
      return divRankA - divRankB;
    }

    // 2. Hierarki posisi / jabatan
    const posRankA = getPositionRank(a.position);
    const posRankB = getPositionRank(b.position);
    if (posRankA !== posRankB) {
      return posRankA - posRankB;
    }

    return (a.full_name || '').localeCompare(b.full_name || '');
  });
}

async function getOfficers() {
  const { data, error } = await supabase
    .from('officers')
    .select('id, full_name, position, photo_url, linkedin_url, instagram_url, divisions(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return sortOfficers(FALLBACK_OFFICERS);

  const mapped = data.map((o) => ({
    id: o.id,
    full_name: o.full_name,
    position: o.position,
    division_name: o.divisions?.name || 'BPH',
    photo_url: o.photo_url,
    linkedin_url: o.linkedin_url,
    instagram_url: o.instagram_url,
  }));

  return sortOfficers(mapped);
}

export default async function StrukturPage() {
  const officers = await getOfficers();

  return (
    <div>
      {/* HEADER */}
      <section className="bg-[#0F172A] py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Struktur Organisasi
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Jajaran Pengurus Himpunan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            Kenali para pengurus HMTI Cikarang periode 2025/2026 yang berdedikasi melayani
            dan memajukan seluruh mahasiswa Teknologi Informasi.
          </p>
        </div>
      </section>

      {/* Filter tab & grid pengurus (interaktif, di-hydrate sebagai island kecil) */}
      <StrukturFilter officers={officers} />
    </div>
  );
}
