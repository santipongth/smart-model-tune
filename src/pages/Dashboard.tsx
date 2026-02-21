import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { FolderKanban, Box, MessageSquare } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your fine-tuning workspace</p>
        </div>
        <NewProjectDialog />
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects />
        <ActivityChart />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/projects" className="gap-2"><FolderKanban className="h-4 w-4" /> Browse Projects</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/models" className="gap-2"><Box className="h-4 w-4" /> Browse Models</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/playground" className="gap-2"><MessageSquare className="h-4 w-4" /> Open Playground</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
