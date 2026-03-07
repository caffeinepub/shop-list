import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clipboard,
  Download,
  Edit2,
  ExternalLink,
  ImageOff,
  Package,
  Plus,
  Printer,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product, Room } from "../backend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { useAddRoom } from "../hooks/useAddRoom";
import { useAddShoppingList } from "../hooks/useAddShoppingList";
import { useGetProject } from "../hooks/useGetProject";
import { useGetShoppingLists } from "../hooks/useGetShoppingLists";

/* ── Types ────────────────────────────────────── */
interface LocalProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  shop: string;
  link: string;
  status: string;
  notes: string;
  roomKey: string;
}

/* ── Helpers ─────────────────────────────────── */
function formatPLN(cents: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatPLNDirect(pln: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pln);
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

function roomCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    salon: "Salon",
    sypialnia: "Sypialnia",
    lazienka: "Łazienka",
    kuchnia: "Kuchnia",
    inne: "Inne",
  };
  return map[cat] ?? cat;
}

/* ── Image Input with paste/upload/URL ─────────── */
interface ImageInputProps {
  value: string;
  onChange: (val: string) => void;
}

function ImageInput({ value, onChange }: ImageInputProps) {
  const [tab, setTab] = useState<"url" | "upload" | "paste">("url");
  const [previewError, setPreviewError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional value-based reset
  useEffect(() => {
    setPreviewError(false);
  }, [value]);

  const handleFileRead = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(png|jpeg|jpg|gif|webp)$/)) {
        toast.error("Dozwolone formaty: PNG, JPG, GIF, WebP");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setPreviewError(false);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileRead(file);
  };

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) handleFileRead(file);
        return;
      }
    }
    // fallback: let text paste happen
  };

  // Global paste listener when paste tab is active
  useEffect(() => {
    if (tab !== "paste") return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) handleFileRead(file);
          return;
        }
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [tab, handleFileRead]);

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-xs">
        {(["url", "upload", "paste"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-2.5 py-1 rounded-md border transition-colors ${
              tab === t
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {t === "url" && "URL"}
            {t === "upload" && "Plik"}
            {t === "paste" && "Wklej (Ctrl+V)"}
          </button>
        ))}
      </div>

      {tab === "url" && (
        <Input
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => {
            onChange(e.target.value);
            setPreviewError(false);
          }}
          placeholder="https://..."
          data-ocid="products.image_url.input"
        />
      )}

      {tab === "upload" && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: file input handles keyboard
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragOver
              ? "border-foreground bg-muted"
              : "border-border hover:border-muted-foreground"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-ocid="products.image.dropzone"
        >
          <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Kliknij lub przeciągnij plik PNG/JPG
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
            data-ocid="products.image.upload_button"
          />
        </div>
      )}

      {tab === "paste" && (
        <div
          ref={pasteAreaRef}
          className="border-2 border-dashed border-border rounded-lg p-4 text-center"
          onPaste={handlePasteEvent}
          data-ocid="products.image.paste_area"
        >
          <Clipboard className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Kliknij tutaj, następnie wciśnij{" "}
            <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">
              Ctrl+V
            </kbd>{" "}
            aby wkleić zdjęcie ze schowka
          </p>
        </div>
      )}

      {value && !previewError && (
        <div className="relative inline-block mt-1">
          <img
            src={value}
            alt="Podgląd"
            onError={() => setPreviewError(true)}
            className="h-20 w-20 object-cover rounded border border-border"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center"
            data-ocid="products.image_clear.button"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
      {value && previewError && (
        <p className="text-xs text-destructive mt-1">
          Nie można załadować podglądu obrazka
        </p>
      )}
    </div>
  );
}

/* ── Budget Widget ─────────────────────────────── */
function BudgetWidget({
  budget,
  spent,
}: {
  budget: number;
  spent: number;
}) {
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  if (budget === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Wydano:{" "}
        <span className="font-medium text-foreground">{formatPLN(spent)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 min-w-[200px]">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Budżet</span>
        <span className="font-medium text-foreground">
          {formatPLN(spent)} / {formatPLN(budget)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Pozostało:{" "}
        <span
          className={
            remaining < 0
              ? "text-red-600 font-medium"
              : "text-foreground font-medium"
          }
        >
          {formatPLN(remaining)}
        </span>
      </p>
    </div>
  );
}

/* ── Product Thumbnail ─────────────────────────── */
function ProductThumb({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-12 h-12 bg-muted rounded border border-border flex items-center justify-center shrink-0">
        <ImageOff className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className="w-12 h-12 object-cover rounded border border-border shrink-0"
    />
  );
}

/* ── Product Table ─────────────────────────────── */
interface ProductRow {
  id: string;
  name: string;
  image: string;
  shop: string;
  quantity: number;
  price: number;
  status: string;
  link: string;
  roomName?: string;
  isLocal?: boolean;
}

interface ProductTableProps {
  products: ProductRow[];
  showRoom?: boolean;
  onEdit?: (productId: string) => void;
}

function ProductTable({ products, showRoom, onEdit }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div
        className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg"
        data-ocid="products.empty_state"
      >
        <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        Brak produktów
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-14 pl-4">Zdjęcie</TableHead>
              {showRoom && <TableHead>Pomieszczenie</TableHead>}
              <TableHead>Nazwa</TableHead>
              <TableHead>Sklep</TableHead>
              <TableHead className="text-right">Ilość</TableHead>
              <TableHead className="text-right price-col">Cena jedn.</TableHead>
              <TableHead className="text-right price-col">Razem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10">Link</TableHead>
              {onEdit && <TableHead className="w-10 no-print" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p, i) => {
              const { label, cls } = productStatusInfo(p.status);
              const total = p.price * p.quantity;
              return (
                <TableRow
                  key={p.id}
                  data-ocid={`products.item.${i + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="pl-4">
                    <ProductThumb src={p.image} name={p.name} />
                  </TableCell>
                  {showRoom && (
                    <TableCell className="text-xs text-muted-foreground">
                      {p.roomName ?? "—"}
                    </TableCell>
                  )}
                  <TableCell className="font-medium text-sm max-w-[180px]">
                    <span className="line-clamp-2">{p.name}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.shop || "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {p.quantity}
                  </TableCell>
                  <TableCell className="text-right text-sm price-col">
                    {formatPLNDirect(p.price)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium price-col">
                    {formatPLNDirect(total)}
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
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </TableCell>
                  {onEdit && (
                    <TableCell className="no-print">
                      <button
                        type="button"
                        onClick={() => onEdit(p.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Edytuj produkt"
                        data-ocid={`products.item.${i + 1}.edit_button`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ── Add Room Modal ─────────────────────────────── */
interface AddRoomModalProps {
  projectId: bigint;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

interface RoomFormState {
  name: string;
  category: string;
  area: string;
  budget: string;
  notes: string;
}

function AddRoomModal({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: AddRoomModalProps) {
  const { mutate: addRoom, isPending } = useAddRoom();
  const [form, setForm] = useState<RoomFormState>({
    name: "",
    category: "inne",
    area: "",
    budget: "",
    notes: "",
  });

  const setField = (k: keyof RoomFormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addRoom(
      {
        projectId,
        id: BigInt(Date.now()),
        name: form.name.trim(),
        area: BigInt(Math.round(Number.parseFloat(form.area) || 0)),
        notes: form.notes.trim(),
        category: form.category,
        budget: BigInt(Math.round((Number.parseFloat(form.budget) || 0) * 100)),
        products: [],
      },
      {
        onSuccess: () => {
          toast.success("Pomieszczenie zostało dodane");
          onOpenChange(false);
          setForm({
            name: "",
            category: "inne",
            area: "",
            budget: "",
            notes: "",
          });
          onSuccess();
        },
        onError: () => toast.error("Błąd podczas dodawania pomieszczenia"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="rooms.add_room.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            Dodaj pomieszczenie
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="room-name">Nazwa *</Label>
            <Input
              id="room-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="np. Salon"
              required
              data-ocid="rooms.add_room.input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room-cat">Kategoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setField("category", v)}
              >
                <SelectTrigger id="room-cat" data-ocid="rooms.add_room.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salon">Salon</SelectItem>
                  <SelectItem value="sypialnia">Sypialnia</SelectItem>
                  <SelectItem value="lazienka">Łazienka</SelectItem>
                  <SelectItem value="kuchnia">Kuchnia</SelectItem>
                  <SelectItem value="inne">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-area">Powierzchnia (m²)</Label>
              <Input
                id="room-area"
                type="number"
                min="0"
                step="0.5"
                value={form.area}
                onChange={(e) => setField("area", e.target.value)}
                placeholder="np. 25"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="room-budget">Budżet pomieszczenia (PLN)</Label>
            <Input
              id="room-budget"
              type="number"
              min="0"
              step="100"
              value={form.budget}
              onChange={(e) => setField("budget", e.target.value)}
              placeholder="np. 15000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="room-notes">Notatki</Label>
            <Textarea
              id="room-notes"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Uwagi, wymagania..."
              rows={2}
              data-ocid="rooms.add_room.textarea"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="rooms.add_room.cancel_button"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.name.trim()}
              data-ocid="rooms.add_room.submit_button"
            >
              {isPending ? "Dodawanie..." : "Dodaj pomieszczenie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Product Form (shared between Add and Edit) ─── */
interface ProductFormState {
  name: string;
  image: string;
  price: string;
  quantity: string;
  shop: string;
  link: string;
  status: string;
  notes: string;
}

const defaultProductForm: ProductFormState = {
  name: "",
  image: "",
  price: "",
  quantity: "1",
  shop: "",
  link: "",
  status: "planned",
  notes: "",
};

interface ProductFormFieldsProps {
  form: ProductFormState;
  setField: (k: keyof ProductFormState, v: string) => void;
  mode: "add" | "edit";
}

function ProductFormFields({ form, setField, mode }: ProductFormFieldsProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-prod-name`}>Nazwa *</Label>
        <Input
          id={`${mode}-prod-name`}
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="np. Sofa Ikea KIVIK"
          required
          data-ocid={`products.${mode}_product.input`}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Zdjęcie</Label>
        <ImageInput value={form.image} onChange={(v) => setField("image", v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${mode}-prod-price`}>Cena (PLN)</Label>
          <Input
            id={`${mode}-prod-price`}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${mode}-prod-qty`}>Ilość</Label>
          <Input
            id={`${mode}-prod-qty`}
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-prod-shop`}>Sklep / Producent</Label>
        <Input
          id={`${mode}-prod-shop`}
          value={form.shop}
          onChange={(e) => setField("shop", e.target.value)}
          placeholder="np. IKEA, Westwing"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-prod-link`}>Link do sklepu</Label>
        <Input
          id={`${mode}-prod-link`}
          type="url"
          value={form.link}
          onChange={(e) => setField("link", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-prod-status`}>Status</Label>
        <Select
          value={form.status}
          onValueChange={(v) => setField("status", v)}
        >
          <SelectTrigger
            id={`${mode}-prod-status`}
            data-ocid={`products.${mode}_product.select`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planowany</SelectItem>
            <SelectItem value="ordered">Zamówiony</SelectItem>
            <SelectItem value="delivered">Dostarczony</SelectItem>
            <SelectItem value="installed">Zamontowany</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-prod-notes`}>Notatki</Label>
        <Textarea
          id={`${mode}-prod-notes`}
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Wariant koloru, wymiary, alternatywy..."
          rows={2}
          data-ocid={`products.${mode}_product.textarea`}
        />
      </div>
    </div>
  );
}

/* ── Add Product Modal ─────────────────────────── */
interface AddProductModalProps {
  projectId: string;
  room: Room;
  projectName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (product: LocalProduct) => void;
  existingProducts: LocalProduct[];
  allShoppingLists: Array<{ id: bigint; name: string; products: Product[] }>;
  onSaveList: (roomKey: string, products: LocalProduct[]) => void;
}

function AddProductModal({
  projectId,
  room,
  projectName,
  open,
  onOpenChange,
  onAdd,
  existingProducts,
  allShoppingLists,
  onSaveList,
}: AddProductModalProps) {
  const { mutate: addShoppingList, isPending } = useAddShoppingList();
  const [form, setForm] = useState<ProductFormState>(defaultProductForm);

  const setField = (k: keyof ProductFormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const roomKey = `${projectId}-${room.id.toString()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newProduct: LocalProduct = {
      id: `local-${Date.now()}`,
      name: form.name.trim(),
      image: form.image.trim(),
      price: Number.parseFloat(form.price) || 0,
      quantity: Number.parseInt(form.quantity) || 1,
      shop: form.shop.trim(),
      link: form.link.trim(),
      status: form.status,
      notes: form.notes.trim(),
      roomKey,
    };

    const updatedProducts = [...existingProducts, newProduct];
    const listName = `${projectName} - ${room.name}`;
    const total = updatedProducts.reduce(
      (acc, p) => acc + Math.round(p.price * p.quantity * 100),
      0,
    );

    const backendProducts: Product[] = updatedProducts.map((p, i) => ({
      id: BigInt(i + 1),
      name: p.name,
      image: p.image,
      price: BigInt(Math.round(p.price * 100)),
      quantity: BigInt(p.quantity),
      shop: p.shop,
      link: p.link,
      status: p.status,
      availability: "",
      projectId: BigInt(projectId),
      roomId: room.id,
    }));

    const existingList = allShoppingLists.find((l) => l.name === listName);
    const listId = existingList ? existingList.id : BigInt(Date.now());

    addShoppingList(
      {
        id: listId,
        name: listName,
        total: BigInt(total),
        discount: 0n,
        shop: "",
        products: backendProducts,
        status: "active",
      },
      {
        onSuccess: () => {
          toast.success("Produkt dodany i zapisany na liście zakupowej");
          onAdd(newProduct);
          onSaveList(roomKey, updatedProducts);
          onOpenChange(false);
          setForm(defaultProductForm);
        },
        onError: () => toast.error("Błąd podczas zapisywania produktu"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="products.add_product.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            Dodaj produkt — {room.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ProductFormFields form={form} setField={setField} mode="add" />
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="products.add_product.cancel_button"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.name.trim()}
              data-ocid="products.add_product.submit_button"
            >
              {isPending ? "Zapisywanie..." : "Dodaj produkt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Edit Product Modal ─────────────────────────── */
interface EditProductModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: LocalProduct | null;
  onSave: (updated: LocalProduct) => void;
  isPending?: boolean;
}

function EditProductModal({
  open,
  onOpenChange,
  product,
  onSave,
  isPending,
}: EditProductModalProps) {
  const [form, setForm] = useState<ProductFormState>(defaultProductForm);

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        image: product.image,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        shop: product.shop,
        link: product.link,
        status: product.status,
        notes: product.notes,
      });
    }
  }, [product]);

  const setField = (k: keyof ProductFormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !form.name.trim()) return;

    onSave({
      ...product,
      name: form.name.trim(),
      image: form.image,
      price: Number.parseFloat(form.price) || 0,
      quantity: Number.parseInt(form.quantity) || 1,
      shop: form.shop.trim(),
      link: form.link.trim(),
      status: form.status,
      notes: form.notes.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="products.edit_product.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Edytuj produkt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ProductFormFields form={form} setField={setField} mode="edit" />
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="products.edit_product.cancel_button"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.name.trim()}
              data-ocid="products.edit_product.submit_button"
            >
              {isPending ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Room Accordion Item ─────────────────────────── */
interface RoomAccordionItemProps {
  room: Room;
  index: number;
  localProducts: LocalProduct[];
  projectId: string;
  projectName: string;
  allShoppingLists: Array<{ id: bigint; name: string; products: Product[] }>;
  onAddLocalProduct: (product: LocalProduct) => void;
  onSaveList: (roomKey: string, products: LocalProduct[]) => void;
  onEditProduct: (product: LocalProduct) => void;
}

function RoomAccordionItem({
  room,
  index,
  localProducts,
  projectId,
  projectName,
  allShoppingLists,
  onAddLocalProduct,
  onSaveList,
  onEditProduct,
}: RoomAccordionItemProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const backendRows: ProductRow[] = room.products.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    image: p.image,
    shop: p.shop,
    quantity: Number(p.quantity),
    price: Number(p.price) / 100,
    status: p.status,
    link: p.link,
    isLocal: false,
  }));

  const localRows: ProductRow[] = localProducts.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    shop: p.shop,
    quantity: p.quantity,
    price: p.price,
    status: p.status,
    link: p.link,
    isLocal: true,
  }));

  const allRows = [...backendRows, ...localRows];

  const roomTotal = allRows.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const roomBudget = Number(room.budget) / 100;
  const roomPct =
    roomBudget > 0 ? Math.min((roomTotal / roomBudget) * 100, 100) : 0;

  const handleEdit = (productId: string) => {
    // Only local products can be edited (backend products require re-save)
    const lp = localProducts.find((p) => p.id === productId);
    if (lp) {
      onEditProduct(lp);
      return;
    }
    // For backend products, create a LocalProduct representation
    const bp = room.products.find((p) => p.id.toString() === productId);
    if (bp) {
      const roomKey = `${projectId}-${room.id.toString()}`;
      const asLocal: LocalProduct = {
        id: bp.id.toString(),
        name: bp.name,
        image: bp.image,
        price: Number(bp.price) / 100,
        quantity: Number(bp.quantity),
        shop: bp.shop,
        link: bp.link,
        status: bp.status,
        notes: "",
        roomKey,
      };
      onEditProduct(asLocal);
    }
  };

  return (
    <AccordionItem
      value={room.id.toString()}
      className="border border-border rounded-lg overflow-hidden mb-3"
      data-ocid={`rooms.item.${index}`}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
        <div className="flex items-center justify-between w-full mr-2">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold font-display text-sm text-foreground">
                  {room.name}
                </span>
                <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  {roomCategoryLabel(room.category)}
                </span>
                {room.area > 0n && (
                  <span className="text-xs text-muted-foreground">
                    {room.area.toString()} m²
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {allRows.length}{" "}
                {allRows.length === 1 ? "produkt" : "produktów"} ·{" "}
                {formatPLNDirect(roomTotal)}
              </p>
            </div>
          </div>
          {roomBudget > 0 && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    roomPct >= 90
                      ? "bg-red-500"
                      : roomPct >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${roomPct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatPLNDirect(roomTotal)} / {formatPLNDirect(roomBudget)}
              </span>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2">
        {room.notes && (
          <p className="text-xs text-muted-foreground mb-3 italic">
            {room.notes}
          </p>
        )}

        <ProductTable products={allRows} onEdit={handleEdit} />

        <Button
          size="sm"
          variant="outline"
          onClick={() => setModalOpen(true)}
          className="mt-3"
          data-ocid={`rooms.item.${index}.add_product.button`}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Dodaj produkt
        </Button>

        {localProducts.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            * Produkty dodane w tej sesji są zapisane na liście zakupowej
          </p>
        )}
      </AccordionContent>

      <AddProductModal
        projectId={projectId}
        room={room}
        projectName={projectName}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={onAddLocalProduct}
        existingProducts={localProducts}
        allShoppingLists={allShoppingLists}
        onSaveList={onSaveList}
      />
    </AccordionItem>
  );
}

/* ── CSV Export ─────────────────────────────────── */
function exportCSV(
  projectName: string,
  rooms: Room[],
  localMap: Map<string, LocalProduct[]>,
  projectId: string,
) {
  const headers = [
    "Pomieszczenie",
    "Nazwa",
    "Sklep",
    "Link",
    "Cena (PLN)",
    "Ilość",
    "Razem (PLN)",
    "Status",
  ];

  const rows: string[][] = [];

  for (const room of rooms) {
    for (const p of room.products) {
      const price = Number(p.price) / 100;
      rows.push([
        room.name,
        p.name,
        p.shop,
        p.link,
        price.toFixed(2),
        p.quantity.toString(),
        (price * Number(p.quantity)).toFixed(2),
        p.status,
      ]);
    }
    const roomKey = `${projectId}-${room.id.toString()}`;
    const localProds = localMap.get(roomKey) ?? [];
    for (const p of localProds) {
      rows.push([
        room.name,
        p.name,
        p.shop,
        p.link,
        p.price.toFixed(2),
        p.quantity.toString(),
        (p.price * p.quantity).toFixed(2),
        p.status,
      ]);
    }
  }

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName.replace(/\s+/g, "_")}_lista_zakupow.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("Plik CSV został pobrany");
}

/* ── Main Page ─────────────────────────────────── */
export default function ProjectDetailPage() {
  const { projectId } = useParams({ from: "/projects/$projectId" });
  const {
    data: project,
    isLoading,
    refetch,
  } = useGetProject(BigInt(projectId));
  const { data: shoppingLists } = useGetShoppingLists();
  const { mutate: addShoppingList } = useAddShoppingList();

  const [localProductMap, setLocalProductMap] = useState<
    Map<string, LocalProduct[]>
  >(new Map());

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [hidePrices, setHidePrices] = useState(false);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(
    null,
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleAddLocalProduct = useCallback((product: LocalProduct) => {
    setLocalProductMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(product.roomKey) ?? [];
      next.set(product.roomKey, [...existing, product]);
      return next;
    });
  }, []);

  const handleSaveList = useCallback(
    (roomKey: string, products: LocalProduct[]) => {
      setLocalProductMap((prev) => {
        const next = new Map(prev);
        next.set(roomKey, products);
        return next;
      });
    },
    [],
  );

  const handleEditProduct = useCallback((product: LocalProduct) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(
    (updated: LocalProduct) => {
      if (!project) return;
      setIsSavingEdit(true);

      // Find the room for this product
      const roomKey = updated.roomKey;
      const [, roomIdStr] = roomKey.split("-");

      // Update local map
      setLocalProductMap((prev) => {
        const next = new Map(prev);
        const existing = next.get(roomKey) ?? [];
        const idx = existing.findIndex((p) => p.id === updated.id);
        if (idx !== -1) {
          const updatedList = [...existing];
          updatedList[idx] = updated;
          next.set(roomKey, updatedList);
          return next;
        }
        // If it was a backend product being edited, add to local overrides
        // Remove any old local override with same id first
        const withoutOld = existing.filter((p) => p.id !== updated.id);
        next.set(roomKey, [...withoutOld, updated]);
        return next;
      });

      // Persist updated shopping list to backend
      const room = project.rooms.find((r) => r.id.toString() === roomIdStr);
      if (!room) {
        setIsSavingEdit(false);
        setEditModalOpen(false);
        toast.success("Produkt zaktualizowany");
        return;
      }

      const listName = `${project.name} - ${room.name}`;

      // Get current local products for this room (after update)
      setLocalProductMap((prev) => {
        const allLocal = prev.get(roomKey) ?? [];

        const backendProds: Product[] = allLocal.map((p, i) => ({
          id: BigInt(i + 1),
          name: p.name,
          image: p.image,
          price: BigInt(Math.round(p.price * 100)),
          quantity: BigInt(p.quantity),
          shop: p.shop,
          link: p.link,
          status: p.status,
          availability: "",
          projectId: BigInt(projectId),
          roomId: room.id,
        }));

        const total = allLocal.reduce(
          (acc, p) => acc + Math.round(p.price * p.quantity * 100),
          0,
        );

        const existingList = (shoppingLists ?? []).find(
          (l) => l.name === listName,
        );
        const listId = existingList ? existingList.id : BigInt(Date.now());

        addShoppingList(
          {
            id: listId,
            name: listName,
            total: BigInt(total),
            discount: 0n,
            shop: "",
            products: backendProds,
            status: "active",
          },
          {
            onSuccess: () => {
              toast.success("Produkt zaktualizowany");
              setIsSavingEdit(false);
              setEditModalOpen(false);
              setEditingProduct(null);
            },
            onError: () => {
              toast.error("Błąd podczas zapisywania zmian");
              setIsSavingEdit(false);
            },
          },
        );

        return prev; // don't change map here, already updated above
      });
    },
    [project, projectId, shoppingLists, addShoppingList],
  );

  const allProductRows = useMemo<(ProductRow & { roomName: string })[]>(() => {
    if (!project) return [];
    const rows: (ProductRow & { roomName: string })[] = [];
    for (const room of project.rooms) {
      for (const p of room.products) {
        rows.push({
          id: p.id.toString(),
          name: p.name,
          image: p.image,
          shop: p.shop,
          quantity: Number(p.quantity),
          price: Number(p.price) / 100,
          status: p.status,
          link: p.link,
          roomName: room.name,
        });
      }
      const roomKey = `${projectId}-${room.id.toString()}`;
      const localProds = localProductMap.get(roomKey) ?? [];
      for (const p of localProds) {
        rows.push({
          id: p.id,
          name: p.name,
          image: p.image,
          shop: p.shop,
          quantity: p.quantity,
          price: p.price,
          status: p.status,
          link: p.link,
          roomName: room.name,
          isLocal: true,
        });
      }
    }
    return rows;
  }, [project, localProductMap, projectId]);

  const totalSpentCents = useMemo(() => {
    return allProductRows.reduce(
      (acc, p) => acc + Math.round(p.price * p.quantity * 100),
      0,
    );
  }, [allProductRows]);

  const normalizedShoppingLists = useMemo(
    () =>
      (shoppingLists ?? []).map((l) => ({
        id: l.id,
        name: l.name,
        products: l.products,
      })),
    [shoppingLists],
  );

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="project_detail.loading_state">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold font-display text-foreground mb-2">
          Projekt nie znaleziony
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Projekt mógł zostać usunięty lub nie masz do niego dostępu.
        </p>
        <Link to="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Powrót do projektów
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${hidePrices ? "hide-prices" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/projects">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mt-0.5 no-print"
              data-ocid="project_detail.back.button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
              {project.name}
            </h1>
            {project.timeline && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {project.timeline}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={hidePrices}
              onChange={(e) => setHidePrices(e.target.checked)}
              className="rounded"
              data-ocid="project_detail.hide_prices.checkbox"
            />
            Ukryj ceny
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportCSV(project.name, project.rooms, localProductMap, projectId)
            }
            data-ocid="project_detail.export_csv.button"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-ocid="project_detail.print.button"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Drukuj
          </Button>
        </div>
      </div>

      {/* Budget widget */}
      <div className="bg-card border border-border rounded-lg p-4">
        <BudgetWidget budget={Number(project.budget)} spent={totalSpentCents} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList className="h-9" data-ocid="project_detail.tabs">
          <TabsTrigger
            value="rooms"
            className="text-sm"
            data-ocid="project_detail.rooms.tab"
          >
            Pomieszczenia ({project.rooms.length})
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="text-sm"
            data-ocid="project_detail.products.tab"
          >
            Wszystkie produkty ({allProductRows.length})
          </TabsTrigger>
        </TabsList>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {project.rooms.length === 0
                ? "Brak pomieszczeń. Dodaj pierwsze pomieszczenie."
                : `${project.rooms.length} ${project.rooms.length === 1 ? "pomieszczenie" : "pomieszczeń"}`}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddRoomOpen(true)}
              data-ocid="rooms.add_room.primary_button"
              className="no-print"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Dodaj pomieszczenie
            </Button>
          </div>

          {project.rooms.length === 0 ? (
            <div
              className="border-2 border-dashed border-border rounded-lg py-12 text-center"
              data-ocid="rooms.empty_state"
            >
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Dodaj pomieszczenie, aby zacząć tworzyć listę zakupową
              </p>
              <Button
                size="sm"
                onClick={() => setAddRoomOpen(true)}
                data-ocid="rooms.empty_state.primary_button"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Dodaj pomieszczenie
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-0">
              {project.rooms.map((room, i) => {
                const roomKey = `${projectId}-${room.id.toString()}`;
                const localProds = localProductMap.get(roomKey) ?? [];
                return (
                  <RoomAccordionItem
                    key={room.id.toString()}
                    room={room}
                    index={i + 1}
                    localProducts={localProds}
                    projectId={projectId}
                    projectName={project.name}
                    allShoppingLists={normalizedShoppingLists}
                    onAddLocalProduct={handleAddLocalProduct}
                    onSaveList={handleSaveList}
                    onEditProduct={handleEditProduct}
                  />
                );
              })}
            </Accordion>
          )}
        </TabsContent>

        {/* All Products Tab */}
        <TabsContent value="products">
          <ProductTable
            products={allProductRows}
            showRoom
            onEdit={(id) => {
              const p = allProductRows.find((r) => r.id === id);
              if (!p) return;
              const room = project.rooms.find((r) =>
                r.products.some((bp) => bp.id.toString() === id),
              );
              const roomId = room?.id.toString() ?? "";
              handleEditProduct({
                id: p.id,
                name: p.name,
                image: p.image,
                price: p.price,
                quantity: p.quantity,
                shop: p.shop,
                link: p.link,
                status: p.status,
                notes: "",
                roomKey: `${projectId}-${roomId}`,
              });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Add Room Modal */}
      <AddRoomModal
        projectId={project.id}
        open={addRoomOpen}
        onOpenChange={setAddRoomOpen}
        onSuccess={() => refetch()}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={editModalOpen}
        onOpenChange={(v) => {
          setEditModalOpen(v);
          if (!v) setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveEdit}
        isPending={isSavingEdit}
      />
    </div>
  );
}
