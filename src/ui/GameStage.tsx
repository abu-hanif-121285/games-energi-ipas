/**
 * Arena permainan: canvas + HUD plang kayu + panel informasi/soal/jeda/misi
 * + tombol sentuh untuk tablet dan telepon genggam.
 */
import { useEffect, useRef, useState } from 'react';
import type { LevelDef, ObjDef, Soal } from '../data/content';
import { Game } from '../game/engine';
import type { Aksi, GameEvent, Hud } from '../game/engine';
import { soalById } from '../lib/bank';
import { audio } from '../game/audio';
import { PanelSoal } from './Quiz';

export interface HasilMain {
  gagal: boolean;
  gp: number;
  lp: number;
  kartu: number;
  kartuTotal: number;
  waktu: number;
  benar: number;
  salah: number;
}

type Panel =
  | null
  | { t: 'info'; obj: ObjDef; selesai: boolean }
  | { t: 'soal'; obj: ObjDef; soal: Soal }
  | { t: 'jeda' }
  | { t: 'misi' }
  | { t: 'gerbang'; kurang: string };

const HUD_AWAL: Hud = {
  hp: 3, maxHp: 3, energi: 100, gp: 0, lp: 0, kartu: 0, kartuTotal: 0,
  benar: 0, targetBenar: 3, prompt: null, gerbangSiap: false,
};

export function ArenaMain({
  level,
  izinkanRetry,
  waktuSoal,
  onJawab,
  onHasil,
  onKeluar,
}: {
  level: LevelDef;
  izinkanRetry: boolean;
  waktuSoal: number;
  onJawab: (hasil: { qid: string; benar: boolean; percobaan: number; poin: number }) => void;
  onHasil: (h: HasilMain) => void;
  onKeluar: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [hud, setHud] = useState<Hud>(HUD_AWAL);
  const [panel, setPanel] = useState<Panel>(null);
  const [sentuh, setSentuh] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const statistik = useRef({ benar: 0, salah: 0, gp: 0, lp: 0, kartu: 0, kartuTotal: 0, waktu: 0 });
  const mulai = useRef<number>(Date.now());

  /* -------------------------- siklus hidup mesin -------------------------- */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    let g: Game | null = null;
    try {
      g = new Game(c, level, (e: GameEvent) => {
        if (e.t === 'hud') {
          setHud(e.hud);
          statistik.current.gp = e.hud.gp;
          statistik.current.lp = e.hud.lp;
          statistik.current.kartu = e.hud.kartu;
          statistik.current.kartuTotal = e.hud.kartuTotal;
          statistik.current.benar = e.hud.benar;
        } else if (e.t === 'interaksi') {
          setPanel({ t: 'info', obj: e.obj, selesai: e.selesai });
          g?.jeda(true);
        } else if (e.t === 'gerbang') {
          setPanel({ t: 'gerbang', kurang: e.kurang });
          g?.jeda(true);
        } else if (e.t === 'selesai') {
          statistik.current.gp = e.gp;
          statistik.current.lp = e.lp;
          statistik.current.waktu = e.waktu;
          statistik.current.kartu = e.kartu;
          statistik.current.kartuTotal = e.kartuTotal;
          onHasil({ gagal: false, ...statistik.current });
        } else if (e.t === 'gagal') {
          statistik.current.waktu = Math.round((Date.now() - mulai.current) / 1000);
          onHasil({ gagal: true, ...statistik.current });
        }
      });
      g.mulai();
    } catch (err) {
      console.error('Gagal memulai game:', err);
    }
    gameRef.current = g;
    return () => {
      g?.hancurkan();
      gameRef.current = null;
    };
  }, [level, onHasil]);

  /* ------------------------- keyboard: Esc & P ---------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // jangan ambil alih keyboard saat pengguna sedang mengetik jawaban
      const t = e.target as HTMLElement | null;
      const mengetik =
        !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable === true);
      if (mengetik) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        setPanel((p) => (p === null ? { t: 'jeda' } : p.t === 'jeda' ? null : p));
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        setPanel((p) => (p === null ? { t: 'misi' } : p.t === 'misi' ? null : p));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // pastikan mesin berhenti saat panel terbuka / lanjut saat ditutup
  useEffect(() => {
    gameRef.current?.jeda(panel !== null);
  }, [panel]);

  /* ------------------------------- aksi UI -------------------------------- */
  function tutupPanel() {
    setPanel(null);
  }

  function mulaiSoal(obj: ObjDef) {
    const s = obj.soalId ? soalById(obj.soalId) : undefined;
    if (!s) {
      setPanel(null);
      return;
    }
    setPanel({ t: 'soal', obj, soal: s });
  }

  function selesaiSoal(obj: ObjDef, benar: boolean, percobaan: number, poin: number) {
    onJawab({ qid: obj.soalId ?? obj.id, benar, percobaan, poin });
    gameRef.current?.setJawaban(obj.id, benar);
    if (benar) gameRef.current?.tambahLP(poin);
    setPanel(null);
  }

  const tekanSentuh = (aksi: Aksi) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      gameRef.current?.tekan(aksi, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      gameRef.current?.tekan(aksi, false);
    },
    onPointerLeave: () => gameRef.current?.tekan(aksi, false),
    onPointerCancel: () => gameRef.current?.tekan(aksi, false),
  });

  return (
    <div className="w-full min-h-screen bg-[#2b3a55] flex flex-col">
      {/* ------------------------------- HUD -------------------------------- */}
      <div className="flex items-start justify-between gap-2 p-2 sm:p-3 pointer-events-none">
        <div className="papan-judul px-3 py-2 flex items-center gap-3 pointer-events-auto">
          <div>
            <p className="label-kecil opacity-85">Misi {String(level.id).padStart(2, '0')}</p>
            <p className="judul text-sm sm:text-base leading-tight">{level.nama}</p>
          </div>
          <div className="flex gap-1 text-xl" aria-label={`Energi ${hud.hp} dari ${hud.maxHp}`}>
            {Array.from({ length: hud.maxHp }).map((_, i) => (
              <span key={i} className={i < hud.hp ? '' : 'opacity-30'}>{i < hud.hp ? '❤' : '♡'}</span>
            ))}
          </div>
          <div className="hidden sm:block w-28">
            <p className="label-kecil opacity-85">Energi Cast</p>
            <div className="bar-bilah mt-1 border-white/40 bg-white/20">
              <div className="h-full bg-[#FFC93C]" style={{ width: `${hud.energi}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="papan-judul px-3 py-2 angka text-sm flex gap-3">
            <span title="Skor gameplay">GP <b>{hud.gp}</b></span>
            <span title="Skor pembelajaran">LP <b>{hud.lp}</b></span>
            <span title="Kartu energi">◆ {hud.kartu}/{hud.kartuTotal}</span>
          </div>
          <div className={`papan-judul px-3 py-1.5 text-sm ${hud.gerbangSiap ? 'ring-2 ring-[#FFC93C]' : ''}`}>
            Misi pengetahuan <b className="angka">{hud.benar}/{hud.targetBenar}</b>
          </div>
          <div className="flex gap-2">
            <button className="plang plang-kecil sm:w-auto" onClick={() => setPanel({ t: 'misi' })}>Misi</button>
            <button className="plang plang-kecil sm:w-auto" onClick={() => setPanel({ t: 'jeda' })}>❚❚</button>
          </div>
        </div>
      </div>

      {/* ----------------------------- kanvas -------------------------------- */}
      <div className="relative flex-1 w-full flex items-center justify-center px-2 pb-2">
        <div className="relative w-full max-w-[1100px] aspect-[16/9] rounded-2xl overflow-hidden border-4 border-[#5C3A1E] shadow-2xl">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-label="Arena permainan Energy Hero" />

          {hud.prompt && !panel && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#5C3A1E]/90 text-[#FFF8EA] px-4 py-1.5 rounded-full text-sm font-bold animate-pulse">
              {hud.prompt}
            </div>
          )}

          {/* petunjuk kecil di dalam arena */}
          {!sentuh && !panel && hud.gerbangSiap && (
            <div className="absolute bottom-3 right-3 bg-[#2E6B3E] text-white px-3 py-1.5 rounded-full text-xs font-bold">
              Gerbang siap dibuka →
            </div>
          )}

          {/* --------------------------- panel overlay -------------------------- */}
          {panel && (
            <div className="fixed inset-0 z-50 bg-[#2b3a55]/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
              {panel.t === 'info' && (
                <div className="kartu masuk-kartu w-full max-w-xl">
                  <div className="papan-judul px-4 py-2.5">
                    <h3 className="judul text-lg">{panel.obj.label}</h3>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3 max-h-[50vh] overflow-y-auto">
                    {panel.obj.info.map((t, i) => (
                      <p key={i} className="leading-relaxed">{t}</p>
                    ))}
                    <p className="text-xs text-[#6b5b4a] border-t border-[#cbb89a] pt-2">
                      Unsur fantasi: kekuatan Energy Hero digunakan untuk hiburan dan bukan gambaran proses ilmiah nyata.
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-[#efe6d4] border-t-2 border-[#cbb89a] flex flex-wrap gap-3 justify-end">
                    <button className="plang plang-kecil sm:w-auto" onClick={tutupPanel}>Tutup</button>
                    {panel.obj.soalId && (
                      <button className="plang plang-kecil plang-utama sm:w-auto" onClick={() => mulaiSoal(panel.obj)}>
                        {panel.selesai ? 'Ulangi Misi Pengetahuan' : 'Mulai Misi Pengetahuan'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {panel.t === 'soal' && (
                <PanelSoal
                  soal={panel.soal}
                  izinkanRetry={izinkanRetry}
                  waktuSoal={waktuSoal}
                  onSelesai={(h) => selesaiSoal(panel.obj, h.benar, h.percobaan, h.poin)}
                />
              )}

              {panel.t === 'gerbang' && (
                <div className="kartu masuk-kartu w-full max-w-md text-center">
                  <div className="papan-judul px-4 py-2.5"><h3 className="judul text-lg">Gerbang Misi</h3></div>
                  <div className="p-5 space-y-3">
                    <p>Gerbang belum terbuka. Masih diperlukan <b>{panel.kurang}</b>.</p>
                    <p className="text-sm text-[#6b5b4a]">
                      Telusuri kembali wilayah ini dan tekan <b>E</b> pada objek bercahaya untuk membuka misi pengetahuan.
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-[#efe6d4] border-t-2 border-[#cbb89a] flex justify-end">
                    <button className="plang plang-kecil plang-hijau sm:w-auto" onClick={tutupPanel}>Mengerti</button>
                  </div>
                </div>
              )}

              {panel.t === 'misi' && (
                <div className="kartu masuk-kartu w-full max-w-xl">
                  <div className="papan-judul px-4 py-2.5"><h3 className="judul text-lg">Panel Misi</h3></div>
                  <div className="p-4 sm:p-5 space-y-3 max-h-[54vh] overflow-y-auto">
                    <p className="leading-relaxed">{level.latar}</p>
                    <p className="label-kecil text-[#2E8FCB]">Tujuan pembelajaran</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {level.tujuan.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                    <p className="label-kecil text-[#F59120]">Sasaran misi</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm angka">
                      <li>Jawab benar minimal {level.targetBenar} misi pengetahuan (saat ini {hud.benar})</li>
                      <li>Kumpulkan minimal {level.targetKartu} kartu energi (saat ini {hud.kartu})</li>
                      <li>Buka gerbang misi di ujung wilayah</li>
                    </ul>
                    <p className="label-kecil text-[#6b5b4a]">Kontrol</p>
                    <p className="text-sm angka">A/D gerak · W/Spasi lompat · J pukul · K tendang · L Energy Cast · E interaksi · Esc jeda</p>
                  </div>
                  <div className="px-4 py-3 bg-[#efe6d4] border-t-2 border-[#cbb89a] flex justify-end">
                    <button className="plang plang-kecil plang-hijau sm:w-auto" onClick={tutupPanel}>Kembali Bermain</button>
                  </div>
                </div>
              )}

              {panel.t === 'jeda' && (
                <div className="kartu masuk-kartu w-full max-w-sm">
                  <div className="papan-judul px-4 py-2.5"><h3 className="judul text-lg">Permainan Dijeda</h3></div>
                  <div className="p-5 grid gap-3">
                    <button className="plang plang-utama" onClick={tutupPanel}>▶ Lanjutkan</button>
                    <button className="plang" onClick={() => setPanel({ t: 'misi' })}>⚑ Lihat Panel Misi</button>
                    <button
                      className="plang"
                      onClick={() => {
                        audio.musik = !audio.musik;
                        if (audio.musik) audio.mulaiMusik();
                        else audio.hentikanMusik();
                      }}
                    >
                      ♪ Musik: {audio.musik ? 'Nyala' : 'Mati'}
                    </button>
                    <button
                      className="plang"
                      onClick={() => {
                        audio.efek = !audio.efek;
                        audio.fx('klik');
                      }}
                    >
                      🔊 Efek suara: {audio.efek ? 'Nyala' : 'Mati'}
                    </button>
                    <button className="plang plang-kecil" onClick={() => setSentuh((v) => !v)}>
                      Tombol sentuh: {sentuh ? 'Tampil' : 'Tersembunyi'}
                    </button>
                    <button className="plang plang-kecil plang-hijau" onClick={onKeluar}>← Keluar ke Peta Misi</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------- kontrol sentuh (tablet/HP) --------------------- */}
      {sentuh && !panel && (
        <div className="flex items-center justify-between gap-2 px-2 pb-2 select-none">
          <div className="flex gap-2">
            <button className="tombol-sentuh w-16 h-16 text-2xl" aria-label="Ke kiri" {...tekanSentuh('kiri')}>←</button>
            <button className="tombol-sentuh w-16 h-16 text-2xl" aria-label="Ke kanan" {...tekanSentuh('kanan')}>→</button>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button className="tombol-sentuh w-16 h-16 text-xs" aria-label="Pukul" {...tekanSentuh('pukul')}>Pukul</button>
            <button className="tombol-sentuh w-16 h-16 text-xs" aria-label="Tendang" {...tekanSentuh('tendang')}>Tendang</button>
            <button className="tombol-sentuh w-16 h-16 text-xs" aria-label="Energi" {...tekanSentuh('energi')}>Energi</button>
            <button className="tombol-sentuh w-16 h-16 text-xs" aria-label="Interaksi" {...tekanSentuh('interaksi')}>E / Info</button>
            <button className="tombol-sentuh w-16 h-16 text-2xl" aria-label="Lompat" {...tekanSentuh('lompat')}>↑</button>
          </div>
        </div>
      )}

      {/* petunjuk ringkas untuk desktop */}
      {!sentuh && (
        <p className="text-center text-[#FFF8EA]/80 text-xs pb-2 px-3">
          A/D gerak · W/Spasi lompat · J pukul · K tendang · L Energy Cast · E interaksi · Esc jeda · P panel misi
        </p>
      )}
    </div>
  );
}
