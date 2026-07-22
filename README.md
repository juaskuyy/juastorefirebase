# JuaStore Firebase Dashboard

1. Firebase Console → Authentication → Get started.
2. Aktifkan Email/Password.
3. Tambahkan user admin.
4. Firestore Database → Rules.
5. Ganti rules lama dengan isi file `firestore.rules`, lalu Publish.
6. Upload `index.html` dan `admin.html` ke GitHub Pages.

- `admin.html`: dashboard admin.
- `index.html`: halaman cek garansi customer.
- Setiap order otomatis mendapat kode klaim.
- Customer cek dengan kode klaim + 4 digit terakhir nomor WhatsApp.
