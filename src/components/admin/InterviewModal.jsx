'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, Loader2 } from 'lucide-react';

export default function InterviewModal({ applicant, onClose, onSave }) {
  const [datetime, setDatetime] = useState(
    applicant.interview_datetime ? applicant.interview_datetime.slice(0, 16) : ''
  );
  const [location, setLocation] = useState(applicant.interview_location || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      id: applicant.id,
      interview_datetime: datetime ? new Date(datetime).toISOString() : null,
      interview_location: location,
      status: applicant.status === 'Pending' ? 'Interview' : applicant.status,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F172A]">Jadwal Interview</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <p className="mb-5 text-sm text-slate-500">
          Untuk pendaftar: <span className="font-semibold text-[#0F172A]">{applicant.full_name}</span> ({applicant.nim})
        </p>

        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Calendar className="h-3.5 w-3.5" />
            Tanggal & Jam
          </label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <MapPin className="h-3.5 w-3.5" />
            Lokasi / Link Zoom
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ruang Sekretariat / https://zoom.us/..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
