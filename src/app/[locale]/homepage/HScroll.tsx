"use client";

import { useEffect, useRef, useState, useCallback, Children } from "react";
import styles from "./homepage.module.css";

interface HScrollProps {
  children: React.ReactNode;
  itemWidth: number;
  gap?: number;
  label?: string;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HScroll({
  children,
  itemWidth,
  gap = 20,
  label,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 4000,
}: HScrollProps) {
  const trackRef    = useRef<HTMLDivElement>(null);
  const autoRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const [canLeft,   setCanLeft]   = useState(false);
  const [canRight,  setCanRight]  = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const items = Children.toArray(children);
  const count = items.length;

  // Duplicate items for infinite loop: [clone...] [original...] [clone...]
  const tripled = count > 0 ? [...items, ...items, ...items] : items;

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    const itemW  = itemWidth + gap;
    const offset = el.scrollLeft;
    const idx    = Math.round(offset / itemW) % count;
    setActiveIdx(idx < 0 ? 0 : idx);
  }, [itemWidth, gap, count]);

  // Jump to middle clone on mount so we can scroll both ways
  useEffect(() => {
    const el = trackRef.current;
    if (!el || count === 0) return;
    const itemW = itemWidth + gap;
    el.scrollLeft = itemW * count; // start at middle copy
    sync();
  }, [count, itemWidth, gap, sync]);

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

  // Infinite loop: when reaching clone edges, silently jump back to original
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || count === 0) return;
    const itemW = itemWidth + gap;
    const total = itemW * count;
    // If scrolled into first clone set (left edge)
    if (el.scrollLeft < total * 0.25) {
      el.scrollLeft += total;
    }
    // If scrolled into last clone set (right edge)
    if (el.scrollLeft > total * 2.25) {
      el.scrollLeft -= total;
    }
  }, [count, itemWidth, gap]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // AutoPlay
  useEffect(() => {
    if (!autoPlay || count === 0) return;
    autoRef.current = setInterval(() => {
      trackRef.current?.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
    }, autoPlayInterval);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoPlay, autoPlayInterval, itemWidth, gap, count]);

  const scroll = (dir: "l" | "r") => {
    trackRef.current?.scrollBy({
      left: dir === "l" ? -(itemWidth + gap) : itemWidth + gap,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const itemW  = itemWidth + gap;
    const offset = itemW * count + itemW * i; // middle copy
    el.scrollTo({ left: offset, behavior: "smooth" });
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

      {/* Track — overflow visible so cards can lift on hover */}
      <div
        ref={trackRef}
        className={styles.hscrollTrack}
        style={{ overflowY: "visible" }}
      >
        <div style={{ display: "flex", gap, width: "max-content", paddingInline: 2, paddingBlock: 12 }}>
          {tripled.map((child, i) => (
            <div key={i} style={{ flexShrink: 0 }}>
              {child}
            </div>
          ))}
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
      {showDots && count > 1 && (
        <div className={styles.hscrollDots} role="tablist" aria-label="Scroll position">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`Item ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`${styles.hscrollDot} ${i === activeIdx ? styles.hscrollDotActive : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}