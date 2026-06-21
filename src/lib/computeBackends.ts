/**
 * Compute backend registry — inspired by Transformer Lab's dstack integration.
 * Lets users target one of several execution environments per project.
 * Frontend-only: selection is stored in localStorage keyed by project id.
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
}

export const computeBackends: ComputeBackend[] = [
  { id: "lovable-cloud", name: "Lovable Cloud", vendor: "Lovable", pricePerHour: 0,    gpuSku: "Shared A10",  managed: true  },
  { id: "aws",           name: "AWS",           vendor: "Amazon",  pricePerHour: 3.06, gpuSku: "g5.2xlarge",  managed: true  },
  { id: "gcp",           name: "GCP",           vendor: "Google",  pricePerHour: 2.93, gpuSku: "A2 highgpu",  managed: true  },
  { id: "azure",         name: "Azure",         vendor: "Microsoft", pricePerHour: 3.20, gpuSku: "NC A100",   managed: true  },
  { id: "runpod",        name: "Runpod",        vendor: "Runpod",  pricePerHour: 1.89, gpuSku: "A100 80GB",   managed: true  },
  { id: "lambda",        name: "Lambda Labs",   vendor: "Lambda",  pricePerHour: 1.29, gpuSku: "A10 24GB",    managed: true  },
  { id: "kubernetes",    name: "Kubernetes",    vendor: "Self-hosted", pricePerHour: 0, gpuSku: "Cluster",    managed: false },
  { id: "on-prem-ssh",   name: "On-prem (SSH)", vendor: "Self-hosted", pricePerHour: 0, gpuSku: "Bare metal", managed: false },
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
  const id = map[projectId] ?? "lovable-cloud";
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
