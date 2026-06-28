"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Product, SiteSettings } from "@/types/database";
import { orderSchema, OrderFormData } from "@/lib/validations";
import { formatRupiah, normalizeWhatsApp, buildWhatsAppMessage, getTikTokEmbedUrl } from "@/lib/utils";
import FlashSaleTimer from "@/components/ui/FlashSaleTimer";
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Zap,
  MessageCircle,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface Props {
  product: Product;
  settings: SiteSettings;
  discount: number;
}

export default function ProductPageClient({ product, settings, discount }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const images = [
    ...(product.image_url ? [product.image_url] : []),
    ...((product.image_url ? [] : product.gallery_urls) || []),
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { product_id: product.id, quantity: qty },
  });

  const onSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, quantity: qty }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { orderId } = await res.json();

      const waNumber = normalizeWhatsApp(settings.whatsapp_number);
      const msg = buildWhatsAppMessage({
        orderId,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        productName: product.name,
        quantity: qty,
        notes: data.notes,
      });

      sessionStorage.setItem("lastOrderId", orderId);
      sessionStorage.setItem("waUrl", `https://wa.me/${waNumber}?text=${msg}`);
      router.push("/success");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="px-4 py-3 flex items-center gap-1 text-xs text-gray-400">
        <Link href="/" className="hover:text-brand-600">Beranda</Link>
        <ChevronRight size={12} />
        <Link href="/produk" className="hover:text-brand-600">Produk</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 truncate">{product.name}</span>
      </div>

      {/* Image Gallery */}
      <div className="relative bg-white">
        <div className="relative aspect-square">
          {images.length > 0 ? (
            <Image
              src={images[imgIdx]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 600px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingCart size={48} className="text-gray-300" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white font-bold px-2 py-1 rounded-xl text-sm">
              -{discount}%
            </span>
          )}
          {product.is_flash_sale && (
            <span className="absolute top-3 right-3 bg-orange-500 text-white font-bold px-2 py-1 rounded-xl text-sm flex items-center gap-1">
              <Zap size={12} className="fill-white" /> FLASH SALE
            </span>
          )}

          {/* Arrow controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  i === imgIdx ? "border-brand-500" : "border-gray-200"
                }`}
              >
                <Image src={img} alt="" width={56} height={56} style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="bg-white mt-2 px-4 py-4">
        <h1 className="font-display font-bold text-xl text-gray-900 leading-tight">
          {product.name}
        </h1>

        {product.sold_count > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-gray-400">{product.sold_count} terjual</span>
          </div>
        )}

        <div className="flex items-end gap-3 mt-3">
          <span className="font-display font-bold text-2xl text-brand-700">
            {formatRupiah(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through pb-0.5">
              {formatRupiah(product.original_price)}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-lg pb-0.5">
              Hemat {discount}%
            </span>
          )}
        </div>

        {/* Flash Sale Countdown on product page */}
        {product.is_flash_sale && (
          <div className="mt-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-red-500 fill-red-500" />
              <span className="font-bold text-red-600 text-sm">FLASH SALE — Harga Spesial!</span>
            </div>
            <FlashSaleTimer size="lg" label="Berakhir dalam" />
            <p className="text-xs text-red-400 mt-2">
              ⚠️ Harga ini hanya berlaku selama waktu countdown. Jangan sampai kehabisan!
            </p>
          </div>
        )}

        {product.description && (
          <p className="text-gray-600 text-sm mt-3 leading-relaxed">{product.description}</p>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: Shield, text: "Produk Asli" },
            { icon: Truck, text: "Kirim Cepat" },
            { icon: RotateCcw, text: "Garansi Ada" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-2.5">
              <Icon size={18} className="text-brand-600" />
              <span className="text-xs text-gray-600 font-medium text-center">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Long description */}
      {product.long_description && (
        <div className="bg-white mt-2 px-4 py-4">
          <h2 className="font-bold text-gray-800 mb-3">Detail Produk</h2>
          <div
            className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.long_description }}
          />
        </div>
      )}

      {product.tiktok_url && (() => {
        const embedUrl = getTikTokEmbedUrl(product.tiktok_url);
        return embedUrl ? (
          <div className="bg-white mt-2 px-4 py-4">
            <h2 className="font-bold text-gray-800 mb-3">Video TikTok</h2>
            <div className="rounded-3xl overflow-hidden border border-pink-100 bg-pink-50">
              <iframe
                src={embedUrl}
                className="w-full aspect-[9/16] min-h-[420px]"
                loading="lazy"
                allow="encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin"
                title="TikTok embed"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Jika video tidak muncul, buka langsung di TikTok.
            </p>
          </div>
        ) : (
          <div className="bg-white mt-2 px-4 py-4">
            <h2 className="font-bold text-gray-800 mb-3">Video TikTok</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tonton video TikTok produk di bawah ini untuk melihat demo atau review yang lebih jelas.
            </p>
            <a
              href={product.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-pink-600 px-4 py-3 text-white text-sm font-semibold hover:bg-pink-700 transition-colors"
            >
              Tonton di TikTok
            </a>
          </div>
        );
      })()}

      {/* Order Form */}
      <div className="bg-white mt-2 px-4 py-5">
        <div className="mb-5">
          <span className="inline-block bg-accent text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            Pesan Sekarang
          </span>
          <h2 className="font-display text-xl font-bold text-gray-900">
            Form Pemesanan
          </h2>
          {product.is_flash_sale && (
            <div className="flex items-center gap-2 mt-2 text-red-600">
              <Zap size={14} className="fill-red-500" />
              <span className="text-sm font-semibold">
                Harga flash sale —{" "}
              </span>
              <FlashSaleTimer size="sm" label="" />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Hidden product_id */}
          <input type="hidden" {...register("product_id")} value={product.id} />

          {/* Nama */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Contoh: Budi Santoso"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                errors.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">
                +62
              </span>
              <input
                {...register("whatsapp")}
                type="tel"
                placeholder="08123456789"
                className={`flex-1 px-4 py-3 rounded-r-xl border text-sm outline-none transition-all ${
                  errors.whatsapp ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand-500"
                }`}
              />
            </div>
            {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="email@contoh.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("address")}
              rows={3}
              placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota, Provinsi"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all ${
                errors.address ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand-500"
              }`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Jumlah
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold active:bg-gray-100"
              >
                −
              </button>
              <span className="w-10 text-center font-bold text-lg">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(100, q + 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold active:bg-gray-100"
              >
                +
              </button>
              <span className="text-sm text-gray-500 ml-1">
                = {formatRupiah(product.price * qty)}
              </span>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Catatan <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Permintaan khusus..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
            <h3 className="font-semibold text-brand-800 text-sm mb-2">Ringkasan Pesanan</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{product.name} × {qty}</span>
              <span className="font-bold text-brand-700">{formatRupiah(product.price * qty)}</span>
            </div>
            {product.is_flash_sale && (
              <div className="mt-2 flex items-center gap-1.5 text-red-600 text-xs">
                <Zap size={12} className="fill-red-500" />
                <span className="font-semibold">Harga Flash Sale aktif!</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-dark text-white font-display font-bold py-4 rounded-2xl text-lg shadow-lg btn-pulse flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
          >
            {isLoading ? (
              <><Loader2 size={20} className="animate-spin" /> Memproses...</>
            ) : (
              <><ShoppingCart size={20} /> PESAN SEKARANG</>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Data Anda aman & hanya untuk proses pemesanan
          </p>
        </form>

        {/* Payment Info */}
        <div className="mt-5 bg-gray-50 rounded-2xl p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">💳 Informasi Pembayaran</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Bank", settings.bank_name],
              ["No. Rekening", settings.account_number],
              ["Atas Nama", settings.account_holder],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WA shortcut */}
        <a
          href={`https://wa.me/${normalizeWhatsApp(settings.whatsapp_number)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 font-bold py-3 rounded-2xl text-sm hover:bg-green-50 transition-colors"
        >
          <MessageCircle size={18} />
          Tanya via WhatsApp dulu
        </a>
      </div>
    </div>
  );
}
