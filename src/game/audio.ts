/**
 * Efek suara & musik sederhana dengan Web Audio API (tanpa aset audio berhak cipta).
 * Semua bunyi dibuat dari osilator sederhana sehingga ringan dan aman untuk prototipe.
 */

type Nada = { f: number; t: number; d: number; g?: number; jenis?: OscillatorType };

class MesinAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  efek = true;
  musik = true;
  volume = 0.6;

  private pastikan() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  private main(nada: Nada[]) {
    const ctx = this.pastikan();
    const master = this.master;
    if (!ctx || !master) return;
    nada.forEach((n) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = n.jenis ?? 'square';
      osc.frequency.value = n.f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + n.t);
      g.gain.exponentialRampToValueAtTime(n.g ?? 0.12, ctx.currentTime + n.t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.t + n.d);
      osc.connect(g);
      g.connect(master);
      osc.start(ctx.currentTime + n.t);
      osc.stop(ctx.currentTime + n.t + n.d + 0.02);
    });
  }

  fx(jenis: 'lompat' | 'pukul' | 'tendang' | 'energi' | 'benar' | 'salah' | 'koin' | 'menang' | 'kalah' | 'klik' | 'luka' | 'buka') {
    if (!this.efek) return;
    switch (jenis) {
      case 'lompat':
        this.main([{ f: 420, t: 0, d: 0.12 }, { f: 620, t: 0.06, d: 0.1, jenis: 'triangle' }]);
        break;
      case 'pukul':
        this.main([{ f: 180, t: 0, d: 0.08, jenis: 'sawtooth' }, { f: 90, t: 0.04, d: 0.1, jenis: 'square' }]);
        break;
      case 'tendang':
        this.main([{ f: 120, t: 0, d: 0.14, jenis: 'sawtooth' }, { f: 300, t: 0.02, d: 0.1, jenis: 'triangle' }]);
        break;
      case 'energi':
        this.main([
          { f: 300, t: 0, d: 0.25, jenis: 'sine', g: 0.1 },
          { f: 600, t: 0.05, d: 0.25, jenis: 'sine', g: 0.1 },
          { f: 900, t: 0.1, d: 0.3, jenis: 'sine', g: 0.08 },
        ]);
        break;
      case 'benar':
        this.main([
          { f: 523, t: 0, d: 0.15, jenis: 'triangle', g: 0.14 },
          { f: 659, t: 0.12, d: 0.15, jenis: 'triangle', g: 0.14 },
          { f: 784, t: 0.24, d: 0.25, jenis: 'triangle', g: 0.14 },
        ]);
        break;
      case 'salah':
        this.main([{ f: 220, t: 0, d: 0.2, jenis: 'sine', g: 0.1 }, { f: 165, t: 0.1, d: 0.3, jenis: 'sine', g: 0.1 }]);
        break;
      case 'koin':
        this.main([{ f: 880, t: 0, d: 0.07, jenis: 'square', g: 0.08 }, { f: 1320, t: 0.05, d: 0.1, jenis: 'square', g: 0.08 }]);
        break;
      case 'luka':
        this.main([{ f: 140, t: 0, d: 0.15, jenis: 'sawtooth', g: 0.12 }]);
        break;
      case 'buka':
        this.main([{ f: 660, t: 0, d: 0.1, jenis: 'triangle', g: 0.1 }, { f: 880, t: 0.08, d: 0.18, jenis: 'triangle', g: 0.1 }]);
        break;
      case 'menang':
        this.main([
          { f: 523, t: 0, d: 0.18, jenis: 'triangle', g: 0.14 },
          { f: 659, t: 0.14, d: 0.18, jenis: 'triangle', g: 0.14 },
          { f: 784, t: 0.28, d: 0.18, jenis: 'triangle', g: 0.14 },
          { f: 1047, t: 0.42, d: 0.4, jenis: 'triangle', g: 0.14 },
        ]);
        break;
      case 'kalah':
        this.main([{ f: 330, t: 0, d: 0.25, jenis: 'sine', g: 0.12 }, { f: 247, t: 0.2, d: 0.4, jenis: 'sine', g: 0.12 }]);
        break;
      case 'klik':
        this.main([{ f: 700, t: 0, d: 0.05, jenis: 'triangle', g: 0.08 }]);
        break;
    }
  }

  /** Musik latar sederhana: tangga nada pelan berulang. */
  mulaiMusik() {
    if (!this.musik || this.timer !== null) return;
    const ctx = this.pastikan();
    if (!ctx) return;
    const pola = [262, 330, 392, 330, 294, 349, 440, 349];
    let i = 0;
    const self = this;
    this.timer = window.setInterval(() => {
      const c = self.ctx;
      const m = self.master;
      if (!self.musik || !c || !m) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = pola[i % pola.length] / 2;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.9);
      osc.connect(g);
      g.connect(m);
      osc.start();
      osc.stop(c.currentTime + 1);
      i++;
    }, 900);
  }

  hentikanMusik() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const audio = new MesinAudio();
