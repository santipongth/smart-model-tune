import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Check, RefreshCw, TrendingUp, Lightbulb, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MetricPair { before: number; after: number }
interface OptimizeResponse {
  optimized_prompt: string;
  reasoning: { change: string; why: string }[];
  metrics: {
    clarity: MetricPair;
    specificity: MetricPair;
    tokenEfficiency: MetricPair;
    expectedAccuracy: MetricPair;
  };
}

const DEFAULT_PROMPT = "You are a helpful assistant. Answer the user's question.";

export function PromptOptimizer() {
  const [open, setOpen] = useState(false);
  const [original, setOriginal] = useState(DEFAULT_PROMPT);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const handleOptimize = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-prompt", {
        body: { prompt: original, language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as OptimizeResponse);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      // Friendly errors for rate-limit/credits
      if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
        setErrorMsg(t("optimizer.rateLimited"));
      } else if (msg.includes("402") || msg.toLowerCase().includes("credit")) {
        setErrorMsg(t("optimizer.outOfCredits"));
      } else {
        setErrorMsg(msg);
      }
      toast({ title: t("optimizer.failed"), description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimized_prompt);
    toast({ title: t("optimizer.applied"), description: t("optimizer.copiedToClipboard") });
    setOpen(false);
  };

  const formatDelta = (m: MetricPair) => {
    const d = m.after - m.before;
    return (d >= 0 ? "+" : "") + d;
  };

  const metricRows = result
    ? [
        { key: "clarity", label: t("optimizer.metricClarity"), m: result.metrics.clarity },
        { key: "specificity", label: t("optimizer.metricSpecificity"), m: result.metrics.specificity },
        { key: "tokenEfficiency", label: t("optimizer.metricTokens"), m: result.metrics.tokenEfficiency },
        { key: "expectedAccuracy", label: t("optimizer.metricAccuracy"), m: result.metrics.expectedAccuracy },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResult(null); setErrorMsg(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t("optimizer.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> {t("optimizer.title")}
          </DialogTitle>
          <DialogDescription>{t("optimizer.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              {t("optimizer.yourPrompt")}
            </label>
            <Textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={5}
              className="text-sm font-mono"
              placeholder={t("optimizer.placeholder")}
            />
          </div>

          <Button onClick={handleOptimize} disabled={loading || original.trim().length < 5} className="w-full gap-2">
            {loading ? (
              <><RefreshCw className="h-4 w-4 animate-spin" />{t("optimizer.analyzing")}</>
            ) : (
              <><Sparkles className="h-4 w-4" />{t("optimizer.optimize")}</>
            )}
          </Button>

          {errorMsg && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-3 flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-foreground">{errorMsg}</span>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">
                      {t("optimizer.optimized")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {result.optimized_prompt.length} chars
                    </Badge>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-mono text-foreground">
                    {result.optimized_prompt}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                    {t("optimizer.reasoning")}
                  </p>
                  <div className="space-y-2">
                    {result.reasoning.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-md border border-border bg-muted/30 space-y-1">
                        <p className="text-xs font-medium text-foreground">{r.change}</p>
                        <p className="text-xs text-muted-foreground">{r.why}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    {t("optimizer.improvements")}
                  </p>
                  <div className="space-y-2">
                    {metricRows.map((row) => {
                      const delta = row.m.after - row.m.before;
                      return (
                        <div key={row.key} className="grid grid-cols-12 items-center gap-2 text-xs">
                          <span className="col-span-4 text-muted-foreground">{row.label}</span>
                          <span className="col-span-2 text-right font-mono">{row.m.before}</span>
                          <ArrowRight className="col-span-1 h-3 w-3 text-muted-foreground mx-auto" />
                          <span className="col-span-2 text-left font-mono font-bold text-foreground">{row.m.after}</span>
                          <Badge
                            variant="outline"
                            className={`col-span-3 text-[10px] justify-self-end ${
                              delta >= 0
                                ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "text-destructive border-destructive/30"
                            }`}
                          >
                            {formatDelta(row.m)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleApply} className="w-full gap-2">
                <Check className="h-4 w-4" /> {t("optimizer.apply")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
