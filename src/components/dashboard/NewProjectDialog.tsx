import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function NewProjectDialog() {
  return (
    <Button className="gap-2" asChild>
      <Link to="/projects/new">
        <Plus className="h-4 w-4" /> New Project
      </Link>
    </Button>
  );
}
