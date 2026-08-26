'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Users,
  Lock,
  CheckCircle2,
  Download,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// QRCodeCanvas render ke DOM biasa lewat react-dom, jadi aman dibungkus
// next/dynamic (Suspense) seperti biasa — hanya di-load setelah submit berhasil.
const QRCodeCanvas = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeCanvas),
  { ssr: false }
);

// CATATAN PENTING: PDFDownloadLink & OprecPDFDocument SENGAJA TIDAK dibungkus
// next/dynamic. @react-pdf/renderer punya reconciler custom sendiri (bukan
// react-dom) untuk merender pohon <Document>/<Page> jadi file PDF, dan itu
// tidak menjamin kompatibel dengan komponen yang dibungkus Suspense/lazy.
// Sebagai gantinya, kedua modul di-load manual lewat import() di dalam
// useEffect (lihat di bawah) — hasilnya tetap code-split (baru diunduh
// browser setelah submit berhasil), tapi dirender sebagai komponen biasa
// begitu modulnya selesai dimuat, jadi 100% aman untuk react-pdf.

const MAJORS = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Elektro',
  'Manajemen',
  'Akuntansi',
  'Ilmu Komunikasi',
  'Psikologi',
  'Hukum',
];

const COHORTS = ['2023', '2024', '2025', '2026'];

const FALLBACK_DIVISIONS = [
  { id: 'fallback-1', name: 'Media & Informasi' },
  { id: 'fallback-2', name: 'Penelitian & Pengembangan' },
  { id: 'fallback-3', name: 'Hubungan Masyarakat' },
  { id: 'fallback-4', name: 'Acara & Kegiatan' },
];

function PdfButtonSkeleton() {
  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      Menyiapkan dokumen PDF...
    </div>
  );
}

function formatWhatsApp(value) {
  // Hanya angka, lalu format ringan (tidak strict, cukup bersihkan karakter non-digit)
  return value.replace(/[^\d+]/g, '');
}

export default function OprecPage() {
  const [oprecOpen, setOprecOpen] = useState(null); // null = loading
  const [divisions, setDivisions] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    nim: '',
    email: '',
    phone_wa: '',
    major: '',
    cohort: '',
    choice_div_1: '',
    choice_div_2: '',
    motivation: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedApplicant, setSubmittedApplicant] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const qrCanvasRef = useRef(null);
  // Menyimpan referensi module @react-pdf/renderer & OprecPDFDocument setelah
  // berhasil di-import secara dinamis (lihat useEffect di bawah).
  const [pdfModules, setPdfModules] = useState(null);

  // Cek status oprec & ambil daftar divisi
  useEffect(() => {
    async function init() {
      const [{ data: settingData }, { data: divisionData, error: divisionError }] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'oprec_status').single(),
        supabase.from('divisions').select('id, name').order('name', { ascending: true }),
      ]);

      setOprecOpen(settingData?.value === 'open');

      if (divisionError || !divisionData || divisionData.length === 0) {
        setDivisions(FALLBACK_DIVISIONS);
      } else {
        setDivisions(divisionData.filter((d) => d.name.toUpperCase() !== 'BPH'));
      }
      setLoadingDivisions(false);
    }

    init();
  }, []);

  // Setelah submittedApplicant tersedia, generate QR code jadi data URL untuk PDF.
  // QRCodeCanvas di-load secara dinamis (lihat import di atas), jadi kita poll
  // singkat sampai elemen <canvas>-nya benar-benar muncul di DOM.
  useEffect(() => {
    if (!submittedApplicant) return;

    let cancelled = false;
    let attempts = 0;

    function tryCapture() {
      if (cancelled) return;
      const canvas = qrCanvasRef.current?.querySelector('canvas');
      if (canvas) {
        setQrDataUrl(canvas.toDataURL('image/png'));
      } else if (attempts < 20) {
        attempts += 1;
        setTimeout(tryCapture, 100);
      }
    }

    tryCapture();
    return () => {
      cancelled = true;
    };
  }, [submittedApplicant]);

  // Load @react-pdf/renderer & OprecPDFDocument secara dinamis begitu
  // pendaftaran berhasil — sebelum itu, kedua modul ini belum pernah
  // diunduh browser sama sekali (lihat catatan di bagian import atas).
  useEffect(() => {
    if (!submittedApplicant) return;

    let cancelled = false;

    Promise.all([import('@react-pdf/renderer'), import('@/components/OprecPDFDocument')]).then(
      ([reactPdfModule, documentModule]) => {
        if (cancelled) return;
        setPdfModules({
          PDFDownloadLink: reactPdfModule.PDFDownloadLink,
          OprecPDFDocument: documentModule.default,
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [submittedApplicant]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone_wa' ? formatWhatsApp(value) : value,
    }));
  }

  function validateForm() {
    if (!formData.full_name.trim()) return 'Nama lengkap wajib diisi.';
    if (!formData.nim.trim()) return 'NIM wajib diisi.';
    if (!formData.email.trim()) return 'Email wajib diisi.';
    if (!formData.phone_wa.trim()) return 'Nomor WhatsApp wajib diisi.';
    if (!formData.major) return 'Program studi wajib dipilih.';
    if (!formData.cohort) return 'Angkatan wajib dipilih.';
    if (!formData.choice_div_1) return 'Divisi utama (Pilihan 1) wajib dipilih.';
    if (!formData.motivation.trim()) return 'Motivasi wajib diisi.';
    return null;
  }

  async function generateAppNumber() {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('applicants')
      .select('id', { count: 'exact', head: true })
      .like('app_number', `OPREC-${year}-%`);

    const nextNumber = (count || 0) + 1;
    const padded = String(nextNumber).padStart(3, '0');
    return `OPREC-${year}-${padded}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const app_number = await generateAppNumber();

      const payload = {
        app_number,
        full_name: formData.full_name.trim(),
        nim: formData.nim.trim(),
        email: formData.email.trim(),
        phone_wa: formData.phone_wa.trim(),
        major: formData.major,
        cohort: formData.cohort,
        choice_div_1: formData.choice_div_1.startsWith('fallback') ? null : formData.choice_div_1,
        choice_div_2:
          formData.choice_div_2 && !formData.choice_div_2.startsWith('fallback')
            ? formData.choice_div_2
            : null,
        motivation: formData.motivation.trim(),
      };

      const { data, error } = await supabase.from('applicants').insert(payload).select().single();

      if (error) throw error;

      setSubmittedApplicant({
        ...data,
        // simpan nama divisi untuk ditampilkan di PDF (karena kita hanya punya UUID)
        divisionNames: {
          choice1: divisions.find((d) => d.id === formData.choice_div_1)?.name,
          choice2: divisions.find((d) => d.id === formData.choice_div_2)?.name,
        },
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat mengirim pendaftaran. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================================
  // LOADING STATE
  // =====================================================================
  if (oprecOpen === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  // =====================================================================
  // OPREC CLOSED STATE
  // =====================================================================
  if (!oprecOpen && !submittedApplicant) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 rounded-full bg-[#0F172A]/5 p-5">
          <Lock className="h-10 w-10 text-[#0F172A]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
          Pendaftaran Sedang Ditutup
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    );
  }

  // =====================================================================
  // SUCCESS STATE
  // =====================================================================
  if (submittedApplicant) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mb-6 inline-flex rounded-full bg-emerald-50 p-5">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
          Pendaftaran Berhasil!
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
          Terima kasih, <strong>{submittedApplicant.full_name}</strong>. Nomor pendaftaran kamu
          adalah:
        </p>
        <div className="mx-auto mt-4 inline-block rounded-xl bg-[#0F172A] px-6 py-3">
          <span className="text-lg font-bold tracking-wide text-white">
            {submittedApplicant.app_number}
          </span>
        </div>
        <p className="mt-4 text-xs text-slate-400 sm:text-sm">
          Unduh bukti pendaftaran di bawah ini dan simpan baik-baik untuk keperluan sesi
          interview.
        </p>

        {/* Hidden QR canvas untuk digenerate jadi image di dalam PDF */}
        <div ref={qrCanvasRef} className="hidden">
          <QRCodeCanvas value={submittedApplicant.app_number} size={200} level="H" />
        </div>

        <div className="mt-8">
          {qrDataUrl && pdfModules ? (
            <pdfModules.PDFDownloadLink
              document={
                <pdfModules.OprecPDFDocument
                  applicant={submittedApplicant}
                  divisionNames={submittedApplicant.divisionNames}
                  qrDataUrl={qrDataUrl}
                />
              }
              fileName={`Bukti-Pendaftaran-${submittedApplicant.app_number}.pdf`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1E3A8A]"
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyiapkan PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Unduh Bukti Pendaftaran (PDF)
                  </>
                )
              }
            </pdfModules.PDFDownloadLink>
          ) : (
            <PdfButtonSkeleton />
          )}
        </div>
      </div>
    );
  }

  // =====================================================================
  // FORM STATE
  // =====================================================================
  return (
    <div>
      <section className="bg-[#0F172A] py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-slate-200">
            <Users className="h-3.5 w-3.5" />
            Pendaftaran Terbuka
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Open Recruitment Himpunan Mahasiswa
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          {/* DATA PERSONAL */}
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#1E3A8A]">
            Data Personal
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Sesuai KTM"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                NIM <span className="text-red-500">*</span>
              </label>
              <input
                name="nim"
                type="text"
                value={formData.nim}
                onChange={handleChange}
                placeholder="Nomor Induk Mahasiswa"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                No. WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                name="phone_wa"
                type="text"
                value={formData.phone_wa}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                >
                  <option value="">Pilih Prodi</option>
                  {MAJORS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Angkatan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="cohort"
                  value={formData.cohort}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                >
                  <option value="">Pilih Angkatan</option>
                  {COHORTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* PILIHAN DIVISI */}
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#1E3A8A]">
            Pilihan Divisi
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Divisi Utama (Wajib) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="choice_div_1"
                value={formData.choice_div_1}
                onChange={handleChange}
                disabled={loadingDivisions}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 disabled:opacity-60"
              >
                <option value="">Pilih Divisi</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Divisi Opsi 2 <span className="font-normal text-slate-400">(Opsional)</span>
            </label>
            <div className="relative">
              <select
                name="choice_div_2"
                value={formData.choice_div_2}
                onChange={handleChange}
                disabled={loadingDivisions}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 disabled:opacity-60"
              >
                <option value="">Pilih Divisi</option>
                {divisions
                  .filter((d) => d.id !== formData.choice_div_1)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* MOTIVASI */}
          <div className="mb-7">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Motivasi / Alasan Pilihan Divisi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="motivation"
              rows={6}
              value={formData.motivation}
              onChange={handleChange}
              placeholder="Ceritakan alasan dan motivasimu bergabung dengan divisi pilihanmu..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim Pendaftaran...
              </>
            ) : (
              'Kirim Pendaftaran'
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
