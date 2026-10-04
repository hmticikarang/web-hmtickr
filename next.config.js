/** @type {import('next').NextConfig} */

// Ambil hostname dari NEXT_PUBLIC_SUPABASE_URL secara otomatis
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
    // Mematikan Image Cache Writes di Vercel agar aman dari batasan kuota
    unoptimized: true,
    remotePatterns: supabaseHostname
      ? [
        {
          protocol: 'https',
          hostname: supabaseHostname,
          pathname: '/storage/v1/object/public/**',
        },
      ]
      : [
        {
          protocol: 'https',
          hostname: '**.supabase.co',
        },
      ],
  },

  // Kompres response HTML/JSON dari server
  compress: true,
};

module.exports = nextConfig;