/** @type {import('next').NextConfig} */

// Ambil hostname dari NEXT_PUBLIC_SUPABASE_URL secara otomatis, supaya
// next/image bisa mengoptimasi (resize, convert ke WebP/AVIF) gambar
// yang di-upload ke Supabase Storage tanpa perlu di-hardcode manual.
function getSupabaseHostname() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
    // AVIF/WebP otomatis lebih kecil daripada JPG/PNG asli
    formats: ['image/avif', 'image/webp'],
  },

  // Kompres response HTML/JSON dari server
  compress: true,
};

module.exports = nextConfig;
