# Desain ulang situs: satu layar "dashboard"

Tanggal: 2026-11-26
Pemilik: Wahyu Satrio Nugroho
Status: menunggu persetujuan pemilik
Mockup acuan (satu file, bisa dibuka langsung di browser): [assets/dashboard-mockup-v5.html](assets/dashboard-mockup-v5.html)

Mockup adalah acuan tampilan dan perilaku. Kode di dalamnya adalah prototipe, bukan kode produksi. Kalau dokumen ini dan mockup berbeda, tanyakan ke pemilik, jangan menebak.

## 1. Maksud dan alasan

Situs ini adalah alat jualan dan portofolio pemiliknya. Pemilik adalah analis bisnis, operasional, dan supply chain, sekaligus project manager, kadang ikut mengatur strategi. Ia terbuka untuk peran tetap dan freelance. Tulisannya (blog) ikut menjadi bahan jualan.

Yang diminta pemilik:

- Profesional tetapi ramah.
- Bertema chart dan visualisasi data, dengan cerita yang kuat dan eksekusi yang rapi.
- Tidak meniru situs lain, dan mencerminkan pemiliknya.
- Tema tidak boleh diambil dari isi tulisannya dan tidak boleh berpatok pada foto profil. Foto tetap tampil, tetapi bukan jangkar desain.
- Desktop dahulu. Seluruh isi muat dalam satu layar tanpa gulir, seperti satu dashboard.
- Semua slider bergeser otomatis. Klik pada proyek atau tulisan membuka halaman terpisah.

Kekhawatiran utama pemilik: cerita (storytelling) yang menarik tidak boleh mengalihkan pengunjung dari profil, proyek, dan tulisan. Jawaban desainnya: cerita hanya mendapat sepertiga layar bawah, dan tiga kotak lainnya tetap terlihat sepanjang waktu.

## 2. Tujuan, bukan-tujuan, dan hal yang harus dihindari

### Tujuan

1. Dalam beberapa detik pertama, pengunjung tahu siapa pemiliknya, apa keahliannya, dan bagaimana menghubunginya.
2. Pengunjung dapat melihat proyek dan tulisan pilihan tanpa menggulir dan tanpa mengklik apa pun.
3. Cerita "How I work" menunjukkan cara berpikir pemilik (Define, Measure, Analyze, Improve, Control) lewat data yang bergerak, tanpa menyebut nama kerangkanya.
4. Semua yang tampil jujur: yang belum ada diberi label, bukan dikarang.

### Bukan-tujuan

- Versi mobile yang matang (lihat bagian 8: ini tugas berikutnya).
- Mode gelap.
- Dua bahasa. Situs memakai bahasa Inggris bisnis yang mudah dimengerti. Versi Indonesia disimpan sebagai cadangan (bagian 12).
- Halaman kontak baru, formulir, dan mesin pencari internal.
- Daftar tools (Excel, SAP, Python, PostgreSQL, GCP, ArcGIS, Zapier) di layar utama. Ikon-ikonnya sudah ada di `public/images/`. Letaknya diputuskan nanti (halaman proyek atau profil).

### Hal yang harus dihindari (anti-goals)

- Statistik, nama klien, testimoni, atau sertifikasi yang dikarang. Data cerita adalah simulasi dan wajib berlabel "simulated data".
- Klaim "terpopuler" tanpa data kunjungan. Kotak tulisan bernama "Selected writing".
- Tata letak template (hero, kartu fitur, testimoni, FAQ), glow, glassmorphism, gradien biru-ungu, emoji sebagai hiasan.
- Gerakan yang berulang tanpa henti.

## 3. Pendekatan yang dipertimbangkan

Pemilik menyerahkan pilihan teknis kepada saya. Ini pilihan saya, bukan sesuatu yang ia setujui secara eksplisit.

| Pendekatan | Kelebihan | Kekurangan |
|---|---|---|
| **A. Komponen Astro dengan JavaScript biasa (dipilih)** | Cocok dengan tumpukan yang ada. Tidak menambah dependensi. Mockup sudah berupa HTML, CSS, dan JS biasa, jadi sisa pekerjaan hanya memecahnya per komponen dan menghubungkan data. Halaman tetap statis dan cepat. | Skrip cerita (canvas) perlu dipisah dengan rapi agar tidak menjadi satu berkas besar. |
| B. Pulau React atau Svelte untuk kotak cerita | Status dan animasi lebih terstruktur. | Menambah framework dan ukuran halaman untuk satu kotak. Tidak ada kebutuhan nyata yang membenarkannya. |
| C. Statis penuh, tanpa animasi | Paling sederhana dan paling cepat. | Menghilangkan inti cerita dan ciri khas situs. Bertentangan dengan permintaan pemilik. |

Alasan memilih A: mockup yang disetujui sudah berjalan dengan teknik ini, dan hasilnya terukur (tanpa luber di empat ukuran layar, tanpa error konsol).

## 4. Tata letak dan komponen

Satu halaman `/` yang tidak bergulir pada layar desktop. Tinggi `100dvh`, dua baris, tiga kolom di baris atas.

```
+-----------------+-----------------+----------------+
| PROFIL (1.3fr)  | PROYEK (1.15fr) | TULISAN (1fr)  |
| foto, nama,     | slider otomatis | 3 judul pilihan|
| fakta, tautan   | dengan penanda  | gaya RSS       |
+-----------------+-----------------+----------------+
| HOW I WORK (tinggi 34vh)                            |
| teks langkah + tab  |  visualisasi canvas beranimasi|
+-----------------------------------------------------+
```

CSS grid acuan (lihat mockup untuk nilai lengkap):

- `grid-template-columns: minmax(0,1.3fr) minmax(0,1.15fr) minmax(0,1fr)`
- `grid-template-rows: minmax(0,1fr) 34vh`
- Jarak antar kotak `clamp(10px,1vw,16px)`, sudut kotak 10px.

### 4.1 Profil (kiri atas, latar navy)

- Foto potret di kiri (rasio 3:4, sudut 8px), nama di kanannya, dan motif kotak-kotak kecil di atas nama. Foto dipotong dari kepala sampai dada. Alasannya: foto asli (`public/images/me.png`, 768 x 1365, 1,5 MB) punya banyak tembok kosong dan tanda bintang kecil di pojok kanan bawah yang harus tidak tampil.
- Kalimat pembuka: "Business, operations and supply chain analyst. I find the root cause of a problem, then lead the fix as project manager."
- Tiga fakta: Current (Analyst Lead, Evermos), Location (Bandung, open to relocating to Greater Jakarta), Open to (Permanent roles and freelance work).
- Tautan: Email (tombol utama, putih), LinkedIn, GitHub, dan "CV coming soon" (tidak bisa diklik, ditandai `aria-disabled`, bergaris putus-putus). Tautan ke CV dihidupkan hanya setelah berkasnya ada.
- Motif: kotak-kotak tersebar saat diam, dan tersusun rapi saat kotak profil disorot atau mendapat fokus. Ini menggemakan pesan cerita (berantakan menjadi terukur) dalam ukuran kecil.

### 4.2 Proyek (tengah atas)

- Slider otomatis, 6 detik per slide. Setiap slide: label bidang, judul, satu baris keterangan, pratinjau visual, dan teks "Case study coming soon" sampai studi kasus ada.
- Penanda: garis kecil di bawah slide (satu per proyek) yang terisi sebagai hitung mundur. Klik garis untuk berpindah. Penomoran `01 / 03` di kanan atas, dan tautan "All projects" menuju `/projects/`.
- **Tidak ada tombol panah dan tidak ada tombol putar atau jeda** (permintaan pemilik). Navigasi: garis penanda, panah keyboard saat kotak mendapat fokus, dan geser otomatis.
- Jumlah proyek di slider: 4 sampai 5 (batas saran). Dengan 8 proyek layout tetap muat, tetapi satu putaran makan 48 detik dan proyek akhir hampir tidak terlihat. Sisanya hanya di halaman daftar.

### 4.3 Tulisan (kanan atas)

- Judul kotak "Selected writing", tautan "All writing" ke `/blog/`.
- Daftar bernomor 01 sampai 03: judul, lalu "kategori · tanggal · waktu baca" (contoh: "Personal · May 1, 2026 · 3 min read").
- Setiap judul adalah tautan ke halaman artikel.

### 4.4 How I work (bawah, sepertiga layar)

Kolom kiri: judul kotak dengan label "simulated data", angka kunci di kanan atas, tab lima langkah, label peran, judul pertanyaan, dan satu paragraf pendek. Kolom kanan: kanvas visualisasi.

| Tab | Peran (label biru) | Pertanyaan | Isi dan animasi |
|---|---|---|---|
| Define | my role: operations analyst | What does the customer expect? | Pesanan jatuh dari atas. Janji: kirim dalam 4 hari. Pesanan yang melanggar berdenyut sekali. |
| Measure | my role: business analyst | How big is the problem? | Pesanan menumpuk menjadi kolom per hari. Garis batas 4 hari ditarik, area terlambat menyala, label "99 late · 28%". |
| Analyze | my role: supply chain analyst | Where do the delays come from? | Pesanan terlambat terurut per tahap. Baris gudang menyala, angkanya menghitung naik sampai 75, lalu "76% of late orders". Baris lain meredup. |
| Improve | my role: strategist | How much should we fix? | Slider bergerak sendiri dari 0% ke 50%. Kolom merah menyusut, angka turun dari 99 ke 68. Pengunjung bisa menggeser slider sendiri. |
| Control | my role: project manager | How do we make it stick? | Jadwal 6 minggu dengan pemilik tugas. Penanda minggu bergerak. Mulai minggu ke-3, kotak oranye menjadi biru satu per satu ("N of 75 target orders fixed"). |

Aturan perilaku cerita:

- Geser otomatis tiap 9 detik. Berhenti sementara saat kursor atau fokus ada di kotak, dan kemajuannya dilanjutkan, bukan diulang dari nol.
- Panah kiri dan kanan di keyboard berpindah langkah saat fokus ada di kotak.
- Tooltip per kotak pesanan: "Order 42: 6 days, stuck at warehouse".
- Tabel data tersembunyi (hanya untuk pembaca layar) menyertai setiap langkah.
- Semua angka dihitung dari data simulasi yang dibangkitkan dengan generator acak berbenih tetap (356 pesanan, seed 11), jadi hasilnya selalu sama. Angka (28%, 76%, 68) tidak boleh diketik manual di teks.

## 5. Gaya visual

- **Palet (inti 3 warna + 1 aksen):** latar halaman `#EBF0F8`, tinta/navy `#10183F`, biru data `#2E4BD8`, aksen oranye `#D8420B` hanya untuk "terlambat". Kotak putih `#FFFFFF` dengan garis `#DCE3F1`. Warna pendukung: motif `#8FA2FF`, teks sekunder `#4B557F`, garis `#C9D2E6`, area terlambat `#FCE9E2`.
- Biru dan oranye lolos uji pembeda warna (validator palet dataviz) pada permukaan `#E6EFFB`.
- **Huruf:** Schibsted Grotesk (400, 500, 600, 800), angka tabular. Dipilih karena terbaca jelas pada ukuran kecil dan punya karakter di judul tebal. Untuk produksi, muat dari server sendiri, bukan lewat `@import` Google Fonts.
- **Radius:** 10px kotak, 8px tombol, 6px label.
- **Persegi kecil biru** di depan judul kotak meniru "titik data" pada visualisasi. Ini identitas, bukan dekorasi. Kalau terasa dekoratif, boleh dihapus tanpa mengubah tata letak.
- Tidak ada bayangan besar, glow, blur, atau gradien dekoratif.

## 6. Gerak dan aksesibilitas

- Gerak yang ada: kotak muncul berurutan saat halaman dibuka (0,6 detik), slider otomatis, motif profil saat hover, dan animasi cerita per langkah.
- **Mode gerak minimal (`prefers-reduced-motion`):** semua gerak mati, slider tidak berjalan otomatis, dan setiap langkah tampil langsung pada kondisi akhirnya. Karena tombol putar sudah dihapus, pengunjung pada mode ini berpindah dengan garis penanda, tab, atau panah.
- **Risiko yang diketahui (keputusan pemilik):** standar aksesibilitas meminta kontrol jeda untuk gerak yang berjalan lebih dari 5 detik. Pemilik meminta tombol jeda dihapus. Mitigasi yang ada: slider berhenti saat kursor atau fokus ada di kotak, dan mati pada mode gerak minimal. Kalau situs ditinjau untuk kepatuhan, ini harus dibahas ulang.
- Kontras: teks 4,5:1 dan komponen non-teks 3:1 sudah dihitung dan diperbaiki pada mockup. Nilai: judul placeholder `#5F6990`, angka daftar `#6E7DAE` (teks besar), garis tombol `#7A88B3`.
- Setiap kontrol: elemen asli (`button`, `a`), nama aksesibel, `cursor: pointer`, cincin fokus 3px biru (putih pada kotak navy).
- Wilayah `aria-live` pada angka kunci dan paragraf cerita dimatikan selama animasi slider berjalan agar pembaca layar tidak dibanjiri pembaruan, lalu dinyalakan lagi dan diperbarui sekali di akhir.
- Bahasa dokumen `en`.

## 7. Data dan integrasi dengan Astro

Situs saat ini: Astro 4, Tailwind 3, MDX, koleksi konten `projects` dan `blog` (`src/content/config.ts`), diterapkan ke GitHub Pages dengan `peaceiris/actions-gh-pages` pada `site: https://riyooho.github.io`.

| Bagian layar | Sumber data | Catatan |
|---|---|---|
| Profil | Teks tetap di komponen | Foto potongan terkompresi (sekitar 25 KB, 360 x 480), bukan `me.png` 1,5 MB. `width`, `height`, dan `fetchpriority="high"` di HTML. |
| Proyek | Koleksi `projects` | Ambil entri `featured: true`, maksimum 5, urut tetap. Label = `category`, judul = `title`, keterangan = `description`. |
| Tulisan | Koleksi `blog` | Tiga entri. Perlu kolom baru `featured` (opsional, bawaan `false`). Isi dahulu yang `featured`, lalu lengkapi dengan yang terbaru. |
| How I work | Skrip klien + data simulasi di berkas sendiri | Berlabel "simulated data". Diganti data kasus nyata bila pemilik memberikannya. |

Keputusan saya (bisa diubah):

- Skema `projects` saat ini punya `stack`, `metrics`, `repo`, dan `demo`, tetapi tidak punya `year` atau gambar sampul. Tambahkan `cover` (opsional) dan gunakan `description` sebagai baris keterangan. Selama `cover` kosong, tampilkan pratinjau placeholder berlabel "Preview only, real chart coming soon".
- `src/content/projects/draft-analysis.md` berisi lorem ipsum. Jangan ditampilkan: hapus, atau tandai agar tidak ikut `featured`.
- Skema `blog` ditambah `featured`. Tidak ada perubahan lain.
- Tautan CV `/resume_w_satrio_n.pdf` saat ini 404. Ganti dengan keadaan "CV coming soon" sampai berkas ada di `public/`.
- Formspree `YOUR_FORM_ID` dan akun `@yourhandle` di `BaseLayout.astro` masih placeholder. Di luar lingkup layar utama, tetapi harus diselesaikan sebelum halaman kontak dianggap selesai.

## 8. Responsif

Prioritas desktop. Pada lebar di bawah 1024px atau tinggi di bawah 620px, tata letak menumpuk satu kolom dan boleh digulir (sudah ada di mockup sebagai pengaman: profil, proyek 440px, tulisan, cerita dengan kanvas 280px).

Belum dirancang dan belum diuji: tampilan ponsel dan tablet yang sesungguhnya. Itu pekerjaan terpisah sesudah desktop selesai.

Ukuran yang sudah diuji tanpa luber dan tanpa gulir: 1280 x 720, 1366 x 650, 1440 x 860, dan 1920 x 1080, untuk kelima langkah cerita. Pada layar pendek (tinggi di bawah 760px), foto dan nama diperkecil.

## 9. Halaman lain

- `/projects/[slug]` dan `/blog/[slug]`: tetap halaman terpisah. Tampilannya akan diselaraskan dengan gaya baru (palet, huruf, dan kotak putih di atas latar `#EBF0F8`), tanpa kerangka dashboard.
- `/projects/` dan `/blog/`: daftar lengkap. `/projects/` sudah ada dengan filter kategori.
- `/contact/`: dibiarkan seperti sekarang sampai Formspree diatur.
- Navigasi: layar utama tidak punya bilah navigasi dan tidak punya footer, jadi komponen `Navbar.astro`, `Hero.astro`, dan `Footer.astro` yang ada tidak dipakai di beranda. Tautan keluar ada di dalam kotak (Email, LinkedIn, GitHub, All projects, All writing). Halaman lain boleh memakai bilah atas kecil dengan tautan kembali ke beranda (pilihan pembangun, bagian 11).

## 10. Batasan

- Tetap di Astro 4, Tailwind 3, dan deploy GitHub Pages yang sudah ada. Tanpa dependensi baru kecuali benar-benar perlu.
- Tanpa pihak ketiga yang memblokir render (font dari server sendiri, skrip analitik `defer` atau `async`).
- Tag Google Analytics `G-G6Y8ZVDVRS` di `BaseLayout.astro` dipertahankan.
- `node_modules/`, `dist/`, dan `.astro/` diabaikan git (sudah diatur).

## 11. Yang diserahkan kepada pembangun

- Cara memecah mockup menjadi komponen Astro dan berkas skrip.
- Nama kelas dan berkas.
- Cara memadukan gaya mockup dengan Tailwind yang ada (utility, `@apply`, atau CSS komponen), selama hasil visualnya sama.
- Pengaturan gambar (format, ukuran) selama bobot foto di layar utama kecil.
- Detail animasi yang tidak disebut di sini, selama tetap mengikuti bagian 6.

## 12. Bahan yang masih dibutuhkan dari pemilik

Tanpa ini situs berjalan, tetapi sebagian isinya tetap berupa placeholder berlabel:

1. **Satu kasus nyata** untuk menggantikan data simulasi: masalah, apa yang diukur, keputusan, hasil (boleh dianonimkan).
2. **Proyek nyata** (judul, bidang, satu kalimat hasil, gambar atau chart) untuk mengisi slider.
3. **Dua tulisan lain** untuk "Selected writing" (saat ini hanya satu artikel yang ada), dan keputusan: tetap dikurasi manual, atau nanti memakai data kunjungan.
4. **Berkas CV (PDF)**.
5. **Riwayat kerja** (belum tampil di layar utama, dibutuhkan bila dibuat halaman profil lengkap).
6. Apakah ada sertifikasi Lean Six Sigma. Bila ada, sebut di profil. Bila tidak, jangan diklaim.
7. Versi bahasa Indonesia: dibuang atau dipertahankan? Cadangan teks Indonesia ada di folder kerja sementara, bukan di repositori.

## 13. Risiko dan kompromi yang diketahui

- Animasi penuh belum pernah ditonton langsung. Browser uji memakai mode gerak minimal, jadi saya memeriksanya dengan jam simulasi. Kecepatan dan kehalusan baru bisa dinilai di browser biasa.
- Cerita memakai data simulasi. Tanpa kasus nyata, ia menunjukkan cara berpikir, bukan bukti hasil.
- Tanpa tombol jeda (bagian 6).
- Satu layar tanpa gulir berarti isi harus dipangkas. Menambah kotak atau teks akan memaksa pilihan: layar pendek atau isi lebih sedikit.

## 14. Kriteria selesai

Dianggap selesai bila semuanya benar:

1. Beranda tidak menggulir dan tidak meluber pada 1280 x 720, 1366 x 650, 1440 x 860, dan 1920 x 1080, untuk kelima langkah cerita.
2. Tidak ada error di konsol. `npm run build` berhasil, dan deploy GitHub Pages hijau.
3. Teks lolos kontras 4,5:1 dan komponen 3:1 (dihitung, bukan ditebak). Semua kontrol bisa dioperasikan dengan keyboard dan punya cincin fokus.
4. Dengan mode gerak minimal aktif, tidak ada yang bergerak dan semua isi tetap terbaca.
5. Tidak ada angka, nama, atau klaim yang dikarang. Placeholder dan data simulasi berlabel.
6. Tautan Email, LinkedIn, GitHub, All projects, All writing, dan judul artikel menuju tujuan yang benar. Tidak ada tautan mati.
7. Foto di layar utama berukuran kecil, dan tidak ada tanda bintang di pojok.
8. Animasi cerita sudah ditonton di browser biasa oleh pemilik dan disetujui.
