/**
 * ENERGY HERO — mesin game 2D (HTML5 Canvas, tanpa library).
 *
 * Catatan: seluruh "kekuatan energi" tokoh (Energy Cast, Solar/Wind/Hydro Power)
 * adalah UNSUR FANTASI untuk hiburan, bukan gambaran proses ilmiah yang sebenarnya.
 *
 * Alur belajar di dalam game: ACTION -> OBSERVE -> THINK -> ANSWER -> FEEDBACK -> REFLECT
 * (bagian ANSWER/FEEDBACK/REFLECT ditangani oleh panel React yang membuka soal).
 */

import type { LevelDef, ObjDef, MusuhDef } from '../data/content';
import { audio } from './audio';

export type Aksi = 'kiri' | 'kanan' | 'lompat' | 'pukul' | 'tendang' | 'energi' | 'interaksi';

export interface Hud {
  hp: number;
  maxHp: number;
  energi: number;
  gp: number;
  lp: number;
  kartu: number;
  kartuTotal: number;
  benar: number;
  targetBenar: number;
  prompt: string | null;
  gerbangSiap: boolean;
}

export type GameEvent =
  | { t: 'hud'; hud: Hud }
  | { t: 'interaksi'; obj: ObjDef; selesai: boolean }
  | { t: 'gerbang'; siap: boolean; kurang: string }
  | { t: 'selesai'; gp: number; lp: number; kartu: number; kartuTotal: number; waktu: number }
  | { t: 'gagal'; alasan: string };

const LEBAR_TAMPIL = 960;
const TINGGI_TAMPIL = 540;
const TANAH = 470;

interface Platform {
  x: number;
  y: number;
  w: number;
}

interface Partikel {
  x: number;
  y: number;
  vx: number;
  vy: number;
  umur: number;
  maks: number;
  r: number;
  warna: string;
}

interface Proyektil {
  x: number;
  y: number;
  vx: number;
  umur: number;
  kena: Set<string>;
}

interface ObjekRuntime extends ObjDef {
  selesai: boolean;
  berdenyut: number;
}

interface MusuhRuntime extends MusuhDef {
  w: number;
  h: number;
  vx: number;
  perisai: boolean;
  hidup: boolean;
  kenaT: number;
  langkah: number;
  matiT: number;
}

interface Hero {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hadap: 1 | -1;
  diTanah: boolean;
  hp: number;
  energi: number;
  state: string;
  t: number;
  kebal: number;
  faseLari: number;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private level: LevelDef;
  private onEvent: (e: GameEvent) => void;
  private raf = 0;
  private last = 0;
  private berjalan = false;
  private jedaMode = false;
  private waktu = 0;

  private hero: Hero;
  private objek: ObjekRuntime[] = [];
  private musuh: MusuhRuntime[] = [];
  private kartu: { x: number; y: number; ambil: boolean; fase: number }[] = [];
  private proyektil: Proyektil[] = [];
  private partikel: Partikel[] = [];
  private platform: Platform[] = [];

  private kunci: Record<Aksi, boolean> = {
    kiri: false, kanan: false, lompat: false, pukul: false, tendang: false, energi: false, interaksi: false,
  };
  private cooldown = 0;
  private camX = 0;
  private gp = 0;
  private lp = 0;
  private benar = 0;
  private kartuAmbil = 0;
  private gambar: HTMLImageElement | null = null;
  private gambarSiap = false;
  private dekat: ObjekRuntime | null = null;
  private hudT = 0;
  private selesai = false;
  private listrik = 0; // animasi "kota menyala" setelah misi selesai

  constructor(canvas: HTMLCanvasElement, level: LevelDef, onEvent: (e: GameEvent) => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D tidak tersedia pada perangkat ini.');
    this.ctx = ctx;
    this.level = level;
    this.onEvent = onEvent;

    this.hero = {
      x: 90, y: TANAH - 62, w: 38, h: 62, vx: 0, vy: 0, hadap: 1,
      diTanah: true, hp: 3, energi: 100, state: 'idle', t: 0, kebal: 0, faseLari: 0,
    };
    this.platform = level.platform.map((p) => ({ ...p }));
    this.objek = level.objek.map((o) => ({ ...o, selesai: false, berdenyut: Math.random() * 6 }));
    this.musuh = level.musuh.map((m) => ({
      ...m,
      w: m.jenis === 'boss' ? 96 : m.jenis === 'drone' ? 46 : 54,
      h: m.jenis === 'boss' ? 96 : m.jenis === 'drone' ? 38 : 52,
      vx: m.jenis === 'drone' ? 60 : 45,
      perisai: Boolean(m.perisaiSoal),
      hidup: true,
      kenaT: 0,
      langkah: Math.random() * 6,
      matiT: 0,
    }));
    this.kartu = level.kartu.map((k) => ({ ...k, ambil: false, fase: Math.random() * 6 }));
    // gerbang misi ikut menjadi objek interaktif
    this.objek.push({
      id: 'gerbang-' + level.id,
      art: 'gerbang',
      x: level.gerbang.x,
      y: level.gerbang.y,
      label: 'Gerbang Misi',
      info: [],
      selesai: false,
      berdenyut: 0,
    });

    const img = new Image();
    img.onload = () => { this.gambarSiap = true; };
    img.onerror = () => { this.gambarSiap = false; };
    img.src = level.bg;
    this.gambar = img;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.ukurUlang);
    this.ukurUlang();
  }

  /* ------------------------------- kontrol ------------------------------- */

  /**
   * Apakah tombol sedang dipakai untuk mengetik (kolom isian, textarea, dsb.)?
   * Jika ya, keyboard game TIDAK boleh mencegah huruf masuk — ini penting untuk
   * soal uraian dan studi kasus.
   */
  private static sedangMengetik(e: KeyboardEvent): boolean {
    const t = e.target as HTMLElement | null;
    if (!t) return false;
    const tag = t.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable === true;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.jedaMode || Game.sedangMengetik(e)) return;
    const a = keAksi(e.code, e.key);
    if (a) {
      e.preventDefault();
      if (!e.repeat) this.tekan(a, true);
    }
  };
  private onKeyUp = (e: KeyboardEvent) => {
    const a = keAksi(e.code, e.key);
    if (a) {
      if (!Game.sedangMengetik(e)) e.preventDefault();
      this.kunci[a] = false;
    }
  };

  /** Dipakai tombol layar sentuh. */
  tekan(aksi: Aksi, turun: boolean) {
    if (this.jedaMode) return;
    const sebelum = this.kunci[aksi];
    this.kunci[aksi] = turun;
    if (!turun) return;
    if (sebelum) return;
    switch (aksi) {
      case 'lompat':
        if (this.hero.diTanah) {
          this.hero.vy = -720;
          this.hero.diTanah = false;
          this.set('jump');
          audio.fx('lompat');
          this.asap(this.hero.x + this.hero.w / 2, this.hero.y + this.hero.h, 5, '#FFFFFF');
        }
        break;
      case 'pukul':
        this.serang('punch');
        break;
      case 'tendang':
        this.serang('kick');
        break;
      case 'energi':
        this.lepasEnergi();
        break;
      case 'interaksi':
        this.interaksi();
        break;
      default:
        break;
    }
  }

  interaksi() {
    const o = this.dekat;
    if (!o) return;
    audio.fx('buka');
    if (o.art === 'gerbang') {
      const kurang = this.kekuranganGerbang();
      if (kurang) this.onEvent({ t: 'gerbang', siap: false, kurang });
      else this.rampungkan();
      return;
    }
    this.onEvent({ t: 'interaksi', obj: o, selesai: o.selesai });
  }

  jeda(v: boolean) {
    this.jedaMode = v;
    // bebaskan seluruh tombol saat jeda agar karakter tidak "lari sendiri" setelah panel ditutup
    (Object.keys(this.kunci) as Aksi[]).forEach((k) => {
      this.kunci[k] = false;
    });
    if (!v) this.last = performance.now();
  }

  setJawaban(objId: string, benar: boolean) {
    const o = this.objek.find((x) => x.id === objId);
    if (!o) return;
    if (benar) {
      // objek yang sudah selesai tidak dihitung dua kali
      if (!o.selesai) {
        this.benar += 1;
        this.gp += o.bonusGP ?? 0; // bonus menyelesaikan objek penting (generator, mesin, menara)
      }
      o.selesai = true;
      if (o.bukaMusuh) {
        const m = this.musuh.find((x) => x.id === o.bukaMusuh);
        if (m) m.perisai = false;
      }
      this.asap(o.x, o.y - 40, 22, '#FFC93C');
    } else if (o.soalId === undefined || !o.selesai) {
      // soal salah tetap dapat dicoba lagi sesuai aturan retry; objek belum terbuka
      o.berdenyut = 0;
    }
    this.kirimHud();
  }

  tambahLP(n: number) {
    this.lp += n;
    this.kirimHud();
  }

  /* ------------------------------- pertarungan ------------------------------ */

  private set(s: string) {
    this.hero.state = s;
    this.hero.t = 0;
  }

  private serang(jenis: 'punch' | 'kick') {
    if (this.cooldown > 0 || !this.hero.diTanah) return;
    if (this.hero.state === 'punch' || this.hero.state === 'kick' || this.hero.state === 'cast') return;
    this.set(jenis);
    this.cooldown = jenis === 'punch' ? 0.32 : 0.45;
    audio.fx(jenis === 'punch' ? 'pukul' : 'tendang');
    const jarak = jenis === 'punch' ? 62 : 88;
    const dmg = jenis === 'punch' ? 1 : 2;
    const hx = this.hero.x + this.hero.w / 2;
    this.musuh.forEach((m) => {
      if (!m.hidup) return;
      const dx = m.x + m.w / 2 - hx;
      if (Math.abs(dx) < jarak && Math.abs(m.y + m.h / 2 - (this.hero.y + this.hero.h / 2)) < 60) {
        this.serangMusuh(m, dmg, Math.sign(dx) || 1);
      }
    });
  }

  private lepasEnergi() {
    if (this.hero.energi < 25 || this.cooldown > 0) return;
    if (this.hero.state === 'punch' || this.hero.state === 'kick' || this.hero.state === 'cast') return;
    this.hero.energi -= 25;
    this.set('cast');
    this.cooldown = 0.5;
    audio.fx('energi');
    const hx = this.hero.x + this.hero.w / 2;
    this.proyektil.push({ x: hx + this.hero.hadap * 26, y: this.hero.y + 24, vx: this.hero.hadap * 460, umur: 1.4, kena: new Set() });
    // Energy Cast juga menghidupkan objek teknologi terdekat (efek fantasi)
    if (this.dekat && !this.dekat.selesai && (this.dekat.art === 'generator' || this.dekat.art === 'panelSurya' || this.dekat.art === 'mesin')) {
      this.dekat.berdenyut = 0;
    }
  }

  private serangMusuh(m: MusuhRuntime, dmg: number, arah: number) {
    if (m.perisai) {
      this.asap(m.x + m.w / 2, m.y + m.h / 2, 8, '#2E8FCB');
      return;
    }
    m.hp -= dmg;
    m.kenaT = 0.25;
    m.vx = 45 * arah;
    this.asap(m.x + m.w / 2, m.y + m.h / 2, 8, '#FFC93C');
    if (m.hp <= 0) {
      m.hidup = false;
      m.matiT = 0.6;
      this.gp += 15;
      this.asap(m.x + m.w / 2, m.y + m.h / 2, 24, '#F59120');
      audio.fx('koin');
      this.kirimHud();
    }
  }

  private asap(x: number, y: number, n: number, warna: string) {
    for (let i = 0; i < n; i++) {
      this.partikel.push({
        x, y,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.7) * 220,
        umur: 0, maks: 0.5 + Math.random() * 0.5,
        r: 3 + Math.random() * 5, warna,
      });
    }
  }

  /* --------------------------------- loop --------------------------------- */

  mulai() {
    this.berjalan = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  hancurkan() {
    this.berjalan = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.ukurUlang);
  }

  private ukurUlang = () => {
    const c = this.canvas;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.max(320, Math.round(r.width * dpr));
    c.height = Math.max(180, Math.round(r.height * dpr));
  };

  private tick = (now: number) => {
    if (!this.berjalan) return;
    const dt = Math.min((now - this.last) / 1000, 0.033);
    this.last = now;
    if (!this.jedaMode && !this.selesai) this.perbarui(dt);
    else this.perbaruiDekorasi(dt);
    this.gambar2d(dt);
    this.hudT += dt;
    if (this.hudT > 0.12) {
      this.hudT = 0;
      this.kirimHud();
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private perbaruiDekorasi(dt: number) {
    this.partikel.forEach((p) => { p.umur += dt; p.x += p.vx * dt; p.y += p.vy * dt; });
    this.partikel = this.partikel.filter((p) => p.umur < p.maks);
    if (this.selesai) this.listrik = Math.min(1, this.listrik + dt * 1.2);
  }

  private perbarui(dt: number) {
    this.waktu += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
    const h = this.hero;
    h.t += dt;
    h.kebal = Math.max(0, h.kebal - dt);
    h.energi = Math.min(100, h.energi + dt * 6);

    const aksi = h.state === 'punch' || h.state === 'kick' || h.state === 'cast' || h.state === 'hurt';
    const maju = aksi ? 0.35 : 1;

    if (this.kunci.kiri) { h.vx = -260 * maju; h.hadap = -1; }
    else if (this.kunci.kanan) { h.vx = 260 * maju; h.hadap = 1; }
    else h.vx = 0;

    h.vy += 2000 * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.x = Math.max(20, Math.min(this.level.lebar - 60, h.x));

    // tabrakan dengan platform (dari atas) dan tanah
    h.diTanah = false;
    const bawahLama = h.y + h.h - h.vy * dt;
    for (const p of this.platform) {
      if (h.x + h.w > p.x && h.x < p.x + p.w && h.vy >= 0 && bawahLama <= p.y + 6 && h.y + h.h >= p.y) {
        h.y = p.y - h.h;
        h.vy = 0;
        h.diTanah = true;
      }
    }
    if (h.y + h.h >= TANAH) {
      h.y = TANAH - h.h;
      h.vy = 0;
      h.diTanah = true;
    }

    if (h.diTanah && h.vx !== 0) h.faseLari += dt * 12;
    else if (h.diTanah && h.vx === 0) h.faseLari = 0;

    // pemilihan animasi
    if (!aksi) {
      if (!h.diTanah) h.state = h.vy < 0 ? 'jump' : 'fall';
      else if (h.vx !== 0) h.state = 'run';
      else h.state = this.dekat ? 'charge' : 'idle';
    } else if (h.t > (h.state === 'kick' ? 0.42 : h.state === 'cast' ? 0.45 : 0.3)) {
      this.set(h.diTanah ? 'idle' : 'fall');
    }

    // proyektil
    this.proyektil.forEach((p) => {
      p.x += p.vx * dt;
      p.umur -= dt;
      this.musuh.forEach((m) => {
        if (!m.hidup || p.kena.has(m.id)) return;
        if (Math.abs(p.x - (m.x + m.w / 2)) < m.w / 2 + 14 && Math.abs(p.y - (m.y + m.h / 2)) < m.h / 2 + 14) {
          p.kena.add(m.id);
          this.serangMusuh(m, 2, Math.sign(p.vx) || 1);
          p.umur = 0;
        }
      });
    });
    this.proyektil = this.proyektil.filter((p) => p.umur > 0);

    // musuh
    this.musuh.forEach((m) => {
      if (!m.hidup) { m.matiT -= dt; return; }
      m.langkah += dt * 5;
      m.kenaT = Math.max(0, m.kenaT - dt);
      if (m.jenis === 'boss') {
        m.perisai = this.benar < (m.perluBenar ?? 3);
      }
      if (m.jenis === 'drone') m.y += Math.sin(m.langkah) * 0.6;
      m.x += m.vx * dt;
      if (m.x < m.min) { m.x = m.min; m.vx = Math.abs(m.vx); }
      if (m.x + m.w > m.max) { m.x = m.max - m.w; m.vx = -Math.abs(m.vx); }

      // tabrakan dengan pemain
      if (
        h.kebal <= 0 &&
        h.x + h.w > m.x + 6 && h.x < m.x + m.w - 6 &&
        h.y + h.h > m.y + 4 && h.y < m.y + m.h - 4
      ) {
        h.hp -= 1;
        h.kebal = 1.3;
        h.vy = -320;
        h.vx = (h.x < m.x ? -1 : 1) * 240;
        this.set('hurt');
        audio.fx('luka');
        this.asap(h.x + h.w / 2, h.y + h.h / 2, 10, '#E24B33');
        if (h.hp <= 0) {
          this.onEvent({ t: 'gagal', alasan: 'Energi Penjaga habis karena terlalu sering terserang.' });
          this.selesai = true;
        }
      }
    });

    // kartu energi
    this.kartu.forEach((k) => {
      k.fase += dt * 3;
      if (k.ambil) return;
      if (Math.abs(h.x + h.w / 2 - k.x) < 34 && Math.abs(h.y + h.h / 2 - k.y) < 44) {
        k.ambil = true;
        this.kartuAmbil += 1;
        this.gp += 10;
        h.energi = Math.min(100, h.energi + 20);
        audio.fx('koin');
        this.asap(k.x, k.y, 12, '#FFC93C');
      }
    });

    // objek terdekat
    this.dekat = null;
    let jarakTerdekat = 92;
    this.objek.forEach((o) => {
      o.berdenyut += dt;
      const d = Math.abs(h.x + h.w / 2 - o.x);
      const dekatVertikal = Math.abs(h.y + h.h - o.y) < 130 || Math.abs(h.y + h.h - (o.y - 40)) < 130;
      if (d < jarakTerdekat && dekatVertikal) {
        jarakTerdekat = d;
        this.dekat = o;
      }
    });

    // partikel
    this.partikel.forEach((p) => { p.umur += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; });
    this.partikel = this.partikel.filter((p) => p.umur < p.maks);

    // kamera
    const target = h.x + h.w / 2 - LEBAR_TAMPIL / 2;
    this.camX += (target - this.camX) * Math.min(1, dt * 6);
    this.camX = Math.max(0, Math.min(this.level.lebar - LEBAR_TAMPIL, this.camX));
  }

  private kekuranganGerbang(): string {
    const kurang: string[] = [];
    if (this.benar < this.level.targetBenar) kurang.push(`${this.level.targetBenar - this.benar} misi pengetahuan lagi`);
    if (this.kartuAmbil < this.level.targetKartu) kurang.push(`${this.level.targetKartu - this.kartuAmbil} kartu energi lagi`);
    return kurang.join(' dan ');
  }

  private rampungkan() {
    this.selesai = true;
    this.set('victory');
    audio.fx('menang');
    this.asap(this.hero.x + 20, this.hero.y, 30, '#FFC93C');
    this.onEvent({
      t: 'selesai',
      gp: this.gp + 50,
      lp: this.lp,
      kartu: this.kartuAmbil,
      kartuTotal: this.kartu.length,
      waktu: this.waktu,
    });
    this.kirimHud();
  }

  private kirimHud() {
    this.onEvent({
      t: 'hud',
      hud: {
        hp: this.hero.hp,
        maxHp: 3,
        energi: Math.round(this.hero.energi),
        gp: this.gp,
        lp: this.lp,
        kartu: this.kartuAmbil,
        kartuTotal: this.kartu.length,
        benar: this.benar,
        targetBenar: this.level.targetBenar,
        prompt: this.dekat ? promptUntuk(this.dekat) : null,
        gerbangSiap: !this.kekuranganGerbang(),
      },
    });
  }

  /* ------------------------------- rendering ------------------------------- */

  private gambar2d(dt: number) {
    const ctx = this.ctx;
    const skala = Math.min(this.canvas.width / LEBAR_TAMPIL, this.canvas.height / TINGGI_TAMPIL);
    const offX = (this.canvas.width - LEBAR_TAMPIL * skala) / 2;
    const offY = (this.canvas.height - TINGGI_TAMPIL * skala) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(skala, 0, 0, skala, offX, offY);
    ctx.imageSmoothingEnabled = true;

    this.gambarLatar();
    ctx.save();
    ctx.translate(-this.camX, 0);
    this.gambarTanah();
    this.platform.forEach((p) => this.gambarPlatform(p));
    this.gambarGerbang();
    this.objek.forEach((o) => this.gambarObjek(o));
    this.kartu.forEach((k) => { if (!k.ambil) this.gambarKartu(k); });
    this.musuh.forEach((m) => this.gambarMusuh(m));
    this.gambarHero();
    this.partikel.forEach((p) => {
      const a = 1 - p.umur / p.maks;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.warna;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * a + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    this.proyektil.forEach((p) => {
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 26);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.4, '#FFC93C');
      g.addColorStop(1, 'rgba(245,145,32,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // kilatan "kota menyala" saat misi selesai
    if (this.listrik > 0) {
      ctx.fillStyle = `rgba(255,201,60,${0.22 * Math.sin(this.listrik * Math.PI)})`;
      ctx.fillRect(0, 0, LEBAR_TAMPIL, TINGGI_TAMPIL);
    }
    void dt;
  }

  private gambarLatar() {
    const ctx = this.ctx;
    const temaWarna: Record<string, [string, string]> = {
      kota: ['#2b3a55', '#f0a06a'],
      lab: ['#dff1f7', '#8fd3e8'],
      desa: ['#bfe6f2', '#eaf7d8'],
      iklim: ['#c8862f', '#f3d08a'],
      masadepan: ['#6ec6f0', '#dff3ff'],
    };
    const [atas, bawah] = temaWarna[this.level.tema] ?? ['#bfe6f2', '#eaf7d8'];
    const g = ctx.createLinearGradient(0, 0, 0, TINGGI_TAMPIL);
    g.addColorStop(0, atas);
    g.addColorStop(1, bawah);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LEBAR_TAMPIL, TINGGI_TAMPIL);

    if (this.gambarSiap && this.gambar) {
      const img = this.gambar;
      const skala = TINGGI_TAMPIL / img.height;
      const w = img.width * skala;
      const geser = (this.camX * 0.35) % w;
      ctx.globalAlpha = 0.95;
      for (let i = -1; i < Math.ceil(LEBAR_TAMPIL / w) + 1; i++) {
        ctx.drawImage(img, i * w - geser, 0, w, TINGGI_TAMPIL);
      }
      ctx.globalAlpha = 1;
    }

    // cahaya kota yang menyala kembali setelah misi selesai
    if (this.listrik > 0) {
      ctx.save();
      ctx.globalAlpha = this.listrik;
      for (let i = 0; i < 26; i++) {
        const x = ((i * 137 - this.camX * 0.35) % (LEBAR_TAMPIL + 160)) - 80;
        const y = 150 + ((i * 53) % 130);
        ctx.fillStyle = '#FFC93C';
        ctx.fillRect(x, y, 8, 10);
      }
      ctx.restore();
    }
  }

  private gambarTanah() {
    const ctx = this.ctx;
    const tema: Record<string, { rumput: string; tanah: string; gelap: string }> = {
      kota: { rumput: '#6b6f78', tanah: '#4a4e57', gelap: '#33363d' },
      lab: { rumput: '#9fd8e8', tanah: '#d8dde2', gelap: '#aeb6bd' },
      desa: { rumput: '#57a54a', tanah: '#8b5a2b', gelap: '#5c3a1e' },
      iklim: { rumput: '#b08a4a', tanah: '#7d5a33', gelap: '#5a3f24' },
      masadepan: { rumput: '#5fbf6a', tanah: '#8b5a2b', gelap: '#5c3a1e' },
    };
    const t = tema[this.level.tema] ?? tema.desa;
    ctx.fillStyle = t.tanah;
    ctx.fillRect(-40, TANAH, this.level.lebar + 80, TINGGI_TAMPIL - TANAH);
    ctx.fillStyle = t.gelap;
    ctx.fillRect(-40, TANAH + 46, this.level.lebar + 80, TINGGI_TAMPIL - TANAH);
    ctx.fillStyle = t.rumput;
    ctx.fillRect(-40, TANAH - 10, this.level.lebar + 80, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let x = -40; x < this.level.lebar; x += 42) {
      ctx.beginPath();
      ctx.ellipse(x, TANAH - 12, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private gambarPlatform(p: Platform) {
    const ctx = this.ctx;
    ctx.fillStyle = '#8B5A2B';
    bulat(ctx, p.x, p.y, p.w, 24, 8);
    ctx.fill();
    ctx.fillStyle = '#5C3A1E';
    ctx.fillRect(p.x + 4, p.y + 12, p.w - 8, 8);
    ctx.fillStyle = this.level.tema === 'kota' ? '#6b6f78' : '#57a54a';
    bulat(ctx, p.x - 3, p.y - 8, p.w + 6, 14, 7);
    ctx.fill();
  }

  private gambarGerbang() {
    const ctx = this.ctx;
    const g = this.level.gerbang;
    const siap = !this.kekuranganGerbang();
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.fillStyle = '#5C3A1E';
    ctx.fillRect(-6, -130, 14, 130);
    ctx.fillRect(56, -130, 14, 130);
    ctx.fillStyle = siap ? '#2E6B3E' : '#8B5A2B';
    bulat(ctx, -18, -168, 100, 44, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(siap ? 'MISI SELESAI' : 'GERBANG MISI', 32, -140);
    if (siap) {
      const g2 = ctx.createRadialGradient(32, -60, 5, 32, -60, 70);
      g2.addColorStop(0, 'rgba(255,201,60,0.85)');
      g2.addColorStop(1, 'rgba(255,201,60,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(-40, -130, 144, 130);
    }
    ctx.restore();
  }

  private gambarKartu(k: { x: number; y: number; fase: number }) {
    const ctx = this.ctx;
    const y = k.y + Math.sin(k.fase) * 6;
    ctx.save();
    ctx.translate(k.x, y);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,201,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(Math.sin(k.fase * 0.5) * 0.3);
    ctx.fillStyle = '#FFC93C';
    bulat(ctx, -11, -15, 22, 30, 5);
    ctx.fill();
    ctx.fillStyle = '#F59120';
    ctx.font = 'bold 16px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E', 0, 6);
    ctx.restore();
  }

  private gambarObjek(o: ObjekRuntime) {
    const ctx = this.ctx;
    const dekat = this.dekat === o;
    const berdenyut = Math.sin(o.berdenyut * 3) * 2;
    ctx.save();
    ctx.translate(o.x, o.y);
    if (dekat) {
      ctx.strokeStyle = '#FFC93C';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 46, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (o.selesai) {
      ctx.globalAlpha = 0.98;
    }
    switch (o.art) {
      case 'papan': {
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(-6, -84, 12, 84);
        ctx.fillStyle = '#B98A50';
        bulat(ctx, -52, -140 + berdenyut, 104, 62, 10);
        ctx.fill();
        ctx.fillStyle = '#5C3A1E';
        ctx.font = 'bold 13px "Baloo 2", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAPAN MISI', 0, -112 + berdenyut);
        ctx.fillStyle = '#F4EBDC';
        ctx.fillRect(-38, -104 + berdenyut, 76, 6);
        ctx.fillRect(-30, -94 + berdenyut, 60, 5);
        break;
      }
      case 'panelSurya': {
        ctx.fillStyle = '#4a4e57';
        ctx.fillRect(-5, -46, 10, 46);
        ctx.save();
        ctx.translate(0, -58 + berdenyut * 0.5);
        ctx.rotate(-0.25);
        ctx.fillStyle = '#2E4A6B';
        bulat(ctx, -46, -22, 92, 44, 6);
        ctx.fill();
        ctx.strokeStyle = '#8fd3e8';
        ctx.lineWidth = 2;
        for (let i = -30; i <= 30; i += 20) { ctx.beginPath(); ctx.moveTo(i, -20); ctx.lineTo(i, 20); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(44, 0); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'generator': {
        ctx.fillStyle = '#6b6f78';
        bulat(ctx, -44, -70, 88, 70, 10);
        ctx.fill();
        ctx.fillStyle = o.selesai ? '#FFC93C' : '#E24B33';
        ctx.beginPath();
        ctx.arc(0, -46, 12 + (o.selesai ? berdenyut : 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a4e57';
        ctx.fillRect(-34, -28, 68, 10);
        ctx.fillStyle = '#2b3a55';
        ctx.fillRect(20, -104, 12, 34);
        break;
      }
      case 'perangkat': {
        ctx.fillStyle = '#2b3a55';
        bulat(ctx, -38, -70, 76, 52, 8);
        ctx.fill();
        ctx.fillStyle = o.selesai ? '#8fd3e8' : '#4a6b8b';
        bulat(ctx, -30, -64, 60, 40, 5);
        ctx.fill();
        ctx.fillStyle = '#4a4e57';
        ctx.fillRect(-6, -18, 12, 18);
        ctx.fillStyle = '#FFC93C';
        ctx.beginPath();
        ctx.arc(26, -8, 5 + berdenyut * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'warga': {
        const ayun = Math.sin(o.berdenyut * 2) * 3;
        ctx.fillStyle = '#2E8FCB';
        bulat(ctx, -18, -52 + ayun * 0.2, 36, 52, 12);
        ctx.fill();
        ctx.fillStyle = '#FFD9A8';
        ctx.beginPath();
        ctx.arc(0, -66 + ayun * 0.2, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b2a1e';
        ctx.beginPath();
        ctx.arc(0, -72 + ayun * 0.2, 17, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2b3a55';
        ctx.beginPath();
        ctx.arc(-6, -66, 2.4, 0, Math.PI * 2);
        ctx.arc(6, -66, 2.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'mesin': {
        ctx.fillStyle = '#d8dde2';
        bulat(ctx, -40, -96, 80, 96, 12);
        ctx.fill();
        ctx.fillStyle = o.selesai ? '#57a54a' : '#9fd8e8';
        bulat(ctx, -28, -84, 56, 34, 6);
        ctx.fill();
        ctx.fillStyle = '#6b6f78';
        ctx.beginPath();
        ctx.arc(-18, -34, 8, 0, Math.PI * 2);
        ctx.arc(2, -34, 8, 0, Math.PI * 2);
        ctx.arc(22, -34, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59120';
        ctx.fillRect(-28, -22 + berdenyut, 12, 12);
        break;
      }
      case 'tempatSampah': {
        ctx.fillStyle = '#2E6B3E';
        bulat(ctx, -26, -62, 52, 62, 8);
        ctx.fill();
        ctx.fillStyle = '#FFC93C';
        ctx.font = 'bold 20px "Baloo 2", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, -24);
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(-30, -70, 60, 10);
        break;
      }
      case 'cerobong': {
        ctx.fillStyle = '#8a7a68';
        bulat(ctx, -30, -110, 60, 110, 8);
        ctx.fill();
        ctx.fillStyle = '#6b5b4a';
        ctx.fillRect(-30, -110, 60, 14);
        for (let i = 0; i < 3; i++) {
          const t = (this.waktu * 0.5 + i * 0.33) % 1;
          ctx.globalAlpha = 0.5 * (1 - t);
          ctx.fillStyle = '#cfc6bb';
          ctx.beginPath();
          ctx.arc(0 + i * 8, -120 - t * 70, 12 + t * 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        break;
      }
      case 'turbin':
      case 'kincir': {
        ctx.fillStyle = '#e6e6e6';
        ctx.fillRect(-5, -110, 10, 110);
        ctx.save();
        ctx.translate(0, -110);
        ctx.rotate(this.waktu * (o.art === 'kincir' ? 1.4 : 2.2));
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < (o.art === 'kincir' ? 4 : 3); i++) {
          ctx.rotate((Math.PI * 2) / (o.art === 'kincir' ? 4 : 3));
          bulat(ctx, -6, -54, 12, 54, 6);
          ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = '#FFC93C';
        ctx.beginPath();
        ctx.arc(0, -110, 7, 0, Math.PI * 2);
        ctx.fill();
        if (o.art === 'kincir') {
          ctx.fillStyle = '#8fd3e8';
          ctx.fillRect(-46, -34, 92, 34);
        }
        break;
      }
      case 'ventil': {
        ctx.fillStyle = '#7d5a33';
        bulat(ctx, -34, -56, 68, 56, 10);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          const t = (this.waktu * 0.6 + i * 0.3) % 1;
          ctx.globalAlpha = 0.45 * (1 - t);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(i * 6, -60 - t * 60, 10 + t * 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  private gambarMusuh(m: MusuhRuntime) {
    const ctx = this.ctx;
    if (!m.hidup && m.matiT <= 0) return;
    ctx.save();
    ctx.translate(m.x + m.w / 2, m.y + m.h);
    if (!m.hidup) {
      ctx.globalAlpha = Math.max(0, m.matiT / 0.6);
      const kembang = 1 + (0.6 - m.matiT) * 0.8;
      ctx.scale(kembang, kembang);
    }
    const goyang = Math.sin(m.langkah) * 3;
    ctx.translate(0, goyang * 0.4);

    if (m.perisai) {
      ctx.strokeStyle = 'rgba(46,143,203,0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, -m.h / 2, m.w * 0.8, m.h * 0.75, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(46,143,203,0.12)';
      ctx.fill();
    }

    const warna: Record<string, string> = {
      waste: '#8ac53e', pollution: '#7f8fa6', fossil: '#4a4e57', drone: '#b07de0', boss: '#e2622f',
    };
    ctx.fillStyle = m.kenaT > 0 ? '#FFFFFF' : warna[m.jenis] ?? '#8ac53e';

    if (m.jenis === 'drone') {
      bulat(ctx, -m.w / 2, -m.h, m.w, m.h, 12);
      ctx.fill();
      ctx.strokeStyle = '#4a4e57';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-m.w / 2 - 10, -m.h - 4);
      ctx.lineTo(-m.w / 2 + 6, -m.h - 4);
      ctx.moveTo(m.w / 2 - 6, -m.h - 4);
      ctx.lineTo(m.w / 2 + 10, -m.h - 4);
      ctx.stroke();
    } else if (m.jenis === 'fossil') {
      ctx.beginPath();
      ctx.ellipse(0, -m.h / 2, m.w * 0.6, m.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-12, -m.h * 0.85, 12, 0, Math.PI * 2);
      ctx.arc(12, -m.h * 0.8, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (m.jenis === 'boss') {
      bulat(ctx, -m.w / 2, -m.h, m.w, m.h, 26);
      ctx.fill();
      ctx.fillStyle = '#FFC93C';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 26 - 8, -m.h);
        ctx.lineTo(i * 26, -m.h - 22);
        ctx.lineTo(i * 26 + 8, -m.h);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      bulat(ctx, -m.w / 2, -m.h, m.w, m.h, 18);
      ctx.fill();
    }

    // mata kartun
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-8, -m.h * 0.62, 8, 0, Math.PI * 2);
    ctx.arc(8, -m.h * 0.62, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b3a55';
    ctx.beginPath();
    ctx.arc(-7, -m.h * 0.62, 3.5, 0, Math.PI * 2);
    ctx.arc(9, -m.h * 0.62, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // bar energi musuh
    if (m.hidup) {
      const lebar = m.w + 10;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-lebar / 2, -m.h - 26, lebar, 7);
      ctx.fillStyle = m.perisai ? '#2E8FCB' : '#57a54a';
      ctx.fillRect(-lebar / 2, -m.h - 26, lebar * Math.max(0, m.hp / (m.jenis === 'boss' ? 6 : 3)), 7);
    }
    ctx.restore();
  }

  private gambarHero() {
    const ctx = this.ctx;
    const h = this.hero;
    if (h.kebal > 0 && Math.floor(h.kebal * 12) % 2 === 0) return;
    ctx.save();
    ctx.translate(h.x + h.w / 2, h.y + h.h);
    ctx.scale(h.hadap, 1);
    const lari = h.state === 'run' ? Math.sin(h.faseLari) : 0;
    const napas = h.state === 'idle' || h.state === 'charge' ? Math.sin(this.waktu * 3) * 1.5 : 0;
    const menunduk = h.state === 'jump' ? -4 : h.state === 'fall' ? 2 : 0;

    // bayangan
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // kaki
    ctx.fillStyle = '#2E4A6B';
    bulat(ctx, -14, -22 + lari * 6, 11, 24 - lari * 4, 5);
    ctx.fill();
    bulat(ctx, 3, -22 - lari * 6, 11, 24 + lari * 4, 5);
    ctx.fill();
    ctx.fillStyle = '#3b2a1e';
    bulat(ctx, -17, -4 + lari * 6, 16, 8, 4);
    ctx.fill();
    bulat(ctx, 0, -4 - lari * 6, 16, 8, 4);
    ctx.fill();

    // tendangan: kaki kanan terangkat ke depan
    if (h.state === 'kick') {
      ctx.save();
      ctx.translate(8, -24);
      ctx.rotate(-0.9 - Math.sin(Math.min(1, h.t / 0.42) * Math.PI) * 0.5);
      ctx.fillStyle = '#2E4A6B';
      bulat(ctx, -6, 0, 12, 34, 6);
      ctx.fill();
      ctx.fillStyle = '#FFC93C';
      bulat(ctx, -8, 28, 16, 10, 5);
      ctx.fill();
      ctx.restore();
    }

    // badan
    ctx.fillStyle = '#F59120';
    bulat(ctx, -17, -56 + napas + menunduk, 34, 38, 12);
    ctx.fill();
    ctx.fillStyle = '#F4EBDC';
    bulat(ctx, -8, -50 + napas + menunduk, 16, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#2E8FCB';
    ctx.fillRect(-17, -34 + napas + menunduk, 34, 6);

    // lengan
    const tanganDepan = h.state === 'punch' ? 22 + Math.sin(Math.min(1, h.t / 0.3) * Math.PI) * 16 : 12;
    ctx.strokeStyle = '#F59120';
    ctx.lineCap = 'round';
    ctx.lineWidth = 10;
    ctx.beginPath();
    if (h.state === 'cast') {
      ctx.moveTo(6, -46 + napas);
      ctx.lineTo(20, -40 + napas);
    } else if (h.state === 'punch') {
      ctx.moveTo(6, -46 + napas);
      ctx.lineTo(tanganDepan, -44 + napas);
    } else {
      ctx.moveTo(6, -46 + napas);
      ctx.lineTo(14 + lari * 5, -34 + napas);
      ctx.moveTo(-6, -46 + napas);
      ctx.lineTo(-14 - lari * 5, -34 + napas);
    }
    ctx.stroke();

    // kepala + helm
    ctx.fillStyle = '#FFD9A8';
    ctx.beginPath();
    ctx.arc(0, -72 + napas + menunduk, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59120';
    ctx.beginPath();
    ctx.arc(0, -76 + napas + menunduk, 17, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2E8FCB';
    bulat(ctx, 2, -76 + napas + menunduk, 18, 10, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    bulat(ctx, 5, -78 + napas + menunduk, 8, 4, 2);
    ctx.fill();

    // bola energi (fantasi)
    if (h.state === 'cast') {
      const g = ctx.createRadialGradient(28, -42, 2, 28, -42, 30);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.45, '#FFC93C');
      g.addColorStop(1, 'rgba(245,145,32,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(28, -42, 30 * Math.min(1, h.t * 4), 0, Math.PI * 2);
      ctx.fill();
    }

    if (h.state === 'victory') {
      ctx.fillStyle = '#FFC93C';
      ctx.font = 'bold 22px "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, -108);
    }
    ctx.restore();
  }
}

/* ------------------------------ utilitas gambar ----------------------------- */

function bulat(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function keAksi(code: string, key: string): Aksi | null {
  switch (code) {
    case 'KeyA':
    case 'ArrowLeft':
      return 'kiri';
    case 'KeyD':
    case 'ArrowRight':
      return 'kanan';
    case 'KeyW':
    case 'ArrowUp':
    case 'Space':
      return 'lompat';
    case 'KeyJ':
      return 'pukul';
    case 'KeyK':
      return 'tendang';
    case 'KeyL':
      return 'energi';
    case 'KeyE':
      return 'interaksi';
    default:
      return key === ' ' ? 'lompat' : null;
  }
}

function promptUntuk(o: ObjDef): string {
  if (o.art === 'gerbang') return 'E — Buka Gerbang Misi';
  return `E — ${o.label}${o.soalId ? ' · misi pengetahuan' : ''}`;
}
