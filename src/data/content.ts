/**
 * ENERGY HERO — Bank konten pembelajaran (IPAS Fase C, Bab 5: Energi untuk Masa Depan).
 *
 * CATATAN PENTING:
 * Seluruh isi file ini adalah KONTEN SEMENTARA (PLACEHOLDER) yang disusun berdasarkan
 * konsep sains umum tingkat SD. Belum diverifikasi terhadap teks buku IPAS Kelas VI
 * tertentu. Tidak ada kutipan, nomor halaman, CP, TP, atau indikator resmi di sini —
 * kolom "indikator" hanyalah penanda internal penulis soal dan perlu diganti/diisi
 * oleh guru setelah mencocokkan dengan dokumen resmi yang berlaku.
 */

export type TipeSoal = 'pg' | 'bs' | 'bs_alasan' | 'urut' | 'uraian' | 'kasus';
export type Kesulitan = 'mudah' | 'sedang' | 'sulit';

export type Stimulus =
  | { t: 'teks'; isi: string }
  | { t: 'tabel'; caption: string; kepala: string[]; baris: string[][] }
  | { t: 'grafik'; caption: string; satuan: string; data: { label: string; nilai: number }[] }
  | { t: 'gambar'; src: string; caption: string };

export type Kunci =
  | number // pg / bs (indeks pilihan) / bs_alasan (indeks alasan) disimpan terpisah
  | { st: 0 | 1; alasan: number }
  | string[] // urut
  | { kataKunci: string[]; min: number; contoh: string }; // uraian & kasus

export interface Soal {
  id: string;
  level: number;
  materi: string;
  submateri: string;
  indikator: string;
  kesulitan: Kesulitan;
  tipe: TipeSoal;
  stimulus?: Stimulus;
  pertanyaan: string;
  pilihan?: string[];
  pilihanAlasan?: string[];
  kunci: Kunci;
  pembahasan: string;
  poin: number;
  retry: boolean;
  remedial: string;
  pengayaan?: string;
}

export const MATERI = [
  'Energi fosil',
  'Energi terbarukan & tak terbarukan',
  'Energi alternatif',
  'Penggunaan energi sehari-hari',
  'Dampak energi fosil & perubahan iklim',
  'Hemat energi & pemilihan sumber energi',
];

/* -------------------------------------------------------------------------- */
/*                                BANK SOAL                                   */
/* -------------------------------------------------------------------------- */

export const SOAL_DEFAULT: Soal[] = [
  /* ============================== LEVEL 1 ============================== */
  {
    id: 'q101',
    level: 1,
    materi: 'Energi fosil',
    submateri: 'Contoh sumber energi fosil',
    indikator: 'PLACEHOLDER — mengenali contoh energi fosil',
    kesulitan: 'mudah',
    tipe: 'pg',
    stimulus: {
      t: 'tabel',
      caption: 'Perangkat yang dipakai warga Kota Arunika hari ini',
      kepala: ['Perangkat', 'Sumber energi yang dipakai'],
      baris: [
        ['Kipas angin', 'Listrik dari PLN'],
        ['Kompor dapur', 'Gas LPG'],
        ['Lampu jalan tenaga surya', 'Sinar matahari'],
        ['Motor bensin', 'Bensin'],
      ],
    },
    pertanyaan: 'Manakah yang termasuk sumber energi fosil?',
    pilihan: ['Matahari', 'Batu bara', 'Angin', 'Air mengalir'],
    kunci: 1,
    pembahasan:
      'Batu bara termasuk sumber energi fosil. Energi fosil berasal dari sisa makhluk hidup purba yang tertimbun selama jutaan tahun. Karena prosesnya sangat lama, batu bara disebut juga energi tak terbarukan. Matahari, angin, dan air mengalir terus tersedia di alam sehingga tergolong energi terbarukan.',
    poin: 10,
    retry: true,
    remedial: 'Ingat: energi fosil = sisa makhluk hidup purba (batu bara, minyak bumi, gas alam).',
    pengayaan: 'Cari tahu bagaimana batu bara bisa menjadi listrik di pembangkit listrik tenaga uap.',
  },
  {
    id: 'q102',
    level: 1,
    materi: 'Penggunaan energi sehari-hari',
    submateri: 'Membaca informasi penggunaan energi',
    indikator: 'PLACEHOLDER — menganalisis informasi dalam tabel',
    kesulitan: 'sedang',
    tipe: 'pg',
    stimulus: {
      t: 'tabel',
      caption: 'Lama pemakaian perangkat di rumah Rani (data contoh)',
      kepala: ['Perangkat', 'Lama pemakaai per hari'],
      baris: [
        ['Lampu kamar', '5 jam'],
        ['Televisi', '3 jam'],
        ['Setrika', '1 jam'],
        ['Kipas angin', '8 jam'],
      ],
    },
    pertanyaan:
      'Ibu Rani ingin menghemat energi listrik. Berdasarkan tabel, perangkat mana yang sebaiknya paling diperhatikan cara pemakaiannya?',
    pilihan: [
      'Lampu kamar, karena digunakan 5 jam',
      'Kipas angin, karena paling lama menyala yaitu 8 jam',
      'Setrika, karena menghasilkan panas',
      'Televisi, karena menggunakan layar',
    ],
    kunci: 1,
    pembahasan:
      'Kipas angin menyala paling lama (8 jam). Semakin lama perangkat menyala, semakin besar energi yang terpakai. Cara bijaknya: matikan kipas saat tidak ada orang di ruangan dan gunakan seperlunya. Setrika juga boros listrik, tetapi dari tabel pemakaiannya hanya 1 jam, jadi dampaknya lebih kecil.',
    poin: 15,
    retry: true,
    remedial: 'Baca kembali angka pada tabel, lalu bandingkan lama pemakaian tiap perangkat.',
  },
  {
    id: 'q103',
    level: 1,
    materi: 'Penggunaan energi sehari-hari',
    submateri: 'Penggunaan energi bijak dan boros',
    indikator: 'PLACEHOLDER — membedakan perilaku hemat dan boros energi',
    kesulitan: 'mudah',
    tipe: 'bs',
    pertanyaan:
      'Pada siang hari yang terang, semua lampu kelas dinyalakan, lalu televisi dibiarkan menyala walau tidak ditonton. Perilaku ini termasuk penggunaan energi secara bijak.',
    pilihan: ['Benar', 'Salah'],
    kunci: 1,
    pembahasan:
      'Jawabannya salah. Menyalakan lampu saat cahaya matahari sudah cukup dan membiarkan televisi menyala tanpa ditonton membuat energi terbuang percuma. Tindakan bijak: manfaatkan cahaya siang dan matikan perangkat yang tidak dipakai.',
    poin: 10,
    retry: true,
    remedial: 'Perilaku bijak = energi dipakai sesuai kebutuhan, tidak berlebihan.',
  },
  {
    id: 'q104',
    level: 1,
    materi: 'Penggunaan energi sehari-hari',
    submateri: 'Memilih solusi hemat energi',
    indikator: 'PLACEHOLDER — memilih solusi yang tepat',
    kesulitan: 'sedang',
    tipe: 'pg',
    stimulus: {
      t: 'teks',
      isi:
        'Di sebuah gang, lampu penerangan menyala sepanjang hari. Selain itu, warga memakai kendaraan bermesin bahan bakar untuk perjalanan yang jaraknya hanya 300 meter.',
    },
    pertanyaan: 'Manakah dua tindakan yang paling tepat dilakukan warga?',
    pilihan: [
      'Menambah jumlah lampu dan membeli mobil pribadi',
      'Menyalakan lampu hanya saat gelap dan berjalan kaki untuk jarak dekat',
      'Membiarkan lampu menyala agar gang selalu terang dan tetap memakai motor',
      'Mengganti lampu dengan yang lebih terang lalu menyalakannya 24 jam',
    ],
    kunci: 1,
    pembahasan:
      'Menyalakan lampu hanya saat gelap menghemat energi, dan berjalan kaki untuk jarak dekat menghemat bahan bakar sekaligus menyehatkan. Menambah lampu atau menyalakan lebih lama justru menambah energi yang terpakai.',
    poin: 15,
    retry: true,
    remedial: 'Cari pilihan yang mengurangi pemakaian energi, bukan menambahnya.',
  },
  {
    id: 'q105',
    level: 1,
    materi: 'Penggunaan energi sehari-hari',
    submateri: 'Contoh penggunaan energi',
    indikator: 'PLACEHOLDER — mengidentifikasi penggunaan energi sehari-hari',
    kesulitan: 'mudah',
    tipe: 'uraian',
    pertanyaan:
      'Sebutkan DUA contoh penggunaan energi yang biasa kamu temui di rumah atau di sekolah, lalu tuliskan sumber energinya.',
    kunci: {
      kataKunci: ['listrik', 'lampu', 'kipas', 'televisi', 'tv', 'kompor', 'gas', 'bensin', 'matahari', 'air'],
      min: 2,
      contoh:
        'Contoh: (1) lampu kamar memakai energi listrik; (2) kompor memakai energi gas LPG. Jawaban lain yang benar juga diterima.',
    },
    pembahasan:
      'Penggunaan energi ada di mana-mana: lampu, kipas, televisi, komputer (listrik), kompor (gas), kendaraan (bensin atau solar), pompa air (listrik). Setiap perangkat membutuhkan sumber energi agar dapat bekerja.',
    poin: 15,
    retry: true,
    remedial: 'Lihat sekelilingmu: semua alat yang dapat bergerak, menyala, atau panas memakai energi.',
    pengayaan: 'Hitung berapa banyak perangkat elektronik yang menyala di rumahmu pada pukul 19.00.',
  },
  {
    id: 'q106',
    level: 1,
    materi: 'Energi fosil',
    submateri: 'Bahan bakar fosil dalam kehidupan',
    indikator: 'PLACEHOLDER — menghubungkan bahan bakar fosil dengan kegiatan sehari-hari',
    kesulitan: 'sedang',
    tipe: 'bs_alasan',
    pertanyaan:
      'Pernyataan: Bensin yang dipakai sepeda motor termasuk sumber energi dari bahan bakar fosil. Alasan: bensin berasal dari minyak bumi yang merupakan bagian dari energi fosil.',
    pilihan: ['Benar', 'Salah'],
    pilihanAlasan: [
      'Karena bensin dibuat dari minyak bumi, yaitu salah satu energi fosil',
      'Karena bensin dibuat dari air yang mengalir',
      'Karena bensin dapat diperbarui setiap hari seperti angin',
      'Karena bensin berasal dari sinar matahari',
    ],
    kunci: { st: 0, alasan: 0 },
    pembahasan:
      'Pernyataan benar dan alasannya tepat. Bensin diperoleh dari pengolahan minyak bumi. Minyak bumi, batu bara, dan gas alam adalah tiga sumber energi fosil yang paling dikenal.',
    poin: 15,
    retry: true,
    remedial: 'Ingat tiga energi fosil: batu bara, minyak bumi, gas alam.',
  },

  /* ============================== LEVEL 2 ============================== */
  {
    id: 'q201',
    level: 2,
    materi: 'Energi terbarukan & tak terbarukan',
    submateri: 'Mengelompokkan sumber energi',
    indikator: 'PLACEHOLDER — mengelompokkan sumber energi',
    kesulitan: 'mudah',
    tipe: 'pg',
    stimulus: {
      t: 'tabel',
      caption: 'Kartu sumber energi di Laboratorium Energi',
      kepala: ['Kartu', 'Keterangan'],
      baris: [
        ['A', 'Batu bara'],
        ['B', 'Panah angin (turbin)'],
        ['C', 'Minyak bumi'],
        ['D', 'Panel surya'],
      ],
    },
    pertanyaan: 'Kartu mana saja yang termasuk energi tak terbarukan?',
    pilihan: ['A dan C', 'B dan D', 'A dan B', 'C dan D'],
    kunci: 0,
    pembahasan:
      'Batu bara (A) dan minyak bumi (C) adalah energi fosil yang persediaannya terbatas karena terbentuk sangat lama, sehingga tergolong tak terbarukan. Angin dan matahari terus tersedia di alam sehingga tergolong terbarukan.',
    poin: 10,
    retry: true,
    remedial: 'Tak terbarukan = persediaan terbatas (fosil). Terbarukan = terus tersedia (matahari, angin, air, panas bumi).',
  },
  {
    id: 'q202',
    level: 2,
    materi: 'Energi terbarukan & tak terbarukan',
    submateri: 'Kelebihan dan keterbatasan sumber energi',
    indikator: 'PLACEHOLDER — membandingkan kelebihan dan keterbatasan',
    kesulitan: 'sedang',
    tipe: 'pg',
    pertanyaan: 'Manakah pernyataan yang paling tepat tentang panel surya dan batu bara?',
    pilihan: [
      'Panel surya bekerja sama kuat siang dan malam, batu bara tidak menghasilkan asap',
      'Panel surya bergantung pada sinar matahari, sedangkan batu bara menghasilkan asap ketika dibakar',
      'Batu bara mudah diperbarui, sedangkan panel surya persediaannya terbatas',
      'Keduanya tidak memiliki keterbatasan sama sekali',
    ],
    kunci: 1,
    pembahasan:
      'Panel surya menghasilkan listrik ketika ada sinar matahari, jadi pada malam hari atau saat mendung hasilnya berkurang. Batu bara dapat menghasilkan listrik terus-menerus, tetapi pembakarannya menghasilkan asap dan gas. Setiap sumber energi punya kelebihan sekaligus keterbatasan.',
    poin: 15,
    retry: true,
    remedial: 'Tidak ada sumber energi yang sempurna. Selalu ada kelebihan dan keterbatasan.',
  },
  {
    id: 'q203',
    level: 2,
    materi: 'Energi fosil',
    submateri: 'Terbentuknya energi fosil',
    indikator: 'PLACEHOLDER — menjelaskan sebab-akibat terbentuknya energi fosil',
    kesulitan: 'sedang',
    tipe: 'urut',
    pertanyaan: 'Susun langkah terbentuknya batu bara mulai dari peristiwa yang paling awal.',
    pilihan: [
      'Menjadi batu bara',
      'Tumbuhan dan hewan purba mati lalu tertimbun lapisan tanah',
      'Tekanan dan suhu tinggi bekerja selama jutaan tahun',
      'Sisa makhluk hidup berubah menjadi bahan organik padat',
    ],
    kunci: [
      'Tumbuhan dan hewan purba mati lalu tertimbun lapisan tanah',
      'Sisa makhluk hidup berubah menjadi bahan organik padat',
      'Tekanan dan suhu tinggi bekerja selama jutaan tahun',
      'Menjadi batu bara',
    ],
    pembahasan:
      'Batu bara terbentuk dari sisa makhluk hidup purba yang mati dan tertimbun. Berjuta-juta tahun tekanan dan suhu tinggi mengubahnya menjadi bahan padat kaya karbon yang kita kenal sebagai batu bara. Proses inilah yang membuat energi fosil disebut tak terbarukan.',
    poin: 20,
    retry: true,
    remedial: 'Alurnya: makhluk hidup mati → tertimbun → tekanan & suhu tinggi jutaan tahun → batu bara.',
  },
  {
    id: 'q204',
    level: 2,
    materi: 'Energi alternatif',
    submateri: 'Panas bumi',
    indikator: 'PLACEHOLDER — menjelaskan alasan pengelompokan energi',
    kesulitan: 'sedang',
    tipe: 'bs_alasan',
    pertanyaan:
      'Pernyataan: Panas bumi termasuk energi terbarukan. Alasan: panas bumi dihasilkan terus-menerus oleh bumi dan dapat dimanfaatkan kembali.',
    pilihan: ['Benar', 'Salah'],
    pilihanAlasan: [
      'Karena panas bumi terus dihasilkan oleh bumi sehingga dapat dimanfaatkan kembali',
      'Karena panas bumi berasal dari sisa makhluk hidup purba',
      'Karena panas bumi hanya ada satu kali lalu habis',
      'Karena panas bumi dibuat oleh pabrik',
    ],
    kunci: { st: 0, alasan: 0 },
    pembahasan:
      'Panas bumi (energi geotermal) berasal dari panas di dalam bumi yang terus tersedia, sehingga termasuk energi terbarukan. Namun pemanfaatannya perlu diperhatikan lokasinya karena tidak semua daerah memiliki sumber panas bumi.',
    poin: 15,
    retry: true,
    remedial: 'Terbarukan bukan berarti tanpa syarat: tetap harus sesuai kondisi lokasi.',
    pengayaan: 'Di Indonesia, energi panas bumi banyak dimanfaatkan di daerah dekat gunung berapi. Mengapa?',
  },
  {
    id: 'q205',
    level: 2,
    materi: 'Energi fosil',
    submateri: 'Mengapa energi fosil tak terbarukan',
    indikator: 'PLACEHOLDER — menjelaskan alasan dengan kalimat sendiri',
    kesulitan: 'sulit',
    tipe: 'uraian',
    pertanyaan:
      'Jelaskan dengan bahasamu sendiri mengapa minyak bumi digolongkan sebagai energi tak terbarukan. Tulis 1–3 kalimat.',
    kunci: {
      kataKunci: ['jutaan', 'lama', 'terbatas', 'habis', 'fosil', 'purba', 'proses'],
      min: 2,
      contoh:
        'Karena minyak bumi terbentuk dari sisa makhluk hidup purba melalui proses yang memakan waktu jutaan tahun. Persediaannya terbatas dan jika terus digunakan akan habis sehingga tidak dapat diperbarui dalam waktu singkat.',
    },
    pembahasan:
      'Energi fosil disebut tak terbarukan karena proses pembentukannya sangat lama (jutaan tahun) dan persediaannya di alam terbatas. Pemakaian yang berlebihan membuatnya cepat habis.',
    poin: 20,
    retry: true,
    remedial: 'Kata kuncinya: prosesnya sangat lama dan persediaannya terbatas.',
  },
  {
    id: 'q206',
    level: 2,
    materi: 'Energi terbarukan & tak terbarukan',
    submateri: 'Membaca tabel perbandingan',
    indikator: 'PLACEHOLDER — menganalisis informasi dalam tabel',
    kesulitan: 'sulit',
    tipe: 'pg',
    stimulus: {
      t: 'tabel',
      caption: 'Catatan teknisi laboratorium (data contoh)',
      kepala: ['Sumber energi', 'Dapat diperbarui', 'Menghasilkan asap saat dipakai'],
      baris: [
        ['Batu bara', 'Tidak', 'Ya'],
        ['Angin', 'Ya', 'Tidak'],
        ['Minyak bumi', 'Tidak', 'Ya'],
        ['Panas bumi', 'Ya', 'Tidak'],
      ],
    },
    pertanyaan:
      'Sebuah kota ingin listrik yang dapat dipakai lama dan menghasilkan sedikit asap. Berdasarkan tabel, sumber energi yang paling sesuai adalah …',
    pilihan: ['Batu bara', 'Minyak bumi', 'Angin', 'Semua sama saja'],
    kunci: 2,
    pembahasan:
      'Dari tabel, angin dapat diperbarui dan tidak menghasilkan asap sehingga paling sesuai dengan dua keinginan kota. Batu bara dan minyak bumi tidak dapat diperbarui dan menghasilkan asap. Perlu diingat, energi angin bergantung pada kecepatan angin sehingga tetap perlu dipertimbangkan kondisi lokasinya.',
    poin: 20,
    retry: true,
    remedial: 'Baca setiap kolom tabel, lalu cocokkan dengan syarat yang diminta soal.',
  },

  /* ============================== LEVEL 3 ============================== */
  {
    id: 'q301',
    level: 3,
    materi: 'Energi alternatif',
    submateri: 'Memilih energi sesuai kondisi lingkungan',
    indikator: 'PLACEHOLDER — menentukan sumber energi yang sesuai',
    kesulitan: 'sedang',
    tipe: 'pg',
    stimulus: {
      t: 'teks',
      isi:
        'Desa Tirta Angin berada di tepi sungai yang arusnya deras. Di bukit sebelah desa angin bertiup kencang hampir setiap sore. Jumlah penduduk sekitar 200 keluarga.',
    },
    pertanyaan: 'Sumber energi alternatif yang paling sesuai untuk desa tersebut adalah …',
    pilihan: [
      'Panel surya saja, karena paling mudah dipasang',
      'Turbin angin saja, karena angin tidak pernah berhenti',
      'Pembangkit listrik tenaga air (mikrohidro) dan turbin angin',
      'Batu bara, karena mudah dibawa ke desa',
    ],
    kunci: 2,
    pembahasan:
      'Desa memiliki dua keunggulan sekaligus: arus sungai yang deras dan angin yang kencang. Menggabungkan mikrohidro dan turbin angin membuat listrik lebih stabil, karena ketika angin melemah, air masih mengalir. Pilihan lain kurang tepat karena bergantung pada satu sumber saja atau menimbulkan asap.',
    poin: 20,
    retry: true,
    remedial: 'Pilih sumber energi yang cocok dengan kondisi alam setempat.',
    pengayaan: 'Apa kekurangan mikrohidro jika musim kemarau tiba dan debit air sungai berkurang?',
  },
  {
    id: 'q302',
    level: 3,
    materi: 'Energi alternatif',
    submateri: 'Panel surya dan kondisi cuaca',
    indikator: 'PLACEHOLDER — mempertimbangkan kondisi cuaca',
    kesulitan: 'sulit',
    tipe: 'pg',
    stimulus: {
      t: 'grafik',
      caption: 'Perkiraan jam cerah per hari di Desa Kembang (bulan berturut-turut)',
      satuan: 'jam cerah/hari',
      data: [
        { label: 'Jan', nilai: 3 },
        { label: 'Feb', nilai: 4 },
        { label: 'Mar', nilai: 6 },
        { label: 'Apr', nilai: 8 },
        { label: 'Mei', nilai: 9 },
        { label: 'Jun', nilai: 7 },
      ],
    },
    pertanyaan:
      'Desa Kembang ingin memasang panel surya. Manakah pertimbangan yang paling lengkap?',
    pilihan: [
      'Panel surya cukup dipasang, hasilnya pasti sama setiap bulan',
      'Panel surya tidak boleh dipasang karena ada bulan yang mendung',
      'Perlu memperhatikan jumlah sinar matahari, kebutuhan energi warga, dan menyiapkan penyimpanan energi atau sumber energi pendukung untuk bulan yang mendung',
      'Panel surya hanya bekerja pada bulan Januari dan Februari',
    ],
    kunci: 2,
    pembahasan:
      'Hasil panel surya berubah-ubah mengikuti banyak sedikitnya sinar matahari. Pada bulan dengan jam cerah sedikit seperti Januari, hasilnya lebih kecil. Karena itu perlu diperhitungkan kebutuhan energi warga, disediakan baterai (penyimpanan energi), dan bila perlu ada sumber energi pendukung. Panel surya tetap dapat dipasang, tetapi hasilnya tidak selalu sama setiap waktu.',
    poin: 25,
    retry: true,
    remedial: 'Pertimbangkan: intensitas cahaya, kebutuhan, penyimpanan, dan cadangan.',
  },
  {
    id: 'q303',
    level: 3,
    materi: 'Energi alternatif',
    submateri: 'Keterbatasan energi alternatif',
    indikator: 'PLACEHOLDER — menjelaskan keterbatasan teknologi energi',
    kesulitan: 'sedang',
    tipe: 'uraian',
    pertanyaan:
      'Tuliskan satu alasan mengapa Desa Nusa Timur yang sering berkabut dan jarang mendapat sinar matahari sebaiknya tidak hanya mengandalkan panel surya.',
    kunci: {
      kataKunci: ['mendung', 'kabut', 'berkurang', 'tidak stabil', 'malam', 'cadangan', 'alternatif', 'kurang'],
      min: 2,
      contoh:
        'Karena sinar matahari sering tertutup kabut, listrik yang dihasilkan panel surya menjadi berkurang dan tidak stabil. Desa perlu sumber energi cadangan, misalnya tenaga air atau angin.',
    },
    pembahasan:
      'Panel surya membutuhkan sinar matahari. Pada daerah yang sering berkabut atau mendung, hasilnya berkurang sehingga diperlukan sumber energi lain sebagai pendukung. Semua teknologi energi memiliki kelebihan dan keterbatasan.',
    poin: 20,
    retry: true,
    remedial: 'Tuliskan hubungan: sedikit sinar matahari → listrik panel surya berkurang.',
  },
  {
    id: 'q304',
    level: 3,
    materi: 'Energi alternatif',
    submateri: 'Pertimbangan memilih teknologi energi',
    indikator: 'PLACEHOLDER — memilih solusi berdasarkan bukti',
    kesulitan: 'sulit',
    tipe: 'kasus',
    stimulus: {
      t: 'teks',
      isi:
        'Desa Puncak Asri berada di kaki gunung. Uap panas terlihat keluar dari tanah di pinggir desa. Sinar matahari cukup banyak, tetapi hutan di sekitar desa dilindungi. Biaya pemasangan awal relatif mahal.',
    },
    pertanyaan:
      'Tuliskan sumber energi yang kamu usulkan dan satu alasan berdasarkan informasi di atas. Tulis 1–3 kalimat.',
    kunci: {
      kataKunci: ['panas bumi', 'geotermal', 'uap', 'gunung', 'matahari', 'alasan', 'karena'],
      min: 2,
      contoh:
        'Saya mengusulkan energi panas bumi (geotermal) karena di desa terlihat uap panas keluar dari tanah yang menandakan tersedia sumber panas bumi. Panel surya juga dapat dipasang sebagai pendukung karena sinar matahari cukup banyak.',
    },
    pembahasan:
      'Uap panas dari tanah di kaki gunung menunjukkan adanya sumber panas bumi. Panas bumi dapat menghasilkan listrik terus-menerus. Namun pemasangannya perlu perencanaan karena biaya awal mahal dan harus menjaga hutan lindung. Menggabungkan dengan panel surya membuat listrik lebih andal.',
    poin: 25,
    retry: true,
    remedial: 'Baca informasi penting pada kasus: uap panas, kaki gunung, matahari, hutan lindung, biaya.',
  },
  {
    id: 'q305',
    level: 3,
    materi: 'Energi alternatif',
    submateri: 'Memilih sumber energi untuk kebutuhan berbeda',
    indikator: 'PLACEHOLDER — mempertimbangkan kebutuhan masyarakat',
    kesulitan: 'sedang',
    tipe: 'pg',
    stimulus: {
      t: 'tabel',
      caption: 'Kebutuhan warga Desa Mekar (data contoh)',
      kepala: ['Kebutuhan', 'Waktu pemakaian'],
      baris: [
        ['Penerangan rumah', 'Sore sampai malam'],
        ['Pompa air sawah', 'Pagi dan siang'],
        ['Pendingin bahan panen', 'Sepanjang hari'],
      ],
    },
    pertanyaan:
      'Pompa air sawah dipakai pada pagi dan siang hari ketika sinar matahari sedang banyak. Sumber energi yang paling sesuai untuk pompa tersebut adalah …',
    pilihan: ['Panel surya', 'Lilin', 'Baterai sekali pakai', 'Bensin curah'],
    kunci: 0,
    pembahasan:
      'Pompa bekerja pada pagi dan siang, yaitu saat sinar matahari melimpah, sehingga panel surya sangat sesuai. Baterai sekali pakai dan bensin menghasilkan sampah atau asap, sedangkan lilin tidak cukup kuat untuk memompa air.',
    poin: 15,
    retry: true,
    remedial: 'Cocokkan waktu pemakaian dengan waktu sumber energi tersedia.',
  },
  {
    id: 'q306',
    level: 3,
    materi: 'Energi alternatif',
    submateri: 'Energi angin',
    indikator: 'PLACEHOLDER — menghubungkan kondisi lingkungan dengan teknologi',
    kesulitan: 'mudah',
    tipe: 'bs',
    pertanyaan:
      'Turbin angin sebaiknya dipasang di daerah yang jarang mendapat angin, karena angin selalu tersedia di mana saja dengan kekuatan yang sama.',
    pilihan: ['Benar', 'Salah'],
    kunci: 1,
    pembahasan:
      'Salah. Kekuatan angin berbeda di setiap tempat dan waktu. Turbin angin paling cocok dipasang di daerah yang sering mendapat angin kencang, misalnya di pesisir atau di bukit.',
    poin: 10,
    retry: true,
    remedial: 'Ingat: energi angin bergantung pada kecepatan angin di lokasi tersebut.',
  },

  /* ============================== LEVEL 4 ============================== */
  {
    id: 'q401',
    level: 4,
    materi: 'Dampak energi fosil & perubahan iklim',
    submateri: 'Hubungan energi fosil dengan emisi',
    indikator: 'PLACEHOLDER — menghubungkan penggunaan energi fosil dengan emisi',
    kesulitan: 'sedang',
    tipe: 'pg',
    stimulus: {
      t: 'teks',
      isi:
        'Di Kelurahan Cerah, banyak warga memakai kendaraan bermesin bahan bakar minyak setiap hari. Asap kendaraan dan asap pabrik terlihat jelas di udara, dan suhu siang terasa lebih panas daripada biasanya.',
    },
    pertanyaan: 'Hubungan yang paling tepat antara kegiatan tersebut dengan perubahan iklim adalah …',
    pilihan: [
      'Pembakaran bahan bakar fosil melepaskan gas ke udara yang dapat memperkuat efek rumah kaca dan menyebabkan suhu bumi meningkat',
      'Kendaraan menghasilkan angin yang membuat cuaca berubah',
      'Asap kendaraan membuat hujan turun setiap hari',
      'Tidak ada hubungan antara bahan bakar fosil dengan cuaca',
    ],
    kunci: 0,
    pembahasan:
      'Pembakaran bahan bakar fosil melepaskan gas, termasuk gas karbon dioksida, ke udara. Gas-gas ini menahan panas di atmosfer sehingga suhu bumi cenderung meningkat dan cuaca menjadi lebih sulit ditebak. Perubahan iklim dipengaruhi banyak faktor dan penanganannya perlu dilakukan bersama, bukan dengan satu cara saja.',
    poin: 20,
    retry: true,
    remedial: 'Rantainya: bakar fosil → gas ke udara → panas tertahan → suhu bumi naik.',
  },
  {
    id: 'q402',
    level: 4,
    materi: 'Dampak energi fosil & perubahan iklim',
    submateri: 'Mencari sumber pemborosan energi',
    indikator: 'PLACEHOLDER — menemukan sumber pemborosan energi',
    kesulitan: 'sedang',
    tipe: 'pg',
    stimulus: {
      t: 'tabel',
      caption: 'Catatan pemakaian listrik Keluarga Budi (data contoh)',
      kepala: ['Keterangan', 'Bulan ke-1', 'Bulan ke-2'],
      baris: [
        ['Lampu menyala per hari', '6 jam', '14 jam'],
        ['AC dipasang pada suhu', '25 °C', '16 °C'],
        ['Televisi tanpa penonton', '1 jam', '5 jam'],
      ],
    },
    pertanyaan: 'Perubahan mana yang paling besar membuat pemborosan energi?',
    pilihan: [
      'Lampu menyala jauh lebih lama, dari 6 jam menjadi 14 jam',
      'Suhu AC diubah menjadi 25 °C',
      'Televisi ditonton lebih lama bersama keluarga',
      'Semua perubahan memberi dampak yang sama',
    ],
    kunci: 0,
    pembahasan:
      'Lampu menyala dari 6 jam menjadi 14 jam berarti lebih dari dua kali lipat waktu pemakaian, sehingga energi yang terpakai juga jauh lebih besar. Menyetel AC pada suhu 16 °C juga menambah pemakaian energi dibandingkan 25 °C. Dua perubahan itulah yang sebaiknya diperbaiki lebih dulu.',
    poin: 20,
    retry: true,
    remedial: 'Bandingkan angka bulan ke-1 dan bulan ke-2, lalu cari perubahannya yang paling besar.',
  },
  {
    id: 'q403',
    level: 4,
    materi: 'Hemat energi & pemilihan sumber energi',
    submateri: 'Studi kasus hemat energi',
    indikator: 'PLACEHOLDER — mengusulkan tindakan dan menjelaskan peran energi alternatif',
    kesulitan: 'sulit',
    tipe: 'kasus',
    stimulus: {
      t: 'teks',
      isi:
        'Sebuah lingkungan menggunakan kendaraan berbahan bakar fosil secara berlebihan. Selain itu, banyak lampu dan perangkat listrik dibiarkan menyala meskipun tidak digunakan.',
    },
    pertanyaan:
      'Sebutkan DUA tindakan untuk mengurangi pemborosan energi, lalu jelaskan bagaimana energi alternatif dapat membantu. Tulis 3–5 kalimat.',
    kunci: {
      kataKunci: ['matikan', 'mematikan', 'berjalan', 'sepeda', 'transportasi', 'mengurangi', 'panel', 'matahari', 'alternatif', 'angin', 'air', 'karena', 'sehingga'],
      min: 4,
      contoh:
        '(1) Mematikan lampu dan perangkat listrik ketika tidak digunakan; (2) berjalan kaki, bersepeda, atau naik transportasi bersama untuk jarak dekat. Energi alternatif seperti panel surya atau turbin angin membantu karena menghasilkan listrik tanpa asap pembakaran bahan bakar fosil, sehingga udara lebih bersih. Namun penggunaannya perlu disesuaikan dengan kondisi lokasi dan tetap perlu dihemat.',
    },
    pembahasan:
      'Tindakan penghematan: mematikan perangkat yang tidak dipakai, memakai kendaraan seperlunya atau transportasi bersama, dan memilih perangkat yang hemat energi. Energi alternatif seperti matahari dan angin membantu menghasilkan listrik dengan sedikit asap. Namun tidak ada satu langkah pun yang mampu menyelesaikan seluruh masalah iklim; penghematan dan perubahan sumber energi harus dilakukan bersama-sama dan disesuaikan dengan kondisi setempat.',
    poin: 30,
    retry: true,
    remedial: 'Tulis dua tindakan nyata + peran energi alternatif. Gunakan kata "karena" atau "sehingga".',
    pengayaan: 'Diskusikan: apa yang terjadi jika semua warga hanya mengandalkan panel surya tanpa penghematan?',
  },
  {
    id: 'q404',
    level: 4,
    materi: 'Hemat energi & pemilihan sumber energi',
    submateri: 'Tindakan hemat energi sehari-hari',
    indikator: 'PLACEHOLDER — mengidentifikasi tindakan hemat energi',
    kesulitan: 'mudah',
    tipe: 'pg',
    pertanyaan: 'Manakah tindakan yang membantu menghemat energi di rumah?',
    pilihan: [
      'Membuka jendela pada siang hari agar cahaya matahari masuk, lalu mematikan lampu',
      'Menyalakan semua lampu sejak pagi agar tidak repot menyalakannya lagi',
      'Membiarkan pengisi daya ponsel terus menempel di stopkontak',
      'Menyetel AC pada suhu paling rendah agar cepat dingin',
    ],
    kunci: 0,
    pembahasan:
      'Cahaya matahari pada siang hari dapat menerangi ruangan sehingga lampu tidak perlu dinyalakan. Menyalakan lampu terus-menerus, membiarkan pengisi daya terpasang, dan menyetel AC sangat dingin membuat energi terbuang.',
    poin: 10,
    retry: true,
    remedial: 'Hemat energi = memakai energi seperlunya dan memanfaatkan yang sudah tersedia.',
  },
  {
    id: 'q405',
    level: 4,
    materi: 'Dampak energi fosil & perubahan iklim',
    submateri: 'Sebab-akibat dan solusi',
    indikator: 'PLACEHOLDER — menganalisis sebab-akibat dan memilih solusi',
    kesulitan: 'sulit',
    tipe: 'pg',
    stimulus: {
      t: 'teks',
      isi:
        'Sejak pabrik di tepi sungai memakai generator diesel siang dan malam, asap tebal sering terlihat, warga mengeluh udara pengap, dan tagihan bahan bakar pabrik naik dua kali lipat.',
    },
 pertanyaan: 'Solusi yang paling mempertimbangkan berbagai pihak adalah …',
    pilihan: [
      'Menutup semua kegiatan warga agar tidak ada energi yang terpakai',
      'Pabrik memakai generator hanya pada jam kerja, memasang panel surya untuk kebutuhan siang, dan menghemat pemakaian listrik di dalam pabrik',
      'Menambah generator diesel agar asapnya tidak terlihat',
      'Membiarkan saja karena asap akan hilang sendiri',
    ],
    kunci: 1,
    pembahasan:
      'Solusi tersebut mengurangi asap sekaligus biaya bahan bakar dengan membatasi jam kerja generator, memanfaatkan sinar matahari pada siang hari, dan menghemat pemakaian listrik. Menutup seluruh kegiatan tidak realistis, menambah generator justru menambah asap, dan membiarkan masalah membuat dampaknya bertambah.',
    poin: 25,
    retry: true,
    remedial: 'Pilih solusi yang mengurangi dampak tanpa merugikan kebutuhan masyarakat.',
  },

  /* ============================== LEVEL 5 ============================== */
  {
    id: 'q501',
    level: 5,
    materi: 'Hemat energi & pemilihan sumber energi',
    submateri: 'Strategi energi berbasis bukti',
    indikator: 'PLACEHOLDER — memilih strategi berdasarkan data',
    kesulitan: 'sulit',
    tipe: 'pg',
    stimulus: {
      t: 'tabel',
      caption: 'Data Kota Arunika untuk rencana 5 tahun (data contoh)',
      kepala: ['Aspek', 'Keterangan'],
      baris: [
        ['Sinar matahari', '8 jam/hari sepanjang tahun'],
        ['Sungai besar', 'Ada, arusnya deras'],
        ['Angin', 'Lemah, hanya di bulan tertentu'],
        ['Kebutuhan listrik', 'Meningkat setiap tahun'],
        ['Udara', 'Sering berkabut asap'],
      ],
    },
    pertanyaan: 'Rencana energi yang paling sesuai dengan seluruh data adalah …',
    pilihan: [
      'Mengandalkan turbin angin saja karena paling mudah dirawat',
      'Panel surya sebagai tenaga utama, diperkuat pembangkit listrik tenaga air, disertai penghematan energi',
      'Membakar lebih banyak bahan bakar fosil agar listrik selalu tersedia',
      'Mengandalkan panel surya saja tanpa penyimpanan dan tanpa penghematan',
    ],
    kunci: 1,
    pembahasan:
      'Data menunjukkan sinar matahari melimpah dan sungai deras, sedangkan angin lemah. Karena itu panel surya cocok menjadi tenaga utama dan diperkuat tenaga air sebagai pendukung. Udara yang berkabut asap menandakan perlu penghematan dan pengurangan pembakaran. Tidak cukup hanya satu cara: sumber energi, penyimpanan, dan penghematan harus dijalankan bersama.',
    poin: 30,
    retry: true,
    remedial: 'Bandingkan setiap baris data dengan kemampuan masing-masing sumber energi.',
  },
  {
    id: 'q502',
    level: 5,
    materi: 'Hemat energi & pemilihan sumber energi',
    submateri: 'Menjelaskan alasan berdasarkan bukti',
    indikator: 'PLACEHOLDER — menjelaskan alasan dengan bukti',
    kesulitan: 'sulit',
    tipe: 'kasus',
    stimulus: {
      t: 'grafik',
      caption: 'Jumlah hari berkabut asap di Kota Arunika per bulan (data contoh)',
      satuan: 'hari',
      data: [
        { label: 'Jul', nilai: 2 },
        { label: 'Agu', nilai: 4 },
        { label: 'Sep', nilai: 12 },
        { label: 'Okt', nilai: 15 },
        { label: 'Nov', nilai: 8 },
        { label: 'Des', nilai: 3 },
      ],
    },
    pertanyaan:
      'Berdasarkan grafik, bulan apakah produksi panel surya kemungkinan paling berkurang, dan apa yang sebaiknya dilakukan kota? Tulis 2–4 kalimat.',
    kunci: {
      kataKunci: ['oktober', 'okt', 'september', 'sep', 'kabut', 'berkurang', 'cadangan', 'penyimpanan', 'hemat', 'alternatif', 'karena'],
      min: 3,
      contoh:
        'Produksi panel surya kemungkinan paling berkurang pada bulan Oktober karena hari berkabut asapnya paling banyak (15 hari). Kota sebaiknya menyiapkan sumber energi cadangan seperti tenaga air, menyimpan energi pada baterai, dan mengajak warga menghemat energi pada bulan tersebut.',
    },
    pembahasan:
      'Kabut dan asap mengurangi sinar matahari yang sampai ke panel surya. Pada bulan dengan hari berkabut paling banyak, hasil panel surya berkurang sehingga perlu sumber cadangan, penyimpanan energi, dan penghematan. Perubahan iklim dan pencemaran juga membuat cuaca semakin sulit ditebak.',
    poin: 30,
    retry: true,
    remedial: 'Cari batang tertinggi pada grafik, lalu hubungkan dengan cara kerja panel surya.',
  },
  {
    id: 'q503',
    level: 5,
    materi: 'Energi terbarukan & tak terbarukan',
    submateri: 'Mengintegrasikan konsep energi',
    indikator: 'PLACEHOLDER — mengintegrasikan konsep energi',
    kesulitan: 'sedang',
    tipe: 'bs_alasan',
    pertanyaan:
      'Pernyataan: Menghemat energi sama pentingnya dengan mencari sumber energi alternatif. Alasan: menghemat mengurangi kebutuhan energi, sedangkan energi alternatif menggantikan sumber energi yang menimbulkan dampak besar.',
    pilihan: ['Benar', 'Salah'],
    pilihanAlasan: [
      'Karena keduanya saling melengkapi: kebutuhan berkurang dan sumber energi menjadi lebih bersih',
      'Karena energi alternatif dapat menggantikan semua energi dalam satu malam',
      'Karena menghemat energi tidak berpengaruh apa pun',
      'Karena energi fosil tidak menimbulkan dampak',
    ],
    kunci: { st: 0, alasan: 0 },
    pembahasan:
      'Benar, dan alasannya tepat. Menghemat energi membuat kebutuhan energi lebih kecil, sedangkan energi alternatif menyediakan sumber yang lebih bersih. Keduanya diperlukan karena tidak ada satu tindakan tunggal yang mampu menyelesaikan seluruh masalah energi dan iklim.',
    poin: 20,
    retry: true,
    remedial: 'Ingat: hemat energi + energi bersih = dilakukan bersamaan.',
  },
  {
    id: 'q504',
    level: 5,
    materi: 'Hemat energi & pemilihan sumber energi',
    submateri: 'Rencana aksi sederhana',
    indikator: 'PLACEHOLDER — mengusulkan tindakan sederhana',
    kesulitan: 'sedang',
    tipe: 'uraian',
    pertanyaan:
      'Tuliskan TIGA tindakan sederhana yang bisa kamu lakukan di rumah atau sekolah untuk menggunakan energi secara bijak.',
    kunci: {
      kataKunci: ['matikan', 'mematikan', 'cabut', 'jendela', 'sepeda', 'jalan kaki', 'transportasi', 'air', 'hemat', 'lampu', 'colokan', 'bersama'],
      min: 3,
      contoh:
        'Contoh: mematikan lampu saat tidak digunakan, mencabut pengisi daya setelah baterai penuh, berjalan kaki atau bersepeda untuk perjalanan dekat. (Jawaban lain yang masuk akal juga diterima.)',
    },
    pembahasan:
      'Tindakan sederhana seperti mematikan lampu, mencabut pengisi daya, memanfaatkan cahaya siang, memakai kendaraan seperlunya, dan mematikan air saat tidak dipakai membantu menghemat energi. Meskipun kecil, jika dilakukan banyak orang hasilnya besar.',
    poin: 20,
    retry: true,
    remedial: 'Pikirkan kebiasaan kecil di rumah yang membuat energi terbuang percuma.',
  },
  {
    id: 'q505',
    level: 5,
    materi: 'Dampak energi fosil & perubahan iklim',
    submateri: 'Evaluasi dan masa depan lingkungan',
    indikator: 'PLACEHOLDER — mengevaluasi dampak terhadap masa depan',
    kesulitan: 'sulit',
    tipe: 'pg',
    stimulus: {
      t: 'gambar',
      src: 'images/bg-masadepan.jpg',
      caption: 'Gambaran kota masa depan yang memakai energi matahari, angin, dan air.',
    },
    pertanyaan: 'Manakah kesimpulan yang paling tepat tentang usaha menjaga masa depan lingkungan?',
    pilihan: [
      'Satu kota cukup memasang panel surya, lalu masalah iklim selesai',
      'Menjaga lingkungan memerlukan gabungan penghematan energi, pemakaian energi yang lebih bersih, dan kebiasaan baik masyarakat dalam waktu yang lama',
      'Perubahan iklim hanya dapat diatasi oleh pemerintah, bukan oleh warga',
      'Energi fosil sebaiknya langsung dihentikan tanpa menyiapkan penggantinya',
    ],
    kunci: 1,
    pembahasan:
      'Menjaga lingkungan memerlukan banyak usaha yang berjalan bersama: menghemat energi, beralih ke sumber energi yang lebih bersih sesuai kondisi daerah, serta kebiasaan baik yang terus dilakukan. Tidak ada satu langkah cepat yang mampu menyelesaikan seluruh masalah perubahan iklim.',
    poin: 25,
    retry: true,
    remedial: 'Hindari jawaban yang terlalu sederhana untuk masalah yang rumit.',
  },
];

/* -------------------------------------------------------------------------- */
/*                                  LEVEL                                     */
/* -------------------------------------------------------------------------- */

export type ObjArt =
  | 'papan'
  | 'panelSurya'
  | 'generator'
  | 'perangkat'
  | 'warga'
  | 'mesin'
  | 'kartu'
  | 'cerobong'
  | 'turbin'
  | 'kincir'
  | 'ventil'
  | 'gerbang'
  | 'tempatSampah';

export interface ObjDef {
  id: string;
  art: ObjArt;
  x: number;
  y: number;
  label: string;
  info: string[];
  soalId?: string;
  bukaMusuh?: string; // id musuh yang perisainya turun setelah objek ini selesai
  bonusGP?: number;
}

export interface MusuhDef {
  id: string;
  jenis: 'waste' | 'pollution' | 'fossil' | 'drone' | 'boss';
  x: number;
  y: number;
  min: number;
  max: number;
  hp: number;
  perisaiSoal?: string; // hanya bisa dikalahkan setelah soal ini benar
  perluBenar?: number; // boss: butuh N jawaban benar
}

export interface LevelDef {
  id: number;
  nama: string;
  tagline: string;
  latar: string;
  tujuan: string[];
  bg: string;
  tema: 'kota' | 'lab' | 'desa' | 'iklim' | 'masadepan';
  lebar: number;
  targetBenar: number;
  targetKartu: number;
  intro: string[];
  platform: { x: number; y: number; w: number }[];
  objek: ObjDef[];
  musuh: MusuhDef[];
  kartu: { x: number; y: number }[];
  gerbang: { x: number; y: number };
  mampu: string; // kemampuan yang dibuka di level ini
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    nama: 'Kota yang Kehabisan Energi',
    tagline: 'Misi 01 · Energi sehari-hari',
    latar:
      'Kota Arunika gelap. Lampu jalan mati, kendaraan mengepulkan asap, dan warga memakai banyak perangkat elektronik tanpa perhitungan.',
    tujuan: [
      'Mengenali penggunaan energi dalam kehidupan sehari-hari',
      'Mengidentifikasi sumber energi perangkat di sekitar',
      'Membedakan penggunaan energi yang bijak dan boros',
      'Mengenali contoh energi fosil',
    ],
    bg: 'images/bg-kota.jpg',
    tema: 'kota',
    lebar: 3200,
    targetBenar: 3,
    targetKartu: 4,
    mampu: 'Energy Cast',
    intro: [
      'Selamat datang, Penjaga Energi! Kota Arunika sedang kehabisan energi.',
      'Tugasmu: temukan perangkat yang memakai energi, pelajari sumbernya, lalu nyalakan kembali generator kota.',
      'Bergerak dengan A/D atau tombol panah. Lompat: W/Spasi. Pukul: J. Tendang: K. Energy Cast: L. Interaksi: E.',
    ],
    platform: [
      { x: 420, y: 380, w: 180 },
      { x: 760, y: 320, w: 160 },
      { x: 1180, y: 385, w: 200 },
      { x: 1620, y: 330, w: 180 },
      { x: 2080, y: 385, w: 220 },
      { x: 2520, y: 320, w: 170 },
    ],
    kartu: [
      { x: 470, y: 330 },
      { x: 810, y: 270 },
      { x: 1250, y: 335 },
      { x: 1680, y: 280 },
      { x: 2150, y: 335 },
      { x: 2570, y: 270 },
    ],
    objek: [
      {
        id: 'o101',
        art: 'papan',
        x: 160,
        y: 470,
        label: 'Papan Misi',
        info: [
          'MISI 01 — Nyalakan kembali Kota Arunika.',
          'Kumpulkan kartu energi, pelajari perangkat di kota, dan jawab misi pengetahuan sebelum gerbang dibuka.',
        ],
      },
      {
        id: 'o102',
        art: 'perangkat',
        x: 560,
        y: 470,
        label: 'Televisi yang Dibiarkan Menyala',
        info: [
          'Televisi menyala walaupau tidak ada yang menonton.',
          'Televisi memakai energi listrik. Listrik dihasilkan dari berbagai sumber energi, termasuk batu bara dan gas alam yang termasuk energi fosil.',
        ],
        soalId: 'q101',
        bukaMusuh: 'm101',
      },
      {
        id: 'o103',
        art: 'perangkat',
        x: 1000,
        y: 470,
        label: 'Kipas Angin dan Lampu',
        info: [
          'Kipas angin menyala 8 jam sehari dan lampu dinyalakan sejak pagi.',
          'Semakin lama perangkat menyala, semakin besar energi yang terpakai.',
        ],
        soalId: 'q102',
      },
      {
        id: 'o104',
        art: 'warga',
        x: 1420,
        y: 470,
        label: 'Pak RT Arunika',
        info: [
          '"Nak, sejak semua orang memakai energi tanpa perhitungan, tagihan kami membengkak dan udara jadi pengap."',
          '"Coba cari perilaku boros energi di lingkungan ini, ya."',
        ],
        soalId: 'q103',
        bukaMusuh: 'm102',
      },
      {
        id: 'o105',
        art: 'tempatSampah',
        x: 1880,
        y: 470,
        label: 'Tempat Sampah Energi',
        info: [
          'Di sini terbuang energi: lampu menyala 24 jam dan kendaraan dipakai untuk jarak dekat.',
        ],
        soalId: 'q104',
      },
      {
        id: 'o106',
        art: 'generator',
        x: 2380,
        y: 470,
        label: 'Generator Kota',
        info: [
          'Generator kota memakai bahan bakar minyak, yaitu bagian dari energi fosil.',
          'Jawab misi pengetahuan untuk memperbaiki generator. (Kekuatan energi tokoh dalam game ini adalah unsur fantasi, bukan proses ilmiah yang sebenarnya.)',
        ],
        soalId: 'q106',
        bonusGP: 40,
      },
      {
        id: 'o107',
        art: 'panelSurya',
        x: 2760,
        y: 470,
        label: 'Panel Surya Kecil',
        info: [
          'Panel surya mengubah sinar matahari menjadi energi listrik.',
          'Panel ini bekerja baik pada siang hari yang cerah dan tidak menghasilkan listrik pada malam hari.',
        ],
        soalId: 'q105',
      },
    ],
    musuh: [
      { id: 'm101', jenis: 'waste', x: 900, y: 430, min: 820, max: 1080, hp: 2, perisaiSoal: 'q101' },
      { id: 'm102', jenis: 'waste', x: 1700, y: 430, min: 1620, max: 1820, hp: 2, perisaiSoal: 'q103' },
      { id: 'm103', jenis: 'drone', x: 2200, y: 300, min: 2100, max: 2350, hp: 2 },
    ],
    gerbang: { x: 3050, y: 470 },
  },
  {
    id: 2,
    nama: 'Laboratorium Energi',
    tagline: 'Misi 02 · Klasifikasi sumber energi',
    latar:
      'Laboratorium kota menyimpan kartu sumber energi. Semua kartu harus dikelompokkan dengan benar sebelum mesin penyaring udara dinyalakan.',
    tujuan: [
      'Mengidentifikasi energi fosil dan energi terbarukan',
      'Mengelompokkan sumber energi berdasarkan sifatnya',
      'Membandingkan kelebihan dan keterbatasan sumber energi',
      'Menjelaskan sebab-akibat terbentuknya energi fosil',
    ],
    bg: 'images/bg-lab.jpg',
    tema: 'lab',
    lebar: 3400,
    targetBenar: 4,
    targetKartu: 5,
    mampu: 'Solar Power',
    intro: [
      'Di Laboratorium Energi tersimpan kartu batu bara, minyak bumi, matahari, angin, air, dan panas bumi.',
      'Kelompokkan kartu dengan benar. Beberapa Pollution Bot menjaga mesin laboratorium.',
      'Pollution Bot hanya bisa dinonaktifkan setelah kamu menemukan sumber pencemarannya melalui misi pengetahuan.',
    ],
    platform: [
      { x: 380, y: 385, w: 170 },
      { x: 720, y: 320, w: 150 },
      { x: 1120, y: 385, w: 190 },
      { x: 1560, y: 320, w: 170 },
      { x: 1980, y: 385, w: 200 },
      { x: 2460, y: 330, w: 180 },
      { x: 2880, y: 385, w: 190 },
    ],
    kartu: [
      { x: 430, y: 335 },
      { x: 770, y: 270 },
      { x: 1180, y: 335 },
      { x: 1620, y: 270 },
      { x: 2050, y: 335 },
      { x: 2520, y: 280 },
      { x: 2940, y: 335 },
    ],
    objek: [
      {
        id: 'o201',
        art: 'papan',
        x: 170,
        y: 470,
        label: 'Papan Misi',
        info: ['MISI 02 — Kelompokkan sumber energi dan nyalakan mesin penyaring udara.'],
      },
      {
        id: 'o202',
        art: 'mesin',
        x: 620,
        y: 470,
        label: 'Rak Kartu Sumber Energi',
        info: [
          'Kartu A: batu bara. Kartu B: turbin angin. Kartu C: minyak bumi. Kartu D: panel surya.',
          'Mana yang persediaannya terbatas?',
        ],
        soalId: 'q201',
        bukaMusuh: 'm201',
      },
      {
        id: 'o203',
        art: 'mesin',
        x: 1050,
        y: 470,
        label: 'Alat Perbanding Energi',
        info: [
          'Alat ini membandingkan kelebihan dan keterbatasan dua sumber energi.',
          'Setiap sumber energi punya kelebihan sekaligus keterbatasan.',
        ],
        soalId: 'q202',
      },
      {
        id: 'o204',
        art: 'mesin',
        x: 1500,
        y: 470,
        label: 'Mesin Waktu Geologi',
        info: [
          'Mesin ini menampilkan pembentukan energi fosil.',
          'Prosesnya memakan waktu jutaan tahun.',
        ],
        soalId: 'q203',
        bukaMusuh: 'm202',
      },
      {
        id: 'o205',
        art: 'mesin',
        x: 1950,
        y: 470,
        label: 'Tabung Panas Bumi',
        info: [
          'Panas bumi berasal dari panas di dalam bumi dan dapat dimanfaatkan untuk menghasilkan listrik.',
          'Namun tidak semua daerah memiliki sumber panas bumi.',
        ],
        soalId: 'q204',
      },
      {
        id: 'o206',
        art: 'warga',
        x: 2400,
        y: 470,
        label: 'Dr. Larasati',
        info: [
          '"Coba jelaskan dengan bahasamu sendiri mengapa minyak bumi disebut tak terbarukan."',
          '"Menulis dengan kalimat sendiri membantumu memahami, bukan sekadar menghafal."',
        ],
        soalId: 'q205',
      },
      {
        id: 'o207',
        art: 'mesin',
        x: 2860,
        y: 470,
        label: 'Mesin Penyaring Udara',
        info: ['Mesin ini menyaring asap laboratorium. Nyalakan dengan membaca data teknisi.'],
        soalId: 'q206',
        bonusGP: 40,
      },
    ],
    musuh: [
      { id: 'm201', jenis: 'pollution', x: 850, y: 430, min: 760, max: 980, hp: 3, perisaiSoal: 'q201' },
      { id: 'm202', jenis: 'pollution', x: 1750, y: 430, min: 1660, max: 1900, hp: 3, perisaiSoal: 'q203' },
      { id: 'm203', jenis: 'fossil', x: 2650, y: 430, min: 2560, max: 2760, hp: 3 },
    ],
    gerbang: { x: 3230, y: 470 },
  },
  {
    id: 3,
    nama: 'Desa Energi Alternatif',
    tagline: 'Misi 03 · Energi sesuai kondisi lingkungan',
    latar:
      'Desa Tirta Angin membutuhkan listrik. Setiap dusun memiliki kondisi alam yang berbeda, jadi sumber energinya juga harus berbeda.',
    tujuan: [
      'Menentukan sumber energi alternatif yang sesuai kondisi lingkungan',
      'Menghubungkan cuaca, lokasi, dan kebutuhan masyarakat',
      'Menjelaskan keterbatasan setiap teknologi energi',
      'Menganalisis informasi dalam grafik sederhana',
    ],
    bg: 'images/bg-desa.jpg',
    tema: 'desa',
    lebar: 3400,
    targetBenar: 4,
    targetKartu: 5,
    mampu: 'Wind Power',
    intro: [
      'Di desa ini ada sungai deras, bukit berangin, dan ladang yang luas.',
      'Amati kondisi setiap dusun sebelum memilih teknologi energinya.',
      'Ingat: jawaban yang masuk akal bisa lebih dari satu. Yang dinilai adalah alasanmu.',
    ],
    platform: [
      { x: 400, y: 385, w: 180 },
      { x: 780, y: 330, w: 160 },
      { x: 1220, y: 385, w: 180 },
      { x: 1660, y: 320, w: 170 },
      { x: 2100, y: 385, w: 200 },
      { x: 2560, y: 330, w: 170 },
    ],
    kartu: [
      { x: 450, y: 335 },
      { x: 830, y: 280 },
      { x: 1280, y: 335 },
      { x: 1720, y: 270 },
      { x: 2160, y: 335 },
      { x: 2620, y: 280 },
    ],
    objek: [
      {
        id: 'o301',
        art: 'papan',
        x: 170,
        y: 470,
        label: 'Papan Misi',
        info: ['MISI 03 — Pilih sumber energi yang sesuai untuk setiap dusun.'],
      },
      {
        id: 'o302',
        art: 'kincir',
        x: 600,
        y: 470,
        label: 'Dusun Tepi Sungai',
        info: [
          'Sungai mengalir deras sepanjang tahun. Di bukit sebelahnya angin bertiup kencang setiap sore.',
          'Sumber energi apa yang cocok?',
        ],
        soalId: 'q301',
        bukaMusuh: 'm301',
      },
      {
        id: 'o303',
        art: 'panelSurya',
        x: 1050,
        y: 470,
        label: 'Papan Cuaca Dusun Kembang',
        info: [
          'Papan cuaca menampilkan jam cerah per hari selama enam bulan.',
          'Perhatikan bulan dengan jam cerah paling sedikit.',
        ],
        soalId: 'q302',
      },
      {
        id: 'o304',
        art: 'warga',
        x: 1500,
        y: 470,
        label: 'Bu Ningsih',
        info: ['"Dusun kami sering berkabut. Apa akibatnya bagi panel surya kami?"'],
        soalId: 'q303',
        bukaMusuh: 'm302',
      },
      {
        id: 'o305',
        art: 'ventil',
        x: 1960,
        y: 470,
        label: 'Uap Panas Puncak Asri',
        info: [
          'Uap panas keluar dari tanah di kaki gunung. Di sekitarnya ada hutan lindung.',
          'Tentukan sumber energi beserta alasannya.',
        ],
        soalId: 'q304',
      },
      {
        id: 'o306',
        art: 'turbin',
        x: 2420,
        y: 470,
        label: 'Pompa Air Sawah',
        info: [
          'Pompa air dipakai pagi dan siang. Kebutuhan dusun tercatat di papan ini.',
          'Cocokkan waktu pemakaian dengan sumber energinya.',
        ],
        soalId: 'q305',
      },
      {
        id: 'o307',
        art: 'turbin',
        x: 2900,
        y: 470,
        label: 'Bukit Angin',
        info: ['Turbin angin mengubah gerakan angin menjadi listrik.'],
        soalId: 'q306',
        bonusGP: 40,
      },
    ],
    musuh: [
      { id: 'm301', jenis: 'waste', x: 900, y: 430, min: 800, max: 1000, hp: 3, perisaiSoal: 'q301' },
      { id: 'm302', jenis: 'pollution', x: 1800, y: 430, min: 1700, max: 1900, hp: 3, perisaiSoal: 'q303' },
      { id: 'm303', jenis: 'drone', x: 2650, y: 300, min: 2540, max: 2780, hp: 2 },
    ],
    gerbang: { x: 3230, y: 470 },
  },
  {
    id: 4,
    nama: 'Misi Perubahan Iklim',
    tagline: 'Misi 04 · Dampak & hemat energi',
    latar:
      'Kawasan industri Cerah berkabut asap. Suhu siang meningkat dan warga mengeluh udara pengap. Temukan sumber pemborosan energinya.',
    tujuan: [
      'Menghubungkan penggunaan energi fosil dengan emisi',
      'Menjelaskan hubungan aktivitas manusia dengan perubahan iklim',
      'Mengidentifikasi tindakan hemat energi',
      'Menganalisis tabel dan studi kasus',
    ],
    bg: 'images/bg-iklim.jpg',
    tema: 'iklim',
    lebar: 3400,
    targetBenar: 3,
    targetKartu: 5,
    mampu: 'Hydro Power',
    intro: [
      'Asap cerobong dan kendaraan menutupi langit. Suhu terasa lebih panas dari biasanya.',
      'Bandingkan catatan bulan ke-1 dan bulan ke-2 untuk menemukan pemborosan energi.',
      'Perubahan iklim adalah masalah besar. Tidak ada satu tindakan pun yang mampu menyelesaikannya sendirian.',
    ],
    platform: [
      { x: 420, y: 385, w: 170 },
      { x: 800, y: 330, w: 160 },
      { x: 1240, y: 385, w: 180 },
      { x: 1680, y: 330, w: 170 },
      { x: 2140, y: 385, w: 200 },
      { x: 2600, y: 320, w: 170 },
    ],
    kartu: [
      { x: 470, y: 335 },
      { x: 850, y: 280 },
      { x: 1300, y: 335 },
      { x: 1740, y: 280 },
      { x: 2200, y: 335 },
      { x: 2660, y: 270 },
    ],
    objek: [
      {
        id: 'o401',
        art: 'papan',
        x: 170,
        y: 470,
        label: 'Papan Misi',
        info: ['MISI 04 — Temukan sumber pemborosan energi dan turunkan kabut asap.'],
      },
      {
        id: 'o402',
        art: 'cerobong',
        x: 620,
        y: 470,
        label: 'Cerobong dan Asap Kendaraan',
        info: [
          'Asap dari pembakaran bahan bakar fosil mengandung gas yang dilepas ke udara.',
          'Gas ini menahan panas di atmosfer.',
        ],
        soalId: 'q401',
        bukaMusuh: 'm401',
      },
      {
        id: 'o403',
        art: 'mesin',
        x: 1080,
        y: 470,
        label: 'Catatan Listrik Keluarga Budi',
        info: ['Bandingkan dua bulan catatan pemakaian listrik.'],
        soalId: 'q402',
      },
      {
        id: 'o404',
        art: 'warga',
        x: 1540,
        y: 470,
        label: 'Ibu Ratna',
        info: [
          '"Tolong usulkan tindakan untuk lingkungan kami, lalu jelaskan bagaimana energi alternatif dapat membantu."',
        ],
        soalId: 'q403',
        bukaMusuh: 'm402',
      },
      {
        id: 'o405',
        art: 'perangkat',
        x: 2000,
        y: 470,
        label: 'Rumah Hemat Energi',
        info: ['Rumah contoh ini memakai cahaya siang dan mematikan perangkat yang tidak terpakai.'],
        soalId: 'q404',
      },
      {
        id: 'o406',
        art: 'cerobong',
        x: 2560,
        y: 470,
        label: 'Pabrik Generator Diesel',
        info: ['Generator bekerja siang dan malam. Tagihan bahan bakar naik dua kali lipat.'],
        soalId: 'q405',
        bonusGP: 40,
      },
    ],
    musuh: [
      { id: 'm401', jenis: 'fossil', x: 900, y: 430, min: 800, max: 1020, hp: 3, perisaiSoal: 'q401' },
      { id: 'm402', jenis: 'waste', x: 1820, y: 430, min: 1720, max: 1940, hp: 3, perisaiSoal: 'q403' },
      { id: 'm403', jenis: 'drone', x: 2750, y: 300, min: 2640, max: 2880, hp: 2 },
    ],
    gerbang: { x: 3230, y: 470 },
  },
  {
    id: 5,
    nama: 'Penjaga Masa Depan',
    tagline: 'Misi 05 · Uji pemahaman akhir',
    latar:
      'Climate Chaos mengacaukan cuaca kota. Kumpulkan bukti dari data, susun strategi energi, lalu kembalikan keseimbangan.',
    tujuan: [
      'Mengintegrasikan seluruh konsep energi',
      'Menganalisis stimulus tabel dan grafik',
      'Memilih solusi berdasarkan bukti dan menjelaskan alasan',
      'Menghubungkan penggunaan energi dengan masa depan lingkungan',
    ],
    bg: 'images/bg-masadepan.jpg',
    tema: 'masadepan',
    lebar: 3600,
    targetBenar: 5,
    targetKartu: 6,
    mampu: 'Future Guard (gabungan Solar + Wind + Hydro)',
    intro: [
      'Inilah misi akhir. Climate Chaos menjaga menara masa depan.',
      'Kumpulkan seluruh bukti data, lalu susun strategi energi untuk Kota Arunika.',
      'Climate Chaos hanya melemah setiap kali kamu menjawab misi pengetahuan dengan benar. Pemahamanmu yang menentukan, bukan kecepatanmu.',
    ],
    platform: [
      { x: 400, y: 385, w: 180 },
      { x: 800, y: 320, w: 170 },
      { x: 1240, y: 385, w: 180 },
      { x: 1680, y: 310, w: 170 },
      { x: 2120, y: 385, w: 190 },
      { x: 2580, y: 320, w: 170 },
      { x: 3020, y: 385, w: 180 },
    ],
    kartu: [
      { x: 450, y: 335 },
      { x: 850, y: 270 },
      { x: 1300, y: 335 },
      { x: 1740, y: 260 },
      { x: 2180, y: 335 },
      { x: 2640, y: 270 },
      { x: 3080, y: 335 },
      { x: 1500, y: 200 },
    ],
    objek: [
      {
        id: 'o501',
        art: 'papan',
        x: 170,
        y: 470,
        label: 'Papan Misi',
        info: ['MISI 05 — Susun strategi energi berdasarkan bukti.'],
      },
      {
        id: 'o502',
        art: 'mesin',
        x: 620,
        y: 470,
        label: 'Meja Data Kota Arunika',
        info: ['Data lima aspek kota: matahari, sungai, angin, kebutuhan listrik, dan udara.'],
        soalId: 'q501',
        bukaMusuh: 'm501',
      },
      {
        id: 'o503',
        art: 'mesin',
        x: 1080,
        y: 470,
        label: 'Grafik Hari Berkabut Asap',
        info: ['Grafik menunjukkan jumlah hari berkabut asap setiap bulan.'],
        soalId: 'q502',
      },
      {
        id: 'o504',
        art: 'warga',
        x: 1560,
        y: 470,
        label: 'Wali Kota Arunika',
        info: ['"Apakah menghemat energi sama pentingnya dengan mencari energi alternatif? Jelaskan."'],
        soalId: 'q503',
        bukaMusuh: 'm502',
      },
      {
        id: 'o505',
        art: 'perangkat',
        x: 2020,
        y: 470,
        label: 'Rencana Aksi Rumah',
        info: ['Tiga tindakan sederhana dari setiap warga akan menjadi kekuatan besar.'],
        soalId: 'q504',
      },
      {
        id: 'o506',
        art: 'panelSurya',
        x: 2500,
        y: 470,
        label: 'Menara Masa Depan',
        info: ['Menara ini menampilkan gambaran kota masa depan yang bersih dan terang.'],
        soalId: 'q505',
        bonusGP: 50,
      },
    ],
    musuh: [
      { id: 'm501', jenis: 'pollution', x: 900, y: 430, min: 800, max: 1020, hp: 3, perisaiSoal: 'q501' },
      { id: 'm502', jenis: 'fossil', x: 1900, y: 430, min: 1800, max: 2000, hp: 3, perisaiSoal: 'q503' },
      { id: 'm503', jenis: 'boss', x: 2950, y: 380, min: 2800, max: 3200, hp: 6, perluBenar: 5 },
    ],
    gerbang: { x: 3430, y: 470 },
  },
];

/* -------------------------------------------------------------------------- */
/*                        KOLEKSI PENGETAHUAN & PENCAPAIAN                     */
/* -------------------------------------------------------------------------- */

export const KOLEKSI = [
  {
    judul: 'Energi fosil',
    isi:
      'Berasal dari sisa makhluk hidup purba yang tertimbun jutaan tahun. Contohnya batu bara, minyak bumi, dan gas alam. Persediaannya terbatas sehingga disebut tak terbarukan.',
  },
  {
    judul: 'Energi tak terbarukan',
    isi:
      'Sumber energi yang persediaannya terbatas dan tidak dapat dibuat kembali dalam waktu singkat. Contohnya batu bara, minyak bumi, dan gas alam.',
  },
  {
    judul: 'Energi terbarukan',
    isi:
      'Sumber energi yang terus tersedia di alam. Contohnya sinar matahari, angin, air mengalir, dan panas bumi.',
  },
  {
    judul: 'Energi alternatif',
    isi:
      'Sumber energi yang digunakan sebagai pengganti bahan bakar fosil. Contohnya panel surya, turbin angin, pembangkit listrik tenaga air, dan panas bumi. Setiap teknologi memiliki kelebihan dan keterbatasan.',
  },
  {
    judul: 'Penggunaan energi sehari-hari',
    isi:
      'Lampu, kipas, televisi, komputer, kompor, kendaraan, dan pompa air semuanya memerlukan energi. Menggunakan energi sesuai kebutuhan disebut penggunaan energi secara bijak.',
  },
  {
    judul: 'Dampak energi fosil & perubahan iklim',
    isi:
      'Pembakaran bahan bakar fosil melepaskan gas ke udara yang dapat memerangkap panas. Akibatnya suhu bumi cenderung meningkat dan cuaca berubah. Perubahan iklim dipengaruhi banyak faktor dan penanganannya memerlukan banyak usaha bersama.',
  },
  {
    judul: 'Hemat energi & pemilihan sumber energi',
    isi:
      'Hemat energi berarti memakai energi seperlunya dan memanfaatkan energi yang sudah tersedia. Pemilihan sumber energi perlu disesuaikan dengan kondisi cuaca, lokasi, dan kebutuhan masyarakat setempat.',
  },
] as const;

export const BADGES = [
  { id: 'penjelajah', nama: 'Penjelajah Kota', ket: 'Menyelesaikan Level 1' },
  { id: 'klasifikasi', nama: 'Ahli Klasifikasi', ket: 'Menyelesaikan Level 2' },
  { id: 'perancang', nama: 'Perancang Energi', ket: 'Menyelesaikan Level 3' },
  { id: 'penjagaIklim', nama: 'Sahabat Iklim', ket: 'Menyelesaikan Level 4' },
  { id: 'masaDepan', nama: 'Penjaga Masa Depan', ket: 'Menyelesaikan Level 5' },
  { id: 'kolektor', nama: 'Kolektor Kartu', ket: 'Mengumpulkan 30 kartu energi' },
  { id: 'tegas', nama: 'Analisis Tajam', ket: 'Menjawab benar 10 soal tanpa salah' },
  { id: 'pantang', nama: 'Pantang Menyerah', ket: 'Memperbaiki jawaban melalui retry sebanyak 5 kali' },
] as const;

export const CATATAN_KONTEN =
  'Konten soal dan penjelasan dalam prototipe ini adalah PLACEHOLDER yang disusun dari konsep sains umum tingkat SD dan BELUM diverifikasi terhadap buku IPAS Kelas VI tertentu. Tidak ada kutipan buku, nomor halaman, CP, TP, atau indikator resmi yang diklaim. Guru perlu memeriksa dan menyesuaikan isi soal melalui Mode Guru sebelum digunakan untuk penilaian.';
