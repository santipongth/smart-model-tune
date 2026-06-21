/**
 * Pluggable evaluation judges + failure-cluster generator.
 * Inspired by Oumi's evaluation workflow (judges + recurring failure patterns).
 *
 * `runEvaluation` simulates dispatching the eval suite to the selected compute
 * backend: it produces an overall score, per-judge sample counts, the failure
 * clusters that fired, and a short auto-summary. Latest run per project is
 * persisted to localStorage so the Evaluation tab can render it on revisit.
 */
import type { Project } from "@/types";
import { getProjectBackend } from "@/lib/computeBackends";

export type JudgeId = "exact-match" | "llm-judge" | "regex" | "json-schema";

export interface Judge {
  id: JudgeId;
  name: string;
  description: string;
}

export const judges: Judge[] = [
  { id: "exact-match", name: "Exact Match",  description: "String equality after normalization." },
  { id: "llm-judge",   name: "LLM-as-Judge", description: "A larger teacher model grades each response." },
  { id: "regex",       name: "Regex",        description: "Match expected pattern in the response." },
  { id: "json-schema", name: "JSON Schema",  description: "Validate structured output against a JSON schema." },
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
  { label: "Off-topic refusal", severity: "high", examplePrompt: "Summarize the customer ticket #4821.", expected: "Brief 2-sentence summary.", actual: "I cannot help with that request." },
  { label: "Hallucinated fields", severity: "high", examplePrompt: "Extract invoice line items from the PDF text.", expected: '[{"sku":"A1","qty":2}]', actual: '[{"sku":"A1","qty":2,"discount":"15%"}]' },
  { label: "Verbose output", severity: "medium", examplePrompt: "Classify sentiment: 'great product, fast shipping'", expected: "positive", actual: "I think this customer is overall positive because…" },
  { label: "Wrong language", severity: "medium", examplePrompt: "Reply in Thai: 'Order arrived damaged.'", expected: "ขออภัยในความไม่สะดวกครับ…", actual: "We're sorry for the inconvenience…" },
  { label: "Missing required field", severity: "low", examplePrompt: "Return JSON with name + email.", expected: '{"name":"…","email":"…"}', actual: '{"name":"…"}' },
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

// ─────────────────────────────────────────────────────────────────────────────
// Evaluation runs
// ─────────────────────────────────────────────────────────────────────────────

export interface EvaluationRun {
  id: string;
  projectId: string;
  judgeId: JudgeId;
  judgeName: string;
  backendName: string;
  samples: number;
  passed: number;
  failed: number;
  score: number;            // 0..100
  durationMs: number;
  clusters: FailureCluster[];
  summary: string;
  ranAt: string;
}

const RUNS_KEY = "slm.evaluationRuns.v1";

function readRuns(): Record<string, EvaluationRun> {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, EvaluationRun>) : {};
  } catch {
    return {};
  }
}

function writeRuns(map: Record<string, EvaluationRun>) {
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function getLatestRun(projectId: string): EvaluationRun | null {
  return readRuns()[projectId] ?? null;
}

export function clearLatestRun(projectId: string) {
  const map = readRuns();
  delete map[projectId];
  writeRuns(map);
}

function buildSummary(run: Omit<EvaluationRun, "summary">): string {
  const passPct = Math.round((run.passed / Math.max(1, run.samples)) * 100);
  const top = [...run.clusters].sort((a, b) => b.count - a.count)[0];
  const tone =
    run.score >= 85 ? "Strong performance" :
    run.score >= 70 ? "Solid baseline" :
    run.score >= 55 ? "Mixed results" :
    "Needs improvement";
  const clusterLine = top
    ? ` Top failure pattern: "${top.label}" (${top.count} cases, ${top.severity}).`
    : " No recurring failure clusters detected.";
  return `${tone} — ${run.judgeName} judged ${run.samples} samples on ${run.backendName}; ${passPct}% pass rate (score ${run.score}/100).${clusterLine}`;
}

export interface RunProgress {
  step: string;
  pct: number;
}

/**
 * Simulates running the evaluation suite. Calls `onProgress` periodically and
 * returns once the run is "complete". The result is persisted as the latest
 * run for the project so it survives navigation/refresh.
 */
export async function runEvaluation(
  project: Project,
  judgeId: JudgeId,
  onProgress?: (p: RunProgress) => void,
): Promise<EvaluationRun> {
  const judge = judges.find((j) => j.id === judgeId) ?? judges[0];
  const backend = getProjectBackend(project.id);
  const rand = seeded(project.id + judgeId + Date.now().toString(36));

  const steps = [
    { step: "Provisioning judge", pct: 10 },
    { step: "Loading eval set", pct: 25 },
    { step: "Scoring samples", pct: 60 },
    { step: "Clustering failures", pct: 85 },
    { step: "Finalizing", pct: 100 },
  ];

  // Faster backends finish quicker
  const tick = Math.max(180, Math.round(420 / backend.speed));
  for (const s of steps) {
    onProgress?.(s);
    await new Promise((r) => setTimeout(r, tick));
  }

  const samples = 80 + Math.floor(rand() * 220);
  // Judge type biases pass rate slightly
  const basePass = judgeId === "exact-match" ? 0.72 : judgeId === "regex" ? 0.78 : judgeId === "json-schema" ? 0.81 : 0.86;
  const passRate = Math.min(0.98, Math.max(0.45, basePass + (rand() - 0.5) * 0.2));
  const passed = Math.round(samples * passRate);
  const failed = samples - passed;
  const clusters = getFailureClusters(project);
  const score = Math.round(passRate * 100);
  const durationMs = tick * steps.length;

  const partial: Omit<EvaluationRun, "summary"> = {
    id: `eval_${Date.now().toString(36)}_${Math.floor(rand() * 1e6).toString(36)}`,
    projectId: project.id,
    judgeId,
    judgeName: judge.name,
    backendName: backend.name,
    samples,
    passed,
    failed,
    score,
    durationMs,
    clusters,
    ranAt: new Date().toISOString(),
  };
  const run: EvaluationRun = { ...partial, summary: buildSummary(partial) };

  const map = readRuns();
  map[project.id] = run;
  writeRuns(map);
  return run;
}
