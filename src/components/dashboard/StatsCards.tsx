import { FolderKanban, Box, Clock, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockUsageStats } from "@/data/mockData";

const stats = [
  { label: "Total Projects", value: mockUsageStats.totalProjects, icon: FolderKanban, color: "text-primary" },
  { label: "Models Trained", value: mockUsageStats.modelsTrainedCount, icon: Box, color: "text-success" },
  { label: "Training Hours", value: `${mockUsageStats.trainingHoursUsed}h`, icon: Clock, color: "text-warning" },
  { label: "Credits Left", value: mockUsageStats.creditsRemaining, icon: Coins, color: "text-primary" },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
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
      ))}
    </div>
  );
}
