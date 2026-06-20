import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2, Clock, Activity } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTrainingHistory, formatDuration } from "@/lib/trainingHistory";
import type { Project, ProjectStatus } from "@/types";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  training: "secondary",
  queued: "outline",
  paused: "outline",
  failed: "destructive",
};

function StatusIcon({ status }: { status: ProjectStatus }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-destructive" />;
  if (status === "training") return <Activity className="h-4 w-4 text-primary animate-pulse" />;
  if (status === "queued") return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

export function TrainingHistory({ project }: { project: Project }) {
  const { t } = useLanguage();
  const runs = getTrainingHistory(project);

  if (runs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        {t("history.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <Card key={run.id} className={run.isCurrent ? "border-primary/30" : ""}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <StatusIcon status={run.status} />
                <span className="font-semibold text-foreground text-sm">
                  {t("history.run")} #{run.runNumber}
                </span>
                {run.isCurrent && <Badge variant="outline">{t("history.latest")}</Badge>}
                <Badge variant={statusVariant[run.status]} className="capitalize">
                  {t(`history.status.${run.status}`)}
                </Badge>
              </div>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {run.progress}%
              </span>
            </div>

            <Progress value={run.progress} className="h-1.5" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">{t("history.startedAt")}</p>
                <p className="font-medium text-foreground">
                  {new Date(run.startedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("history.finishedAt")}</p>
                <p className="font-medium text-foreground">
                  {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("history.duration")}</p>
                <p className="font-medium text-foreground">{formatDuration(run.durationMs)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("history.epochs")}</p>
                <p className="font-medium text-foreground">{run.epochs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
