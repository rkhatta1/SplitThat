"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import { Logo } from "./Logo";

export function Footer() {

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-white pt-10 pb-10 border-t border-gray-200" id="footer">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <a href="#footer" onClick={(e) => scrollToSection(e, "#root")}><Logo className="mb-4 justify-center md:justify-start" imgClassName="h-24" variant="default" /></a>
            <p className="text-gray-500 max-w-sm text-sm">
              Fairness down to the penny.
            </p>
          </div>

          <div className="flex gap-6">
            <a href="https://raajveer.vercel.app/" target="_blank" className="flex items-center hover:text-primary transition-colors text-slate-700">
              <HugeiconsIcon icon={Mail01Icon} className="w-6 h-6" />
            </a>
            <a href="https://github.com/rkhatta1/" target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors text-slate-700">
              <HugeiconsIcon icon={Github01Icon} className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
