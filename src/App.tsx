/**
 * ENERGY HERO — Misi Penjaga Masa Depan
 * Titik masuk aplikasi: alur layar, progres belajar, dan penyimpanan lokal.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVELS, BADGES } from './data/content';
import { soalById } from './lib/bank';
import type { DataProgres, Percobaan } from './lib/storage';
import { dataAwal, levelTerbukaEfektif, muat, reset as resetData, simpan } from './lib/storage';
import { audio } from './game/audio';
import {
  HalamanHasil,
  HalamanKoleksi,
  HalamanPencapaian,
  HalamanPengaturan,
  HalamanPetunjuk,
  PetaMisi,
  Sampul,
} from './ui/Screens';
import { GerbangGuru, HalamanGuru } from './ui/Teacher';
import { ArenaMain } from './ui/GameStage';
import type { HasilMain } from './ui/GameStage';

type Layar = 'sampul' | 'peta' | 'main' | 'hasil' | 'pencapaian' | 'koleksi' | 'pengaturan' | 'petunjuk' | 'guru';

export default function App() {
  const [data, setData] = useState<DataProgres>(() => (typeof window === 'undefined' ? dataAwal() : muat()));
  const [layar, setLayar] = useState<Layar>('sampul');
  const [levelAktif, setLevelAktif] = useState<number>(1);
  const [hasil, setHasil] = useState<HasilMain | null>(null);
  const [guruTerbuka, setGuruTerbuka] = useState(false);
  // id level yang sedang/benar-benar dimainkan, dibaca dari ref agar tidak pernah basi
  const levelRef = useRef<number>(1);
  const sesi = useRef<Percobaan[]>([]);
  const mulaiWaktu = useRef<number>(0);

  /* --------------------------- penyimpanan lokal -------------------------- */
  useEffect(() => {
    simpan(data);
  }, [data]);

  useEffect(() => {
    audio.efek = data.pengaturan.efek;
    audio.musik = data.pengaturan.musik;
    audio.setVolume(data.pengaturan.volume);
    if (layar === 'main') audio.hentikanMusik();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layar]);

  // Musik baru dimulai setelah interaksi pertama pengguna (aturan peramban).
  useEffect(() => {
    const mulai = () => {
      if (muat().pengaturan.musik && layar !== 'main') audio.mulaiMusik();
    };
    window.addEventListener('pointerdown', mulai, { once: true });
    window.addEventListener('keydown', mulai, { once: true });
    return () => {
      window.removeEventListener('pointerdown', mulai);
      window.removeEventListener('keydown', mulai);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ pencapaian ------------------------------ */
  function beriPencapaian(d: DataProgres): DataProgres {
    const badges = new Set(d.badges);
    Object.keys(d.levelSelesai).forEach((k) => {
      const idx = Number(k) - 1;
      const b = BADGES[idx];
      if (b) badges.add(b.id);
    });
    if (d.kartu >= 30) badges.add('kolektor');
    if (d.percobaan.filter((p) => p.benar).length >= 10) badges.add('tegas');
    if (d.percobaan.filter((p) => p.percobaan > 1).length >= 5) badges.add('pantang');
    return { ...d, badges: [...badges] };
  }

  /* -------------------------------- alur game ----------------------------- */
  const mulaiLevel = useCallback((id: number) => {
    const aman = Math.min(LEVELS.length, Math.max(1, id));
    sesi.current = [];
    mulaiWaktu.current = Date.now();
    levelRef.current = aman;
    setLevelAktif(aman);
    setHasil(null);
    setLayar('main');
  }, []);

  const catatJawab = useCallback((h: { qid: string; benar: boolean; percobaan: number; poin: number }) => {
    const level = LEVELS.find((l) => l.id === levelRef.current) ?? LEVELS[0];
    const s = soalById(h.qid);
    const p: Percobaan = {
      qid: h.qid,
      level: level.id,
      materi: s?.materi ?? 'Energi untuk masa depan',
      tipe: s?.tipe ?? 'pg',
      kesulitan: s?.kesulitan ?? 'sedang',
      benar: h.benar,
      percobaan: h.percobaan,
      poin: h.poin,
      waktu: Date.now(),
    };
    sesi.current.push(p);
    setData((d) => beriPencapaian({ ...d, percobaan: [...d.percobaan, p] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelAktif]);

  const terimaHasil = useCallback((h: HasilMain) => {
    const level = LEVELS.find((l) => l.id === levelRef.current) ?? LEVELS[0];
    const salah = sesi.current.filter((s) => !s.benar).length;
    const benar = sesi.current.filter((s) => s.benar).length;
    const bintang = (h.gagal ? 0 : 1) + (salah === 0 && benar > 0 ? 1 : 0) + (h.kartuTotal > 0 && h.kartu === h.kartuTotal ? 1 : 0);
    const waktu = Math.max(1, Math.round((Date.now() - mulaiWaktu.current) / 1000));
    setHasil({ ...h, benar, salah, waktu });

    setData((d) =>
      beriPencapaian({
        ...d,
        gp: d.gp + (h.gagal ? Math.round(h.gp / 2) : h.gp),
        lp: d.lp + h.lp,
        kartu: d.kartu + h.kartu,
        waktuMain: d.waktuMain + waktu,
        kemampuan: h.gagal ? d.kemampuan : d.kemampuan.includes(level.mampu) ? d.kemampuan : [...d.kemampuan, level.mampu],
        levelTerbuka: h.gagal
          ? levelTerbukaEfektif(d, LEVELS.length)
          : Math.max(levelTerbukaEfektif(d, LEVELS.length), Math.min(LEVELS.length, level.id + 1)),
        levelSelesai: h.gagal
          ? d.levelSelesai
          : {
              ...d.levelSelesai,
              [String(level.id)]: {
                bintang: Math.max(d.levelSelesai[String(level.id)]?.bintang ?? 0, bintang),
                gp: h.gp,
                lp: h.lp,
                benar,
                salah,
                waktu,
              },
            },
      })
    );
    setLayar('hasil');
  }, [levelAktif]);

  const level = LEVELS.find((l) => l.id === levelAktif) ?? LEVELS[0];

  return (
    <div className="min-h-full">
      {layar === 'sampul' && (
        <Sampul
          data={data}
          onSetNama={(n) => setData((d) => ({ ...d, nama: n.slice(0, 16) }))}
          onMulai={() => mulaiLevel(1)}
          onLanjut={() => mulaiLevel(levelTerbukaEfektif(data, LEVELS.length))}
          onPeta={() => setLayar('peta')}
          onGuru={() => setLayar('guru')}
          onPengaturan={() => setLayar('pengaturan')}
          onPetunjuk={() => setLayar('petunjuk')}
          onPencapaian={() => setLayar('pencapaian')}
          onKoleksi={() => setLayar('koleksi')}
          onReset={() => {
            setData((d) => resetData(d));
            setLayar('sampul');
          }}
        />
      )}

      {layar === 'peta' && <PetaMisi data={data} onPilih={mulaiLevel} onKembali={() => setLayar('sampul')} />}

      {layar === 'main' && (
        <ArenaMain
          key={`level-${levelAktif}-${mulaiWaktu.current || 0}`}
          level={level}
          izinkanRetry={data.pengaturan.retry}
          waktuSoal={data.pengaturan.waktuSoal}
          onJawab={catatJawab}
          onHasil={terimaHasil}
          onKeluar={() => setLayar('peta')}
        />
      )}

      {layar === 'hasil' && hasil && (
        <HalamanHasil
          level={level}
          gp={hasil.gp}
          lp={hasil.lp}
          benar={hasil.benar}
          salah={hasil.salah}
          kartu={hasil.kartu}
          kartuTotal={hasil.kartuTotal}
          waktu={hasil.waktu}
          data={data}
          gagal={hasil.gagal}
          onPeta={() => setLayar('peta')}
          onUlang={() => mulaiLevel(level.id)}
          onLanjut={() => mulaiLevel(levelTerbukaEfektif(data, LEVELS.length))}
        />
      )}

      {layar === 'pencapaian' && <HalamanPencapaian data={data} onKembali={() => setLayar('sampul')} />}
      {layar === 'koleksi' && <HalamanKoleksi data={data} onKembali={() => setLayar('sampul')} />}
      {layar === 'petunjuk' && <HalamanPetunjuk onKembali={() => setLayar('sampul')} />}
      {layar === 'pengaturan' && (
        <HalamanPengaturan
          data={data}
          onUbah={(p) => setData((d) => ({ ...d, pengaturan: { ...d.pengaturan, ...p } }))}
          onKembali={() => setLayar('sampul')}
        />
      )}
      {layar === 'guru' &&
        (guruTerbuka ? (
          <HalamanGuru
            data={data}
            onUbah={(p) => setData((d) => ({ ...d, pengaturan: { ...d.pengaturan, ...p } }))}
            onKembali={() => setLayar('sampul')}
            onKunci={() => {
              setGuruTerbuka(false);
              setLayar('sampul');
            }}
          />
        ) : (
          <GerbangGuru onBerhasil={() => setGuruTerbuka(true)} onBatal={() => setLayar('sampul')} />
        ))}
    </div>
  );
}


