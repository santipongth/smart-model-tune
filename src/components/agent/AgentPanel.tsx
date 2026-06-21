import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { planFromText, type AgentAction, type AgentPlan } from "@/lib/agentPlanner";

const SUGGESTIONS = [
  "Train a classifier on Qwen 1.5B for 5 epochs",
  "Upload my production traces",
  "Evaluate the latest project",
  "Go to compute backends",
];

export function AgentPanel() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);

  const submit = (text?: string) => {
    const v = (text ?? input).trim();
    if (!v) return;
    setPlan(planFromText(v));
    setInput(v);
  };

  const runAction = (a: AgentAction) => {
    if (a.kind === "navigate") navigate(a.path);
    else if (a.kind === "upload-traces") navigate("/traces");
    else if (a.kind === "evaluate") navigate("/projects");
    else if (a.kind === "create-project") {
      // Prefill template-prefill bus that NewProject already consumes
      sessionStorage.setItem("template-prefill", JSON.stringify({
        name: "Agent draft",
        prompt: input,
        taskType: a.taskType ?? undefined,
        baseModel: a.baseModel ?? undefined,
      }));
      navigate("/projects/new");
    }
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="fixed bottom-4 right-4 z-40 shadow-lg gap-2 rounded-full px-4"
        aria-label={t("agent.open")}
      >
        <Sparkles className="h-4 w-4" /> {t("agent.title")}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-40 w-[min(420px,calc(100vw-2rem))] shadow-2xl border-primary/20">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> {t("agent.title")}
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)} aria-label={t("common.close")}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{t("agent.subtitle")}</p>
        <div className="flex flex-wrap gap-1">
          {SUGGESTIONS.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="cursor-pointer text-[10px] hover:bg-accent"
              onClick={() => submit(s)}
            >
              {s}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("agent.placeholder")}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button size="icon" onClick={() => submit()} aria-label={t("agent.send")}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {plan && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <p className="text-[11px] text-muted-foreground">{plan.rationale}</p>
            {plan.actions.map((a, i) => (
              <button
                key={i}
                onClick={() => runAction(a)}
                disabled={a.kind === "unknown"}
                className="w-full text-left p-2 rounded-md border border-border hover:border-primary/40 hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <p className="text-xs font-medium text-foreground">{a.label}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{a.kind.replace("-", " ")}</p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
