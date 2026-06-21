import { useEffect, useRef } from "react";
import { updateProject } from "@/lib/projectsApi";
import { getProjectBackend } from "@/lib/computeBackends";
import type { Project, ProjectStatus } from "@/types";

/**
 * Drives a realistic-looking progress simulation for prototype projects.
 * - When project status is `queued`, transitions to `training` after a short delay.
 * - While `training`, increments progress every `tickMs` until 100%, then marks `completed`.
 * - Tick speed is modulated by the project's selected compute backend so faster
 *   GPU clouds visibly advance faster than self-hosted defaults.
 * - All updates persist via projectsApi so they survive refresh and reflect across views.
 *
 * Real backend integration: replace this hook with WebSocket/SSE subscription
 * to the training service that pushes (status, progress, currentEpoch) events.
 */
export function useTrainingSimulator(
  project: Project | null,
  onUpdate: (next: Project) => void,
  options: { tickMs?: number; stepPercent?: number } = {},
) {
  const { tickMs = 2000, stepPercent = 4 } = options;
  const runningRef = useRef(false);

  useEffect(() => {
    if (!project) return;
    const shouldRun: ProjectStatus[] = ["queued", "training"];
    if (!shouldRun.includes(project.status)) return;
    if (runningRef.current) return;
    runningRef.current = true;

    const backend = getProjectBackend(project.id);
    // Faster backend → shorter tick & larger step (capped)
    const effectiveTick = Math.max(600, Math.round(tickMs / backend.speed));
    const effectiveStep = Math.min(12, Math.round(stepPercent * backend.speed));

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      try {
        let current = project;
        if (current.status === "queued") {
          const next = await updateProject(current.id, { status: "training", progress: 5 });
          if (cancelled) return;
          current = next;
          onUpdate(next);
        } else {
          const newProgress = Math.min(100, current.progress + effectiveStep + Math.floor(Math.random() * 3));
          const newStatus: ProjectStatus = newProgress >= 100 ? "completed" : "training";
          const next = await updateProject(current.id, {
            progress: newProgress,
            status: newStatus,
            ...(newStatus === "completed" ? { creditsCost: Math.max(current.creditsCost, 50 + Math.floor(Math.random() * 80)) } : {}),
          });
          if (cancelled) return;
          onUpdate(next);
          if (newStatus === "completed") {
            runningRef.current = false;
            return;
          }
        }
      } catch {
        /* swallow transient errors; loop will retry on next tick */
      }
      timer = setTimeout(tick, effectiveTick);
    };

    timer = setTimeout(tick, effectiveTick);

    return () => {
      cancelled = true;
      runningRef.current = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, project?.status]);
}
