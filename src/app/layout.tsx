import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"),
  title: {
    default: "Produk Kesehatan Terbaik | Solusi Hidup Sehat",
    template: "%s | HealthPro",
  },
  description:
    "Temukan produk kesehatan berkualitas tinggi yang telah terbukti membantu ribuan pelanggan. Pesan sekarang dan rasakan manfaatnya!",
  keywords: ["produk kesehatan", "suplemen", "kesehatan alami", "herbal"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "HealthPro",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "12px", background: "#333", color: "#fff" },
          }}
        />
      </body>
    </html>
  );
}
