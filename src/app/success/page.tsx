"use client";

import { useEffect, useState } from "react";
import { CheckCircle, MessageCircle, Home } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const [orderId, setOrderId] = useState<string>("");
  const [waUrl, setWaUrl] = useState<string>("");

  useEffect(() => {
    const id = sessionStorage.getItem("lastOrderId") || "";
    const url = sessionStorage.getItem("waUrl") || "";
    setOrderId(id);
    setWaUrl(url);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center animate-load">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center">
            <CheckCircle className="text-brand-600" size={48} strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">
          Pesanan Berhasil!
        </h1>

        {orderId && (
          <div className="inline-block bg-gray-100 px-4 py-2 rounded-full mb-4">
            <span className="text-xs text-gray-500">Order ID: </span>
            <span className="font-mono font-bold text-gray-800 text-sm">{orderId}</span>
          </div>
        )}

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Terima kasih telah melakukan pemesanan.{" "}
          <strong>Silakan kirim bukti transfer melalui WhatsApp</strong> agar pesanan
          segera diproses oleh tim kami.
        </p>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">
            Langkah selanjutnya:
          </h3>
          <ol className="space-y-2.5">
            {[
              "Lakukan transfer ke rekening yang tertera",
              "Screenshot bukti transfer Anda",
              'Klik tombol "Kirim via WhatsApp" di bawah',
              "Kirimkan bukti transfer ke WhatsApp kami",
              "Pesanan akan segera diproses!",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-display font-bold py-4 rounded-2xl text-base shadow-lg transition-colors mb-4 btn-pulse"
          >
            <MessageCircle size={20} />
            Kirim Bukti via WhatsApp
          </a>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          <Home size={16} />
          Kembali ke Halaman Utama
        </Link>
      </div>
    </main>
  );
}
