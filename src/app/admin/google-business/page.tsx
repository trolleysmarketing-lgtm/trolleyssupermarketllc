"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Location {
  locationId: string;
  locationName: string;
  city: string;
  phone: string;
  accountId: string;
  fullName: string;
}

interface Review {
  reviewId: string;
  author: string;
  photo: string | null;
  rating: number;
  text: string;
  createTime: string;
  timeMs: number;
  reply: { text: string; time: string } | null;
}

interface ReviewsData {
  reviews: Review[];
  totalReviewCount: number;
  averageRating: number | null;
  nextPageToken: string | null;
}

type Period   = "7d" | "30d" | "90d" | "all";
type Sentiment = "all" | "positive" | "neutral" | "negative";
type Tab      = "overview" | "reviews";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function periodCutoff(p: Period): number {
  const DAY = 86_400_000;
  const now = Date.now();
  if (p === "7d")  return now - 7  * DAY;
  if (p === "30d") return now - 30 * DAY;
  if (p === "90d") return now - 90 * DAY;
  return 0;
}

function sentimentOf(r: number): Sentiment {
  if (r >= 4) return "positive";
  if (r === 3) return "neutral";
  return "negative";
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GoogleBusinessPage() {
  const { data: session, status } = useSession();
  const token = (session as { access_token?: string })?.access_token;

  const [locations, setLocations]     = useState<Location[]>([]);
  const [selLoc, setSelLoc]           = useState<Location | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loadingLoc, setLoadingLoc]   = useState(false);
  const [loadingRev, setLoadingRev]   = useState(false);
  const [error, setError]             = useState("");

  const [tab, setTab]           = useState<Tab>("overview");
  const [period, setPeriod]     = useState<Period>("30d");
  const [sentiment, setSentiment] = useState<Sentiment>("all");

  const [replyOpen, setReplyOpen]   = useState<string | null>(null);
  const [replyText, setReplyText]   = useState("");
  const [replySaving, setReplySaving] = useState(false);
  const [replyMsg, setReplyMsg]     = useState("");

  // ── Load locations ──
  useEffect(() => {
    if (!token) return;
    setLoadingLoc(true);
    setError("");
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
  }, [token]);

  // ── Load reviews when location changes ──
  const loadReviews = useCallback((loc: Location, pageToken?: string) => {
    setLoadingRev(true);
    setError("");
    const params = new URLSearchParams({
      accountId:  loc.accountId,
      locationId: loc.locationId,
      pageSize:   "50",
      ...(pageToken ? { pageToken } : {}),
    });
    fetch(`/api/gmb/reviews?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setReviewsData(prev => pageToken && prev
          ? { ...d, reviews: [...prev.reviews, ...d.reviews] }
          : d
        );
      })
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoadingRev(false));
  }, []);

  useEffect(() => {
    if (selLoc) { setReviewsData(null); loadReviews(selLoc); }
  }, [selLoc, loadReviews]);

  // ── Filtered reviews ──
  const filtered = (reviewsData?.reviews ?? []).filter(r => {
    const cutoff = periodCutoff(period);
    const inTime = cutoff === 0 || r.timeMs >= cutoff;
    const inSent = sentiment === "all" || sentimentOf(r.rating) === sentiment;
    return inTime && inSent;
  });

  // ── Stats ──
  const stats = {
    total:    reviewsData?.totalReviewCount ?? 0,
    avg:      reviewsData?.averageRating ?? 0,
    positive: filtered.filter(r => r.rating >= 4).length,
    neutral:  filtered.filter(r => r.rating === 3).length,
    negative: filtered.filter(r => r.rating <= 2).length,
    period:   filtered.length,
  };

  // ── Reply ──
  const handleReply = async (review: Review) => {
    if (!selLoc || !replyText.trim()) return;
    setReplySaving(true);
    setReplyMsg("");
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
      if (d.success) {
        setReplyMsg("✓ Reply posted!");
        setReviewsData(prev => prev ? {
          ...prev,
          reviews: prev.reviews.map(r =>
            r.reviewId === review.reviewId
              ? { ...r, reply: { text: replyText, time: new Date().toISOString() } }
              : r
          ),
        } : prev);
        setReplyText("");
        setTimeout(() => { setReplyOpen(null); setReplyMsg(""); }, 1500);
      } else {
        setReplyMsg("⚠ " + (d.error ?? "Failed"));
      }
    } catch {
      setReplyMsg("⚠ Network error");
    } finally {
      setReplySaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // NOT SIGNED IN
  // ─────────────────────────────────────────────────────────────────────────
  if (status === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <Spinner />
    </div>
  );

  if (!session || !token) return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
        🏪
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
        Connect Google Business
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
        Sign in with the Google account that manages your Trolleys Supermarket Business Profile to view and reply to reviews.
      </p>
      <button
        onClick={() => signIn("google")}
        style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#0f172a", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}
      >
        <GoogleIcon />
        Sign in with Google
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN UI
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/admin" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>← Dashboard</Link>
          <span style={{ color: "#e2e8f0" }}>›</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Google Business</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {session?.user?.image && (
            <img src={session.user.image} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #e2e8f0" }} />
          )}
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{session?.user?.email}</span>
          <button onClick={() => signOut()} style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: "4px 8px" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading locations */}
        {loadingLoc && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0", justifyContent: "center", color: "#94a3b8" }}>
            <Spinner size={20} /> <span style={{ fontSize: 14 }}>Loading locations…</span>
          </div>
        )}

        {!loadingLoc && locations.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>No locations found</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Make sure your Google account has access to a Business Profile.</p>
          </div>
        )}

        {locations.length > 0 && (
          <>
            {/* ── Location tabs ── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {locations.map(loc => (
                <button
                  key={loc.locationId}
                  onClick={() => { setSelLoc(loc); setTab("overview"); }}
                  style={{
                    padding: "9px 18px", borderRadius: 50, fontSize: 13, fontWeight: 600,
                    background: selLoc?.locationId === loc.locationId ? "#1C75BC" : "white",
                    color:      selLoc?.locationId === loc.locationId ? "white" : "#475569",
                    border:     selLoc?.locationId === loc.locationId ? "none" : "1.5px solid #e2e8f0",
                    cursor: "pointer",
                    boxShadow: selLoc?.locationId === loc.locationId ? "0 2px 8px rgba(28,117,188,.25)" : "none",
                    transition: "all .15s",
                  }}
                >
                  {loc.locationName.replace("Trolleys Supermarket LLC – ", "").replace("Trolleys - ", "")}
                  {loc.city && <span style={{ marginLeft: 6, opacity: .65, fontSize: 11 }}>{loc.city}</span>}
                </button>
              ))}
            </div>

            {/* ── Period + Sentiment filters ── */}
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <FilterGroup
                label="Period"
                options={[
                  { val: "7d",  label: "7 days"  },
                  { val: "30d", label: "30 days" },
                  { val: "90d", label: "3 months"},
                  { val: "all", label: "All time"},
                ]}
                value={period}
                onChange={v => setPeriod(v as Period)}
              />
              <div style={{ width: 1, height: 22, background: "#f1f5f9", flexShrink: 0 }} />
              <FilterGroup
                label="Sentiment"
                options={[
                  { val: "all",      label: "All"      },
                  { val: "positive", label: "Positive" },
                  { val: "neutral",  label: "Neutral"  },
                  { val: "negative", label: "Negative" },
                ]}
                value={sentiment}
                onChange={v => setSentiment(v as Sentiment)}
              />
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
                {stats.period} reviews
              </span>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: 0, background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 3, width: "fit-content", marginBottom: 22 }}>
              {([["overview","Overview"],["reviews","Reviews"]] as [Tab,string][]).map(([key,label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    padding: "8px 20px", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, borderRadius: 8,
                    background: tab === key ? "#1C75BC" : "transparent",
                    color:      tab === key ? "white" : "#64748b",
                    transition: "all .15s",
                  }}
                >{label}</button>
              ))}
            </div>

            {/* ══ OVERVIEW TAB ══ */}
            {tab === "overview" && (
              <>
                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Avg. Rating",     value: stats.avg  ? stats.avg.toFixed(1) + " ★" : "—", color: "#f59e0b", bg: "#fefce8" },
                    { label: "Total Reviews",   value: stats.total.toLocaleString(),                   color: "#1C75BC", bg: "#eff8ff" },
                    { label: "Period Reviews",  value: stats.period,                                    color: "#7c3aed", bg: "#f5f3ff" },
                    { label: "Positive",        value: stats.positive,                                  color: "#16a34a", bg: "#f0fdf4" },
                    { label: "Neutral",         value: stats.neutral,                                   color: "#ca8a04", bg: "#fefce8" },
                    { label: "Negative",        value: stats.negative,                                  color: "#dc2626", bg: "#fef2f2" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Rating distribution */}
                {reviewsData && (
                  <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Rating Distribution</h3>
                    {[5,4,3,2,1].map(n => {
                      const count = filtered.filter(r => r.rating === n).length;
                      const pct   = filtered.length ? (count / filtered.length) * 100 : 0;
                      return (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "#64748b", width: 20, textAlign: "right", flexShrink: 0 }}>{n}★</span>
                          <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: n >= 4 ? "#16a34a" : n === 3 ? "#f59e0b" : "#dc2626", borderRadius: 4, transition: "width .5s" }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#94a3b8", width: 24, textAlign: "right", flexShrink: 0 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Recent reviews preview */}
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Recent Reviews</h3>
                    <button onClick={() => setTab("reviews")} style={{ fontSize: 12, fontWeight: 600, color: "#1C75BC", background: "#eff8ff", border: "none", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>
                      View all →
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filtered.slice(0, 5).map(r => (
                      <ReviewRow key={r.reviewId} review={r} compact />
                    ))}
                    {filtered.length === 0 && (
                      <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No reviews for this period.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ══ REVIEWS TAB ══ */}
            {tab === "reviews" && (
              <div>
                {loadingRev && !reviewsData && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                    <Spinner />
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map(r => (
                    <div
                      key={r.reviewId}
                      style={{
                        background: "white", borderRadius: 14,
                        border: `1px solid #e5e7eb`,
                        borderLeft: `4px solid ${r.rating >= 4 ? "#16a34a" : r.rating <= 2 ? "#dc2626" : "#f59e0b"}`,
                        padding: "18px 20px",
                      }}
                    >
                      <ReviewRow review={r} />

                      {/* Reply section */}
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                        {r.reply ? (
                          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#1C75BC", marginBottom: 4 }}>✓ Your reply</p>
                            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{r.reply.text}</p>
                            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{fmtDate(r.reply.time)}</p>
                          </div>
                        ) : replyOpen === r.reviewId ? (
                          <div>
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Write your reply…"
                              rows={3}
                              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                            />
                            {replyMsg && (
                              <p style={{ fontSize: 12, color: replyMsg.startsWith("✓") ? "#16a34a" : "#dc2626", margin: "4px 0" }}>{replyMsg}</p>
                            )}
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button
                                onClick={() => handleReply(r)}
                                disabled={replySaving || !replyText.trim()}
                                style={{ background: replySaving ? "#9ca3af" : "#1C75BC", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: replySaving ? "not-allowed" : "pointer" }}
                              >
                                {replySaving ? "Posting…" : "Post Reply"}
                              </button>
                              <button
                                onClick={() => { setReplyOpen(null); setReplyText(""); setReplyMsg(""); }}
                                style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReplyOpen(r.reviewId); setReplyText(""); setReplyMsg(""); }}
                            style={{ fontSize: 12, fontWeight: 600, color: "#1C75BC", background: "#eff8ff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}
                          >
                            ↩ Reply
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {filtered.length === 0 && !loadingRev && (
                    <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 14, border: "1px solid #e5e7eb", color: "#94a3b8" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>No reviews for this filter</p>
                    </div>
                  )}
                </div>

                {/* Load more */}
                {reviewsData?.nextPageToken && (
                  <div style={{ textAlign: "center", marginTop: 20 }}>
                    <button
                      onClick={() => selLoc && loadReviews(selLoc, reviewsData.nextPageToken!)}
                      disabled={loadingRev}
                      style={{ background: loadingRev ? "#9ca3af" : "#1C75BC", color: "white", border: "none", borderRadius: 10, padding: "11px 28px", fontSize: 13, fontWeight: 600, cursor: loadingRev ? "not-allowed" : "pointer" }}
                    >
                      {loadingRev ? "Loading…" : "Load more reviews"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function ReviewRow({ review: r, compact }: { review: Review; compact?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {r.photo ? (
        <img src={r.photo} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eff8ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#1C75BC", flexShrink: 0 }}>
          {r.author[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{r.author}</span>
          <Stars value={r.rating} size={12} />
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>{fmtDate(r.createTime)}</span>
        </div>
        {r.text && (
          <p style={{
            fontSize: 13, color: "#475569", lineHeight: 1.65,
            ...(compact ? { overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const } : {}),
          }}>
            {r.text}
          </p>
        )}
      </div>
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
      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</span>
      {options.map(o => (
        <button
          key={o.val}
          onClick={() => onChange(o.val)}
          style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: value === o.val ? "#1C75BC" : "#f8f9fb",
            color:      value === o.val ? "white" : "#475569",
            border:     value === o.val ? "none" : "1px solid #e2e8f0",
            cursor: "pointer", transition: "all .12s",
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: `${size * 0.1}px solid #e2e8f0`,
      borderTopColor: "#1C75BC",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
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