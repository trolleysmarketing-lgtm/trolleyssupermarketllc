"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./homepage.module.css";

interface HScrollProps {
  children: React.ReactNode;
  itemWidth: number;
  gap?: number;
  label?: string;
}

export function HScroll({ children, itemWidth, gap = 20, label }: HScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scroll = (dir: "l" | "r") => {
    trackRef.current?.scrollBy({
      left: dir === "l" ? -(itemWidth + gap) : itemWidth + gap,
      behavior: "smooth",
    });
  };

  return (
    <div role="region" aria-label={label} className={styles.hscrollWrap}>
      {canLeft && (
        <button
          onClick={() => scroll("l")}
          aria-label="Scroll left"
          className={`${styles.hscrollBtn} ${styles.hscrollBtnLeft}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div
        ref={trackRef}
        className={styles.hscrollTrack}
      >
        <div style={{ display: "flex", gap, width: "max-content" }}>
          {children}
        </div>
      </div>
      {canRight && (
        <button
          onClick={() => scroll("r")}
          aria-label="Scroll right"
          className={`${styles.hscrollBtn} ${styles.hscrollBtnRight}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
