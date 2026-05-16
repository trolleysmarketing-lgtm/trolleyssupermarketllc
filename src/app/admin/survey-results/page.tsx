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

function BarChart({ data }: { data: { label: string; count: number; pct: number }[] }) {
  const max = Math.max(...data.map(d => d.pct), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#6b7280", width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
          <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "#1C75BC", width: `${(d.pct / max) * 100}%`, transition: "width .6s ease", minWidth: d.count > 0 ? 3 : 0 }} />
          </div>
          <span style={{ fontSize: 11, color: "#9ca3af", width: 64, textAlign: "right", flexShrink: 0 }}>{d.count} · {d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function RatingChart({ answers }: { answers: Answer[] }) {
  const vals = answers.map(a => Number(a.value)).filter(v => v >= 1 && v <= 5);
  const dist = [1,2,3,4,5].map(n => ({ label: `${n} ★`, count: vals.filter(v => v === n).length, pct: vals.length ? Math.round(vals.filter(v => v === n).length / vals.length * 100) : 0 }));
  const mean = avg(vals);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>{mean.toFixed(1)}</div>
          <div style={{ display: "flex", gap: 2, marginTop: 4, justifyContent: "center" }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 14, color: i <= Math.round(mean) ? "#f59e0b" : "#e5e7eb" }}>★</span>)}
          </div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{vals.length} resp.</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}><BarChart data={dist} /></div>
      </div>
    </div>
  );
}

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "NPS", value: nps, color: nps >= 50 ? "#059669" : nps >= 0 ? "#d97706" : "#dc2626", big: true },
          { label: "Promoters", value: promote, color: "#059669" },
          { label: "Passives",  value: passive,  color: "#d97706" },
          { label: "Detractors",value: detract,  color: "#dc2626" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: s.big ? 24 : 18, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 48 }}>
        {dist.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ width: "100%", borderRadius: "2px 2px 0 0", background: i <= 6 ? "#fca5a5" : i <= 8 ? "#fcd34d" : "#6ee7b7", height: `${(d.count / maxC) * 40}px`, minHeight: d.count > 0 ? 3 : 0 }} />
            <span style={{ fontSize: 8, color: "#9ca3af" }}>{d.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextResponses({ answers }: { answers: Answer[] }) {
  const texts = answers.map(a => a.value).filter(Boolean) as string[];
  if (!texts.length) return <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>No text responses yet.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
      {texts.map((t, i) => (
        <div key={i} style={{ background: "#f9fafb", borderRadius: 7, padding: "8px 12px", fontSize: 13, color: "#374151", border: "1px solid #e5e7eb" }}>{t}</div>
      ))}
    </div>
  );
}

function exportCSV(survey: Survey) {
  const headers = ["Response ID","Date","Language","Name","Phone","Branch",...survey.questions.map(q => q.text_en)];
  const rows = survey.responses.map(r => {
    const base = [r.id,new Date(r.submitted_at).toLocaleString(),r.locale,r.respondent_name||"",r.respondent_phone||"",r.respondent_branch||""];
    const ans  = survey.questions.map(q => {
      const a = r.answers.find(a => a.question_id === q.id);
      if (!a) return "";
      if (a.value) return a.value;
      if (a.selected_option_ids?.length) return a.selected_option_ids.map(id => q.options.find(o => o.id === id)?.label_en || id).join(", ");
      return "";
    });
    return [...base,...ans];
  });
  const csv  = [headers,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href=url; a.download=`${survey.title_en.replace(/\s+/g,"-")}-results.csv`; a.click();
  URL.revokeObjectURL(url);
}

const Q_COLORS: Record<string,string> = {
  rating:"#f59e0b",nps:"#8b5cf6",text:"#6b7280",textarea:"#6b7280",
  radio:"#1C75BC",checkbox:"#1C75BC",select:"#1C75BC",date:"#059669",
};

export default function SurveyResultsPage() {
  const [surveys,  setSurveys]  = useState<Survey[]>([]);
  const [selected, setSelected] = useState<Survey | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [loadingR, setLoadingR] = useState(false);
  const [tab,      setTab]      = useState<"charts"|"responses">("charts");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/surveys", { headers: getAdminHeaders() })
      .then(r => r.json())
      .then(d => { setSurveys(d.surveys || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadSurvey = async (id: string) => {
    setLoadingR(true);
    const res = await fetch(`/api/admin/surveys?id=${id}&results=1`,{ headers: getAdminHeaders() });
    const d   = await res.json();
    setSelected(d.survey);
    setTab("charts");
    setExpanded(null);
    setLoadingR(false);
  };

  const renderChart = (q: Question) => {
    if (!selected) return null;
    const answers = getAnswersForQ(selected.responses, q.id);
    if (q.type === "rating") return <RatingChart answers={answers}/>;
    if (q.type === "nps")    return <NPSChart    answers={answers}/>;
    if (q.type === "text"||q.type==="textarea"||q.type==="date") return <TextResponses answers={answers}/>;
    if (q.options?.length) {
      const total = answers.length;
      return <BarChart data={q.options.map(o => {
        const count = answers.filter(a => a.selected_option_ids?.includes(o.id)).length;
        return { label: o.label_en, count, pct: total ? Math.round(count/total*100) : 0 };
      })}/>;
    }
    return <TextResponses answers={answers}/>;
  };

  const getAnswerLabel = (q: Question, a?: Answer) => {
    if (!a) return "—";
    if (a.value) return a.value.length > 80 ? a.value.slice(0,80)+"…" : a.value;
    if (a.selected_option_ids?.length) return a.selected_option_ids.map(id => q.options.find(o => o.id===id)?.label_en||id).join(", ");
    return "—";
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "start", minWidth: 0 }}>

      {/* Survey list */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", position: "sticky", top: 20 }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em" }}>Surveys</p>
        </div>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center" }}>
            <div style={{ width: 22, height: 22, border: "2.5px solid #e5e7eb", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "sp .7s linear infinite", margin: "0 auto 8px" }}/>
            <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Loading…</p>
          </div>
        ) : surveys.length === 0 ? (
          <p style={{ padding: "16px 14px", fontSize: 13, color: "#9ca3af", margin: 0 }}>No surveys yet.</p>
        ) : surveys.map(s => (
          <button key={s.id} onClick={() => loadSurvey(s.id)} style={{
            width: "100%", textAlign: "left", padding: "11px 14px",
            background: selected?.id === s.id ? "#eff6ff" : "transparent",
            border: "none", borderBottom: "1px solid #f9fafb",
            borderLeft: `3px solid ${selected?.id === s.id ? "#1C75BC" : "transparent"}`,
            cursor: "pointer", transition: "all .12s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: selected?.id === s.id ? 700 : 500, color: selected?.id === s.id ? "#1C75BC" : "#111827", lineHeight: 1.3 }}>{s.title_en}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 99, flexShrink: 0, background: s.is_active ? "#dcfce7" : "#f3f4f6", color: s.is_active ? "#15803d" : "#6b7280" }}>
                {s.is_active ? "On" : "Off"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.response_count} responses</span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ minWidth: 0 }}>
        {!selected && !loadingR && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "60px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>Select a survey to view results</p>
          </div>
        )}

        {loadingR && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "60px 40px", textAlign: "center" }}>
            <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "sp .7s linear infinite", margin: "0 auto 12px" }}/>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Loading results…</p>
          </div>
        )}

        {selected && !loadingR && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Header */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>{selected.title_en}</h2>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{selected.title_ar}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => exportCSV(selected)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    CSV
                  </button>
                  <Link href="/admin/surveys" style={{ display: "flex", alignItems: "center", padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
                    Manage
                  </Link>
                </div>
              </div>

              {/* KPIs */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                {[
                  { label: "Responses", value: selected.responses.length, color: "#1C75BC" },
                  { label: "Questions",  value: selected.questions.length,  color: "#7c3aed" },
                  { label: "Languages",  value: [...new Set(selected.responses.map(r => r.locale))].join(", ")||"—", color: "#059669" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 16px", border: "1px solid #e5e7eb", flex: "1 1 80px" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                {(["charts","responses"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: "7px 18px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: "none", color: tab === t ? "#1C75BC" : "#9ca3af",
                    borderBottom: `2px solid ${tab === t ? "#1C75BC" : "transparent"}`,
                    marginBottom: -1, transition: "all .12s",
                  }}>
                    {t === "charts" ? "📊 Charts" : "👥 Responses"}
                  </button>
                ))}
              </div>
            </div>

            {/* Charts */}
            {tab === "charts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selected.questions.map((q, i) => {
                  const answers = getAnswersForQ(selected.responses, q.id);
                  const qColor  = Q_COLORS[q.type] ?? "#6b7280";
                  return (
                    <div key={q.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 20px", borderLeft: `3px solid ${qColor}` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "white", background: qColor, padding: "2px 6px", borderRadius: 99 }}>Q{i+1}</span>
                            <span style={{ fontSize: 9, fontWeight: 600, color: qColor, textTransform: "uppercase", letterSpacing: ".06em" }}>{q.type}</span>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{q.text_en}</p>
                        </div>
                        <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{answers.length} ans.</span>
                      </div>
                      {answers.length > 0 ? renderChart(q) : <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>No answers yet.</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Responses — card based, no table */}
            {tab === "responses" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selected.responses.length === 0 ? (
                  <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "40px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No responses yet.</p>
                  </div>
                ) : selected.responses.map((r, i) => (
                  <div key={r.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    {/* Response header */}
                    <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      style={{ width: "100%", textAlign: "left", padding: "14px 18px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1C75BC", flexShrink: 0 }}>{i+1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.respondent_name || "Anonymous"}</span>
                          {r.respondent_branch && <span style={{ fontSize: 11, color: "#9ca3af" }}>· {r.respondent_branch}</span>}
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: "#f3f4f6", color: "#6b7280" }}>{r.locale.toUpperCase()}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(r.submitted_at).toLocaleDateString("en-AE",{day:"2-digit",month:"short",year:"numeric"})}</span>
                      </div>
                      <span style={{ fontSize: 16, color: "#9ca3af", transition: "transform .2s", transform: expanded === r.id ? "rotate(180deg)" : "none" }}>›</span>
                    </button>

                    {/* Expanded answers */}
                    {expanded === r.id && (
                      <div style={{ borderTop: "1px solid #f3f4f6", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {selected.questions.map(q => {
                          const a = r.answers.find(a => a.question_id === q.id);
                          const val = getAnswerLabel(q, a);
                          const qColor = Q_COLORS[q.type] ?? "#6b7280";
                          return (
                            <div key={q.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }}>
                              <div>
                                <span style={{ fontSize: 9, fontWeight: 600, color: qColor, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 2 }}>{q.type}</span>
                                <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{q.text_en}</p>
                              </div>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, wordBreak: "break-word" }}>{val}</p>
                              </div>
                            </div>
                          );
                        })}
                        {r.respondent_phone && (
                          <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>📞 {r.respondent_phone}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}