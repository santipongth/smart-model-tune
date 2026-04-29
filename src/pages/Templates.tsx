import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition, FadeIn, StaggerContainer, MotionCard } from "@/components/motion";
import { Search, Star, GitFork, Sparkles, Rocket } from "lucide-react";
import { projectTemplates, templateCategories, type ProjectTemplate } from "@/data/templatesMockData";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function Templates() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<typeof templateCategories[number]>("All");
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const filtered = projectTemplates.filter((tpl) => {
    const matchSearch =
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.tags.some((x) => x.includes(search.toLowerCase()));
    const matchCat =
      category === "All" ||
      (category === "Featured" ? tpl.featured : tpl.category === category);
    return matchSearch && matchCat;
  });

  const handleUse = (tpl: ProjectTemplate) => {
    toast({
      title: t("templates.created"),
      description: tpl.name,
    });
    sessionStorage.setItem("template-prefill", JSON.stringify(tpl));
    navigate("/projects/new");
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl">
        <FadeIn>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {t("templates.title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{t("templates.subtitle")}</p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {projectTemplates.length} {t("templates.templates")}
            </Badge>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("templates.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {templateCategories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <MotionCard key={tpl.id}>
              <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all flex flex-col">
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      {tpl.name}
                    </h3>
                    {tpl.featured && (
                      <Badge className="text-[9px] shrink-0 bg-primary/15 text-primary border-primary/30" variant="outline">
                        ★ {t("templates.featured")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {tpl.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">{tpl.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{tpl.taskType}</Badge>
                    <Badge variant="outline" className="text-[10px]">{tpl.baseModel}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {tpl.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        {tpl.forks.toLocaleString()}
                      </span>
                    </span>
                    <span className="truncate max-w-[100px]">{tpl.author}</span>
                  </div>
                  <Button size="sm" className="w-full gap-1.5" onClick={() => handleUse(tpl)}>
                    <Rocket className="h-3.5 w-3.5" />
                    {t("templates.useTemplate")}
                  </Button>
                </CardContent>
              </Card>
            </MotionCard>
          ))}
        </StaggerContainer>

        {filtered.length === 0 && (
          <FadeIn>
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">{t("templates.noResults")}</p>
            </div>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
