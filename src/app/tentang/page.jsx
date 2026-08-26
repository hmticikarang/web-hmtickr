import { Target, Eye, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Tentang Kami | HMTI Cikarang',
};

// ISR: konten statis, cache lebih lama karena jarang berubah
export const revalidate = 3600;

const KARAKTERISTIK_VISI = [
  {
    label: 'Unggul',
    desc: 'Menjadi yang terbaik di bidang Teknologi Informasi.',
  },
  {
    label: 'Inovatif',
    desc: 'Mengembangkan ide-ide baru dan kreatif.',
  },
  {
    label: 'Berdampak Positif',
    desc: 'Memberikan manfaat nyata bagi masyarakat.',
  },
];

const MISI_LIST = [
  'Meningkatkan kemampuan dan pengetahuan anggota dalam bidang Teknologi Informasi.',
  'Membangun komunitas yang solid dan kreatif.',
  'Meningkatkan kesadaran dan partisipasi mahasiswa dalam pengembangan Teknologi Informasi.',
  'Membuat kontribusi positif bagi masyarakat melalui pengembangan Teknologi Informasi.',
];

export default function TentangPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="bg-[#0F172A] py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Tentang Kami
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Mengenal Lebih Dekat HMTI Cikarang
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            Himpunan Mahasiswa Teknologi Informasi yang unggul, inovatif, dan berdampak positif
            bagi masyarakat.
          </p>
        </div>
      </section>

      {/* VISI */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
              Arah Organisasi
            </span>
            <h2 className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl">Visi</h2>
          </div>

          {/* Visi Statement */}
          <div className="rounded-2xl bg-[#0F172A] p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 inline-flex rounded-xl bg-white/10 p-3">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <p className="text-base font-semibold uppercase leading-relaxed tracking-wide text-white sm:text-lg">
              "Menjadi Organisasi Mahasiswa Teknologi Informasi yang Unggul, Inovatif dan
              Berdampak Positif bagi Masyarakat"
            </p>
          </div>

          {/* 3 Karakteristik Visi */}
          <div className="mt-8">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
              3 Karakteristik Visi
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {KARAKTERISTIK_VISI.map(({ label, desc }, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-6 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E3A8A] text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[#0F172A]">
                      {label}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISI */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
              Langkah Nyata
            </span>
            <h2 className="mt-2 text-2xl font-bold text-[#0F172A] sm:text-3xl">Misi</h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-5 inline-flex rounded-xl bg-[#0F172A] p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <ul className="space-y-4">
              {MISI_LIST.map((misi, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1E3A8A]" />
                  <span className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {misi}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
