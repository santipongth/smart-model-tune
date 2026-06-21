/**
 * Traces → Synthetic Dataset pipeline (frontend prototype, localStorage backed).
 * Inspired by distil labs' "prompt + production traces → SLM" flow.
 */
const KEY = "slm.traces.v1";

export interface TraceBundle {
  id: string;
  name: string;
  source: "upload" | "paste";
  rowCount: number;
  sampleBytes: number;
  createdAt: string;
  systemPrompt?: string;
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
}): TraceBundle {
  const bundle: TraceBundle = {
    id: `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input,
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
 * Mock "synthetic data generation": multiplies trace rows ~20x and records the
 * resulting dataset id on the bundle. In production this would call a Teacher LLM.
 */
export async function generateSyntheticDataset(
  bundleId: string,
): Promise<{ datasetId: string; size: number }> {
  await new Promise((r) => setTimeout(r, 1200));
  const all = read();
  const idx = all.findIndex((b) => b.id === bundleId);
  if (idx < 0) throw new Error("Trace bundle not found");
  const bundle = all[idx];
  const datasetId = `ds_${Date.now().toString(36)}`;
  const size = Math.max(500, bundle.rowCount * 20);
  all[idx] = {
    ...bundle,
    generatedDatasetId: datasetId,
    generatedDatasetSize: size,
    generatedAt: new Date().toISOString(),
  };
  write(all);
  return { datasetId, size };
}

/** Heuristic row counter for CSV/JSONL/text content. */
export function estimateRowCount(text: string): number {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.length;
}
