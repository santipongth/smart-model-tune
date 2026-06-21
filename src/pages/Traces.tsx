import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Database,
  Upload,
  Sparkles,
  Trash2,
  FileText,
  Loader2,
  ChevronDown,
  Rocket,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  addTraceBundle,
  deleteTraceBundle,
  estimateRowCount,
  generateSyntheticDataset,
  listTraces,
  type TraceBundle,
} from "@/lib/tracesApi";
import {
  getSyntheticDataset,
  setSyntheticPrefill,
  type SyntheticDataset,
} from "@/lib/syntheticDataset";

export default function Traces() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<TraceBundle[]>([]);
  const [name, setName] = useState("");
  const [pasted, setPasted] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);

  const refresh = () => setBundles(listTraces());
  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = async (file: File) => {
    const text = await file.text();
    const rows = estimateRowCount(text);
    addTraceBundle({
      name: file.name,
      source: "upload",
      rowCount: rows,
      sampleBytes: file.size,
      systemPrompt: systemPrompt || undefined,
      rawText: text,
    });
    toast({ title: t("traces.uploaded"), description: `${file.name} • ${rows} ${t("traces.rows")}` });
    refresh();
  };

  const handlePaste = () => {
    if (!pasted.trim()) return;
    const rows = estimateRowCount(pasted);
    addTraceBundle({
      name: name.trim() || `Pasted traces ${new Date().toLocaleTimeString()}`,
      source: "paste",
      rowCount: rows,
      sampleBytes: new Blob([pasted]).size,
      systemPrompt: systemPrompt || undefined,
      rawText: pasted,
    });
    toast({ title: t("traces.added"), description: `${rows} ${t("traces.rows")}` });
    setPasted("");
    setName("");
    refresh();
  };

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    try {
      const dataset = await generateSyntheticDataset(id);
      toast({
        title: t("traces.generated"),
        description: `${dataset.size} ${t("traces.rows")} · ${t("traces.quality")} ${dataset.quality.score}/100`,
      });
      refresh();
    } catch (e) {
      toast({ title: t("traces.generateFailed"), description: (e as Error).message, variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteTraceBundle(id);
    refresh();
  };

  const handleUseInTraining = (datasetId: string) => {
    setSyntheticPrefill(datasetId);
    toast({ title: t("traces.useInTrainingToast") });
    navigate("/projects/new");
  };

  return (
    <>
      <Helmet>
        <title>{t("traces.metaTitle")}</title>
        <meta name="description" content={t("traces.metaDesc")} />
      </Helmet>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" /> {t("traces.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("traces.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" /> {t("traces.uploadTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{t("traces.uploadHint")}</p>
              <Input
                type="file"
                accept=".json,.jsonl,.csv,.txt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.currentTarget.value = "";
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" /> {t("traces.pasteTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder={t("traces.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                placeholder={t("traces.pastePlaceholder")}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                rows={5}
                className="font-mono text-xs"
              />
              <Button size="sm" onClick={handlePaste} disabled={!pasted.trim()} className="w-full">
                {t("traces.add")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("traces.systemPromptTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={t("traces.systemPromptPlaceholder")}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">{t("traces.bundlesTitle")}</h2>
          {bundles.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              {t("traces.empty")}
            </div>
          ) : (
            <div className="space-y-2">
              {bundles.map((b) => {
                const dataset = b.generatedDatasetId
                  ? getSyntheticDataset(b.generatedDatasetId)
                  : null;
                return (
                  <BundleRow
                    key={b.id}
                    bundle={b}
                    dataset={dataset}
                    generating={generating === b.id}
                    onGenerate={() => handleGenerate(b.id)}
                    onDelete={() => handleDelete(b.id)}
                    onUseInTraining={handleUseInTraining}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BundleRow({
  bundle,
  dataset,
  generating,
  onGenerate,
  onDelete,
  onUseInTraining,
}: {
  bundle: TraceBundle;
  dataset: SyntheticDataset | null;
  generating: boolean;
  onGenerate: () => void;
  onDelete: () => void;
  onUseInTraining: (datasetId: string) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground truncate">{bundle.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {bundle.source}
              </Badge>
              {bundle.generatedDatasetId && (
                <Badge className="text-[10px]">{t("traces.generatedBadge")}</Badge>
              )}
              {dataset && (
                <Badge variant="secondary" className="text-[10px]">
                  {t("traces.quality")} {dataset.quality.score}/100
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bundle.rowCount} {t("traces.rows")} • {(bundle.sampleBytes / 1024).toFixed(1)} KB •{" "}
              {new Date(bundle.createdAt).toLocaleString()}
              {bundle.generatedDatasetSize
                ? ` • → ${bundle.generatedDatasetSize} ${t("traces.synthetic")}`
                : ""}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {bundle.generatedDatasetId ? t("traces.regenerate") : t("traces.generate")}
          </Button>
          {dataset && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onUseInTraining(dataset.id)}
            >
              <Rocket className="h-3 w-3" />
              {t("traces.useInTraining")}
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onDelete} aria-label={t("common.delete")}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>

        {dataset && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-7 text-[11px] text-muted-foreground"
              >
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                />
                {open ? t("traces.hideDetails") : t("traces.showDetails")}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                {[
                  [t("traces.qDiversity"), `${dataset.quality.diversity}%`],
                  [t("traces.qDuplicates"), `${dataset.quality.duplicateRate}%`],
                  [t("traces.qAvgPrompt"), `${dataset.quality.avgPromptTokens} tok`],
                  [t("traces.qAvgResponse"), `${dataset.quality.avgResponseTokens} tok`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-muted rounded p-2 text-center">
                    <p className="text-muted-foreground">{label}</p>
                    <p className="font-semibold text-foreground">{val}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">{t("traces.preview")}</p>
                <div className="space-y-1.5">
                  {dataset.preview.map((row, i) => (
                    <div
                      key={i}
                      className="border border-border rounded p-2 text-[11px] font-mono space-y-1"
                    >
                      <div>
                        <span className="text-muted-foreground">prompt: </span>
                        <span className="text-foreground">{row.prompt}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">response: </span>
                        <span className="text-foreground">{row.response}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
