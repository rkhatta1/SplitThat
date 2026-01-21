"use client";

import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./constants";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="container py-2 mx-auto flex items-center justify-between">
        <div className={`px-6 py-4 flex flex-row gap-6 transition-all duration-300 ${
          scrolled
            ? "bg-background/50 backdrop-blur-md border-border"
            : "bg-transparent border-transparent"
        }`}>
          <a href="#" onClick={(e) => scrollToSection(e, "#root")} className="hover:opacity-80 transition-opacity">
            {
              scrolled ? <Logo variant="gray"/> : <Logo variant="default" /> 
            }
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`text-sm font-medium ${ scrolled ? `text-white` : `text-background`} hover:text-primary transition-colors cursor-pointer`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/app"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
