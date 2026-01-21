"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "default" | "gray";
  imgClassName?: string;
}

export function Logo({ className, variant = "default", imgClassName }: LogoProps) {
  const logoSrc = variant === "gray" ? "/SplitThat-Logo-gray.png" : "/SplitThat-Logo.svg";

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="SplitThat"
        width={280}
        height={64}
        className={`h-8 w-auto ${imgClassName}`}
        priority
      />
    </div>
  );
}
