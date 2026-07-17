import { Sparkles } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { AiSummary } from "../../../types/dashboard";

type AISummaryCardProps = {
  summary: AiSummary | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const AISummaryCard = ({ summary, isLoading = false, isError = false }: AISummaryCardProps) => {
  if (isLoading) return <CardSkeleton />;

  return (
    <Card className="ai-card" title="Ringkasan SIGAP AI" icon={<Sparkles size={22} />}>
      {isError ? (
        <StateMessage
          type="error"
          title="Ringkasan AI gagal dimuat"
          message="Data resmi tetap ditampilkan pada kartu cuaca, gempa, dan tsunami."
        />
      ) : summary?.summary ? (
        <p>{summary.summary}</p>
      ) : (
        <StateMessage
          title="Ringkasan belum tersedia"
          message="Data resmi tetap ditampilkan pada kartu cuaca, gempa, dan tsunami."
        />
      )}
    </Card>
  );
};
