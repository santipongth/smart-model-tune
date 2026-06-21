import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { getTrainingHistory } from "@/lib/trainingHistory";
import type { Project } from "@/types";
import { ArrowUpRight } from "lucide-react";

/**
 * Side-by-side comparison of recent training runs — extends the History tab
 * with the Transformer Lab style "experiments" view. Includes a Promote
 * action that produces a new local Version entry (toast-only in prototype).
 */
export function ExperimentsComparison({ project }: { project: Project }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const runs = getTrainingHistory(project);

  // Deterministic synthetic metrics per run
  const rows = runs.map((r, i) => {
    const seed = (project.id.charCodeAt(0) + i * 13) % 11;
    const finished = r.status === "completed";
    return {
      ...r,
      finalLoss: finished ? (0.18 + seed * 0.01).toFixed(3) : "—",
      accuracy: finished ? 80 + ((seed + i) % 15) : null,
      f1: finished ? 78 + ((seed + i * 2) % 17) : null,
      lr: project.learningRate,
    };
  });

  const handlePromote = (runNumber: number) => {
    toast({
      title: t("experiments.promoted"),
      description: `${t("history.run")} #${runNumber} → ${t("versions.current")}`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t("experiments.title")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 pr-3 font-medium">{t("history.run")}</th>
              <th className="py-2 pr-3 font-medium">{t("experiments.status")}</th>
              <th className="py-2 pr-3 font-medium">{t("experiments.finalLoss")}</th>
              <th className="py-2 pr-3 font-medium">{t("experiments.accuracy")}</th>
              <th className="py-2 pr-3 font-medium">F1</th>
              <th className="py-2 pr-3 font-medium">LR</th>
              <th className="py-2 pr-3 font-medium">{t("history.epochs")}</th>
              <th className="py-2 pr-3 font-medium">{t("history.duration")}</th>
              <th className="py-2 pr-0 font-medium text-right">{t("experiments.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-3 font-medium text-foreground">#{r.runNumber}</td>
                <td className="py-2 pr-3">
                  <Badge variant={r.status === "completed" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-[10px] capitalize">
                    {t(`history.status.${r.status}`)}
                  </Badge>
                </td>
                <td className="py-2 pr-3 tabular-nums">{r.finalLoss}</td>
                <td className="py-2 pr-3 tabular-nums">{r.accuracy != null ? `${r.accuracy}%` : "—"}</td>
                <td className="py-2 pr-3 tabular-nums">{r.f1 != null ? `${r.f1}%` : "—"}</td>
                <td className="py-2 pr-3 tabular-nums">{r.lr}</td>
                <td className="py-2 pr-3 tabular-nums">{r.epochs}</td>
                <td className="py-2 pr-3 tabular-nums">{r.durationMs ? `${Math.round(r.durationMs / 60000)}m` : "—"}</td>
                <td className="py-2 pr-0 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 h-7 text-[11px]"
                    onClick={() => handlePromote(r.runNumber)}
                    disabled={r.status !== "completed"}
                  >
                    <ArrowUpRight className="h-3 w-3" /> {t("experiments.promote")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
