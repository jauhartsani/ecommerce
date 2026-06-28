import { SiteSettings } from "@/types/database";
import { normalizeWhatsApp } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export default function FooterSection({ settings }: { settings: SiteSettings }) {
  const waNumber = normalizeWhatsApp(settings.whatsapp_number);

  return (
    <footer className="bg-gray-900 text-white py-10 px-4">
      <div className="max-w-lg mx-auto text-center">
        <h3 className="font-display text-xl font-bold mb-2">{settings.site_name}</h3>
        <p className="text-gray-400 text-sm mb-6">Solusi kesehatan terpercaya untuk keluarga Anda</p>

        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
        >
          <MessageCircle size={18} />
          Hubungi via WhatsApp
        </a>

        <div className="mt-8 pt-6 border-t border-gray-800 text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} {settings.site_name}. All rights reserved.</p>
          <p className="mt-1">Produk ini bukan pengganti obat. Konsultasikan dengan dokter.</p>
        </div>
      </div>
    </footer>
  );
}
