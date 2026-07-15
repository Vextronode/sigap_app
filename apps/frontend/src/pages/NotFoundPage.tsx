import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Halaman Tidak Ditemukan - SIGAP");

  return (
    <main className="not-found-page">
      <Card className="not-found-card">
        <span className="brand-mark">S</span>
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang dibuka tidak tersedia pada dashboard SIGAP.</p>
        <Link className="button button--primary" to="/">
          Kembali ke dashboard
        </Link>
      </Card>
    </main>
  );
}
