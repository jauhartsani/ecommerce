"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { Loader2, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTS: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "baru", label: "Baru" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

const STATUS_STYLES: Record<string, string> = {
  baru: "bg-blue-100 text-blue-700 border-blue-200",
  diproses: "bg-yellow-100 text-yellow-700 border-yellow-200",
  selesai: "bg-green-100 text-green-700 border-green-200",
  dibatalkan: "bg-red-100 text-red-700 border-red-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.data || []);
    setCount(data.count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal update");
      toast.success("Status diupdate!");
      fetchOrders();
    } catch {
      toast.error("Gagal mengupdate status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.whatsapp.includes(search)
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-500 text-sm mt-1">Total {count} pesanan</p>
        </div>
        <button onClick={fetchOrders} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === s.value ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto bg-gray-100 rounded-xl px-3 flex-1 sm:max-w-56">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / order ID..."
              className="flex-1 bg-transparent text-sm outline-none py-2"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16"><Loader2 size={32} className="animate-spin mx-auto text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-card text-center py-12 text-gray-400">Tidak ada pesanan</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="admin-card">
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{order.order_id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 mt-1">{order.name}</p>
                  <p className="text-gray-500 text-sm">{order.product_name} ×{order.quantity}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>

              {/* Expanded Detail */}
              {expandedId === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
                    {[
                      ["WhatsApp", order.whatsapp],
                      ["Email", order.email || "-"],
                      ["Alamat", order.address],
                      ["Catatan", order.notes || "-"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span className="text-gray-400 text-xs block">{k}</span>
                        <span className="text-gray-700 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Update */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500">Ubah status:</span>
                    {(["baru", "diproses", "selesai", "dibatalkan"] as OrderStatus[]).map((s) => (
                      <button
                        key={s}
                        disabled={order.status === s || updatingId === order.id}
                        onClick={() => updateStatus(order.id, s)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${order.status === s ? STATUS_STYLES[s] : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {updatingId === order.id && order.status !== s ? (
                          <Loader2 size={10} className="animate-spin inline mr-1" />
                        ) : null}
                        {s}
                      </button>
                    ))}

                    <a
                      href={`https://wa.me/${order.whatsapp.replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-500 transition-colors"
                    >
                      WA Customer
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
