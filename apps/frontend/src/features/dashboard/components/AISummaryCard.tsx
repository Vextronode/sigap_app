import { Sparkles } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { AiSummary } from "../../../types/dashboard";

type AISummaryCardProps = {
  summary: AiSummary | null;
};

export const AISummaryCard = ({ summary }: AISummaryCardProps) => (
  <Card className="ai-card" title="Ringkasan SIGAP AI" icon={<Sparkles size={22} />}>
    {summary?.summary ? (
      <p>{summary.summary}</p>
    ) : (
      <StateMessage
        title="Ringkasan belum tersedia"
        message="Data resmi tetap ditampilkan pada kartu cuaca, gempa, dan tsunami."
      />
    )}
  </Card>
);
