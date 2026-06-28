import { createServerClient } from "@/lib/supabase";
import { Product, SiteSettings } from "@/types/database";
import { notFound } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import ProductPageClient from "@/components/home/ProductPageClient";
import ProductCard from "@/components/home/ProductCard";
import type { Metadata } from "next";
import { formatRupiah, discountPercent } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

async function getData(slug: string) {
  const supabase = createServerClient();

  const [productRes, allProductsRes, settingsRes] = await Promise.all([
    supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).single(),
    supabase.from("products").select("*").eq("is_active", true).order("sold_count", { ascending: false }),
    supabase.from("settings").select("*"),
  ]);

  if (productRes.error || !productRes.data) return null;

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

  const allProducts = (allProductsRes.data as Product[]) || [];
  const related = allProducts.filter(
    (p) => p.id !== productRes.data.id && p.category === productRes.data.category
  ).slice(0, 4);
  const recomended = related.length < 4
    ? [...related, ...allProducts.filter(p => p.id !== productRes.data.id && !related.find(r => r.id === p.id)).slice(0, 4 - related.length)]
    : related;

  return { product: productRes.data as Product, settings, recomended };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getData(params.slug);
  if (!data) return { title: "Produk Tidak Ditemukan" };
  const { product } = data;
  const ogImage = product.image_url || product.gallery_urls?.[0] || "";
  return {
    title: `${product.name} — HealthPro`,
    description: product.description || `Beli ${product.name} dengan harga terbaik. ${formatRupiah(product.price)}`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const data = await getData(params.slug);
  if (!data) notFound();

  const { product, settings, recomended } = data;
  const discount = discountPercent(product.original_price || 0, product.price);

  return (
    <>
      <Navbar siteName={settings.site_name} />
      <main className="bg-gray-50 min-h-screen pb-16">
        <ProductPageClient product={product} settings={settings} discount={discount} />

        {/* Recommendations */}
        {recomended.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 mt-6">
            <h2 className="font-display font-bold text-gray-900 text-base mb-3">
              Produk Rekomendasi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recomended.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
