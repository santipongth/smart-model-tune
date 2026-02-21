

## Phase 2: Dashboard & Project Management

### สิ่งที่จะสร้าง

**1. Mock Data Layer** (`src/data/mockData.ts`)
- ข้อมูลจำลองสำหรับ Projects, Models, Training Jobs, Usage Stats, Credit Balance
- Types/Interfaces สำหรับทุก entity (`src/types/index.ts`)

**2. Dashboard Layout with Sidebar** (`src/components/dashboard/DashboardLayout.tsx`)
- ใช้ shadcn SidebarProvider + Sidebar component
- Sidebar แสดงเมนู: Dashboard, Projects, Models, Playground, API Keys, Settings
- แสดง Credit Balance และ Plan Tier (เช่น "Pro Plan - 850 credits") ที่ footer ของ sidebar
- SidebarTrigger ที่ header เพื่อ collapse/expand
- ใช้ NavLink สำหรับ active route highlighting

**3. หน้า Dashboard หลัก** (`src/pages/Dashboard.tsx`)
- **Stats Cards**: จำนวน Projects, Models trained, Training hours used, Credits remaining
- **Recent Projects**: ตารางแสดง 5 โปรเจกต์ล่าสุด พร้อมสถานะ (Training, Completed, Failed)
- **Training Activity Chart**: กราฟ Recharts แสดง training jobs ใน 7 วันที่ผ่านมา
- **Quick Actions**: ปุ่ม "New Project", "Browse Models", "Open Playground"

**4. หน้า Projects** (`src/pages/Projects.tsx`)
- รายการโปรเจกต์ทั้งหมดแบบ card grid
- แต่ละ card แสดง: ชื่อ, task type, base model, สถานะ, วันที่สร้าง
- ปุ่ม "New Project" เปิด dialog/wizard
- Filter/Search bar

**5. หน้า Project Detail** (`src/pages/ProjectDetail.tsx`)
- Overview tab: ข้อมูลโปรเจกต์, configuration, สถานะปัจจุบัน
- Training tab: progress bar, loss curve placeholder
- Evaluation tab: metrics placeholder

**6. หน้า Models** (`src/pages/Models.tsx`)
- รายการโมเดลที่ train เสร็จแล้ว
- แสดง: ชื่อโมเดล, base model, task type, accuracy, ขนาดไฟล์, วันที่สร้าง
- ปุ่ม Export, Deploy, Test in Playground

**7. Routing Update** (`src/App.tsx`)
- เพิ่ม routes: `/dashboard`, `/projects`, `/projects/:id`, `/models`
- Dashboard routes ใช้ DashboardLayout wrapper

---

### โครงสร้างไฟล์ใหม่

```text
src/
  types/
    index.ts              -- TypeScript interfaces
  data/
    mockData.ts           -- Mock data สำหรับทุกหน้า
  components/
    dashboard/
      DashboardLayout.tsx -- Layout with Sidebar
      AppSidebar.tsx      -- Sidebar component
      StatsCards.tsx       -- Dashboard stat cards
      RecentProjects.tsx  -- Recent projects table
      ActivityChart.tsx   -- Training activity chart
      ProjectCard.tsx     -- Project card component
      ModelCard.tsx       -- Model card component
      NewProjectDialog.tsx -- Create project dialog
  pages/
    Dashboard.tsx
    Projects.tsx
    ProjectDetail.tsx
    Models.tsx
```

### รายละเอียดทางเทคนิค

- ใช้ `SidebarProvider` ครอบ `DashboardLayout` เป็น wrapper สำหรับทุกหน้า dashboard
- Sidebar ใช้ `collapsible="icon"` เพื่อ collapse เหลือแค่ไอคอน
- `SidebarTrigger` อยู่ที่ header bar ด้านบนเท่านั้น (ไม่ซ้ำในตัว sidebar)
- ใช้ `NavLink` + `useLocation` สำหรับ active state
- Recharts `AreaChart` สำหรับ training activity
- Mock data ออกแบบให้ตรงกับ API response structure ที่จะใช้กับ FastAPI ในอนาคต
