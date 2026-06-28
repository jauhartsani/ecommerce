"use client";

import { usePathname } from "next/navigation";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="public-shell">
      <div className="public-frame">
        <div className="public-content">{children}</div>
      </div>
    </div>
  );
}
