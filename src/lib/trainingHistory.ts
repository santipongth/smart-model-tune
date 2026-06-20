import type { Project, ProjectStatus } from "@/types";

export interface TrainingRun {
  id: string;
  runNumber: number;
  status: ProjectStatus;
  progress: number;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  epochs: number;
  isCurrent: boolean;
}

// Deterministic seeded RNG so the history stays stable per project
function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Build a synthetic but stable list of recent training runs for a project.
 * The most recent run (index 0) mirrors the project's live status/progress;
 * earlier runs are completed/failed historical attempts.
 */
export function getTrainingHistory(project: Project): TrainingRun[] {
  const seed = hashSeed(project.id);
  const rand = seededRand(seed);
  const runCount = 2 + (seed % 3); // 2–4 historical runs
  const nowMs = new Date(project.updatedAt).getTime();
  const runs: TrainingRun[] = [];

  // Current run (latest) — reflects live project state
  const currentStart = new Date(project.createdAt).getTime();
  const currentFinished =
    project.status === "completed" || project.status === "failed"
      ? new Date(project.updatedAt).toISOString()
      : null;
  runs.push({
    id: `${project.id}-run-current`,
    runNumber: runCount,
    status: project.status,
    progress: project.progress,
    startedAt: new Date(currentStart).toISOString(),
    finishedAt: currentFinished,
    durationMs: currentFinished
      ? new Date(currentFinished).getTime() - currentStart
      : null,
    epochs: project.epochs,
    isCurrent: true,
  });

  // Historical runs going backwards in time
  let cursor = currentStart;
  for (let i = runCount - 1; i >= 1; i--) {
    const gap = (1 + Math.floor(rand() * 3)) * 24 * 60 * 60 * 1000; // 1–3 days apart
    const duration = (5 + Math.floor(rand() * 55)) * 60 * 1000; // 5–60 min
    const finishedAt = cursor - gap;
    const startedAt = finishedAt - duration;
    const failed = rand() < 0.25;
    runs.push({
      id: `${project.id}-run-${i}`,
      runNumber: i,
      status: failed ? "failed" : "completed",
      progress: failed ? Math.floor(rand() * 70) + 10 : 100,
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: new Date(finishedAt).toISOString(),
      durationMs: duration,
      epochs: project.epochs,
      isCurrent: false,
    });
    cursor = startedAt;
  }

  void nowMs;
  return runs;
}

export function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 60) return sec ? `${min}m ${sec}s` : `${min}m`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin ? `${hr}h ${remMin}m` : `${hr}h`;
}
