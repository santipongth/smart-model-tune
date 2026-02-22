import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTransition, FadeIn } from "@/components/motion";
import { Tag, ChevronLeft, ChevronRight, SkipForward, Download, Keyboard } from "lucide-react";
import { mockAnnotationSamples } from "@/data/deploymentMockData";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const LABELS = ["PERSON", "ORG", "LOC", "DATE", "PRODUCT", "OTHER"];
const LABEL_COLORS: Record<string, string> = {
  PERSON: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  ORG: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
  LOC: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
  DATE: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  PRODUCT: "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30",
  OTHER: "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30",
};

export default function AnnotationTool() {
  const [samples] = useState(mockAnnotationSamples);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [annotations, setAnnotations] = useState<Record<number, string>>({});
  const { toast } = useToast();
  const { t } = useLanguage();

  const current = samples[currentIdx];
  const annotatedCount = Object.keys(annotations).length;
  const progress = (annotatedCount / samples.length) * 100;

  const handleLabel = useCallback((label: string) => {
    setAnnotations((prev) => ({ ...prev, [current.id]: label }));
    if (currentIdx < samples.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
    toast({ title: `${t("annotate.labeled")}: ${label}`, duration: 1000 });
  }, [current, currentIdx, samples.length, toast, t]);

  const handleSkip = () => {
    if (currentIdx < samples.length - 1) setCurrentIdx((i) => i + 1);
  };

  const handleExport = () => {
    const data = samples.map((s) => ({ ...s, label: annotations[s.id] || null }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("annotate.exported") });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= LABELS.length) {
        handleLabel(LABELS[num - 1]);
      } else if (e.key === "ArrowRight") {
        handleSkip();
      } else if (e.key === "ArrowLeft") {
        setCurrentIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleLabel]);

  const labelDistribution = LABELS.map((l) => ({
    label: l,
    count: Object.values(annotations).filter((a) => a === l).length,
  })).filter((d) => d.count > 0);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Tag className="h-6 w-6 text-primary" /> {t("annotate.title")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("annotate.subtitle")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="h-3.5 w-3.5" /> {t("annotate.exportJson")}
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm font-medium text-foreground">{annotatedCount}/{samples.length}</span>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FadeIn delay={0.15} className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t("annotate.sample")} #{currentIdx + 1}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {annotations[current.id] ? `✓ ${annotations[current.id]}` : t("annotate.unlabeled")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 border border-border min-h-[100px] flex items-center">
                  <p className="text-base leading-relaxed text-foreground">{current.text}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">{t("annotate.selectLabel")}</p>
              <div className="flex flex-wrap gap-2">
                {LABELS.map((label, i) => (
                  <Button
                    key={label}
                    variant={annotations[current.id] === label ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLabel(label)}
                    className="gap-1.5"
                  >
                    <kbd className="text-[10px] bg-background/50 px-1 rounded">{i + 1}</kbd>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" /> {t("annotate.prev")}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSkip} disabled={currentIdx >= samples.length - 1}>
                <SkipForward className="h-4 w-4 mr-1" /> {t("annotate.skip")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentIdx(Math.min(samples.length - 1, currentIdx + 1))} disabled={currentIdx >= samples.length - 1}>
                {t("annotate.next")} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">{t("annotate.distribution")}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {labelDistribution.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">{t("annotate.noLabelsYet")}</p>
                ) : (
                  labelDistribution.map((d) => (
                    <div key={d.label} className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] ${LABEL_COLORS[d.label]}`}>{d.label}</Badge>
                      <span className="text-sm font-medium text-foreground">{d.count}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Keyboard className="h-4 w-4" /> {t("annotate.shortcuts")}</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                {LABELS.map((l, i) => (
                  <div key={l} className="flex items-center justify-between">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">{i + 1}</kbd>
                    <span className="text-muted-foreground">{l}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 border-t border-border mt-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">← →</kbd>
                  <span className="text-muted-foreground">{t("annotate.navigate")}</span>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
