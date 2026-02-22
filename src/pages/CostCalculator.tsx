import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTransition, FadeIn } from "@/components/motion";
import { Calculator, Zap, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const baseModels = [
  { id: "qwen-0.5b", name: "Qwen2.5-0.5B", params: "0.5B", costMultiplier: 1 },
  { id: "qwen-1.5b", name: "Qwen2.5-1.5B", params: "1.5B", costMultiplier: 2.2 },
  { id: "qwen-3b", name: "Qwen2.5-3B", params: "3B", costMultiplier: 3.8 },
  { id: "phi-3.8b", name: "Phi-3.5-mini", params: "3.8B", costMultiplier: 4.2 },
  { id: "gemma-2b", name: "Gemma-2-2B", params: "2B", costMultiplier: 2.8 },
];

const loraRanks = [8, 16, 32, 64];

const planLimits = [
  { name: "Free", monthlyCredits: 500, pricePerCredit: 0 },
  { name: "Pro", monthlyCredits: 10000, pricePerCredit: 0.0049 },
  { name: "Enterprise", monthlyCredits: 100000, pricePerCredit: 0.0035 },
];

export default function CostCalculator() {
  const [modelId, setModelId] = useState(baseModels[0].id);
  const [datasetSize, setDatasetSize] = useState(5000);
  const [epochs, setEpochs] = useState(3);
  const [loraRank, setLoraRank] = useState(16);
  const { t } = useLanguage();

  const model = baseModels.find((m) => m.id === modelId)!;

  const costs = useMemo(() => {
    const rankMultiplier = loraRank / 16;
    const dataGenCredits = Math.ceil(datasetSize * 0.02);
    const trainingCredits = Math.ceil(datasetSize * epochs * model.costMultiplier * rankMultiplier * 0.005);
    const evalCredits = Math.ceil(datasetSize * 0.01);
    const total = dataGenCredits + trainingCredits + evalCredits;
    return { dataGenCredits, trainingCredits, evalCredits, total };
  }, [modelId, datasetSize, epochs, loraRank, model.costMultiplier]);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" /> {t("calc.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("calc.subtitle")}</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("calc.configuration")}</CardTitle>
                <CardDescription>{t("calc.configDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("calc.baseModel")}</Label>
                  <Select value={modelId} onValueChange={setModelId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {baseModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2">
                            <span>{m.name}</span>
                            <Badge variant="outline" className="text-[10px]">{m.params}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{t("calc.datasetSize")}</Label>
                    <span className="text-sm font-medium text-foreground">{datasetSize.toLocaleString()} {t("calc.samples")}</span>
                  </div>
                  <Slider value={[datasetSize]} onValueChange={([v]) => setDatasetSize(v)} min={100} max={50000} step={100} />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>100</span><span>50,000</span></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{t("calc.epochs")}</Label>
                    <span className="text-sm font-medium text-foreground">{epochs}</span>
                  </div>
                  <Slider value={[epochs]} onValueChange={([v]) => setEpochs(v)} min={1} max={20} step={1} />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>1</span><span>20</span></div>
                </div>

                <div className="space-y-2">
                  <Label>{t("calc.loraRank")}</Label>
                  <div className="flex gap-2">
                    {loraRanks.map((r) => (
                      <Button key={r} variant={loraRank === r ? "default" : "outline"} size="sm" onClick={() => setLoraRank(r)} className="flex-1 text-xs">
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> {t("calc.creditEstimate")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: t("calc.dataGeneration"), value: costs.dataGenCredits },
                    { label: t("calc.trainingCompute"), value: costs.trainingCredits },
                    { label: t("calc.evaluation"), value: costs.evalCredits },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium">{item.value.toLocaleString()} {t("calc.credits")}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-semibold">{t("common.total")}</span>
                    <span className="text-xl font-bold text-primary">{costs.total.toLocaleString()} {t("calc.credits")}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">{t("calc.estimatedCost")}</p>
                  <div className="space-y-2">
                    {planLimits.map((plan) => {
                      const usd = plan.pricePerCredit > 0 ? (costs.total * plan.pricePerCredit).toFixed(2) : "Free";
                      const fits = costs.total <= plan.monthlyCredits;
                      return (
                        <div key={plan.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{plan.name}</span>
                            {fits && <Badge variant="outline" className="text-[9px] text-primary">{t("calc.fits")}</Badge>}
                          </div>
                          <span className="text-sm font-medium">{usd === "Free" ? t("calc.included") : `~$${usd}`}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button className="w-full mt-4" asChild>
                  <Link to="/projects/new">
                    {t("calc.startProject")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
