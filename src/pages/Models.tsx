import { ModelCard } from "@/components/dashboard/ModelCard";
import { mockModels } from "@/data/mockData";
import { PageTransition, FadeIn, StaggerContainer, MotionCard } from "@/components/motion";

export default function Models() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Models</h1>
            <p className="text-sm text-muted-foreground">{mockModels.length} trained models available</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockModels.map((model) => (
            <MotionCard key={model.id}>
              <ModelCard model={model} />
            </MotionCard>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
