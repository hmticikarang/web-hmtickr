import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// =====================================================================
// STYLES
// =====================================================================
const NAVY = '#0F172A';
const BLUE = '#1E3A8A';
const SLATE = '#64748B';
const LIGHT_BG = '#F8FAFC';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1E293B',
  },
  header: {
    backgroundColor: NAVY,
    paddingVertical: 24,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#CBD5E1',
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerBadgeLabel: {
    fontSize: 7,
    color: '#CBD5E1',
    marginBottom: 2,
  },
  headerBadgeValue: {
    fontSize: 11,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  body: {
    padding: 32,
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  successText: {
    fontSize: 9,
    color: '#065F46',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: LIGHT_BG,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 8,
    color: SLATE,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1E293B',
  },
  divisionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  divisionChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
  },
  divisionChipLabel: {
    fontSize: 7,
    color: SLATE,
    marginBottom: 3,
  },
  divisionChipValue: {
    fontSize: 9,
    fontWeight: 700,
    color: BLUE,
  },
  motivationBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
  },
  motivationText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#334155',
  },
  bottomSection: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 20,
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  qrCaption: {
    fontSize: 7,
    color: SLATE,
    marginTop: 6,
    textAlign: 'center',
  },
  instructionSection: {
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BLUE,
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
    paddingTop: 3,
    marginRight: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.4,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: SLATE,
  },
});

const INTERVIEW_STEPS = [
  'Pantau status pendaftaran secara berkala melalui WhatsApp/Email yang telah didaftarkan.',
  'Panitia akan menghubungi kamu untuk konfirmasi jadwal wawancara (interview).',
  'Datang tepat waktu sesuai jadwal & lokasi/link yang diinformasikan panitia.',
  'Bawa/tunjukkan bukti pendaftaran ini (cetak atau digital) saat sesi interview berlangsung.',
];

// =====================================================================
// COMPONENT
// =====================================================================
export default function OprecPDFDocument({ applicant, divisionNames, qrDataUrl }) {
  const {
    app_number,
    full_name,
    nim,
    email,
    phone_wa,
    major,
    cohort,
    motivation,
    created_at,
  } = applicant;

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Document title={`Bukti Pendaftaran ${app_number}`}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox} />
            <View>
              <Text style={styles.headerTitle}>Himpunan Mahasiswa</Text>
              <Text style={styles.headerSubtitle}>Bukti Pendaftaran Open Recruitment</Text>
            </View>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeLabel}>No. Pendaftaran</Text>
            <Text style={styles.headerBadgeValue}>{app_number}</Text>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          <View style={styles.successBanner}>
            <Text style={styles.successText}>
              Pendaftaran kamu telah berhasil tercatat pada sistem Open Recruitment Himpunan
              Mahasiswa. Simpan dokumen ini sebagai bukti pendaftaran resmi.
            </Text>
          </View>

          {/* Data Diri */}
          <Text style={styles.sectionTitle}>Data Diri Pendaftar</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Nama Lengkap</Text>
                <Text style={styles.fieldValue}>{full_name}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>NIM</Text>
                <Text style={styles.fieldValue}>{nim}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Program Studi</Text>
                <Text style={styles.fieldValue}>{major}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Angkatan</Text>
                <Text style={styles.fieldValue}>{cohort}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>{email}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>No. WhatsApp</Text>
                <Text style={styles.fieldValue}>{phone_wa}</Text>
              </View>
            </View>
            <View style={[styles.row, { marginBottom: 0 }]}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Tanggal Pendaftaran</Text>
                <Text style={styles.fieldValue}>{formattedDate}</Text>
              </View>
            </View>
          </View>

          {/* Pilihan Divisi */}
          <Text style={styles.sectionTitle}>Pilihan Divisi</Text>
          <View style={[styles.card, { paddingBottom: 12 }]}>
            <View style={styles.divisionRow}>
              <View style={styles.divisionChip}>
                <Text style={styles.divisionChipLabel}>Pilihan 1 (Utama)</Text>
                <Text style={styles.divisionChipValue}>{divisionNames.choice1 || '-'}</Text>
              </View>
              <View style={styles.divisionChip}>
                <Text style={styles.divisionChipLabel}>Pilihan 2</Text>
                <Text style={styles.divisionChipValue}>{divisionNames.choice2 || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Motivasi */}
          <Text style={styles.sectionTitle}>Motivasi</Text>
          <View style={[styles.card, { marginBottom: 20 }]}>
            <View style={styles.motivationBox}>
              <Text style={styles.motivationText}>{motivation}</Text>
            </View>
          </View>

          {/* QR + Instruksi Interview */}
          <View style={styles.bottomSection}>
            <View style={styles.qrSection}>
              {qrDataUrl ? (
                <Image src={qrDataUrl} style={{ width: 90, height: 90 }} />
              ) : (
                <View style={{ width: 90, height: 90, backgroundColor: '#E2E8F0' }} />
              )}
              <Text style={styles.qrCaption}>Scan untuk verifikasi{'\n'}nomor pendaftaran</Text>
            </View>

            <View style={styles.instructionSection}>
              <Text style={styles.sectionTitle}>Langkah Interview Selanjutnya</Text>
              {INTERVIEW_STEPS.map((step, idx) => (
                <View key={idx} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{idx + 1}</Text>
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Dokumen ini digenerate otomatis oleh sistem.</Text>
          <Text style={styles.footerText}>Himpunan Mahasiswa © {new Date().getFullYear()}</Text>
        </View>
      </Page>
    </Document>
  );
}
