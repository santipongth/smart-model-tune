import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Check, RefreshCw, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const BEFORE_DEFAULT = "You are a helpful assistant. Answer the user's question.";
const AFTER_DEFAULT = `You are an expert customer support agent specializing in technical issues.

Guidelines:
- Always greet the user warmly
- Ask clarifying questions if the issue is ambiguous
- Provide step-by-step solutions with numbered lists
- End with "Is there anything else I can help with?"
- Maintain a professional yet friendly tone

If you don't know the answer, admit it and offer to escalate.`;

const IMPROVEMENTS = [
  { metric: "Clarity", before: 42, after: 91, delta: "+49" },
  { metric: "Specificity", before: 28, after: 88, delta: "+60" },
  { metric: "Token efficiency", before: 65, after: 73, delta: "+8" },
  { metric: "Expected accuracy", before: 71, after: 86, delta: "+15" },
];

export function PromptOptimizer() {
  const [open, setOpen] = useState(false);
  const [original, setOriginal] = useState(BEFORE_DEFAULT);
  const [optimized, setOptimized] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleOptimize = () => {
    setOptimizing(true);
    setShowResult(false);
    setTimeout(() => {
      setOptimized(AFTER_DEFAULT);
      setOptimizing(false);
      setShowResult(true);
    }, 1800);
  };

  const handleApply = () => {
    navigator.clipboard.writeText(optimized);
    toast({ title: t("optimizer.applied"), description: t("optimizer.copiedToClipboard") });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              rows={4}
              className="text-sm font-mono"
              placeholder={t("optimizer.placeholder")}
            />
          </div>

          <Button onClick={handleOptimize} disabled={optimizing || !original.trim()} className="w-full gap-2">
            {optimizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {t("optimizer.analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("optimizer.optimize")}
              </>
            )}
          </Button>

          {showResult && (
            <>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">
                      {t("optimizer.optimized")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">+247 tokens</Badge>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-mono text-foreground">
                    {optimized}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    {t("optimizer.improvements")}
                  </p>
                  <div className="space-y-2">
                    {IMPROVEMENTS.map((m) => (
                      <div key={m.metric} className="grid grid-cols-12 items-center gap-2 text-xs">
                        <span className="col-span-4 text-muted-foreground">{m.metric}</span>
                        <span className="col-span-2 text-right font-mono">{m.before}</span>
                        <ArrowRight className="col-span-1 h-3 w-3 text-muted-foreground mx-auto" />
                        <span className="col-span-2 text-left font-mono font-bold text-foreground">{m.after}</span>
                        <Badge variant="outline" className="col-span-3 text-[10px] justify-self-end text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          {m.delta}%
                        </Badge>
                      </div>
                    ))}
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
