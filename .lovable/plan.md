

# Phase 7: Platform Enhancement - 5 Features

## Overview
เพิ่มฟีเจอร์ 5 รายการเพื่อยกระดับ SLM Fine-Tuning Platform ให้สมบูรณ์ยิ่งขึ้น ครอบคลุมทั้ง UX, productivity, และ visual polish

---

## Feature 1: Dark Mode Toggle

**What**: เพิ่มปุ่มสลับ Dark/Light Mode ใน header ของ DashboardLayout และ landing Navbar พร้อมใช้ `next-themes` ที่ติดตั้งอยู่แล้ว

**Changes**:
- **`src/components/ThemeProvider.tsx`** (new): Wrapper component ใช้ `ThemeProvider` จาก `next-themes`
- **`src/components/ThemeToggle.tsx`** (new): ปุ่ม Sun/Moon icon สลับ theme
- **`src/App.tsx`**: ครอบ `ThemeProvider` รอบ app ทั้งหมด
- **`index.html`**: เพิ่ม `class="dark"` support บน `<html>` tag (เปลี่ยนเป็น `suppressHydrationWarning`)
- **`src/components/dashboard/DashboardLayout.tsx`**: เพิ่ม `ThemeToggle` ใน header bar
- **`src/components/landing/Navbar.tsx`**: เพิ่ม `ThemeToggle` ข้าง login buttons

Dark mode CSS variables ถูกกำหนดไว้ใน `index.css` แล้ว ไม่ต้องแก้ไข

---

## Feature 2: Global Search (Command Palette, Cmd+K)

**What**: Command palette ที่เปิดด้วย Cmd+K (หรือ Ctrl+K) ค้นหา projects, models, settings pages ได้ทันที ใช้ `cmdk` library ที่ติดตั้งอยู่แล้ว

**Changes**:
- **`src/components/CommandPalette.tsx`** (new):
  - ใช้ `CommandDialog` จาก `src/components/ui/command.tsx`
  - Listen keyboard shortcut Cmd+K / Ctrl+K
  - แบ่ง groups: Projects (6 items), Models (3 items), Pages (Dashboard/Settings/Playground), Quick Actions (New Project)
  - เมื่อเลือก item จะ `navigate()` ไปหน้านั้นๆ
- **`src/components/dashboard/DashboardLayout.tsx`**: เพิ่ม `CommandPalette` component และ search trigger button ใน header

---

## Feature 3: Loading Skeleton UI

**What**: Skeleton loading states สำหรับ Dashboard stats, Project cards, Model cards, Training monitor

**Changes**:
- **`src/components/skeletons/DashboardSkeleton.tsx`** (new): Skeleton สำหรับ 4 stat cards + chart area + recent projects
- **`src/components/skeletons/ProjectCardSkeleton.tsx`** (new): Skeleton card เลียนแบบ ProjectCard layout
- **`src/components/skeletons/ModelCardSkeleton.tsx`** (new): Skeleton card เลียนแบบ ModelCard layout
- **`src/components/skeletons/TrainingMonitorSkeleton.tsx`** (new): Skeleton สำหรับ pipeline + loss curve area

แต่ละ skeleton ใช้ `Skeleton` component จาก `src/components/ui/skeleton.tsx` ที่มีอยู่แล้ว

- **`src/pages/Dashboard.tsx`**: เพิ่ม simulated loading state (1.5s delay) แสดง `DashboardSkeleton` ก่อน render content จริง
- **`src/pages/Projects.tsx`**: เพิ่ม loading state แสดง grid ของ `ProjectCardSkeleton`
- **`src/pages/Models.tsx`**: เพิ่ม loading state แสดง grid ของ `ModelCardSkeleton`
- **`src/pages/TrainingMonitor.tsx`**: เพิ่ม loading state แสดง `TrainingMonitorSkeleton`

---

## Feature 4: Notification Center (Bell Icon Dropdown)

**What**: Bell icon ใน header ที่แสดง dropdown รายการ notifications แบบ real-time พร้อม unread badge และ mark as read

**Changes**:
- **`src/components/NotificationCenter.tsx`** (new):
  - Bell icon พร้อม unread count badge (red dot)
  - ใช้ `Popover` component แสดง dropdown
  - Mock notifications: training complete, credit warning, model deployed, team invite
  - แต่ละ notification มี icon, title, description, timestamp, read/unread state
  - ปุ่ม "Mark all as read"
  - คลิก notification เพื่อ mark as read
- **`src/components/dashboard/DashboardLayout.tsx`**: เพิ่ม `NotificationCenter` ใน header ข้าง ThemeToggle

---

## Feature 5: Landing Page Scroll Animations

**What**: เพิ่ม scroll-triggered animations สำหรับทุก section บน landing page ด้วย framer-motion `useInView` / `whileInView`

**Changes**:
- **`src/components/landing/HeroSection.tsx`**: เพิ่ม parallax-like effect ให้ terminal preview (translateY based on scroll), stagger delay ให้ badge > h1 > p > buttons
- **`src/components/landing/FeaturesSection.tsx`**: Heading fade-up เมื่อ scroll เข้า view, cards stagger with scale-in effect
- **`src/components/landing/UseCasesSection.tsx`**: Cards slide-up จากล่างพร้อม stagger delay, heading animate เข้ามาก่อน
- **`src/components/landing/PricingSection.tsx`**: Cards slide-up with stagger, "Most Popular" card มี scale bounce เล็กน้อย
- **`src/components/landing/DemoSection.tsx`**: Section fade-in เมื่อ scroll เข้า view, form area slide-up
- **`src/components/landing/Footer.tsx`**: Simple fade-in animation

ทุก animation ใช้ `viewport={{ once: true }}` เพื่อ animate ครั้งเดียว

---

## Implementation Order

1. **Dark Mode** - ThemeProvider + ThemeToggle (foundation สำหรับทุกอย่าง)
2. **Notification Center** - Bell icon ใน header
3. **Global Search** - Command Palette
4. **Loading Skeletons** - Skeleton components + loading states
5. **Landing Scroll Animations** - Enhanced landing page

---

## Technical Notes

- ใช้ libraries ที่ติดตั้งอยู่แล้วทั้งหมด: `next-themes`, `cmdk`, `framer-motion`, `lucide-react`
- Skeleton component มีอยู่แล้วใน `src/components/ui/skeleton.tsx`
- Command UI มีอยู่แล้วใน `src/components/ui/command.tsx`
- Popover UI มีอยู่แล้วใน `src/components/ui/popover.tsx`
- Dark mode CSS variables กำหนดไว้แล้วใน `index.css` ภายใต้ `.dark` class
- ไม่ต้องติดตั้ง dependencies เพิ่มเติม
- ไฟล์ใหม่ทั้งหมด ~8 files, แก้ไข ~12 files

