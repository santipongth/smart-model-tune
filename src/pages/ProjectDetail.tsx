import { useParams, Link } from "react-router-dom";
import { PageTransition } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, Download, RotateCcw, Wand2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { taskTypeLabels, baseModelLabels } from "@/data/mockData";
import { mockVersionHistory } from "@/data/deploymentMockData";
import { TuningReport } from "@/components/training/TuningReport";
import { TuningHistory } from "@/components/training/TuningHistory";
import { getLatestTuningRun, setAppliedRun } from "@/lib/tuningGenerator";
import { useProject } from "@/hooks/useProjects";
import { Loader2 } from "lucide-react";
import type { ProjectStatus } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  training: "secondary",
  queued: "outline",
  paused: "outline",
  failed: "destructive",
};

const lossCurve = Array.from({ length: 50 }, (_, i) => ({
  step: (i + 1) * 20,
  loss: 2.5 * Math.exp(-i * 0.06) + 0.15 + Math.random() * 0.08,
}));

function getSuggestions(datasetSize: number) {
  if (datasetSize < 1000) return { lr: 1e-4, epochs: 10, batch: 8, label: "small" };
  if (datasetSize <= 5000) return { lr: 2e-4, epochs: 5, batch: 16, label: "medium" };
  return { lr: 3e-4, epochs: 3, batch: 32, label: "large" };
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { project, loading } = useProject(id);
  const { t } = useLanguage();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t("projectDetail.notFound")}</p>
        <Button variant="link" asChild><Link to="/projects">{t("projectDetail.backToProjects")}</Link></Button>
      </div>
    );
  }

  // Generate metrics deterministically from project (in lieu of real eval data per project)
  const seed = project.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (offset: number) => 85 + ((seed + offset) % 12);
  const metrics = {
    accuracy: r(1),
    f1Score: r(2),
    precision: r(3),
    recall: r(4),
    rouge1: r(5),
    latencyMs: 100 + (seed % 80),
  };
  const versions = mockVersionHistory[project.id as keyof typeof mockVersionHistory] || [];
  const suggestion = getSuggestions(project.datasetSize);

  const handleExport = () => {
    const config = {
      name: project.name,
      description: project.description,
      taskType: project.taskType,
      baseModel: project.baseModel,
      epochs: project.epochs,
      learningRate: project.learningRate,
      datasetSize: project.datasetSize,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("export.exported") });
  };

  const handleRollback = (version: string) => {
    toast({ title: t("versions.rolledBack"), description: `→ ${version}` });
  };

  return (
    <PageTransition>
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" /> {t("export.exportJson")}
        </Button>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link to={`/projects/${project.id}/training`}>
            <Activity className="h-3.5 w-3.5" /> {t("projectDetail.trainingMonitor")}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("projectDetail.overview")}</TabsTrigger>
          <TabsTrigger value="training">{t("projectDetail.training")}</TabsTrigger>
          <TabsTrigger value="evaluation">{t("projectDetail.evaluation")}</TabsTrigger>
          <TabsTrigger value="versions">{t("versions.title")}</TabsTrigger>
          <TabsTrigger value="tuning">{t("projectDetail.autoTuning")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t("projectDetail.configuration")}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  [t("projectDetail.taskType"), taskTypeLabels[project.taskType]],
                  [t("projectDetail.baseModel"), baseModelLabels[project.baseModel]],
                  [t("projectDetail.epochs"), project.epochs],
                  [t("projectDetail.learningRate"), project.learningRate],
                  [t("projectDetail.datasetSize"), `${project.datasetSize} ${t("calc.samples")}`],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t("projectDetail.status")}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  [t("projectDetail.created"), new Date(project.createdAt).toLocaleString()],
                  [t("projectDetail.lastUpdated"), new Date(project.updatedAt).toLocaleString()],
                  [t("projectDetail.creditsUsed"), project.creditsCost],
                  [t("projectDetail.progress"), `${project.progress}%`],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tuning Suggestions */}
          <Card className="border-primary/20 bg-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" /> {t("tuning.suggestions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                {t("tuning.datasetLabel")}: {suggestion.label} ({project.datasetSize} {t("calc.samples")})
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Learning Rate", value: suggestion.lr, current: project.learningRate },
                  { label: "Epochs", value: suggestion.epochs, current: project.epochs },
                  { label: "Batch Size", value: suggestion.batch, current: "—" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-bold text-primary">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{t("tuning.current")}: {s.current}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4 mt-4">
          {project.status === "training" && (
            <Card>
              <CardContent className="p-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("projectDetail.trainingProgress")}</span>
                  <span className="font-medium text-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("projectDetail.lossCurve")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lossCurve}>
                    <defs>
                      <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(243,75%,59%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(243,75%,59%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="step" tick={{ fill: "hsl(220,9%,46%)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(220,9%,46%)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: "8px", fontSize: 12 }} />
                    <Area type="monotone" dataKey="loss" stroke="hsl(243,75%,59%)" fill="url(#lossGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4 mt-4">
          {metrics ? (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t("projectDetail.evalMetrics")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ["Accuracy", `${metrics.accuracy}%`],
                    ["F1 Score", `${metrics.f1Score}%`],
                    ["Precision", `${metrics.precision}%`],
                    ["Recall", `${metrics.recall}%`],
                    ...(metrics.rouge1 > 0 ? [["ROUGE-1", `${metrics.rouge1}%`]] : []),
                    ["Latency", `${metrics.latencyMs}ms`],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="text-center p-3 rounded-lg bg-accent">
                      <p className="text-xl font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t("projectDetail.evalPending")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4 mt-4">
          {versions.length > 0 ? (
            <div className="space-y-3">
              {versions.map((v) => (
                <Card key={v.version} className={v.current ? "border-primary/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{v.version}</span>
                        {v.current && <Badge>{t("versions.current")}</Badge>}
                      </div>
                      {!v.current && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleRollback(v.version)}>
                          <RotateCcw className="h-3 w-3" /> {t("versions.rollback")}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{new Date(v.date).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground italic mb-2">{v.notes}</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      {[
                        ["Epochs", v.epochs],
                        ["LR", v.learningRate],
                        ["Batch", v.batchSize],
                        ["Accuracy", v.accuracy ? `${v.accuracy}%` : "—"],
                        ["F1", v.f1Score ? `${v.f1Score}%` : "—"],
                      ].map(([label, val]) => (
                        <div key={String(label)} className="text-center p-1.5 rounded bg-muted">
                          <p className="text-muted-foreground">{label}</p>
                          <p className="font-medium text-foreground">{String(val)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t("versions.noVersions")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tuning" className="space-y-4 mt-4">
          <Tabs defaultValue="latest">
            <TabsList>
              <TabsTrigger value="latest">{t("tuningHistory.latestRun")}</TabsTrigger>
              <TabsTrigger value="history">{t("tuningHistory.title")}</TabsTrigger>
            </TabsList>
            <TabsContent value="latest" className="mt-4">
              {(() => {
                const latest = getLatestTuningRun(project);
                if (!latest) {
                  return (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      {t("tuningHistory.empty")}
                    </div>
                  );
                }
                return <TuningReport report={latest.report} />;
              })()}
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <TuningHistory project={project} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
    </PageTransition>
  );
}
