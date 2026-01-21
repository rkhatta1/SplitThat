"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

interface FeatureHighlightProps {
  title: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
  reversed?: boolean;
  theme?: "light" | "dark";
  id?: string;
  customVisual?: React.ReactNode;
  backgroundImage?: string;
}

export function FeatureHighlight({
  title,
  description,
  features,
  imageSrc,
  imageAlt,
  reversed = false,
  theme = "light",
  id,
  customVisual,
  backgroundImage,
}: FeatureHighlightProps) {
  const isDark = theme === "dark";

  const bgClass = isDark ? "bg-background" : "bg-white";
  const textClass = isDark ? "text-foreground" : "text-slate-900";
  const subTextClass = isDark ? "text-muted-foreground" : "text-gray-600";
  const borderClass = isDark ? "border-border" : "border-gray-200";

  return (
    <section id={id} className={`py-24 ${bgClass}`}>
      <div className="container mx-auto px-6">
        <div className={`flex flex-col lg:flex-row items-center gap-16 ${reversed ? "lg:flex-row-reverse" : ""}`}>
          {/* Text Content */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="inline-flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-none bg-primary" />
              <span className={`text-xs font-bold tracking-widest uppercase ${subTextClass}`}>
                {reversed ? "Seamless Integration" : "Smart Parsing"}
              </span>
            </div>
            <h2 className={`font-serif text-4xl md:text-5xl ${textClass} leading-tight`}>
              {title}
            </h2>
            <p className={`text-lg ${subTextClass} leading-relaxed font-light`}>
              {description}
            </p>

            <ul className="space-y-4 pt-4">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className={`mt-1 w-5 h-5 border flex items-center justify-center transition-colors
                    ${isDark ? "border-primary/50 group-hover:bg-primary group-hover:border-primary" : "border-primary group-hover:bg-primary"}`}
                  >
                    <HugeiconsIcon icon={Tick01Icon} className={`w-3 h-3 ${isDark ? "text-primary" : "text-primary"} group-hover:text-white`} />
                  </div>
                  <span className={`${isDark ? "text-foreground/90" : "text-gray-800"}`}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={'/app'} className={`mt-8 px-8 py-3 border transition-colors text-sm tracking-wide uppercase font-medium
              ${isDark
                ? "border-border text-foreground hover:border-primary hover:text-primary"
                : "border-gray-300 text-slate-900 hover:border-primary hover:text-primary"}`}
            >
              Explore Feature
            </Link>
          </div>

          {/* Visual Content */}
          <div className="w-full lg:w-1/2">
            {customVisual ? (
              <div className="relative w-full aspect-[4/3] flex items-center justify-center p-8 group">
                {/* Nature Background for the Visual Container */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                  <div className="absolute inset-0 bg-transparent z-10 backdrop-blur-[2px]"></div>
                  <img
                    src={backgroundImage || "/feature.png"}
                    alt="Background"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[1.5s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                </div>

                {/* The Custom UI Component (Mockup) */}
                <div className="relative z-20 w-full max-w-md transform transition-transform duration-500 hover:-translate-y-2">
                  {customVisual}
                </div>
              </div>
            ) : (
              <div className="relative aspect-[4/3] group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10 mix-blend-overlay" />
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className={`w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 border shadow-2xl ${borderClass}`}
                />

                {/* Default Floating UI Card Mockup */}
                <div className={`absolute ${reversed ? "bottom-8 right-8" : "bottom-8 left-8"} ${isDark ? "bg-secondary/90" : "bg-white/90"} backdrop-blur-md border ${borderClass} p-6 max-w-xs shadow-xl hidden md:block transform transition-transform duration-500 hover:-translate-y-2`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-2 w-20 ${isDark ? "bg-muted-foreground/30" : "bg-gray-200"}`}></div>
                    <div className="h-2 w-8 bg-primary"></div>
                  </div>
                  <div className="space-y-2">
                    <div className={`flex justify-between text-xs ${subTextClass}`}>
                      <span>Sushi Platter</span>
                      <span>$45.00</span>
                    </div>
                    <div className={`flex justify-between text-xs ${subTextClass}`}>
                      <span>Sake</span>
                      <span>$12.00</span>
                    </div>
                    <div className={`w-full h-px my-2 ${borderClass}`}></div>
                    <div className={`flex justify-between text-sm font-semibold ${textClass}`}>
                      <span>Total Split</span>
                      <span className="text-primary">$28.50</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
