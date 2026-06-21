/**
 * Synthetic dataset generation + storage (frontend prototype).
 *
 * Given a trace bundle (raw prompt/response lines + optional system prompt),
 * we deterministically generate a larger fine-tuning dataset by:
 *   - Splitting trace lines into prompt/response pairs (heuristic JSONL/CSV/text)
 *   - Producing N paraphrased variants per original example
 *   - Running a quick quality pass: diversity, dup-rate, length stats
 *
 * In production this would call a Teacher LLM and a real eval pipeline.
 * Everything persists in localStorage so it survives refresh and can be
 * picked up by the New Project wizard.
 */

const KEY = "slm.syntheticDatasets.v1";

export interface SyntheticRow {
  prompt: string;
  response: string;
}

export interface DatasetQuality {
  diversity: number;        // 0..100 — unique-token ratio across prompts
  duplicateRate: number;    // 0..100 — % rows that are near-duplicates
  avgPromptTokens: number;
  avgResponseTokens: number;
  score: number;            // 0..100 — overall quality score
}

export interface SyntheticDataset {
  id: string;
  bundleId: string;
  name: string;
  size: number;
  createdAt: string;
  systemPrompt?: string;
  preview: SyntheticRow[];          // first 5 rows
  quality: DatasetQuality;
}

interface StoredDataset extends SyntheticDataset {
  rows?: SyntheticRow[];            // optional cached full rows (capped at 200)
}

function read(): StoredDataset[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredDataset[]) : [];
  } catch {
    return [];
  }
}

function write(items: StoredDataset[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* quota — ignore, this is a prototype */
  }
}

// --- deterministic RNG so the same bundle always yields the same dataset ---
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) >>> 0;
}
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// --- parse trace text into rough prompt/response pairs ---
function parseTraceLines(text: string, fallback: string): SyntheticRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: SyntheticRow[] = [];
  for (const line of lines) {
    // Try JSONL with {prompt,response} or {input,output} or {messages:[...]}
    if (line.startsWith("{")) {
      try {
        const obj = JSON.parse(line);
        const prompt = obj.prompt ?? obj.input ?? obj.question ?? obj.user ?? "";
        const response = obj.response ?? obj.output ?? obj.answer ?? obj.assistant ?? "";
        if (prompt || response) {
          rows.push({ prompt: String(prompt), response: String(response) });
          continue;
        }
      } catch {
        /* fall through */
      }
    }
    // CSV-ish "prompt","response"
    if (line.includes(",")) {
      const [p, ...rest] = line.split(",");
      rows.push({ prompt: p.replace(/^"|"$/g, ""), response: rest.join(",").replace(/^"|"$/g, "") });
      continue;
    }
    // Plain text — treat the line as prompt and fabricate a generic response
    rows.push({ prompt: line, response: fallback });
  }
  return rows.length
    ? rows
    : [{ prompt: "Summarize the customer's request.", response: fallback }];
}

const PARAPHRASE_PREFIXES = [
  "Please ",
  "Could you ",
  "I need help to ",
  "Quick question: ",
  "Task — ",
  "Help me ",
  "Can you ",
  "Kindly ",
];

const RESPONSE_HEDGES = [
  "Sure — ",
  "Here you go: ",
  "Of course. ",
  "Result: ",
  "Done. ",
  "",
];

function paraphrase(seed: () => number, row: SyntheticRow, variant: number): SyntheticRow {
  const p = PARAPHRASE_PREFIXES[Math.floor(seed() * PARAPHRASE_PREFIXES.length)];
  const h = RESPONSE_HEDGES[Math.floor(seed() * RESPONSE_HEDGES.length)];
  return {
    prompt: `${p}${row.prompt}`.trim() + (variant % 3 === 0 ? "." : ""),
    response: `${h}${row.response}`.trim(),
  };
}

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/\s+/).filter(Boolean);
}

function computeQuality(rows: SyntheticRow[]): DatasetQuality {
  const allPromptTokens = new Set<string>();
  let totalPromptTokens = 0;
  let totalResponseTokens = 0;
  const seen = new Set<string>();
  let dups = 0;
  for (const r of rows) {
    const pt = tokenize(r.prompt);
    const rt = tokenize(r.response);
    totalPromptTokens += pt.length;
    totalResponseTokens += rt.length;
    pt.forEach((t) => allPromptTokens.add(t));
    const key = r.prompt.slice(0, 60).toLowerCase();
    if (seen.has(key)) dups++;
    seen.add(key);
  }
  const diversity = totalPromptTokens === 0 ? 0 : Math.min(100, Math.round((allPromptTokens.size / totalPromptTokens) * 200));
  const duplicateRate = rows.length === 0 ? 0 : Math.round((dups / rows.length) * 100);
  const avgPromptTokens = rows.length ? Math.round(totalPromptTokens / rows.length) : 0;
  const avgResponseTokens = rows.length ? Math.round(totalResponseTokens / rows.length) : 0;
  // Overall: reward diversity & length balance, penalize duplicates
  const score = Math.max(
    0,
    Math.min(100, Math.round(diversity * 0.5 + Math.min(40, avgResponseTokens) + 30 - duplicateRate)),
  );
  return { diversity, duplicateRate, avgPromptTokens, avgResponseTokens, score };
}

export interface GenerateOptions {
  multiplier?: number;          // how many synthetic rows per source row
  sourceText?: string;          // raw trace text; if omitted, a fallback corpus is used
  bundleName: string;
  systemPrompt?: string;
}

export async function generateSynthetic(
  bundleId: string,
  opts: GenerateOptions,
): Promise<SyntheticDataset> {
  await new Promise((r) => setTimeout(r, 900));
  const multiplier = Math.max(2, opts.multiplier ?? 20);
  const fallbackResp = opts.systemPrompt
    ? `Following the system prompt: ${opts.systemPrompt.slice(0, 80)}`
    : "Acknowledged. Working on it now.";
  const sourceRows = parseTraceLines(opts.sourceText ?? "", fallbackResp);
  const seed = rng(hashSeed(bundleId + "|" + opts.bundleName));
  const rows: SyntheticRow[] = [];
  for (const src of sourceRows) {
    for (let v = 0; v < multiplier; v++) {
      rows.push(paraphrase(seed, src, v));
    }
  }
  const quality = computeQuality(rows);
  const dataset: SyntheticDataset = {
    id: `ds_${Date.now().toString(36)}_${Math.floor(seed() * 1e6).toString(36)}`,
    bundleId,
    name: `${opts.bundleName} (synthetic)`,
    size: rows.length,
    createdAt: new Date().toISOString(),
    systemPrompt: opts.systemPrompt,
    preview: rows.slice(0, 5),
    quality,
  };
  const stored: StoredDataset = { ...dataset, rows: rows.slice(0, 200) };
  const all = read();
  all.push(stored);
  write(all);
  return dataset;
}

export function getSyntheticDataset(id: string): SyntheticDataset | null {
  return read().find((d) => d.id === id) ?? null;
}

export function listSyntheticDatasets(): SyntheticDataset[] {
  return read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function deleteSyntheticDataset(id: string) {
  write(read().filter((d) => d.id !== id));
}

// --- pass dataset to New Project wizard ---
const PREFILL_KEY = "synthetic-dataset-prefill";

export function setSyntheticPrefill(datasetId: string) {
  try {
    sessionStorage.setItem(PREFILL_KEY, datasetId);
  } catch {
    /* ignore */
  }
}

export function readSyntheticPrefill(consume = true): SyntheticDataset | null {
  try {
    const id = sessionStorage.getItem(PREFILL_KEY);
    if (!id) return null;
    if (consume) sessionStorage.removeItem(PREFILL_KEY);
    return getSyntheticDataset(id);
  } catch {
    return null;
  }
}
