/**
 * Pluggable evaluation judges + failure-cluster generator.
 * Inspired by Oumi's evaluation workflow (judges + recurring failure patterns).
 */
import type { Project } from "@/types";

export type JudgeId = "exact-match" | "llm-judge" | "regex" | "json-schema";

export interface Judge {
  id: JudgeId;
  name: string;
  description: string;
}

export const judges: Judge[] = [
  { id: "exact-match", name: "Exact Match",       description: "String equality after normalization." },
  { id: "llm-judge",   name: "LLM-as-Judge",      description: "A larger teacher model grades each response." },
  { id: "regex",       name: "Regex",             description: "Match expected pattern in the response." },
  { id: "json-schema", name: "JSON Schema",       description: "Validate structured output against a JSON schema." },
];

export interface FailureCluster {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  count: number;
  examplePrompt: string;
  expected: string;
  actual: string;
}

function seeded(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  let s = Math.abs(h) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const CLUSTER_TEMPLATES: Omit<FailureCluster, "id" | "count">[] = [
  {
    label: "Off-topic refusal",
    severity: "high",
    examplePrompt: "Summarize the customer ticket #4821.",
    expected: "Brief 2-sentence summary.",
    actual: "I cannot help with that request.",
  },
  {
    label: "Hallucinated fields",
    severity: "high",
    examplePrompt: "Extract invoice line items from the PDF text.",
    expected: '[{"sku":"A1","qty":2}]',
    actual: '[{"sku":"A1","qty":2,"discount":"15%"}]',
  },
  {
    label: "Verbose output",
    severity: "medium",
    examplePrompt: "Classify sentiment: 'great product, fast shipping'",
    expected: "positive",
    actual: "I think this customer is overall positive because…",
  },
  {
    label: "Wrong language",
    severity: "medium",
    examplePrompt: "Reply in Thai: 'Order arrived damaged.'",
    expected: "ขออภัยในความไม่สะดวกครับ…",
    actual: "We're sorry for the inconvenience…",
  },
  {
    label: "Missing required field",
    severity: "low",
    examplePrompt: "Return JSON with name + email.",
    expected: '{"name":"…","email":"…"}',
    actual: '{"name":"…"}',
  },
];

export function getFailureClusters(project: Project): FailureCluster[] {
  const rand = seeded(project.id);
  const n = 2 + Math.floor(rand() * 3);
  const pool = [...CLUSTER_TEMPLATES].sort(() => rand() - 0.5).slice(0, n);
  return pool.map((c, i) => ({
    ...c,
    id: `${project.id}-cluster-${i}`,
    count: 1 + Math.floor(rand() * 18),
  }));
}
