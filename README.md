# JuaStore Admin V3 — Auto ID & Pencarian Customer

Fitur:
- ID Order otomatis: `JS + YYMMDD + 4 digit urutan`, contoh `JS2607220001`.
- Nomor urut aman menggunakan Firestore Transaction.
- Admin CRUD data order.
- Dashboard statistik.
- Customer mencari berdasarkan ID Order atau nomor WhatsApp.
- Status garansi otomatis.
- Tombol ajukan garansi ke WhatsApp.
- Tidak menggunakan Firebase Storage.

## Cara pasang
1. Buka `firebase-config.js`.
2. Salin konfigurasi Firebase dari file lama milikmu atau Firebase Console.
3. Di Firestore → Rules, ganti rules lama dengan isi `firestore.rules`, lalu Publish.
4. Upload semua file ke root repository GitHub Pages.
5. Admin: `/admin.html`
6. Customer: `/index.html`

## Penting
Data lama yang dibuat sebelum versi ini belum memiliki salinan pada `publicOrders` dan `customerLookups`.
Buka data lama melalui admin lalu tekan Edit → Simpan Perubahan agar data tersebut dapat dicari oleh customer.


## Update V4 — Form Kendala Sebelum Ajukan Garansi
- Customer wajib menulis kendala terlebih dahulu.
- Tombol Ajukan Garansi baru membuka WhatsApp jika kendala sudah diisi.
- Pesan WhatsApp otomatis berisi data order dan kendala customer.
- Screenshot belum di-upload ke Firebase Storage.
- Customer mengirim screenshot secara manual setelah pesan WhatsApp terkirim.
- Cocok untuk Firebase Spark / tanpa Blaze.

## Update V5 — Auto Copy & Kirim WhatsApp
- Kode garansi otomatis dengan format `JS-GR-XXXXXXX`.
- Kolom email/username, password, PIN/profil, dan detail tambahan produk.
- Tombol **Salin Detail** untuk menyalin detail akun siap kirim.
- Tombol **Salin Garansi** untuk menyalin ID Order, kode garansi, dan masa garansi.
- Tombol **Kirim WA** langsung membuka WhatsApp customer dengan detail produk.
- Data sensitif akun hanya disimpan di koleksi `orders` yang membutuhkan login admin.
- Data sensitif tidak disalin ke `publicOrders` atau `customerLookups`.
- Tetap dapat digunakan tanpa Firebase Blaze dan tanpa Firebase Storage.


## Update V6 — Klaim Hanya dengan Kode Garansi
- Kode garansi `JS-GR-XXXXXXX` menjadi satu-satunya akses untuk tombol klaim garansi.
- ID Order hanya menampilkan detail pesanan dan tanggal order, tanpa tombol klaim.
- Pencarian nomor WhatsApp juga hanya menampilkan detail pesanan, tanpa tombol klaim.
- Koleksi baru: `warrantyLookups`.
- Publish ulang isi `firestore.rules`.
- Untuk data lama, buka melalui admin lalu Edit → Simpan Perubahan agar kode garansi masuk ke `warrantyLookups`.
