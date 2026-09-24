/**
 * Akses bank soal: menggabungkan bank bawaan (data/content.ts) dengan
 * soal tambahan buatan guru yang disimpan di localStorage.
 */
import { SOAL_DEFAULT, type Soal } from '../data/content';

export const QUESTIONS_INDEX: Record<string, Soal> = Object.fromEntries(
  SOAL_DEFAULT.map((q) => [q.id, q])
);

type Kustom = Soal & { kustom?: boolean };

let cache: Kustom[] | null = null;

export function semuaSoal(): Soal[] {
  if (cache) return cache;
  let kustom: Kustom[] = [];
  try {
    const raw = localStorage.getItem('energy-hero-bank-v1');
    if (raw) kustom = JSON.parse(raw) as Kustom[];
  } catch {
    kustom = [];
  }
  cache = [...SOAL_DEFAULT, ...kustom.map((k) => ({ ...k, kustom: true }))];
  return cache;
}

export function simpanKustom(list: Soal[]) {
  cache = null;
  try {
    localStorage.setItem('energy-hero-bank-v1', JSON.stringify(list.map((q) => ({ ...q, kustom: true }))));
    return true;
  } catch {
    return false;
  }
}

export function listKustom(): Soal[] {
  return semuaSoal().filter((q) => (q as Kustom).kustom) as Soal[];
}

export function soalById(id: string): Soal | undefined {
  return semuaSoal().find((q) => q.id === id);
}

export function soalLevel(n: number): Soal[] {
  return semuaSoal().filter((q) => q.level === n);
}
