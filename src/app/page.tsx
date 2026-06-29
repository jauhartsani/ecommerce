import { createServerClient } from "@/lib/supabase";
import { Banner, Product, SiteSettings } from "@/types/database";
import HeroSlider from "@/components/home/HeroSlider";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import ProductCard from "@/components/home/ProductCard";
import Navbar from "@/components/home/Navbar";
import TikTokVideoCard from "@/components/home/TikTokVideoCard";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

async function getData() {
  const supabase = createServerClient();

  const [bannersRes, productsRes, settingsRes] = await Promise.all([
    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
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

  const allBanners = (bannersRes.data as Banner[]) || [];
  const allProducts = (productsRes.data as Product[]) || [];

  return {
    heroBanners: allBanners.filter((b) => b.section === "hero"),
    midBanners: allBanners.filter((b) => b.section === "mid"),
    flashProducts: allProducts.filter((p) => p.is_flash_sale),
    featuredProducts: allProducts.filter((p) => p.is_featured),
    allProducts,
    settings,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getData();
  return {
    title: `${settings.site_name} — ${settings.seo_title_suffix || "Produk Kesehatan Terpercaya"}`,
    description: settings.seo_description || "Temukan produk kesehatan terbaik dengan harga terjangkau. Flash sale setiap hari!",
    verification: {
      google: "NnxHlqOU7nqp1zZa_hvhbZrr5Cf8-DphG4nNJtDocyM",
    },
  };
}

export default async function HomePage() {
  const { heroBanners, midBanners, flashProducts, featuredProducts, allProducts, settings } =
    await getData();

  const recentProducts = allProducts.slice(0, 8);
  const tiktokProducts = allProducts.filter((p) => p.tiktok_url).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: settings.site_name,
            url: process.env.NEXT_PUBLIC_SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${process.env.NEXT_PUBLIC_SITE_URL}/produk?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <Navbar siteName={settings.site_name} />

      <main className="bg-gray-50 min-h-screen pb-10">
        {/* Hero Slider */}
        <HeroSlider banners={heroBanners} />

        {/* Flash Sale */}
        {flashProducts.length > 0 && (
          <FlashSaleSection products={flashProducts} />
        )}

        {/* Mid Banner */}
        {midBanners.length > 0 && (
          <div className="mt-4 px-4">
            {midBanners.slice(0, 1).map((b) => {
              const Inner = (
                <div className="relative w-full aspect-[5/2] rounded-2xl overflow-hidden">
                  <Image
                    src={b.image_url}
                    alt={b.alt_text || "promo"}
                    fill
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              );
              return b.link_url ? (
                <Link key={b.id} href={b.link_url}>
                  {Inner}
                </Link>
              ) : (
                <div key={b.id}>{Inner}</div>
              );
            })}
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="mt-5 px-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-accent font-bold uppercase tracking-widest">Pilihan Terbaik</span>
                <h2 className="font-display font-bold text-gray-900 text-lg">Produk Unggulan</h2>
              </div>
              <Link href="/produk?featured=1" className="text-brand-600 text-sm font-medium flex items-center gap-0.5">
                Semua <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {tiktokProducts.length > 0 && (
          <section className="mt-5 px-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-pink-600 font-bold uppercase tracking-widest">Video</span>
                <h2 className="font-display font-bold text-gray-900 text-lg">TikTok Produk</h2>
              </div>
              <Link href="/produk" className="text-pink-600 text-sm font-medium flex items-center gap-0.5">
                Lihat Semua <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tiktokProducts.map((p) => (
                <TikTokVideoCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-brand-600 font-bold uppercase tracking-widest">Koleksi Lengkap</span>
              <h2 className="font-display font-bold text-gray-900 text-lg">Semua Produk</h2>
            </div>
            <Link href="/produk" className="text-brand-600 text-sm font-medium flex items-center gap-0.5">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {allProducts.length > 8 && (
            <div className="mt-4 text-center">
              <Link
                href="/produk"
                className="inline-block bg-white border border-brand-300 text-brand-700 font-semibold px-6 py-3 rounded-full text-sm hover:bg-brand-50 transition-colors"
              >
                Lihat Semua {allProducts.length} Produk →
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
