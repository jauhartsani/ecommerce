import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/database";
import { formatRupiah, discountPercent } from "@/lib/utils";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const discount = discountPercent(product.original_price || 0, product.price);

  return (
    <Link href={`/produk/${product.slug}`} className="group block">
      <div
        className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col ${
          compact ? "" : "hover:-translate-y-0.5"
        }`}
      >
        {/* Image */}
        <div
          className={`relative overflow-hidden bg-gray-50 ${
            compact ? "aspect-square" : "aspect-square"
          }`}
        >
          {product.image_url || (product.gallery_urls?.length ?? 0) > 0 ? (
            <Image
              src={product.image_url || product.gallery_urls?.[0] || ""}
              alt={product.name}
              fill
              sizes={compact ? "160px" : "(max-width: 640px) 50vw, 200px"}
              style={{ objectFit: "cover" }}
              className="group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
              <ShoppingCart className="text-brand-300" size={32} />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
              -{discount}%
            </span>
          )}
          {product.is_flash_sale && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
              ⚡ SALE
            </span>
          )}
        </div>

        {/* Info */}
        <div className={`flex flex-col flex-1 ${compact ? "p-2.5" : "p-3"}`}>
          <h3
            className={`font-semibold text-gray-800 line-clamp-2 leading-tight ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {product.name}
          </h3>

          {!compact && product.sold_count > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-400">{product.sold_count} terjual</span>
            </div>
          )}

          <div className="mt-auto pt-2">
            <p
              className={`font-bold text-brand-700 ${compact ? "text-sm" : "text-base"}`}
            >
              {formatRupiah(product.price)}
            </p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-xs text-gray-400 line-through">
                {formatRupiah(product.original_price)}
              </p>
            )}
          </div>

          {!compact && product.tiktok_url && (
            <div className="mt-3 flex items-center gap-2 text-xs text-pink-600 font-semibold">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-700">🎵</span>
              <span className="line-clamp-1">Video TikTok tersedia</span>
            </div>
          )}

          {!compact && (
            <div className="mt-2 w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 rounded-xl text-center transition-colors">
              Pesan Sekarang
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
