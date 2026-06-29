"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/database";
import { formatRupiah, slugify } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, X, ToggleLeft, ToggleRight, Star, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  original_price: "",
  description: "",
  long_description: "",
  image_url: "",
  gallery_urls: "",
  category: "",
  tiktok_url: "",
  is_active: true,
  is_featured: false,
  is_flash_sale: false,
  stock: "0",
  sold_count: "0",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"basic" | "detail">("basic");

  const categoryOptions = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  ).sort();

  const galleryImages = form.gallery_urls
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setTab("basic");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      description: p.description || "",
      long_description: p.long_description || "",
      image_url: p.image_url || "",
      gallery_urls: (p.gallery_urls || []).join("\n"),
      category: p.category || "",
      tiktok_url: p.tiktok_url || "",
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_flash_sale: p.is_flash_sale,
      stock: String(p.stock),
      sold_count: String(p.sold_count),
    });
    setEditId(p.id);
    setTab("basic");
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: editId ? f.slug : slugify(name) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error("Nama dan harga wajib diisi");
    if (!form.slug) return toast.error("Slug wajib diisi");
    setSaving(true);
    try {
      const galleries = form.gallery_urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
      const payload = {
        name: form.name,
        slug: form.slug,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        description: form.description || null,
        long_description: form.long_description || null,
        image_url: form.image_url || null,
        gallery_urls: galleries.length ? galleries : null,
        category: form.category || null,
        tiktok_url: form.tiktok_url || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_flash_sale: form.is_flash_sale,
        stock: parseInt(form.stock) || 0,
        sold_count: parseInt(form.sold_count) || 0,
        ...(editId ? { id: editId } : {}),
      };
      const res = await fetch("/api/products", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editId ? "Produk diupdate!" : "Produk ditambahkan!");
      setShowModal(false);
      fetchProducts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    toast.success("Produk dihapus");
    fetchProducts();
  };

  const handleToggle = async (p: Product, field: "is_active" | "is_featured" | "is_flash_sale") => {
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, [field]: !p[field] }),
    });
    fetchProducts();
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 transition-all";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produk terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-gray-400" size={32} /></div>
      ) : (
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="admin-card text-center py-12 text-gray-400">Belum ada produk.</div>
          ) : products.map((p) => (
            <div key={p.id} className={`admin-card flex items-center gap-4 ${!p.is_active ? "opacity-60" : ""}`}>
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill style={{ objectFit: "cover" }} sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-800 text-sm">{p.name}</h3>
                  {p.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5"><Star size={10} /> Unggulan</span>}
                  {p.is_flash_sale && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5"><Zap size={10} /> Flash Sale</span>}
                </div>
                <p className="text-brand-600 font-semibold text-sm">{formatRupiah(p.price)}</p>
                <p className="text-gray-400 text-xs">/produk/{p.slug}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => handleToggle(p, "is_featured")} title="Unggulan" className={`p-2 rounded-lg ${p.is_featured ? "text-yellow-500 bg-yellow-50" : "text-gray-300 hover:bg-gray-100"}`}><Star size={16} /></button>
                <button onClick={() => handleToggle(p, "is_flash_sale")} title="Flash Sale" className={`p-2 rounded-lg ${p.is_flash_sale ? "text-red-500 bg-red-50" : "text-gray-300 hover:bg-gray-100"}`}><Zap size={16} /></button>
                <button onClick={() => handleToggle(p, "is_active")} className={`p-2 rounded-lg ${p.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                  {p.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-display font-bold text-gray-900">{editId ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              {(["basic", "detail"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? "border-b-2 border-brand-600 text-brand-600" : "text-gray-500"}`}>
                  {t === "basic" ? "Info Dasar" : "Detail & Galeri"}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {tab === "basic" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Produk *</label>
                    <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={inputCls} placeholder="Nama produk" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug URL *</label>
                    <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="nama-produk" />
                    <p className="text-xs text-gray-400 mt-1">/produk/{form.slug || "slug-produk"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Jual (Rp) *</label>
                      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="150000" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Asli (coret)</label>
                      <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className={inputCls} placeholder="200000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi Singkat</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls + " resize-none"} placeholder="Deskripsi singkat produk..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL Foto Utama</label>
                    <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} placeholder="https://contoh.com/foto.jpg" />
                    {form.image_url && (
                      <p className="text-xs text-gray-400 mt-1 break-words">Preview: {form.image_url}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Link Video TikTok</label>
                    <input type="url" value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} className={inputCls} placeholder="https://www.tiktok.com/@user/video/123" />
                    <p className="text-xs text-gray-400 mt-1">Link video akan ditampilkan di halaman detail produk dan unggulan.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori</label>
                    <div className="relative">
                      <input
                        list="category-options"
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className={inputCls}
                        placeholder="suplemen, vitamin, herbal..."
                      />
                      <datalist id="category-options">
                        {categoryOptions.map((category) => (
                          <option key={category} value={category} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Toggle switches */}
                  <div className="space-y-3 pt-2">
                    {([
                      { key: "is_active", label: "Aktif (tampil di toko)", color: "bg-brand-600" },
                      { key: "is_featured", label: "Produk Unggulan", color: "bg-yellow-500" },
                      { key: "is_flash_sale", label: "Flash Sale (tampil di flash sale)", color: "bg-red-500" },
                    ] as const).map(({ key, label, color }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                          className={`w-11 h-6 rounded-full transition-colors ${form[key] ? color : "bg-gray-300"}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form[key] ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi Lengkap (HTML diperbolehkan)</label>
                    <textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} rows={8} className={inputCls + " resize-none font-mono text-xs"} placeholder="<p>Deskripsi panjang produk...</p>" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL Galeri (satu URL per baris)</label>
                    <textarea value={form.gallery_urls} onChange={(e) => setForm({ ...form, gallery_urls: e.target.value })} rows={4} className={inputCls + " resize-none font-mono text-xs"} placeholder={"https://contoh.com/foto1.jpg\nhttps://contoh.com/foto2.jpg"} />
                    {galleryImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {galleryImages.map((url, index) => (
                          <div key={index} className="rounded-2xl border border-gray-200 p-2 text-xs text-gray-500 break-words">
                            <div className="font-semibold text-gray-700">Gambar {index + 1}</div>
                            <div>{url}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stok</label>
                      <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jumlah Terjual</label>
                      <input type="number" value={form.sold_count} onChange={(e) => setForm({ ...form, sold_count: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
