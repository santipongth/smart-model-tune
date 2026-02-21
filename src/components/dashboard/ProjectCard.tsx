import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Project, ProjectStatus } from "@/types";
import { taskTypeLabels, baseModelLabels } from "@/data/mockData";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  training: "secondary",
  queued: "outline",
  paused: "outline",
  failed: "destructive",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-tight">{project.name}</CardTitle>
            <Badge variant={statusVariant[project.status]} className="shrink-0 text-[10px]">
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">{taskTypeLabels[project.taskType]}</Badge>
            <Badge variant="outline" className="text-[10px]">{baseModelLabels[project.baseModel]}</Badge>
          </div>
          {project.status === "training" && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
