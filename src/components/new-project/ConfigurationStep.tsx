import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import type { ProjectFormData } from "@/pages/NewProject";
import { taskTypeLabels, baseModelLabels } from "@/data/mockData";
import { useLanguage } from "@/i18n/LanguageContext";

function getSuggestions(datasetSize: number) {
  if (datasetSize < 1000) return { lr: 1e-4, epochs: 10, batch: 8, label: "small" };
  if (datasetSize <= 5000) return { lr: 2e-4, epochs: 5, batch: 16, label: "medium" };
  return { lr: 3e-4, epochs: 3, batch: 32, label: "large" };
}

export function ConfigurationStep({
  formData,
  updateForm,
}: {
  formData: ProjectFormData;
  updateForm: (p: Partial<ProjectFormData>) => void;
}) {
  const estimatedCredits = Math.round(formData.epochs * formData.batchSize * 0.8);
  const { t } = useLanguage();
  const fileCount = formData.files.length;
  const estimatedRows = fileCount * 500;
  const suggestion = getSuggestions(estimatedRows);

  const applySuggestions = () => {
    updateForm({
      epochs: suggestion.epochs,
      batchSize: suggestion.batch,
      learningRate: suggestion.lr,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground">Training Configuration</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Adjust training parameters. Default values work well for most tasks.
        </p>
      </div>

      {/* Auto-tuning suggestion */}
      <Card className="border-primary/20 bg-accent/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">{t("tuning.suggestions")}</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={applySuggestions}>
              {t("tuning.apply")}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">
            {t("tuning.datasetLabel")}: {suggestion.label} (~{estimatedRows} {t("calc.samples")})
          </p>
          <div className="flex gap-2">
            {[
              { label: "LR", value: suggestion.lr },
              { label: "Epochs", value: suggestion.epochs },
              { label: "Batch", value: suggestion.batch },
            ].map((s) => (
              <Badge key={s.label} variant="secondary" className="text-[10px]">
                {s.label}: {s.value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-accent/50 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          {formData.projectName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{formData.projectName}</span>
            </div>
          )}
          {formData.taskType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Task</span>
              <Badge variant="outline" className="text-[10px]">{taskTypeLabels[formData.taskType]}</Badge>
            </div>
          )}
          {formData.baseModel && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <Badge variant="outline" className="text-[10px]">{baseModelLabels[formData.baseModel]}</Badge>
            </div>
          )}
          {formData.files.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Files</span>
              <span className="text-foreground text-xs">{formData.files.length} file(s)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-xs">Epochs: {formData.epochs}</Label>
          <Slider
            value={[formData.epochs]}
            onValueChange={([v]) => updateForm({ epochs: v })}
            min={1}
            max={20}
            step={1}
          />
          <p className="text-[10px] text-muted-foreground">More epochs = better learning but risk of overfitting</p>
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs">Batch Size: {formData.batchSize}</Label>
          <Slider
            value={[formData.batchSize]}
            onValueChange={([v]) => updateForm({ batchSize: v })}
            min={4}
            max={64}
            step={4}
          />
          <p className="text-[10px] text-muted-foreground">Larger batches = faster training, more memory</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Learning Rate</Label>
          <Input
            type="number"
            step={0.0001}
            value={formData.learningRate}
            onChange={(e) => updateForm({ learningRate: parseFloat(e.target.value) || 2e-4 })}
          />
          <p className="text-[10px] text-muted-foreground">Recommended: 1e-4 to 5e-4</p>
        </div>

        <div className="flex items-end pb-2">
          <div className="bg-accent rounded-lg p-4 w-full text-center">
            <p className="text-2xl font-bold text-foreground">{estimatedCredits}</p>
            <p className="text-xs text-muted-foreground">Estimated Credits</p>
          </div>
        </div>
      </div>
    </div>
  );
}
