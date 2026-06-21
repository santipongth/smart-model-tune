import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { judges, getFailureClusters, type JudgeId } from "@/lib/evaluationSuite";
import { AlertTriangle, Plus } from "lucide-react";
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
  const clusters = getFailureClusters(project);
  const activeJudge = judges.find((j) => j.id === judge)!;

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
          <Select value={judge} onValueChange={(v) => setJudge(v as JudgeId)}>
            <SelectTrigger className="w-full md:w-72"><SelectValue /></SelectTrigger>
            <SelectContent>
              {judges.map((j) => (
                <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{activeJudge.description}</p>
        </CardContent>
      </Card>

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
                      <Badge variant={severityVariant[c.severity]} className="text-[10px] capitalize">{c.severity}</Badge>
                      <Badge variant="outline" className="text-[10px]">×{c.count}</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-[11px]" onClick={() => handleAddToTraining(c.label)}>
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
