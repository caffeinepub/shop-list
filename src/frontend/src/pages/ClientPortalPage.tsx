import { useSearch } from "@tanstack/react-router";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Home,
  ImageOff,
  Package,
} from "lucide-react";
import { useState } from "react";
import type { Room } from "../backend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useGetMyProjects } from "../hooks/useGetMyProjects";
import { useGetProject } from "../hooks/useGetProject";

/* ── Helpers ─────────────────────────────────── */
function formatPLN(cents: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function productStatusLabel(status: string): { label: string; cls: string } {
  switch (status) {
    case "ordered":
      return {
        label: "Zamówiony",
        cls: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "delivered":
      return {
        label: "Dostarczony",
        cls: "bg-green-50 text-green-700 border-green-200",
      };
    case "installed":
      return {
        label: "Zamontowany",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    default:
      return {
        label: "Planowany",
        cls: "bg-gray-50 text-gray-600 border-gray-200",
      };
  }
}

/* ── Thumbnail ─────────────────────────────────── */
function ProductThumb({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-10 h-10 bg-muted rounded border border-border flex items-center justify-center shrink-0">
        <ImageOff className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className="w-10 h-10 object-cover rounded border border-border shrink-0"
    />
  );
}

/* ── Room Products Table ─────────────────────────── */
function RoomProductsTable({
  room,
  showPrices,
  index,
}: {
  room: Room;
  showPrices: boolean;
  index: number;
}) {
  if (room.products.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        Brak produktów w tym pomieszczeniu
      </p>
    );
  }

  const roomTotal = room.products.reduce(
    (acc, p) => acc + Number(p.price) * Number(p.quantity),
    0,
  );

  return (
    <div className="space-y-3">
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 pl-3">Foto</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead>Sklep</TableHead>
                <TableHead className="text-right">Ilość</TableHead>
                {showPrices && (
                  <>
                    <TableHead className="text-right">Cena</TableHead>
                    <TableHead className="text-right">Razem</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead className="w-8">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {room.products.map((p, i) => {
                const { label, cls } = productStatusLabel(p.status);
                const price = Number(p.price);
                const qty = Number(p.quantity);
                return (
                  <TableRow
                    key={p.id.toString()}
                    data-ocid={`client_portal.room.${index}.product.item.${i + 1}`}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="pl-3">
                      <ProductThumb src={p.image} name={p.name} />
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[160px]">
                      <span className="line-clamp-2">{p.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.shop || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">{qty}</TableCell>
                    {showPrices && (
                      <>
                        <TableCell className="text-right text-sm">
                          {formatPLN(price)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatPLN(price * qty)}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
                      >
                        {label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.link ? (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      {showPrices && (
        <p className="text-xs text-right text-muted-foreground">
          Łącznie:{" "}
          <span className="font-semibold text-foreground">
            {formatPLN(roomTotal)}
          </span>
        </p>
      )}
    </div>
  );
}

/* ── Single Project View ─────────────────────────── */
function ProjectView({
  projectId,
  showPrices,
}: {
  projectId: bigint;
  showPrices: boolean;
}) {
  const { data: project, isLoading } = useGetProject(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="client_portal.loading_state">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12" data-ocid="client_portal.error_state">
        <p className="text-muted-foreground text-sm">
          Nie można załadować projektu. Upewnij się, że masz do niego dostęp.
        </p>
      </div>
    );
  }

  const totalProductCount = project.rooms.reduce(
    (acc, r) => acc + r.products.length,
    0,
  );
  const totalSpent = project.rooms.reduce(
    (acc, r) =>
      acc +
      r.products.reduce((a, p) => a + Number(p.price) * Number(p.quantity), 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Project info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold font-display text-foreground mb-1">
          {project.name}
        </h2>
        {project.timeline && (
          <p className="text-sm text-muted-foreground">{project.timeline}</p>
        )}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Home className="w-4 h-4" />
            <span>{project.rooms.length} pomieszczeń</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{totalProductCount} produktów</span>
          </div>
          {showPrices && totalSpent > 0 && (
            <div className="text-muted-foreground">
              Wartość:{" "}
              <span className="font-semibold text-foreground">
                {formatPLN(totalSpent)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rooms */}
      {project.rooms.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Projekt nie zawiera jeszcze pomieszczeń
        </div>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={project.rooms.map((r) => r.id.toString())}
        >
          {project.rooms.map((room, i) => (
            <AccordionItem
              key={room.id.toString()}
              value={room.id.toString()}
              className="border border-border rounded-lg overflow-hidden mb-3"
              data-ocid={`client_portal.room.item.${i + 1}`}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
                <div className="flex items-center justify-between w-full mr-2">
                  <div className="text-left">
                    <span className="font-semibold font-display text-sm text-foreground">
                      {room.name}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {room.products.length} produktów
                      {room.area > 0n && ` · ${room.area} m²`}
                    </p>
                  </div>
                  {showPrices && (
                    <div className="text-right mr-2">
                      <p className="text-sm font-medium text-foreground">
                        {formatPLN(
                          room.products.reduce(
                            (acc, p) =>
                              acc + Number(p.price) * Number(p.quantity),
                            0,
                          ),
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <RoomProductsTable
                  room={room}
                  showPrices={showPrices}
                  index={i + 1}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

/* ── All Projects List (fallback) ─────────────────── */
function AllProjectsList({ showPrices }: { showPrices: boolean }) {
  const { data: projects, isLoading } = useGetMyProjects();

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="client_portal.loading_state">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div
        className="border-2 border-dashed border-border rounded-lg py-16 text-center"
        data-ocid="client_portal.empty_state"
      >
        <p className="text-muted-foreground text-sm">
          Brak projektów udostępnionych dla Ciebie
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <ProjectView
          key={project.id.toString()}
          projectId={project.id}
          showPrices={showPrices}
        />
      ))}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────── */
export default function ClientPortalPage() {
  const [showPrices, setShowPrices] = useState(false);

  // Get project id from URL search params (hook must be at top level)
  const search = useSearch({ strict: false }) as Record<string, string>;
  const rawProjectId = search?.project ?? null;
  const projectId: bigint | null = rawProjectId ? BigInt(rawProjectId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
            Portal klienta
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Widok tylko do odczytu — projekty udostępnione przez projektanta
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPrices((p) => !p)}
          data-ocid="client_portal.show_prices.toggle"
        >
          {showPrices ? (
            <>
              <EyeOff className="w-3.5 h-3.5 mr-1.5" />
              Ukryj ceny
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Pokaż ceny
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="bg-muted/40 border border-border rounded-lg px-4 py-3 text-xs text-muted-foreground">
        To jest widok tylko do odczytu. Ceny są domyślnie ukryte — możesz je
        pokazać przyciskiem powyżej.
      </div>

      {/* Content */}
      {projectId !== null ? (
        <ProjectView projectId={projectId} showPrices={showPrices} />
      ) : (
        <AllProjectsList showPrices={showPrices} />
      )}
    </div>
  );
}
