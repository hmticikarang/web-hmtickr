'use client';

import { useState } from 'react';
import { MessageSquareHeart, Send, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AspirasiPage() {
  const [formData, setFormData] = useState({
    sender_name: '',
    email: '',
    message: '',
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.message.trim()) {
      showToast('error', 'Pesan aspirasi tidak boleh kosong.');
      return;
    }

    setSubmitting(true);

    const payload = {
      sender_name: isAnonymous || !formData.sender_name.trim() ? 'Anonim' : formData.sender_name.trim(),
      email: isAnonymous ? null : formData.email.trim() || null,
      message: formData.message.trim(),
    };

    const { error } = await supabase.from('aspirations').insert(payload);

    setSubmitting(false);

    if (error) {
      showToast('error', 'Gagal mengirim aspirasi. Silakan coba lagi.');
      return;
    }

    showToast('success', 'Aspirasi kamu berhasil dikirim. Terima kasih!');
    setFormData({ sender_name: '', email: '', message: '' });
  }

  return (
    <div>
      {/* HEADER */}
      <section className="bg-[#0F172A] py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Suarakan Pendapatmu
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Forum Aspirasi</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#1E3A8A]/10 p-2.5">
              <MessageSquareHeart className="h-5 w-5 text-[#1E3A8A]" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Kirim Aspirasi</h2>
          </div>

          {/* Toggle Anonim */}
          <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Kirim sebagai Anonim</p>
              <p className="text-xs text-slate-500">Nama & kontak kamu tidak perlu diisi.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isAnonymous ? 'bg-[#0F172A]' : 'bg-slate-300'
              }`}
              aria-pressed={isAnonymous}
              aria-label="Toggle kirim anonim"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Nama */}
          {!isAnonymous && (
            <div className="mb-5">
              <label htmlFor="sender_name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Nama
              </label>
              <input
                id="sender_name"
                name="sender_name"
                type="text"
                value={formData.sender_name}
                onChange={handleChange}
                placeholder="Nama kamu (kosongkan jika ingin tetap Anonim)"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
              />
            </div>
          )}

          {/* Email / No HP — disembunyikan saat mode Anonim aktif, karena
              identitas memang tidak ingin diketahui sama sekali */}
          {!isAnonymous && (
            <div className="mb-5">
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email / No. HP <span className="font-normal text-slate-400">(Opsional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                placeholder="untuk ditindaklanjuti jika diperlukan"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
              />
            </div>
          )}

          {/* Pesan */}
          <div className="mb-6">
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">
              Pesan Aspirasi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tuliskan masukan, kritik, atau saranmu untuk himpunan..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Mengirim...' : 'Kirim Aspirasi'}
            {!submitting && <Send className="h-4 w-4" />}
          </button>
        </form>
      </section>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0">
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 shadow-lg ${
              toast.type === 'success' ? 'bg-[#0F172A] text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={() => setToast(null)} aria-label="Tutup notifikasi">
              <X className="h-4 w-4 shrink-0 opacity-70 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
