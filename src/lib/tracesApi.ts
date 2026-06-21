/**
 * Traces → Synthetic Dataset pipeline (frontend prototype, localStorage backed).
 * Inspired by distil labs' "prompt + production traces → SLM" flow.
 */
import { generateSynthetic, type SyntheticDataset } from "@/lib/syntheticDataset";

const KEY = "slm.traces.v1";

export interface TraceBundle {
  id: string;
  name: string;
  source: "upload" | "paste";
  rowCount: number;
  sampleBytes: number;
  createdAt: string;
  systemPrompt?: string;
  /** Raw uploaded/pasted text — used to seed real synthetic generation. */
  rawText?: string;
  generatedDatasetId?: string;
  generatedDatasetSize?: number;
  generatedAt?: string;
}

function read(): TraceBundle[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TraceBundle[]) : [];
  } catch {
    return [];
  }
}

function write(bundles: TraceBundle[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bundles));
  } catch {
    /* ignore */
  }
}

export function listTraces(): TraceBundle[] {
  return read().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function addTraceBundle(input: {
  name: string;
  source: "upload" | "paste";
  rowCount: number;
  sampleBytes: number;
  systemPrompt?: string;
  rawText?: string;
}): TraceBundle {
  // Cap stored raw text to ~64KB so we don't blow out localStorage
  const cappedRaw = input.rawText && input.rawText.length > 64_000
    ? input.rawText.slice(0, 64_000)
    : input.rawText;
  const bundle: TraceBundle = {
    id: `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input,
    rawText: cappedRaw,
  };
  const all = read();
  all.push(bundle);
  write(all);
  return bundle;
}

export function deleteTraceBundle(id: string) {
  write(read().filter((b) => b.id !== id));
}

/**
 * Generate a real synthetic dataset from the bundle's raw text and persist
 * the dataset id + size + quality eval back onto the bundle.
 */
export async function generateSyntheticDataset(
  bundleId: string,
): Promise<SyntheticDataset> {
  const all = read();
  const idx = all.findIndex((b) => b.id === bundleId);
  if (idx < 0) throw new Error("Trace bundle not found");
  const bundle = all[idx];

  const dataset = await generateSynthetic(bundleId, {
    bundleName: bundle.name,
    systemPrompt: bundle.systemPrompt,
    sourceText: bundle.rawText,
    multiplier: 20,
  });

  all[idx] = {
    ...bundle,
    generatedDatasetId: dataset.id,
    generatedDatasetSize: dataset.size,
    generatedAt: new Date().toISOString(),
  };
  write(all);
  return dataset;
}

/** Heuristic row counter for CSV/JSONL/text content. */
export function estimateRowCount(text: string): number {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.length;
}
