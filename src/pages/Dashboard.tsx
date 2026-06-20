import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { PageTransition, FadeIn } from "@/components/motion";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <Helmet>
        <title>Dashboard · TuneLab</title>
        <meta name="description" content="Your TuneLab workspace overview: active fine-tuning projects, training activity, and credit usage." />
        <link rel="canonical" href="https://smart-model-tune.lovable.app/dashboard" />
        <meta property="og:title" content="Dashboard · TuneLab" />
        <meta property="og:url" content="https://smart-model-tune.lovable.app/dashboard" />
      </Helmet>
      <div className="space-y-6 max-w-7xl">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
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
      </div>
    </PageTransition>
  );
}
