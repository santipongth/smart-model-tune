import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageTransition, FadeIn } from "@/components/motion";
import { Database, Table, BarChart3, FileText } from "lucide-react";
import { mockDatasets, mockSchemas, mockSampleRows, mockColumnStats } from "@/data/datasetMockData";
import { useLanguage } from "@/i18n/LanguageContext";

export default function DatasetExplorer() {
  const [selectedId, setSelectedId] = useState(mockDatasets[0].id);
  const { t } = useLanguage();
  const dataset = mockDatasets.find((d) => d.id === selectedId)!;
  const schema = mockSchemas[selectedId] || [];
  const samples = mockSampleRows[selectedId] || [];
  const stats = mockColumnStats[selectedId] || [];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("dataset.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("dataset.subtitle")}</p>
            </div>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockDatasets.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    <span className="font-mono text-sm">{ds.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("dataset.rows"), value: dataset.rows.toLocaleString(), icon: Table },
              { label: t("dataset.columns"), value: dataset.columns, icon: Database },
              { label: t("dataset.fileSize"), value: dataset.fileSize, icon: FileText },
              { label: t("dataset.format"), value: dataset.format, icon: BarChart3 },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Tabs defaultValue="schema" className="space-y-4">
            <TabsList>
              <TabsTrigger value="schema" className="text-xs">{t("dataset.schema")}</TabsTrigger>
              <TabsTrigger value="sample" className="text-xs">{t("dataset.sampleData")}</TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">{t("dataset.statistics")}</TabsTrigger>
            </TabsList>

            <TabsContent value="schema">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("dataset.columnSchema")}</CardTitle>
                  <CardDescription>{t("dataset.schemaDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">{t("dataset.column")}</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">{t("dataset.type")}</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">{t("dataset.nullable")}</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">{t("dataset.uniqueValues")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schema.map((col) => (
                          <tr key={col.name} className="border-b border-border/50">
                            <td className="py-2.5 font-mono text-xs">{col.name}</td>
                            <td className="py-2.5"><Badge variant="outline" className="text-[10px]">{col.type}</Badge></td>
                            <td className="py-2.5">{col.nullable ? "Yes" : "No"}</td>
                            <td className="py-2.5 text-right">{col.uniqueCount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sample">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("dataset.sampleRows")}</CardTitle>
                  <CardDescription>{t("dataset.firstRows").replace("{count}", String(samples.length))}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {schema.map((col) => (
                            <th key={col.name} className="text-left py-2 text-muted-foreground font-medium whitespace-nowrap px-2">{col.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {samples.map((row, i) => (
                          <tr key={i} className="border-b border-border/50">
                            {schema.map((col) => (
                              <td key={col.name} className="py-2 px-2 text-xs max-w-[200px] truncate">{String(row[col.name] ?? "")}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("dataset.columnStats")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.map((col) => (
                    <div key={col.name} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm font-medium">{col.name}</span>
                        <Badge variant="outline" className="text-[10px]">{col.type}</Badge>
                      </div>
                      {col.min !== undefined && (
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div><span className="text-muted-foreground">Min:</span> {col.min}</div>
                          <div><span className="text-muted-foreground">Max:</span> {col.max}</div>
                          <div><span className="text-muted-foreground">Mean:</span> {col.mean}</div>
                        </div>
                      )}
                      {col.avgLength !== undefined && (
                        <p className="text-xs text-muted-foreground">Avg length: {col.avgLength} chars</p>
                      )}
                      {col.topValues && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {col.topValues.map((tv) => (
                            <Badge key={tv.value} variant="secondary" className="text-[10px]">{tv.value} ({tv.count})</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
