import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="container relative">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Prompt-driven fine-tuning for SLMs
          </motion.div>

          <motion.h1 variants={fadeUp} className="mb-6 text-5xl font-extrabold tracking-tight leading-[1.1] md:text-6xl">
            Fine-tune small models
            <br />
            <span className="text-gradient">with a single prompt</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mb-10 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Describe your task in natural language. TuneLab automatically generates training data,
            fine-tunes a compact SLM, and evaluates it — all without writing a single line of code.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/signup">
                Start Fine-tuning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
              <a href="#demo">Live Demo</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 mx-auto max-w-3xl"
        >
          <div className="rounded-xl border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">tunelab — prompt interface</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-3">
              <div className="text-muted-foreground">
                <span className="text-primary">$</span> Describe your fine-tuning task:
              </div>
              <div className="text-foreground">
                "Classify Thai customer complaints into categories: billing, service, technical, and general. 
                Return the category label and a confidence score."
              </div>
              <div className="mt-4 text-muted-foreground">
                <span className="text-success">✓</span> Task analyzed — Classification (4 classes)
              </div>
              <div className="text-muted-foreground">
                <span className="text-success">✓</span> Generating 5,000 synthetic training examples...
              </div>
              <div className="text-muted-foreground">
                <span className="text-success">✓</span> Fine-tuning Qwen2.5-1.5B with LoRA (rank=16)
              </div>
              <div className="text-primary font-medium">
                ● Model ready — 94.2% accuracy, 3.8ms latency
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
