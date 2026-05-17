# RuanganUMUM

Dokumentasi teknis singkat aplikasi manajemen peminjaman ruangan BPKAD/PEMKOT.

## Arsitektur Singkat

- `frontend/`: React + TypeScript + Vite + TailwindCSS.
- `backend/`: Node.js + Express + MySQL (`mysql2/promise`).
- Komunikasi data: frontend memanggil REST API backend (`http://localhost:5000/api/...`).
- Penyimpanan: tabel utama agenda adalah `agenda_ruangan`, autentikasi memakai tabel `users`.

## Struktur Folder Inti

```txt
RuanganUMUM/
|- backend/
|  |- src/
|  |  |- config/db.js
|  |  |- controller/
|  |  |  |- authController.js
|  |  |  |- agendaController.js
|  |  |- routes/
|  |  |  |- authRoutes.js
|  |  |  |- agendaRoutes.js
|  |  |- index.js
|- frontend/
|  |- src/
|  |  |- App.tsx
|  |  |- pages/
|  |  |- components/
```

## Alur Aplikasi

1. User login dari halaman `/`.
2. Frontend kirim request ke `POST /api/auth/login`.
3. Jika sukses, data user disimpan di `localStorage`, lalu pindah ke halaman layanan/dashboard.
4. Fitur peminjaman:
- Isi form di `/peminjaman`.
- Konfirmasi di `/konfirmasipeminjaman`.
- Simpan ke backend (`POST /api/agendas`) atau update (`PUT /api/agendas/:id`).
5. Dashboard membaca daftar agenda dari `GET /api/agendas` dan bisa ubah status via `PUT /api/agendas/:id/status`.
6. Halaman preview (`/preview-horizontal` dan `/preview-vertikal`) auto-refresh data setiap 30 detik.

## API Endpoint

Base URL: `http://localhost:5000`

### Health Check

- `GET /`
- Response: text `API Agenda Ruangan is running...`

### Auth

- `POST /api/auth/login`
- Body JSON:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

- Success (`200`):

```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "Administrator"
  }
}
```

- Error:
- `401` username/password salah
- `500` internal server error

### Agenda

- `GET /api/agendas`
- Ambil semua data agenda (urut `id ASC`).

- `POST /api/agendas`
- Buat agenda baru.
- Body JSON:

```json
{
  "jenisRuangan": "bpkad",
  "ruangan": "Ruang Rapat Mahakam (Lt 4)",
  "tanggal": "Senin, 18 Mei 2026",
  "waktuMulai": "09:00",
  "waktuSelesai": "11:00",
  "namaAcara": "Rapat Koordinasi",
  "pelaksana": "Bagian Keuangan",
  "dihadiri": "Walikota Samarinda"
}
```

- Success (`201`):

```json
{
  "message": "Agenda created successfully",
  "id": 123
}
```

- `PUT /api/agendas/:id`
- Update detail agenda berdasarkan `id`.
- Body sama seperti `POST /api/agendas`.
- Success (`200`): `{"message":"Agenda updated successfully"}`
- Error:
- `404` agenda tidak ditemukan
- `500` internal server error

- `PUT /api/agendas/:id/status`
- Update status agenda.
- Body JSON:

```json
{
  "status": "Berlangsung"
}
```

- Catatan penting:
- Jika `status = "Selesai"`, backend melakukan delete data agenda (`DELETE` by id).
- Jika status selain itu, backend hanya update kolom `status`.

- Success (`200`):
- `{"message":"Status updated successfully"}` atau
- `{"message":"Agenda deleted successfully"}`

## Menjalankan Project (Local)

## 1) Backend

```bash
cd backend
npm install
npm run dev
```

Server aktif di `http://localhost:5000`.

Konfigurasi DB via environment variable:

- `DB_HOST` (default: `localhost`)
- `DB_USER` (default: `root`)
- `DB_PASSWORD` (default: kosong)
- `DB_NAME` (default: `bpkadumum`)
- `PORT` (default: `5000`)

## 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend Vite biasanya aktif di `http://localhost:5173`.

## Catatan Teknis

- URL API di frontend saat ini masih hardcoded ke `http://localhost:5000`.
- Belum ada JWT/session middleware; login masih berbasis validasi langsung tabel `users`.
- Data yang diberi status `Selesai` tidak tersimpan sebagai arsip, tetapi dihapus dari tabel `agenda_ruangan`.

## Tutorial Hosting di Hostinger

Bagian ini menjelaskan deployment dengan skenario yang paling mudah:

- Backend: Hostinger Node.js Web App
- Database: MySQL Hostinger
- Frontend: tetap di Hostinger (opsional) atau Vercel (lebih simpel untuk Vite)

### A. Prasyarat

1. Pastikan plan Hostinger mendukung Node.js Web App (Business/Cloud).
2. Project sudah ada di GitHub.
3. Domain/subdomain sudah diarahkan ke Hostinger (jika ingin pakai domain sendiri).

### B. Deploy Backend ke Hostinger (Node.js Web App)

1. Masuk ke hPanel Hostinger.
2. Buat website/app baru tipe Node.js Web App.
3. Pilih deploy dari GitHub repository.
4. Set root aplikasi ke folder `backend`.
5. Set perintah build/start:
- Install: `npm install`
- Start: `npm start` (menjalankan `node src/index.js`)
6. Pilih versi Node.js yang kompatibel (disarankan `20.x` atau `22.x`).
7. Tambahkan environment variables di panel:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `PORT` (jika diperlukan oleh platform)
8. Redeploy aplikasi dari panel.
9. Uji endpoint health check:
- `GET https://<domain-backend>/`

Jika respons `API Agenda Ruangan is running...`, backend sudah aktif.

### C. Siapkan Database MySQL di Hostinger

1. Buat database MySQL di hPanel.
2. Catat host, user, password, database name, dan port.
3. Import struktur/tabel minimal:
- `users`
- `agenda_ruangan`
4. Masukkan nilai tersebut ke env backend (`DB_*`) lalu redeploy backend.

### D. Deploy Frontend

Sebelum deploy frontend, ubah semua pemanggilan API yang masih hardcoded `http://localhost:5000` menjadi base URL dari environment variable:

`VITE_API_BASE_URL=https://<domain-backend>`

Contoh penggunaan:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
fetch(`${API_BASE_URL}/api/agendas`);
```

Langkah deploy frontend:

1. Deploy frontend (di Hostinger Node.js Web App atau platform static hosting).
2. Jika di Hostinger, set root ke folder `frontend`.
3. Build command: `npm run build`.
4. Publish hasil build (`dist`).
5. Tambahkan env frontend:
- `VITE_API_BASE_URL=https://<domain-backend>`
6. Redeploy frontend.

### E. Konfigurasi CORS Backend

Agar frontend production bisa mengakses backend, atur CORS di `backend/src/index.js` untuk origin domain frontend.

Contoh:

```js
app.use(cors({
  origin: ['https://<domain-frontend>']
}));
```

Setelah mengubah CORS, redeploy backend.

### F. Checklist Go-Live

1. Login berhasil dari domain production.
2. Bisa membuat peminjaman baru.
3. Bisa update status agenda.
4. Halaman preview horizontal/vertikal menampilkan data.
5. Tidak ada error CORS di browser console.

### Catatan

Pilih VPS jika butuh kontrol server penuh (Nginx reverse proxy, PM2, custom SSL/routing, multi-service kompleks, tuning performa mendalam).  
Untuk kebutuhan standar aplikasi ini, Node.js Web App Hosting Hostinger biasanya sudah cukup.
