"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period    = "7d" | "30d" | "90d" | "all";
type Sentiment = "all" | "positive" | "neutral" | "negative";
type Tab       = "dashboard" | "reviews" | "analysis";

interface Review {
  reviewId: string;
  author:   string;
  rating:   number;
  text:     string;
  time:     string;
  timeMs:   number;
  photo:    string;
}

interface Branch {
  placeId:      string;
  name:         string;
  city:         string;
  rating:       number;
  totalRatings: number;
  reviews:      Review[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sentimentOf(r: number): Sentiment {
  if (r >= 4) return "positive";
  if (r === 3) return "neutral";
  return "negative";
}

function periodCutoff(p: Period): number {
  const DAY = 86_400_000;
  const now = Date.now();
  if (p === "7d")  return now - 7  * DAY;
  if (p === "30d") return now - 30 * DAY;
  if (p === "90d") return now - 90 * DAY;
  return 0;
}

function fmtDate(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-AE", {
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

function Avatar({ review }: { review: Review }) {
  return review.photo ? (
    <img src={review.photo} alt=""
      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eff8ff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, color: "#1C75BC", flexShrink: 0 }}>
      {review.author[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function Spinner({ size = 28 }: { size?: number }) {
  return (
    <>
      <div style={{ width: size, height: size,
        border: `${Math.max(2, size * 0.1)}px solid #e2e8f0`,
        borderTopColor: "#1C75BC", borderRadius: "50%",
        animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

function FilterBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      cursor: "pointer", transition: "all .12s",
      background: active ? "#1C75BC" : "#f8f9fb",
      color:      active ? "white"   : "#475569",
      border:     active ? "none"    : "1px solid #e2e8f0",
    }}>{children}</button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GoogleBusinessPage() {
  const [branches,  setBranches]  = useState<Branch[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const [tab,       setTab]       = useState<Tab>("dashboard");
  const [selIdx,    setSelIdx]    = useState(0);
  const [period,    setPeriod]    = useState<Period>("30d");
  const [sentiment, setSentiment] = useState<Sentiment>("all");

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    fetch("/api/gmb/places", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.error && !d.branches) { setError(d.error); return; }
        setBranches(d.branches ?? []);
        setLastFetch(new Date());
      })
      .catch(() => setError("Connection error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const branch = branches[selIdx];

  const filtered = useMemo(() => {
    if (!branch) return [];
    const cutoff = periodCutoff(period);
    return branch.reviews.filter(r => {
      const inTime = cutoff === 0 || r.timeMs >= cutoff;
      const inSent = sentiment === "all" || sentimentOf(r.rating) === sentiment;
      return inTime && inSent;
    });
  }, [branch, period, sentiment]);

  const branchStats = useMemo(() => {
    return branches.map(b => {
      const cutoff = periodCutoff(period);
      const rs  = b.reviews.filter(r => cutoff === 0 || r.timeMs >= cutoff);
      const pos = rs.filter(r => r.rating >= 4).length;
      const neg = rs.filter(r => r.rating <= 2).length;
      const neu = rs.filter(r => r.rating === 3).length;
      const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0;
      return { ...b, periodReviews: rs.length, pos, neg, neu, periodAvg: avg };
    });
  }, [branches, period]);

  const overall = useMemo(() => {
    const totalRatings = branches.reduce((s, b) => s + b.totalRatings, 0);
    const avgRating    = branches.length
      ? branches.reduce((s, b) => s + b.rating, 0) / branches.length : 0;
    const periodTotal  = branchStats.reduce((s, b) => s + b.periodReviews, 0);
    const sorted       = [...branchStats].sort((a, b) => b.rating - a.rating);
    return { totalRatings, avgRating, periodTotal, best: sorted[0], worst: sorted[sorted.length - 1] };
  }, [branches, branchStats]);

  const allRecent = useMemo(() =>
    branches.flatMap(b => b.reviews.map(r => ({ ...r, branchName: b.name })))
      .sort((a, b) => b.timeMs - a.timeMs).slice(0, 8),
    [branches]
  );

  const shortName = (name: string) =>
    name.replace("Trolleys Supermarket LLC – ", "").replace("Trolleys - ", "");

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16 }}>
      <Spinner size={44} />
      <p style={{ fontSize: 15, color: "#475569", fontWeight: 600, fontFamily: "system-ui,sans-serif" }}>
        Loading reviews…
      </p>
    </div>
  );

  // ─── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc",
      fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Header */}
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
            Google Business Reviews
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastFetch && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Updated {lastFetch.toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={() => load()}
            style={{ display: "flex", alignItems: "center", gap: 6,
              background: "#eff8ff", color: "#1C75BC", border: "none",
              borderRadius: 20, padding: "8px 14px", fontSize: 12,
              fontWeight: 700, cursor: "pointer" }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
            fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Branch selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {branches.map((b, i) => (
            <button key={b.placeId} onClick={() => setSelIdx(i)}
              style={{ padding: "9px 18px", borderRadius: 50, fontSize: 13,
                fontWeight: 600, cursor: "pointer", transition: "all .15s",
                background: selIdx === i ? "#1C75BC" : "white",
                color:      selIdx === i ? "white"   : "#475569",
                border:     selIdx === i ? "none"    : "1.5px solid #e2e8f0",
                boxShadow:  selIdx === i ? "0 2px 8px rgba(28,117,188,.25)" : "none" }}>
              {shortName(b.name)}
              <span style={{ marginLeft: 6, opacity: .7, fontSize: 11 }}>
                ★ {b.rating.toFixed(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "white", border: "1px solid #e5e7eb",
          borderRadius: 12, padding: "12px 16px", marginBottom: 20,
          display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: ".05em" }}>Period</span>
            {(["7d","30d","90d","all"] as Period[]).map(p => (
              <FilterBtn key={p} active={period === p} onClick={() => setPeriod(p)}>
                {p === "7d" ? "7 days" : p === "30d" ? "30 days" : p === "90d" ? "3 months" : "All time"}
              </FilterBtn>
            ))}
          </div>
          <div style={{ width: 1, height: 22, background: "#f1f5f9", flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: ".05em" }}>Sentiment</span>
            {(["all","positive","neutral","negative"] as Sentiment[]).map(s => (
              <FilterBtn key={s} active={sentiment === s} onClick={() => setSentiment(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </FilterBtn>
            ))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
            {filtered.length} reviews
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: "white", borderRadius: 10,
          border: "1px solid #e5e7eb", padding: 3, width: "fit-content", marginBottom: 22 }}>
          {([["dashboard","Dashboard"],["reviews","Reviews"],["analysis","Analysis"]] as [Tab,string][]).map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: "8px 20px", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, borderRadius: 8, transition: "all .15s",
                background: tab === key ? "#1C75BC" : "transparent",
                color:      tab === key ? "white"   : "#64748b" }}>
              {label}
            </button>
          ))}
        </div>

        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && (
          <>
            {/* Overall stats */}
            <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 12, marginBottom: 20 }}>
              {[
                { label: "Branches",       value: branches.length,                                            color: "#1C75BC", bg: "#eff8ff" },
                { label: "Avg. Rating",    value: overall.avgRating ? overall.avgRating.toFixed(1) + " ★" : "—", color: "#f59e0b", bg: "#fefce8" },
                { label: "Total Reviews",  value: overall.totalRatings.toLocaleString(),                       color: "#16a34a", bg: "#f0fdf4" },
                { label: "Period Reviews", value: overall.periodTotal,                                         color: "#7c3aed", bg: "#f5f3ff" },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "18px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Best & worst */}
            {overall.best && overall.worst && overall.best.placeId !== overall.worst.placeId && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "🏆 Best Performing",  branch: overall.best,  border: "#16a34a" },
                  { label: "⚠️ Needs Attention",  branch: overall.worst, border: "#f59e0b" },
                ].map(({ label, branch: b, border }) => (
                  <div key={b.placeId} style={{ background: "white", borderRadius: 14,
                    border: "1px solid #e5e7eb", borderLeft: `4px solid ${border}`,
                    padding: "16px 20px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: border,
                      textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                      {shortName(b.name)}
                    </p>
                    <Stars value={b.rating} size={13} />
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      {b.totalRatings.toLocaleString()} total reviews
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Branch quick view */}
            <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 12, marginBottom: 20 }}>
              {branchStats.map(b => (
                <div key={b.placeId}
                  onClick={() => { setSelIdx(branches.findIndex(x => x.placeId === b.placeId)); setTab("reviews"); }}
                  style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
                    padding: "18px", cursor: "pointer", transition: "box-shadow .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(28,117,188,.1)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {shortName(b.name)}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{b.city}</p>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>
                      {b.rating.toFixed(1)}
                    </span>
                  </div>
                  <Stars value={b.rating} size={12} />
                  <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 11 }}>
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ {b.pos}</span>
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>✗ {b.neg}</span>
                    <span style={{ color: "#94a3b8" }}>~ {b.neu}</span>
                    <span style={{ color: "#64748b", marginLeft: "auto" }}>
                      {b.reviews.length} cached · {b.totalRatings} total
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent reviews */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
              padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Recent Reviews</h3>
                <button onClick={() => setTab("reviews")}
                  style={{ fontSize: 12, fontWeight: 600, color: "#1C75BC",
                    background: "#eff8ff", border: "none", borderRadius: 20,
                    padding: "5px 12px", cursor: "pointer" }}>
                  View all →
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {allRecent.map((r, i) => (
                  <div key={r.reviewId} style={{ display: "flex", gap: 12,
                    paddingBottom: i < allRecent.length - 1 ? 14 : 0,
                    borderBottom: i < allRecent.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <Avatar review={r} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center",
                        gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                          {r.author}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          · {shortName((r as Review & { branchName: string }).branchName ?? "")}
                        </span>
                        <Stars value={r.rating} size={11} />
                        <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                          {r.timeMs ? fmtDate(r.timeMs) : r.time}
                        </span>
                      </div>
                      {r.text && (
                        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5,
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                          {r.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {allRecent.length === 0 && (
                  <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                    No reviews yet. Click Refresh to fetch latest.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══ REVIEWS ══ */}
        {tab === "reviews" && branch && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>

            {/* Sidebar */}
            <div>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
                padding: "20px", marginBottom: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#f59e0b",
                  lineHeight: 1, marginBottom: 6 }}>
                  {branch.rating.toFixed(1)}
                </div>
                <Stars value={branch.rating} size={16} />
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 16px" }}>
                  {branch.totalRatings.toLocaleString()} total · {branch.reviews.length} cached
                </p>
                {[5,4,3,2,1].map(n => {
                  const count = filtered.filter(r => r.rating === n).length;
                  const pct   = filtered.length ? (count / filtered.length) * 100 : 0;
                  return (
                    <div key={n} style={{ display: "flex", alignItems: "center",
                      gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#64748b",
                        width: 18, textAlign: "right", flexShrink: 0 }}>{n}★</span>
                      <div style={{ flex: 1, height: 6, background: "#f1f5f9",
                        borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`,
                          background: n >= 4 ? "#16a34a" : n === 3 ? "#f59e0b" : "#dc2626",
                          borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8",
                        width: 20, textAlign: "right", flexShrink: 0 }}>{count}</span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9",
                  display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { label: `✓ ${filtered.filter(r => r.rating >= 4).length}`, bg: "#f0fdf4", color: "#16a34a" },
                    { label: `✗ ${filtered.filter(r => r.rating <= 2).length}`, bg: "#fef2f2", color: "#dc2626" },
                    { label: `~ ${filtered.filter(r => r.rating === 3).length}`, bg: "#fefce8", color: "#ca8a04" },
                  ].map(s => (
                    <span key={s.label} style={{ fontSize: 11, background: s.bg,
                      color: s.color, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Review cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center", background: "white",
                  borderRadius: 14, border: "1px solid #e5e7eb", color: "#94a3b8" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>No reviews for this filter</p>
                  <p style={{ fontSize: 12, marginTop: 6 }}>
                    Try changing the period or sentiment filter
                  </p>
                </div>
              ) : filtered.map(r => (
                <div key={r.reviewId} style={{ background: "white", borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  borderLeft: `4px solid ${r.rating >= 4 ? "#16a34a" : r.rating <= 2 ? "#dc2626" : "#f59e0b"}`,
                  padding: "18px 20px" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: r.text ? 10 : 0 }}>
                    <Avatar review={r} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center",
                        gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                          {r.author}
                        </span>
                        <Stars value={r.rating} size={12} />
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px",
                          borderRadius: 20, marginLeft: "auto",
                          background: r.rating >= 4 ? "#f0fdf4" : r.rating <= 2 ? "#fef2f2" : "#fefce8",
                          color:      r.rating >= 4 ? "#16a34a" : r.rating <= 2 ? "#dc2626" : "#ca8a04" }}>
                          {r.rating >= 4 ? "Positive" : r.rating <= 2 ? "Negative" : "Neutral"}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {r.timeMs ? fmtDate(r.timeMs) : r.time}
                      </span>
                    </div>
                  </div>
                  {r.text && (
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7,
                      paddingLeft: 48 }}>
                      {r.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ANALYSIS ══ */}
        {tab === "analysis" && (
          <>
            <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 12, marginBottom: 20 }}>
              {branchStats.map(b => (
                <div key={b.placeId} style={{ background: "white", borderRadius: 14,
                  border: "1px solid #e5e7eb", padding: "20px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
                    {shortName(b.name)}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>{b.city}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b" }}>
                      {b.periodAvg > 0 ? b.periodAvg.toFixed(1) : "—"}
                    </span>
                    {b.periodAvg > 0 && <Stars value={b.periodAvg} size={13} />}
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
                    {b.periodReviews} period · {b.totalRatings} total
                  </p>
                  {/* Sentiment bar */}
                  <div style={{ display: "flex", height: 8, borderRadius: 99,
                    overflow: "hidden", background: "#f1f5f9", marginBottom: 10 }}>
                    {b.periodReviews > 0 && <>
                      <div style={{ width: `${(b.pos/b.periodReviews)*100}%`, background: "#16a34a" }} />
                      <div style={{ width: `${(b.neu/b.periodReviews)*100}%`, background: "#f59e0b" }} />
                      <div style={{ width: `${(b.neg/b.periodReviews)*100}%`, background: "#dc2626" }} />
                    </>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {[
                      { label: `${b.pos} Positive`, bg: "#f0fdf4", color: "#16a34a" },
                      { label: `${b.neg} Negative`, bg: "#fef2f2", color: "#dc2626" },
                      { label: `${b.neu} Neutral`,  bg: "#fefce8", color: "#ca8a04" },
                    ].map(s => (
                      <span key={s.label} style={{ fontSize: 11, background: s.bg,
                        color: s.color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                        {s.label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => { setSelIdx(branches.findIndex(x => x.placeId === b.placeId)); setTab("reviews"); }}
                    style={{ width: "100%", padding: "8px 0", borderRadius: 10,
                      border: "1px solid #e2e8f0", background: "#f8f9fb",
                      fontSize: 12, fontWeight: 600, color: "#1C75BC", cursor: "pointer" }}>
                    View Reviews →
                  </button>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
              overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  Branch Comparison
                </h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8f9fb" }}>
                      {["Branch","Total Reviews","Cached","Period","Avg","Positive","Negative","Neutral"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 700, color: "#64748b",
                          textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {branchStats.map((b, i) => (
                      <tr key={b.placeId} style={{ borderTop: "1px solid #f1f5f9",
                        background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
                          {shortName(b.name)}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>
                          {b.totalRatings.toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>
                          {b.reviews.length}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>
                          {b.periodReviews}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {b.periodAvg > 0 ? <Stars value={b.periodAvg} size={12} /> : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#16a34a", fontWeight: 700 }}>{b.pos}</td>
                        <td style={{ padding: "12px 16px", color: "#dc2626", fontWeight: 700 }}>{b.neg}</td>
                        <td style={{ padding: "12px 16px", color: "#ca8a04", fontWeight: 700 }}>{b.neu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}