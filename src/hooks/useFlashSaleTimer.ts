"use client";

import { useState, useEffect } from "react";
import { getFlashSaleEndTime } from "@/lib/utils";

export interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function useFlashSaleTimer(): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 30,
    seconds: 0,
    total: 30 * 60 * 1000,
  });

  useEffect(() => {
    const endTime = getFlashSaleEndTime();

    const tick = () => {
      const now = Date.now();
      const total = Math.max(0, endTime.getTime() - now);
      const hours = Math.floor(total / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, total });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}
