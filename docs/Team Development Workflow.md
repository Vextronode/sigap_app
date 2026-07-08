Dokumen ini menjelaskan alur kerja pengembangan yang digunakan oleh seluruh anggota tim selama proses development.

---

# 🎯 Tujuan

Workflow ini dibuat untuk:

- Menjaga proses development tetap terstruktur.
- Mengurangi konflik antar developer.
- Mempermudah proses code review.
- Memastikan kualitas kode sebelum masuk ke branch utama.
- Menyiapkan fondasi untuk CI/CD dan deployment.

---

# 📋 Alur Development

```text
Task
  │
  ▼
Update Branch dev
  │
  ▼
Buat Branch Baru
  │
  ▼
Development
  │
  ▼
Commit & Push
  │
  ▼
Pull Request
  │
  ▼
Code Review
  │
  ▼
Merge ke dev
  │
  ▼
Testing
  │
  ▼
Release PR
(dev → main)
  │
  ▼
Production
```

---

# 👨‍💻 Developer Workflow

Setiap developer wajib mengikuti alur berikut:

### 1. Ambil Task

Developer mengambil task yang telah ditentukan pada sprint.

---

### 2. Sinkronisasi Branch Development

Pastikan branch `dev` sudah menggunakan perubahan terbaru sebelum mulai bekerja.

---

### 3. Buat Branch Baru

Setiap task harus dikerjakan pada branch terpisah.

Contoh:

- feature/login
- feature/payment
- fix/navbar
- docs/readme

---

### 4. Development

Kerjakan task sesuai requirement.

Developer bertanggung jawab memastikan:

- Code berjalan dengan baik.
- Tidak merusak fitur lain.
- Mengikuti coding convention tim.

---

### 5. Push Perubahan

Push branch yang dikerjakan ke repository.

Jangan melakukan push langsung ke branch `dev` maupun `main`.

---

### 6. Pull Request

Setelah task selesai:

- Buat Pull Request menuju branch `dev`.
- Lengkapi deskripsi Pull Request.
- Hubungkan dengan Issue apabila ada.

---

### 7. Code Review

Pull Request akan direview oleh reviewer.

Reviewer dapat:

- Approve
- Request Changes
- Memberikan komentar

Developer wajib menyelesaikan seluruh revisi sebelum merge.

---

### 8. Merge ke dev

Setelah mendapatkan approval, Pull Request dapat di-merge ke branch `dev`.

Branch feature yang telah selesai dapat dihapus.

---

# 🚀 Release Workflow

Setelah seluruh task pada sprint selesai:

- Branch `dev` diuji kembali.
- Dilakukan pengecekan akhir.
- Dibuat Pull Request dari `dev` menuju `main`.
- Setelah disetujui, perubahan di-merge ke `main`.

Branch `main` dianggap sebagai branch production/stable.

---

# 📌 Aturan Tim

Seluruh anggota tim wajib mengikuti aturan berikut:

- Jangan commit langsung ke `main`.
- Jangan commit langsung ke `dev`.
- Setiap task menggunakan branch baru.
- Semua perubahan harus melalui Pull Request.
- Pull Request wajib melalui proses review.
- Branch yang sudah selesai harus dihapus setelah merge.
- Jangan melakukan force push tanpa koordinasi dengan tim.
- Jangan menggunakan **Update Branch** pada Pull Request `dev → main`, kecuali telah disepakati oleh tim.

---

# 📣 Code Review

Reviewer bertanggung jawab memastikan:

- Tidak ada bug yang terlihat.
- Code sesuai standar tim.
- Naming konsisten.
- Tidak ada konflik merge.
- Perubahan sesuai dengan requirement.

---

# 📦 Release

Sebelum merge ke `main`, pastikan:

- Seluruh fitur sprint telah selesai.
- Tidak ada conflict.
- Build berjalan dengan baik.
- Testing telah dilakukan.

---

# 🤝 Kolaborasi Tim

Jika terjadi konflik atau kendala:

- Diskusikan melalui WhatsApp.
- Hindari force push tanpa persetujuan.
- Laporkan blocker kepada Project Lead.

---

# 📈 Tujuan Workflow

Dengan workflow ini diharapkan:

- Proses development lebih terstruktur.
- Histori Git tetap bersih.
- Code review menjadi lebih mudah.
- Konflik antar developer dapat diminimalisir.
- Repository siap untuk implementasi CI/CD pada tahap berikutnya.