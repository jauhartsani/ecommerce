"use client";

import { useFlashSaleTimer } from "@/hooks/useFlashSaleTimer";

interface FlashSaleTimerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function FlashSaleTimer({
  size = "md",
  label = "Berakhir dalam",
}: FlashSaleTimerProps) {
  const { hours, minutes, seconds, total } = useFlashSaleTimer();

  const pad = (n: number) => String(n).padStart(2, "0");
  const isUrgent = total < 5 * 60 * 1000; // last 5 minutes

  const boxClass =
    size === "sm"
      ? "text-sm font-bold px-2 py-1 rounded-lg min-w-[2rem] text-center"
      : size === "lg"
      ? "text-2xl font-black px-4 py-2 rounded-xl min-w-[3rem] text-center"
      : "text-xl font-bold px-3 py-1.5 rounded-xl min-w-[2.5rem] text-center";

  const sepClass =
    size === "sm" ? "text-sm font-bold" : size === "lg" ? "text-2xl font-black" : "text-xl font-bold";

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span
          className={`font-semibold text-gray-600 ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          {label}:
        </span>
      )}
      <div className="flex items-center gap-1">
        {hours > 0 && (
          <>
            <span
              className={`${boxClass} ${
                isUrgent ? "bg-red-600 text-white animate-pulse" : "bg-red-500 text-white"
              }`}
            >
              {pad(hours)}
            </span>
            <span className={`${sepClass} text-red-500`}>:</span>
          </>
        )}
        <span
          className={`${boxClass} ${
            isUrgent ? "bg-red-600 text-white animate-pulse" : "bg-red-500 text-white"
          }`}
        >
          {pad(minutes)}
        </span>
        <span className={`${sepClass} text-red-500`}>:</span>
        <span
          className={`${boxClass} ${
            isUrgent ? "bg-red-600 text-white animate-pulse" : "bg-red-500 text-white"
          }`}
        >
          {pad(seconds)}
        </span>
      </div>
    </div>
  );
}
