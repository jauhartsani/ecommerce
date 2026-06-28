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
  const [loaded, setLoaded] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, banners.length]);

  if (!banners.length) return <HeroSliderSkeleton />;

  const banner = banners[current];
  const Wrapper = banner.link_url ? Link : "div";
  const wrapperProps = banner.link_url ? { href: banner.link_url } : {};

  return (
    <div className="relative w-full overflow-hidden bg-gray-100">
      {/* Slides */}
      <div className="relative w-full aspect-[16/9]">
        {!loaded && <HeroSliderSkeleton />}
        {/* @ts-ignore */}
        <Wrapper {...wrapperProps} className="block w-full h-full">
          <Image
            src={banner.image_url}
            alt={banner.alt_text || `Slide ${current + 1}`}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
            onLoad={() => setLoaded(true)}
            className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        </Wrapper>
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
