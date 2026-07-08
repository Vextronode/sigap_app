Dokumen ini menjelaskan standar penggunaan environment variable, secrets, dan local development untuk seluruh project di dalam organisasi.

---

# 🎯 Tujuan

Environment Standardization bertujuan untuk:

- Menjaga konsistensi konfigurasi antar developer.
- Menghindari commit data sensitif ke repository.
- Mempermudah proses setup project.
- Menyiapkan fondasi untuk CI/CD di masa mendatang.

---

# 📁 Environment Variables

Setiap project **wajib** menggunakan file environment.

Contoh:

```text
.env
.env.example
```

## Aturan

- `.env` digunakan untuk konfigurasi lokal developer.
- `.env.example` digunakan sebagai template konfigurasi.
- `.env` **tidak boleh** di-commit ke repository.
- `.env.example` **boleh** di-commit.
- Setiap environment variable baru harus ditambahkan ke `.env.example`.

> Karena setiap project memiliki tech stack yang berbeda, isi `.env.example` akan disesuaikan oleh masing-masing tim project setelah struktur aplikasi selesai ditentukan.

---

# 🔐 Secrets Management

Data sensitif **tidak boleh** disimpan di repository.

Contoh data sensitif:

- Password Database
- API Key
- Secret Key
- JWT Secret
- OAuth Secret
- Private Key
- Access Token
- dll.

## Aturan

- Jangan pernah commit file `.env`.
- Jangan menuliskan credential di source code.
- Jangan mengirim credential melalui Pull Request.
- Jangan menyimpan secret pada dokumentasi repository.

Untuk deployment dan CI/CD nantinya, seluruh credential production akan disimpan menggunakan **GitHub Secrets**.

---

# 💻 Local Development

Seluruh developer diharapkan menggunakan environment lokal masing-masing.

Langkah umum setup project:

1. Clone repository.
2. Ikuti dokumentasi instalasi project.
3. Salin `.env.example` menjadi `.env`.
4. Isi environment variable sesuai kebutuhan lokal.
5. Install dependency.
6. Jalankan project.

Karena setiap project memiliki stack yang berbeda, detail instalasi akan dijelaskan pada README masing-masing repository.

---

# 🌿 Environment

Secara umum project dapat menggunakan beberapa environment.

| Environment | Keterangan |
| ------------ | ---------- |
| Development | Digunakan developer saat proses development. |
| Testing | Digunakan untuk proses testing. |
| Production | Digunakan pada aplikasi yang sudah dirilis. |

Konfigurasi setiap environment dapat berbeda sesuai kebutuhan project.

---

# 📦 Versioning Environment

Apabila terdapat environment variable baru:

1. Tambahkan ke `.env.example`.
2. Dokumentasikan pada README atau dokumentasi project.
3. Informasikan perubahan kepada seluruh developer.

---

# 🚫 Larangan

Hal-hal berikut **tidak diperbolehkan**:

- Commit file `.env`.
- Commit credential database.
- Commit API Key.
- Commit access token.
- Commit private key.
- Menyimpan credential di source code.
- Membagikan credential melalui repository.

---

# 📌 Catatan

Dokumen ini merupakan standar umum organisasi.

Implementasi environment variable pada masing-masing project akan mengikuti kebutuhan teknologi yang digunakan oleh project tersebut.