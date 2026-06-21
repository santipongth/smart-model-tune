# Competitor/OSS Feature Integration Plan

## What each reference contributes

**distil labs** — "prompt + traces → SLM" loop. Strengths: CLI-first UX, synthetic data generation from production traces, cost framing (50–90% cheaper, 30–200× smaller), one-command deploy + invoke, Claude Code skill.

**Transformer Lab (lab.cloud + GitHub app)** — Research workbench. Strengths: experiments & job artifacts tracking, team workspaces, plugin/recipe ecosystem, **dstack** integration to run jobs on AWS/GCP/Azure/Runpod/Lambda/Kubernetes/on-prem from one UI, model zoo browser, interactive chat/eval playground.

**Oumi** — End-to-end lifecycle (dataset → eval → train → deploy) with an **Oumi Agent** (natural-language ML workflows), distillation recipes, model evaluation with failure-pattern analysis, free-credits cloud + OSS framework, judges/benchmarks.

## Features to integrate (ranked by impact / fit)

### Tier 1 — High impact, fits current UI

1. **Trace-to-Dataset pipeline** (distil labs)
  - New page **Traces**: upload JSONL/CSV of production prompts+responses, or paste cURL traces.
  - "Generate synthetic dataset" action → mock job that produces a new Dataset row, linked to the source trace bundle.
  - Adds `traceId` to Project model; New Project wizard gets a "Start from traces" option alongside existing dataset pickers.
2. **Experiments & Runs tracking** (Transformer Lab)
  - Extend current Training History into a full **Experiments** tab: compare runs side-by-side (loss curves, eval metrics, hyperparams, dataset version, base model).
  - Add "Promote run → Version" action that creates a Version entry from any historical run.
3. **Evaluation Suite with failure patterns** (Oumi)
  - Enhance Evaluation tab: pluggable judges (exact-match, LLM-as-judge mock, regex, JSON-schema).
  - Failure clustering view: list recurring error categories with sample I/O, severity, and "add to training set" action that feeds back into Datasets.
4. **Compute Backend selector** (Transformer Lab × dstack)
  - In New Project + Settings: pick **Compute Backend** (Lovable Cloud demo / AWS / GCP / Runpod / Lambda / On-prem SSH / Kubernetes). UI only, stored per project, surfaced as a badge in Project Detail and Monitor.
  - Backend Settings page to register mock credentials/regions and show estimated $/hr per GPU.

### Tier 2 — Differentiators

5. **AI Agent / NL workflow console** (Oumi Agent)
  - Floating "Ask the SLM Agent" panel: natural-language commands → suggested wizard actions ("train a classifier on dataset X for 3 epochs on A100"). Mock LLM-backed via Lovable AI Gateway; renders an action plan the user confirms; clicking executes existing flows.

## Technical notes

- All work stays **frontend + mock data**, consistent with current architecture (`mem://architecture/implementation-status`). New libs under `src/lib/`, hooks under `src/hooks/`, pages under `src/pages/`, components grouped by feature.
- Reuse `useTrainingSimulator`, `trainingHistory`, and `apiKeysApi` patterns; no schema changes required unless we light up Lovable Cloud.
- Add i18n keys (EN/TH) for every new surface; run `scripts/check-i18n.mjs --strict` after each batch.
- Add RTL tests for new dialogs/pages following the `Projects.test.tsx` pattern.

---

**Decision needed:** implement Tier 1 and Tier 2