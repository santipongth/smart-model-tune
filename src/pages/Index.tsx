import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import DemoSection from "@/components/landing/DemoSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>TuneLab — Prompt-driven SLM Fine-tuning Platform</title>
        <meta name="description" content="Fine-tune small language models with a single prompt. TuneLab generates training data, tunes compact SLMs, and evaluates them automatically." />
        <link rel="canonical" href="https://smart-model-tune.lovable.app/" />
        <meta property="og:title" content="TuneLab — Prompt-driven SLM Fine-tuning" />
        <meta property="og:url" content="https://smart-model-tune.lovable.app/" />
        <meta property="og:description" content="Describe your task in plain language. TuneLab generates data, fine-tunes a compact SLM, and evaluates it automatically." />
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <UseCasesSection />
        <DemoSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
