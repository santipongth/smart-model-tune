/**
 * Compute backend registry — inspired by Transformer Lab's dstack integration.
 * Lets users target one of several execution environments per project.
 * Frontend-only: selection is stored in localStorage keyed by project id.
 *
 * Each backend exposes a `speed` multiplier that affects how fast the training
 * simulator advances — managed GPU clouds run faster than self-hosted defaults.
 */
export type ComputeBackendId =
  | "lovable-cloud"
  | "aws"
  | "gcp"
  | "azure"
  | "runpod"
  | "lambda"
  | "kubernetes"
  | "on-prem-ssh";

export interface ComputeBackend {
  id: ComputeBackendId;
  name: string;
  vendor: string;
  /** Indicative price per GPU-hour (USD) for the platform's recommended SKU. */
  pricePerHour: number;
  gpuSku: string;
  managed: boolean;
  /** Higher = faster progress per simulator tick. 1.0 = baseline. */
  speed: number;
}

export const computeBackends: ComputeBackend[] = [
  { id: "lovable-cloud", name: "Lovable Cloud", vendor: "Lovable",     pricePerHour: 0,    gpuSku: "Shared A10",  managed: true,  speed: 1.0 },
  { id: "aws",           name: "AWS",           vendor: "Amazon",      pricePerHour: 3.06, gpuSku: "g5.2xlarge",  managed: true,  speed: 1.4 },
  { id: "gcp",           name: "GCP",           vendor: "Google",      pricePerHour: 2.93, gpuSku: "A2 highgpu",  managed: true,  speed: 1.5 },
  { id: "azure",         name: "Azure",         vendor: "Microsoft",   pricePerHour: 3.20, gpuSku: "NC A100",     managed: true,  speed: 1.6 },
  { id: "runpod",        name: "Runpod",        vendor: "Runpod",      pricePerHour: 1.89, gpuSku: "A100 80GB",   managed: true,  speed: 1.8 },
  { id: "lambda",        name: "Lambda Labs",   vendor: "Lambda",      pricePerHour: 1.29, gpuSku: "A10 24GB",    managed: true,  speed: 1.3 },
  { id: "kubernetes",    name: "Kubernetes",    vendor: "Self-hosted", pricePerHour: 0,    gpuSku: "Cluster",     managed: false, speed: 0.9 },
  { id: "on-prem-ssh",   name: "On-prem (SSH)", vendor: "Self-hosted", pricePerHour: 0,    gpuSku: "Bare metal",  managed: false, speed: 0.7 },
];

const KEY = "slm.computeBackend.v1";

function read(): Record<string, ComputeBackendId> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, ComputeBackendId>) : {};
  } catch {
    return {};
  }
}

function write(map: Record<string, ComputeBackendId>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function getProjectBackend(projectId: string): ComputeBackend {
  const map = read();
  const id = map[projectId] ?? map.__default__ ?? "lovable-cloud";
  return computeBackends.find((b) => b.id === id) ?? computeBackends[0];
}

export function setProjectBackend(projectId: string, id: ComputeBackendId) {
  const map = read();
  map[projectId] = id;
  write(map);
}

export function getDefaultBackend(): ComputeBackend {
  const map = read();
  const id = map.__default__ ?? "lovable-cloud";
  return computeBackends.find((b) => b.id === id) ?? computeBackends[0];
}

export function setDefaultBackend(id: ComputeBackendId) {
  const map = read();
  map.__default__ = id;
  write(map);
}

/**
 * Estimate the cost of a job given backend + progress + epochs.
 * Used in ProjectDetail's live status banner.
 */
export function estimateJobCost(backend: ComputeBackend, progress: number, epochs: number): number {
  if (backend.pricePerHour === 0) return 0;
  // Baseline: 100% progress on 5 epochs ≈ 30 min on baseline GPU
  const fullHours = (epochs / 5) * 0.5 / backend.speed;
  return Number((backend.pricePerHour * fullHours * (progress / 100)).toFixed(2));
}
