/**
 * Dimuat sebelum setiap berkas tes. Mengarahkan koneksi database ke alamat yang tidak
 * dapat dijangkau, sehingga kode yang lolos dari mock tidak pernah menyentuh database
 * sungguhan dari `.env`. `dotenv` tidak menimpa variabel yang sudah terisi.
 */
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/sigap_test";
process.env.DIRECT_URL = "postgresql://test:test@127.0.0.1:1/sigap_test";
