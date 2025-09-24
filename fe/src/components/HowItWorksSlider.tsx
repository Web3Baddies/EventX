"use client";

import { useEffect, useMemo, useState } from "react";

interface Slide {
  title: string;
  description: string;
}

interface HowItWorksSliderProps {
  intervalMs?: number;
  slides?: Slide[];
}

export default function HowItWorksSlider({ intervalMs = 4000, slides: customSlides }: HowItWorksSliderProps) {
  const defaultSlides: Slide[] = useMemo(() => [
    {
      title: "Connect your wallet",
      description: "Use MetaMask or a compatible wallet to get started securely.",
    },
    {
      title: "Create or find an event",
      description: "Organizers set details and pricing. Attendees explore and choose seats.",
    },
    {
      title: "Buy in seconds",
      description: "Confirm the transaction in your wallet. Your ticket is issued instantly.",
    },
    {
      title: "Scan and enter",
      description: "Show your QR at the door for instant, verifiable check‑in.",
    },
  ], []);

  const slides = customSlides && customSlides.length > 0 ? customSlides : defaultSlides;

  const [index, setIndex] = useState(0);
  const goTo = (i: number) => setIndex(i % slides.length);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, slides.length]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-green-50 border border-green-100">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 h-1 bg-green-300" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />

      <div className="p-8 md:p-10 min-h-[200px]">
        <div className="transition-all duration-300">
          <h4 className="text-xl md:text-2xl font-semibold text-green-950 mb-2">{slides[index].title}</h4>
          <p className="text-green-900/80">{slides[index].description}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-green-600' : 'w-2.5 bg-green-200 hover:bg-green-300'}`}
            />
          ))}
        </div>
        <div className="text-xs text-green-900/60 pr-1">{index + 1} / {slides.length}</div>
      </div>
    </div>
  );
}
