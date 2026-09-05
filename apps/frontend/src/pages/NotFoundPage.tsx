import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Halaman Tidak Ditemukan - SIGAP");

  return (
    <main className="not-found-page">
      <Card className="not-found-card">
        <img
          src="/assets/image/lambang-kabupaten-pangandaran.webp"
          alt="Lambang Kabupaten Pangandaran"
          className="w-16 h-16 object-contain mb-3"
        />
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang dibuka tidak tersedia pada dashboard SIGAP.</p>
        <Link className="button button--primary" to="/">
          Kembali ke dashboard
        </Link>
      </Card>
    </main>
  );
}
