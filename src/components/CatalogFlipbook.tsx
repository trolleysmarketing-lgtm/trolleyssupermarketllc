"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = { filePath: string; title: string };

const PDFPage = forwardRef<HTMLDivElement, { pageNumber: number; width: number }>(
  ({ pageNumber, width }, ref) => (
    <div ref={ref} style={{ background: "white", overflow: "hidden" }}>
      <Page pageNumber={pageNumber} width={width} renderTextLayer={false} renderAnnotationLayer={false} />
    </div>
  )
);
PDFPage.displayName = "PDFPage";

export default function CatalogFlipbook({ filePath, title }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(320);
  const [pageHeight, setPageHeight] = useState(453);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!containerRef.current) return;
      const cw = containerRef.current.offsetWidth;
      const w = mobile
        ? Math.floor(cw - 32)
        : Math.floor(Math.min((cw - 48) / 2, 380));
      setPageWidth(w);
      setPageHeight(Math.floor(w * 1.414));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goNext = () => isMobile
    ? setCurrentPage(p => Math.min(p + 1, numPages - 1))
    : flipBookRef.current?.pageFlip()?.flipNext();

  const goPrev = () => isMobile
    ? setCurrentPage(p => Math.max(p - 1, 0))
    : flipBookRef.current?.pageFlip()?.flipPrev();

  const progress = numPages > 0 ? ((currentPage + 1) / numPages) * 100 : 0;
  const atStart = currentPage === 0;
  const atEnd = currentPage >= numPages - 1;

  return (
    <>
      <style>{`
        .cfb-wrap { font-family: 'Outfit', system-ui, sans-serif; }
        .cfb-nav-btn { transition: all 0.2s; }
        .cfb-nav-btn:not(:disabled):hover { opacity: 0.85 !important; transform: scale(1.08); }
        .cfb-nav-btn:disabled { opacity: 0.3 !important; cursor: not-allowed; }
        .cfb-dl-btn { transition: all 0.2s; }
        .cfb-dl-btn:hover { opacity: 0.85 !important; }
        @keyframes cfbSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        ref={containerRef}
        className="cfb-wrap"
        style={{
          width: "100%",
          background: "transparent",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Document
          file={filePath}
          onLoadSuccess={({ numPages }) => { setNumPages(numPages); setLoading(false); }}
          loading={
            <div style={{ padding: "52px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40,
                border: "2.5px solid rgba(255,255,255,0.15)",
                borderTopColor: "#0e76bc",
                borderRadius: "50%",
                animation: "cfbSpin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>Loading...</span>
            </div>
          }
        >
          {!loading && numPages > 0 && pageWidth > 0 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>

              {/* ── MOBILE ── */}
              {isMobile ? (
                <div
                  onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
                  onTouchEnd={e => {
                    const diff = touchStartX.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 44) diff > 0 ? goNext() : goPrev();
                  }}
                  style={{ marginBottom: 16, position: "relative", touchAction: "pan-y", width: pageWidth }}
                >
                  <div style={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
                    <Page pageNumber={currentPage + 1} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                  </div>
                  {currentPage === 0 && (
                    <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 6, background: "rgba(10,15,30,0.65)", backdropFilter: "blur(6px)", padding: "4px 12px", borderRadius: 20, fontSize: 10, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", letterSpacing: "0.06em", pointerEvents: "none" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                      swipe
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </div>
              ) : (
                /* ── DESKTOP: 2-page flipbook ── */
                <div style={{
                  marginBottom: 24,
                  width: pageWidth * 2,
                  overflow: "visible",
                  background: "transparent",
                  boxShadow: "none",
                }}>
                  <HTMLFlipBook
                    ref={flipBookRef}
                    width={pageWidth}
                    height={pageHeight}
                    size="fixed"
                    minWidth={pageWidth}
                    maxWidth={pageWidth}
                    minHeight={pageHeight}
                    maxHeight={pageHeight}
                    showCover={false}
                    flippingTime={650}
                    style={{ background: "transparent" }}
                    startPage={0}
                    drawShadow={true}
                    usePortrait={false}
                    startZIndex={0}
                    autoSize={false}
                    maxShadowOpacity={0.35}
                    mobileScrollSupport={false}
                    clickEventForward={true}
                    useMouseEvents={true}
                    swipeDistance={30}
                    showPageCorners={true}
                    disableFlipByClick={false}
                    className=""
                    onFlip={(e: any) => setCurrentPage(e.data)}
                  >
                    {Array.from({ length: numPages }, (_, i) => (
                      <PDFPage key={i} pageNumber={i + 1} width={pageWidth} />
                    ))}
                  </HTMLFlipBook>
                </div>
              )}

              {/* ── CONTROLS ── */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#0e76bc",
                borderRadius: 50,
                padding: "6px 12px",
              }}>
                {/* Prev */}
                <button
                  className="cfb-nav-btn"
                  onClick={goPrev}
                  disabled={atStart}
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    cursor: atStart ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Previous page"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>

                {/* Page count */}
                <span style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: 64,
                  textAlign: "center",
                  letterSpacing: "0.04em",
                }}>
                  <span style={{ color: "white", fontWeight: 800 }}>{currentPage + 1}</span>
                  <span style={{ margin: "0 4px", color: "rgba(255,255,255,0.4)" }}>/</span>
                  {numPages}
                </span>

                {/* Next */}
                <button
                  className="cfb-nav-btn"
                  onClick={goNext}
                  disabled={atEnd}
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    cursor: atEnd ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Next page"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                {/* Divider */}
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />

                {/* Download */}
                
                 <a href={filePath}
                  download
                  className="cfb-dl-btn"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#de2b2e",
                    color: "white",
                    borderRadius: 20, padding: "7px 16px",
                    fontSize: 11, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em",
                  }}
                  aria-label="Download PDF"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  PDF
                </a>
              </div>

              {/* ── PROGRESS BAR ── */}
              <div style={{
                width: isMobile ? pageWidth : Math.min(pageWidth * 2, 760),
                height: 2,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                marginTop: 12,
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(to right, #0e76bc, #60aef0)",
                  borderRadius: 2,
                  transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>

              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 7, letterSpacing: "0.06em" }}>
                Page {currentPage + 1} of {numPages}
              </p>

            </div>
          )}
        </Document>
      </div>
    </>
  );
}