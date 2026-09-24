/**
 * Layar-layar antarmuka di luar arena permainan:
 * sampul, peta misi, hasil level, pencapaian, koleksi pengetahuan, pengaturan, petunjuk.
 */
import { useState } from 'react';
import { BADGES, KOLEKSI, LEVELS } from '../data/content';
import type { LevelDef } from '../data/content';
import type { DataProgres } from '../lib/storage';
import { levelTerbukaEfektif, rekomendasi, ringkasanMateri, tingkatPenguasaan } from '../lib/storage';
import { audio } from '../game/audio';

/* ------------------------------ potongan UI ------------------------------- */

export function PapanJudul({ kanan, kiri }: { kiri: string; kanan?: React.ReactNode }) {
  return (
    <div className="papan-judul px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
      <h2 className="judul text-xl sm:text-2xl">{kiri}</h2>
      {kanan}
    </div>
  );
}

function Bintang({ n }: { n: number }) {
  return (
    <span className="text-[#f59120] tracking-tight" aria-label={`${n} bintang`}>
      {'★'.repeat(n)}
      <span className="text-[#cbb89a]">{'★'.repeat(Math.max(0, 3 - n))}</span>
    </span>
  );
}

/* --------------------------------- sampul -------------------------------- */

export function Sampul({
  data,
  onSetNama,
  onMulai,
  onLanjut,
  onPeta,
  onGuru,
  onPengaturan,
  onPetunjuk,
  onPencapaian,
  onKoleksi,
  onReset,
}: {
  data: DataProgres;
  onSetNama: (n: string) => void;
  onMulai: () => void;
  onLanjut: () => void;
  onPeta: () => void;
  onGuru: () => void;
  onPengaturan: () => void;
  onPetunjuk: () => void;
  onPencapaian: () => void;
  onKoleksi: () => void;
  onReset: () => void;
}) {
  const adaProgres = Object.keys(data.levelSelesai).length > 0 || data.gp > 0 || data.lp > 0;
  return (
    <div className="denim min-h-full w-full flex flex-col items-center p-3 sm:p-6 gap-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* kartu seni judul */}
        <div className="kartu overflow-hidden relative min-h-[320px] sm:min-h-[420px]">
          <img
            src="images/title.jpg"
            alt="Kota Arunika saat kehabisan energi"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2b3a55]/55 via-transparent to-[#5c3a1e]/75" />
          <div className="relative p-5 sm:p-8 flex flex-col h-full min-h-[320px] sm:min-h-[420px]">
            <p className="label-kecil text-[#ffe9c2]">IPAS · Kelas VI · Fase C · Kurikulum Merdeka</p>
            <h1 className="judul leading-[0.85] mt-2 drop-shadow-[0_4px_0_rgba(92,58,30,0.55)]">
              <span className="block text-[3.2rem] sm:text-[5rem] text-[#FFC93C]">ENERGY</span>
              <span className="block text-[3.2rem] sm:text-[5rem] text-[#F4EBDC]">HERO</span>
            </h1>
            <p className="mt-2 text-[#fff8ea] font-bold text-sm sm:text-base max-w-md drop-shadow">
              Misi Penjaga Masa Depan — Petualangan Menyelamatkan Dunia melalui Pengetahuan Energi
            </p>
            <div className="mt-auto pt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-[#2E6B3E]/90 text-white text-xs font-bold">Bab 5: Energi untuk Masa Depan</span>
              <span className="px-3 py-1 rounded-full bg-[#2E8FCB]/90 text-white text-xs font-bold">5 Wilayah Misi</span>
              <span className="px-3 py-1 rounded-full bg-[#F59120]/90 text-white text-xs font-bold">30+ Soal HOTS</span>
            </div>
          </div>
        </div>

        {/* plang menu */}
        <div className="kartu p-4 sm:p-6 flex flex-col gap-3">
          <div className="kartu-datar p-3">
            <label className="label-kecil text-[#6b5b4a]" htmlFor="nama-pemain">
              Nama Panggilan Penjaga
            </label>
            <input
              id="nama-pemain"
              className="w-full mt-1.5 px-3 py-2 rounded-lg border-2 border-[#cbb89a] bg-[#fffaf0] focus:border-[#f59120] focus:outline-none"
              value={data.nama}
              maxLength={16}
              onChange={(e) => onSetNama(e.target.value)}
              placeholder="Contoh: Bima"
            />
            <p className="text-[0.7rem] text-[#6b5b4a] mt-1">
              Hanya nama panggilan yang disimpan di perangkat ini. Jangan memakai nama lengkap, NISN, atau data pribadi lainnya.
            </p>
          </div>

          <button className="plang plang-utama" onClick={onMulai}>
            ▶ Mulai Permainan
          </button>
          <button className="plang" onClick={onLanjut} disabled={!adaProgres}>
            ⇥ Lanjutkan Permainan
          </button>
          <button className="plang" onClick={onPeta}>
            ⚑ Peta Misi &amp; Pilih Level
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="plang plang-kecil" onClick={onKoleksi}>
              Koleksi
            </button>
            <button className="plang plang-kecil" onClick={onPencapaian}>
              Pencapaian
            </button>
            <button className="plang plang-kecil" onClick={onPetunjuk}>
              Petunjuk
            </button>
            <button className="plang plang-kecil" onClick={onPengaturan}>
              Pengaturan
            </button>
          </div>
          <button className="plang plang-kecil plang-hijau" onClick={onGuru}>
            Mode Guru
          </button>
          <button
            className="text-xs underline text-[#6b5b4a] py-1"
            onClick={() => {
              if (window.confirm('Hapus seluruh progres permainan? Tindakan ini tidak dapat dibatalkan.')) onReset();
            }}
          >
            Mulai dari awal (hapus progres)
          </button>
          <div className="text-[0.7rem] text-[#6b5b4a] leading-snug border-t border-[#cbb89a] pt-2">
            Kekuatan energi tokoh dalam game adalah unsur fantasi hiburan. Kunci jawaban dan pembahasan tersedia bagi guru
            melalui Mode Guru.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- peta misi ------------------------------- */

export function PetaMisi({ data, onPilih, onKembali }: { data: DataProgres; onPilih: (id: number) => void; onKembali: () => void }) {
  return (
    <div className="denim min-h-full p-3 sm:p-6">
      <div className="max-w-6xl mx-auto kartu overflow-hidden">
        <PapanJudul kiri="Peta Misi — 5 Wilayah" kanan={<button className="plang plang-kecil plang-hijau" onClick={onKembali}>← Menu</button>} />
        <div className="p-4 sm:p-6">
          <div className="relative py-2">
            <svg
              className="pointer-events-none hidden lg:block absolute inset-x-0 top-6 h-[220px] w-full"
              viewBox="0 0 900 220"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M40 170 C 180 60, 240 200, 380 120 S 620 40, 740 140 S 840 120, 870 90"
                fill="none"
                stroke="#B98A50"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="2 22"
              />
            </svg>
            <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {LEVELS.map((lv, i) => {
                const terbuka = lv.id <= levelTerbukaEfektif(data, LEVELS.length);
                const hasil = data.levelSelesai[String(lv.id)];
                const angkat = i % 2 === 0 ? 'lg:mt-0' : 'lg:mt-24';
                return (
                  <button
                    key={lv.id}
                    disabled={!terbuka}
                    onClick={() => onPilih(lv.id)}
                    className={`text-left ${angkat} group`}
                  >
                    <div
                      className={`kartu p-3 transition-transform group-hover:-translate-y-1 ${terbuka ? '' : 'opacity-60 grayscale'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="label-kecil text-[#6b5b4a]">Misi {String(lv.id).padStart(2, '0')}</span>
                        <span>{hasil ? <Bintang n={hasil.bintang} /> : terbuka ? <Bintang n={0} /> : '🔒'}</span>
                      </div>
                      <h3 className="judul text-lg leading-tight mt-1">{lv.nama}</h3>
                      <p className="text-[0.75rem] text-[#6b5b4a] mt-1">{lv.tagline}</p>
                      <img
                        src={lv.bg}
                        alt=""
                        className="mt-2 h-20 w-full object-cover rounded-lg border-2 border-[#cbb89a] bg-[#e8dcc6]"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="mt-2 text-[0.75rem] font-bold text-[#2E6B3E]">
                        {terbuka ? (hasil ? 'Selesai — mainkan lagi' : 'Siap dimainkan') : 'Terkunci'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-[#efe6d4] border-t-2 border-[#cbb89a] text-sm text-[#6b5b4a]">
          Setiap wilayah menggabungkan alur <b>Action → Observe → Think → Answer → Feedback → Reflect</b>. Misi berikutnya terbuka setelah misi sebelumnya diselesaikan.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ hasil level ------------------------------ */

export function HalamanHasil({
  level,
  gp,
  lp,
  benar,
  salah,
  kartu,
  kartuTotal,
  waktu,
  data,
  onPeta,
  onUlang,
  onLanjut,
  gagal,
}: {
  level: LevelDef;
  gp: number;
  lp: number;
  benar: number;
  salah: number;
  kartu: number;
  kartuTotal: number;
  waktu: number;
  data: DataProgres;
  onPeta: () => void;
  onUlang: () => void;
  onLanjut: () => void;
  gagal?: boolean;
}) {
  const penguasaan = tingkatPenguasaan(data);
  const rekom = rekomendasi(data);
  const ringkas = ringkasanMateri(data);
  const menit = Math.floor(waktu / 60);
  const detik = Math.round(waktu % 60);

  return (
    <div className="denim min-h-full p-3 sm:p-6">
      <div className="max-w-4xl mx-auto kartu overflow-hidden masuk-kartu">
        <PapanJudul
          kiri={gagal ? 'Misi Belum Berhasil' : 'Misi Selesai!'}
          kanan={<span className="label-kecil opacity-90">{level.nama}</span>}
        />
        <div className="p-4 sm:p-6 space-y-5">
          {gagal ? (
            <p className="leading-relaxed">
              Energi Penjaga habis kali ini. Tidak apa-apa — kamu bisa mencoba lagi dan menerapkan cara baru. Periksa kembali
              informasi di setiap objek sebelum menghadapi musuh.
            </p>
          ) : (
            <p className="leading-relaxed">
              Selamat, <b>{data.nama}</b>! Wilayah <b>{level.nama}</b> sudah aman. Kekuatan baru terbuka: <b>{level.mampu}</b>.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="kartu-datar p-4">
              <p className="label-kecil text-[#F59120]">Skor Gameplay</p>
              <p className="judul text-4xl angka">{gp}</p>
              <p className="text-xs text-[#6b5b4a] mt-1">Eksplorasi, kartu energi, dan tantangan aksi.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm angka">
                <div>Kartu <b>{kartu}/{kartuTotal}</b></div>
                <div>Waktu <b>{menit}:{String(detik).padStart(2, '0')}</b></div>
              </div>
            </div>
            <div className="kartu-datar p-4">
              <p className="label-kecil text-[#2E8FCB]">Skor Pembelajaran</p>
              <p className="judul text-4xl angka">{lp}</p>
              <p className="text-xs text-[#6b5b4a] mt-1">Jawaban benar, analisis kasus, dan perbaikan jawaban.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm angka">
                <div>Benar <b>{benar}</b></div>
                <div>Belum tepat <b>{salah}</b></div>
              </div>
            </div>
          </div>

          <div className="kartu-datar p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="label-kecil text-[#6b5b4a]">Tingkat penguasaan materi</p>
              <p className="font-bold">
                {penguasaan.label} <span className="angka">({penguasaan.nilai}%)</span>
              </p>
            </div>
            <div className="bar-bilah mt-2">
              <div className="h-full bg-[#2E6B3E]" style={{ width: `${penguasaan.nilai}%` }} />
            </div>
            <p className="text-xs text-[#6b5b4a] mt-2">
              Angka ini berasal dari riwayat jawabanmu di prototipe ini, bukan pernyataan resmi penguasaan kompetensi. Penilaian
              tetap dilakukan oleh guru.
            </p>
            <div className="mt-3 space-y-1.5">
              {ringkas.map((r) => (
                <div key={r.materi} className="flex items-center gap-2 text-sm">
                  <span className="w-40 sm:w-56 truncate">{r.materi}</span>
                  <div className="bar-bilah flex-1">
                    <div
                      className={`h-full ${r.penguasaan >= 60 ? 'bg-[#2E6B3E]' : 'bg-[#F59120]'}`}
                      style={{ width: `${r.penguasaan}%` }}
                    />
                  </div>
                  <span className="angka w-12 text-right">{r.penguasaan}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="kartu-datar p-4">
              <p className="label-kecil text-[#F59120] mb-1">Perlu dipelajari kembali</p>
              {rekom.remedial.length ? (
                <ul className="list-disc pl-5 space-y-1">{rekom.remedial.map((r) => <li key={r}>{r}</li>)}</ul>
              ) : (
                <p className="text-[#6b5b4a]">Belum ada materi yang perlu diulang. Pertahankan!</p>
              )}
            </div>
            <div className="kartu-datar p-4">
              <p className="label-kecil text-[#2E8FCB] mb-1">Tantangan pengayaan</p>
              <ul className="list-disc pl-5 space-y-1">{rekom.pengayaan.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          </div>

          {!gagal && level.id < LEVELS.length && (
            <div className="rounded-xl border-2 border-[#2E6B3E] bg-[#e6f3e4] px-4 py-3">
              <p className="label-kecil text-[#2E6B3E]">Level berikutnya terbuka</p>
              <p className="font-bold">
                Misi {String(level.id + 1).padStart(2, '0')} — {LEVELS[level.id].nama}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            <button className="plang sm:w-auto min-w-[150px]" onClick={onUlang}>↻ Ulangi Misi</button>
            <button className="plang sm:w-auto min-w-[150px]" onClick={onPeta}>⚑ Peta Misi</button>
            {!gagal && level.id < LEVELS.length && (
              <button className="plang plang-utama sm:w-auto min-w-[190px]" onClick={onLanjut}>Misi Berikutnya →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ pencapaian ------------------------------- */

export function HalamanPencapaian({ data, onKembali }: { data: DataProgres; onKembali: () => void }) {
  return (
    <div className="denim min-h-full p-3 sm:p-6">
      <div className="max-w-4xl mx-auto kartu overflow-hidden">
        <PapanJudul kiri="Pencapaian" kanan={<button className="plang plang-kecil plang-hijau" onClick={onKembali}>← Menu</button>} />
        <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-3">
          {BADGES.map((b) => {
            const dapat = data.badges.includes(b.id);
            return (
              <div key={b.id} className={`kartu-datar p-4 flex gap-3 items-center ${dapat ? '' : 'opacity-55 grayscale'}`}>
                <div className="text-3xl">{dapat ? '🏅' : '🔒'}</div>
                <div>
                  <p className="judul text-lg leading-tight">{b.nama}</p>
                  <p className="text-xs text-[#6b5b4a]">{b.ket}</p>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-[#6b5b4a] sm:col-span-2">
            Pencapaian bersifat pribadi di perangkat ini. Tidak ada peringkat antar-siswa, sehingga tidak ada yang
            merasa kalah di depan teman-temannya.
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- koleksi pengetahuan -------------------------- */

export function HalamanKoleksi({ data, onKembali }: { data: DataProgres; onKembali: () => void }) {
  const ringkas = ringkasanMateri(data);
  return (
    <div className="denim min-h-full p-3 sm:p-6">
      <div className="max-w-4xl mx-auto kartu overflow-hidden">
        <PapanJudul kiri="Koleksi Pengetahuan Energi" kanan={<button className="plang plang-kecil plang-hijau" onClick={onKembali}>← Menu</button>} />
        <div className="p-4 sm:p-6 grid gap-3">
          {KOLEKSI.map((k, i) => {
            const r = ringkas.find((x) => x.materi === k.judul);
            return (
              <article key={k.judul} className="kartu-datar p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="huruf-bulat">{i + 1}</span>
                  <h3 className="judul text-lg">{k.judul}</h3>
                  {r && r.penguasaan > 0 && (
                    <span className="label-kecil px-2 py-1 rounded-full bg-[#e8dcc6] angka">Penguasaan {r.penguasaan}%</span>
                  )}
                </div>
                <p className="text-[0.95rem] leading-relaxed mt-2">{k.isi}</p>
              </article>
            );
          })}
          <div className="kartu-datar p-4 text-sm border-l-8 border-l-[#F59120]">
            <p className="label-kecil text-[#F59120] mb-1">Catatan penting</p>
            <p>
              Kekuatan energi tokoh dalam game (Energy Cast, Solar/Wind/Hydro Power) adalah <b>unsur fantasi</b> untuk
              hiburan, bukan proses ilmiah yang sebenarnya.
            </p>
            <p className="mt-2 text-[#6b5b4a]">
              Baca pelan-pelan, lalu coba jelaskan kembali dengan bahasamu sendiri kepada teman sebangkumu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- pengaturan ------------------------------ */

export function HalamanPengaturan({
  data,
  onUbah,
  onKembali,
}: {
  data: DataProgres;
  onUbah: (p: Partial<DataProgres['pengaturan']>) => void;
  onKembali: () => void;
}) {
  const p = data.pengaturan;
  return (
    <div className="denim min-h-full p-3 sm:p-6">
      <div className="max-w-2xl mx-auto kartu overflow-hidden">
        <PapanJudul kiri="Pengaturan" kanan={<button className="plang plang-kecil plang-hijau" onClick={onKembali}>← Menu</button>} />
        <div className="p-4 sm:p-6 space-y-4">
          <div className="kartu-datar p-4 space-y-3">
            <label className="flex items-center justify-between gap-3">
              <span className="font-bold">Musik latar</span>
              <input
                type="checkbox"
                checked={p.musik}
                className="w-6 h-6 accent-[#F59120]"
                onChange={(e) => {
                  onUbah({ musik: e.target.checked });
                  if (e.target.checked) audio.mulaiMusik();
                  else audio.hentikanMusik();
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="font-bold">Efek suara</span>
              <input
                type="checkbox"
                checked={p.efek}
                className="w-6 h-6 accent-[#F59120]"
                onChange={(e) => {
                  onUbah({ efek: e.target.checked });
                  audio.efek = e.target.checked;
                  audio.fx('klik');
                }}
              />
            </label>
            <label className="block">
              <span className="font-bold">Volume {Math.round(p.volume * 100)}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(p.volume * 100)}
                className="w-full mt-2 accent-[#F59120]"
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  onUbah({ volume: v });
                  audio.setVolume(v);
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="font-bold">Izinkan mencoba ulang soal (retry)</span>
              <input
                type="checkbox"
                checked={p.retry}
                className="w-6 h-6 accent-[#F59120]"
                onChange={(e) => onUbah({ retry: e.target.checked })}
              />
            </label>
            <label className="block">
              <span className="font-bold">Batas waktu per soal (detik, 0 = tanpa batas)</span>
              <input
                type="range"
                min={0}
                max={180}
                step={15}
                value={p.waktuSoal}
                className="w-full mt-2 accent-[#F59120]"
                onChange={(e) => onUbah({ waktuSoal: Number(e.target.value) })}
              />
              <span className="angka text-sm text-[#6b5b4a]">{p.waktuSoal === 0 ? 'Tanpa batas waktu' : `${p.waktuSoal} detik`}</span>
            </label>
          </div>

          <div className="kartu-datar p-4 text-sm">
            <p className="label-kecil text-[#2E8FCB] mb-2">Pengaturan kontrol</p>
            <ul className="grid sm:grid-cols-2 gap-1.5 angka">
              <li>A / ← : bergerak ke kiri</li>
              <li>D / → : bergerak ke kanan</li>
              <li>W / ↑ / Spasi : melompat</li>
              <li>J : pukul</li>
              <li>K : tendang</li>
              <li>L : Energy Cast</li>
              <li>E : interaksi</li>
              <li>Esc : jeda &nbsp;|&nbsp; P : panel misi</li>
            </ul>
            <p className="text-[#6b5b4a] mt-2">
              Pada tablet dan telepon genggam, tombol bundar besar tersedia di layar permainan dan dapat dipakai bersama keyboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- petunjuk ------------------------------- */

export function HalamanPetunjuk({ onKembali }: { onKembali: () => void }) {
  const [tab, setTab] = useState<'main' | 'nilai' | 'guru' | 'rencana'>('main');
  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'main', label: 'Cara Bermain' },
    { id: 'nilai', label: 'Soal & Penilaian' },
    { id: 'guru', label: 'Mengubah Soal' },
    { id: 'rencana', label: 'Rencana Pengembangan' },
  ];
  return (
    <div className="denim min-h-full p-3 sm:p-6">
      <div className="max-w-3xl mx-auto kartu overflow-hidden">
        <PapanJudul kiri="Petunjuk Penggunaan" kanan={<button className="plang plang-kecil plang-hijau" onClick={onKembali}>← Menu</button>} />
        <div className="flex flex-wrap gap-2 p-4 pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl border-2 border-[#cbb89a] font-bold text-sm ${tab === t.id ? 'tab-aktif' : 'bg-[#fffaf0]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-6 space-y-3 text-[0.95rem] leading-relaxed">
          {tab === 'main' && (
            <>
              <p><b>1. Menjalankan game.</b> Buka halaman ini di browser (Chrome, Edge, Firefox, atau Safari). Tidak perlu instalasi. Untuk guru: jalankan <span className="angka bg-[#e8dcc6] px-1 rounded">npm install</span> lalu <span className="angka bg-[#e8dcc6] px-1 rounded">npm run dev</span>, atau buka berkas hasil <span className="angka bg-[#e8dcc6] px-1 rounded">npm run build</span>.</p>
              <p><b>2. Mengontrol karakter.</b> Bergerak dengan A/D atau tombol panah, lompat dengan W/Spasi, pukul dengan J, tendang dengan K, Energy Cast dengan L, dan berinteraksi dengan E pada objek yang berdenyut kuning.</p>
              <p><b>3. Menyelesaikan misi.</b> Kumpulkan kartu energi, datangi objek bercahaya, tekan E untuk membaca informasi, lalu jawab misi pengetahuan. Gerbang misi terbuka setelah target kartu dan target jawaban benar terpenuhi.</p>
              <p><b>4. Pertarungan fantasi.</b> Musuh adalah makhluk simbolis tanpa darah atau luka. Beberapa musuh memiliki perisai biru dan hanya dapat dinonaktifkan setelah misi pengetahuan terkait dijawab benar.</p>
            </>
          )}
          {tab === 'nilai' && (
            <>
              <p><b>Jenis soal:</b> pilihan ganda, benar/salah, benar/salah beralasan, urut, uraian singkat, dan studi kasus. Stimulus dapat berupa teks, tabel, grafik sederhana, atau gambar.</p>
              <p><b>Alur umpan balik:</b> siswa menjawab → memeriksa sendiri → membaca pembahasan → (opsional) mencoba lagi hingga 3 percobaan → melanjutkan. Jawaban benar tidak ditampilkan sebelum siswa mencoba.</p>
              <p><b>Uraian dan studi kasus</b> diperiksa otomatis dengan kata kunci penting dan menampilkan contoh jawaban, kemudian sebaiknya diperiksa ulang oleh guru melalui Mode Guru dan ekspor CSV.</p>
              <p><b>Skor gameplay</b> (eksplorasi, kartu, aksi) dan <b>skor pembelajaran</b> (jawaban benar, analisis kasus, perbaikan jawaban) dipisahkan. Skor gameplay bukan indikator penguasaan materi.</p>
            </>
          )}
          {tab === 'guru' && (
            <>
              <p>Buka <b>Mode Guru</b> dari menu utama untuk menambah, mengubah, dan menghapus soal, mengatur level, tingkat kesulitan, indikator, poin, jumlah percobaan, dan batas waktu.</p>
              <p>Soal buatan guru disimpan di localStorage peramban dan digabungkan dengan bank soal bawaan. Gunakan tombol <b>Ekspor CSV</b> untuk mengunduh hasil pengerjaan siswa.</p>
              <p>Untuk kelas dengan banyak perangkat, hasil dapat digabungkan secara manual dari masing-masing peramban. Sinkronisasi daring (Google Sheets/Firebase) <b>belum</b> diimplementasikan.</p>
            </>
          )}
          {tab === 'rencana' && (
            <>
              <p><b>Tahap berikutnya:</b> penambahan level dan musuh bos, animasi sprite penuh, bank soal impor CSV, uji coba kelas, dan penyempurnaan soal setelah dicocokkan dengan buku teks.</p>
              <p><b>Data:</b> struktur data sudah disiapkan agar mudah disambungkan ke Google Sheets, Google Apps Script, atau backend API dengan sistem akun guru dan siswa — namun hal tersebut <b>belum</b> dibuat pada versi ini.</p>
              <p><b>Android:</b> karena berbasis web, prototipe ini dapat dibungkus dengan WebView/Capacitor untuk menjadi aplikasi Android pada tahap berikutnya.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
