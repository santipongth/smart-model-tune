import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { taskTypeLabels } from "@/data/mockData";
import { Search, Upload } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, MotionCard } from "@/components/motion";
import { ProjectCardSkeleton } from "@/components/skeletons/ProjectCardSkeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import type { TaskType, BaseModel } from "@/types";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [filterTask, setFilterTask] = useState("all");
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const { projects, loading, create } = useProjects();

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags ?? [])));
  const [filterTag, setFilterTag] = useState("all");

  const filtered = projects
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesTask = filterTask === "all" || p.taskType === filterTask;
      const matchesTag = filterTag === "all" || p.tags?.includes(filterTag);
      return matchesSearch && matchesTask && matchesTag;
    })
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.name || !data.taskType || !data.baseModel) {
          toast({ title: t("import.invalidFormat"), variant: "destructive" });
          return;
        }
        await create({
          name: data.name,
          description: data.description || "",
          taskType: data.taskType as TaskType,
          baseModel: data.baseModel as BaseModel,
          epochs: data.epochs || 3,
          learningRate: data.learningRate || 2e-4,
          datasetSize: data.datasetSize || 0,
          tags: data.tags ?? [],
        });
        toast({ title: t("import.success"), description: data.name });
      } catch {
        toast({ title: t("import.invalidJson"), variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("projects.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("projects.total").replace("{count}", String(allProjects.length))}</p>
            </div>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> {t("import.importJson")}
              </Button>
              <NewProjectDialog />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("projects.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterTask} onValueChange={setFilterTask}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder={t("projects.filterByTask")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("projects.allTasks")}</SelectItem>
                {Object.entries(taskTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allTags.length > 0 && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder={t("projects.filterByTag")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("projects.allTags")}</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <MotionCard key={project.id}>
                <ProjectCard project={project} />
              </MotionCard>
            ))}
          </StaggerContainer>
        )}

        {!loading && filtered.length === 0 && (
          <FadeIn>
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">{t("projects.noResults")}</p>
            </div>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
