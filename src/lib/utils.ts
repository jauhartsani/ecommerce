export function generateOrderId(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${y}${m}${d}-${rand}`;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function normalizeWhatsApp(number: string): string {
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("62")) return cleaned;
  return "62" + cleaned;
}

export function buildWhatsAppMessage(data: {
  orderId: string;
  name: string;
  whatsapp: string;
  email?: string;
  address: string;
  productName: string;
  quantity: number;
  notes?: string;
}): string {
  return encodeURIComponent(
    `Halo Admin,\n\nSaya ingin memesan.\n\nOrder ID: ${data.orderId}\nNama: ${data.name}\nNomor WA: ${data.whatsapp}\nEmail: ${data.email || "-"}\nAlamat: ${data.address}\nProduk: ${data.productName}\nJumlah: ${data.quantity}\nCatatan: ${data.notes || "-"}\n\nSaya akan segera mengirim bukti transfer.\n\nTerima kasih.`
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function discountPercent(original: number, sale: number): number {
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/** 
 * Flash sale: timer end is stored per-session.
 * Each user gets 30 minutes from their first visit.
 */
export function getFlashSaleEndTime(): Date {
  if (typeof window === "undefined") return new Date(Date.now() + 30 * 60 * 1000);
  const stored = sessionStorage.getItem("flash_sale_end");
  if (stored) {
    const end = new Date(stored);
    if (end > new Date()) return end;
  }
  const end = new Date(Date.now() + 30 * 60 * 1000);
  sessionStorage.setItem("flash_sale_end", end.toISOString());
  return end;
}
