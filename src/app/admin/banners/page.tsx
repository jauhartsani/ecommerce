"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/types/database";
import { Trash2, Loader2, Eye, EyeOff, ChevronUp, ChevronDown, Plus, Link as LinkIcon, X, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

const SECTIONS = [
  { value: "hero", label: "Hero Slider (Beranda)" },
  { value: "mid", label: "Banner Tengah (Beranda)" },
  { value: "masalah", label: "Banner Masalah" },
  { value: "solusi", label: "Banner Solusi" },
  { value: "manfaat", label: "Banner Manfaat" },
  { value: "testimoni", label: "Banner Testimoni" },
  { value: "promo", label: "Banner Promo" },
];

const emptyForm = {
  section: "hero",
  image_url: "",
  link_url: "",
  alt_text: "",
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const fetchBanners = async () => {
    const res = await fetch("/api/banners");
    const data = await res.json();
    setBanners(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setPreview(false);
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setForm({
      section: b.section,
      image_url: b.image_url,
      link_url: b.link_url || "",
      alt_text: b.alt_text || "",
    });
    setEditId(b.id);
    setPreview(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.image_url) return toast.error("URL gambar wajib diisi");
    try {
      new URL(form.image_url);
    } catch {
      return toast.error("URL gambar tidak valid");
    }
    setSaving(true);
    try {
      const sectionBanners = banners.filter((b) => b.section === form.section);
      const payload = {
        section: form.section,
        image_url: form.image_url,
        link_url: form.link_url || null,
        alt_text: form.alt_text || null,
        sort_order: editId ? undefined : sectionBanners.length,
        ...(editId ? { id: editId } : {}),
      };
      const res = await fetch("/api/banners", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editId ? "Banner diupdate!" : "Banner ditambahkan!");
      setShowModal(false);
      fetchBanners();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm("Hapus banner ini?")) return;
    await fetch(`/api/banners?id=${banner.id}`, { method: "DELETE" });
    toast.success("Banner dihapus");
    fetchBanners();
  };

  const handleToggle = async (banner: Banner) => {
    await fetch("/api/banners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: banner.id, is_active: !banner.is_active }),
    });
    fetchBanners();
  };

  const handleReorder = async (banner: Banner, dir: "up" | "down") => {
    const sectionBanners = banners
      .filter((b) => b.section === banner.section)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = sectionBanners.findIndex((b) => b.id === banner.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sectionBanners.length) return;
    const swap = sectionBanners[swapIdx];
    await Promise.all([
      fetch("/api/banners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: banner.id, sort_order: swap.sort_order }) }),
      fetch("/api/banners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: swap.id, sort_order: banner.sort_order }) }),
    ]);
    fetchBanners();
  };

  const grouped = SECTIONS.reduce<Record<string, Banner[]>>((acc, s) => {
    acc[s.value] = banners.filter((b) => b.section === s.value).sort((a, b) => a.sort_order - b.sort_order);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Kelola Banner</h1>
          <p className="text-gray-500 text-sm mt-1">Atur banner dengan memasukkan URL gambar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
          <Plus size={16} /> Tambah Banner
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-sm text-blue-700">
        <strong>💡 Cara upload gambar:</strong> Upload gambar ke Google Drive / ImgBB / Cloudinary / Supabase Storage, lalu copy URL-nya dan paste di sini.
        <br />
        <span className="text-xs text-blue-500 mt-1 block">Ukuran banner hero disarankan: 1200×500px landscape. Banner produk: 800×800px square.</span>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-gray-400" size={32} /></div>
      ) : (
        SECTIONS.map((section) => (
          <div key={section.value} className="admin-card mb-4">
            <h3 className="font-bold text-gray-800 mb-3">
              {section.label}
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({grouped[section.value]?.length || 0} banner)
              </span>
            </h3>
            {!grouped[section.value]?.length ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Belum ada banner</p>
                <button
                  onClick={() => { setForm({ ...emptyForm, section: section.value }); setEditId(null); setShowModal(true); }}
                  className="text-brand-600 text-sm font-medium hover:underline"
                >
                  + Tambah banner untuk section ini
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {grouped[section.value].map((banner, idx) => (
                  <div
                    key={banner.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${banner.is_active ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-gray-100 opacity-60"}`}
                  >
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      <Image src={banner.image_url} alt={banner.alt_text || ""} fill style={{ objectFit: "cover" }} sizes="96px"
                        onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='56'%3E%3Crect width='96' height='56' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3EGambar%3C/text%3E%3C/svg%3E"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{banner.alt_text || "Tanpa deskripsi"}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{banner.image_url}</p>
                      {banner.link_url && (
                        <p className="text-xs text-brand-500 truncate flex items-center gap-1 mt-0.5">
                          <LinkIcon size={10} /> {banner.link_url}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => handleReorder(banner, "up")} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronUp size={14} /></button>
                      <button onClick={() => handleReorder(banner, "down")} disabled={idx === grouped[section.value].length - 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronDown size={14} /></button>
                      <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500"><Pencil size={14} /></button>
                      <button onClick={() => handleToggle(banner)} className={`p-1.5 rounded-lg ${banner.is_active ? "hover:bg-yellow-100 text-yellow-600" : "hover:bg-green-100 text-green-600"}`}>
                        {banner.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => handleDelete(banner)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">{editId ? "Edit Banner" : "Tambah Banner"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Section *</label>
                <select
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                >
                  {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL Gambar *</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setPreview(false); }}
                  placeholder="https://contoh.com/gambar.jpg"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                />
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setPreview(!preview)}
                    className="mt-1.5 text-xs text-brand-600 hover:underline"
                  >
                    {preview ? "Sembunyikan preview" : "Preview gambar"}
                  </button>
                )}
                {preview && form.image_url && (
                  <div className="mt-2 relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <Image src={form.image_url} alt="preview" fill style={{ objectFit: "cover" }} sizes="400px" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Link URL <span className="text-gray-400 font-normal">(klik banner ke mana)</span>
                </label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://contoh.com/produk (opsional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alt Text (SEO)</label>
                <input
                  type="text"
                  value={form.alt_text}
                  onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                  placeholder="Deskripsi singkat gambar"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
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
