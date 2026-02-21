import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t py-12">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <Zap className="h-3 w-3 text-primary-foreground" />
          </div>
          <span>TuneLab — Automated SLM Fine-Tuning Platform</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 TuneLab. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
