# แผนยกระดับระบบให้พร้อมใช้งานจริง (Production Readiness)

## สรุปสถานะปัจจุบัน

ที่ **ต่อฐานข้อมูลจริงแล้ว**: auth (อีเมล + Google), profiles, projects, trained_models, datasets, deployed_endpoints, api_keys, api_call_events — มี RLS แยกตามผู้ใช้ครบ

ที่ยัง **เป็น mock / localStorage เท่านั้น**: Traces + Synthetic Dataset, Evaluation runs, Experiments/Tuning report, Training run history + progress (จำลองด้วย timer ในเบราว์เซอร์), Compute Backend, Templates, Leaderboard, A/B testing, Notifications, Playground inference, AI Agent (ใช้ heuristic ไม่ได้เรียก LLM จริง)

ช่องว่างระดับระบบ: ไม่มี edge function เลย, ไม่มี AI จริง, ไม่มี storage bucket (ไฟล์ที่อัปโหลดไม่ถูกเก็บ), ไม่มี realtime, ไม่มี error boundary, ไม่มี RBAC/ทีม, ไม่มี credit ledger, ไม่มี pagination, ไม่มี audit log

---

## Phase 1 — รากฐานที่ขาด (จำเป็นก่อนใช้งานจริง)

1. **Error boundary + หน้า fallback** ครอบทั้งแอป และครอบรายหน้า (route-level) กัน error หน้าเดียวทำแอปดับทั้งระบบ
2. **File Storage จริง** — สร้าง bucket `datasets` (private, RLS ตาม user) ให้ขั้นตอนอัปโหลดในวิซาร์ดเก็บไฟล์จริง แล้วเชื่อมกับแถวใน `datasets` (เพิ่มคอลัมน์ `storage_path`)
3. **ย้าย localStorage → ฐานข้อมูล** สร้างตารางจริงพร้อม RLS + GRANT: `traces`, `synthetic_datasets`, `evaluation_runs`, `experiments` (tuning trials), `training_runs` (+ `training_logs`), `project_backends`
4. **Pagination + ค้นหาฝั่งเซิร์ฟเวอร์** สำหรับ projects / models / datasets / api_call_events (cursor + `.range()`) แทนการดึงทั้งหมด
5. **Realtime** subscribe การเปลี่ยนแปลงของ `training_runs` / `projects` เพื่อให้ progress บน ProjectDetail และ Monitor อัปเดตจริงหลายแท็บ/หลายเครื่อง

## Phase 2 — ทำ AI และงานเทรนให้ทำงานจริงฝั่งเซิร์ฟเวอร์

6. **Edge functions** ชุดแรก (รันบน backend, ไม่ใช่เบราว์เซอร์):
   - `start-training` — validate → สร้าง `training_runs` → เดินสถานะเป็นระยะ (คงพฤติกรรมจำลองได้ แต่ย้ายมาอยู่เซิร์ฟเวอร์ ทำให้ปิดแท็บแล้วงานยังเดิน)
   - `run-evaluation` — คำนวณคะแนน + failure clusters เก็บลง `evaluation_runs`
   - `generate-synthetic-dataset` — ใช้ **Lovable AI** สร้างชุดข้อมูลจาก traces จริง แทน template แบบ deterministic
   - `agent-plan` — AI Agent console ให้ใช้ LLM จริง แปลภาษาธรรมชาติเป็น action plan
   - `inference` — Playground เรียกโมเดลผ่าน AI Gateway จริง แล้วบันทึกลง `api_call_events`
7. **จัดการ error ของ AI Gateway ให้ถูกต้อง** (402/403 = หยุดและแจ้งผู้ใช้, 429/5xx = retry แบบ backoff) พร้อมแสดงข้อความให้ผู้ใช้เข้าใจ
8. **บังคับใช้ rate limit / API key จริง** — edge function `endpoint-proxy` ตรวจ API key, นับ request ต่อนาที, บังคับ `rate_limit_per_min` / `burst_limit` ที่ปัจจุบันเป็นแค่ตัวเลขโชว์

## Phase 3 — ระบบผู้ใช้ระดับองค์กร

9. **RBAC** — enum `app_role` + ตาราง `user_roles` + ฟังก์ชัน `has_role()` (security definer) และหน้า Admin (ดูผู้ใช้/โควตา/สถานะระบบ)
10. **Teams / Workspaces** — `organizations`, `organization_members`, แชร์ project ในทีม, ปรับ RLS จาก "เจ้าของเท่านั้น" เป็น "สมาชิกองค์กร + บทบาท"
11. **Credits & Billing จริง** — ตาราง `credit_transactions` (ledger), หักเครดิตตอนเทรน/eval/inference, บล็อกงานเมื่อเครดิตหมด, เชื่อม Stripe สำหรับเติมเครดิต/แพ็กเกจ
12. **Notifications จริง** — ตาราง `notifications` + realtime, แจ้งเมื่อเทรนเสร็จ/ล้มเหลว/เครดิตต่ำ (ตอนนี้เป็น UI ล้วน)
13. **Audit log** — `audit_logs` บันทึก action สำคัญ (สร้าง/ลบ project, ออก API key, เปลี่ยน backend, deploy)

## Phase 4 — ความสมบูรณ์ของประสบการณ์ใช้งาน

14. **Model artifacts & versioning** — เก็บไฟล์โมเดลใน bucket `models`, ตาราง `model_versions`, ปุ่มดาวน์โหลด/rollback จริง
15. **Deployment ที่ทำงานได้** — deploy/pause/delete endpoint จริง, A/B test split ที่บันทึกและวัดผลจาก `api_call_events` จริง
16. **Templates & Leaderboard จากฐานข้อมูล** — ตาราง `templates`, leaderboard คำนวณจากโมเดลจริงในระบบ
17. **Onboarding/Empty state** — แยก "บัญชีใหม่จริง" กับ demo seed data ให้ชัด (ปัจจุบัน seed อัตโนมัติทุกบัญชี), มีตัวเลือกลบ demo data
18. **Observability** — หน้า System Health (สถานะคิวงาน, error rate, latency), log viewer ของ training run
19. **คุณภาพโค้ด** — SEO Helmet ให้ครบทุกหน้า, เพิ่มเทสต์ครอบ `src/lib/*Api.ts` และ flow หลัก (auth, สร้างโปรเจกต์, eval), i18n strict check ในทุก PR

---

## หมายเหตุทางเทคนิค

- ทุกตารางใหม่ใน schema `public` จะมี `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY` ตามลำดับ ในไมเกรชันเดียว
- งาน AI ทั้งหมดใช้ Lovable AI Gateway (ไม่ต้องใส่ API key เอง); งานหนักย้ายไป edge function เพื่อไม่ให้ขึ้นกับการเปิดแท็บ
- โมดูล `src/lib/*.ts` ที่เป็น localStorage จะคง interface เดิมไว้ แล้วเปลี่ยนไส้ในเป็น Supabase/edge function เพื่อลดผลกระทบต่อ UI
- เพิ่ม i18n keys EN/TH ทุกหน้าใหม่ และรัน `scripts/check-i18n.mjs --strict`

---

**ต้องการให้เริ่มจากเฟสไหน?** แนะนำ Phase 1 + 2 ก่อน (ทำให้ระบบ "ทำงานจริง" ไม่ใช่จำลองในเบราว์เซอร์) แล้วค่อยต่อ Phase 3 หากต้องการรองรับทีม/การเก็บเงิน
