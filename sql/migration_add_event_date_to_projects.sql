-- =====================================================================
-- MIGRATION: Tambah kolom event_date ke tabel projects (jika belum ada)
-- Jalankan di: Supabase Dashboard → SQL Editor
-- =====================================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS event_date DATE;

-- Verifikasi: cek kolom yang ada di tabel projects
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;
