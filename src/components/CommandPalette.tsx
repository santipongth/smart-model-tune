import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FolderKanban, Box, LayoutDashboard, Settings, MessageSquare, Plus, Search } from "lucide-react";
import { mockProjects, mockModels } from "@/data/mockData";
import { Button } from "@/components/ui/button";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex gap-2 text-muted-foreground h-8 px-3"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search projects, models, pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => runCommand("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand("/projects")}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </CommandItem>
            <CommandItem onSelect={() => runCommand("/models")}>
              <Box className="mr-2 h-4 w-4" />
              Models
            </CommandItem>
            <CommandItem onSelect={() => runCommand("/playground")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Playground
            </CommandItem>
            <CommandItem onSelect={() => runCommand("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Projects">
            {mockProjects.map((p) => (
              <CommandItem key={p.id} onSelect={() => runCommand(`/projects/${p.id}`)}>
                <FolderKanban className="mr-2 h-4 w-4" />
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Models">
            {mockModels.map((m) => (
              <CommandItem key={m.id} onSelect={() => runCommand(`/models/${m.id}`)}>
                <Box className="mr-2 h-4 w-4" />
                {m.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
