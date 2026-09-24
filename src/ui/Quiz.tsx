/**
 * Panel soal IPAS: stimulus (teks/tabel/grafik/gambar), enam tipe soal,
 * pemeriksaan jawaban, umpan balik, pembahasan, remedial, dan pengayaan.
 * Jawaban benar TIDAK ditampilkan sebelum siswa mencoba.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Soal, Stimulus } from '../data/content';
import { audio } from '../game/audio';

export interface HasilJawab {
  benar: boolean;
  poin: number;
  percobaan: number;
}

const HURUF = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ------------------------------ stimulus ---------------------------------- */

export function StimulusTampil({ s }: { s: Stimulus }) {
  if (s.t === 'teks') {
    return (
      <div className="kartu-datar p-3 sm:p-4 text-[0.95rem] leading-relaxed italic border-l-8 border-l-[#2e8fcb]">{s.isi}</div>
    );
  }
  if (s.t === 'tabel') {
    return (
      <figure className="kartu-datar overflow-hidden">
        <figcaption className="label-kecil bg-[#2e8fcb] text-white px-3 py-1.5">{s.caption}</figcaption>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.9rem] angka">
            <thead>
              <tr className="bg-[#e8dcc6]">
                {s.kepala.map((k) => (
                  <th key={k} className="text-left px-3 py-2 font-bold border-b-2 border-[#cbb89a]">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.baris.map((b, i) => (
                <tr key={i} className={i % 2 ? 'bg-[#fffaf0]' : ''}>
                  {b.map((c, j) => (
                    <td key={j} className="px-3 py-2 border-b border-[#e8dcc6] align-top">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    );
  }
  if (s.t === 'grafik') {
    const maks = Math.max(...s.data.map((d) => d.nilai), 1);
    return (
      <figure className="kartu-datar p-3">
        <figcaption className="label-kecil text-[#2e8fcb] mb-2">{s.caption}</figcaption>
        <svg viewBox="0 0 320 130" className="w-full h-auto" role="img" aria-label={s.caption}>
          <line x1="26" y1="108" x2="312" y2="108" stroke="#cbb89a" strokeWidth="2" />
          <line x1="26" y1="10" x2="26" y2="108" stroke="#cbb89a" strokeWidth="2" />
          {s.data.map((d, i) => {
            const w = 34;
            const x = 36 + i * ((300 - 36) / s.data.length);
            const t = (d.nilai / maks) * 84;
            return (
              <g key={d.label}>
                <rect x={x} y={108 - t} width={w} height={t} rx={5} fill={i % 2 ? '#f59120' : '#2e8fcb'} />
                <text x={x + w / 2} y={104 - t} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5c3a1e">
                  {d.nilai}
                </text>
                <text x={x + w / 2} y={122} textAnchor="middle" fontSize="11" fill="#6b5b4a">
                  {d.label}
                </text>
              </g>
            );
          })}
          <text x="4" y="18" fontSize="10" fill="#6b5b4a">
            {s.satuan}
          </text>
        </svg>
      </figure>
    );
  }
  return (
    <figure className="kartu-datar overflow-hidden">
      <img
        src={s.src}
        alt={s.caption}
        className="w-full h-36 sm:h-44 object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <figcaption className="text-xs px-3 py-2 text-[#6b5b4a]">{s.caption}</figcaption>
    </figure>
  );
}

/* ---------------------------- pemeriksaan -------------------------------- */

function cekUraian(teks: string, kunci: { kataKunci: string[]; min: number }) {
  const t = teks.toLowerCase();
  const cocok = kunci.kataKunci.filter((k) => t.includes(k.toLowerCase()));
  return { benar: cocok.length >= kunci.min, cocok };
}

function acakTetap<T>(arr: T[], benih: number): T[] {
  const out = [...arr];
  let s = benih;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------- panel ---------------------------------- */

export function PanelSoal({
  soal,
  izinkanRetry,
  waktuSoal,
  onSelesai,
}: {
  soal: Soal;
  izinkanRetry: boolean;
  waktuSoal: number;
  onSelesai: (h: HasilJawab) => void;
}) {
  const [pilih, setPilih] = useState<number | null>(null);
  const [st, setSt] = useState<0 | 1 | null>(null);
  const [alasan, setAlasan] = useState<number | null>(null);
  const [urut, setUrut] = useState<string[]>([]);
  const [teks, setTeks] = useState('');
  const [fase, setFase] = useState<'jawab' | 'umpan'>('jawab');
  const [hasil, setHasil] = useState<{ benar: boolean; cocok: string[] } | null>(null);
  const [percobaan, setPercobaan] = useState(1);
  const [sisa, setSisa] = useState(waktuSoal);
  // pemanggilan dari timer harus memakai versi fungsi terbaru
  const periksaRef = useRef<(dipaksa?: boolean) => void>(() => {});
  periksaRef.current = periksa;

  const pilihanUrut = useMemo(
    () => (soal.tipe === 'urut' ? acakTetap(soal.pilihan ?? [], soal.id.length * 37 + (soal.poin ?? 10)) : []),
    [soal]
  );

  useEffect(() => {
    if (fase !== 'jawab' || waktuSoal <= 0) return;
    setSisa(waktuSoal);
    const t = window.setInterval(() => {
      setSisa((v) => {
        if (v <= 1) {
          window.clearInterval(t);
          periksaRef.current(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, soal.id]);

  function bisaKirim(): boolean {
    switch (soal.tipe) {
      case 'pg':
        return pilih !== null;
      case 'bs':
        return pilih !== null;
      case 'bs_alasan':
        return st !== null && alasan !== null;
      case 'urut':
        return urut.length === (soal.pilihan ?? []).length;
      default:
        return teks.trim().length >= 8;
    }
  }

  function periksa(dipaksa = false) {
    if (!bisaKirim() && !dipaksa) return;
    let benar = false;
    let cocok: string[] = [];
    if (soal.tipe === 'pg' || soal.tipe === 'bs') {
      benar = pilih === (soal.kunci as number);
    } else if (soal.tipe === 'bs_alasan') {
      const k = soal.kunci as { st: 0 | 1; alasan: number };
      benar = st === k.st && alasan === k.alasan;
    } else if (soal.tipe === 'urut') {
      const k = soal.kunci as string[];
      benar = urut.length === k.length && urut.every((u, i) => u === k[i]);
    } else {
      const k = soal.kunci as { kataKunci: string[]; min: number; contoh: string };
      const r = cekUraian(teks, k);
      benar = r.benar;
      cocok = r.cocok;
    }
    setHasil({ benar, cocok });
    setFase('umpan');
    audio.fx(benar ? 'benar' : 'salah');
  }

  function lanjut() {
    const poin = hasil?.benar ? Math.max(5, Math.round(soal.poin / Math.max(1, percobaan === 1 ? 1 : 1.5))) : 0;
    onSelesai({ benar: Boolean(hasil?.benar), poin, percobaan });
  }

  function ulangi() {
    setPilih(null);
    setSt(null);
    setAlasan(null);
    setUrut([]);
    setHasil(null);
    setFase('jawab');
    setPercobaan((v) => v + 1);
  }

  const benar = hasil?.benar;
  const kunciUraian = soal.kunci as { kataKunci: string[]; min: number; contoh: string };
  const bolehUlang = izinkanRetry && soal.retry && !benar && percobaan < 3;

  return (
    <div className="w-full max-w-3xl mx-auto kartu masuk-kartu overflow-hidden">
      <div className="papan-judul px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="label-kecil opacity-90">{soal.materi}</span>
          <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-widest">
            {soal.kesulitan}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {waktuSoal > 0 && fase === 'jawab' && (
            <span className="angka text-sm">⏱ {sisa}s</span>
          )}
          <span className="angka text-sm">Poin {soal.poin}</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 max-h-[62vh] overflow-y-auto">
        <div className="flex items-center gap-2 text-xs text-[#6b5b4a]">
          <span className="label-kecil">{soal.submateri}</span>
          {percobaan > 1 && <span className="px-2 rounded-full bg-[#e8dcc6]">Percobaan ke-{percobaan}</span>}
        </div>

        {soal.stimulus && <StimulusTampil s={soal.stimulus} />}

        <p className="font-semibold leading-relaxed text-[1.02rem]">{soal.pertanyaan}</p>

        {/* ------------------------------ pilihan ----------------------------- */}
        {(soal.tipe === 'pg' || soal.tipe === 'bs') && (
          <div className="grid gap-2.5">
            {(soal.pilihan ?? []).map((p, i) => {
              const k = soal.kunci as number;
              let kelas = 'pilihan';
              if (fase === 'jawab') kelas += pilih === i ? ' pilihan-terpilih' : '';
              else if (i === k) kelas += ' pilihan-benar';
              else if (i === pilih) kelas += ' pilihan-salah';
              return (
                <button
                  key={i}
                  className={kelas}
                  disabled={fase === 'umpan'}
                  onClick={() => {
                    setPilih(i);
                    audio.fx('klik');
                  }}
                >
                  <span className="huruf-bulat">{soal.tipe === 'bs' ? (i === 0 ? 'B' : 'S') : HURUF[i]}</span>
                  <span className="pt-0.5">{p}</span>
                </button>
              );
            })}
          </div>
        )}

        {soal.tipe === 'bs_alasan' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {(soal.pilihan ?? ['Benar', 'Salah']).map((p, i) => (
                <button
                  key={i}
                  className={`pilihan justify-center ${st === i ? 'pilihan-terpilih' : ''}`}
                  disabled={fase === 'umpan'}
                  onClick={() => setSt(i as 0 | 1)}
                >
                  <span className="font-semibold">{p}</span>
                </button>
              ))}
            </div>
            <p className="label-kecil text-[#6b5b4a]">Pilih alasan yang paling tepat</p>
            <div className="grid gap-2.5">
              {(soal.pilihanAlasan ?? []).map((p, i) => {
                const k = (soal.kunci as { st: 0 | 1; alasan: number }).alasan;
                let kelas = 'pilihan';
                if (fase === 'jawab') kelas += alasan === i ? ' pilihan-terpilih' : '';
                else if (i === k) kelas += ' pilihan-benar';
                else if (i === alasan) kelas += ' pilihan-salah';
                return (
                  <button
                    key={i}
                    className={kelas}
                    disabled={fase === 'umpan'}
                    onClick={() => setAlasan(i)}
                  >
                    <span className="huruf-bulat">{HURUF[i]}</span>
                    <span className="pt-0.5">{p}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {soal.tipe === 'urut' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="label-kecil text-[#6b5b4a] mb-2">Kartu — ketuk sesuai urutan</p>
              <div className="grid gap-2">
                {pilihanUrut.map((p) => {
                  const dipakai = urut.includes(p);
                  return (
                    <button
                      key={p}
                      className={`pilihan text-sm ${dipakai ? 'opacity-40' : ''}`}
                      disabled={fase === 'umpan' || dipakai}
                      onClick={() => setUrut((u) => [...u, p])}
                    >
                      <span className="pt-0.5">{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="label-kecil text-[#6b5b4a] mb-2">Urutanmu</p>
              <ol className="grid gap-2">
                {(soal.pilihan ?? []).map((_, i) => {
                  const isi = urut[i];
                  const kunci = (soal.kunci as string[])[i];
                  const cocokBenar = fase === 'umpan' && isi === kunci;
                  const cocokSalah = fase === 'umpan' && isi && isi !== kunci;
                  return (
                    <li key={i}>
                      <button
                        className={`pilihan text-sm ${cocokBenar ? 'pilihan-benar' : ''} ${cocokSalah ? 'pilihan-salah' : ''} ${!isi ? 'opacity-60' : ''}`}
                        disabled={fase === 'umpan' || !isi}
                        onClick={() => setUrut((u) => u.filter((x) => x !== isi))}
                      >
                        <span className="huruf-bulat">{i + 1}</span>
                        <span className="pt-0.5">{isi ?? '—'}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        {(soal.tipe === 'uraian' || soal.tipe === 'kasus') && (
          <div>
            <label className="label-kecil text-[#6b5b4a]" htmlFor="jawaban-tulis">
              {soal.tipe === 'kasus' ? 'Tulis analisismu' : 'Tulis jawabanmu'}
            </label>
            <textarea
              id="jawaban-tulis"
              className="w-full mt-2 p-3 rounded-xl border-2 border-[#cbb89a] bg-[#fffaf0] focus:border-[#f59120] focus:outline-none min-h-[110px]"
              placeholder="Tulis dengan kalimatmu sendiri…"
              value={teks}
              autoFocus
              disabled={fase === 'umpan'}
              onChange={(e) => setTeks(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
            />
            <p className="text-xs text-[#6b5b4a] mt-1">
              Jawaban diperiksa otomatis memakai kata kunci penting, lalu tetap diperiksa ulang oleh guru melalui Mode Guru.
            </p>
          </div>
        )}

        {/* --------------------------- umpan balik ---------------------------- */}
        {fase === 'umpan' && (
          <div
            className={`rounded-xl p-4 border-2 ${benar ? 'border-[#2e6b3e] bg-[#e6f3e4]' : 'border-[#cbb89a] bg-[#fff6e2]'}`}
          >
            <p className="judul text-lg mb-1">{benar ? 'Hebat! Jawabanmu tepat.' : 'Belum tepat — ayo pelajari bersama.'}</p>
            {!benar && soal.tipe !== 'uraian' && soal.tipe !== 'kasus' && (
              <p className="text-sm mb-2">
                Pilihan yang paling tepat ditandai dengan warna hijau. Tidak apa-apa salah, kesalahan membantu kita belajar.
              </p>
            )}
            {!benar && (soal.tipe === 'uraian' || soal.tipe === 'kasus') && (
              <p className="text-sm mb-2">
                Kata kunci yang sudah kamu tulis: {hasil?.cocok.length ? hasil.cocok.join(', ') : 'belum ada'}. Perlu minimal{' '}
                {kunciUraian.min} kata kunci penting.
              </p>
            )}
            <p className="text-sm font-bold label-kecil text-[#2e6b3e] mb-1">Pembahasan</p>
            <p className="text-[0.95rem] leading-relaxed">{soal.pembahasan}</p>
            {(soal.tipe === 'uraian' || soal.tipe === 'kasus') && (
              <div className="kartu-datar p-3 mt-3 text-sm">
                <p className="label-kecil text-[#2e8fcb] mb-1">Contoh jawaban</p>
                {kunciUraian.contoh}
              </div>
            )}
            {!benar && (
              <div className="mt-3 text-sm border-t border-[#cbb89a] pt-2">
                <span className="label-kecil text-[#f59120]">Bantuan</span>
                <p>{soal.remedial}</p>
              </div>
            )}
            {benar && soal.pengayaan && (
              <div className="mt-3 text-sm border-t border-[#cbb89a] pt-2">
                <span className="label-kecil text-[#2e8fcb]">Tantangan lanjut</span>
                <p>{soal.pengayaan}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 py-4 bg-[#efe6d4] border-t-2 border-[#cbb89a] flex flex-wrap gap-3 justify-end">
        {fase === 'jawab' ? (
          <button className="plang plang-utama sm:w-auto min-w-[200px]" onClick={() => periksa()} disabled={!bisaKirim()}>
            Periksa Jawaban
          </button>
        ) : (
          <>
            {bolehUlang && (
              <button className="plang sm:w-auto min-w-[160px]" onClick={ulangi}>
                Coba Lagi
              </button>
            )}
            <button className="plang plang-hijau sm:w-auto min-w-[200px]" onClick={lanjut}>
              Lanjutkan Misi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
