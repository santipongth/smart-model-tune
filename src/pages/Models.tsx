import { ModelCard } from "@/components/dashboard/ModelCard";
import { mockModels } from "@/data/mockData";

export default function Models() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Models</h1>
        <p className="text-sm text-muted-foreground">{mockModels.length} trained models available</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockModels.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
    </div>
  );
}
