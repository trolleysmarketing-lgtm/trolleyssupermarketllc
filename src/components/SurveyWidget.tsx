"use client";

import { useState, useEffect, useCallback } from "react";

type QType = "text"|"textarea"|"radio"|"checkbox"|"select"|"rating"|"nps"|"date";
type Option   = { id: string; label_en: string; label_ar: string };
type Question = { id: string; text_en: string; text_ar: string; type: QType; is_required: boolean; options: Option[] };
type Survey   = {
  id: string; title_en: string; title_ar: string;
  description_en: string; description_ar: string;
  display_mode: "popup"|"page"|"both";
  trigger: "immediate"|"scroll"|"exit_intent"|"delay";
  trigger_delay_seconds: number;
  questions: Question[];
};
type Answers = Record<string, { value?: string; selected_option_ids?: string[] }>;

export function SurveyWidget({ locale = "en", branch = "" }: { locale?: string; branch?: string }) {
  const isRTL = locale === "ar";
  const t     = (en: string, ar: string) => isRTL ? ar : en;

  const [survey,     setSurvey]     = useState<Survey | null>(null);
  const [open,       setOpen]       = useState(false);
  const [step,       setStep]       = useState(0);
  const [answers,    setAnswers]    = useState<Answers>({});
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string|null>(null);

  /* ── Fetch active survey ── */
  useEffect(() => {
    fetch(`/api/admin/surveys?active=1${branch ? `&branch=${encodeURIComponent(branch)}` : ""}`)
      .then(r => r.json())
      .then(({ survey, started, ended }) => {
        if (!survey) return;
        if (!started) return;
        if (sessionStorage.getItem(`survey_done_${survey.id}`)) return;
        // display_mode: page ise popup gösterme
        if (survey.display_mode === "page") return;
        setSurvey(survey);
        if (ended) { setOpen(true); setSubmitted(true); return; }
        setupTrigger(survey);
      })
      .catch(() => {});
  }, []);

  const setupTrigger = useCallback((s: Survey) => {
    const show = () => setOpen(true);
    switch (s.trigger) {
      case "immediate": show(); break;
      case "delay": setTimeout(show, (s.trigger_delay_seconds ?? 5) * 1000); break;
      case "scroll": {
        const h = () => {
          if (window.scrollY / document.body.scrollHeight > 0.5) {
            show(); window.removeEventListener("scroll", h);
          }
        };
        window.addEventListener("scroll", h, { passive: true }); break;
      }
      case "exit_intent": {
        const h = (e: MouseEvent) => {
          if (e.clientY < 8) { show(); document.removeEventListener("mouseleave", h); }
        };
        document.addEventListener("mouseleave", h); break;
      }
    }
  }, []);

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

  const dismiss = () => {
    setOpen(false);
    if (survey) sessionStorage.setItem(`survey_done_${survey.id}`, "1");
  };

  /* ── Validate current step ── */
  const validateStep = (): boolean => {
    if (!survey) return true;
    const q = survey.questions[step];
    if (!q || !q.is_required) return true;
    const a = answers[q.id];
    const empty = !a || (
      ["radio","checkbox","select"].includes(q.type)
        ? !(a.selected_option_ids?.length)
        : !(a.value?.trim())
    );
    if (empty) {
      setError(t("Please answer this question before continuing.", "يرجى الإجابة على هذا السؤال قبل المتابعة."));
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError(null);
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const submit = async () => {
    if (!survey) return;
    setError(null);
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/surveys?respond=${survey.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          answers: survey.questions.map(q => ({ question_id: q.id, ...answers[q.id] })),
        }),
      });
      sessionStorage.setItem(`survey_done_${survey.id}`, "1");
      setSubmitted(true);
    } catch {
      setError(t("Something went wrong. Please try again.", "حدث خطأ ما. يرجى المحاولة مجدداً."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!survey || !open) return null;

  const q   = survey.questions[step];
  const ans = q ? answers[q.id] ?? {} : {};
  const totalSteps = survey.questions.length;
  const progress   = Math.round((step + 1) / totalSteps * 100);

  const renderQ = (q: Question) => {
    const a  = answers[q.id] ?? {};
    const ph = t("Type your answer…", "اكتب إجابتك...");

    switch (q.type) {
      case "text":
        return (
          <input
            value={a.value ?? ""}
            onChange={e => setVal(q.id, e.target.value)}
            style={inp}
            placeholder={ph}
          />
        );
      case "textarea":
        return (
          <textarea
            value={a.value ?? ""}
            onChange={e => setVal(q.id, e.target.value)}
            rows={4}
            style={{ ...inp, resize: "vertical", minHeight: 88 }}
            placeholder={ph}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={a.value ?? ""}
            onChange={e => setVal(q.id, e.target.value)}
            style={inp}
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
                  onClick={() => toggleOpt(q.id, opt.id, multi)}
                  type="button"
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `2px solid ${sel ? "#1C75BC" : "#e2e8f0"}`,
                    background: sel ? "#eff8ff" : "#fafafa",
                    cursor: "pointer",
                    textAlign: isRTL ? "right" : "left",
                    fontSize: 14,
                    color: sel ? "#1C75BC" : "#334155",
                    fontWeight: sel ? 600 : 400,
                    transition: "all .15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: multi ? 5 : "50%",
                    border: `2px solid ${sel ? "#1C75BC" : "#cbd5e1"}`,
                    background: sel ? "#1C75BC" : "#fff",
                    flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {sel && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                  {t(opt.label_en, opt.label_ar)}
                </button>
              );
            })}
          </div>
        );
      }
      case "rating":
        return (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "8px 0", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setVal(q.id, String(n))}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 42, lineHeight: 1,
                  color: Number(a.value ?? 0) >= n ? "#F59E0B" : "#e2e8f0",
                  transition: "color .15s, transform .1s",
                  transform: Number(a.value ?? 0) >= n ? "scale(1.1)" : "scale(1)",
                }}
              >★</button>
            ))}
          </div>
        );
      case "nps":
        return (
          <div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
              {Array.from({ length: 11 }, (_, n) => {
                const sel   = a.value === String(n);
                const color = n <= 6 ? "#ef4444" : n <= 8 ? "#f59e0b" : "#22c55e";
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setVal(q.id, String(n))}
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      fontSize: 13, fontWeight: 700,
                      border: `2px solid ${sel ? color : "#e2e8f0"}`,
                      background: sel ? color : "#fff",
                      color: sel ? "#fff" : "#475569",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >{n}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 8, paddingInline: 4 }}>
              <span>{t("Not likely", "غير محتمل")}</span>
              <span>{t("Very likely", "محتمل جداً")}</span>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes surveyFadeIn {
          from { opacity: 0; transform: scale(.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
        .survey-card {
          animation: surveyFadeIn .3s cubic-bezier(.4,0,.2,1);
        }
        @media (max-width: 480px) {
          .survey-card {
            border-radius: 20px 20px 0 0 !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .survey-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="survey-overlay"
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,.45)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
        onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
      >
        {/* Card */}
        <div
          className="survey-card"
          dir={isRTL ? "rtl" : "ltr"}
          style={{
            background: "#fff",
            borderRadius: 20,
            width: "100%",
            maxWidth: 500,
            boxShadow: "0 24px 64px rgba(0,0,0,.18)",
            fontFamily: "Inter, system-ui, sans-serif",
            position: "relative",
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1C75BC, #155a8e)",
            padding: "20px 24px 16px",
            position: "relative",
            flexShrink: 0,
          }}>
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{
                position: "absolute", top: 12,
                [isRTL ? "left" : "right"]: 12,
                background: "rgba(255,255,255,.15)",
                border: "none", cursor: "pointer",
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 16, lineHeight: 1,
              }}
            >×</button>

            <h2 style={{
              fontSize: 16, fontWeight: 700, color: "#fff",
              margin: "0 0 4px", paddingInlineEnd: 32, lineHeight: 1.3,
            }}>
              {t(survey.title_en, survey.title_ar)}
            </h2>
            {(survey.description_en || survey.description_ar) && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)", margin: "0 0 12px", lineHeight: 1.5 }}>
                {t(survey.description_en, survey.description_ar)}
              </p>
            )}

            {/* Progress bar */}
            {!submitted && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,.6)", marginBottom: 6 }}>
                  <span>{isRTL ? `${step + 1} / ${totalSteps}` : `${step + 1} of ${totalSteps}`}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,.2)", borderRadius: 999 }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    background: "#fff",
                    width: `${progress}%`,
                    transition: "width .35s ease",
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#eff8ff", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 32,
                }}>🎉</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
                  {t("Thank you!", "شكراً لك!")}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                  {t("Your response has been recorded.", "تم تسجيل إجابتك بنجاح.")}
                </p>
                <button
                  onClick={dismiss}
                  style={{
                    marginTop: 20, padding: "10px 28px",
                    borderRadius: 999, background: "#1C75BC",
                    color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {t("Close", "إغلاق")}
                </button>
              </div>
            ) : (
              <>
                {q && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{
                      fontSize: 15, fontWeight: 600, color: "#0f172a",
                      margin: "0 0 16px", lineHeight: 1.5,
                    }}>
                      {t(q.text_en, q.text_ar)}
                      {q.is_required && <span style={{ color: "#ef4444", marginInlineStart: 4 }}>*</span>}
                    </p>
                    {renderQ(q)}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ color: "#ef4444", fontSize: 16 }}>⚠</span>
                    <p style={{ color: "#ef4444", fontSize: 13, margin: 0, fontWeight: 500 }}>{error}</p>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => { setError(null); setStep(s => s - 1); }}
                      style={navBtn("#f1f5f9", "#0f172a")}
                    >
                      {isRTL ? "السابق ←" : "← Back"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={dismiss}
                      style={{ ...navBtn("#f1f5f9", "#94a3b8"), fontSize: 13 }}
                    >
                      {t("Skip", "تخطي")}
                    </button>
                  )}

                  {step < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      style={navBtn("#1C75BC", "#fff")}
                    >
                      {isRTL ? "→ التالي" : "Next →"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={submitting}
                      style={{ ...navBtn("#1C75BC", "#fff"), opacity: submitting ? .7 : 1 }}
                    >
                      {submitting
                        ? t("Submitting…", "جارٍ الإرسال…")
                        : t("Submit ✓", "إرسال ✓")}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "#fafafa",
  transition: "border-color .2s",
};

const navBtn = (bg: string, color: string): React.CSSProperties => ({
  padding: "11px 24px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  background: bg,
  color,
  border: "none",
  cursor: "pointer",
  transition: "all .2s",
  whiteSpace: "nowrap",
});