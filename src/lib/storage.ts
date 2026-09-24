/**
 * Penyimpanan progres (localStorage) + statistik belajar.
 * Tidak menyimpan data pribadi sensitif: hanya nama panggilan dan hasil bermain/belajar.
 */

import { MATERI } from '../data/content';
import type { Soal } from '../data/content';
import { QUESTIONS_INDEX } from './bank';

export interface Percobaan {
  qid: string;
  level: number;
  materi: string;
  tipe: string;
  kesulitan: string;
  benar: boolean;
  percobaan: number;
  poin: number;
  waktu: number;
}

export interface HasilLevel {
  bintang: number;
  gp: number;
  lp: number;
  benar: number;
  salah: number;
  waktu: number;
}

export interface Pengaturan {
  musik: boolean;
  efek: boolean;
  volume: number;
  retry: boolean;
  waktuSoal: number; // detik, 0 = tanpa batas
  namaTampil: string; // tampilan aman: hanya inisial kelas
}

export interface DataProgres {
  versi: 1;
  nama: string;
  dibuat: number;
  gp: number;
  lp: number;
  levelTerbuka: number;
  levelSelesai: Record<string, HasilLevel>;
  percobaan: Percobaan[];
  badges: string[];
  kemampuan: string[];
  kartu: number;
  waktuMain: number;
  pengaturan: Pengaturan;
}

const KEY = 'energy-hero-progres-v1';
const KEY_BANK = 'energy-hero-bank-v1';

export function dataAwal(nama = 'Penjaga'): DataProgres {
  return {
    versi: 1,
    nama,
    dibuat: Date.now(),
    gp: 0,
    lp: 0,
    levelTerbuka: 1,
    levelSelesai: {},
    percobaan: [],
    badges: [],
    kemampuan: ['Energy Cast'],
    kartu: 0,
    waktuMain: 0,
    pengaturan: { musik: true, efek: true, volume: 0.6, retry: true, waktuSoal: 0, namaTampil: 'Siswa' },
  };
}

export function muat(): DataProgres {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return dataAwal();
    const d = JSON.parse(raw) as DataProgres;
    return { ...dataAwal(), ...d, pengaturan: { ...dataAwal().pengaturan, ...(d.pengaturan ?? {}) } };
  } catch {
    return dataAwal();
  }
}

export function simpan(d: DataProgres) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

export function reset(d: DataProgres): DataProgres {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
  return dataAwal(d.nama);
}

/** Bank soal kustom buatan guru (digabung dengan bank bawaan). */
export function muatBankKustom(): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem(KEY_BANK);
    return raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

export function simpanBankKustom(list: Record<string, unknown>[]) {
  try {
    localStorage.setItem(KEY_BANK, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/* ----------------------------- statistik belajar ---------------------------- */

export interface RingkasanMateri {
  materi: string;
  total: number;
  benar: number;
  penguasaan: number;
  perluDipelajari: boolean;
}

export function ringkasanMateri(d: DataProgres): RingkasanMateri[] {
  return MATERI.map((m: string) => {
    const rows = d.percobaan.filter((p) => p.materi === m);
    const benar = rows.filter((p) => p.benar).length;
    const soalTersedia = Object.values(QUESTIONS_INDEX).filter((q: Soal) => q.materi === m).length;
    const total = Math.max(rows.length, soalTersedia);
    const penguasaan = rows.length === 0 ? 0 : Math.round((benar / rows.length) * 100);
    return { materi: m, total, benar, penguasaan, perluDipelajari: rows.length > 0 && penguasaan < 60 };
  });
}

export function tingkatPenguasaan(d: DataProgres): { label: string; nilai: number } {
  const rows = d.percobaan;
  if (rows.length === 0) return { label: 'Belum dinilai', nilai: 0 };
  const nilai = Math.round((rows.filter((p) => p.benar).length / rows.length) * 100);
  const label = nilai >= 80 ? 'Sangat Baik' : nilai >= 60 ? 'Baik' : nilai >= 40 ? 'Berkembang' : 'Perlu Bimbingan';
  return { label, nilai };
}

/** Rekomendasi remedial/pengayaan berdasarkan riwayat jawaban. */
export function rekomendasi(d: DataProgres): { remedial: string[]; pengayaan: string[] } {
  const ringkas = ringkasanMateri(d);
  const remedial = ringkas.filter((r) => r.perluDipelajari).map((r) => `${r.materi} — baca kembali Koleksi Pengetahuan, lalu ulangi misinya.`);
  const sudah = Object.keys(d.levelSelesai).length;
  const pengayaan: string[] = [];
  if (sudah >= 3) pengayaan.push('Coba tulis rencana energi sederhana untuk rumahmu sendiri berdasarkan kondisi lingkungan tempat tinggalmu.');
  if (d.percobaan.filter((p) => p.benar).length >= 10)
    pengayaan.push('Bandingkan dua daerah di sekitarmu: sumber energi apa yang paling sesuai untuk masing-masing?');
  if (pengayaan.length === 0 && d.percobaan.length > 0)
    pengayaan.push('Selesaikan misi berikutnya dan catat satu hal baru yang kamu temukan tentang energi.');
  return { remedial, pengayaan };
}

/**
 * Level terbuka efektif.
 * Dihitung dari dua sumber sekaligus (nilai tersimpan + level yang sudah selesai)
 * sehingga progres tidak mungkin "macet" hanya karena satu angka tidak tersimpan.
 */
export function levelTerbukaEfektif(d: DataProgres, jumlahLevel: number): number {
  const dariSelesai = Object.keys(d.levelSelesai).reduce((maks, k) => Math.max(maks, Number(k) + 1), 1);
  return Math.min(jumlahLevel, Math.max(1, d.levelTerbuka, dariSelesai));
}

/** Ekspor riwayat pengerjaan ke CSV (dipisah koma, diawali BOM untuk Excel). */
export function eksporCSV(d: DataProgres): string {
  const kepala = ['waktu', 'level', 'soal', 'materi', 'tipe', 'kesulitan', 'benar', 'percobaan', 'poin'];
  const baris = d.percobaan.map((p) =>
    [new Date(p.waktu).toISOString(), p.level, p.qid, p.materi, p.tipe, p.kesulitan, p.benar ? 'benar' : 'salah', p.percobaan, p.poin]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return '\uFEFF' + [kepala.join(','), ...baris].join('\n');
}

export function unduhCSV(d: DataProgres) {
  const blob = new Blob([eksporCSV(d)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hasil-belajar-energy-hero-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
