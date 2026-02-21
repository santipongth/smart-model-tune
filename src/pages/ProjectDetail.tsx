import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockProjects, mockEvalMetrics, taskTypeLabels, baseModelLabels } from "@/data/mockData";
import type { ProjectStatus } from "@/types";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  training: "secondary",
  queued: "outline",
  paused: "outline",
  failed: "destructive",
};

// Mock loss curve data
const lossCurve = Array.from({ length: 50 }, (_, i) => ({
  step: (i + 1) * 20,
  loss: 2.5 * Math.exp(-i * 0.06) + 0.15 + Math.random() * 0.08,
}));

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="link" asChild><Link to="/projects">Back to Projects</Link></Button>
      </div>
    );
  }

  const metrics = mockEvalMetrics[project.id];

  return (
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
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  ["Task Type", taskTypeLabels[project.taskType]],
                  ["Base Model", baseModelLabels[project.baseModel]],
                  ["Epochs", project.epochs],
                  ["Learning Rate", project.learningRate],
                  ["Dataset Size", `${project.datasetSize} samples`],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  ["Created", new Date(project.createdAt).toLocaleString()],
                  ["Last Updated", new Date(project.updatedAt).toLocaleString()],
                  ["Credits Used", project.creditsCost],
                  ["Progress", `${project.progress}%`],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4 mt-4">
          {project.status === "training" && (
            <Card>
              <CardContent className="p-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Training Progress</span>
                  <span className="font-medium text-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Loss Curve</CardTitle></CardHeader>
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
              <CardHeader className="pb-2"><CardTitle className="text-sm">Evaluation Metrics</CardTitle></CardHeader>
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
              Evaluation metrics will be available once training is complete.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
