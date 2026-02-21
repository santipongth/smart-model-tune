import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ModelCard } from "@/components/dashboard/ModelCard";
import { mockModels } from "@/data/mockData";
import { PageTransition, FadeIn, StaggerContainer, MotionCard } from "@/components/motion";
import { ModelCardSkeleton } from "@/components/skeletons/ModelCardSkeleton";
import { Button } from "@/components/ui/button";
import { GitCompare } from "lucide-react";

export default function Models() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Models</h1>
              <p className="text-sm text-muted-foreground">{mockModels.length} trained models available</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/models/compare" className="gap-2">
                <GitCompare className="h-4 w-4" /> Compare Models
              </Link>
            </Button>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <ModelCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockModels.map((model) => (
              <MotionCard key={model.id}>
                <ModelCard model={model} />
              </MotionCard>
            ))}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}
