import { FolderKanban, Box, Clock, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { motion } from "framer-motion";
import { useProjects } from "@/hooks/useProjects";
import { useModels, useCallEvents } from "@/hooks/useUserData";

export function StatsCards() {
  const { projects } = useProjects();
  const { models } = useModels();
  const { events } = useCallEvents("30d");

  const totalProjects = projects.length;
  const modelsTrained = models.length;
  const trainingHours = projects.reduce((s, p) => s + (p.epochs * 0.5), 0).toFixed(1);
  const creditsUsed = projects.reduce((s, p) => s + p.creditsCost, 0);
  const creditsRemaining = Math.max(0, 1000 - creditsUsed);

  const stats = [
    { label: "Total Projects", value: totalProjects, icon: FolderKanban, color: "text-primary" },
    { label: "Models Trained", value: modelsTrained, icon: Box, color: "text-success" },
    { label: "Training Hours", value: `${trainingHours}h`, icon: Clock, color: "text-warning" },
    { label: "Credits Left", value: creditsRemaining, icon: Coins, color: "text-primary" },
  ];

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <StaggerItem key={s.label}>
          <motion.div whileHover={{ y: -2, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg bg-accent ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
