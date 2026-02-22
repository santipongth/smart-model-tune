

# Phase 9: Advanced Platform Features (8 Features)

## Overview
เพิ่ม 8 ฟีเจอร์ใหม่ครอบคลุมทั้ง project management, model versioning, AI-assisted tuning, data tools, deployment, leaderboard, annotation และ onboarding

---

## Feature 1: Export/Import Projects

**What**: ผู้ใช้สามารถดาวน์โหลด project config เป็น JSON และนำเข้ากลับมาสร้าง project ใหม่ได้

**Changes**:
- **`src/pages/ProjectDetail.tsx`**: Add "Export JSON" button in header that downloads project config (name, taskType, baseModel, epochs, learningRate, datasetSize) as `.json` file using `URL.createObjectURL`
- **`src/pages/Projects.tsx`**: Add "Import Project" button that opens a file input dialog, reads JSON, validates schema with basic checks, and adds to the mock project list with toast confirmation
- **`src/i18n/translations.ts`**: Add ~8 keys for export/import labels in both languages

---

## Feature 2: Version History with Rollback

**What**: แสดง version history ของแต่ละ project พร้อมปุ่ม rollback ไปยัง version ก่อนหน้า

**Changes**:
- **`src/data/mockData.ts`**: Add `mockVersionHistory` data structure with 2-3 versions per completed project (version number, config snapshot, metrics, date, notes)
- **`src/pages/ProjectDetail.tsx`**: Add new "Versions" tab showing version list with config diff, metrics comparison, and "Rollback" button per version. Rollback updates local state with toast confirmation
- **`src/i18n/translations.ts`**: Add ~10 keys for version history labels

---

## Feature 3: Hyperparameter Auto-Tuning

**What**: แนะนำค่า hyperparameters ที่เหมาะสม (learning rate, epochs, batch size) ตามลักษณะ dataset

**Changes**:
- **`src/components/new-project/ConfigurationStep.tsx`**: Add "Auto-suggest" button that calculates recommended values based on dataset size and base model:
  - Small datasets (<1000): lower LR (1e-4), more epochs (8-10), smaller batch (8)
  - Medium (1000-5000): moderate LR (2e-4), 5 epochs, batch 16
  - Large (>5000): higher LR (3e-4), fewer epochs (3), batch 32
  - Show recommendations as highlighted badges with "Apply" button
- **`src/pages/ProjectDetail.tsx`**: Add "Tuning Suggestions" card in overview tab showing recommendations based on current config
- **`src/i18n/translations.ts`**: Add ~8 keys for auto-tuning labels

---

## Feature 4: Data Augmentation Tools

**What**: เครื่องมือสร้างข้อมูลเพิ่มเติมในหน้า Dataset Explorer (paraphrase, back-translation, synonym replacement)

**Changes**:
- **`src/pages/DatasetExplorer.tsx`**: Add new "Augmentation" tab with:
  - Technique selector: Paraphrase, Back-Translation (TH<>EN), Synonym Replacement, Random Insertion
  - Augmentation factor slider (2x - 5x)
  - Preview of augmented samples (mock generated)
  - "Apply Augmentation" button with progress indicator and toast
  - Stats card showing original vs augmented row counts
- **`src/data/datasetMockData.ts`**: Add mock augmented sample data
- **`src/i18n/translations.ts`**: Add ~12 keys for augmentation labels

---

## Feature 5: Model Deployment Dashboard

**What**: หน้า deploy โมเดลเป็น API endpoint พร้อม usage monitoring และ rate limiting

**Changes**:
- **`src/pages/Deployment.tsx`** (new): Full deployment dashboard with:
  - Deployed models list with status indicators (active/inactive/scaling)
  - Per-endpoint stats: requests/min, avg latency, error rate, uptime
  - Rate limiting config: requests/min limit, burst limit, throttle policy
  - Usage chart (recharts AreaChart) showing requests over time
  - One-click deploy/undeploy buttons with confirmation dialog
  - Endpoint URL display with copy button
- **`src/data/deploymentMockData.ts`** (new): Mock deployment data
- **`src/App.tsx`**: Add route `/deployment`
- **`src/components/dashboard/AppSidebar.tsx`**: Add "Deployment" nav item with Rocket icon
- **`src/i18n/translations.ts`**: Add ~20 keys for deployment labels

---

## Feature 6: Model Leaderboard

**What**: ตารางจัดอันดับโมเดลทั้งหมดข้าม project เรียงตาม metrics

**Changes**:
- **`src/pages/Leaderboard.tsx`** (new): Unified ranking page with:
  - Sortable table: rank, model name, project, base model, task type, accuracy, F1, latency, file size
  - Filter by task type
  - Sort by any metric column (click header to toggle asc/desc)
  - Medal icons for top 3 (gold, silver, bronze)
  - "View Model" and "Deploy" action buttons per row
  - Summary cards: total models, avg accuracy, best model highlight
- **`src/App.tsx`**: Add route `/leaderboard`
- **`src/components/dashboard/AppSidebar.tsx`**: Add "Leaderboard" nav item with Trophy icon
- **`src/i18n/translations.ts`**: Add ~15 keys for leaderboard labels

---

## Feature 7: Annotation Tool

**What**: เครื่องมือ labeling ข้อมูลสำหรับสร้าง training dataset ในตัว

**Changes**:
- **`src/pages/AnnotationTool.tsx`** (new): Data labeling interface with:
  - Text display area showing one sample at a time
  - Label buttons for classification tasks (configurable labels)
  - Entity highlighting for NER tasks (select text span + assign entity type)
  - Navigation: Previous/Next/Skip buttons with keyboard shortcuts (1-9 for labels, arrow keys for nav)
  - Progress bar showing annotated/total
  - Export annotations as JSON
  - Mock dataset of 20 unlabeled samples
  - Stats sidebar: label distribution pie chart, annotation speed
- **`src/App.tsx`**: Add route `/annotate`
- **`src/components/dashboard/AppSidebar.tsx`**: Add "Annotate" nav item with Tag icon
- **`src/i18n/translations.ts`**: Add ~15 keys for annotation labels

---

## Feature 8: Onboarding Tour

**What**: Interactive walkthrough ที่แนะนำ feature หลักของ platform ให้ผู้ใช้ใหม่

**Changes**:
- **`src/components/OnboardingTour.tsx`** (new): Tour overlay component with:
  - Step-by-step tooltip system highlighting UI elements
  - Steps: Welcome > Sidebar nav > New Project > Models > Playground > Analytics > Settings
  - Each step has title, description, and highlighted target area
  - Progress dots, Next/Skip/Done buttons
  - Semi-transparent backdrop with spotlight cutout effect using CSS
  - Auto-starts on first visit (checked via localStorage `onboarding-completed`)
  - "Restart Tour" button accessible from Settings
- **`src/components/dashboard/DashboardLayout.tsx`**: Mount `OnboardingTour` component
- **`src/pages/Settings.tsx`**: Add "Restart Onboarding Tour" button in Account tab
- **`src/i18n/translations.ts`**: Add ~20 keys for onboarding step text

---

## Implementation Order

1. **Export/Import** -- small change to existing pages
2. **Version History** -- extends ProjectDetail
3. **Hyperparameter Auto-Tuning** -- extends ConfigurationStep
4. **Data Augmentation** -- extends DatasetExplorer
5. **Leaderboard** -- new standalone page
6. **Model Deployment Dashboard** -- new page with charts
7. **Annotation Tool** -- new standalone page
8. **Onboarding Tour** -- overlay component, final polish

---

## Technical Notes

- All features are mock/client-side only -- no backend required
- New files: ~5 new page files + 1 mock data file + 1 component (OnboardingTour)
- Modified files: ~10 (App.tsx, AppSidebar.tsx, ProjectDetail, DatasetExplorer, ConfigurationStep, Projects, Settings, DashboardLayout, mockData, translations)
- Uses existing libraries: `recharts`, `framer-motion`, `lucide-react`, Radix UI
- JSON export uses `Blob` + `URL.createObjectURL` + `<a>` download pattern
- JSON import uses `<input type="file">` with `FileReader`
- Onboarding tour uses CSS `box-shadow` spotlight effect (no external tour library needed)
- Annotation tool keyboard shortcuts via `useEffect` + `keydown` listener
- All new text content will have both EN and TH translations (~108 new keys total)

