"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period    = "7d" | "30d" | "90d" | "all";
type Sentiment = "all" | "positive" | "neutral" | "negative";
type Replied   = "all" | "true" | "false";
type Tab       = "dashboard" | "reviews" | "analysis";

interface Location {
  accountId:    string;
  locationId:   string;
  locationName: string;
}

interface Review {
  reviewId:     string;
  reviewer:     { displayName: string; profilePhotoUrl?: string };
  starRating:   string;
  starNumber:   number;
  sentiment:    Sentiment;
  comment?:     string;
  createTime:   string;
  updateTime:   string;
  updateTimeMs: number;
  hasReply:     boolean;
  reviewReply?: { comment: string; updateTime: string };
}

interface ReviewsResponse {
  reviews:           Review[];
  averageRating:     number;
  totalReviewCount:  number;
  filteredCount:     number;
  nextPageToken?:    string;
  summary: {
    positive: number; neutral: number; negative: number;
    replied: number;  unreplied: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function periodDates(p: Period): { dateFrom?: string; dateTo?: string } {
  if (p === "all") return {};
  const days = p === "7d" ? 7 : p === "30d" ? 30 : 90;
  const from = new Date(Date.now() - days * 86_400_000);
  return { dateFrom: from.toISOString().split("T")[0] };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? "#f59e0b" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function Avatar({ r }: { r: Review }) {
  return r.reviewer.profilePhotoUrl ? (
    <img src={r.reviewer.profilePhotoUrl} alt=""
      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eff8ff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, color: "#1C75BC", flexShrink: 0 }}>
      {r.reviewer.displayName?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size,
      border: `${Math.max(2, size * 0.1)}px solid #e2e8f0`,
      borderTopColor: "#1C75BC", borderRadius: "50%",
      animation: "spin .7s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GoogleBusinessPage() {
  // Connection
  const [connected,    setConnected]    = useState<boolean | null>(null);
  const [connecting,   setConnecting]   = useState(false);

  // Locations
  const [locations,    setLocations]    = useState<Location[]>([]);
  const [selLoc,       setSelLoc]       = useState<Location | null>(null);
  const [loadingLoc,   setLoadingLoc]   = useState(false);

  // Reviews
  const [reviewsData,  setReviewsData]  = useState<ReviewsResponse | null>(null);
  const [loadingRev,   setLoadingRev]   = useState(false);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [nextPage,     setNextPage]     = useState<string | null>(null);

  // Filters
  const [tab,          setTab]          = useState<Tab>("dashboard");
  const [period,       setPeriod]       = useState<Period>("30d");
  const [sentiment,    setSentiment]    = useState<Sentiment>("all");
  const [replied,      setReplied]      = useState<Replied>("all");

  // Reply
  const [replyOpen,    setReplyOpen]    = useState<string | null>(null);
  const [replyText,    setReplyText]    = useState("");
  const [replySaving,  setReplySaving]  = useState(false);
  const [replyMsg,     setReplyMsg]     = useState("");

  // Error / message
  const [error,        setError]        = useState("");
  const [urlMsg,       setUrlMsg]       = useState("");

  // ── Check connection status on mount ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmb_connected") === "1") setUrlMsg("✓ Google Business connected successfully!");
    if (params.get("gmb_error"))             setUrlMsg("⚠ " + decodeURIComponent(params.get("gmb_error")!));

    fetch("/api/gmb/connect", { method: "POST" })
      .then(r => r.json())
      .then(d => setConnected(!!d.connected))
      .catch(() => setConnected(false));
  }, []);

  // ── Load locations when connected ──
  useEffect(() => {
    if (!connected) return;
    setLoadingLoc(true);
    fetch("/api/gmb/accounts")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        const locs: Location[] = (d.accounts ?? []).flatMap(
          (a: { locations: Location[] }) => a.locations
        );
        setLocations(locs);
        if (locs.length > 0) setSelLoc(locs[0]);
      })
      .catch(() => setError("Failed to load locations"))
      .finally(() => setLoadingLoc(false));
  }, [connected]);

  // ── Load reviews ──
  const loadReviews = useCallback((loc: Location, pageToken?: string) => {
    if (pageToken) setLoadingMore(true); else setLoadingRev(true);
    setError("");

    const pDates = periodDates(period);
    const params = new URLSearchParams({
      accountId:  loc.accountId,
      locationId: loc.locationId,
      fetchAll:   "true",
      ...(pDates.dateFrom ? { dateFrom: pDates.dateFrom } : {}),
      ...(sentiment !== "all" ? { sentiment } : {}),
      ...(replied   !== "all" ? { replied   } : {}),
      ...(pageToken           ? { pageToken } : {}),
    });

    fetch(`/api/gmb/reviews?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setReviewsData(prev => pageToken && prev
          ? { ...d, reviews: [...prev.reviews, ...d.reviews] }
          : d
        );
        setNextPage(d.nextPageToken ?? null);
      })
      .catch(() => setError("Failed to load reviews"))
      .finally(() => { setLoadingRev(false); setLoadingMore(false); });
  }, [period, sentiment, replied]);

  useEffect(() => {
    if (selLoc) { setReviewsData(null); setNextPage(null); loadReviews(selLoc); }
  }, [selLoc, loadReviews]);

  // ── Reply ──
  const handleReply = async (review: Review) => {
    if (!selLoc || !replyText.trim()) return;
    setReplySaving(true); setReplyMsg("");
    try {
      const res = await fetch("/api/gmb/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId:  selLoc.accountId,
          locationId: selLoc.locationId,
          reviewId:   review.reviewId,
          comment:    replyText,
        }),
      });
      const d = await res.json();
      if (d.success || res.ok) {
        setReplyMsg("✓ Reply posted!");
        setReviewsData(prev => prev ? {
          ...prev,
          reviews: prev.reviews.map(r => r.reviewId === review.reviewId
            ? { ...r, hasReply: true, reviewReply: { comment: replyText, updateTime: new Date().toISOString() } }
            : r
          ),
        } : prev);
        setReplyText("");
        setTimeout(() => { setReplyOpen(null); setReplyMsg(""); }, 1500);
      } else {
        setReplyMsg("⚠ " + (d.error ?? "Failed"));
      }
    } catch { setReplyMsg("⚠ Network error"); }
    finally   { setReplySaving(false); }
  };

  // ── Stats ──
  const reviews  = reviewsData?.reviews ?? [];
  const summary  = reviewsData?.summary;
  const avgRating = reviewsData?.averageRating ?? 0;
  const totalCount = reviewsData?.totalReviewCount ?? 0;

  const recentReviews = useMemo(() =>
    [...reviews].sort((a, b) => b.updateTimeMs - a.updateTimeMs).slice(0, 6),
    [reviews]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // NOT CONNECTED
  // ─────────────────────────────────────────────────────────────────────────
  if (connected === null) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <Spinner />
    </div>
  );

  if (connected === false) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Header />
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        {urlMsg && (
          <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 10,
            background: urlMsg.startsWith("✓") ? "#f0fdf4" : "#fef2f2",
            color: urlMsg.startsWith("✓") ? "#16a34a" : "#dc2626",
            border: `1px solid ${urlMsg.startsWith("✓") ? "#bbf7d0" : "#fecaca"}`,
            fontSize: 13, fontWeight: 600 }}>
            {urlMsg}
          </div>
        )}
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#eff8ff",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 32 }}>🏪</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
          Connect Google Business
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
          Connect your Google Business Profile to view all reviews, analytics, and reply to customers.
        </p>
        <a href="/api/gmb/connect"
          onClick={() => setConnecting(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 10,
            background: connecting ? "#f3f4f6" : "white",
            border: "1.5px solid #e2e8f0", borderRadius: 12,
            padding: "12px 24px", fontSize: 14, fontWeight: 600,
            textDecoration: "none", color: "#0f172a",
            boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <GoogleIcon />
          {connecting ? "Redirecting…" : "Sign in with Google"}
        </a>
        <p style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
          Requires access to your Google Business Profile account
        </p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // CONNECTED — MAIN UI
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc",
      fontFamily: "system-ui,-apple-system,sans-serif" }}>

      <Header onDisconnect={() => {
        fetch("/api/gmb/disconnect", { method: "POST" }).then(() => setConnected(false));
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>

        {/* URL message */}
        {urlMsg && (
          <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10,
            background: urlMsg.startsWith("✓") ? "#f0fdf4" : "#fef2f2",
            color: urlMsg.startsWith("✓") ? "#16a34a" : "#dc2626",
            border: `1px solid ${urlMsg.startsWith("✓") ? "#bbf7d0" : "#fecaca"}`,
            fontSize: 13, fontWeight: 600 }}>
            {urlMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
            fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading locations */}
        {loadingLoc && (
          <div style={{ display: "flex", alignItems: "center", gap: 10,
            padding: "40px 0", justifyContent: "center", color: "#94a3b8" }}>
            <Spinner size={20} />
            <span style={{ fontSize: 14 }}>Loading your business locations…</span>
          </div>
        )}

        {!loadingLoc && locations.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>No locations found</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>
              Make sure your Google account manages a Business Profile.
            </p>
          </div>
        )}

        {locations.length > 0 && (
          <>
            {/* ── Location selector ── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {locations.map(loc => (
                <button key={loc.locationId}
                  onClick={() => { setSelLoc(loc); setTab("dashboard"); }}
                  style={{ padding: "9px 18px", borderRadius: 50, fontSize: 13,
                    fontWeight: 600, cursor: "pointer", transition: "all .15s",
                    background: selLoc?.locationId === loc.locationId ? "#1C75BC" : "white",
                    color:      selLoc?.locationId === loc.locationId ? "white"   : "#475569",
                    border:     selLoc?.locationId === loc.locationId ? "none"    : "1.5px solid #e2e8f0",
                    boxShadow:  selLoc?.locationId === loc.locationId
                      ? "0 2px 8px rgba(28,117,188,.25)" : "none" }}>
                  {loc.locationName
                    .replace("Trolleys Supermarket LLC – ", "")
                    .replace("Trolleys - ", "")}
                </button>
              ))}
            </div>

            {/* ── Filters ── */}
            <div style={{ background: "white", border: "1px solid #e5e7eb",
              borderRadius: 12, padding: "12px 16px", marginBottom: 20,
              display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <FilterGroup label="Period" value={period} onChange={v => setPeriod(v as Period)}
                options={[
                  { val: "7d",  label: "7 days"   },
                  { val: "30d", label: "30 days"  },
                  { val: "90d", label: "3 months" },
                  { val: "all", label: "All time" },
                ]} />
              <Divider />
              <FilterGroup label="Sentiment" value={sentiment} onChange={v => setSentiment(v as Sentiment)}
                options={[
                  { val: "all",      label: "All"      },
                  { val: "positive", label: "Positive" },
                  { val: "neutral",  label: "Neutral"  },
                  { val: "negative", label: "Negative" },
                ]} />
              <Divider />
              <FilterGroup label="Replied" value={replied} onChange={v => setReplied(v as Replied)}
                options={[
                  { val: "all",   label: "All"       },
                  { val: "false", label: "Unreplied" },
                  { val: "true",  label: "Replied"   },
                ]} />
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
                {reviewsData?.filteredCount ?? 0} reviews
              </span>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: 0, background: "white",
              borderRadius: 10, border: "1px solid #e5e7eb", padding: 3,
              width: "fit-content", marginBottom: 22 }}>
              {([
                ["dashboard", "Dashboard"],
                ["reviews",   "Reviews"  ],
                ["analysis",  "Analysis" ],
              ] as [Tab, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ padding: "8px 20px", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, borderRadius: 8, transition: "all .15s",
                    background: tab === key ? "#1C75BC" : "transparent",
                    color:      tab === key ? "white"   : "#64748b" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Loading reviews */}
            {loadingRev && (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <Spinner />
              </div>
            )}

            {/* ══════════════════════════════════
                DASHBOARD TAB
            ══════════════════════════════════ */}
            {tab === "dashboard" && !loadingRev && (
              <>
                {/* Stat cards */}
                <div style={{ display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                  gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Avg. Rating",    value: avgRating ? avgRating.toFixed(1) + " ★" : "—", color: "#f59e0b", bg: "#fefce8" },
                    { label: "Total Reviews",  value: totalCount.toLocaleString(),                    color: "#1C75BC", bg: "#eff8ff" },
                    { label: "Period Reviews", value: reviews.length,                                  color: "#7c3aed", bg: "#f5f3ff" },
                    { label: "Positive",       value: summary?.positive ?? 0,                          color: "#16a34a", bg: "#f0fdf4" },
                    { label: "Neutral",        value: summary?.neutral  ?? 0,                          color: "#ca8a04", bg: "#fefce8" },
                    { label: "Negative",       value: summary?.negative ?? 0,                          color: "#dc2626", bg: "#fef2f2" },
                    { label: "Unreplied",      value: summary?.unreplied ?? 0,                         color: "#6b7280", bg: "#f9fafb" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: 12,
                      padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: ".04em" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rating distribution */}
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
                  padding: "20px 24px", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
                    Rating Distribution
                  </h3>
                  {[5,4,3,2,1].map(n => {
                    const count = reviews.filter(r => r.starNumber === n).length;
                    const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={n} style={{ display: "flex", alignItems: "center",
                        gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748b", width: 20,
                          textAlign: "right", flexShrink: 0 }}>{n}★</span>
                        <div style={{ flex: 1, height: 8, background: "#f1f5f9",
                          borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`,
                            background: n >= 4 ? "#16a34a" : n === 3 ? "#f59e0b" : "#dc2626",
                            borderRadius: 4, transition: "width .5s" }} />
                        </div>
                        <span style={{ fontSize: 12, color: "#94a3b8",
                          width: 28, textAlign: "right", flexShrink: 0 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Recent reviews */}
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
                  padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      Recent Reviews
                    </h3>
                    <button onClick={() => setTab("reviews")}
                      style={{ fontSize: 12, fontWeight: 600, color: "#1C75BC",
                        background: "#eff8ff", border: "none", borderRadius: 20,
                        padding: "5px 12px", cursor: "pointer" }}>
                      View all →
                    </button>
                  </div>
                  {recentReviews.length === 0
                    ? <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                        No reviews for this period.
                      </p>
                    : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {recentReviews.map((r, i) => (
                          <div key={r.reviewId} style={{ display: "flex", gap: 12,
                            paddingBottom: i < recentReviews.length - 1 ? 14 : 0,
                            borderBottom: i < recentReviews.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                            <Avatar r={r} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center",
                                gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                  {r.reviewer.displayName}
                                </span>
                                <Stars value={r.starNumber} size={11} />
                                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                                  {fmtDate(r.createTime)}
                                </span>
                              </div>
                              {r.comment && (
                                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5,
                                  overflow: "hidden", display: "-webkit-box",
                                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                                  {r.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </>
            )}

            {/* ══════════════════════════════════
                REVIEWS TAB
            ══════════════════════════════════ */}
            {tab === "reviews" && !loadingRev && (
              <div>
                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", background: "white",
                    borderRadius: 14, border: "1px solid #e5e7eb", color: "#94a3b8" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>No reviews match the filters</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {reviews.map(r => (
                      <div key={r.reviewId} style={{ background: "white", borderRadius: 14,
                        border: "1px solid #e5e7eb",
                        borderLeft: `4px solid ${r.starNumber >= 4 ? "#16a34a" : r.starNumber <= 2 ? "#dc2626" : "#f59e0b"}`,
                        padding: "18px 20px" }}>

                        {/* Review header */}
                        <div style={{ display: "flex", gap: 12, marginBottom: r.comment ? 10 : 0 }}>
                          <Avatar r={r} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center",
                              gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                {r.reviewer.displayName}
                              </span>
                              <Stars value={r.starNumber} size={12} />
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px",
                                borderRadius: 20, marginLeft: "auto",
                                background: r.starNumber >= 4 ? "#f0fdf4" : r.starNumber <= 2 ? "#fef2f2" : "#fefce8",
                                color:      r.starNumber >= 4 ? "#16a34a" : r.starNumber <= 2 ? "#dc2626" : "#ca8a04" }}>
                                {r.sentiment.charAt(0).toUpperCase() + r.sentiment.slice(1)}
                              </span>
                            </div>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                              {fmtDate(r.createTime)}
                              {r.hasReply && <span style={{ marginLeft: 8, color: "#1C75BC", fontWeight: 600 }}>✓ Replied</span>}
                            </span>
                          </div>
                        </div>

                        {r.comment && (
                          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7,
                            paddingLeft: 48, marginBottom: 12 }}>
                            {r.comment}
                          </p>
                        )}

                        {/* Existing reply */}
                        {r.reviewReply && (
                          <div style={{ background: "#f8fafc", borderRadius: 8,
                            padding: "10px 14px", marginLeft: 48, marginBottom: 8 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#1C75BC", marginBottom: 4 }}>
                              ✓ Your reply
                            </p>
                            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                              {r.reviewReply.comment}
                            </p>
                            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                              {fmtDate(r.reviewReply.updateTime)}
                            </p>
                          </div>
                        )}

                        {/* Reply form */}
                        <div style={{ paddingLeft: 48 }}>
                          {!r.reviewReply && replyOpen !== r.reviewId && (
                            <button
                              onClick={() => { setReplyOpen(r.reviewId); setReplyText(""); setReplyMsg(""); }}
                              style={{ fontSize: 12, fontWeight: 600, color: "#1C75BC",
                                background: "#eff8ff", border: "none", borderRadius: 8,
                                padding: "6px 14px", cursor: "pointer" }}>
                              ↩ Reply
                            </button>
                          )}
                          {replyOpen === r.reviewId && (
                            <div>
                              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                placeholder="Write your reply…" rows={3}
                                style={{ width: "100%", border: "1.5px solid #e2e8f0",
                                  borderRadius: 8, padding: "9px 12px", fontSize: 13,
                                  resize: "vertical", outline: "none", fontFamily: "inherit",
                                  boxSizing: "border-box" }} />
                              {replyMsg && (
                                <p style={{ fontSize: 12, margin: "4px 0",
                                  color: replyMsg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>
                                  {replyMsg}
                                </p>
                              )}
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button onClick={() => handleReply(r)}
                                  disabled={replySaving || !replyText.trim()}
                                  style={{ background: (replySaving || !replyText.trim()) ? "#9ca3af" : "#1C75BC",
                                    color: "white", border: "none", borderRadius: 8,
                                    padding: "8px 16px", fontSize: 12, fontWeight: 600,
                                    cursor: (replySaving || !replyText.trim()) ? "not-allowed" : "pointer" }}>
                                  {replySaving ? "Posting…" : "Post Reply"}
                                </button>
                                <button onClick={() => { setReplyOpen(null); setReplyText(""); setReplyMsg(""); }}
                                  style={{ background: "#f3f4f6", color: "#374151",
                                    border: "1px solid #e5e7eb", borderRadius: 8,
                                    padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load more */}
                {nextPage && (
                  <div style={{ textAlign: "center", marginTop: 20 }}>
                    <button onClick={() => selLoc && loadReviews(selLoc, nextPage)}
                      disabled={loadingMore}
                      style={{ background: loadingMore ? "#9ca3af" : "#1C75BC",
                        color: "white", border: "none", borderRadius: 10,
                        padding: "11px 28px", fontSize: 13, fontWeight: 600,
                        cursor: loadingMore ? "not-allowed" : "pointer",
                        display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {loadingMore ? <><Spinner size={16}/> Loading…</> : "Load more reviews"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════
                ANALYSIS TAB
            ══════════════════════════════════ */}
            {tab === "analysis" && !loadingRev && (
              <>
                {/* Summary cards */}
                <div style={{ display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Avg. Rating",     value: avgRating ? avgRating.toFixed(2) : "—",      icon: "⭐" },
                    { label: "Total Reviews",   value: totalCount.toLocaleString(),                   icon: "💬" },
                    { label: "Response Rate",   value: totalCount
                        ? Math.round(((summary?.replied ?? 0) / reviews.length) * 100) + "%"
                        : "—",                                                                         icon: "↩" },
                    { label: "Positive Rate",   value: reviews.length
                        ? Math.round(((summary?.positive ?? 0) / reviews.length) * 100) + "%"
                        : "—",                                                                         icon: "✅" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 14,
                      border: "1px solid #e5e7eb", padding: "20px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#1C75BC", marginBottom: 4 }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: ".04em" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sentiment breakdown */}
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
                  padding: "20px 24px", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
                    Sentiment Breakdown
                  </h3>
                  {[
                    { label: "Positive (4-5★)", count: summary?.positive ?? 0, color: "#16a34a", bg: "#f0fdf4" },
                    { label: "Neutral (3★)",    count: summary?.neutral  ?? 0, color: "#ca8a04", bg: "#fefce8" },
                    { label: "Negative (1-2★)", count: summary?.negative ?? 0, color: "#dc2626", bg: "#fef2f2" },
                  ].map(s => {
                    const pct = reviews.length ? (s.count / reviews.length) * 100 : 0;
                    return (
                      <div key={s.label} style={{ display: "flex", alignItems: "center",
                        gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151",
                          width: 120, flexShrink: 0 }}>{s.label}</span>
                        <div style={{ flex: 1, height: 10, background: "#f1f5f9",
                          borderRadius: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`,
                            background: s.color, borderRadius: 6, transition: "width .5s" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.color,
                          width: 60, textAlign: "right", flexShrink: 0 }}>
                          {s.count} ({Math.round(pct)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply analysis */}
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
                  padding: "20px 24px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
                    Reply Analysis
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { label: "Replied",   value: summary?.replied   ?? 0, color: "#16a34a", bg: "#f0fdf4" },
                      { label: "Unreplied", value: summary?.unreplied ?? 0, color: "#dc2626", bg: "#fef2f2" },
                    ].map(s => (
                      <div key={s.label} style={{ background: s.bg, borderRadius: 10,
                        padding: "16px", textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(summary?.unreplied ?? 0) > 0 && (
                    <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8,
                      background: "#fef2f2", border: "1px solid #fecaca" }}>
                      <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, margin: 0 }}>
                        ⚠ {summary?.unreplied} review{summary?.unreplied !== 1 ? "s" : ""} waiting for a reply.
                      </p>
                      <button onClick={() => { setReplied("false"); setTab("reviews"); }}
                        style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#dc2626",
                          background: "none", border: "1px solid #fecaca", borderRadius: 6,
                          padding: "5px 12px", cursor: "pointer" }}>
                        View unreplied →
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function Header({ onDisconnect }: { onDisconnect?: () => void }) {
  return (
    <div style={{ background: "white", borderBottom: "1px solid #e5e7eb",
      padding: "14px 28px", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/admin"
          style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>
          ← Dashboard
        </Link>
        <span style={{ color: "#e2e8f0" }}>›</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
          Google Business
        </span>
      </div>
      {onDisconnect && (
        <button onClick={onDisconnect}
          style={{ fontSize: 12, color: "#94a3b8", background: "none",
            border: "none", cursor: "pointer", fontWeight: 500 }}>
          Disconnect
        </button>
      )}
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: {
  label: string;
  options: { val: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</span>
      {options.map(o => (
        <button key={o.val} onClick={() => onChange(o.val)}
          style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12,
            fontWeight: 600, cursor: "pointer", transition: "all .12s",
            background: value === o.val ? "#1C75BC" : "#f8f9fb",
            color:      value === o.val ? "white"   : "#475569",
            border:     value === o.val ? "none"    : "1px solid #e2e8f0" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 22, background: "#f1f5f9", flexShrink: 0 }} />;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}