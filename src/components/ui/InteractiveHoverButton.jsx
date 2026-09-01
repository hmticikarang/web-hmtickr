'use client';

import React from "react";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const InteractiveHoverButton = React.forwardRef(
  ({ text = "Button", children, className, showIcon = true, ...props }, ref) => {
    const buttonText = children || text;
    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-auto min-w-[8rem] cursor-pointer overflow-hidden rounded-full border border-slate-700 bg-[#0F172A] px-6 py-3 text-center font-semibold text-white transition-all duration-300 active:scale-95",
          className
        )}
        {...props}
      >
        {/* Teks Posisi Normal */}
        <span
          className={cn(
            "inline-block transition-all duration-300 group-hover:opacity-0",
            showIcon ? "group-hover:translate-x-12" : "group-hover:translate-x-4"
          )}
        >
          {buttonText}
        </span>

        {/* Teks & Panah saat Hover */}
        <div
          className={cn(
            "absolute inset-0 z-10 flex h-full w-full items-center justify-center text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
            showIcon ? "translate-x-12 gap-1.5" : "translate-x-4 gap-0"
          )}
        >
          <span>{buttonText}</span>
          {showIcon && <ArrowRight className="h-3.5 w-3.5 shrink-0" />}
        </div>

        {/* Lingkaran Biru Animasi */}
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#1E3A8A] opacity-0 transition-all duration-300 ease-out group-hover:scale-[30] group-hover:opacity-100" />
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };