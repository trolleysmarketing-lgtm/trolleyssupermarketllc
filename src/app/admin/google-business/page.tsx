"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period    = "7d" | "30d" | "90d" | "all";
type Sentiment = "all" | "positive" | "neutral" | "negative";
type Tab       = "overview" | "reviews" | "analytics";

interface Review {
  reviewId: string; author: string; rating: number;
  text: string; time: string; timeMs: number; photo: string;
}
interface Branch {
  placeId: string; name: string; city: string;
  rating: number; totalRatings: number; reviews: Review[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  brand:   "#1C75BC",
  success: "#10b981",
  warning: "#f59e0b",
  danger:  "#ef4444",
  muted:   "#94a3b8",
  border:  "#f1f5f9",
  bg:      "#f8fafc",
  card:    "#ffffff",
  text:    "#0f172a",
  sub:     "#64748b",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const short = (n: string) => n.replace("Trolleys Supermarket LLC – ", "").replace("Trolleys - ", "");
const sentOf = (r: number) => r >= 4 ? "positive" : r === 3 ? "neutral" : "negative";
const cutoff = (p: Period) => {
  const D = 86_400_000, now = Date.now();
  return p === "7d" ? now - 7*D : p === "30d" ? now - 30*D : p === "90d" ? now - 90*D : 0;
};
const fmtDate = (ms: number) => ms
  ? new Date(ms).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Stars({ v, size = 13 }: { v: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(v) ? C.warning : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function Avi({ r }: { r: Review }) {
  return r.photo
    ? <img src={r.photo} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${C.border}` }} />
    : <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${C.brand}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: C.brand, flexShrink: 0 }}>
        {r.author[0]?.toUpperCase() ?? "?"}
      </div>;
}

function Spinner() {
  return <>
    <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTopColor: C.brand, borderRadius: "50%", animation: "gmb-spin .7s linear infinite" }} />
    <style>{`@keyframes gmb-spin{to{transform:rotate(360deg)}}`}</style>
  </>;
}

function KPI({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .12s",
      background: active ? C.brand : "#f8f9fb", color: active ? "white" : C.sub, border: active ? "none" : `1px solid #e2e8f0` }}>
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GoogleBusinessPage() {
  const [branches,  setBranches]  = useState<Branch[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [tab,       setTab]       = useState<Tab>("overview");
  const [selIdx,    setSelIdx]    = useState(0);
  const [period,    setPeriod]    = useState<Period>("30d");
  const [sentiment, setSentiment] = useState<Sentiment>("all");

  const load = () => {
    setLoading(true); setError("");
    fetch("/api/gmb/places", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (d.error && !d.branches) { setError(d.error); return; } setBranches(d.branches ?? []); setLastFetch(new Date()); })
      .catch(() => setError("Connection error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const branch = branches[selIdx];

  const filtered = useMemo(() => {
    if (!branch) return [];
    const cut = cutoff(period);
    return branch.reviews.filter(r => (cut === 0 || r.timeMs >= cut) && (sentiment === "all" || sentOf(r.rating) === sentiment));
  }, [branch, period, sentiment]);

  const stats = useMemo(() => branches.map(b => {
    const cut = cutoff(period);
    const rs  = b.reviews.filter(r => cut === 0 || r.timeMs >= cut);
    const pos = rs.filter(r => r.rating >= 4).length;
    const neg = rs.filter(r => r.rating <= 2).length;
    const neu = rs.filter(r => r.rating === 3).length;
    const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0;
    return { ...b, periodReviews: rs.length, pos, neg, neu, periodAvg: avg };
  }), [branches, period]);

  const overall = useMemo(() => {
    const tot = branches.reduce((s, b) => s + b.totalRatings, 0);
    const avg = branches.length ? branches.reduce((s, b) => s + b.rating, 0) / branches.length : 0;
    const per = stats.reduce((s, b) => s + b.periodReviews, 0);
    const srt = [...stats].sort((a, b) => b.rating - a.rating);
    return { tot, avg, per, best: srt[0], worst: srt[srt.length - 1] };
  }, [branches, stats]);

  const recent = useMemo(() =>
    branches.flatMap(b => b.reviews.map(r => ({ ...r, bn: b.name }))).sort((a, b) => b.timeMs - a.timeMs).slice(0, 6),
    [branches]
  );

  // Chart data
  const barData = stats.map(b => ({
    name:    short(b.name).split(" ")[0],
    Rating:  parseFloat(b.rating.toFixed(1)),
    Reviews: b.totalRatings,
    Period:  b.periodReviews,
  }));

  const pieData = branch ? [
    { name: "Positive", value: filtered.filter(r => r.rating >= 4).length },
    { name: "Neutral",  value: filtered.filter(r => r.rating === 3).length },
    { name: "Negative", value: filtered.filter(r => r.rating <= 2).length },
  ].filter(d => d.value > 0) : [];

  const tlData = useMemo(() => {
    if (!branch) return [];
    const g: Record<string, { pos: number; neg: number; neu: number }> = {};
    branch.reviews.forEach(r => {
      if (!r.timeMs) return;
      const k = new Date(r.timeMs).toLocaleDateString("en-AE", { month: "short", year: "2-digit" });
      if (!g[k]) g[k] = { pos: 0, neg: 0, neu: 0 };
      if (r.rating >= 4) g[k].pos++; else if (r.rating <= 2) g[k].neg++; else g[k].neu++;
    });
    return Object.entries(g).slice(-6).map(([month, v]) => ({ month, ...v }));
  }, [branch]);

  const handlePDF = () => window.print();

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <Spinner />
      <p style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>Loading reviews…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-show { display: block !important; }
          body { background: white !important; font-size: 11px; }
          @page { margin: 12mm; size: A4 landscape; }
        }
        .print-show { display: none; }
        .rv-card:hover { box-shadow: 0 4px 20px rgba(28,117,188,.08); }
        .branch-btn { transition: all .15s; }
        .branch-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui,-apple-system,sans-serif" }}>

        {/* Header */}
        <div className="no-print" style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, zIndex: 50, height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/admin" style={{ fontSize: 13, color: C.muted, textDecoration: "none", fontWeight: 500 }}>← Admin</Link>
            <span style={{ color: "#e2e8f0" }}>›</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Google Business Reviews</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {lastFetch && <span style={{ fontSize: 11, color: C.muted }}>Updated {lastFetch.toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })}</span>}
            <button onClick={handlePDF} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: C.success, border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              📄 Export PDF
            </button>
            <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.brand}12`, color: C.brand, border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 24px" }}>

          {/* Print header */}
          <div className="print-show" style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `3px solid ${C.brand}` }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Trolleys Supermarket LLC — Google Reviews Report</h1>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{new Date().toLocaleDateString("en-AE", { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>

          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: C.danger, fontWeight: 600 }}>⚠️ {error}</div>}

          {/* Branch selector */}
          <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            {branches.map((b, i) => (
              <button key={b.placeId} className="branch-btn" onClick={() => setSelIdx(i)}
                style={{ padding: "9px 18px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: selIdx === i ? C.brand : C.card,
                  color:      selIdx === i ? "white"  : C.sub,
                  border:     selIdx === i ? "none"   : `1.5px solid #e2e8f0`,
                  boxShadow:  selIdx === i ? `0 4px 12px ${C.brand}35` : "0 1px 3px rgba(0,0,0,.04)" }}>
                {short(b.name)}
                <span style={{ marginLeft: 6, opacity: .75, fontSize: 11 }}>★ {b.rating.toFixed(1)}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="no-print" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 18px", marginBottom: 22, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>Period</span>
              {(["7d","30d","90d","all"] as Period[]).map(p => (
                <FilterPill key={p} active={period === p} onClick={() => setPeriod(p)}>
                  {p === "7d" ? "7 days" : p === "30d" ? "30 days" : p === "90d" ? "3 months" : "All time"}
                </FilterPill>
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>Sentiment</span>
              {(["all","positive","neutral","negative"] as Sentiment[]).map(s => (
                <FilterPill key={s} active={sentiment === s} onClick={() => setSentiment(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </FilterPill>
              ))}
            </div>
            <span style={{ marginLeft: "auto", fontSize: 13, color: C.muted, fontWeight: 600 }}>{filtered.length} reviews</span>
          </div>

          {/* Tabs */}
          <div className="no-print" style={{ display: "flex", gap: 2, background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 3, width: "fit-content", marginBottom: 26 }}>
            {(["overview","reviews","analytics"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "8px 22px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, borderRadius: 10, transition: "all .15s",
                  background: tab === t ? C.brand : "transparent",
                  color:      tab === t ? "white"  : C.sub }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* ══ OVERVIEW ══ */}
          {tab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 22 }}>
                <KPI icon="🏪" label="Branches"      value={branches.length}                                              color={C.brand}   />
                <KPI icon="⭐" label="Avg. Rating"   value={overall.avg ? overall.avg.toFixed(2) + " ★" : "—"}           color={C.warning} />
                <KPI icon="💬" label="Total Reviews" value={overall.tot.toLocaleString()}                                 color={C.success} />
                <KPI icon="📊" label="Period Reviews" value={overall.per}                                                 color="#7c3aed"   />
              </div>

              {/* Best / Worst */}
              {overall.best && overall.worst && overall.best.placeId !== overall.worst.placeId && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
                  {[
                    { emoji: "🏆", label: "Best Performing", b: overall.best,  accent: C.success },
                    { emoji: "📉", label: "Needs Attention",  b: overall.worst, accent: C.warning },
                  ].map(({ emoji, label, b, accent }) => (
                    <div key={b.placeId} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `4px solid ${accent}`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 32 }}>{emoji}</span>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{short(b.name)}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Stars v={b.rating} size={13} />
                          <span style={{ fontSize: 12, color: C.muted }}>{b.totalRatings.toLocaleString()} reviews</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 22 }}>
                <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 24px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Branch Ratings</p>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Overall Google rating per branch</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.sub }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0,5]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={26} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)", fontSize: 12 }} cursor={{ fill: `${C.brand}06` }} />
                      <Bar dataKey="Rating" fill={C.brand} radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 24px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Sentiment</p>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{branch ? short(branch.name) : "—"}</p>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="45%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={[C.success, C.warning, C.danger][i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>No data</div>
                  )}
                </div>
              </div>

              {/* Recent reviews */}
              <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recent Reviews</p>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Latest across all branches</p>
                  </div>
                  <button onClick={() => setTab("reviews")} style={{ fontSize: 12, fontWeight: 600, color: C.brand, background: `${C.brand}12`, border: "none", borderRadius: 20, padding: "6px 14px", cursor: "pointer" }}>
                    View all →
                  </button>
                </div>
                <div>
                  {recent.map((r, i) => (
                    <div key={r.reviewId} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: i < recent.length - 1 ? `1px solid #f8f9fb` : "none" }}>
                      <Avi r={r} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.author}</span>
                          <span style={{ fontSize: 11, color: C.muted }}>· {short((r as Review & { bn: string }).bn ?? "")}</span>
                          <Stars v={r.rating} size={11} />
                          <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{r.timeMs ? fmtDate(r.timeMs) : r.time}</span>
                        </div>
                        {r.text && <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{r.text}</p>}
                      </div>
                    </div>
                  ))}
                  {recent.length === 0 && <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No reviews yet — click Refresh.</p>}
                </div>
              </div>
            </>
          )}

          {/* ══ REVIEWS ══ */}
          {tab === "reviews" && branch && (
            <div style={{ display: "grid", gridTemplateColumns: "256px 1fr", gap: 20 }}>
              {/* Sidebar */}
              <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px", alignSelf: "start" }}>
                <div style={{ fontSize: 44, fontWeight: 800, color: C.warning, lineHeight: 1, marginBottom: 6 }}>{branch.rating.toFixed(1)}</div>
                <Stars v={branch.rating} size={18} />
                <p style={{ fontSize: 12, color: C.muted, margin: "10px 0 18px" }}>{branch.totalRatings.toLocaleString()} total · {branch.reviews.length} cached</p>
                {[5,4,3,2,1].map(n => {
                  const cnt = filtered.filter(r => r.rating === n).length;
                  const pct = filtered.length ? (cnt / filtered.length) * 100 : 0;
                  return (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: C.sub, width: 22, textAlign: "right", flexShrink: 0, fontWeight: 600 }}>{n}★</span>
                      <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: n >= 4 ? C.success : n === 3 ? C.warning : C.danger, borderRadius: 4, transition: "width .5s" }} />
                      </div>
                      <span style={{ fontSize: 11, color: C.muted, width: 24, textAlign: "right", flexShrink: 0 }}>{cnt}</span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { l: `✓ ${filtered.filter(r => r.rating >= 4).length}`, bg: `${C.success}15`, c: C.success },
                    { l: `✗ ${filtered.filter(r => r.rating <= 2).length}`, bg: `${C.danger}15`,  c: C.danger  },
                    { l: `~ ${filtered.filter(r => r.rating === 3).length}`, bg: `${C.warning}15`, c: C.warning },
                  ].map(s => <span key={s.l} style={{ fontSize: 11, background: s.bg, color: s.c, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{s.l}</span>)}
                </div>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: "60px", textAlign: "center", background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, color: C.muted }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>No reviews match this filter</p>
                  </div>
                ) : filtered.map(r => (
                  <div key={r.reviewId} className="rv-card" style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `4px solid ${r.rating >= 4 ? C.success : r.rating <= 2 ? C.danger : C.warning}`, padding: "18px 20px", transition: "box-shadow .2s" }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: r.text ? 10 : 0 }}>
                      <Avi r={r} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.author}</span>
                          <Stars v={r.rating} size={12} />
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, marginLeft: "auto",
                            background: r.rating >= 4 ? `${C.success}15` : r.rating <= 2 ? `${C.danger}15` : `${C.warning}15`,
                            color:      r.rating >= 4 ? C.success         : r.rating <= 2 ? C.danger        : C.warning }}>
                            {r.rating >= 4 ? "Positive" : r.rating <= 2 ? "Negative" : "Neutral"}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: C.muted }}>{r.timeMs ? fmtDate(r.timeMs) : r.time}</span>
                      </div>
                    </div>
                    {r.text && <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.7, paddingLeft: 50 }}>{r.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab === "analytics" && (
            <>
              {/* Timeline */}
              <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 24px", marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Review Timeline</p>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>{branch ? short(branch.name) : "—"} — sentiment trend by month</p>
                {tlData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={tlData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} cursor={{ fill: "#f8fafc" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="pos" name="Positive" fill={C.success} radius={[4,4,0,0]} stackId="s" />
                      <Bar dataKey="neu" name="Neutral"  fill={C.warning} stackId="s" />
                      <Bar dataKey="neg" name="Negative" fill={C.danger}  radius={[0,0,4,4]} stackId="s" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>Not enough data yet — reviews accumulate over time.</div>
                )}
              </div>

              {/* Horizontal bar charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[
                  { title: "Total Reviews", sub: "All-time count per branch", key: "Reviews", color: `${C.brand}cc` },
                  { title: "Period Reviews", sub: "Reviews in selected period", key: "Period",  color: `${C.success}cc` },
                ].map(({ title, sub, key, color }) => (
                  <div key={key} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 24px" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>{sub}</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={barData} layout="vertical" barSize={18}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.sub }} axisLine={false} tickLine={false} width={58} />
                        <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} cursor={{ fill: "#f8fafc" }} />
                        <Bar dataKey={key} fill={color} radius={[0,6,6,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>

              {/* Branch detail cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                {stats.map(b => (
                  <div key={b.placeId} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{short(b.name)}</p>
                        <p style={{ fontSize: 11, color: C.muted }}>{b.city}</p>
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 800, color: C.warning }}>{b.rating.toFixed(1)}</span>
                    </div>
                    <Stars v={b.rating} size={12} />
                    <p style={{ fontSize: 12, color: C.muted, margin: "10px 0" }}>{b.periodReviews} period · {b.totalRatings} total</p>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                      {b.periodReviews > 0 && (
                        <div style={{ display: "flex", height: "100%" }}>
                          <div style={{ width: `${(b.pos/b.periodReviews)*100}%`, background: C.success }} />
                          <div style={{ width: `${(b.neu/b.periodReviews)*100}%`, background: C.warning }} />
                          <div style={{ width: `${(b.neg/b.periodReviews)*100}%`, background: C.danger  }} />
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        { l: `${b.pos} Pos`, bg: `${C.success}15`, c: C.success },
                        { l: `${b.neg} Neg`, bg: `${C.danger}15`,  c: C.danger  },
                        { l: `${b.neu} Neu`, bg: `${C.warning}15`, c: C.warning },
                      ].map(s => <span key={s.l} style={{ fontSize: 10, background: s.bg, color: s.c, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{s.l}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}