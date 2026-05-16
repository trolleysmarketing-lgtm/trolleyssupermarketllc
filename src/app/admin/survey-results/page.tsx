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

function getAnswersForQ(responses: Response[], qid: string) {
  return responses.flatMap(r => r.answers.filter(a => a.question_id === qid));
}
function avg(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; count: number; pct: number }[] }) {
  const max = Math.max(...data.map(d => d.pct), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#6b7280", width: 130, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
          <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "#1C75BC", width: `${(d.pct / max) * 100}%`, transition: "width .6s ease", minWidth: d.count > 0 ? 3 : 0 }} />
          </div>
          <span style={{ fontSize: 12, color: "#9ca3af", width: 70, textAlign: "right", flexShrink: 0 }}>{d.count} · {d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Rating ─────────────────────────────────────────────────────────────────────
function RatingChart({ answers }: { answers: Answer[] }) {
  const vals = answers.map(a => Number(a.value)).filter(v => v >= 1 && v <= 5);
  const dist = [1,2,3,4,5].map(n => ({ label: `${n} ★`, count: vals.filter(v => v === n).length, pct: vals.length ? Math.round(vals.filter(v => v === n).length / vals.length * 100) : 0 }));
  const mean = avg(vals);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>{mean.toFixed(1)}</div>
          <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 16, color: i <= Math.round(mean) ? "#f59e0b" : "#e5e7eb" }}>★</span>)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <BarChart data={dist} />
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{vals.length} responses</p>
    </div>
  );
}

// ── NPS ────────────────────────────────────────────────────────────────────────
function NPSChart({ answers }: { answers: Answer[] }) {
  const vals    = answers.map(a => Number(a.value)).filter(v => !isNaN(v));
  const total   = vals.length;
  const detract = vals.filter(v => v <= 6).length;
  const passive = vals.filter(v => v === 7 || v === 8).length;
  const promote = vals.filter(v => v >= 9).length;
  const nps     = total ? Math.round((promote - detract) / total * 100) : 0;
  const dist    = Array.from({ length: 11 }, (_, n) => ({ n, count: vals.filter(v => v === n).length }));
  const maxC    = Math.max(...dist.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "NPS Score",        value: nps,     color: nps >= 50 ? "#059669" : nps >= 0 ? "#d97706" : "#dc2626", big: true },
          { label: "Promoters (9-10)", value: promote, color: "#059669" },
          { label: "Passives (7-8)",   value: passive,  color: "#d97706" },
          { label: "Detractors (0-6)", value: detract,  color: "#dc2626" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: "14px", border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: s.big ? 28 : 22, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 56 }}>
        {dist.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: i <= 6 ? "#fca5a5" : i <= 8 ? "#fcd34d" : "#6ee7b7", height: `${(d.count / maxC) * 44}px`, minHeight: d.count > 0 ? 3 : 0, transition: "height .5s" }} />
            <span style={{ fontSize: 9, color: "#9ca3af" }}>{d.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Text responses ─────────────────────────────────────────────────────────────
function TextResponses({ answers }: { answers: Answer[] }) {
  const texts = answers.map(a => a.value).filter(Boolean) as string[];
  if (!texts.length) return <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>No text responses yet.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
      {texts.map((t, i) => (
        <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#374151", border: "1px solid #e5e7eb" }}>
          {t}
        </div>
      ))}
    </div>
  );
}

// ── CSV Export ─────────────────────────────────────────────────────────────────
function exportCSV(survey: Survey) {
  const headers = ["Response ID","Date","Language","Name","Phone","Branch",...survey.questions.map(q => q.text_en)];
  const rows = survey.responses.map(r => {
    const base = [r.id, new Date(r.submitted_at).toLocaleString(), r.locale, r.respondent_name||"", r.respondent_phone||"", r.respondent_branch||""];
    const ans  = survey.questions.map(q => {
      const a = r.answers.find(a => a.question_id === q.id);
      if (!a) return "";
      if (a.value) return a.value;
      if (a.selected_option_ids?.length) return a.selected_option_ids.map(id => q.options.find(o => o.id === id)?.label_en || id).join(", ");
      return "";
    });
    return [...base, ...ans];
  });
  const csv  = [headers,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${survey.title_en.replace(/\s+/g,"-")}-results.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Q type badge ───────────────────────────────────────────────────────────────
const Q_COLORS: Record<string, string> = {
  rating:"#f59e0b", nps:"#8b5cf6", text:"#6b7280", textarea:"#6b7280",
  radio:"#1C75BC", checkbox:"#1C75BC", select:"#1C75BC", date:"#059669",
};

// ── Main ───────────────────────────────────────────────────────────────────────
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

  const renderChart = (q: Question) => {
    if (!selected) return null;
    const answers = getAnswersForQ(selected.responses, q.id);
    if (q.type === "rating") return <RatingChart answers={answers} />;
    if (q.type === "nps")    return <NPSChart    answers={answers} />;
    if (q.type === "text" || q.type === "textarea" || q.type === "date") return <TextResponses answers={answers} />;
    if (q.options?.length) {
      const total = answers.length;
      return <BarChart data={q.options.map(o => {
        const count = answers.filter(a => a.selected_option_ids?.includes(o.id)).length;
        return { label: o.label_en, count, pct: total ? Math.round(count / total * 100) : 0 };
      })} />;
    }
    return <TextResponses answers={answers} />;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>

      {/* ── Survey list ── */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", position: "sticky", top: 20 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em" }}>Surveys</p>
        </div>
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ width: 24, height: 24, border: "2.5px solid #e5e7eb", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "sp .7s linear infinite", margin: "0 auto 8px" }}/>
            <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Loading…</p>
          </div>
        ) : surveys.length === 0 ? (
          <p style={{ padding: "20px 16px", fontSize: 13, color: "#9ca3af", margin: 0 }}>No surveys yet.</p>
        ) : surveys.map(s => (
          <button key={s.id} onClick={() => loadSurvey(s.id)} style={{
            width: "100%", textAlign: "left", padding: "12px 16px",
            background: selected?.id === s.id ? "#eff6ff" : "transparent",
            border: "none", borderBottom: "1px solid #f9fafb",
            borderLeft: `3px solid ${selected?.id === s.id ? "#1C75BC" : "transparent"}`,
            cursor: "pointer", transition: "all .12s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: selected?.id === s.id ? 700 : 500, color: selected?.id === s.id ? "#1C75BC" : "#111827" }}>{s.title_en}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: s.is_active ? "#dcfce7" : "#f3f4f6", color: s.is_active ? "#15803d" : "#6b7280" }}>
                {s.is_active ? "Active" : "Off"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.response_count} responses</span>
          </button>
        ))}
      </div>

      {/* ── Results ── */}
      <div>
        {!selected && !loadingR && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "60px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>Select a survey to view results</p>
          </div>
        )}

        {loadingR && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "60px 40px", textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "sp .7s linear infinite", margin: "0 auto 12px" }}/>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Loading results…</p>
          </div>
        )}

        {selected && !loadingR && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Header card */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 3px" }}>{selected.title_en}</h2>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{selected.title_ar}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => exportCSV(selected)} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                    borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    Export CSV
                  </button>
                  <Link href="/admin/surveys" style={{ display: "flex", alignItems: "center", padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
                    Manage
                  </Link>
                </div>
              </div>

              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Total Responses", value: selected.responses.length, color: "#1C75BC" },
                  { label: "Questions",        value: selected.questions.length,  color: "#7c3aed" },
                  { label: "Languages",        value: [...new Set(selected.responses.map(r => r.locale))].join(", ") || "—", color: "#059669" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                {(["charts","responses"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: "8px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: "none", color: tab === t ? "#1C75BC" : "#9ca3af",
                    borderBottom: `2px solid ${tab === t ? "#1C75BC" : "transparent"}`,
                    marginBottom: -1, transition: "all .12s",
                  }}>
                    {t === "charts" ? "📊 Charts" : "👥 Responses"}
                  </button>
                ))}
              </div>
            </div>

            {/* Charts tab */}
            {tab === "charts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selected.questions.map((q, i) => {
                  const answers = getAnswersForQ(selected.responses, q.id);
                  const qColor  = Q_COLORS[q.type] ?? "#6b7280";
                  return (
                    <div key={q.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px 22px", borderLeft: `3px solid ${qColor}` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "white", background: qColor, padding: "2px 7px", borderRadius: 99 }}>Q{i+1}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: qColor, textTransform: "uppercase", letterSpacing: ".06em" }}>{q.type}</span>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{q.text_en}</p>
                        </div>
                        <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{answers.length} answers</span>
                      </div>
                      {answers.length > 0 ? renderChart(q) : <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>No answers yet.</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Responses tab */}
            {tab === "responses" && (
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                {selected.responses.length === 0 ? (
                  <p style={{ padding: 24, fontSize: 13, color: "#9ca3af", textAlign: "center", margin: 0 }}>No responses yet.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["#","Date","Lang","Name","Branch",...selected.questions.map(q => q.text_en.slice(0,24)+(q.text_en.length>24?"…":""))].map((h,i) => (
                            <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:".06em", whiteSpace:"nowrap", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.responses.map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6", background: i%2===0?"white":"#fafbfc" }}>
                            <td style={td}>{i+1}</td>
                            <td style={td}>{new Date(r.submitted_at).toLocaleDateString("en-AE",{day:"2-digit",month:"short",year:"numeric"})}</td>
                            <td style={td}><span style={{ background:"#f3f4f6", padding:"2px 6px", borderRadius:5, fontWeight:600, fontSize:10 }}>{r.locale}</span></td>
                            <td style={td}>{r.respondent_name||"—"}</td>
                            <td style={td}>{r.respondent_branch||"—"}</td>
                            {selected.questions.map(q => {
                              const a = r.answers.find(a => a.question_id === q.id);
                              let val = "—";
                              if (a?.value) val = a.value.slice(0,50)+(a.value.length>50?"…":"");
                              else if (a?.selected_option_ids?.length) val = a.selected_option_ids.map(id => q.options.find(o => o.id===id)?.label_en||id).join(", ");
                              return <td key={q.id} style={{ ...td, maxWidth:140 }}>{val}</td>;
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
  );
}

const td: React.CSSProperties = { padding: "10px 14px", color: "#374151", verticalAlign: "top", fontSize: 12 };