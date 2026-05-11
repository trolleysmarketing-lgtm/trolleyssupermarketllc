"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   SHARED INTERSECTION OBSERVER
   One observer instance for the entire page.
   All elements register callbacks into a WeakMap — no per-
   element observer creation, no repeated instantiation cost.
───────────────────────────────────────────────────────────── */

type RevealCallback = () => void;

let sharedObserver: IntersectionObserver | null = null;
const registry = new WeakMap<Element, RevealCallback>();

function getObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = registry.get(entry.target);
          if (cb) {
            requestAnimationFrame(cb);
            sharedObserver!.unobserve(entry.target);
            registry.delete(entry.target);
          }
        }
      }
    },
    { threshold: 0.07, rootMargin: "0px 0px -36px 0px" }
  );

  return sharedObserver;
}

export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getObserver();
    registry.set(el, () => setVisible(true));
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      registry.delete(el);
    };
  }, []);

  return { ref, visible };
}
