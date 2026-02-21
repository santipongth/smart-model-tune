

## แผนพัฒนา Automated SLM Fine-Tuning Platform (Frontend UI)

### ภาพรวม
สร้าง Web Application สำหรับแพลตฟอร์มปรับแต่งโมเดลภาษาขนาดเล็กแบบอัตโนมัติ ออกแบบด้วย Clean Light Theme สไตล์ Stripe/Notion ใช้ mock data เพื่อแสดง flow ทั้งหมด พร้อมเชื่อมต่อ Backend จริงในอนาคต

---

### Phase 1: Landing Page & Authentication

**Landing Page**
- Hero section นำเสนอ value proposition ของแพลตฟอร์ม
- Features section แสดงความสามารถหลัก (Prompt-based Fine-tuning, Auto Evaluation, Multi-model Support)
- Use Cases section พร้อมตัวอย่างการใช้งาน (Classification, NER, QA, Function Calling)
- Interactive Demo section ให้ผู้ใช้ทดลองพิมพ์ prompt ตัวอย่าง
- Pricing section แสดง 3 แผน (Free, Pro, Enterprise)
- CTA สำหรับสมัครใช้งาน

**Authentication Pages**
- หน้า Sign Up / Login ด้วย Email/Password
- แสดง UI สำหรับ Google Social Login
- หน้าเลือก Subscription Tier

---

### Phase 2: Dashboard & Project Management

**Main Dashboard**
- Project List แสดงรายการโปรเจกต์ทั้งหมดพร้อมสถานะ
- สร้างโปรเจกต์ใหม่ (New Project wizard)
- Training Status overview พร้อม progress indicators
- Model Inventory แสดงโมเดลที่ train เสร็จแล้ว
- Usage Analytics แสดงสถิติการใช้งาน, Credit Balance, Training History
- Cost Estimation Panel แสดงค่าใช้จ่ายโดยประมาณ

**Sidebar Navigation**
- Dashboard, Projects, Models, Playground, API Keys, Settings
- แสดง credit balance และ plan tier ปัจจุบัน

---

### Phase 3: Prompt Interface & Job Configuration

**Prompt Interface (หน้าสร้าง Fine-tuning Job)**
- Chat-like interface สำหรับป้อน Task Prompt / Job Description
- Guided Task Selection Workflow ให้เลือกประเภทงาน (Classification, NER, QA, Function Calling, Extraction, Ranking) พร้อมคำอธิบายและตัวอย่าง
- Upload Few-Shot Examples รองรับ CSV, JSON, JSONL
- Upload Supplementary Domain Knowledge (Unstructured Data)
- Configuration Editor สำหรับ Training Parameters (Model Size, Epochs, Learning Rate) สำหรับผู้ใช้ขั้นสูง
- Template Library พร้อม Pre-built Templates สำหรับ Common Use Cases

**Base Model Selection**
- แสดงรายการ Base Models ที่รองรับ (Qwen2.5, Gemma 2, Phi-3, Llama 3.2, SmolLM2)
- แสดงข้อมูลเปรียบเทียบ (ขนาด, ความเร็ว, ความเหมาะสมกับ task)

---

### Phase 4: Training Monitor & Evaluation

**Training Progress**
- Real-time Progress Bar แสดง Epoch Progress, Loss Curve (ด้วย Recharts)
- Training Log viewer
- สถานะแต่ละขั้นตอน: Task Scoping → Synthetic Data Generation → Data Curation → Fine-Tuning → Evaluation

**Evaluation Viewer**
- แสดงผลเปรียบเทียบ Student SLM vs Teacher LLM แบบ Side-by-Side
- ค่า Metrics: Accuracy, Relevance, Coherence, F1-Score, ROUGE, Latency
- Model Comparison Dashboard สำหรับเปรียบเทียบ Model Versions ต่างๆ (กราฟและตาราง)

---

### Phase 5: Playground & Model Management

**Inference Playground**
- Chat interface สำหรับทดลองใช้งานโมเดลที่ train เสร็จ
- รองรับ Single-Turn และ Multi-Turn Conversation
- A/B Comparison ระหว่างโมเดลเวอร์ชันต่างๆ หรือ Student vs Teacher
- แสดง latency และ token usage ของแต่ละ response

**Model Management**
- Model Registry แสดง Model Artifacts, Versions, Metadata
- Export options (ONNX, GGUF, SafeTensors) - แสดง UI สำหรับดาวน์โหลด
- API Endpoint info สำหรับแต่ละโมเดล (OpenAI-compatible format)

---

### Phase 6: Settings & API Management

**API Key Management**
- สร้างและจัดการ API Keys สำหรับเชื่อมต่อภายนอก
- แสดง code examples (Python, JavaScript, cURL)

**Notification Settings**
- ตั้งค่าการแจ้งเตือน (Training complete, Evaluation done, Credit low)
- Webhook configuration UI

**Account Settings**
- Profile, Billing/Subscription management
- Team management (สำหรับ Enterprise)

---

### เทคโนโลยีที่ใช้
- **UI Framework:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Charts:** Recharts สำหรับ Loss Curves, Metrics visualization
- **Routing:** React Router สำหรับทุกหน้า
- **State:** React Query + Local State สำหรับ mock data
- **Theme:** Clean Light Theme พร้อม Dark mode toggle

### หมายเหตุ
- ทุกหน้าจะใช้ mock data ที่สมจริง เพื่อให้เห็นภาพการทำงานจริงของแพลตฟอร์ม
- โครงสร้างโค้ดจะออกแบบให้พร้อมเชื่อมต่อ Backend API (FastAPI) ในอนาคต
- เนื่องจากเป็นโปรเจกต์ขนาดใหญ่ จะแบ่งการพัฒนาเป็น Phase เริ่มจาก Phase 1-2 ก่อน แล้วค่อยเพิ่ม Phase ถัดไป

