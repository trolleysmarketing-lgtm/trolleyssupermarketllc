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

  const setVal = (qid: string, value: string) =>
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
      setError(t(
        "Please answer this question to continue.",
        "يرجى الإجابة على هذا السؤال للمتابعة."
      ));
      cardRef.current?.classList.remove("shake-anim");
      void cardRef.current?.offsetWidth;
      cardRef.current?.classList.add("shake-anim");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    setError(null);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setError(null);
    setStep(s => s - 1);
  };

  const submit = async () => {
    if (!survey) return;
    for (const q of survey.questions) {
      if (q.is_required && isAnswerEmpty(q)) {
        setError(t(
          "Please answer all required questions.",
          "يرجى الإجابة على جميع الأسئلة المطلوبة."
        ));
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

  const q        = survey?.questions[step];
  const total    = survey?.questions.length ?? 1;
  const progress = Math.round(((step + 1) / total) * 100);

  const inputCls = `w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-base text-gray-800
    focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
    transition-all duration-150 bg-white placeholder-gray-400`;

  const renderQ = (q: Question) => {
    const a  = answers[q.id] ?? {};
    const ph = t("Type your answer…", "اكتب إجابتك...");

    switch (q.type) {
      case "text":
        return <input autoFocus value={a.value ?? ""} onChange={e => setVal(q.id, e.target.value)} placeholder={ph} className={inputCls} />;

      case "textarea":
        return <textarea autoFocus value={a.value ?? ""} onChange={e => setVal(q.id, e.target.value)} rows={4} placeholder={ph} className={`${inputCls} resize-y min-h-[110px]`} />;

      case "date":
        return <input type="date" value={a.value ?? ""} onChange={e => setVal(q.id, e.target.value)} className={inputCls} />;

      case "radio":
      case "select":
      case "checkbox": {
        const multi = q.type === "checkbox";
        return (
          <div className="flex flex-col gap-3">
            {q.options.map(opt => {
              const sel = a.selected_option_ids?.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOpt(q.id, opt.id, multi)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 text-base font-medium text-left
                    ${sel
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100 translate-x-1"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border-2 transition-all duration-150
                    ${multi ? "rounded-md" : "rounded-full"}
                    ${sel ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"}`}>
                    {sel && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
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
          <div className="flex gap-1 justify-center py-2">
            {[1,2,3,4,5].map(n => {
              const active = Number(a.value ?? 0) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setVal(q.id, String(n))}
                  className={`text-5xl leading-none p-1 border-none bg-transparent cursor-pointer transition-all duration-150 ${active ? "scale-110" : "scale-100"}`}
                  style={{ color: active ? "#F59E0B" : "#e2e8f0", filter: active ? "drop-shadow(0 2px 4px rgba(245,158,11,.35))" : "none" }}
                >★</button>
              );
            })}
          </div>
        );

      case "nps":
        return (
          <div>
            <div className="flex flex-wrap gap-2 justify-center">
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
                      transform: sel ? "scale(1.12)" : "scale(1)",
                      boxShadow: sel ? `0 2px 10px ${color}55` : "none",
                    }}
                  >{n}</button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-3 px-1">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-gray-400">{t("Loading survey…", "جارٍ تحميل الاستطلاع…")}</p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 p-5">
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v4M11 15h.01"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{t("Survey not found", "الاستطلاع غير موجود")}</h1>
        <p className="text-sm text-gray-400 mb-7 leading-relaxed">
          {t("This survey may have been removed or the link is incorrect.", "ربما تم حذف هذا الاستطلاع أو الرابط غير صحيح.")}
        </p>
        <Link href={`/${locale}`} className="inline-block bg-[#1C75BC] text-white text-sm font-semibold px-7 py-3 rounded-full no-underline">
          {t("← Go home", "← الصفحة الرئيسية")}
        </Link>
      </div>
    </div>
  );

  /* ── Main ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        @keyframes shake-keys {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-5px)}
          40%{transform:translateX(5px)}
          60%{transform:translateX(-3px)}
          80%{transform:translateX(3px)}
        }
        .shake-anim { animation: shake-keys .4s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .slide-up { animation: slideUp .3s ease; }
        @keyframes popIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        .pop-in { animation: popIn .4s cubic-bezier(.34,1.56,.64,1); }
      `}</style>

      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-8 sm:py-12"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <div className="max-w-lg mx-auto w-full">

          {/* Back */}
          <div className="mb-5">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-[#1C75BC] text-sm font-semibold no-underline opacity-75 hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {t("Back", "رجوع")}
            </Link>
          </div>

          {/* Card */}
          <div ref={cardRef} className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100/60 p-5 sm:p-8 w-full">

            {/* ── Ended ── */}
            {ended && (
              <div className="text-center py-8 pop-in">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900 mb-2">{t(survey?.title_en ?? "", survey?.title_ar ?? "")}</h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {t("This survey has ended. Thank you for your interest.", "انتهى هذا الاستطلاع. شكراً لاهتمامك.")}
                </p>
              </div>
            )}

            {/* ── Submitted ── */}
            {!ended && submitted && (
              <div className="text-center py-10 pop-in">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("Thank you!", "شكراً لك!")}</h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("Your response has been recorded successfully.", "تم تسجيل إجابتك بنجاح.")}
                </p>
                <Link href={`/${locale}`} className="inline-block mt-7 bg-[#1C75BC] text-white text-sm font-semibold px-7 py-3 rounded-full no-underline">
                  {t("Back to home", "العودة للرئيسية")}
                </Link>
              </div>
            )}

            {/* ── Form ── */}
            {!ended && !submitted && survey && (
              <>
                {/* Header */}
                <div className="mb-6 pb-5 border-b border-gray-100">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1C75BC] text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="2"/>
                    </svg>
                    {t("Survey", "استطلاع")}
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 leading-snug">
                    {t(survey.title_en, survey.title_ar)}
                  </h1>
                  {(survey.description_en || survey.description_ar) && (
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {t(survey.description_en, survey.description_ar)}
                    </p>
                  )}
                </div>

                {/* Respondent info */}
                {step === 0 && (survey.collect_name || survey.collect_phone || survey.branches?.length > 0) && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 slide-up">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                      {t("Your details (optional)", "بياناتك (اختياري)")}
                    </p>
                    <div className="flex flex-col gap-3">
                      {survey.collect_name && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("Name", "الاسم")}</label>
                          <input value={name} onChange={e => setName(e.target.value)} placeholder={t("Your name", "اسمك")}
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white" />
                        </div>
                      )}
                      {survey.collect_phone && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("Phone", "رقم الهاتف")}</label>
                          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder={t("Phone number", "رقم هاتفك")}
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white" />
                        </div>
                      )}
                      {survey.branches?.length > 0 && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("Branch visited", "الفرع الذي زرته")}</label>
                          <select value={branch} onChange={e => setBranch(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white">
                            <option value="">{t("Select branch…", "اختر الفرع...")}</option>
                            {(survey.branches as string[]).map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">
                      {isRTL ? `السؤال ${step + 1} من ${total}` : `Question ${step + 1} of ${total}`}
                    </span>
                    <span className="text-xs font-bold text-[#1C75BC] bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1C75BC] to-sky-400 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex gap-1 mt-2 justify-center flex-wrap">
                    {survey.questions.map((_, i) => (
                      <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                        style={{ width: i === step ? 18 : 6, background: i === step ? "#1C75BC" : i < step ? "#93c5fd" : "#e2e8f0" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Question */}
                {q && (
                  <div key={`q-${step}`} className="mb-6 slide-up">
                    <div className="flex gap-3 items-start mb-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-[#1C75BC]">
                        {step + 1}
                      </span>
                      <p className="text-base sm:text-[17px] font-semibold text-gray-900 leading-snug pt-0.5 flex-1">
                        {t(q.text_en, q.text_ar)}
                        {q.is_required && <span className="text-red-500 ms-1">*</span>}
                      </p>
                    </div>
                    {renderQ(q)}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 border-2 border-red-100 rounded-xl px-4 py-3 mb-4 slide-up">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <span className="text-red-600 text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* Nav */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  {step > 0 ? (
                    <button type="button" onClick={goBack}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-50 text-gray-600 border-2 border-gray-100 text-sm font-semibold hover:bg-gray-100 transition-all active:scale-95">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                        <path d="M19 12H5M12 5l-7 7 7 7"/>
                      </svg>
                      {isRTL ? "السابق" : "Back"}
                    </button>
                  ) : <div />}

                  {step < total - 1 ? (
                    <button type="button" onClick={goNext}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold bg-[#1C75BC] hover:bg-[#1664a3] shadow-lg shadow-blue-200 transition-all active:scale-95">
                      {isRTL ? "التالي" : "Next"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ) : (
                    <button type="button" onClick={submit} disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold bg-[#1C75BC] hover:bg-[#1664a3] shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]">
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t("Sending…", "إرسال…")}
                        </>
                      ) : (
                        <>
                          {t("Submit", "إرسال")}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
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
          <p className="text-center text-xs text-gray-300 mt-5">
            Powered by <span className="text-[#1C75BC] font-bold">Trolleys Supermarket</span>
          </p>
        </div>
      </div>
    </>
  );
}