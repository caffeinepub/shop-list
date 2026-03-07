import { Link } from "@tanstack/react-router";
import { ArrowRight, FolderOpen, Home, Package, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { useAddProject } from "../hooks/useAddProject";
import { useGetMyProjects } from "../hooks/useGetMyProjects";

/* ── Helpers ─────────────────────────────────── */
function calcSpent(project: Project): number {
  return project.rooms.reduce((roomAcc, room) => {
    return (
      roomAcc +
      room.products.reduce((prodAcc, p) => {
        return prodAcc + Number(p.price) * Number(p.quantity);
      }, 0)
    );
  }, 0);
}

function formatPLN(cents: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function statusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case "active":
      return {
        label: "Aktywny",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "completed":
      return {
        label: "Ukończony",
        color: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "on-hold":
      return {
        label: "Wstrzymany",
        color: "bg-amber-50 text-amber-700 border-amber-200",
      };
    default:
      return {
        label: status,
        color: "bg-muted text-muted-foreground border-border",
      };
  }
}

function countProducts(project: Project): number {
  return project.rooms.reduce((acc, r) => acc + r.products.length, 0);
}

/* ── Project Card ─────────────────────────────── */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const budget = Number(project.budget);
  const spent = calcSpent(project);
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const { label, color } = statusLabel(project.status);
  const productCount = countProducts(project);

  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id.toString() }}
      data-ocid={`projects.item.${index}`}
      className="group block bg-card border border-border rounded-lg p-5 hover:border-foreground/20 hover:shadow-sm transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold font-display text-foreground truncate group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          {project.timeline && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {project.timeline}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
        >
          {label}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Home className="w-3 h-3" />
          {project.rooms.length}{" "}
          {project.rooms.length === 1 ? "pomieszczenie" : "pomieszczeń"}
        </span>
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          {productCount} {productCount === 1 ? "produkt" : "produktów"}
        </span>
      </div>

      {/* Budget */}
      {budget > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Budżet</span>
            <span className="font-medium text-foreground">
              {formatPLN(spent)} / {formatPLN(budget)}
            </span>
          </div>
          <div className="h-1 w-full bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pozostało: {formatPLN(remaining)}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Brak budżetu</p>
      )}

      <div className="flex items-center justify-end mt-3">
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  );
}

/* ── New Project Modal ─────────────────────────── */
interface NewProjectFormState {
  name: string;
  timeline: string;
  budget: string;
  status: string;
}

function NewProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate: addProject, isPending } = useAddProject();
  const [form, setForm] = useState<NewProjectFormState>({
    name: "",
    timeline: "",
    budget: "",
    status: "active",
  });

  const setField = (k: keyof NewProjectFormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const budgetCents = BigInt(
      Math.round((Number.parseFloat(form.budget) || 0) * 100),
    );
    addProject(
      {
        id: BigInt(Date.now()),
        name: form.name.trim(),
        clientId: 0n,
        timeline: form.timeline.trim(),
        budget: budgetCents,
        status: form.status,
        rooms: [],
      },
      {
        onSuccess: () => {
          toast.success("Projekt został utworzony");
          onOpenChange(false);
          setForm({ name: "", timeline: "", budget: "", status: "active" });
        },
        onError: () => toast.error("Błąd podczas tworzenia projektu"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="projects.new_project.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Nowy projekt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Nazwa projektu *</Label>
            <Input
              id="proj-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="np. Apartament Kowalskich"
              required
              data-ocid="projects.new_project.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-timeline">Harmonogram / klient</Label>
            <Input
              id="proj-timeline"
              value={form.timeline}
              onChange={(e) => setField("timeline", e.target.value)}
              placeholder="np. Jan Kowalski, Q1 2025"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-budget">Budżet (PLN)</Label>
            <Input
              id="proj-budget"
              type="number"
              min="0"
              step="100"
              value={form.budget}
              onChange={(e) => setField("budget", e.target.value)}
              placeholder="np. 50000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setField("status", v)}
            >
              <SelectTrigger
                id="proj-status"
                data-ocid="projects.new_project.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktywny</SelectItem>
                <SelectItem value="on-hold">Wstrzymany</SelectItem>
                <SelectItem value="completed">Ukończony</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="projects.new_project.cancel_button"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.name.trim()}
              data-ocid="projects.new_project.submit_button"
            >
              {isPending ? "Tworzenie..." : "Utwórz projekt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Loading skeleton ─────────────────────────── */
function ProjectCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-1 w-full rounded-full" />
    </div>
  );
}

/* ── Main Page ─────────────────────────────────── */
export default function ProjectsPage() {
  const { data: projects, isLoading } = useGetMyProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered =
    projects?.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.timeline.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
            Projekty
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Zarządzaj projektami wnętrzarskimi
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          data-ocid="projects.new_project.primary_button"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nowy projekt
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Szukaj projektów..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="projects.search_input"
          className="h-8 text-sm"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="projects.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id.toString()}
              project={project}
              index={i + 1}
            />
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg py-16 text-center"
          data-ocid="projects.empty_state"
        >
          <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold font-display text-foreground mb-1">
            {search ? "Brak wyników" : "Brak projektów"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search
              ? "Spróbuj innej frazy wyszukiwania"
              : "Utwórz pierwszy projekt, aby zacząć"}
          </p>
          {!search && (
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              data-ocid="projects.empty_state.primary_button"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Utwórz projekt
            </Button>
          )}
        </div>
      )}

      <NewProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
