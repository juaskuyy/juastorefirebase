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
