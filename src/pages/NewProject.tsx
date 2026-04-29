import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TaskPromptStep } from "@/components/new-project/TaskPromptStep";
import { TaskSelectionStep } from "@/components/new-project/TaskSelectionStep";
import { DataUploadStep } from "@/components/new-project/DataUploadStep";
import { ModelSelectionStep } from "@/components/new-project/ModelSelectionStep";
import { ConfigurationStep } from "@/components/new-project/ConfigurationStep";
import { TemplateLibrary } from "@/components/new-project/TemplateLibrary";
import type { TaskType, BaseModel } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { createProject } from "@/lib/projectsApi";

export interface ProjectFormData {
  projectName: string;
  taskPrompt: string;
  taskType: TaskType | null;
  baseModel: BaseModel | null;
  files: File[];
  epochs: number;
  learningRate: number;
  batchSize: number;
}

const initialFormData: ProjectFormData = {
  projectName: "",
  taskPrompt: "",
  taskType: null,
  baseModel: null,
  files: [],
  epochs: 5,
  learningRate: 2e-4,
  batchSize: 16,
};

export default function NewProject() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [showTemplates, setShowTemplates] = useState(false);
  const [launching, setLaunching] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLaunch = async () => {
    if (!formData.taskType || !formData.baseModel) return;
    setLaunching(true);
    try {
      const created = await createProject({
        name: formData.projectName.trim() || formData.taskPrompt.slice(0, 60) || "Untitled Project",
        description: formData.taskPrompt,
        taskType: formData.taskType,
        baseModel: formData.baseModel,
        epochs: formData.epochs,
        learningRate: formData.learningRate,
        datasetSize: formData.files.length * 100,
      });
      toast({ title: t("newProject.launched"), description: created.name });
      navigate(`/projects/${created.id}`);
    } catch (e) {
      toast({
        title: t("newProject.launchFailed"),
        description: (e as Error).message,
        variant: "destructive",
      });
      setLaunching(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("template-prefill");
    if (stored) {
      try {
        const tpl = JSON.parse(stored);
        setFormData((p) => ({
          ...p,
          projectName: tpl.name ?? p.projectName,
          taskPrompt: tpl.prompt ?? p.taskPrompt,
          taskType: tpl.taskType ?? p.taskType,
          baseModel: tpl.baseModel ?? p.baseModel,
          epochs: tpl.epochs ?? p.epochs,
          learningRate: tpl.learningRate ?? p.learningRate,
        }));
        sessionStorage.removeItem("template-prefill");
      } catch {
        // ignore
      }
    }
  }, []);

  const steps = [
    { id: "prompt", label: t("newProject.taskPrompt") },
    { id: "task", label: t("newProject.taskType") },
    { id: "data", label: t("newProject.uploadData") },
    { id: "model", label: t("newProject.baseModel") },
    { id: "config", label: t("newProject.configuration") },
  ];

  const updateForm = (partial: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.taskPrompt.trim().length > 10;
      case 1: return formData.taskType !== null;
      case 2: return true;
      case 3: return formData.baseModel !== null;
      case 4: return true;
      default: return false;
    }
  };

  const handleTemplateSelect = (template: { name: string; prompt: string; taskType: TaskType; baseModel: BaseModel }) => {
    setFormData({
      ...initialFormData,
      projectName: template.name,
      taskPrompt: template.prompt,
      taskType: template.taskType,
      baseModel: template.baseModel,
    });
    setShowTemplates(false);
    setCurrentStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("newProject.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("newProject.subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowTemplates(!showTemplates)}>
          <Sparkles className="h-3.5 w-3.5" />
          {showTemplates ? t("newProject.hideTemplates") : t("newProject.useTemplate")}
        </Button>
      </div>

      {showTemplates && <TemplateLibrary onSelect={handleTemplateSelect} />}

      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => i <= currentStep && setCurrentStep(i)}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-md transition-colors w-full ${
                i === currentStep
                  ? "bg-primary text-primary-foreground"
                  : i < currentStep
                  ? "bg-accent text-accent-foreground cursor-pointer"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/30 shrink-0">
                {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline truncate">{step.label}</span>
            </button>
            {i < steps.length - 1 && <div className="w-2 shrink-0" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && <TaskPromptStep formData={formData} updateForm={updateForm} />}
          {currentStep === 1 && <TaskSelectionStep formData={formData} updateForm={updateForm} />}
          {currentStep === 2 && <DataUploadStep formData={formData} updateForm={updateForm} />}
          {currentStep === 3 && <ModelSelectionStep formData={formData} updateForm={updateForm} />}
          {currentStep === 4 && <ConfigurationStep formData={formData} updateForm={updateForm} />}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed()} className="gap-2">
            {t("common.next")} <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2" asChild>
            <Link to="/projects">
              <Sparkles className="h-4 w-4" /> {t("newProject.launchTraining")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
