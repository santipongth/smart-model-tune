/**
 * Lightweight natural-language → action-plan parser for the AI Agent panel.
 * Heuristic-only (no LLM call) so it stays deterministic in the prototype.
 * Inspired by Oumi Agent's NL workflow control.
 */
import type { TaskType, BaseModel } from "@/types";

export type AgentAction =
  | { kind: "navigate"; path: string; label: string }
  | { kind: "create-project"; taskType: TaskType | null; baseModel: BaseModel | null; epochs: number | null; label: string }
  | { kind: "evaluate"; label: string }
  | { kind: "upload-traces"; label: string }
  | { kind: "unknown"; label: string };

export interface AgentPlan {
  intent: string;
  actions: AgentAction[];
  rationale: string;
}

const TASK_KEYWORDS: { kw: RegExp; taskType: TaskType }[] = [
  { kw: /classif|sentiment|intent/i, taskType: "classification" },
  { kw: /\bner\b|entity|extract.*name/i, taskType: "ner" },
  { kw: /\bqa\b|question.*answer/i, taskType: "qa" },
  { kw: /function.?call|tool.?call/i, taskType: "function-calling" },
  { kw: /extract|parse|invoice|form/i, taskType: "extraction" },
  { kw: /rank|reorder|relevance/i, taskType: "ranking" },
];

const MODEL_KEYWORDS: { kw: RegExp; baseModel: BaseModel }[] = [
  { kw: /qwen.*3b|qwen2\.5-3b/i,  baseModel: "qwen2.5-3b" },
  { kw: /qwen.*1\.5b|qwen2\.5-1\.5b/i, baseModel: "qwen2.5-1.5b" },
  { kw: /gemma/i,                 baseModel: "gemma-2-2b" },
  { kw: /phi/i,                   baseModel: "phi-3-mini" },
  { kw: /llama/i,                 baseModel: "llama-3.2-1b" },
  { kw: /smollm/i,                baseModel: "smollm2-1.7b" },
];

export function planFromText(input: string): AgentPlan {
  const text = input.trim();
  if (!text) {
    return { intent: "empty", actions: [], rationale: "Ask me to train, evaluate, upload traces, or open a page." };
  }

  const actions: AgentAction[] = [];

  if (/upload|trace|production log/i.test(text)) {
    actions.push({ kind: "upload-traces", label: "Open the Traces page to upload logs" });
  }

  if (/evaluate|eval|judge|failure/i.test(text)) {
    actions.push({ kind: "evaluate", label: "Open the Evaluation suite" });
  }

  if (/train|fine.?tune|distill|build a model/i.test(text)) {
    const task = TASK_KEYWORDS.find((t) => t.kw.test(text))?.taskType ?? null;
    const base = MODEL_KEYWORDS.find((m) => m.kw.test(text))?.baseModel ?? null;
    const epochMatch = text.match(/(\d+)\s*epoch/i);
    const epochs = epochMatch ? Math.min(50, parseInt(epochMatch[1], 10)) : null;
    actions.push({
      kind: "create-project",
      taskType: task,
      baseModel: base,
      epochs,
      label: `Start a new training run${task ? ` (${task})` : ""}`,
    });
  }

  if (/dashboard|home/i.test(text)) {
    actions.push({ kind: "navigate", path: "/dashboard", label: "Go to Dashboard" });
  }
  if (/project list|all projects|projects$/i.test(text)) {
    actions.push({ kind: "navigate", path: "/projects", label: "Go to Projects" });
  }
  if (/backend|gpu|compute|dstack/i.test(text)) {
    actions.push({ kind: "navigate", path: "/backends", label: "Go to Compute Backends" });
  }

  if (actions.length === 0) {
    actions.push({ kind: "unknown", label: "I couldn't infer an action — try: 'train a classifier on Qwen 1.5B for 5 epochs'." });
  }

  return {
    intent: actions[0].kind,
    actions,
    rationale: `Parsed ${actions.length} step${actions.length > 1 ? "s" : ""} from your request.`,
  };
}
