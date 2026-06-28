import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";

interface NavbarProps {
  siteName: string;
}

export default function Navbar({ siteName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-brand-600 shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <ShoppingBag size={16} className="text-brand-600" />
          </div>
          <span className="font-display font-bold text-white text-base leading-tight">
            {siteName}
          </span>
        </Link>

        {/* Search bar */}
        <Link
          href="/produk"
          className="flex-1 flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-3 py-2 text-white/80 text-sm transition-colors min-w-0"
        >
          <Search size={15} className="flex-shrink-0" />
          <span className="text-white/70 text-xs truncate">Cari produk kesehatan...</span>
        </Link>

        <Link
          href="/produk"
          className="flex-shrink-0 bg-accent hover:bg-accent-dark text-white text-xs font-bold px-3 py-2 rounded-full transition-colors"
        >
          Produk
        </Link>
      </div>
    </header>
  );
}
