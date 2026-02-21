import { useState } from "react";
import { PageTransition, FadeIn } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Columns2, MessageSquare } from "lucide-react";
import { ChatPanel } from "@/components/playground/ChatPanel";
import { mockModels } from "@/data/mockData";

const samplePrompts = [
  "My internet connection keeps dropping every few minutes",
  "นายสมชาย เดินทางไปประชุมที่ธนาคารกสิกร สาขาสีลม",
  "What is your return policy for electronics?",
  "Book a flight from Bangkok to Tokyo next Friday",
];

export default function Playground() {
  const [modelA, setModelA] = useState(mockModels[0].id);
  const [modelB, setModelB] = useState(mockModels[1].id);
  const [abMode, setAbMode] = useState(false);

  const getModelName = (id: string) => mockModels.find((m) => m.id === id)?.name || id;

  return (
    <PageTransition>
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Playground</h1>
          <p className="text-sm text-muted-foreground">Test your fine-tuned models with real inputs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="ab-toggle" className="text-sm text-muted-foreground cursor-pointer">Single</Label>
            <Switch id="ab-toggle" checked={abMode} onCheckedChange={setAbMode} />
            <Label htmlFor="ab-toggle" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1">
              <Columns2 className="h-4 w-4" /> A/B
            </Label>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <Card>
        <CardContent className="p-4">
          <div className={`grid gap-4 ${abMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{abMode ? "Model A" : "Model"}</Label>
              <Select value={modelA} onValueChange={setModelA}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{m.name}</span>
                        <Badge variant="outline" className="text-[9px]">{m.taskType}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {abMode && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Model B</Label>
                <Select value={modelB} onValueChange={setModelB}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{m.name}</span>
                          <Badge variant="outline" className="text-[9px]">{m.taskType}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sample Prompts */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Try these sample prompts:</p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                // Copy to clipboard as a hint
                navigator.clipboard.writeText(prompt);
              }}
            >
              {prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Panel(s) */}
      <div className={`grid gap-4 ${abMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <ChatPanel
          key={`a-${modelA}`}
          modelName={getModelName(modelA)}
          className="h-full"
        />
        {abMode && (
          <ChatPanel
            key={`b-${modelB}`}
            modelName={getModelName(modelB)}
            className="h-full"
          />
        )}
      </div>

      {/* Info */}
      {abMode && (
        <Card className="bg-accent/50 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Columns2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">A/B Comparison Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send the same input to both models and compare their outputs side by side. 
                Check latency, token usage, and response quality to pick the best model for production.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </PageTransition>
  );
}
