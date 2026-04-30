import { useEffect, useRef } from "react";
import { updateProject } from "@/lib/projectsApi";
import type { Project, ProjectStatus } from "@/types";

/**
 * Drives a realistic-looking progress simulation for prototype projects.
 * - When project status is `queued`, transitions to `training` after a short delay.
 * - While `training`, increments progress every `tickMs` until 100%, then marks `completed`.
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

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      try {
        // Read latest known state from closure-snapshot
        let current = project;
        // After first iteration we re-read from the latest update via callback chain;
        // to keep it simple, we mutate locally and persist.
        if (current.status === "queued") {
          const next = await updateProject(current.id, { status: "training", progress: 5 });
          if (cancelled) return;
          current = next;
          onUpdate(next);
        } else {
          const newProgress = Math.min(100, current.progress + stepPercent + Math.floor(Math.random() * 3));
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
        // swallow transient errors; loop will retry on next tick
      }
      timer = setTimeout(tick, tickMs);
    };

    timer = setTimeout(tick, tickMs);

    return () => {
      cancelled = true;
      runningRef.current = false;
      if (timer) clearTimeout(timer);
    };
    // We intentionally depend only on identity + status to avoid restarting on every tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, project?.status]);
}
