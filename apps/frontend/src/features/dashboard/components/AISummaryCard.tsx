import { Sparkles } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { AiSummary } from "../../../types/dashboard";
import { dummyAISummary } from "../data/dummyData";

type AISummaryCardProps = {
  summary: AiSummary | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const AISummaryCard = ({ summary, isLoading = false, isError = false }: AISummaryCardProps) => {
  if (isLoading) return <CardSkeleton />;
  const displaySummary = summary && !isError ? summary : dummyAISummary;

  return (
    <Card
      className="ai-card"
      title="Ringkasan SIGAP AI"
      icon={<Sparkles size={22} />}
      action={<Badge tone="info">Sedang Dalam Pengembangan</Badge>}
    >
      <p className="ai-card__body">{displaySummary.summary}</p>
    </Card>
  );
};
