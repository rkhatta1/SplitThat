"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HERO_CONTENT } from "./constants";
import Link from "next/link";
import { Logo } from "./Logo";

export function Hero() {
  return (
    <section id="root" className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image Container */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/hero.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      {/* Mobile Logo - top center of screen */}
      <div className="md:hidden absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <Logo variant="default" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center pt-20">
        {/* Top Pill Badge */}
        <div className="group flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-full pl-3 pr-4 py-1.5 mb-8 transition-all cursor-pointer hover:bg-white/15">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="text-xs font-medium tracking-wide text-white/90 uppercase">
            Gemini 3 Flash Integration
          </span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3 text-white/60 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 text-white tracking-tight drop-shadow-lg max-w-5xl">
          {HERO_CONTENT.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light antialiased drop-shadow-md">
          {HERO_CONTENT.subtitle}
        </p>

        {/* CTA Button */}
        <Link
          href="/app"
          className="bg-white text-background hover:bg-white/90 px-10 py-4 text-base font-semibold transition-all duration-300 rounded-none shadow-2xl hover:scale-105 hover:shadow-white/10"
        >
          {HERO_CONTENT.cta}
        </Link>
      </div>
    </section>
  );
}
