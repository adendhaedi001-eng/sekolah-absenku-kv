PANDUAN UPLOAD SEKOLAH ABSENKU KE CLOUDFLARE WORKER KV

ISI FOLDER:
- index.html                     = aplikasi web Sekolah Absenku terbaru
- functions/api/state.js         = API penyimpanan data ke Cloudflare Worker KV
- wrangler.toml                  = contoh konfigurasi bila memakai Wrangler/CLI

YANG SUDAH DIPERTAHANKAN DI FILE INI:
- Rekap absen: Harian, Bulanan, dan Custom rentang tanggal
- Rekap nilai: Harian, Bulanan, dan Custom rentang tanggal
- Fitur Pengaduan, AI, dan tombol Keluar tidak ditampilkan

CARA UPLOAD PALING MUDAH LEWAT DASHBOARD CLOUDFLARE PAGES:
1. Buka Cloudflare Dashboard.
2. Masuk ke Workers & Pages.
3. Buat project Pages baru, atau buka project Pages lama Anda.
4. Upload SEMUA ISI folder ini, bukan hanya index.html.
   Pastikan folder functions tetap berada di root project.

5. Buat KV Namespace:
   Workers & Pages > KV > Create namespace.
   Nama contoh: sekolah_absenku_kv

6. Hubungkan KV ke project Pages:
   Project Pages Anda > Settings > Bindings > Add binding > KV namespace.
   Variable name / Binding name wajib isi:
   SEKOLAH_ABSENKU_KV
   Pilih namespace:
   sekolah_absenku_kv

7. Deploy ulang Pages project.

8. Buka website dari domain Cloudflare Pages.
   Login lalu tambah/edit data siswa, absen, atau nilai.
   Jika berhasil, indikator akan berubah menjadi data online tersimpan.

CATATAN PENTING:
- Tidak perlu schema.sql karena Worker KV bukan database tabel seperti D1.
- File HTML sudah otomatis memanggil /api/state.
- functions/api/state.js menyimpan semua data aplikasi sebagai satu JSON dengan key:
  sekolah_absenku_state_v1
- Jika dibuka langsung dari file komputer, data tetap offline/perangkat.
- Agar online, harus dibuka dari domain Cloudflare Pages.
- Jangan ubah nama binding SEKOLAH_ABSENKU_KV kecuali Anda juga mengubah nama binding di functions/api/state.js.

CARA CEK APA SUDAH TERHUBUNG:
- Buka https://domain-anda.pages.dev/api/state
- Jika muncul JSON seperti {"ok":true,...}, API sudah jalan.
- Jika muncul error binding, berarti KV binding belum dipasang atau namanya tidak sama.

CATATAN MULTI USER:
- Worker KV cocok untuk baca data cepat dan aplikasi sederhana.
- Untuk banyak pengguna mengedit bersamaan, sistem ini memakai pola "simpan data terakhir".
  Jadi sebaiknya jangan banyak admin/guru mengedit data yang sama pada detik yang sama.
