import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  judges,
  getFailureClusters,
  runEvaluation,
  getLatestRun,
  type JudgeId,
  type EvaluationRun,
  type RunProgress,
} from "@/lib/evaluationSuite";
import { AlertTriangle, Plus, Play, Loader2, CheckCircle2 } from "lucide-react";
import type { Project } from "@/types";

const severityVariant: Record<"low" | "medium" | "high", "outline" | "secondary" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

export function EvaluationSuite({ project }: { project: Project }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [judge, setJudge] = useState<JudgeId>("exact-match");
  const [latest, setLatest] = useState<EvaluationRun | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<RunProgress | null>(null);

  useEffect(() => {
    setLatest(getLatestRun(project.id));
  }, [project.id]);

  const fallbackClusters = getFailureClusters(project);
  const clusters = latest?.clusters ?? fallbackClusters;
  const activeJudge = judges.find((j) => j.id === judge)!;

  const handleRun = async () => {
    setRunning(true);
    setProgress({ step: "Starting", pct: 0 });
    try {
      const run = await runEvaluation(project, judge, (p) => setProgress(p));
      setLatest(run);
      toast({ title: t("eval.runComplete"), description: `${run.score}/100` });
    } catch (e) {
      toast({
        title: t("eval.runFailed"),
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setRunning(false);
      setProgress(null);
    }
  };

  const handleAddToTraining = (label: string) => {
    toast({ title: t("eval.addedToTraining"), description: label });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t("eval.judgeTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap items-center">
            <Select value={judge} onValueChange={(v) => setJudge(v as JudgeId)} disabled={running}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {judges.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleRun} disabled={running} className="gap-1.5">
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {running ? t("eval.running") : t("eval.runEvaluation")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{activeJudge.description}</p>
          {running && progress && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{progress.step}</span>
                <span className="tabular-nums text-foreground">{progress.pct}%</span>
              </div>
              <Progress value={progress.pct} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>

      {latest && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t("eval.latestRun")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                [t("eval.score"), `${latest.score}/100`],
                [t("eval.samples"), latest.samples],
                [t("eval.passed"), latest.passed],
                [t("eval.failed"), latest.failed],
              ].map(([label, val]) => (
                <div key={String(label)} className="text-center p-2 rounded-md bg-background border border-border">
                  <p className="text-lg font-bold text-foreground tabular-nums">{val}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">{t("eval.summary")}: </span>
                {latest.summary}
              </p>
              <p className="text-[11px]">
                {latest.judgeName} · {latest.backendName} · {new Date(latest.ranAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> {t("eval.failureClusters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clusters.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">{t("eval.noFailures")}</p>
          ) : (
            <div className="space-y-3">
              {clusters.map((c) => (
                <div key={c.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{c.label}</span>
                      <Badge variant={severityVariant[c.severity]} className="text-[10px] capitalize">
                        {c.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        ×{c.count}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 h-7 text-[11px]"
                      onClick={() => handleAddToTraining(c.label)}
                    >
                      <Plus className="h-3 w-3" /> {t("eval.addToTraining")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground mb-1 font-sans">{t("eval.prompt")}</p>
                      <p className="break-words">{c.examplePrompt}</p>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground mb-1 font-sans">{t("eval.expected")}</p>
                      <p className="break-words">{c.expected}</p>
                    </div>
                    <div className="bg-destructive/10 rounded p-2">
                      <p className="text-muted-foreground mb-1 font-sans">{t("eval.actual")}</p>
                      <p className="break-words">{c.actual}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
