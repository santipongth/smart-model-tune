# Phase 10: 6 ฟีเจอร์ใหม่สำหรับ SLM Studio

จาก codebase ปัจจุบันมี 20 หน้าครอบคลุมวงจร fine-tuning ตั้งแต่ต้นจนจบแล้ว ผมเสนอ 6 ฟีเจอร์ใหม่ แบ่งเป็น 4 หมวด เรียงตาม impact/effort

---

## หมวด A: Productivity & Workflow (ใช้บ่อย, effort ต่ำ)

### 1. Project Templates Marketplace ⭐ แนะนำมากที่สุด

**ทำอะไร**: หน้า `/templates` รวม template โปรเจกต์สำเร็จรูป เช่น "Thai Customer Support Classifier", "Invoice OCR Extractor", "Function Calling Agent" — กดปุ่มเดียวสร้างโปรเจกต์ใหม่พร้อม config + dataset ตัวอย่าง  
**คุณค่า**: ลดเวลา onboarding ของผู้ใช้ใหม่ จาก 15 นาที → 30 วินาที  
**ไฟล์**: `src/pages/Templates.tsx`, `src/data/templatesMockData.ts`  
**ขยายของเดิม**: มี `TemplateLibrary.tsx` อยู่แล้วใน new-project — ยกระดับเป็นหน้า full page พร้อม category, rating, fork count

### 2. Pinned/Favorite Projects + Tags

**ทำอะไร**: ปักหมุด project สำคัญขึ้นบนสุด, ติด tag สี (`production`, `experiment`, `client-A`) filter ได้
**คุณค่า**: จัดระเบียบงานในทีม
**ไฟล์**: เพิ่ม `pinned: boolean`, `tags: string[]` ใน types/Project + UI ใน ProjectCard

---

## หมวด B: AI-Assisted Intelligence (สร้างความแตกต่าง)

### 3. AI Dataset Quality Analyzer ⭐

**ทำอะไร**: หน้า `/datasets` เพิ่มแท็บ "Quality Report" — วิเคราะห์ class imbalance, duplicate rows, missing labels, outliers, text length distribution พร้อม **AI suggestions** ("คุณมีข้อมูล class A เพียง 3% — แนะนำให้ทำ oversampling หรือเพิ่มข้อมูล")
**คุณค่า**: ป้องกันการเทรนโมเดลด้วยข้อมูลคุณภาพต่ำ → ประหยัดเครดิต
**ไฟล์**: `src/components/dataset/QualityReport.tsx`

### 4. Training Failure Diagnostician

**ทำอะไร**: เมื่อ training job `failed` ระบบวิเคราะห์ log อัตโนมัติแล้วแสดงสาเหตุที่น่าจะเป็น + แนะนำวิธีแก้ ("Loss = NaN at epoch 2 — น่าจะเกิดจาก learning rate สูงเกินไป ลองปรับเป็น 1e-4")
**คุณค่า**: ลด support tickets, ผู้ใช้แก้เองได้
**ไฟล์**: เพิ่ม `DiagnosticPanel.tsx` ใน TrainingMonitor

### 5. Smart Prompt Optimizer (สำหรับ Playground)

**ทำอะไร**: ใน Playground มีปุ่ม "✨ Optimize Prompt" — AI ช่วยปรับ system prompt ให้ดีขึ้น แสดง before/after พร้อม metrics
**คุณค่า**: ผู้ใช้ที่ไม่ใช่ ML engineer ก็ใช้ได้ดี
**ไฟล์**: เพิ่มในหน้า `Playground.tsx`

---



---

## หมวด D: Advanced ML Features

### 6. A/B Testing Framework สำหรับ Deployed Models ⭐

**ทำอะไร**: ใน Deployment ตั้ง traffic split ระหว่าง 2 model versions (เช่น 80% v3, 20% v4) ดู metrics เปรียบเทียบ real-time แล้วกด "Promote" ตัวที่ดีกว่า  
**คุณค่า**: deploy โมเดลใหม่ได้อย่างปลอดภัย ไม่เสี่ยง production down  
**ไฟล์**: เพิ่มแท็บใน `Deployment.tsx`

---

## ให้เริ่มทำตั้งแต่ **ตัวเลือก A, ตัวเลือก B, ตัวเลือก C, ตัวเลือก D รวมเป็น** 6 ฟีเจอร์ใหม่ 