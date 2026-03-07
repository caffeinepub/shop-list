import { ExternalLink, ImageOff, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "../backend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
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
import { useGetShoppingLists } from "../hooks/useGetShoppingLists";

/* ── Helpers ─────────────────────────────────── */
function formatPLN(cents: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function productStatusInfo(status: string): { label: string; cls: string } {
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

function listStatusInfo(status: string): { label: string; cls: string } {
  switch (status) {
    case "active":
      return {
        label: "Aktywna",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "completed":
      return {
        label: "Ukończona",
        cls: "bg-blue-50 text-blue-700 border-blue-200",
      };
    default:
      return { label: status, cls: "bg-gray-50 text-gray-600 border-gray-200" };
  }
}

/* ── Product Thumbnail ─────────────────────────── */
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

/* ── Products Sub-Table ─────────────────────────── */
function ProductSubTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-3">
        Brak produktów na liście
      </p>
    );
  }
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 pl-3">Foto</TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead>Sklep</TableHead>
              <TableHead className="text-right">Ilość</TableHead>
              <TableHead className="text-right">Cena jedn.</TableHead>
              <TableHead className="text-right">Razem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-8">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p, i) => {
              const { label, cls } = productStatusInfo(p.status);
              const price = Number(p.price);
              const qty = Number(p.quantity);
              return (
                <TableRow
                  key={p.id.toString()}
                  data-ocid={`shopping_list.product.item.${i + 1}`}
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
                  <TableCell className="text-right text-sm">
                    {formatPLN(price)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatPLN(price * qty)}
                  </TableCell>
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
  );
}

/* ── Skeleton ─────────────────────────────────── */
function ListSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-20" />
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────── */
export default function ShoppingListPage() {
  const { data: lists, isLoading } = useGetShoppingLists();

  const sorted = [...(lists ?? [])].sort((a, b) => {
    // Sort by id descending (newer first)
    return Number(b.id - a.id);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
          Listy zakupowe
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Listy tworzone automatycznie z pomieszczeń w projektach
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 text-xs text-muted-foreground">
        Listy zakupowe są generowane automatycznie podczas dodawania produktów
        do pomieszczeń w projektach. Każda lista odpowiada jednemu
        pomieszczeniu:{" "}
        <span className="font-medium text-foreground">
          Projekt – Pomieszczenie
        </span>
        .
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="shopping_lists.loading_state">
          {[1, 2, 3].map((i) => (
            <ListSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-lg py-16 text-center"
          data-ocid="shopping_lists.empty_state"
        >
          <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold font-display text-foreground mb-1">
            Brak list zakupowych
          </h3>
          <p className="text-sm text-muted-foreground">
            Dodaj produkty do pomieszczenia w projekcie, a lista zostanie tutaj
            automatycznie
          </p>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {sorted.map((list, i) => {
            const { label: statusLabel, cls: statusCls } = listStatusInfo(
              list.status,
            );
            const total = Number(list.total);
            const productCount = list.products.length;

            return (
              <AccordionItem
                key={list.id.toString()}
                value={list.id.toString()}
                className="border border-border rounded-lg overflow-hidden"
                data-ocid={`shopping_lists.item.${i + 1}`}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
                  <div className="flex items-center justify-between w-full mr-2">
                    <div className="text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold font-display text-sm text-foreground">
                          {list.name}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusCls}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {productCount}{" "}
                        {productCount === 1 ? "produkt" : "produktów"}
                        {list.shop && ` · ${list.shop}`}
                      </p>
                    </div>
                    <div className="text-right mr-2">
                      <p className="text-sm font-semibold font-display text-foreground">
                        {formatPLN(total)}
                      </p>
                      {list.discount > 0n && (
                        <p className="text-xs text-muted-foreground">
                          Rabat: {formatPLN(Number(list.discount))}
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <ProductSubTable products={list.products} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
