"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/app/admin/layout";

type QType = "text"|"textarea"|"radio"|"checkbox"|"select"|"rating"|"nps"|"date";
type Option   = { id: string; label_en: string; label_ar: string };
type Question = { id: string; text_en: string; type: QType; is_required: boolean; options: Option[] };
type Answer   = { question_id: string; value?: string; selected_option_ids?: string[] };
type Response = {
  id: string; submitted_at: string; locale: string;
  respondent_name?: string; respondent_phone?: string; respondent_branch?: string;
  answers: Answer[];
};
type Survey = {
  id: string; title_en: string; title_ar: string;
  is_active: boolean; response_count: number;
  questions: Question[]; responses: Response[];
};

/* ── Helpers ── */
function getAnswersForQ(responses: Response[], qid: string) {
  return responses.flatMap(r => r.answers.filter(a => a.question_id === qid));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/* ── Mini bar chart ── */
function BarChart({ data }: { data: { label: string; count: number; pct: number }[] }) {
  const max = Math.max(...data.map(d => d.pct), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#374151", minWidth: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
          <div style={{ flex: 1, height: 24, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 6,
              background: "linear-gradient(90deg, #1C75BC, #38bdf8)",
              width: `${(d.pct / max) * 100}%`,
              transition: "width 0.6s ease",
              minWidth: d.count > 0 ? 4 : 0,
            }} />
          </div>
          <span style={{ fontSize: 12, color: "#64748b", minWidth: 40, textAlign: "right" }}>{d.count} ({d.pct}%)</span>
        </div>
      ))}
    </div>
  );
}

/* ── Rating stars ── */
function RatingChart({ answers }: { answers: Answer[] }) {
  const vals = answers.map(a => Number(a.value)).filter(v => v >= 1 && v <= 5);
  const dist = [1,2,3,4,5].map(n => ({ star: n, count: vals.filter(v => v === n).length }));
  const total = vals.length;
  const mean  = avg(vals);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#f59e0b", fontFamily: "Georgia, serif" }}>{mean.toFixed(1)}</span>
        <div>
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 20, color: i <= Math.round(mean) ? "#f59e0b" : "#e2e8f0" }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{total} responses</span>
        </div>
      </div>
      <BarChart data={dist.map(d => ({ label: `${d.star} ★`, count: d.count, pct: total ? Math.round(d.count / total * 100) : 0 }))} />
    </div>
  );
}

/* ── NPS gauge ── */
function NPSChart({ answers }: { answers: Answer[] }) {
  const vals     = answers.map(a => Number(a.value)).filter(v => !isNaN(v));
  const total    = vals.length;
  const detract  = vals.filter(v => v <= 6).length;
  const passive  = vals.filter(v => v === 7 || v === 8).length;
  const promote  = vals.filter(v => v >= 9).length;
  const nps      = total ? Math.round((promote - detract) / total * 100) : 0;
  const dist     = Array.from({ length: 11 }, (_, n) => ({ label: String(n), count: vals.filter(v => v === n).length }));
  const maxCount = Math.max(...dist.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "NPS Score", value: nps, color: nps >= 50 ? "#22c55e" : nps >= 0 ? "#f59e0b" : "#ef4444", big: true },
          { label: "Promoters (9-10)", value: promote, color: "#22c55e" },
          { label: "Passives (7-8)",   value: passive,  color: "#f59e0b" },
          { label: "Detractors (0-6)", value: detract,  color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 18px", border: "1px solid #e2e8f0", textAlign: "center", minWidth: 80 }}>
            <p style={{ fontSize: s.big ? 28 : 20, fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
        {dist.map((d, i) => {
          const color = i <= 6 ? "#ef4444" : i <= 8 ? "#f59e0b" : "#22c55e";
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "100%", background: color, borderRadius: "3px 3px 0 0", height: `${(d.count / maxCount) * 48}px`, minHeight: d.count > 0 ? 3 : 0, transition: "height 0.5s" }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Text responses ── */
function TextResponses({ answers }: { answers: Answer[] }) {
  const texts = answers.map(a => a.value).filter(Boolean) as string[];
  if (!texts.length) return <p style={{ fontSize: 13, color: "#94a3b8" }}>No text responses yet.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
      {texts.map((t, i) => (
        <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#374151", border: "1px solid #e2e8f0" }}>
          {t}
        </div>
      ))}
    </div>
  );
}

/* ── CSV Export ── */
function exportCSV(survey: Survey) {
  const headers = [
    "Response ID", "Date", "Language", "Name", "Phone", "Branch",
    ...survey.questions.map(q => q.text_en),
  ];

  const rows = survey.responses.map(r => {
    const base = [r.id, new Date(r.submitted_at).toLocaleString(), r.locale, r.respondent_name || "", r.respondent_phone || "", r.respondent_branch || ""];
    const answers = survey.questions.map(q => {
      const a = r.answers.find(a => a.question_id === q.id);
      if (!a) return "";
      if (a.value) return a.value;
      if (a.selected_option_ids?.length) {
        return a.selected_option_ids.map(id => q.options.find(o => o.id === id)?.label_en || id).join(", ");
      }
      return "";
    });
    return [...base, ...answers];
  });

  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `${survey.title_en.replace(/\s+/g, "-")}-results.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Main page ── */
export default function SurveyResultsPage() {
  const [surveys,  setSurveys]  = useState<Survey[]>([]);
  const [selected, setSelected] = useState<Survey | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [loadingR, setLoadingR] = useState(false);
  const [tab,      setTab]      = useState<"charts"|"responses">("charts");

  useEffect(() => {
    fetch("/api/admin/surveys", { headers: getAdminHeaders() })
      .then(r => r.json())
      .then(d => { setSurveys(d.surveys || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadSurvey = async (id: string) => {
    setLoadingR(true);
    const res = await fetch(`/api/admin/surveys?id=${id}&results=1`, { headers: getAdminHeaders() });
    const d   = await res.json();
    setSelected(d.survey);
    setTab("charts");
    setLoadingR(false);
  };

  const renderQuestionChart = (q: Question) => {
    if (!selected) return null;
    const answers = getAnswersForQ(selected.responses, q.id);
    const total   = answers.length;

    if (q.type === "rating") return <RatingChart answers={answers} />;
    if (q.type === "nps")    return <NPSChart    answers={answers} />;
    if (q.type === "text" || q.type === "textarea" || q.type === "date")
      return <TextResponses answers={answers} />;

    // radio / checkbox / select
    if (q.options?.length) {
      const data = q.options.map(opt => {
        const count = answers.filter(a => a.selected_option_ids?.includes(opt.id)).length;
        return { label: opt.label_en, count, pct: total ? Math.round(count / total * 100) : 0 };
      });
      return <BarChart data={data} />;
    }
    return <TextResponses answers={answers} />;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ color: "#1C75BC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Survey Results</p>
      </div>

      <div style={{ maxWidth: 1100, margin: "32px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>

        {/* Survey list */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>Surveys</p>
          </div>
          {loading ? (
            <p style={{ padding: 20, fontSize: 13, color: "#94a3b8" }}>Loading...</p>
          ) : surveys.length === 0 ? (
            <p style={{ padding: 20, fontSize: 13, color: "#94a3b8" }}>No surveys yet.</p>
          ) : (
            <div>
              {surveys.map(s => (
                <button key={s.id} onClick={() => loadSurvey(s.id)} style={{
                  width: "100%", textAlign: "left", padding: "14px 20px",
                  background: selected?.id === s.id ? "#eff6ff" : "transparent",
                  border: "none", borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer", transition: "background 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: selected?.id === s.id ? "#1C75BC" : "#111" }}>{s.title_en}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.is_active ? "#dcfce7" : "#f1f5f9", color: s.is_active ? "#166534" : "#64748b" }}>
                      {s.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{s.response_count} responses</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results panel */}
        <div>
          {!selected && !loadingR && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: "60px 40px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <p style={{ fontSize: 14, color: "#94a3b8" }}>Select a survey to view results</p>
            </div>
          )}

          {loadingR && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: "60px 40px", textAlign: "center" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Loading results...</p>
            </div>
          )}

          {selected && !loadingR && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>{selected.title_en}</h2>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{selected.title_ar}</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={() => exportCSV(selected)} style={{
                      padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0",
                      background: "#f8fafc", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                      </svg>
                      Export CSV
                    </button>
                    <Link href="/admin/surveys" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
                      Manage Survey
                    </Link>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Total Responses", value: selected.responses.length, color: "#1C75BC" },
                    { label: "Questions",        value: selected.questions.length,  color: "#7c3aed" },
                    { label: "Languages",        value: [...new Set(selected.responses.map(r => r.locale))].join(", ") || "—", color: "#0891b2" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 18px", border: "1px solid #e2e8f0", flex: "1 1 120px" }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 0, marginTop: 20, borderBottom: "2px solid #f1f5f9" }}>
                  {(["charts", "responses"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: "8px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: "none", color: tab === t ? "#1C75BC" : "#94a3b8",
                      borderBottom: `2px solid ${tab === t ? "#1C75BC" : "transparent"}`,
                      marginBottom: -2, textTransform: "capitalize",
                    }}>
                      {t === "charts" ? "📊 Charts" : "👥 Responses"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Charts tab */}
              {tab === "charts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {selected.questions.map((q, i) => {
                    const answers = getAnswersForQ(selected.responses, q.id);
                    return (
                      <div key={q.id} style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 3 }}>Q{i + 1} · {q.type.toUpperCase()}</span>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>{q.text_en}</p>
                          </div>
                          <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>{answers.length} answers</span>
                        </div>
                        {answers.length > 0 ? renderQuestionChart(q) : (
                          <p style={{ fontSize: 13, color: "#94a3b8" }}>No answers yet.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Responses tab */}
              {tab === "responses" && (
                <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  {selected.responses.length === 0 ? (
                    <p style={{ padding: 24, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No responses yet.</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                            <th style={th}>#</th>
                            <th style={th}>Date</th>
                            <th style={th}>Lang</th>
                            <th style={th}>Name</th>
                            <th style={th}>Branch</th>
                            {selected.questions.map(q => (
                              <th key={q.id} style={{ ...th, maxWidth: 120 }}>{q.text_en.slice(0, 30)}{q.text_en.length > 30 ? "…" : ""}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selected.responses.map((r, i) => (
                            <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                              <td style={td}>{i + 1}</td>
                              <td style={td}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                              <td style={td}><span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{r.locale}</span></td>
                              <td style={td}>{r.respondent_name || "—"}</td>
                              <td style={td}>{r.respondent_branch || "—"}</td>
                              {selected.questions.map(q => {
                                const a = r.answers.find(a => a.question_id === q.id);
                                let val = "—";
                                if (a?.value) val = a.value.slice(0, 50) + (a.value.length > 50 ? "…" : "");
                                else if (a?.selected_option_ids?.length) {
                                  val = a.selected_option_ids.map(id => q.options.find(o => o.id === id)?.label_en || id).join(", ");
                                }
                                return <td key={q.id} style={{ ...td, maxWidth: 120 }}>{val}</td>;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "10px 14px", color: "#374151", verticalAlign: "top" };