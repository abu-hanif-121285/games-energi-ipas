/**
 * Mode Guru: kelola bank soal (tambah/ubah/hapus), atur aturan permainan,
 * lihat hasil belajar, dan ekspor CSV.
 * Versi awal memakai localStorage; struktur data disiapkan untuk backend pada tahap berikutnya.
 */
import { useState } from 'react';
import type { Kesulitan, Soal, TipeSoal } from '../data/content';
import { CATATAN_KONTEN, LEVELS, MATERI } from '../data/content';
import { listKustom, simpanKustom, semuaSoal } from '../lib/bank';
import type { DataProgres } from '../lib/storage';
import { eksporCSV, ringkasanMateri, unduhCSV } from '../lib/storage';
import { PapanJudul } from './Screens';

const TIPE: TipeSoal[] = ['pg', 'bs', 'bs_alasan', 'urut', 'uraian', 'kasus'];
const KESULITAN: Kesulitan[] = ['mudah', 'sedang', 'sulit'];

function kosong(id: string): Soal {
  return {
    id,
    level: 1,
    materi: MATERI[0],
    submateri: '',
    indikator: 'Perlu diverifikasi — diisi guru',
    kesulitan: 'mudah',
    tipe: 'pg',
    pertanyaan: '',
    pilihan: ['', '', '', ''],
    kunci: 0,
    pembahasan: '',
    poin: 10,
    retry: true,
    remedial: '',
    pengayaan: '',
  };
}

/**
 * Kata sandi Mode Guru.
 * Disimpan sebagai konstanta internal dan TIDAK PERNAH ditampilkan di layar mana pun.
 * Catatan keamanan: pada versi web statis ini pemeriksaan berjalan di sisi peramban,
 * sehingga kata sandi hanya untuk mencegah siswa membuka menu guru secara tidak sengaja.
 * Untuk penilaian resmi, pemeriksaan sebaiknya dipindahkan ke backend/akun guru (tahap berikutnya).
 */
const KATA_SANDI_GURU = 'Inovatif';

export function GerbangGuru({ onBerhasil, onBatal }: { onBerhasil: () => void; onBatal: () => void }) {
  const [isi, setIsi] = useState('');
  const [galat, setGalat] = useState<string | null>(null);

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (isi.trim().toLowerCase() === KATA_SANDI_GURU.toLowerCase()) {
      setGalat(null);
      setIsi('');
      onBerhasil();
    } else {
      setGalat('Kata sandi belum tepat. Coba lagi atau minta bantuan guru pembina.');
      setIsi('');
    }
  }

  return (
    <div className="denim min-h-full p-3 sm:p-6 flex items-center justify-center">
      <form onSubmit={kirim} className="kartu masuk-kartu w-full max-w-md overflow-hidden">
        <PapanJudul kiri="Mode Guru" kanan={<span className="label-kecil opacity-90">Terbatas</span>} />
        <div className="p-5 space-y-4">
          <p className="leading-relaxed">
            Menu ini berisi bank soal, pengaturan misi, dan hasil belajar siswa. Masukkan kata sandi guru untuk melanjutkan.
          </p>
          <label className="block">
            <span className="label-kecil text-[#6b5b4a]">Kata sandi</span>
            <input
              id="sandi-guru"
              type="password"
              value={isi}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="bantuan-sandi"
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg border-2 border-[#cbb89a] bg-[#fffaf0] focus:border-[#f59120] focus:outline-none tracking-[0.4em]"
              placeholder="••••••••"
              onChange={(e) => setIsi(e.target.value)}
            />
          </label>
          <p id="bantuan-sandi" className="text-xs text-[#6b5b4a]">
            Karakter yang diketik disamarkan dan kata sandi tidak pernah ditampilkan di layar.
          </p>
          {galat && (
            <p role="alert" className="rounded-xl border-2 border-[#E24B33] bg-[#fbe6e2] px-4 py-2 text-sm">
              {galat}
            </p>
          )}
        </div>
        <div className="px-5 py-4 bg-[#efe6d4] border-t-2 border-[#cbb89a] flex flex-wrap gap-3 justify-end">
          <button type="button" className="plang plang-kecil sm:w-auto" onClick={onBatal}>Batal</button>
          <button type="submit" className="plang plang-kecil plang-hijau sm:w-auto">Masuk</button>
        </div>
      </form>
    </div>
  );
}

export function HalamanGuru({ data, onUbah, onKembali, onKunci }: {
  data: DataProgres;
  onUbah: (p: Partial<DataProgres['pengaturan']>) => void;
  onKembali: () => void;
  onKunci: () => void;
}) {
  const [tab, setTab] = useState<'soal' | 'hasil' | 'atur'>('soal');
  const [daftar, setDaftar] = useState<Soal[]>(() => listKustom());
  const [edit, setEdit] = useState<Soal | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [cari, setCari] = useState('');
  const [pratinjau, setPratinjau] = useState<Soal | null>(null);

  const semua = semuaSoal().filter((q) => q.pertanyaan.toLowerCase().includes(cari.toLowerCase()));
  const ringkas = ringkasanMateri(data);

  function simpanSoal() {
    if (!edit) return;
    if (!edit.pertanyaan.trim()) {
      setPesan('Pertanyaan tidak boleh kosong.');
      return;
    }
    const lain = daftar.filter((q) => q.id !== edit.id);
    const baru = [...lain, edit];
    if (simpanKustom(baru)) {
      setDaftar(baru);
      setEdit(null);
      setPesan('Soal tersimpan di perangkat ini.');
    } else {
      setPesan('Gagal menyimpan. Peramban mungkin memblokir penyimpanan lokal.');
    }
  }

  function hapus(id: string) {
    if (!window.confirm('Hapus soal ini? Tindakan ini tidak dapat dibatalkan.')) return;
    const baru = daftar.filter((q) => q.id !== id);
    simpanKustom(baru);
    setDaftar(baru);
  }

  return (
    <div className="denim min-h-full p-3 sm:p-6">
      <div className="max-w-6xl mx-auto kartu overflow-hidden">
        <PapanJudul
          kiri="Mode Guru"
          kanan={
            <div className="flex gap-2">
              <button className="plang plang-kecil sm:w-auto" onClick={onKunci}>🔒 Kunci</button>
              <button className="plang plang-kecil plang-hijau" onClick={onKembali}>← Menu Utama</button>
            </div>
          }
        />
        <div className="flex flex-wrap gap-2 p-4 pb-0">
          {([['soal', 'Bank Soal'], ['hasil', 'Hasil Belajar'], ['atur', 'Pengaturan Misi']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl border-2 border-[#cbb89a] font-bold text-sm ${tab === id ? 'tab-aktif' : 'bg-[#fffaf0]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {pesan && <div className="mx-4 mt-3 rounded-xl bg-[#e6f3e4] border-2 border-[#2E6B3E] px-4 py-2 text-sm">{pesan}</div>}

        {/* ------------------------------ bank soal ----------------------------- */}
        {tab === 'soal' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border-2 border-[#cbb89a] bg-[#fffaf0] focus:border-[#f59120] focus:outline-none"
                placeholder="Cari pertanyaan…"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
              <button
                className="plang plang-kecil sm:w-auto"
                onClick={() => {
                  setEdit(kosong('guru-' + Date.now()));
                  setPesan(null);
                }}
              >
                + Tambah Soal
              </button>
              <button
                className="plang plang-kecil sm:w-auto"
                onClick={() => setPratinjau(semua[0] ?? null)}
              >
                Lihat contoh struktur data
              </button>
            </div>

            <div className="kartu-datar p-3 text-sm border-l-8 border-l-[#F59120]">{CATATAN_KONTEN}</div>

            <div className="overflow-x-auto kartu-datar">
              <table className="w-full text-sm angka">
                <thead className="bg-[#e8dcc6]">
                  <tr>
                    {['ID', 'Level', 'Materi', 'Tipe', 'Kesulitan', 'Poin', 'Aksi'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-bold border-b-2 border-[#cbb89a] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {semua.map((q) => (
                    <tr key={q.id} className="border-b border-[#e8dcc6]">
                      <td className="px-3 py-2 whitespace-nowrap">{q.id}</td>
                      <td className="px-3 py-2">{q.level}</td>
                      <td className="px-3 py-2">{q.materi}</td>
                      <td className="px-3 py-2">{q.tipe}</td>
                      <td className="px-3 py-2">{q.kesulitan}</td>
                      <td className="px-3 py-2">{q.poin}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button className="underline text-[#2E8FCB]" onClick={() => setPratinjau(q)}>Detail</button>
                        {daftar.some((d) => d.id === q.id) && (
                          <>
                            <button className="underline ml-2 text-[#F59120]" onClick={() => setEdit(q)}>Ubah</button>
                            <button className="underline ml-2 text-[#E24B33]" onClick={() => hapus(q.id)}>Hapus</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {edit && (
              <div className="kartu p-4 space-y-3 masuk-kartu">
                <h3 className="judul text-lg">{daftar.some((d) => d.id === edit.id) ? 'Ubah Soal' : 'Tambah Soal'}</h3>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">ID</span>
                    <input className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.id} disabled />
                  </label>
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">Level</span>
                    <select className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.level} onChange={(e) => setEdit({ ...edit, level: Number(e.target.value) })}>
                      {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.id} — {l.nama}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">Materi</span>
                    <select className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.materi} onChange={(e) => setEdit({ ...edit, materi: e.target.value })}>
                      {MATERI.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">Submateri</span>
                    <input className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.submateri} onChange={(e) => setEdit({ ...edit, submateri: e.target.value })} />
                  </label>
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">Tipe soal</span>
                    <select
                      className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]"
                      value={edit.tipe}
                      onChange={(e) => {
                        const t = e.target.value as TipeSoal;
                        const dasar = kosong(edit.id);
                        setEdit({ ...edit, ...dasar, tipe: t, materi: edit.materi, level: edit.level, pertanyaan: edit.pertanyaan, pembahasan: edit.pembahasan });
                      }}
                    >
                      {TIPE.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">Kesulitan</span>
                    <select className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.kesulitan} onChange={(e) => setEdit({ ...edit, kesulitan: e.target.value as Kesulitan })}>
                      {KESULITAN.map((k) => <option key={k}>{k}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">Poin</span>
                    <input type="number" min={5} max={50} className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.poin} onChange={(e) => setEdit({ ...edit, poin: Number(e.target.value) })} />
                  </label>
                  <label className="block">
                    <span className="label-kecil text-[#6b5b4a]">Indikator (perlu diverifikasi)</span>
                    <input className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.indikator} onChange={(e) => setEdit({ ...edit, indikator: e.target.value })} />
                  </label>
                  <label className="flex items-center gap-2 mt-6">
                    <input type="checkbox" className="w-5 h-5 accent-[#F59120]" checked={edit.retry} onChange={(e) => setEdit({ ...edit, retry: e.target.checked })} />
                    Izinkan retry
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="label-kecil text-[#6b5b4a]">Pertanyaan</span>
                  <textarea className="w-full mt-1 px-3 py-2 rounded border-2 border-[#cbb89a]" rows={2} value={edit.pertanyaan} onChange={(e) => setEdit({ ...edit, pertanyaan: e.target.value })} />
                </label>

                {(edit.tipe === 'pg' || edit.tipe === 'bs' || edit.tipe === 'urut') && (
                  <div className="text-sm space-y-2">
                    <span className="label-kecil text-[#6b5b4a]">Pilihan (untuk tipe urut, urutan benar diisi pada kunci)</span>
                    {(edit.pilihan ?? ['', '', '', '']).map((p, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="huruf-bulat">{i + 1}</span>
                        <input
                          className="flex-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]"
                          value={p}
                          onKeyDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const arr = [...(edit.pilihan ?? ['', '', '', ''])];
                            arr[i] = e.target.value;
                            setEdit({ ...edit, pilihan: arr });
                          }}
                        />
                        {(edit.tipe === 'pg' || edit.tipe === 'bs') && (
                          <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                            <input
                              type="radio"
                              name="kunci"
                              checked={edit.kunci === i}
                              onChange={() => setEdit({ ...edit, kunci: i })}
                            />
                            kunci
                          </label>
                        )}
                      </div>
                    ))}
                    {edit.tipe === 'urut' && (
                      <p className="text-xs text-[#6b5b4a]">
                        Untuk tipe urut, isi kunci jawaban pada kolom Pembahasan diawali kata <b>KUNCI:</b> diikuti urutan
                        langkah yang benar, dipisah tanda <b>|</b>.
                      </p>
                    )}
                  </div>
                )}

                {(edit.tipe === 'uraian' || edit.tipe === 'kasus') && (
                  <label className="block text-sm">
                    <span className="label-kecil text-[#6b5b4a]">Kata kunci penilaian (pisahkan tanda | )</span>
                    <input
                      className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]"
                      value={Array.isArray(edit.kunci) ? '' : (edit.kunci as { kataKunci: string[] }).kataKunci?.join(' | ') ?? ''}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          kunci: {
                            kataKunci: e.target.value.split('|').map((s) => s.trim()).filter(Boolean),
                            min: Array.isArray(edit.kunci) ? 2 : (edit.kunci as { min: number }).min ?? 2,
                            contoh: Array.isArray(edit.kunci) ? '' : (edit.kunci as { contoh: string }).contoh ?? '',
                          },
                        })
                      }
                    />
                  </label>
                )}

                <label className="block text-sm">
                  <span className="label-kecil text-[#6b5b4a]">Pembahasan</span>
                  <textarea className="w-full mt-1 px-3 py-2 rounded border-2 border-[#cbb89a]" rows={3} value={edit.pembahasan} onChange={(e) => setEdit({ ...edit, pembahasan: e.target.value })} />
                </label>
                <label className="block text-sm">
                  <span className="label-kecil text-[#6b5b4a]">Remedial</span>
                  <input className="w-full mt-1 px-2 py-1.5 rounded border-2 border-[#cbb89a]" value={edit.remedial} onChange={(e) => setEdit({ ...edit, remedial: e.target.value })} />
                </label>

                <div className="flex gap-3 justify-end">
                  <button className="plang plang-kecil sm:w-auto" onClick={() => setEdit(null)}>Batal</button>
                  <button className="plang plang-kecil plang-hijau sm:w-auto" onClick={simpanSoal}>Simpan Soal</button>
                </div>
              </div>
            )}

            {pratinjau && (
              <div className="kartu-datar p-4 text-sm">
                <p className="label-kecil text-[#2E8FCB] mb-2">Struktur data soal</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs angka">{JSON.stringify(pratinjau, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------- hasil belajar --------------------------- */}
        {tab === 'hasil' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="plang plang-kecil sm:w-auto" onClick={() => unduhCSV(data)}>⬇ Ekspor CSV</button>
              <button
                className="plang plang-kecil sm:w-auto"
                onClick={() => {
                  navigator.clipboard?.writeText(eksporCSV(data));
                  setPesan('Data CSV disalin ke papan klip.');
                }}
              >
                Salin CSV
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="kartu-datar p-4"><p className="label-kecil text-[#6b5b4a]">Nama panggilan</p><p className="judul text-xl">{data.nama}</p></div>
              <div className="kartu-datar p-4"><p className="label-kecil text-[#6b5b4a]">Jumlah soal dijawab</p><p className="judul text-xl angka">{data.percobaan.length}</p></div>
              <div className="kartu-datar p-4"><p className="label-kecil text-[#6b5b4a]">Waktu bermain</p><p className="judul text-xl angka">{Math.round(data.waktuMain / 60)} menit</p></div>
            </div>
            <div className="kartu-datar p-4 text-sm">
              <p className="label-kecil text-[#6b5b4a] mb-2">Penguasaan per materi</p>
              {ringkas.map((r) => (
                <div key={r.materi} className="flex items-center gap-2 mb-2">
                  <span className="w-56 truncate">{r.materi}</span>
                  <div className="bar-bilah flex-1">
                    <div className={`h-full ${r.penguasaan >= 60 ? 'bg-[#2E6B3E]' : 'bg-[#F59120]'}`} style={{ width: `${r.penguasaan}%` }} />
                  </div>
                  <span className="angka w-24 text-right">{r.benar}/{r.total} benar</span>
                </div>
              ))}
            </div>
            <div className="kartu-datar p-4 overflow-x-auto">
              <p className="label-kecil text-[#6b5b4a] mb-2">Riwayat percobaan</p>
              <table className="w-full text-xs angka">
                <thead className="bg-[#e8dcc6]">
                  <tr>{['Waktu', 'Soal', 'Materi', 'Hasil', 'Percobaan', 'Poin'].map((h) => <th key={h} className="text-left px-2 py-1">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[...data.percobaan].reverse().slice(0, 60).map((p, i) => (
                    <tr key={i} className="border-b border-[#e8dcc6]">
                      <td className="px-2 py-1">{new Date(p.waktu).toLocaleString('id-ID')}</td>
                      <td className="px-2 py-1">{p.qid}</td>
                      <td className="px-2 py-1">{p.materi}</td>
                      <td className="px-2 py-1">{p.benar ? 'benar' : 'belum tepat'}</td>
                      <td className="px-2 py-1">{p.percobaan}</td>
                      <td className="px-2 py-1">{p.poin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.percobaan.length === 0 && <p className="text-[#6b5b4a] py-3">Belum ada riwayat. Minta siswa menyelesaikan satu misi lebih dahulu.</p>}
            </div>
          </div>
        )}

        {/* ---------------------------- pengaturan misi -------------------------- */}
        {tab === 'atur' && (
          <div className="p-4 sm:p-6 space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="kartu-datar p-4 flex items-center justify-between gap-3">
                <span className="font-bold">Aktifkan retry soal</span>
                <input type="checkbox" className="w-6 h-6 accent-[#F59120]" checked={data.pengaturan.retry} onChange={(e) => onUbah({ retry: e.target.checked })} />
              </label>
              <label className="kartu-datar p-4 block">
                <span className="font-bold">Waktu pengerjaan per soal</span>
                <input type="range" min={0} max={180} step={15} className="w-full mt-2 accent-[#F59120]" value={data.pengaturan.waktuSoal} onChange={(e) => onUbah({ waktuSoal: Number(e.target.value) })} />
                <span className="angka">{data.pengaturan.waktuSoal === 0 ? 'Tanpa batas' : `${data.pengaturan.waktuSoal} detik`}</span>
              </label>
            </div>
            <div className="kartu-datar p-4">
              <p className="label-kecil text-[#6b5b4a] mb-2">Pemetaan soal pada setiap level</p>
              <ul className="space-y-1.5 angka">
                {LEVELS.map((l) => {
                  const dipakai = semuaSoal().filter((q) => q.level === l.id);
                  return (
                    <li key={l.id} className="flex flex-wrap gap-2 items-center">
                      <b className="w-56">{l.nama}</b>
                      <span>{dipakai.length} soal</span>
                      <span className="text-[#6b5b4a]">target benar {l.targetBenar} · target kartu {l.targetKartu}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[#6b5b4a] mt-2">
                Soal tambahan yang dibuat guru dengan <b>Level</b> yang sama akan otomatis tersedia pada level tersebut.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
