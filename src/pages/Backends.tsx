import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { computeBackends, getDefaultBackend, setDefaultBackend, type ComputeBackendId } from "@/lib/computeBackends";

export default function Backends() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selected, setSelected] = useState<ComputeBackendId>("lovable-cloud");

  useEffect(() => { setSelected(getDefaultBackend().id); }, []);

  const handleSelect = (id: ComputeBackendId) => {
    setSelected(id);
    setDefaultBackend(id);
    const b = computeBackends.find((x) => x.id === id)!;
    toast({ title: t("backends.defaultSet"), description: b.name });
  };

  return (
    <>
      <Helmet>
        <title>{t("backends.metaTitle")}</title>
        <meta name="description" content={t("backends.metaDesc")} />
      </Helmet>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" /> {t("backends.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("backends.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {computeBackends.map((b) => {
            const active = selected === b.id;
            return (
              <Card
                key={b.id}
                className={active ? "border-primary/40 bg-accent/30" : "cursor-pointer hover:border-primary/30 transition-colors"}
                onClick={() => handleSelect(b.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{b.name}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("backends.vendor")}</span><span className="font-medium">{b.vendor}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("backends.gpu")}</span><span className="font-medium">{b.gpuSku}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("backends.price")}</span>
                    <span className="font-medium">{b.pricePerHour === 0 ? t("backends.included") : `$${b.pricePerHour.toFixed(2)}/h`}</span>
                  </div>
                  <Badge variant={b.managed ? "secondary" : "outline"} className="text-[10px]">
                    {b.managed ? t("backends.managed") : t("backends.selfHosted")}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed">
          <CardContent className="p-4 text-xs text-muted-foreground">
            {t("backends.notice")}
          </CardContent>
        </Card>

        <div>
          <Button variant="outline" size="sm" disabled>{t("backends.addCustom")}</Button>
        </div>
      </div>
    </>
  );
}
