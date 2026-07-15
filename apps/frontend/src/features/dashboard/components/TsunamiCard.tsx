import { Waves } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { TsunamiStatus } from "../../../types/dashboard";
import { formatDateTime } from "../../../utils/date";

type TsunamiCardProps = {
  tsunami: TsunamiStatus | null;
};

export const TsunamiCard = ({ tsunami }: TsunamiCardProps) => (
  <Card
    className="tsunami-card"
    title="Status Tsunami"
    icon={<Waves size={22} />}
    action={tsunami ? <Badge tone={tsunami.status === "NORMAL" ? "safe" : "danger"}>{tsunami.status}</Badge> : undefined}
  >
    {tsunami ? (
      <>
        <div className="tsunami-visual">
          <Waves size={52} aria-hidden="true" />
        </div>
        <h3>{tsunami.warningLevel === "None" ? "Ketinggian Air Normal" : tsunami.warningLevel}</h3>
        <p>{tsunami.source}</p>
        <div className="two-column-metric tsunami-metric">
          <div>
            <strong>{tsunami.waveHeight !== undefined ? `${tsunami.waveHeight} m` : "Belum tersedia"}</strong>
            <span>Saat ini</span>
          </div>
          <div>
            <strong>{tsunami.safeLimit !== undefined ? `${tsunami.safeLimit} m` : "Belum tersedia"}</strong>
            <span>Batas aman</span>
          </div>
        </div>
        <small className="muted">Pembaruan: {formatDateTime(tsunami.updatedAt)}</small>
      </>
    ) : (
      <StateMessage title="Status tsunami belum tersedia" message="Informasi resmi InaTEWS belum berhasil dimuat." />
    )}
  </Card>
);
