"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type QType = "text"|"textarea"|"radio"|"checkbox"|"select"|"rating"|"nps"|"date";
type Option   = { id: string; label_en: string; label_ar: string };
type Question = { id: string; text_en: string; text_ar: string; type: QType; is_required: boolean; options: Option[] };
type Survey = {
  id: string; title_en: string; title_ar: string;
  description_en: string; description_ar: string;
  collect_name: boolean; collect_phone: boolean;
  branches: string[];
  questions: Question[];
};
type Answers = Record<string, { value?: string; selected_option_ids?: string[] }>;

export default function SurveyPage() {
  const params  = useParams();
  const locale  = (params?.locale as string) || "en";
  const id      = params?.id as string;
  const isRTL   = locale === "ar";
  const t       = (en: string, ar: string) => isRTL ? ar : en;

  const [survey,     setSurvey]     = useState<Survey | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [ended,      setEnded]      = useState(false);
  const [step,       setStep]       = useState(0);
  const [answers,    setAnswers]    = useState<Answers>({});
  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [branch,     setBranch]     = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [animDir,    setAnimDir]    = useState<"forward"|"back">("forward");
  const [animating,  setAnimating]  = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/admin/surveys?active=1&survey_id=${id}`)
      .then(r => r.json())
      .then(({ survey, ended }) => {
        if (!survey || survey.id !== id) setNotFound(true);
        else if (ended) { setEnded(true); setSurvey(survey); }
        else setSurvey(survey);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const setVal    = (qid: string, value: string) =>
    setAnswers(a => ({ ...a, [qid]: { ...a[qid], value } }));

  const toggleOpt = (qid: string, oid: string, multi: boolean) =>
    setAnswers(a => {
      const prev = a[qid]?.selected_option_ids ?? [];
      const next = multi
        ? (prev.includes(oid) ? prev.filter(x => x !== oid) : [...prev, oid])
        : [oid];
      return { ...a, [qid]: { ...a[qid], selected_option_ids: next } };
    });

  const isAnswerEmpty = (q: Question) => {
    const a = answers[q.id];
    if (!a) return true;
    if (["radio","checkbox","select"].includes(q.type)) return !(a.selected_option_ids?.length);
    return !(a.value?.trim());
  };

  const validateCurrent = (): boolean => {
    if (!survey) return true;
    const q = survey.questions[step];
    if (q?.is_required && isAnswerEmpty(q)) {
      setError(t("Please answer this question to continue.", "يرجى الإجابة على هذا السؤال للمتابعة."));
      if (cardRef.current) {
        cardRef.current.classList.remove("shake");
        void cardRef.current.offsetWidth;
        cardRef.current.classList.add("shake");
      }
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    setError(null);
    setAnimDir("forward");
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 220);
  };

  const goBack = () => {
    setError(null);
    setAnimDir("back");
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 220);
  };

  const submit = async () => {
    if (!survey) return;
    for (const q of survey.questions) {
      if (q.is_required && isAnswerEmpty(q)) {
        setError(t("Please answer all required questions.", "يرجى الإجابة على جميع الأسئلة المطلوبة."));
        return;
      }
    }
    setSubmitting(true); setError(null);
    try {
      await fetch(`/api/admin/surveys?respond=${survey.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          respondent_name:   name   || undefined,
          respondent_phone:  phone  || undefined,
          respondent_branch: branch || undefined,
          answers: survey.questions.map(q => ({ question_id: q.id, ...answers[q.id] })),
        }),
      });
      setSubmitted(true);
    } catch {
      setError(t("Something went wrong. Please try again.", "حدث خطأ ما. يرجى المحاولة مرة أخرى."));
    } finally {
      setSubmitting(false);
    }
  };

  const q = survey?.questions[step];
  const progress = survey ? ((step + 1) / survey.questions.length) * 100 : 0;

  const renderQ = (q: Question) => {
    const a = answers[q.id] ?? {};
    const ph = t("Type your answer…", "اكتب إجابتك...");

    switch (q.type) {
      case "text":
        return (
          <input
            value={a.value ?? ""}
            onChange={e => setVal(q.id, e.target.value)}
            style={styles.input}
            placeholder={ph}
            autoFocus
          />
        );
      case "textarea":
        return (
          <textarea
            value={a.value ?? ""}
            onChange={e => setVal(q.id, e.target.value)}
            rows={4}
            style={{ ...styles.input, resize: "vertical", minHeight: 110 }}
            placeholder={ph}
            autoFocus
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={a.value ?? ""}
            onChange={e => setVal(q.id, e.target.value)}
            style={styles.input}
          />
        );
      case "radio":
      case "select":
      case "checkbox": {
        const multi = q.type === "checkbox";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map(opt => {
              const sel = a.selected_option_ids?.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOpt(q.id, opt.id, multi)}
                  style={{
                    ...styles.optionBtn,
                    borderColor:      sel ? "#1C75BC" : "#e8ecf0",
                    background:       sel ? "#f0f8ff" : "#fff",
                    color:            sel ? "#1C75BC" : "#374151",
                    fontWeight:       sel ? 600 : 400,
                    transform:        sel ? "translateX(4px)" : "translateX(0)",
                    boxShadow:        sel ? "0 2px 12px rgba(28,117,188,0.12)" : "none",
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: multi ? 6 : "50%",
                    border: `2px solid ${sel ? "#1C75BC" : "#d1d5db"}`,
                    background: sel ? "#1C75BC" : "transparent",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all .15s",
                  }}>
                    {sel && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span style={{ flex: 1, textAlign: isRTL ? "right" : "left" }}>
                    {t(opt.label_en, opt.label_ar)}
                  </span>
                </button>
              );
            })}
          </div>
        );
      }
      case "rating":
        return (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "8px 0" }}>
            {[1, 2, 3, 4, 5].map(n => {
              const active = Number(a.value ?? 0) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setVal(q.id, String(n))}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 44, lineHeight: 1, padding: "4px 2px",
                    color: active ? "#F59E0B" : "#e2e8f0",
                    transform: active ? "scale(1.1)" : "scale(1)",
                    transition: "all .2s",
                    filter: active ? "drop-shadow(0 2px 4px rgba(245,158,11,0.3))" : "none",
                  }}
                >★</button>
              );
            })}
          </div>
        );
      case "nps":
        return (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
              {Array.from({ length: 11 }, (_, n) => {
                const sel   = a.value === String(n);
                const color = n <= 6 ? "#ef4444" : n <= 8 ? "#f59e0b" : "#22c55e";
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setVal(q.id, String(n))}
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      fontSize: 14, fontWeight: 600,
                      border: `2px solid ${sel ? color : "#e5e7eb"}`,
                      background: sel ? color : "#fff",
                      color: sel ? "#fff" : "#374151",
                      cursor: "pointer", transition: "all .15s",
                      transform: sel ? "scale(1.1)" : "scale(1)",
                      boxShadow: sel ? `0 2px 10px ${color}55` : "none",
                    }}
                  >{n}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginTop: 10, paddingInline: 4 }}>
              <span>😔 {t("Not likely", "غير محتمل")}</span>
              <span>{t("Very likely", "محتمل جداً")} 😊</span>
            </div>
          </div>
        );
      default: return null;
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={styles.fullPage}>
      <div style={{ textAlign: "center" }}>
        <div style={styles.spinnerRing} />
        <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 20, fontFamily: styles.font }}>
          {t("Loading survey…", "جارٍ تحميل الاستطلاع…")}
        </p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (notFound) return (
    <div style={styles.fullPage}>
      <div style={{ textAlign: "center", maxWidth: 380, padding: "0 24px" }}>
        <div style={{ ...styles.iconCircle, background: "#fef3f2" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v4M11 15h.01"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8, fontFamily: styles.font }}>
          {t("Survey not found", "الاستطلاع غير موجود")}
        </h1>
        <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 28, lineHeight: 1.6, fontFamily: styles.font }}>
          {t("This survey may have been removed or the link is incorrect.", "ربما تم حذف هذا الاستطلاع أو الرابط غير صحيح.")}
        </p>
        <Link href={`/${locale}`} style={styles.pillBtn}>{t("← Go home", "← الصفحة الرئيسية")}</Link>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .shake { animation: shake .4s ease; }
        .fade-in { animation: fadeSlideIn .3s ease; }
        .pop-in { animation: popIn .4s cubic-bezier(.34,1.56,.64,1); }
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: #1C75BC !important;
          box-shadow: 0 0 0 4px rgba(28,117,188,0.1) !important;
        }
        button:focus-visible { outline: 2px solid #1C75BC; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      <div
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg,#eef6ff 0%,#f5f9ff 40%,#fafbff 100%)",
          padding: "32px 16px 60px",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "fixed", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(28,117,188,0.06)", pointerEvents: "none", zIndex: 0 }}/>
        <div style={{ position: "fixed", bottom: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(56,189,248,0.07)", pointerEvents: "none", zIndex: 0 }}/>

        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Back link */}
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center" }}>
            <Link href={`/${locale}`} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#1C75BC", textDecoration: "none", fontSize: 13,
              fontWeight: 600, opacity: 0.8, transition: "opacity .15s",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {t("Back", "رجوع")}
            </Link>
          </div>

          {/* Main card */}
          <div ref={cardRef} style={styles.card}>

            {/* ── Ended ── */}
            {ended && (
              <div style={{ textAlign: "center", padding: "32px 16px" }} className="pop-in">
                <div style={{ ...styles.iconCircle, background: "#f1f5f9", marginBottom: 20 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 10 }}>
                  {t(survey?.title_en ?? "", survey?.title_ar ?? "")}
                </h1>
                <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7 }}>
                  {t("This survey has ended. Thank you for your interest.", "انتهى هذا الاستطلاع. شكراً لاهتمامك.")}
                </p>
              </div>
            )}

            {/* ── Submitted ── */}
            {!ended && submitted && (
              <div style={{ textAlign: "center", padding: "40px 16px" }} className="pop-in">
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 10 }}>
                  {t("Thank you!", "شكراً لك!")}
                </h1>
                <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7 }}>
                  {t("Your response has been recorded successfully.", "تم تسجيل إجابتك بنجاح.")}
                </p>
                <Link href={`/${locale}`} style={{ ...styles.pillBtn, display: "inline-block", marginTop: 28 }}>
                  {t("Back to home", "العودة للرئيسية")}
                </Link>
              </div>
            )}

            {/* ── Survey form ── */}
            {!ended && !submitted && survey && (
              <>
                {/* Survey header */}
                <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1.5px solid #f1f5f9" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#eff6ff", color: "#1C75BC",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                    padding: "4px 12px", borderRadius: 999, marginBottom: 12,
                    textTransform: "uppercase",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="2"/>
                    </svg>
                    {t("Survey", "استطلاع")}
                  </div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.3 }}>
                    {t(survey.title_en, survey.title_ar)}
                  </h1>
                  {(survey.description_en || survey.description_ar) && (
                    <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                      {t(survey.description_en, survey.description_ar)}
                    </p>
                  )}
                </div>

                {/* Respondent info — step 0 */}
                {step === 0 && (survey.collect_name || survey.collect_phone || survey.branches?.length > 0) && (
                  <div style={styles.infoBox} className="fade-in">
                    <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {t("Your details (optional)", "بياناتك (اختياري)")}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {survey.collect_name && (
                        <div>
                          <label style={styles.label}>{t("Name", "الاسم")}</label>
                          <input value={name} onChange={e => setName(e.target.value)} style={styles.input} placeholder={t("Your name", "اسمك")}/>
                        </div>
                      )}
                      {survey.collect_phone && (
                        <div>
                          <label style={styles.label}>{t("Phone", "رقم الهاتف")}</label>
                          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" style={styles.input} placeholder={t("Phone number", "رقم هاتفك")}/>
                        </div>
                      )}
                      {survey.branches?.length > 0 && (
                        <div>
                          <label style={styles.label}>{t("Branch visited", "الفرع الذي زرته")}</label>
                          <select value={branch} onChange={e => setBranch(e.target.value)} style={styles.input}>
                            <option value="">{t("Select branch…", "اختر الفرع...")}</option>
                            {(survey.branches as string[]).map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                      {isRTL
                        ? `السؤال ${step + 1} من ${survey.questions.length}`
                        : `Question ${step + 1} of ${survey.questions.length}`}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: "#1C75BC",
                      background: "#eff6ff", padding: "2px 10px", borderRadius: 999,
                    }}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      background: "linear-gradient(90deg,#1C75BC,#38bdf8)",
                      width: `${progress}%`,
                      transition: "width .5s cubic-bezier(.4,0,.2,1)",
                      boxShadow: "0 0 8px rgba(28,117,188,0.4)",
                    }}/>
                  </div>
                  {/* Step dots */}
                  <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "center" }}>
                    {survey.questions.map((_, i) => (
                      <div key={i} style={{
                        width: i === step ? 18 : 6,
                        height: 6, borderRadius: 999,
                        background: i === step ? "#1C75BC" : i < step ? "#93c5fd" : "#e2e8f0",
                        transition: "all .3s",
                      }}/>
                    ))}
                  </div>
                </div>

                {/* Question */}
                {q && (
                  <div
                    key={`q-${step}`}
                    style={{ marginBottom: 28, animation: animating ? "none" : "fadeSlideIn .3s ease" }}
                  >
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, background: "#eff6ff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#1C75BC",
                        }}>
                          {step + 1}
                        </div>
                        <p style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.5, paddingTop: 4 }}>
                          {t(q.text_en, q.text_ar)}
                          {q.is_required && <span style={{ color: "#ef4444", marginInlineStart: 4 }}>*</span>}
                        </p>
                      </div>
                    </div>
                    {renderQ(q)}
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "#fef2f2", border: "1.5px solid #fecaca",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                    animation: "fadeSlideIn .2s ease",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 500 }}>{error}</span>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  {step > 0 ? (
                    <button type="button" onClick={goBack} style={styles.backBtn}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 12H5M12 5l-7 7 7 7"/>
                      </svg>
                      {isRTL ? "السابق" : "Back"}
                    </button>
                  ) : <div />}

                  {step < survey.questions.length - 1 ? (
                    <button type="button" onClick={goNext} style={styles.nextBtn}>
                      {isRTL ? "التالي" : "Next"}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ) : (
                    <button type="button" onClick={submit} disabled={submitting} style={{ ...styles.nextBtn, minWidth: 120, opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? (
                        <>
                          <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin .7s linear infinite" }}/>
                          {t("Sending…", "إرسال…")}
                        </>
                      ) : (
                        <>
                          {t("Submit", "إرسال")}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Branding */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <p style={{ fontSize: 12, color: "#c8d5e8", margin: 0, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Powered by{" "}
              <span style={{ color: "#1C75BC", fontWeight: 700 }}>Trolleys Supermarket</span>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

/* ─── Style objects ─────────────────────────────────────────── */
const font = "'Plus Jakarta Sans', system-ui, sans-serif";

const styles = {
  font,
  fullPage: {
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(160deg,#eef6ff,#f5f9ff)",
    fontFamily: font,
  } as React.CSSProperties,

  spinnerRing: {
    width: 40, height: 40,
    border: "3px solid #e2e8f0",
    borderTopColor: "#1C75BC",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto",
  } as React.CSSProperties,

  iconCircle: {
    width: 64, height: 64, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
  } as React.CSSProperties,

  pillBtn: {
    background: "#1C75BC", color: "white",
    textDecoration: "none", padding: "12px 28px",
    borderRadius: 999, fontSize: 14, fontWeight: 600,
    fontFamily: font, display: "inline-block",
  } as React.CSSProperties,

  card: {
    background: "white",
    borderRadius: 20,
    padding: "32px 28px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(28,117,188,0.08)",
    border: "1.5px solid rgba(28,117,188,0.08)",
  } as React.CSSProperties,

  infoBox: {
    background: "#f8faff",
    borderRadius: 14,
    padding: "18px 20px",
    marginBottom: 24,
    border: "1.5px solid #e8f0fe",
  } as React.CSSProperties,

  label: {
    fontSize: 12, fontWeight: 600, color: "#64748b",
    display: "block", marginBottom: 6, letterSpacing: "0.02em",
  } as React.CSSProperties,

  input: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e8ecf0",
    borderRadius: 10, fontSize: 15, outline: "none",
    fontFamily: font, boxSizing: "border-box" as const,
    background: "#fff", color: "#0f172a",
    transition: "border-color .15s, box-shadow .15s",
  } as React.CSSProperties,

  optionBtn: {
    padding: "13px 16px",
    borderRadius: 12,
    border: "2px solid #e8ecf0",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 15,
    transition: "all .2s",
    width: "100%",
    fontFamily: font,
  } as React.CSSProperties,

  nextBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 24px", borderRadius: 12,
    background: "linear-gradient(135deg,#1C75BC,#2b8fd4)",
    color: "white", border: "none", cursor: "pointer",
    fontSize: 15, fontWeight: 600,
    boxShadow: "0 4px 12px rgba(28,117,188,0.3)",
    transition: "all .2s",
    fontFamily: font,
  } as React.CSSProperties,

  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "12px 18px", borderRadius: 12,
    background: "#f8fafc", color: "#64748b",
    border: "1.5px solid #e8ecf0", cursor: "pointer",
    fontSize: 14, fontWeight: 600, transition: "all .2s",
    fontFamily: font,
  } as React.CSSProperties,
};