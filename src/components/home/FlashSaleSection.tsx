import { Product } from "@/types/database";
import ProductCard from "./ProductCard";
import FlashSaleTimer from "@/components/ui/FlashSaleTimer";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function FlashSaleSection({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-xl p-1.5">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-white font-display font-bold text-lg">Flash Sale</span>
        </div>
        <FlashSaleTimer size="sm" label="" />
      </div>

      {/* Scrollable product row */}
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
        {products.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-36 snap-start">
            <ProductCard product={p} compact />
          </div>
        ))}
      </div>

      <div className="mt-3 text-center">
        <Link
          href="/produk?flash=1"
          className="inline-block bg-white text-red-600 text-xs font-bold px-5 py-2 rounded-full hover:bg-red-50 transition-colors"
        >
          Lihat Semua Flash Sale →
        </Link>
      </div>
    </section>
  );
}
