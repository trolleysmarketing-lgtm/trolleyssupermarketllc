"use client";

import { useReveal } from "./useReveal";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
}

export function FadeUp({ children, delay = 0 }: FadeUpProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(20px)",
        transition: `opacity .65s cubic-bezier(.25,.46,.45,.94) ${delay}ms, transform .65s cubic-bezier(.25,.46,.45,.94) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
