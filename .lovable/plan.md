

# Thai Language Support (i18n)

## Overview
เพิ่มระบบสลับภาษาไทย/อังกฤษทั่วทั้งแอป โดยสร้าง i18n system ด้วย React Context พร้อมไฟล์แปลภาษา และปุ่มสลับภาษาใน header

---

## Approach
ใช้ React Context + custom hook (`useLanguage`) แทนการติดตั้ง library ภายนอก เพื่อให้ lightweight และควบคุมได้ง่าย ภาษาที่เลือกจะถูกบันทึกใน localStorage

---

## New Files

### 1. `src/i18n/translations.ts`
ไฟล์รวม dictionary สำหรับ 2 ภาษา (en, th) ครอบคลุมทุกหน้าหลัก:
- **Dashboard**: titles, stats labels, quick actions
- **Sidebar**: nav items (Dashboard, Projects, Models, Playground, Analytics, Datasets, Cost Calculator, API Keys, Settings)
- **Settings**: tab names, form labels, button text
- **Landing page**: hero text, features, pricing, CTA buttons
- **Navbar**: login, signup, nav links
- **Common**: Save, Cancel, Delete, Search, Loading, etc.
- **Notifications**: notification titles
- **Analytics, Datasets, Calculator, Model Comparison**: page-specific text

### 2. `src/i18n/LanguageContext.tsx`
- `LanguageProvider` component wrapping the app
- `useLanguage()` hook returning `{ language, setLanguage, t }` 
- `t(key)` function ที่รับ dot-notation key เช่น `t("dashboard.title")` แล้วคืนค่าข้อความตามภาษาปัจจุบัน
- เก็บค่าภาษาใน localStorage key `"app-language"`

### 3. `src/components/LanguageSwitcher.tsx`
- ปุ่มสลับภาษาขนาดเล็ก แสดง "EN" / "TH"
- ใช้ `Button` variant="ghost" size="sm"
- คลิกแล้วสลับระหว่าง en/th

---

## Modified Files

### 4. `src/App.tsx`
- ครอบ `LanguageProvider` รอบ app

### 5. `src/components/dashboard/DashboardLayout.tsx`
- เพิ่ม `LanguageSwitcher` ใน header ข้าง ThemeToggle

### 6. `src/components/landing/Navbar.tsx`
- เพิ่ม `LanguageSwitcher` ข้าง ThemeToggle

### 7. `src/components/dashboard/AppSidebar.tsx`
- แปลง nav item titles ให้ใช้ `t()` เช่น `t("nav.dashboard")`, `t("nav.projects")`
- แปล "Credits" และ "Plan" labels

### 8. `src/pages/Dashboard.tsx`
- ใช้ `t()` สำหรับ "Dashboard", "Overview of your fine-tuning workspace", quick action labels

### 9. `src/pages/Settings.tsx`
- แปล tab names, section titles, form labels, button text ทุก tab (API Keys, Team, Notifications, Webhooks, Account, Billing)

### 10. `src/components/landing/HeroSection.tsx`
- แปล headline, subtitle, CTA buttons

### 11. `src/components/landing/Navbar.tsx`
- แปล "Log in", "Get Started", nav links

### 12. `src/components/landing/PricingSection.tsx`
- แปล plan names, feature lists, CTA

### 13. `src/components/landing/FeaturesSection.tsx`
- แปล section title, feature cards

### 14. `src/components/CommandPalette.tsx`
- แปล placeholder text, group headings

### 15. `src/components/NotificationCenter.tsx`
- แปล notification titles, "Mark all as read", "Notifications" heading

---

## Translation Coverage

| Section | Keys (approx) |
|---------|---------------|
| Navigation/Sidebar | 12 |
| Dashboard | 8 |
| Settings (all tabs) | 40 |
| Landing page | 25 |
| Common/Shared | 15 |
| Analytics/Datasets/Calculator | 20 |
| **Total** | **~120 keys** |

---

## Technical Notes
- ไม่ต้องติดตั้ง dependency ใหม่ -- ใช้ React Context ล้วน
- ภาษาที่เลือกจะ persist ผ่าน localStorage
- Default language: English (en)
- `t()` function จะ fallback เป็น key name ถ้าไม่พบ translation
- New files: 3, Modified files: ~12

