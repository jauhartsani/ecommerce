import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

async function getSitemapUrls() {
  const supabase = createServerClient();
  const [productsRes] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
  ]);

  const products = (productsRes.data || []) as { slug: string; updated_at: string }[];

  const urls = [
    { loc: baseUrl, lastmod: new Date().toISOString() },
    { loc: `${baseUrl}/produk`, lastmod: new Date().toISOString() },
  ];

  products.forEach((product) => {
    urls.push({
      loc: `${baseUrl}/produk/${product.slug}`,
      lastmod: product.updated_at ? new Date(product.updated_at).toISOString() : new Date().toISOString(),
    });
  });

  return urls;
}

export async function GET() {
  const urls = await getSitemapUrls();

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n  </url>`
    )
    .join("\n")}\n</urlset>`;

  return new NextResponse(sitemapXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
