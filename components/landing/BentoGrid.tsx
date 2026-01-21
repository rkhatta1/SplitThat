"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FEATURES_GRID } from "./constants";

export function BentoGrid() {
  return (
    <section className="py-32 bg-background" id="features">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <div className="inline-flex items-center space-x-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-none bg-primary" />
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Core Capabilities
            </span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-6">
            Built to handle complexity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl font-light">
            From simple coffee dates to complex group dinners with shared appetizers and individual drinks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 border border-border/30">
          {FEATURES_GRID.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-background p-10 hover:bg-muted/30 transition-colors duration-500"
            >
              <div className="mb-6 inline-flex p-3 bg-secondary/50 border border-border text-primary group-hover:scale-110 transition-transform duration-300">
                <HugeiconsIcon icon={feature.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3 font-serif">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>

              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-primary rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
