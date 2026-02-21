

# Phase 8: Platform Feature Expansion

## Status Check - Already Implemented
The following features from the request are already in the codebase:
- **Loading Skeletons**: DashboardSkeleton, ProjectCardSkeleton, ModelCardSkeleton, TrainingMonitorSkeleton all exist with simulated loading states
- **Notification Center**: Bell icon with popover dropdown, unread badge, mark-as-read functionality already in DashboardLayout header
- **Landing Scroll Animations**: HeroSection, FeaturesSection, PricingSection, DemoSection, UseCasesSection, Footer all have framer-motion whileInView animations

## New Features to Implement (6 items)

---

### Feature 1: Responsive Mobile Layout

**What**: Adjust all dashboard pages, sidebar, header, and landing page for smooth mobile usage.

**Changes**:
- **`src/components/landing/Navbar.tsx`**: Add mobile hamburger menu with Sheet/Drawer for nav links; hide desktop nav on small screens
- **`src/components/dashboard/DashboardLayout.tsx`**: Reduce header padding on mobile; ensure sidebar collapses properly on small screens
- **`src/pages/Dashboard.tsx`**: Stack quick action buttons vertically on mobile
- **`src/pages/Settings.tsx`**: Change TabsList from `grid-cols-5` to scrollable horizontal tabs on mobile; stack form inputs vertically
- **`src/pages/Playground.tsx`**: Force single-column chat layout on mobile regardless of A/B mode
- **`src/pages/ProjectDetail.tsx`**: Stack config/status cards vertically on small screens (already uses `md:grid-cols-2`)
- **`src/pages/TrainingMonitor.tsx`**: Adjust stat cards grid from `grid-cols-4` to `grid-cols-2` on mobile (already done)
- **`src/components/landing/HeroSection.tsx`**: Reduce heading size, stack buttons vertically on mobile
- **`src/components/landing/PricingSection.tsx`**: Single-column pricing cards on mobile

---

### Feature 2: Usage Analytics Dashboard

**What**: New page with charts showing API calls, latency, error rate over selectable time ranges.

**Changes**:
- **`src/pages/Analytics.tsx`** (new): Full analytics page with:
  - Time range selector (24h, 7d, 30d, 90d)
  - Summary stat cards: Total API Calls, Avg Latency, Error Rate, Uptime
  - Line chart: API calls over time (using recharts AreaChart)
  - Line chart: Latency (p50, p95, p99) over time
  - Bar chart: Error rate by endpoint
  - Table: Top endpoints by usage
  - All data is mock-generated based on selected time range
- **`src/data/analyticsMockData.ts`** (new): Mock data generators for API calls, latency, errors
- **`src/App.tsx`**: Add route `/analytics`
- **`src/components/dashboard/AppSidebar.tsx`**: Add "Analytics" nav item with BarChart3 icon

---

### Feature 3: Dataset Explorer

**What**: New page to preview uploaded datasets with schema detection, sample rows, and column statistics.

**Changes**:
- **`src/pages/DatasetExplorer.tsx`** (new):
  - Dataset selector dropdown (mock datasets from projects)
  - Schema tab: column name, type, nullable, unique count
  - Sample Data tab: first 10 rows displayed in a table
  - Statistics tab: per-column stats (min, max, mean, distribution for numeric; top values for categorical; text length stats for text)
  - Dataset overview card: row count, column count, file size, format
- **`src/data/datasetMockData.ts`** (new): Mock schema, sample rows, and statistics data for 3 datasets
- **`src/App.tsx`**: Add route `/datasets`
- **`src/components/dashboard/AppSidebar.tsx`**: Add "Datasets" nav item with Database icon

---

### Feature 4: Cost Calculator

**What**: Interactive calculator to estimate credits needed based on model size, dataset size, and training epochs.

**Changes**:
- **`src/pages/CostCalculator.tsx`** (new):
  - Base model selector (with parameter counts)
  - Dataset size input (slider: 100 to 50,000 samples)
  - Epochs input (slider: 1 to 20)
  - LoRA rank selector (8, 16, 32, 64)
  - Real-time credit estimate display with breakdown:
    - Data generation cost
    - Training compute cost
    - Evaluation cost
    - Total credits and approximate USD
  - Comparison card showing estimates for Free vs Pro vs Enterprise
  - "Start Project with This Config" button linking to /projects/new
- **`src/App.tsx`**: Add route `/calculator`
- **`src/components/dashboard/AppSidebar.tsx`**: Add "Cost Calculator" nav item with Calculator icon

---

### Feature 5: Model Comparison

**What**: Side-by-side comparison page for 2-3 trained models showing metrics, speed, and quality scores.

**Changes**:
- **`src/pages/ModelComparison.tsx`** (new):
  - Model selector: pick 2-3 models from dropdown
  - Comparison table: base model, task type, accuracy, F1, precision, recall, latency, file size, format
  - Radar chart (recharts RadarChart): overlay metrics for selected models
  - Bar chart: latency comparison
  - Winner badges per metric (highlight best value)
  - "Deploy Best Model" action button
- **`src/App.tsx`**: Add route `/models/compare`
- **`src/components/dashboard/AppSidebar.tsx`**: No sidebar change (accessed from Models page via button)
- **`src/pages/Models.tsx`**: Add "Compare Models" button linking to `/models/compare`

---

### Feature 6: Webhooks Management

**What**: Settings tab to configure webhook URLs for training events (complete, failed, etc.)

**Changes**:
- **`src/pages/Settings.tsx`**: Add new "Webhooks" tab with:
  - Add webhook form: URL input, event type multi-select (training.complete, training.failed, model.deployed, credit.low)
  - Webhook list: URL, events subscribed, status (active/paused), last triggered timestamp
  - Test webhook button (simulates POST with toast confirmation)
  - Delete webhook button
  - Secret signing key display (mock) for verification
  - TabsList updated from `grid-cols-5` to `grid-cols-6`

---

## Implementation Order

1. **Responsive Mobile** -- foundation for all other pages
2. **Usage Analytics** -- new page + mock data
3. **Dataset Explorer** -- new page + mock data
4. **Cost Calculator** -- new page (standalone logic)
5. **Model Comparison** -- new page with charts
6. **Webhooks** -- Settings tab addition

---

## Technical Notes

- All data is mock/client-side only (no backend required)
- Uses existing libraries: `recharts`, `framer-motion`, `lucide-react`, Radix UI components
- New files: ~7 new files (4 pages, 2 mock data files, 0 new components beyond pages)
- Modified files: ~6 files (App.tsx, AppSidebar.tsx, Settings.tsx, Models.tsx, Navbar.tsx, various pages for responsive)
- Charts use `recharts` (RadarChart, AreaChart, BarChart) already installed
- Responsive approach: Tailwind breakpoint utilities (`sm:`, `md:`, `lg:`) -- no new CSS needed
- Sheet component from `src/components/ui/sheet.tsx` used for mobile nav menu

