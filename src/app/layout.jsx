import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Himpunan Mahasiswa Teknologio Informasi | Website Resmi',
  description:
    'Website resmi Himpunan Mahasiswa — Profil organisasi, program kerja, dan Open Recruitment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
