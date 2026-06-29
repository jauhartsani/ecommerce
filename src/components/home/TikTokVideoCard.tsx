import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";
import { getTikTokEmbedUrl } from "@/lib/utils";

interface TikTokVideoCardProps {
  product: Product;
}

export default function TikTokVideoCard({ product }: TikTokVideoCardProps) {
  const embedUrl = product.tiktok_url ? getTikTokEmbedUrl(product.tiktok_url) : null;

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="relative w-full aspect-[9/16] bg-gray-100">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`TikTok ${product.name}`}
            className="w-full h-full"
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin"
          />
        ) : product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No preview</div>
        )}
      </div>

      <div className="p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-pink-600 font-semibold mb-2">TikTok</div>
        <h3 className="font-semibold text-gray-900 text-base line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {product.description || "Temukan detail dan penawaran produk ini di halaman produk."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={`/produk/${product.slug}`}
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Lihat Produk
          </Link>
          {product.tiktok_url && (
            <Link
              href={product.tiktok_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-pink-100 px-4 py-2 text-xs font-semibold text-pink-700 hover:bg-pink-200 transition-colors"
            >
              Buka TikTok
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
