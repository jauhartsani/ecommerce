import { createServerClient } from "@/lib/supabase";
import { Product, SiteSettings } from "@/types/database";
import ProductCard from "@/components/home/ProductCard";
import Navbar from "@/components/home/Navbar";
import FlashSaleTimer from "@/components/ui/FlashSaleTimer";
import { Zap, Star, Search } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getData({});
  return {
    title: `${settings.site_name} — ${settings.seo_title_suffix || "Produk Kesehatan Terpercaya"}`,
    description: settings.seo_description || "Temukan produk kesehatan terbaik dengan harga terjangkau. Flash sale setiap hari!",
  };
}

interface SearchParams {
  flash?: string;
  featured?: string;
  q?: string;
  kategori?: string;
}

async function getData(searchParams: SearchParams) {
  const supabase = createServerClient();

  const [productsRes, settingsRes] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sold_count", { ascending: false }),
    supabase.from("settings").select("*"),
  ]);

  const settings: SiteSettings = {
    site_name: "HealthPro",
    whatsapp_number: "6281234567890",
    bank_name: "BCA",
    account_number: "1234567890",
    account_holder: "Admin HealthPro",
    seo_title_suffix: "Produk Kesehatan Terpercaya",
    seo_description: "Temukan produk kesehatan terbaik dengan harga terjangkau. Flash sale setiap hari!",
  };
  settingsRes.data?.forEach((s: { key: string; value: string }) => {
    const key = s.key as keyof SiteSettings;
    if (key in settings) {
      (settings as Record<keyof SiteSettings, string>)[key] = s.value;
    }
  });

  let products = (productsRes.data as Product[]) || [];

  if (searchParams.flash === "1") {
    products = products.filter((p) => p.is_flash_sale);
  } else if (searchParams.featured === "1") {
    products = products.filter((p) => p.is_featured);
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }
  if (searchParams.kategori) {
    products = products.filter((p) => p.category === searchParams.kategori);
  }

  return { products, settings };
}

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, settings } = await getData(searchParams);
  const isFlash = searchParams.flash === "1";
  const isFeatured = searchParams.featured === "1";

  return (
    <>
      <Navbar siteName={settings.site_name} />
      <main className="bg-gray-50 min-h-screen pb-10">
        {/* Filter tabs */}
        <div className="bg-white border-b border-gray-100 sticky top-14 z-30">
          <div className="max-w-5xl mx-auto px-4 flex gap-2 overflow-x-auto py-3 scrollbar-none">
            <Link
              href="/produk"
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !isFlash && !isFeatured
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua
            </Link>
            <Link
              href="/produk?flash=1"
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isFlash
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Zap size={13} />
              Flash Sale
            </Link>
            <Link
              href="/produk?featured=1"
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isFeatured
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Star size={13} />
              Unggulan
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-4">
          {/* Flash sale banner */}
          {isFlash && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={18} className="text-white fill-white" />
                  <span className="text-white font-display font-bold text-lg">Flash Sale</span>
                </div>
                <p className="text-white/80 text-xs">Harga spesial untuk kamu!</p>
              </div>
              <FlashSaleTimer size="md" label="" />
            </div>
          )}

          <p className="text-xs text-gray-400 mb-3">
            Menampilkan <strong>{products.length}</strong> produk
          </p>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">Produk tidak ditemukan</p>
              <Link href="/produk" className="mt-2 inline-block text-brand-600 text-sm">
                Lihat semua produk
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
