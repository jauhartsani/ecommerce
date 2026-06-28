"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/banners", label: "Banner", icon: ImageIcon },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    router.push("/admin/login");
    router.refresh();
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-brand-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full mt-2"
      >
        <LogOut size={18} />
        Logout
      </button>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <span className="font-display font-bold text-brand-700">Admin Panel</span>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-white p-4 pt-16 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 px-4">
              <h2 className="font-display font-bold text-lg text-brand-700">HealthPro</h2>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
            <NavLinks />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 lg:w-64 flex-col bg-white border-r border-gray-200 p-4 gap-1 sticky top-0 h-screen">
        <div className="mb-6 px-4">
          <h2 className="font-display font-bold text-xl text-brand-700">HealthPro</h2>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile top padding */}
      <div className="md:hidden h-14" />
    </>
  );
}
