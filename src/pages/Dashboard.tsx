import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { FolderKanban, Box, MessageSquare } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export default function Dashboard() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Overview of your fine-tuning workspace</p>
            </div>
            <NewProjectDialog />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <StatsCards />
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentProjects />
            <ActivityChart />
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
            <StaggerContainer className="flex flex-wrap gap-3" staggerDelay={0.08}>
              <StaggerItem>
                <Button variant="outline" asChild>
                  <Link to="/projects" className="gap-2"><FolderKanban className="h-4 w-4" /> Browse Projects</Link>
                </Button>
              </StaggerItem>
              <StaggerItem>
                <Button variant="outline" asChild>
                  <Link to="/models" className="gap-2"><Box className="h-4 w-4" /> Browse Models</Link>
                </Button>
              </StaggerItem>
              <StaggerItem>
                <Button variant="outline" asChild>
                  <Link to="/playground" className="gap-2"><MessageSquare className="h-4 w-4" /> Open Playground</Link>
                </Button>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
