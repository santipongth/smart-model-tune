export type Language = "en" | "th";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav / Sidebar
    "nav.dashboard": "Dashboard",
    "nav.projects": "Projects",
    "nav.models": "Models",
    "nav.playground": "Playground",
    "nav.analytics": "Analytics",
    "nav.datasets": "Datasets",
    "nav.calculator": "Cost Calculator",
    "nav.apiKeys": "API Keys",
    "nav.settings": "Settings",
    "nav.credits": "Credits",
    "nav.plan": "Plan",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Overview of your fine-tuning workspace",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.browseProjects": "Browse Projects",
    "dashboard.browseModels": "Browse Models",
    "dashboard.openPlayground": "Open Playground",

    // Landing Hero
    "hero.badge": "Prompt-driven fine-tuning for SLMs",
    "hero.title1": "Fine-tune small models",
    "hero.title2": "with a single prompt",
    "hero.subtitle": "Describe your task in natural language. TuneLab automatically generates training data, fine-tunes a compact SLM, and evaluates it — all without writing a single line of code.",
    "hero.cta": "Start Fine-tuning",
    "hero.demo": "Live Demo",

    // Landing Navbar
    "landing.features": "Features",
    "landing.useCases": "Use Cases",
    "landing.pricing": "Pricing",
    "landing.login": "Log in",
    "landing.getStarted": "Get Started",

    // Features Section
    "features.label": "Capabilities",
    "features.title": "Everything you need to fine-tune SLMs",
    "features.subtitle": "From task description to production deployment — fully automated pipeline.",
    "features.promptTitle": "Prompt-based Fine-tuning",
    "features.promptDesc": "Describe your task in natural language. Our system automatically scopes the problem, selects the right approach, and configures training.",
    "features.dataTitle": "Synthetic Data Generation",
    "features.dataDesc": "Automatically generate high-quality training data using a Teacher LLM, with built-in curation and quality filtering.",
    "features.modelTitle": "Multi-model Support",
    "features.modelDesc": "Choose from Qwen2.5, Gemma 2, Phi-3, Llama 3.2, and more. Compare models side-by-side to find the best fit.",
    "features.evalTitle": "Auto Evaluation",
    "features.evalDesc": "Comprehensive metrics including accuracy, F1-score, ROUGE, coherence, and latency benchmarks — all automated.",
    "features.loraTitle": "LoRA Efficient Training",
    "features.loraDesc": "Parameter-efficient fine-tuning with LoRA/QLoRA reduces compute costs while maintaining model quality.",
    "features.exportTitle": "Production-Ready Export",
    "features.exportDesc": "Export models in ONNX, GGUF, or SafeTensors format. Deploy via OpenAI-compatible API endpoints.",

    // Pricing Section
    "pricing.label": "Pricing",
    "pricing.title": "Simple, transparent pricing",
    "pricing.subtitle": "Start free. Scale as you grow.",
    "pricing.mostPopular": "Most Popular",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account, API keys, and billing",
    "settings.apiKeys": "API Keys",
    "settings.team": "Team",
    "settings.notifications": "Notifications",
    "settings.webhooks": "Webhooks",
    "settings.account": "Account",
    "settings.billing": "Billing",

    // Command Palette
    "command.search": "Search...",
    "command.searchPlaceholder": "Search projects, models, pages...",
    "command.quickActions": "Quick Actions",
    "command.pages": "Pages",
    "command.projects": "Projects",
    "command.models": "Models",
    "command.newProject": "New Project",
    "command.noResults": "No results found.",

    // Notifications
    "notif.title": "Notifications",
    "notif.markAllRead": "Mark all as read",
    "notif.trainingComplete": "Training Complete",
    "notif.creditWarning": "Credit Warning",
    "notif.modelDeployed": "Model Deployed",
    "notif.teamInvite": "Team Invite",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.search": "Search",
  },
  th: {
    // Nav / Sidebar
    "nav.dashboard": "แดชบอร์ด",
    "nav.projects": "โปรเจกต์",
    "nav.models": "โมเดล",
    "nav.playground": "ทดสอบโมเดล",
    "nav.analytics": "วิเคราะห์",
    "nav.datasets": "ชุดข้อมูล",
    "nav.calculator": "คำนวณค่าใช้จ่าย",
    "nav.apiKeys": "API Keys",
    "nav.settings": "ตั้งค่า",
    "nav.credits": "เครดิต",
    "nav.plan": "แผน",

    // Dashboard
    "dashboard.title": "แดชบอร์ด",
    "dashboard.subtitle": "ภาพรวมพื้นที่ Fine-tuning ของคุณ",
    "dashboard.quickActions": "การดำเนินการด่วน",
    "dashboard.browseProjects": "ดูโปรเจกต์",
    "dashboard.browseModels": "ดูโมเดล",
    "dashboard.openPlayground": "เปิด Playground",

    // Landing Hero
    "hero.badge": "Fine-tuning ด้วย Prompt สำหรับ SLMs",
    "hero.title1": "Fine-tune โมเดลขนาดเล็ก",
    "hero.title2": "ด้วย Prompt เดียว",
    "hero.subtitle": "อธิบายงานของคุณด้วยภาษาธรรมชาติ TuneLab จะสร้างข้อมูลฝึก, Fine-tune SLM และประเมินผลให้อัตโนมัติ — โดยไม่ต้องเขียนโค้ดแม้แต่บรรทัดเดียว",
    "hero.cta": "เริ่ม Fine-tuning",
    "hero.demo": "ดูตัวอย่าง",

    // Landing Navbar
    "landing.features": "ฟีเจอร์",
    "landing.useCases": "กรณีใช้งาน",
    "landing.pricing": "ราคา",
    "landing.login": "เข้าสู่ระบบ",
    "landing.getStarted": "เริ่มต้นใช้งาน",

    // Features Section
    "features.label": "ความสามารถ",
    "features.title": "ทุกสิ่งที่ต้องการสำหรับ Fine-tune SLMs",
    "features.subtitle": "ตั้งแต่อธิบายงานจนถึงใช้งานจริง — ระบบอัตโนมัติทั้งหมด",
    "features.promptTitle": "Fine-tuning ด้วย Prompt",
    "features.promptDesc": "อธิบายงานด้วยภาษาธรรมชาติ ระบบจะวิเคราะห์ปัญหา เลือกแนวทาง และตั้งค่าการฝึกให้อัตโนมัติ",
    "features.dataTitle": "สร้างข้อมูลสังเคราะห์",
    "features.dataDesc": "สร้างข้อมูลฝึกคุณภาพสูงอัตโนมัติด้วย Teacher LLM พร้อมระบบกรองคุณภาพ",
    "features.modelTitle": "รองรับหลายโมเดล",
    "features.modelDesc": "เลือกจาก Qwen2.5, Gemma 2, Phi-3, Llama 3.2 และอื่นๆ เปรียบเทียบโมเดลเพื่อหาตัวที่ดีที่สุด",
    "features.evalTitle": "ประเมินผลอัตโนมัติ",
    "features.evalDesc": "เมตริกครบถ้วน ทั้ง accuracy, F1-score, ROUGE, ความสอดคล้อง และ latency — ทั้งหมดอัตโนมัติ",
    "features.loraTitle": "ฝึกด้วย LoRA อย่างมีประสิทธิภาพ",
    "features.loraDesc": "Fine-tuning แบบ LoRA/QLoRA ลดต้นทุนการคำนวณโดยยังรักษาคุณภาพโมเดล",
    "features.exportTitle": "พร้อมใช้งานจริง",
    "features.exportDesc": "ส่งออกโมเดลเป็น ONNX, GGUF หรือ SafeTensors ใช้งานผ่าน API ที่เข้ากันได้กับ OpenAI",

    // Pricing Section
    "pricing.label": "ราคา",
    "pricing.title": "ราคาเรียบง่าย โปร่งใส",
    "pricing.subtitle": "เริ่มฟรี ขยายตามการเติบโต",
    "pricing.mostPopular": "ยอดนิยม",

    // Settings
    "settings.title": "ตั้งค่า",
    "settings.subtitle": "จัดการบัญชี, API keys และการเรียกเก็บเงิน",
    "settings.apiKeys": "API Keys",
    "settings.team": "ทีม",
    "settings.notifications": "การแจ้งเตือน",
    "settings.webhooks": "Webhooks",
    "settings.account": "บัญชี",
    "settings.billing": "การเรียกเก็บเงิน",

    // Command Palette
    "command.search": "ค้นหา...",
    "command.searchPlaceholder": "ค้นหาโปรเจกต์ โมเดล หน้า...",
    "command.quickActions": "การดำเนินการด่วน",
    "command.pages": "หน้า",
    "command.projects": "โปรเจกต์",
    "command.models": "โมเดล",
    "command.newProject": "โปรเจกต์ใหม่",
    "command.noResults": "ไม่พบผลลัพธ์",

    // Notifications
    "notif.title": "การแจ้งเตือน",
    "notif.markAllRead": "อ่านทั้งหมดแล้ว",
    "notif.trainingComplete": "การฝึกเสร็จสิ้น",
    "notif.creditWarning": "เตือนเครดิต",
    "notif.modelDeployed": "โมเดลถูกใช้งาน",
    "notif.teamInvite": "คำเชิญทีม",

    // Common
    "common.save": "บันทึก",
    "common.cancel": "ยกเลิก",
    "common.delete": "ลบ",
    "common.loading": "กำลังโหลด...",
    "common.search": "ค้นหา",
  },
};
