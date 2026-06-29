"use client";

import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Memuat..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="inline-flex items-center gap-3 rounded-3xl border border-white/20 bg-white/95 px-5 py-4 shadow-xl shadow-black/10">
        <Loader2 size={22} className="animate-spin text-brand-600" />
        <span className="text-sm font-semibold text-gray-700">{message}</span>
      </div>
    </div>
  );
}
