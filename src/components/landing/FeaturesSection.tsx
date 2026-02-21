import { motion } from "framer-motion";
import { MessageSquareText, BarChart3, Layers, Database, Cpu, Shield } from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "Prompt-based Fine-tuning",
    description: "Describe your task in natural language. Our system automatically scopes the problem, selects the right approach, and configures training.",
  },
  {
    icon: Database,
    title: "Synthetic Data Generation",
    description: "Automatically generate high-quality training data using a Teacher LLM, with built-in curation and quality filtering.",
  },
  {
    icon: Cpu,
    title: "Multi-model Support",
    description: "Choose from Qwen2.5, Gemma 2, Phi-3, Llama 3.2, and more. Compare models side-by-side to find the best fit.",
  },
  {
    icon: BarChart3,
    title: "Auto Evaluation",
    description: "Comprehensive metrics including accuracy, F1-score, ROUGE, coherence, and latency benchmarks — all automated.",
  },
  {
    icon: Layers,
    title: "LoRA Efficient Training",
    description: "Parameter-efficient fine-tuning with LoRA/QLoRA reduces compute costs while maintaining model quality.",
  },
  {
    icon: Shield,
    title: "Production-Ready Export",
    description: "Export models in ONNX, GGUF, or SafeTensors format. Deploy via OpenAI-compatible API endpoints.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2">Capabilities</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to fine-tune SLMs</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            From task description to production deployment — fully automated pipeline.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <feature.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
