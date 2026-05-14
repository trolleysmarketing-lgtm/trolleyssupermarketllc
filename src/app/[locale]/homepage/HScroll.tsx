"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./homepage.module.css";

interface HScrollProps {
  children: React.ReactNode;
  itemWidth: number;
  gap?: number;
  label?: string;
  showDots?: boolean;
}

export function HScroll({ children, itemWidth, gap = 20, label, showDots = true }: HScrollProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalItems,  setTotalItems]  = useState(0);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);

    // Calculate active index
    const itemW = itemWidth + gap;
    const idx = Math.round(el.scrollLeft / itemW);
    setActiveIndex(idx);
  }, [itemWidth, gap]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Count children
    const inner = el.firstElementChild;
    if (inner) setTotalItems(inner.children.length);

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, children]);

  const scroll = (dir: "l" | "r") => {
    trackRef.current?.scrollBy({
      left: dir === "l" ? -(itemWidth + gap) : itemWidth + gap,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (i: number) => {
    trackRef.current?.scrollTo({
      left: i * (itemWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <div role="region" aria-label={label} className={styles.hscrollWrap}>

      {/* Left fade + arrow */}
      <div className={`${styles.hscrollFade} ${styles.hscrollFadeLeft} ${canLeft ? styles.hscrollFadeVisible : ""}`}>
        <button onClick={() => scroll("l")} aria-label="Scroll left" className={`${styles.hscrollBtn} ${styles.hscrollBtnLeft}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Track */}
      <div ref={trackRef} className={styles.hscrollTrack}>
        <div style={{ display: "flex", gap, width: "max-content", paddingInline: 2 }}>
          {children}
        </div>
      </div>

      {/* Right fade + arrow */}
      <div className={`${styles.hscrollFade} ${styles.hscrollFadeRight} ${canRight ? styles.hscrollFadeVisible : ""}`}>
        <button onClick={() => scroll("r")} aria-label="Scroll right" className={`${styles.hscrollBtn} ${styles.hscrollBtnRight}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      {showDots && totalItems > 1 && (
        <div className={styles.hscrollDots} role="tablist" aria-label="Scroll position">
          {Array.from({ length: totalItems }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Item ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`${styles.hscrollDot} ${i === activeIndex ? styles.hscrollDotActive : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}