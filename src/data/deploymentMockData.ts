export interface DeployedEndpoint {
  id: string;
  modelId: string;
  modelName: string;
  projectName: string;
  endpointUrl: string;
  status: "active" | "inactive" | "scaling";
  requestsPerMin: number;
  avgLatencyMs: number;
  errorRate: number;
  uptime: number;
  rateLimitPerMin: number;
  burstLimit: number;
  createdAt: string;
}

export interface UsageDataPoint {
  time: string;
  requests: number;
  errors: number;
  latency: number;
}

export const mockDeployedEndpoints: DeployedEndpoint[] = [
  {
    id: "dep-001",
    modelId: "model-001",
    modelName: "intent-classifier-v1",
    projectName: "Customer Intent Classifier",
    endpointUrl: "https://api.slmstudio.ai/v1/models/intent-classifier-v1",
    status: "active",
    requestsPerMin: 245,
    avgLatencyMs: 42,
    errorRate: 0.3,
    uptime: 99.97,
    rateLimitPerMin: 1000,
    burstLimit: 50,
    createdAt: "2026-02-16T10:00:00Z",
  },
  {
    id: "dep-002",
    modelId: "model-003",
    modelName: "search-ranker-v1",
    projectName: "Search Result Ranker",
    endpointUrl: "https://api.slmstudio.ai/v1/models/search-ranker-v1",
    status: "active",
    requestsPerMin: 128,
    avgLatencyMs: 35,
    errorRate: 0.1,
    uptime: 99.99,
    rateLimitPerMin: 500,
    burstLimit: 30,
    createdAt: "2026-02-14T08:00:00Z",
  },
  {
    id: "dep-003",
    modelId: "model-002",
    modelName: "product-qa-v1",
    projectName: "Product QA Bot",
    endpointUrl: "https://api.slmstudio.ai/v1/models/product-qa-v1",
    status: "inactive",
    requestsPerMin: 0,
    avgLatencyMs: 0,
    errorRate: 0,
    uptime: 0,
    rateLimitPerMin: 500,
    burstLimit: 25,
    createdAt: "2026-02-12T14:00:00Z",
  },
];

export const mockUsageTimeline: UsageDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  requests: Math.floor(Math.random() * 300 + 50),
  errors: Math.floor(Math.random() * 5),
  latency: Math.floor(Math.random() * 30 + 25),
}));

export const mockVersionHistory = {
  "proj-001": [
    {
      version: "v3",
      date: "2026-02-15T14:22:00Z",
      epochs: 5,
      learningRate: 2e-4,
      batchSize: 16,
      accuracy: 94.2,
      f1Score: 93.8,
      notes: "Final version — increased data quality filtering",
      current: true,
    },
    {
      version: "v2",
      date: "2026-02-14T20:00:00Z",
      epochs: 5,
      learningRate: 3e-4,
      batchSize: 16,
      accuracy: 91.5,
      f1Score: 90.8,
      notes: "Higher LR experiment — slight overfit on edge cases",
      current: false,
    },
    {
      version: "v1",
      date: "2026-02-13T10:00:00Z",
      epochs: 3,
      learningRate: 2e-4,
      batchSize: 8,
      accuracy: 87.3,
      f1Score: 86.1,
      notes: "Initial baseline training",
      current: false,
    },
  ],
  "proj-003": [
    {
      version: "v2",
      date: "2026-02-11T03:45:00Z",
      epochs: 3,
      learningRate: 3e-4,
      batchSize: 16,
      accuracy: 89.5,
      f1Score: 88.1,
      notes: "Improved with augmented QA pairs",
      current: true,
    },
    {
      version: "v1",
      date: "2026-02-10T18:00:00Z",
      epochs: 3,
      learningRate: 2e-4,
      batchSize: 8,
      accuracy: 84.2,
      f1Score: 82.9,
      notes: "First training run",
      current: false,
    },
  ],
  "proj-006": [
    {
      version: "v1",
      date: "2026-02-13T02:15:00Z",
      epochs: 4,
      learningRate: 1e-4,
      batchSize: 32,
      accuracy: 91.7,
      f1Score: 90.3,
      notes: "Single-shot training with large batch",
      current: true,
    },
  ],
};

export const mockAugmentedSamples = [
  { original: "อินเทอร์เน็ตหลุดบ่อยมาก ใช้งานไม่ได้เลย", augmented: "เน็ตหลุดตลอดเลย ทำงานไม่ได้สักที", technique: "Paraphrase" },
  { original: "ค่าบริการแพงเกินไป อยากยกเลิก", augmented: "ราคาสูงมากจนรับไม่ไหว ต้องการยกเลิกบริการ", technique: "Paraphrase" },
  { original: "พนักงานบริการดีมาก ขอบคุณครับ", augmented: "Staff service is very good, thank you → เจ้าหน้าที่ให้บริการดีมาก ขอบคุณค่ะ", technique: "Back-Translation" },
  { original: "ไม่สามารถชำระเงินผ่านแอปได้", augmented: "ไม่อาจทำการจ่ายเงินผ่านแอปพลิเคชันได้", technique: "Synonym Replacement" },
  { original: "Speed test shows only 5 Mbps", augmented: "Speed test displays merely 5 Mbps bandwidth", technique: "Synonym Replacement" },
];

export const mockAnnotationSamples = [
  { id: 1, text: "บริษัท ปตท. ประกาศผลประกอบการไตรมาสแรกของปี 2026 มีกำไรสุทธิ 2.5 หมื่นล้านบาท", label: null },
  { id: 2, text: "นายสมชาย เดินทางไปประชุมที่กรุงโตเกียว ประเทศญี่ปุ่น เมื่อวันจันทร์ที่ผ่านมา", label: null },
  { id: 3, text: "ธนาคารกสิกรไทย สาขาสีลม เปิดให้บริการตั้งแต่ 8:30 ถึง 15:30 น.", label: null },
  { id: 4, text: "มหาวิทยาลัยจุฬาลงกรณ์ จัดงานสัมมนา AI ครั้งที่ 5 ในวันที่ 15 มีนาคม", label: null },
  { id: 5, text: "กรุงเทพมหานคร ประสบปัญหาน้ำท่วมหนักในหลายพื้นที่ เนื่องจากฝนตกหนัก", label: null },
  { id: 6, text: "Apple เปิดตัว iPhone รุ่นใหม่ที่งาน WWDC ในซานฟรานซิสโก", label: null },
  { id: 7, text: "คุณพลอย ทำงานเป็นวิศวกร AI ที่บริษัท Google ประเทศสิงคโปร์", label: null },
  { id: 8, text: "สนามบินสุวรรณภูมิ ต้อนรับผู้โดยสารมากกว่า 50 ล้านคนต่อปี", label: null },
  { id: 9, text: "โรงพยาบาลศิริราช เป็นโรงพยาบาลที่เก่าแก่ที่สุดในประเทศไทย ก่อตั้งเมื่อปี พ.ศ. 2431", label: null },
  { id: 10, text: "นายกรัฐมนตรีประชุมคณะรัฐมนตรีที่ทำเนียบรัฐบาล วันอังคารที่ 18 กุมภาพันธ์", label: null },
  { id: 11, text: "Microsoft ลงทุน 1 หมื่นล้านดอลลาร์ ในโครงการ AI ร่วมกับ OpenAI", label: null },
  { id: 12, text: "แม่น้ำเจ้าพระยา ไหลผ่านใจกลางกรุงเทพมหานคร ยาวกว่า 372 กิโลเมตร", label: null },
  { id: 13, text: "สมาคมฟุตบอลแห่งประเทศไทย ประกาศรายชื่อนักเตะทีมชาติ 23 คน", label: null },
  { id: 14, text: "ดร.สมศักดิ์ ได้รับรางวัลนักวิจัยดีเด่น จากสภาวิจัยแห่งชาติ", label: null },
  { id: 15, text: "ร้านอาหาร Jay Fai ได้รับดาวมิชลิน 1 ดาว ตั้งอยู่ใกล้วัดสระเกศ", label: null },
  { id: 16, text: "การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย วางแผนสร้างโรงไฟฟ้าพลังงานแสงอาทิตย์", label: null },
  { id: 17, text: "Toyota เปิดตัวรถยนต์ไฟฟ้ารุ่นใหม่ ในงาน Motor Show ที่เมืองทองธานี", label: null },
  { id: 18, text: "เกาะพีพี จังหวัดกระบี่ ได้รับการจัดอันดับเป็นชายหาดสวยที่สุดในเอเชีย", label: null },
  { id: 19, text: "LINE MAN Wongnai ประกาศระดมทุนรอบใหม่ มูลค่ากว่า 200 ล้านดอลลาร์", label: null },
  { id: 20, text: "ศาสตราจารย์ ดร.วิชัย บรรยายเรื่อง Machine Learning ที่มหาวิทยาลัยเกษตรศาสตร์", label: null },
];
