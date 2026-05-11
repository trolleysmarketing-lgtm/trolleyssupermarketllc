"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  en: {
    dir: "ltr" as const,
    title: "Google Business Reviews",
    admin: "Admin",
    refresh: "Refresh",
    downloadReport: "Download Report",
    exportPDF: "Export PDF",
    overview: "Overview",
    reviews: "Reviews",
    branchAnalysis: "Branch Analysis",
    avgRating: "Avg. Rating",
    totalReviews: "Total Reviews",
    positiveCount: "Positive",
    negativeCount: "Negative",
    neutralCount: "Neutral",
    period: "Period",
    filter: "Filter",
    last7: "Last 7 days",
    last30: "Last 30 days",
    last90: "Last 3 months",
    allTime: "All time",
    allReviews: "All",
    positive: "Positive (4-5★)",
    neutral: "Neutral (3★)",
    negative: "Negative (1-2★)",
    noReviews: "No reviews match the selected filters.",
    loading: "Loading dashboard...",
    loadingSub: "Fetching latest reviews from Google",
    selectBranches: "Select Branches",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    format: "Format",
    download: "Download",
    preparing: "Preparing...",
    reportTitle: "Download Report",
    reportSub: "Select period, branches and format",
    branchComparison: "Branch Comparison",
    recentReviews: "Recent Reviews",
    viewAll: "View all →",
    viewReviews: "View Reviews →",
    branches: "branches",
    avgScore: "Avg. Score",
    sentPositive: "Positive",
    sentNeutral: "Neutral",
    sentNegative: "Negative",
    openLabel: "● Open",
    closedLabel: "● Closed",
    viewOnMaps: "View on Maps →",
    reviews_count: (n: number) => `${n} review${n !== 1 ? "s" : ""}`,
    periodReviews: "Period Reviews",
    totalLabel: "Total",
    apiNote: "Showing latest 5 reviews per branch (Google API limit). Total ratings are accurate.",
    noData: "No data available",
    dashboard: "Dashboard",
    score: "Score",
    lastUpdated: "Last updated",
    generateReport: "Generate Report",
    exportData: "Export Data",
    summary: "Summary",
    totalBranches: "Total Branches",
    avgRatingAll: "Overall Avg. Rating",
    totalReviewsAll: "Total Reviews",
    responseRate: "Response Rate",
    insights: "Insights",
    bestPerforming: "Best Performing",
    worstPerforming: "Worst Performing",
    ratingDistribution: "Rating Distribution",
    periodSummary: "Period Summary",
    actions: "Actions",
    reply: "Reply",
    share: "Share",
    copied: "Copied!",
    print: "Print",
    generated: "Generated",
    page: "Page",
    of: "of",
    confidential: "CONFIDENTIAL - Trolleys Supermarket LLC",
  },
  ar: {
    dir: "rtl" as const,
    title: "مراجعات Google Business",
    admin: "الإدارة",
    refresh: "تحديث",
    downloadReport: "تحميل التقرير",
    exportPDF: "تصدير PDF",
    overview: "نظرة عامة",
    reviews: "المراجعات",
    branchAnalysis: "تحليل الفروع",
    avgRating: "متوسط التقييم",
    totalReviews: "إجمالي المراجعات",
    positiveCount: "إيجابية",
    negativeCount: "سلبية",
    neutralCount: "محايدة",
    period: "الفترة",
    filter: "تصفية",
    last7: "آخر 7 أيام",
    last30: "آخر 30 يومًا",
    last90: "آخر 3 أشهر",
    allTime: "الكل",
    allReviews: "الكل",
    positive: "إيجابية (4-5★)",
    neutral: "محايدة (3★)",
    negative: "سلبية (1-2★)",
    noReviews: "لا توجد مراجعات تطابق الفلاتر المحددة.",
    loading: "جارٍ تحميل لوحة التحكم...",
    loadingSub: "جلب أحدث المراجعات من Google",
    selectBranches: "اختر الفروع",
    selectAll: "تحديد الكل",
    deselectAll: "إلغاء التحديد",
    format: "الصيغة",
    download: "تحميل",
    preparing: "جارٍ التحضير...",
    reportTitle: "تحميل التقرير",
    reportSub: "اختر الفترة والفروع والصيغة",
    branchComparison: "مقارنة الفروع",
    recentReviews: "أحدث المراجعات",
    viewAll: "← عرض الكل",
    viewReviews: "← عرض المراجعات",
    branches: "فروع",
    avgScore: "متوسط التقييم",
    sentPositive: "إيجابية",
    sentNeutral: "محايدة",
    sentNegative: "سلبية",
    openLabel: "● مفتوح",
    closedLabel: "● مغلق",
    viewOnMaps: "← عرض على الخريطة",
    reviews_count: (n: number) => `${n} مراجعة`,
    periodReviews: "مراجعات الفترة",
    totalLabel: "الإجمالي",
    apiNote: "عرض آخر 5 مراجعات لكل فرع (حد Google API). إجمالي التقييمات دقيق.",
    noData: "لا توجد بيانات",
    dashboard: "لوحة التحكم",
    score: "النتيجة",
    lastUpdated: "آخر تحديث",
    generateReport: "إنشاء تقرير",
    exportData: "تصدير البيانات",
    summary: "ملخص",
    totalBranches: "إجمالي الفروع",
    avgRatingAll: "متوسط التقييم العام",
    totalReviewsAll: "إجمالي المراجعات",
    responseRate: "معدل الرد",
    insights: "رؤى",
    bestPerforming: "الأفضل أداءً",
    worstPerforming: "الأقل أداءً",
    ratingDistribution: "توزيع التقييمات",
    periodSummary: "ملخص الفترة",
    actions: "إجراءات",
    reply: "رد",
    share: "مشاركة",
    copied: "تم النسخ!",
    print: "طباعة",
    generated: "تم الإنشاء",
    page: "صفحة",
    of: "من",
    confidential: "سري - تروليز سوبرماركت ذ.م.م",
  },
};

type Lang = "en" | "ar";
type Tab = "dashboard" | "reviews" | "analysis";
type Period = "7d" | "30d" | "90d" | "all";
type Sentiment = "all" | "positive" | "neutral" | "negative";
type ReportPeriod = "daily" | "weekly" | "monthly" | "all";

interface Review {
  reviewId: string;
  author: string;
  rating: number;
  text: string;
  time: string;
  timeMs: number;
  photo?: string;
}

interface Branch {
  placeId: string;
  name: string;
  city: string;
  rating: number;
  totalRatings: number;
  isOpen: boolean | null;
  phone: string;
  url: string;
  reviews: Review[];
}

function sentimentOf(r: number): Sentiment {
  if (r >= 4) return "positive";
  if (r === 3) return "neutral";
  return "negative";
}

function periodCutoff(p: Period): number {
  const DAY = 86400000;
  const now = Date.now();
  if (p === "7d") return now - 7 * DAY;
  if (p === "30d") return now - 30 * DAY;
  if (p === "90d") return now - 90 * DAY;
  return 0;
}

function fmtDate(ms: number, lang: Lang) {
  return new Date(ms).toLocaleDateString(lang === "ar" ? "ar-AE" : "en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? "#f59e0b" : "#e2e8f0"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function GoogleBusinessPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [period, setPeriod] = useState<Period>("30d");
  const [sentiment, setSentiment] = useState<Sentiment>("all");

  const [showReport, setShowReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("weekly");
  const [reportFormat, setReportFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [reportIds, setReportIds] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/api/gmb/places")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          setLoading(false);
          return;
        }
        setBranches(d.branches ?? []);
        setReportIds((d.branches ?? []).map((b: Branch) => b.placeId));
        setLoading(false);
      })
      .catch(() => {
        setError("Connection error");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const branch = branches[selectedIdx];

  const filteredReviews = useMemo(() => {
    if (!branch) return [];
    const cutoff = periodCutoff(period);
    return branch.reviews.filter((r) => {
      const inPeriod = cutoff === 0 || r.timeMs >= cutoff;
      const inSent = sentiment === "all" || sentimentOf(r.rating) === sentiment;
      return inPeriod && inSent;
    });
  }, [branch, period, sentiment]);

  const branchStats = useMemo(() => {
    const cutoff = periodCutoff(period);
    return branches.map((b) => {
      const rs = b.reviews.filter((r) => cutoff === 0 || r.timeMs >= cutoff);
      const pos = rs.filter((r) => r.rating >= 4).length;
      const neg = rs.filter((r) => r.rating <= 2).length;
      const neu = rs.filter((r) => r.rating === 3).length;
      const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0;
      return { ...b, periodReviews: rs.length, pos, neg, neu, periodAvg: avg };
    });
  }, [branches, period]);

  const allRecent = useMemo(
    () =>
      branches
        .flatMap((b) => b.reviews.map((r) => ({ ...r, branchName: b.name })))
        .sort((a, b) => b.timeMs - a.timeMs)
        .slice(0, 6),
    [branches]
  );

  const overallStats = useMemo(() => {
    const totalRatings = branches.reduce((s, b) => s + b.totalRatings, 0);
    const avgRating =
      branches.length > 0
        ? branches.reduce((s, b) => s + b.rating, 0) / branches.length
        : 0;
    const totalPeriodReviews = branchStats.reduce((s, b) => s + b.periodReviews, 0);
    const best = branchStats.reduce((a, b) => (b.rating > a.rating ? b : a), branchStats[0]);
    const worst = branchStats.reduce((a, b) => (b.rating < a.rating ? b : a), branchStats[0]);
    return { totalRatings, avgRating, totalPeriodReviews, best, worst };
  }, [branches, branchStats]);

  async function exportReport(format: "csv" | "json") {
    if (!reportIds.length) return;
    setDownloading(true);
    const params = new URLSearchParams({
      period: reportPeriod,
      format,
      branches: reportIds.join(","),
    });
    try {
      const res = await fetch(`/api/gmb/report?${params}`);
      if (format === "csv") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trolleys-report-${reportPeriod}-${getToday()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trolleys-report-${reportPeriod}-${getToday()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(false);
      setShowReport(false);
    }
  }

  function exportPDF() {
    window.print();
  }

  function copyShareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const PERIOD_OPTS: { val: Period; label: string }[] = [
    { val: "7d", label: t.last7 },
    { val: "30d", label: t.last30 },
    { val: "90d", label: t.last90 },
    { val: "all", label: t.allTime },
  ];
  const SENT_OPTS: { val: Sentiment; label: string }[] = [
    { val: "all", label: t.allReviews },
    { val: "positive", label: t.positive },
    { val: "neutral", label: t.neutral },
    { val: "negative", label: t.negative },
  ];

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8f9fb 0%, #f1f5f9 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: "3px solid #e2e8f0",
              borderTopColor: "#0e76bc",
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
              margin: "0 auto 18px",
            }}
          />
          <p
            style={{
              fontSize: 16,
              color: "#475569",
              fontFamily: "system-ui,sans-serif",
              fontWeight: 600,
            }}
          >
            {t.loading}
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
            {t.loadingSub}
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        .btn{cursor:pointer;border:none;transition:all .18s;font-family:inherit;font-size:inherit}
        .btn:hover{opacity:.88}
        .btn:disabled{opacity:.4;cursor:not-allowed}
        .fbtn{cursor:pointer;border:1px solid #e2e8f0;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;color:#475569;background:#f8f9fb;transition:all .15s;font-family:inherit}
        .fbtn:hover:not(.act){border-color:#0e76bc;color:#0e76bc}
        .fbtn.act{background:#0e76bc;color:white;border-color:#0e76bc}
        .rv-card{transition:box-shadow .2s;background:white;border-radius:16px;border:1px solid #f1f5f9;animation:fadeIn .3s ease}
        .rv-card:hover{box-shadow:0 8px 24px rgba(14,118,188,.09)}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
        .stat-card{background:white;border-radius:14px;border:1px solid #f1f5f9;padding:20px;transition:all .2s;animation:slideIn .3s ease}
        .stat-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.04)}
        @media print{
          body *{visibility:hidden}
          #print-area,#print-area *{visibility:visible}
          #print-area{position:absolute;left:0;top:0;width:100%}
          .no-print{display:none!important}
        }
        @media(max-width:720px){
          .rv-grid{grid-template-columns:1fr!important}
          .stat-grid{grid-template-columns:1fr 1fr!important}
          .dashboard-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <div
        dir={t.dir}
        style={{
          minHeight: "100vh",
          background: "#f8f9fb",
          fontFamily: "system-ui,-apple-system,sans-serif",
        }}
      >
        {/* HEADER */}
        <div
          className="no-print"
          style={{
            background: "white",
            borderBottom: "1px solid #f1f5f9",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/admin"
              style={{
                fontSize: 13,
                color: "#94a3b8",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {lang === "ar" ? "→" : "←"} {t.admin}
            </Link>
            <span style={{ color: "#e2e8f0" }}>›</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #fff1f2, #fef2f2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(222,43,46,.1)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#de2b2e"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                {t.title}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                gap: 2,
                background: "#f1f5f9",
                borderRadius: 20,
                padding: 3,
              }}
            >
              {(["en", "ar"] as Lang[]).map((l) => (
                <button
                  key={l}
                  className="btn"
                  onClick={() => setLang(l)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 700,
                    background: lang === l ? "white" : "transparent",
                    color: lang === l ? "#0f172a" : "#94a3b8",
                    boxShadow:
                      lang === l ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                  }}
                >
                  {l === "en" ? "EN" : "ع"}
                </button>
              ))}
            </div>
            <button
              className="btn"
              onClick={load}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#eff6ff",
                color: "#0e76bc",
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {t.refresh}
            </button>
            <button
              className="btn"
              onClick={exportPDF}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f0fdf4",
                color: "#16a34a",
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {t.exportPDF}
            </button>
            <button
              className="btn"
              onClick={() => setShowReport(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#0e76bc",
                color: "white",
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t.downloadReport}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 24px" }}>
          {error && (
            <div
              style={{
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
                fontSize: 13,
                color: "#de2b2e",
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* API Info */}
          <div
            className="no-print"
            style={{
              background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
              border: "1px solid #bfdbfe",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 18,
              fontSize: 12,
              color: "#1e40af",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{t.apiNote}</span>
          </div>

          {/* Branch selector */}
          <div
            className="no-print"
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            {branches.map((b, i) => (
              <button
                key={b.placeId}
                className="btn"
                onClick={() => setSelectedIdx(i)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: 600,
                  background: selectedIdx === i ? "#0e76bc" : "white",
                  color: selectedIdx === i ? "white" : "#475569",
                  border:
                    selectedIdx === i ? "none" : "1px solid #e2e8f0",
                  boxShadow:
                    selectedIdx === i
                      ? "0 2px 8px rgba(14,118,188,.25)"
                      : "none",
                }}
              >
                {b.name
                  .replace("Trolleys - ", "")
                  .replace("Trolleys Supermarket LLC – ", "")}
                <span style={{ marginInlineStart: 6, fontSize: 11, opacity: 0.75 }}>
                  ★ {b.rating.toFixed(1)}
                </span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div
            className="no-print"
            style={{
              background: "white",
              border: "1px solid #f1f5f9",
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 18,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 5,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                {t.period}
              </span>
              {PERIOD_OPTS.map((o) => (
                <button
                  key={o.val}
                  className={`fbtn${period === o.val ? " act" : ""}`}
                  onClick={() => setPeriod(o.val)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div
              style={{
                width: 1,
                height: 22,
                background: "#f1f5f9",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 5,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                {t.filter}
              </span>
              {SENT_OPTS.map((o) => (
                <button
                  key={o.val}
                  className={`fbtn${sentiment === o.val ? " act" : ""}`}
                  onClick={() => setSentiment(o.val)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <span
              style={{
                marginInlineStart: "auto",
                fontSize: 13,
                color: "#94a3b8",
                fontWeight: 600,
              }}
            >
              {t.reviews_count(filteredReviews.length)}
            </span>
          </div>

          {/* Tabs */}
          <div
            className="no-print"
            style={{
              display: "flex",
              gap: 3,
              background: "white",
              padding: 4,
              borderRadius: 12,
              border: "1px solid #f1f5f9",
              width: "fit-content",
              marginBottom: 22,
            }}
          >
            {(
              [
                ["dashboard", t.dashboard],
                ["reviews", t.reviews],
                ["analysis", t.branchAnalysis],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                className="btn"
                onClick={() => setTab(key as Tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  background: tab === key ? "#0e76bc" : "transparent",
                  color: tab === key ? "white" : "#64748b",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* PRINT AREA */}
          <div id="print-area">
            {/* Print Header */}
            <div
              style={{
                display: "none",
                padding: "20px 0",
                borderBottom: "2px solid #0e76bc",
                marginBottom: 24,
              }}
              className="print-header"
            >
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                Trolleys Supermarket LLC
              </h1>
              <p style={{ fontSize: 14, color: "#64748b" }}>
                {t.title} — {t.generated}: {getToday()}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  marginTop: 8,
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                }}
              >
                {t.confidential}
              </p>
            </div>
            <style>{`
              @media print {
                .print-header { display: block !important; }
              }
            `}</style>

            {/* ── DASHBOARD ── */}
            {tab === "dashboard" && (
              <>
                {/* Overall Stats */}
                <div
                  className="dashboard-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                    gap: 14,
                    marginBottom: 24,
                  }}
                >
                  {[
                    {
                      label: t.totalBranches,
                      value: branches.length,
                      color: "#0e76bc",
                      bg: "#eff6ff",
                      icon: "🏪",
                    },
                    {
                      label: t.avgRatingAll,
                      value:
                        overallStats.avgRating > 0
                          ? overallStats.avgRating.toFixed(1) + " ★"
                          : "—",
                      color: "#f59e0b",
                      bg: "#fefce8",
                      icon: "⭐",
                    },
                    {
                      label: t.totalReviewsAll,
                      value: overallStats.totalRatings.toLocaleString(),
                      color: "#16a34a",
                      bg: "#f0fdf4",
                      icon: "📝",
                    },
                    {
                      label: t.periodReviews,
                      value: overallStats.totalPeriodReviews,
                      color: "#7c3aed",
                      bg: "#f5f3ff",
                      icon: "📊",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="stat-card"
                      style={{
                        background: s.bg,
                        border: "none",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>
                        {s.icon}
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: s.color,
                          marginBottom: 4,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Best & Worst */}
                {overallStats.best && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      className="stat-card"
                      style={{
                        borderLeft: "4px solid #16a34a",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#16a34a",
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                          marginBottom: 6,
                        }}
                      >
                        🏆 {t.bestPerforming}
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {overallStats.best?.name}
                      </p>
                      <Stars value={overallStats.best?.rating || 0} size={14} />
                      <p
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          marginTop: 4,
                        }}
                      >
                        {overallStats.best?.totalRatings?.toLocaleString()}{" "}
                        {t.totalReviews}
                      </p>
                    </div>
                    <div
                      className="stat-card"
                      style={{
                        borderLeft: "4px solid #f59e0b",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#f59e0b",
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                          marginBottom: 6,
                        }}
                      >
                        ⚠️ {t.worstPerforming}
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {overallStats.worst?.name}
                      </p>
                      <Stars
                        value={overallStats.worst?.rating || 0}
                        size={14}
                      />
                      <p
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          marginTop: 4,
                        }}
                      >
                        {overallStats.worst?.totalRatings?.toLocaleString()}{" "}
                        {t.totalReviews}
                      </p>
                    </div>
                  </div>
                )}

                {/* Branch Quick View */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill,minmax(280px,1fr))",
                    gap: 14,
                    marginBottom: 24,
                  }}
                >
                  {branchStats.map((b) => (
                    <div
                      key={b.placeId}
                      className="stat-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedIdx(
                          branches.findIndex((x) => x.placeId === b.placeId)
                        );
                        setTab("reviews");
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {b.name.replace("Trolleys - ", "")}
                          </p>
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>
                            {b.city}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#f59e0b",
                          }}
                        >
                          {b.rating.toFixed(1)}
                        </span>
                      </div>
                      <Stars value={b.rating} size={12} />
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 10,
                          fontSize: 11,
                        }}
                      >
                        <span style={{ color: "#16a34a" }}>
                          {b.pos} {t.sentPositive}
                        </span>
                        <span style={{ color: "#94a3b8" }}>·</span>
                        <span style={{ color: "#de2b2e" }}>
                          {b.neg} {t.sentNegative}
                        </span>
                        <span style={{ color: "#94a3b8" }}>·</span>
                        <span style={{ color: "#64748b" }}>
                          {b.totalRatings} {t.totalLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Reviews */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 18,
                    border: "1px solid #f1f5f9",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {t.recentReviews}
                    </h3>
                    <button
                      className="btn no-print"
                      onClick={() => setTab("reviews")}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#0e76bc",
                        background: "#eff6ff",
                        padding: "5px 12px",
                        borderRadius: 20,
                      }}
                    >
                      {t.viewAll}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {allRecent.map((r, i) => (
                      <div
                        key={r.reviewId + i}
                        style={{
                          display: "flex",
                          gap: 12,
                          paddingBottom: 12,
                          borderBottom:
                            i < allRecent.length - 1
                              ? "1px solid #f8f9fb"
                              : "none",
                        }}
                      >
                        {r.photo ? (
                          <img
                            src={r.photo}
                            alt=""
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#0e76bc",
                              flexShrink: 0,
                            }}
                          >
                            {r.author[0]?.toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 3,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              {r.author}
                            </span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                              · {r.branchName.replace("Trolleys - ", "").replace("Trolleys Supermarket LLC – ", "")}
                            </span>
                            <Stars value={r.rating} size={11} />
                          </div>
                          {r.text && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                lineHeight: 1.5,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {r.text}
                            </p>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            flexShrink: 0,
                          }}
                        >
                          {fmtDate(r.timeMs, lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── REVIEWS ── */}
            {tab === "reviews" && branch && (
              <div
                className="rv-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "260px 1fr",
                  gap: 16,
                }}
              >
                {/* Sidebar */}
                <div>
                  <div
                    style={{
                      background: "white",
                      borderRadius: 18,
                      border: "1px solid #f1f5f9",
                      padding: "20px 16px",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 800,
                        color: "#f59e0b",
                        lineHeight: 1,
                        marginBottom: 6,
                      }}
                    >
                      {branch.rating.toFixed(1)}
                    </div>
                    <Stars value={branch.rating} size={16} />
                    <p
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        margin: "8px 0 16px",
                      }}
                    >
                      {branch.totalRatings.toLocaleString()} {t.totalReviews}
                    </p>
                    {[5, 4, 3, 2, 1].map((n) => {
                      const count = filteredReviews.filter(
                        (r) => r.rating === n
                      ).length;
                      const pct = filteredReviews.length
                        ? (count / filteredReviews.length) * 100
                        : 0;
                      return (
                        <div
                          key={n}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                              width: 18,
                              flexShrink: 0,
                              textAlign: "right",
                            }}
                          >
                            {n}★
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              background: "#f1f5f9",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background:
                                  n >= 4
                                    ? "#16a34a"
                                    : n === 3
                                    ? "#f59e0b"
                                    : "#de2b2e",
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              width: 18,
                              textAlign: "right",
                            }}
                          >
                            {count}
                          </span>
                        </div>
                      );
                    })}
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          background: "#f0fdf4",
                          color: "#16a34a",
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontWeight: 700,
                        }}
                      >
                        ✓{" "}
                        {
                          filteredReviews.filter((r) => r.rating >= 4).length
                        }
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          background: "#fff1f2",
                          color: "#de2b2e",
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontWeight: 700,
                        }}
                      >
                        ✗{" "}
                        {
                          filteredReviews.filter((r) => r.rating <= 2).length
                        }
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          background: "#fefce8",
                          color: "#ca8a04",
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontWeight: 700,
                        }}
                      >
                        ~{" "}
                        {
                          filteredReviews.filter((r) => r.rating === 3).length
                        }
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      background: "white",
                      borderRadius: 18,
                      border: "1px solid #f1f5f9",
                      padding: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        display: "inline-block",
                        marginBottom: 10,
                        background: branch.isOpen ? "#f0fdf4" : "#f8f9fb",
                        color: branch.isOpen ? "#16a34a" : "#94a3b8",
                      }}
                    >
                      {branch.isOpen === null
                        ? "—"
                        : branch.isOpen
                        ? t.openLabel
                        : t.closedLabel}
                    </span>
                    {branch.url && (
                      <a
                        href={branch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          fontSize: 12,
                          color: "#0e76bc",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        {t.viewOnMaps}
                      </a>
                    )}
                  </div>
                </div>

                {/* Review cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredReviews.length === 0 && (
                    <div
                      style={{
                        padding: "60px",
                        textAlign: "center",
                        background: "white",
                        borderRadius: 18,
                        border: "1px solid #f1f5f9",
                        color: "#94a3b8",
                        fontSize: 14,
                      }}
                    >
                      {t.noReviews}
                    </div>
                  )}
                  {filteredReviews.map((r) => (
                    <div
                      key={r.reviewId}
                      className="rv-card"
                      style={{
                        padding: "18px 16px",
                        borderInlineStart: `4px solid ${
                          r.rating >= 4
                            ? "#16a34a"
                            : r.rating <= 2
                            ? "#de2b2e"
                            : "#f59e0b"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                          }}
                        >
                          {r.photo ? (
                            <img
                              src={r.photo}
                              alt=""
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#0e76bc",
                                flexShrink: 0,
                              }}
                            >
                              {r.author[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#0f172a",
                                marginBottom: 3,
                              }}
                            >
                              {r.author}
                            </p>
                            <Stars value={r.rating} />
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {fmtDate(r.timeMs, lang)}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background:
                                r.rating >= 4
                                  ? "#f0fdf4"
                                  : r.rating <= 2
                                  ? "#fff1f2"
                                  : "#fefce8",
                              color:
                                r.rating >= 4
                                  ? "#16a34a"
                                  : r.rating <= 2
                                  ? "#de2b2e"
                                  : "#ca8a04",
                            }}
                          >
                            {r.rating >= 4
                              ? t.sentPositive
                              : r.rating <= 2
                              ? t.sentNegative
                              : t.sentNeutral}
                          </span>
                        </div>
                      </div>
                      {r.text && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#475569",
                            lineHeight: 1.75,
                            paddingInlineStart: 46,
                          }}
                        >
                          {r.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── BRANCH ANALYSIS ── */}
            {tab === "analysis" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                    gap: 14,
                    marginBottom: 24,
                  }}
                >
                  {branchStats.map((b) => (
                    <div
                      key={b.placeId}
                      style={{
                        background: "white",
                        borderRadius: 18,
                        border: "1px solid #f1f5f9",
                        padding: "20px 18px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: 4,
                        }}
                      >
                        {b.name.replace("Trolleys - ", "")}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          marginBottom: 10,
                        }}
                      >
                        {b.city}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: "#f59e0b",
                          }}
                        >
                          {b.periodAvg > 0
                            ? b.periodAvg.toFixed(1)
                            : "—"}
                        </span>
                        {b.periodAvg > 0 && (
                          <Stars value={b.periodAvg} size={13} />
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          marginBottom: 10,
                        }}
                      >
                        {b.periodReviews} {t.periodReviews} ·{" "}
                        {b.totalRatings} {t.totalLabel}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          height: 7,
                          borderRadius: 99,
                          overflow: "hidden",
                          background: "#f1f5f9",
                          marginBottom: 10,
                        }}
                      >
                        {b.periodReviews > 0 && (
                          <>
                            <div
                              style={{
                                width: `${(b.pos / b.periodReviews) * 100}%`,
                                background: "#16a34a",
                              }}
                            />
                            <div
                              style={{
                                width: `${(b.neu / b.periodReviews) * 100}%`,
                                background: "#f59e0b",
                              }}
                            />
                            <div
                              style={{
                                width: `${(b.neg / b.periodReviews) * 100}%`,
                                background: "#de2b2e",
                              }}
                            />
                          </>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            background: "#f0fdf4",
                            color: "#16a34a",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700,
                          }}
                        >
                          {b.pos} {t.sentPositive}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            background: "#fff1f2",
                            color: "#de2b2e",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700,
                          }}
                        >
                          {b.neg} {t.sentNegative}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            background: "#fefce8",
                            color: "#ca8a04",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700,
                          }}
                        >
                          {b.neu} {t.sentNeutral}
                        </span>
                      </div>
                      <button
                        className="btn"
                        onClick={() => {
                          setSelectedIdx(
                            branches.findIndex(
                              (x) => x.placeId === b.placeId
                            )
                          );
                          setTab("reviews");
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 0",
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          background: "#f8f9fb",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#0e76bc",
                        }}
                      >
                        {t.viewReviews}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Comparison table */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 18,
                    border: "1px solid #f1f5f9",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {t.branchComparison}
                    </h3>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr style={{ background: "#f8f9fb" }}>
                          {[
                            "Branch",
                            t.totalReviews,
                            t.periodReviews,
                            t.avgScore,
                            t.sentPositive,
                            t.sentNegative,
                            t.sentNeutral,
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px 16px",
                                textAlign:
                                  lang === "ar" ? "right" : "left",
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#64748b",
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {branchStats.map((b, i) => (
                          <tr
                            key={b.placeId}
                            style={{
                              borderTop: "1px solid #f1f5f9",
                              background:
                                i % 2 === 0 ? "white" : "#fafbfc",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 16px",
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {b.name.replace("Trolleys - ", "")}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#475569",
                              }}
                            >
                              {b.totalRatings}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#475569",
                              }}
                            >
                              {b.periodReviews}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              {b.periodAvg > 0 ? (
                                <Stars value={b.periodAvg} size={12} />
                              ) : (
                                "—"
                              )}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#16a34a",
                                fontWeight: 700,
                              }}
                            >
                              {b.pos}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#de2b2e",
                                fontWeight: 700,
                              }}
                            >
                              {b.neg}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#ca8a04",
                                fontWeight: 700,
                              }}
                            >
                              {b.neu}
                            </td>
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
      </div>

      {/* REPORT MODAL */}
      {showReport && (
        <div
          className="modal-bg no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReport(false);
          }}
        >
          <div
            dir={t.dir}
            style={{
              background: "white",
              borderRadius: 24,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 24px 64px rgba(0,0,0,.18)",
              fontFamily: "system-ui,sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 22,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  {t.reportTitle}
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>
                  {t.reportSub}
                </p>
              </div>
              <button
                className="btn"
                onClick={() => setShowReport(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "1px solid #e2e8f0",
                  background: "#f8f9fb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 10,
                }}
              >
                {t.period}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                }}
              >
                {(
                  ["daily", "weekly", "monthly", "all"] as ReportPeriod[]
                ).map((p) => (
                  <button
                    key={p}
                    className="btn"
                    onClick={() => setReportPeriod(p)}
                    style={{
                      padding: "9px 0",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      background:
                        reportPeriod === p ? "#0e76bc" : "#f8f9fb",
                      color: reportPeriod === p ? "white" : "#475569",
                      border:
                        reportPeriod === p
                          ? "none"
                          : "1px solid #e2e8f0",
                    }}
                  >
                    {p === "daily"
                      ? "Daily"
                      : p === "weekly"
                      ? "Weekly"
                      : p === "monthly"
                      ? "Monthly"
                      : t.allTime}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                  }}
                >
                  {t.selectBranches}
                </p>
                <button
                  className="btn"
                  onClick={() =>
                    setReportIds(
                      reportIds.length === branches.length
                        ? []
                        : branches.map((b) => b.placeId)
                    )
                  }
                  style={{
                    fontSize: 11,
                    color: "#0e76bc",
                    fontWeight: 700,
                    background: "none",
                  }}
                >
                  {reportIds.length === branches.length
                    ? t.deselectAll
                    : t.selectAll}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                }}
              >
                {branches.map((b) => (
                  <label
                    key={b.placeId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 10,
                      background: reportIds.includes(b.placeId)
                        ? "#eff6ff"
                        : "#f8f9fb",
                      border: `1px solid ${
                        reportIds.includes(b.placeId)
                          ? "#bfdbfe"
                          : "#e2e8f0"
                      }`,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={reportIds.includes(b.placeId)}
                      onChange={() =>
                        setReportIds((prev) =>
                          prev.includes(b.placeId)
                            ? prev.filter((x) => x !== b.placeId)
                            : [...prev, b.placeId]
                        )
                      }
                      style={{
                        width: 15,
                        height: 15,
                        accentColor: "#0e76bc",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0f172a",
                        flex: 1,
                      }}
                    >
                      {b.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#f59e0b",
                      }}
                    >
                      ★ {b.rating.toFixed(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 10,
                }}
              >
                {t.format}
              </p>
              <div style={{ display: "flex", gap: 7 }}>
                {(["csv", "json"] as const).map((f) => (
                  <button
                    key={f}
                    className="btn"
                    onClick={() => {
                      setReportFormat(f);
                      exportReport(f);
                    }}
                    disabled={downloading || reportIds.length === 0}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      background:
                        downloading && reportFormat === f
                          ? "#0e76bc"
                          : "#f8f9fb",
                      color:
                        downloading && reportFormat === f
                          ? "white"
                          : "#475569",
                      border:
                        downloading && reportFormat === f
                          ? "none"
                          : "1px solid #e2e8f0",
                    }}
                  >
                    {downloading && reportFormat === f ? (
                      <>
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(255,255,255,.3)",
                            borderTopColor: "white",
                            borderRadius: "50%",
                            animation: "spin .8s linear infinite",
                            display: "inline-block",
                            marginRight: 6,
                          }}
                        />
                        {t.preparing}
                      </>
                    ) : (
                      <>
                        {f.toUpperCase()}{" "}
                        <span style={{ fontSize: 10, opacity: 0.7 }}>
                          {f === "csv" ? "(Excel)" : "(JSON)"}
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}