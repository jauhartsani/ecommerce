"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, SettingsFormData } from "@/lib/validations";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        reset({
          site_name: data.site_name || "",
          whatsapp_number: data.whatsapp_number || "",
          bank_name: data.bank_name || "",
          account_number: data.account_number || "",
          account_holder: data.account_holder || "",
          seo_title_suffix: data.seo_title_suffix || "",
          seo_description: data.seo_description || "",
        });
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Pengaturan disimpan!");
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah favicon");
      }

      setValue("favicon_url", data.url);
      toast.success("Favicon berhasil diunggah");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah favicon");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const fields = [
    {
      key: "site_name" as const,
      label: "Nama Website",
      placeholder: "HealthPro Store",
      hint: "Ditampilkan di header, footer, dan title halaman",
    },
    {
      key: "seo_title_suffix" as const,
      label: "SEO Title",
      placeholder: "Produk Kesehatan Terpercaya",
      hint: "Judul yang tampil di tab browser setelah nama website",
    },
    {
      key: "seo_description" as const,
      label: "SEO Description",
      placeholder: "Temukan produk kesehatan terbaik dengan harga terjangkau.",
      hint: "Deskripsi meta untuk halaman landing page",
    },
    {
      key: "favicon_url" as const,
      label: "URL Favicon",
      placeholder: "https://.../favicon.ico",
      hint: "Link favicon yang tampil di browser tab.",
    },
    {
      key: "whatsapp_number" as const,
      label: "Nomor WhatsApp",
      placeholder: "08123456789",
      hint: "Nomor yang akan menerima notifikasi pesanan",
    },
    {
      key: "bank_name" as const,
      label: "Nama Bank",
      placeholder: "BCA / BRI / Mandiri",
      hint: "Bank untuk menerima pembayaran",
    },
    {
      key: "account_number" as const,
      label: "Nomor Rekening",
      placeholder: "1234567890",
      hint: "Nomor rekening bank",
    },
    {
      key: "account_holder" as const,
      label: "Nama Pemilik Rekening",
      placeholder: "Nama Lengkap",
      hint: "Nama yang tertera di buku tabungan",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {(saving || uploadingFavicon) && (
        <LoadingOverlay message={uploadingFavicon ? "Mengunggah favicon..." : "Menyimpan pengaturan..."} />
      )}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi website dan informasi pembayaran</p>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {f.label}
              </label>
              <input
                {...register(f.key)}
                type="text"
                placeholder={f.placeholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                  errors[f.key]
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                }`}
              />
              {errors[f.key] && (
                <p className="text-red-500 text-xs mt-1">{errors[f.key]?.message}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">{f.hint}</p>
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Favicon
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFaviconUpload}
              className="w-full text-sm text-gray-700 file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white file:rounded-xl"
            />
            <p className="text-gray-400 text-xs mt-1">
              Unggah file favicon atau gunakan URL di atas. File akan disimpan di Supabase Storage.
            </p>
          </div>

          {watch("favicon_url") && (
            <div className="mt-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={watch("favicon_url") || ""} alt="Preview favicon" className="w-full h-full object-contain" />
              </div>
              <div className="text-sm text-gray-600 break-all">{watch("favicon_url")}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
            ) : (
              <><Save size={18} /> Simpan Pengaturan</>
            )}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
        <strong>💡 Tips:</strong> Setelah mengubah pengaturan, refresh halaman landing page untuk melihat perubahan.
      </div>
    </div>
  );
}
