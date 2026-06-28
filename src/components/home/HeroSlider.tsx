"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/database";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSliderSkeleton } from "@/components/ui/Skeleton";

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>([]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    setLoaded(new Array(banners.length).fill(false));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, banners.length]);

  if (!banners.length) return <HeroSliderSkeleton />;

  return (
    <div className="relative w-full overflow-hidden bg-gray-100">
      {/* Slides */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ width: `${banners.length * 100}%`, transform: `translateX(-${current * (100 / banners.length)}%)` }}
        >
          {banners.map((banner, index) => {
            const Wrapper = banner.link_url ? Link : "div";
            const wrapperProps = banner.link_url ? { href: banner.link_url } : {};

            return (
              // @ts-ignore
              <Wrapper key={banner.id} {...wrapperProps} className="relative w-full h-full shrink-0">
                <Image
                  src={banner.image_url}
                  alt={banner.alt_text || `Slide ${index + 1}`}
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                  onLoad={() =>
                    setLoaded((prev) => {
                      const nextLoaded = [...prev];
                      nextLoaded[index] = true;
                      return nextLoaded;
                    })
                  }
                  className={`transition-opacity duration-500 ${loaded[index] ? "opacity-100" : "opacity-0"}`}
                />
              </Wrapper>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-all"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? "bg-white w-5 h-2"
                    : "bg-white/50 w-2 h-2"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
