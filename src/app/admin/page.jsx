'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LogOut,
  Users,
  FolderKanban,
  MessageSquareHeart,
  Search,
  Download,
  UserCheck,
  Calendar,
  Loader2,
  Plus,
  Image as ImageIcon,
  Trash2,
  User,
  Pencil,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import LoginForm from '@/components/admin/LoginForm';
import InterviewModal from '@/components/admin/InterviewModal';

const STATUS_COLORS = {
  Pending: 'bg-slate-100 text-slate-600',
  Interview: 'bg-amber-100 text-amber-700',
  Lolos: 'bg-emerald-100 text-emerald-700',
  'Tidak Lolos': 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['Pending', 'Interview', 'Lolos', 'Tidak Lolos'];

const TABS = [
  { key: 'pendaftar', label: 'Pendaftar Oprec', icon: Users },
  { key: 'cms', label: 'CMS Proker & Pengurus', icon: FolderKanban },
  { key: 'aspirasi', label: 'Inbox Aspirasi', icon: MessageSquareHeart },
];

// Helper untuk fetch dengan header sesi admin
function authFetch(session, url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'x-admin-email': session.email,
    },
  });
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('pendaftar');
  const [oprecStatus, setOprecStatus] = useState('closed');
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Restore session dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin_session');
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem('admin_session');
      }
    }
    setCheckingSession(false);
  }, []);

  // Ambil status oprec saat ini
  useEffect(() => {
    if (!session) return;
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setOprecStatus(data.oprec_status || 'closed'))
      .catch(() => { });
  }, [session]);

  async function handleToggleOprec() {
    setTogglingStatus(true);
    const newStatus = oprecStatus === 'open' ? 'closed' : 'open';
    try {
      const res = await authFetch(session, '/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oprec_status: newStatus }),
      });
      if (res.ok) setOprecStatus(newStatus);
    } finally {
      setTogglingStatus(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_session');
    setSession(null);
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  if (!session) {
    return <LoginForm onLoginSuccess={setSession} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* TOP BAR */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Masuk sebagai {session.email}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Toggle Oprec */}
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-4 py-2">
              <span className="text-xs font-semibold text-slate-600">
                Oprec {oprecStatus === 'open' ? 'Dibuka' : 'Ditutup'}
              </span>
              <button
                onClick={handleToggleOprec}
                disabled={togglingStatus}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${oprecStatus === 'open' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${oprecStatus === 'open' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.key
                  ? 'border-[#0F172A] text-[#0F172A]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'pendaftar' && <PendaftarTab session={session} />}
        {activeTab === 'cms' && <CmsTab session={session} />}
        {activeTab === 'aspirasi' && <AspirasiTab session={session} />}
      </div>
    </div>
  );
}

// =====================================================================
// TAB 1: MANAJEMEN PENDAFTAR OPREC
// =====================================================================
function PendaftarTab({ session }) {
  const [applicants, setApplicants] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [modalApplicant, setModalApplicant] = useState(null);
  const [convertingId, setConvertingId] = useState(null);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (divisionFilter) params.set('division', divisionFilter);

    const res = await authFetch(session, `/api/admin/applicants?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setApplicants(data.applicants || []);
    setLoading(false);
  }, [session, search, divisionFilter]);

  useEffect(() => {
    supabase
      .from('divisions')
      .select('id, name')
      .then(({ data }) => setDivisions(data || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchApplicants, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchApplicants]);

  async function updateApplicant(payload) {
    const res = await authFetch(session, '/api/admin/applicants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchApplicants();
      setModalApplicant(null);
    }
  }

  async function handleStatusChange(applicantId, newStatus) {
    await updateApplicant({ id: applicantId, status: newStatus });
  }

  async function handleConvertToOfficer(applicant) {
    if (!confirm(`Jadikan ${applicant.full_name} sebagai pengurus?`)) return;
    setConvertingId(applicant.id);
    const res = await authFetch(session, '/api/admin/convert-officer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicant_id: applicant.id, position: 'Anggota' }),
    });
    setConvertingId(null);
    if (res.ok) {
      alert(`${applicant.full_name} berhasil dijadikan pengurus.`);
      fetchApplicants();
    } else {
      const data = await res.json();
      alert(data.error || 'Gagal mengonversi pendaftar.');
    }
  }

  async function handleExportCsv() {
    // Load papaparse hanya saat tombol ini benar-benar diklik,
    // jadi library-nya tidak ikut memberatkan initial load dashboard.
    const { default: Papa } = await import('papaparse');

    const csvData = applicants.map((a) => ({
      'No. Pendaftaran': a.app_number,
      'Nama Lengkap': a.full_name,
      NIM: a.nim,
      Email: a.email,
      'No. WA': a.phone_wa,
      Prodi: a.major,
      Angkatan: a.cohort,
      'Divisi 1': a.div1?.name || '-',
      'Divisi 2': a.div2?.name || '-',
      Status: a.status,
      'Jadwal Interview': a.interview_datetime || '-',
      'Lokasi Interview': a.interview_location || '-',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pendaftar-oprec-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* FILTER BAR */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama/NIM..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
            />
          </div>
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
          >
            <option value="">Semua Divisi Utama</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">NIM</th>
              <th className="px-4 py-3">No. WA</th>
              <th className="px-4 py-3">Divisi 1/2</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Interview</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : applicants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Belum ada pendaftar.
                </td>
              </tr>
            ) : (
              applicants.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0F172A]">{a.full_name}</p>
                    <p className="text-xs text-slate-400">{a.app_number}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.nim}</td>
                  <td className="px-4 py-3 text-slate-600">{a.phone_wa}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {a.div1?.name || '-'} / {a.div2?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      className={`rounded-full border-none px-3 py-1 text-xs font-semibold outline-none ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {a.interview_datetime
                      ? new Date(a.interview_datetime).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModalApplicant(a)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                        title="Atur jadwal interview"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleConvertToOfficer(a)}
                        disabled={convertingId === a.id}
                        className="flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-60"
                        title="Jadikan Pengurus"
                      >
                        {convertingId === a.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5" />
                        )}
                        Jadikan Pengurus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalApplicant && (
        <InterviewModal
          applicant={modalApplicant}
          onClose={() => setModalApplicant(null)}
          onSave={updateApplicant}
        />
      )}
    </div>
  );
}

// =====================================================================
// TAB 2: CMS PROKER & PENGURUS
// =====================================================================
function CmsTab({ session }) {
  const [subTab, setSubTab] = useState('proker');

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSubTab('proker')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${subTab === 'proker' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-600'
            }`}
        >
          Program Kerja
        </button>
        <button
          onClick={() => setSubTab('pengurus')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${subTab === 'pengurus' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-600'
            }`}
        >
          Pengurus
        </button>
      </div>

      {subTab === 'proker' ? <ProkerCmsForm session={session} /> : <PengurusCmsForm session={session} />}
    </div>
  );
}

function ProkerCmsForm({ session }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProker, setEditingProker] = useState(null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ProkerAddForm
        session={session}
        editingProker={editingProker}
        setEditingProker={setEditingProker}
        onAdded={() => setRefreshKey((k) => k + 1)}
      />
      <ProkerList
        session={session}
        refreshKey={refreshKey}
        setEditingProker={setEditingProker}
        onDeleted={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

function ProkerAddForm({ session, editingProker, setEditingProker, onAdded }) {
  const [divisions, setDivisions] = useState([]);
  const [form, setForm] = useState({ title: '', background: '', achievements: '', division_id: '' });
  const [existingPhotos, setExistingPhotos] = useState([]); // array of URLs
  const [photos, setPhotos] = useState([]); // array of File
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    supabase
      .from('divisions')
      .select('id, name')
      .then(({ data }) => setDivisions(data || []));
  }, []);

  useEffect(() => {
    if (editingProker) {
      setForm({
        title: editingProker.title || '',
        background: editingProker.background || '',
        achievements: editingProker.achievements || '',
        division_id: editingProker.division_id || '',
      });
      setExistingPhotos(editingProker.photos_urls || []);
      setPhotos([]);
      setSuccessMsg('');
    } else {
      setForm({ title: '', background: '', achievements: '', division_id: '' });
      setExistingPhotos([]);
      setPhotos([]);
    }
  }, [editingProker]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePhotoSelect(e) {
    setPhotos(Array.from(e.target.files));
  }

  function handleRemoveExistingPhoto(urlToRemove) {
    setExistingPhotos((prev) => prev.filter((url) => url !== urlToRemove));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      // 1. Upload semua foto dulu
      setUploading(true);
      const uploadedUrls = [];
      for (const file of photos) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'projects');
        const res = await authFetch(session, '/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) uploadedUrls.push(data.url);
      }
      setUploading(false);

      const isEdit = !!editingProker;
      const url = '/api/admin/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const finalPhotosUrls = [...existingPhotos, ...uploadedUrls];

      const res = await authFetch(session, url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photos_urls: finalPhotosUrls, id: isEdit ? editingProker.id : undefined }),
      });

      if (res.ok) {
        setSuccessMsg(isEdit ? 'Proker berhasil diperbarui!' : 'Proker berhasil ditambahkan!');
        if (!isEdit) {
          setForm({ title: '', background: '', achievements: '', division_id: '' });
          setPhotos([]);
        } else {
          setEditingProker(null);
        }
        onAdded?.();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan data proker.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#0F172A]">
        {editingProker ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {editingProker ? 'Edit Program Kerja' : 'Tambah Program Kerja Baru'}
      </h3>

      {successMsg && (
        <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMsg}</div>
      )}

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Judul Proker</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Divisi Penanggung Jawab</label>
        <select
          name="division_id"
          value={form.division_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
        >
          <option value="">Pilih Divisi</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Latar Belakang</label>
        <textarea
          name="background"
          value={form.background}
          onChange={handleChange}
          required
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Capaian / Output</label>
        <textarea
          name="achievements"
          value={form.achievements}
          onChange={handleChange}
          required
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
        />
      </div>

      {editingProker && existingPhotos.length > 0 && (
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Foto Galeri Saat Ini</label>
          <div className="grid grid-cols-4 gap-2">
            {existingPhotos.map((url, idx) => (
              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingPhoto(url)}
                  className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <ImageIcon className="h-3.5 w-3.5" />
          {editingProker ? 'Tambah Foto Galeri Baru' : 'Foto Galeri'}
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoSelect}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F172A] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
        {photos.length > 0 && (
          <p className="mt-1.5 text-xs text-slate-500">{photos.length} foto dipilih</p>
        )}
      </div>

      <div className="flex gap-3">
        {editingProker && (
          <button
            type="button"
            onClick={() => setEditingProker(null)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? 'Mengunggah foto...' : saving ? 'Menyimpan...' : editingProker ? 'Update Proker' : 'Simpan Proker'}
        </button>
      </div>
    </form>
  );
}

function ProkerList({ session, refreshKey, setEditingProker, onDeleted }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    authFetch(session, '/api/admin/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, [session, refreshKey]);

  async function handleDelete(project) {
    if (!confirm(`Hapus proker "${project.title}"?`)) return;
    setDeletingId(project.id);
    const res = await authFetch(session, '/api/admin/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: project.id }),
    });
    setDeletingId(null);
    if (res.ok) {
      onDeleted?.();
    } else {
      const data = await res.json();
      alert(data.error || 'Gagal menghapus proker.');
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#0F172A]">
        <FolderKanban className="h-4 w-4" />
        Daftar Program Kerja ({projects.length})
      </h3>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#1E3A8A]" />
        </div>
      ) : projects.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">Belum ada proker terdaftar.</p>
      ) : (
        <ul className="max-h-[560px] space-y-2 overflow-y-auto animate-fadeIn">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {p.photos_urls?.[0] ? (
                    <img src={p.photos_urls[0]} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]">
                      <FolderKanban className="h-4 w-4 text-white/60" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{p.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {p.divisions?.name || 'Tanpa Divisi'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setEditingProker(p)}
                  className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Edit proker"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors"
                  title="Hapus proker"
                >
                  {deletingId === p.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PengurusCmsForm({ session }) {
  // refreshKey dipakai untuk memicu OfficersList fetch ulang setelah tambah/hapus,
  // tanpa perlu mengangkat seluruh state daftar pengurus ke sini.
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingOfficer, setEditingOfficer] = useState(null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PengurusAddForm
        session={session}
        editingOfficer={editingOfficer}
        setEditingOfficer={setEditingOfficer}
        onAdded={() => setRefreshKey((k) => k + 1)}
      />
      <OfficersList
        session={session}
        refreshKey={refreshKey}
        setEditingOfficer={setEditingOfficer}
        onDeleted={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

function PengurusAddForm({ session, editingOfficer, setEditingOfficer, onAdded }) {
  const [divisions, setDivisions] = useState([]);
  const [form, setForm] = useState({
    full_name: '',
    position: '',
    division_id: '',
    linkedin_url: '',
    instagram_url: '',
  });
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    supabase
      .from('divisions')
      .select('id, name')
      .then(({ data }) => setDivisions(data || []));
  }, []);

  useEffect(() => {
    if (editingOfficer) {
      setForm({
        full_name: editingOfficer.full_name || '',
        position: editingOfficer.position || '',
        division_id: editingOfficer.division_id || '',
        linkedin_url: editingOfficer.linkedin_url || '',
        instagram_url: editingOfficer.instagram_url || '',
      });
      setPhoto(null);
      setSuccessMsg('');
    } else {
      setForm({
        full_name: '',
        position: '',
        division_id: '',
        linkedin_url: '',
        instagram_url: '',
      });
      setPhoto(null);
    }
  }, [editingOfficer]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      let photo_url = editingOfficer ? editingOfficer.photo_url : null;
      if (photo) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', photo);
        fd.append('folder', 'officers');
        const res = await authFetch(session, '/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) photo_url = data.url;
        setUploading(false);
      }

      const isEdit = !!editingOfficer;
      const url = '/api/admin/officers';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...form, photo_url };
      if (isEdit) {
        payload.id = editingOfficer.id;
      }

      const res = await authFetch(session, url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(isEdit ? 'Pengurus berhasil diperbarui!' : 'Pengurus berhasil ditambahkan!');
        if (!isEdit) {
          setForm({ full_name: '', position: '', division_id: '', linkedin_url: '', instagram_url: '' });
          setPhoto(null);
        } else {
          setEditingOfficer(null);
        }
        onAdded?.();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan data pengurus.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#0F172A]">
        {editingOfficer ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {editingOfficer ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}
      </h3>

      {successMsg && (
        <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMsg}</div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Jabatan</label>
          <input
            name="position"
            value={form.position}
            onChange={handleChange}
            required
            placeholder="Ketua Cabang / Anggota / dsb."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Divisi</label>
        <select
          name="division_id"
          value={form.division_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
        >
          <option value="">Pilih Divisi</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Link LinkedIn</label>
          <input
            name="linkedin_url"
            value={form.linkedin_url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Link Instagram</label>
          <input
            name="instagram_url"
            value={form.instagram_url}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>
      </div>

      {editingOfficer && editingOfficer.photo_url && !photo && (
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium text-slate-700">Foto Profil Saat Ini:</p>
          <img
            src={editingOfficer.photo_url}
            alt="Profil"
            className="h-16 w-16 rounded-full object-cover border border-slate-200 shadow-sm"
          />
        </div>
      )}

      <div className="mb-6">
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <ImageIcon className="h-3.5 w-3.5" />
          {editingOfficer ? 'Ganti Foto Profil (Opsional)' : 'Foto Profil'}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F172A] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
      </div>

      <div className="flex gap-3">
        {editingOfficer && (
          <button
            type="button"
            onClick={() => setEditingOfficer(null)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? 'Mengunggah foto...' : saving ? 'Menyimpan...' : editingOfficer ? 'Update Pengurus' : 'Simpan Pengurus'}
        </button>
      </div>
    </form>
  );
}

function OfficersList({ session, refreshKey, setEditingOfficer, onDeleted }) {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    authFetch(session, '/api/admin/officers')
      .then((res) => res.json())
      .then((data) => setOfficers(data.officers || []))
      .finally(() => setLoading(false));
  }, [session, refreshKey]);

  async function handleDelete(officer) {
    if (!confirm(`Hapus ${officer.full_name} dari struktur organisasi?`)) return;
    setDeletingId(officer.id);
    const res = await authFetch(session, '/api/admin/officers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: officer.id }),
    });
    setDeletingId(null);
    if (res.ok) {
      onDeleted?.();
    } else {
      const data = await res.json();
      alert(data.error || 'Gagal menghapus pengurus.');
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#0F172A]">
        <Users className="h-4 w-4" />
        Daftar Pengurus ({officers.length})
      </h3>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#1E3A8A]" />
        </div>
      ) : officers.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">Belum ada pengurus terdaftar.</p>
      ) : (
        <ul className="max-h-[560px] space-y-2 overflow-y-auto animate-fadeIn">
          {officers.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  {o.photo_url ? (
                    <img src={o.photo_url} alt={o.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]">
                      <User className="h-4 w-4 text-white/60" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{o.full_name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {o.position} · {o.divisions?.name || 'Tanpa Divisi'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setEditingOfficer(o)}
                  className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Edit pengurus"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(o)}
                  disabled={deletingId === o.id}
                  className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors"
                  title="Hapus pengurus"
                >
                  {deletingId === o.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =====================================================================
// TAB 3: INBOX ASPIRASI
// =====================================================================
function AspirasiTab({ session }) {
  const [aspirations, setAspirations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(session, '/api/admin/aspirations')
      .then((res) => res.json())
      .then((data) => setAspirations(data.aspirations || []))
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (aspirations.length === 0) {
    return <p className="text-center text-sm text-slate-400">Belum ada aspirasi yang masuk.</p>;
  }

  return (
    <div className="space-y-3">
      {aspirations.map((a) => (
        <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A]">{a.sender_name}</span>
            <span className="text-xs text-slate-400">
              {new Date(a.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
          {a.email && <p className="mb-2 text-xs text-slate-400">{a.email}</p>}
          <p className="text-sm leading-relaxed text-slate-600">{a.message}</p>
        </div>
      ))}
    </div>
  );
}
