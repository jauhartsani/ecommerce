import { createAdminClient } from "@/lib/supabase-admin";
import { ShoppingBag, Package, Image, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Order } from "@/types/database";

async function getStats() {
  const admin = createAdminClient();
  const [orders, products, banners, newOrders] = await Promise.all([
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("banners").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "baru"),
  ]);
  return {
    totalOrders: orders.count || 0,
    totalProducts: products.count || 0,
    totalBanners: banners.count || 0,
    newOrders: newOrders.count || 0,
  };
}

async function getRecentOrders(): Promise<Order[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to load recent orders", error);
    return [];
  }

  return (data as Order[] | null) ?? [];
}

const STATUS_STYLES: Record<string, string> = {
  baru: "bg-blue-100 text-blue-700",
  diproses: "bg-yellow-100 text-yellow-700",
  selesai: "bg-green-100 text-green-700",
  dibatalkan: "bg-red-100 text-red-700",
};

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

  const cards = [
    { label: "Total Pesanan", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-500", href: "/admin/orders" },
    { label: "Pesanan Baru", value: stats.newOrders, icon: TrendingUp, color: "bg-accent", href: "/admin/orders?status=baru" },
    { label: "Produk Aktif", value: stats.totalProducts, icon: Package, color: "bg-brand-600", href: "/admin/products" },
    { label: "Banner Aktif", value: stats.totalBanners, icon: Image, color: "bg-purple-500", href: "/admin/banners" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="admin-card hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="text-white" size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-800">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-brand-600 text-sm font-medium">
            Lihat semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-gray-500 font-medium">Order ID</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">Nama</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium hidden sm:table-cell">Produk</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Belum ada pesanan</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-mono text-xs text-gray-700">{order.order_id}</td>
                    <td className="py-3 px-2 font-medium text-gray-800">{order.name}</td>
                    <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">{order.product_name} ×{order.quantity}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
