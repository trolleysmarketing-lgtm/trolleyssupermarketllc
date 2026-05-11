"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

export type Slide = {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryLink?: string;
  image?: string;
  imageAlt?: string;
  accent: string;
  stat?: { value: string; label: string };
};

export type HeroSliderProps = {
  locale: string;
  slides: Slide[];
  duration?: number;
  ariaLabel?: string;
};

const ANIM_DURATION = 700;

export default function HeroSlider({
  locale,
  slides,
  duration = 5800,
  ariaLabel = "Trolleys Supermarket hero banner",
}: HeroSliderProps) {
  const isAr = locale === "ar";
  const isRtl = isAr;

  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const slide = slides[current];

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);
      setVisible(false);
      setTimeout(() => {
        setCurrent(index);
        setProgress(0);
        setTimeout(() => setVisible(true), 50);
      }, 200);
      setTimeout(() => setAnimating(false), ANIM_DURATION);
    },
    [animating, current]
  );

  const next = useCallback(
    () => goTo((current + 1) % slides.length),
    [current, slides.length, goTo]
  );

  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, slides.length, goTo]
  );

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const start = Date.now();
    tickRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now() - start) / duration) * 100, 100));
    }, 40);
    timerRef.current = setTimeout(next, duration);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, duration, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") isRtl ? prev() : next();
      if (e.key === "ArrowLeft") isRtl ? next() : prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, isRtl]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (dy > Math.abs(dx) || Math.abs(dx) < 40) return;
    dx > 0 ? (isRtl ? prev() : next()) : isRtl ? next() : prev();
  };

  return (
    <>
      <style>{`
        .hero-slider {
          position: relative;
          width: 100%;
          height: clamp(480px, 75vh, 680px);
          overflow: hidden;
          background: #1a2e3f;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .hero-slider__bg {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 700ms cubic-bezier(.25,.46,.45,.94);
        }
        .hero-slider__bg--active { opacity: 1; }
        .hero-slider__bg-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          transform: scale(1);
          transition: transform 8s cubic-bezier(.16,1,.3,1);
        }
        .hero-slider__bg--active .hero-slider__bg-img {
          transform: scale(1.06);
        }
        .hero-slider__overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            ${isRtl ? "270deg" : "90deg"},
            rgba(26,46,63,0.92) 0%,
            rgba(26,46,63,0.5) 45%,
            rgba(26,46,63,0.05) 100%
          );
        }
        .hero-slider__overlay-bottom {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(26,46,63,0.5) 0%, transparent 50%);
        }
        .hero-slider__content {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          padding: 0 clamp(20px, 6vw, 80px) 80px;
        }
        .hero-slider__inner {
          max-width: 600px; width: 100%;
        }
        .hero-slider__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 20px;
          opacity: 0;
          transform: translateY(10px);
          transition: all .5s .1s cubic-bezier(.25,.46,.45,.94);
        }
        .hero-slider__badge--visible {
          opacity: 1; transform: translateY(0);
        }
        .hero-slider__badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #1C75BC;
          animation: heroPulse 2s ease-in-out infinite;
        }
        .hero-slider__badge-text {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #ffffff;
        }
        .hero-slider__title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(32px, 5vw, 58px);
          font-weight: 400;
          color: #fff;
          line-height: 1.08;
          letter-spacing: -.02em;
          margin: 0 0 16px;
          opacity: 0;
          transform: translateY(16px);
          transition: all .55s .18s cubic-bezier(.25,.46,.45,.94);
        }
        .hero-slider__badge--visible ~ .hero-slider__title {
          opacity: 1; transform: translateY(0);
        }
        .hero-slider__title em {
          font-style: italic;
          color: #ffffff;
        }
        .hero-slider__sub {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.93);
          line-height: 1.7;
          margin: 0 0 32px;
          max-width: 440px;
          opacity: 0;
          transform: translateY(12px);
          transition: all .55s .26s cubic-bezier(.25,.46,.45,.94);
        }
        .hero-slider__badge--visible ~ .hero-slider__title ~ .hero-slider__sub {
          opacity: 1; transform: translateY(0);
        }
        .hero-slider__cta-row {
          display: flex; gap: 10px;
          align-items: center; flex-wrap: wrap;
          opacity: 0;
          transform: translateY(10px);
          transition: all .55s .34s cubic-bezier(.25,.46,.45,.94);
        }
        .hero-slider__badge--visible ~ .hero-slider__sub ~ .hero-slider__cta-row {
          opacity: 1; transform: translateY(0);
        }
        .hero-slider__btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 26px; border-radius: 999px;
          font-size: 13px; font-weight: 600;
          color: #ffffff; text-decoration: none;
          background: #1C75BC;
          transition: all .3s;
          letter-spacing: .02em;
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.25);
        }
        .hero-slider__btn-primary:hover {
          background: #1C75BC;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(200,149,108,.35);
        }
        .hero-slider__btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 22px; border-radius: 999px;
          font-size: 13px; font-weight: 500;
          color: #fff; text-decoration: none;
          background: rgba(255, 255, 255, 0);
          border: 1.5px solid rgba(255,255,255,.12);
          transition: all .3s;
        }
        .hero-slider__btn-ghost:hover {
          background: rgba(255,255,255,.1);
          transform: translateY(-1px);
        }
        .hero-slider__stat {
          position: absolute;
          z-index: 20;
          right: ${isRtl ? "auto" : "clamp(60px, 10vw, 120px)"};
          left: ${isRtl ? "clamp(60px, 10vw, 120px)" : "auto"};
          bottom: 100px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          padding: 14px 20px;
          backdrop-filter: blur(12px);
          opacity: 0;
          transform: translateY(10px);
          transition: all .5s .5s cubic-bezier(.25,.46,.45,.94);
        }
        .hero-slider__stat--visible {
          opacity: 1; transform: translateY(0);
        }
        .hero-slider__stat-num {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 28px; color: #fff;
          line-height: 1; margin-bottom: 4px;
        }
        .hero-slider__stat-lbl {
          font-size: 10px; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgb(255, 255, 255);
        }
        .hero-slider__arrows {
          position: absolute; inset: 0;
          z-index: 20; pointer-events: none;
        }
        .hero-slider__arrow {
          position: absolute; top: 50%;
          transform: translateY(-50%);
          pointer-events: all;
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          color: #fff; cursor: pointer;
          display: flex; align-items: center;
          justify-content: center;
          transition: all .3s;
          backdrop-filter: blur(8px);
        }
        .hero-slider__arrow:hover {
          background: rgba(255,255,255,.15);
          transform: translateY(-50%) scale(1.06);
        }
        .hero-slider__arrow--prev {
          left: ${isRtl ? "auto" : "16px"};
          right: ${isRtl ? "16px" : "auto"};
        }
        .hero-slider__arrow--next {
          right: ${isRtl ? "auto" : "16px"};
          left: ${isRtl ? "16px" : "auto"};
        }
        .hero-slider__bar {
          position: absolute; bottom: 0;
          left: 0; right: 0; z-index: 20;
          padding: 0 clamp(20px, 6vw, 80px) 20px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
        }
        .hero-slider__dots {
          display: flex; gap: 6px; align-items: center;
        }
        .hero-slider__dot {
          height: 4px; border-radius: 3px;
          border: none; cursor: pointer; padding: 0;
          position: relative; overflow: hidden;
          transition: all .35s cubic-bezier(.25,.46,.45,.94);
          background: rgba(255,255,255,.2);
          width: 4px;
        }
        .hero-slider__dot--active { width: 32px; background: #c8956c; }
        .hero-slider__dot-fill {
          position: absolute; inset: 0;
          background: rgba(255,255,255,.6);
          transform-origin: left;
          transform: scaleX(0);
          transition: transform .04s linear;
          border-radius: 3px;
        }
        .hero-slider__counter {
          font-size: 11px;
          color: rgb(252, 252, 252);
          letter-spacing: .08em;
          display: flex; align-items: center; gap: 3px;
        }
        .hero-slider__counter strong {
          font-weight: 500; font-size: 13px;
          color: rgb(255, 255, 255);
        }
        .hero-slider__thumbs {
          position: absolute;
          right: ${isRtl ? "auto" : "20px"};
          left: ${isRtl ? "20px" : "auto"};
          top: 50%; transform: translateY(-50%);
          z-index: 20;
          display: flex; flex-direction: column; gap: 8px;
        }
        .hero-slider__thumb {
          width: 50px; height: 50px;
          border-radius: 10px; overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          padding: 0;
          opacity: .35;
          transition: all .3s;
          background: #000;
        }
        .hero-slider__thumb:hover { opacity: .6; transform: scale(1.06); }
        .hero-slider__thumb--active { opacity: 1; }
        .hero-slider__thumb-img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .hero-slider__pause {
          position: absolute; top: 14px;
          right: ${isRtl ? "auto" : "14px"};
          left: ${isRtl ? "14px" : "auto"};
          z-index: 30;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(0,0,0,.25);
          border: 1px solid rgba(255,255,255,.12);
          color: rgba(255,255,255,.6);
          cursor: pointer;
          display: flex; align-items: center;
          justify-content: center;
          transition: all .2s;
        }
        .hero-slider__pause:hover {
          background: rgba(0,0,0,.45);
          color: rgba(255,255,255,.9);
        }

        @keyframes heroPulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @media(max-width: 767px) {
          .hero-slider { height: clamp(440px, 85vw, 560px); }
          .hero-slider__thumbs { display: none !important; }
          .hero-slider__stat { display: none !important; }
          .hero-slider__arrow { width: 38px; height: 38px; }
          .hero-slider__content { padding: 0 16px 80px !important; }
        }
        @media(max-width: 480px) {
          .hero-slider__cta-row { flex-direction: column; align-items: stretch; }
          .hero-slider__btn-primary,
          .hero-slider__btn-ghost { justify-content: center; }
        }
        @media(prefers-reduced-motion: reduce) {
          .hero-slider__bg-img { transition-duration: 0ms !important; }
          .hero-slider__badge, .hero-slider__title,
          .hero-slider__sub, .hero-slider__cta-row {
            transition-duration: 0ms !important;
            opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <section
        className="hero-slider"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Backgrounds */}
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`hero-slider__bg${i === current ? " hero-slider__bg--active" : ""}`}
            aria-hidden="true"
          >
            {s.image ? (
              <img
                src={s.image}
                alt={s.imageAlt || ""}
                className="hero-slider__bg-img"
                loading={i === 0 ? "eager" : "lazy"}
                width={1440} height={810}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1a2e3f" }} />
            )}
            <div className="hero-slider__overlay" />
            <div className="hero-slider__overlay-bottom" />
          </div>
        ))}

        {/* Content */}
        <div className="hero-slider__content">
          <div className="hero-slider__inner">
            {/* Badge */}
            <div className={`hero-slider__badge${visible ? " hero-slider__badge--visible" : ""}`}>
              <span className="hero-slider__badge-dot" />
              <span className="hero-slider__badge-text">{slide.badge}</span>
            </div>

            {/* Title */}
            <h1 className="hero-slider__title">
              {slide.title.split("\n").map((line, li) => (
                <span key={li}>
                  {li > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="hero-slider__sub">{slide.subtitle}</p>

            {/* CTAs */}
            <div className="hero-slider__cta-row">
              <Link href={slide.ctaLink} className="hero-slider__btn-primary">
                {slide.cta}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d={isRtl ? "M19 12H5M12 5l-7 7 7 7" : "M5 12h14M12 5l7 7-7 7"} />
                </svg>
              </Link>
              <Link
                href={slide.ctaSecondaryLink ?? `/${locale}/stores`}
                className="hero-slider__btn-ghost"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {slide.ctaSecondaryLabel ?? (isAr ? "فروعنا" : "Our Stores")}
              </Link>
            </div>
          </div>
        </div>

        {/* Stat */}
        {slide.stat && (
          <div className={`hero-slider__stat${visible ? " hero-slider__stat--visible" : ""}`}>
            <div className="hero-slider__stat-num">{slide.stat.value}</div>
            <div className="hero-slider__stat-lbl">{slide.stat.label}</div>
          </div>
        )}

        {/* Arrows */}
        <div className="hero-slider__arrows" aria-hidden="true">
          <button className="hero-slider__arrow hero-slider__arrow--prev" onClick={prev}
            aria-label={isAr ? "السابق" : "Previous"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <button className="hero-slider__arrow hero-slider__arrow--next" onClick={next}
            aria-label={isAr ? "التالي" : "Next"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Pause */}
        <button className="hero-slider__pause"
          onClick={() => setPaused(p => !p)}
          aria-label={paused ? (isAr ? "تشغيل" : "Play") : (isAr ? "إيقاف" : "Pause")}>
          {paused ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
        </button>

        {/* Bottom Bar */}
        <div className="hero-slider__bar">
          <div className="hero-slider__dots" role="tablist">
            {slides.map((s, i) => (
              <button key={i}
                className={`hero-slider__dot${i === current ? " hero-slider__dot--active" : ""}`}
                onClick={() => goTo(i)}
                role="tab" aria-selected={i === current}
                aria-label={`${isAr ? "الشريحة" : "Slide"} ${i + 1}`}>
                {i === current && (
                  <div className="hero-slider__dot-fill"
                    style={{ transform: `scaleX(${progress / 100})` }} />
                )}
              </button>
            ))}
          </div>
          <div className="hero-slider__counter" aria-hidden="true">
            <strong>{String(current + 1).padStart(2, "0")}</strong>
            <span> / </span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="hero-slider__thumbs" aria-hidden="true">
          {slides.map((s, i) => (
            <button key={i}
              className={`hero-slider__thumb${i === current ? " hero-slider__thumb--active" : ""}`}
              onClick={() => goTo(i)} tabIndex={-1}
              style={{ borderColor: i === current ? "#c8956c" : "transparent" }}>
              {s.image ? (
                <img src={s.image} alt="" className="hero-slider__thumb-img"
                  loading="lazy" width={50} height={50} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#1a2e3f" }} />
              )}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}