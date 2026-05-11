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
        // Not started yet — don't show
        if (!started) return;
        // Already done this session
        if (sessionStorage.getItem(`survey_done_${survey.id}`)) return;
        setSurvey(survey);
        // Ended: show "survey closed" popup once
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
        const h = () => { if (window.scrollY / document.body.scrollHeight > 0.5) { show(); window.removeEventListener("scroll", h); } };
        window.addEventListener("scroll", h, { passive: true }); break;
      }
      case "exit_intent": {
        const h = (e: MouseEvent) => { if (e.clientY < 8) { show(); document.removeEventListener("mouseleave", h); } };
        document.addEventListener("mouseleave", h); break;
      }
    }
  }, []);

  const setVal    = (qid: string, value: string) => setAnswers(a => ({ ...a, [qid]: { ...a[qid], value } }));
  const toggleOpt = (qid: string, oid: string, multi: boolean) =>
    setAnswers(a => {
      const prev = a[qid]?.selected_option_ids ?? [];
      const next = multi ? (prev.includes(oid) ? prev.filter(x => x !== oid) : [...prev, oid]) : [oid];
      return { ...a, [qid]: { ...a[qid], selected_option_ids: next } };
    });

  const dismiss = () => {
    setOpen(false);
    if (survey) sessionStorage.setItem(`survey_done_${survey.id}`, "1");
  };

  const submit = async () => {
    if (!survey) return;
    // Validate required
    for (const q of survey.questions) {
      if (!q.is_required) continue;
      const a = answers[q.id];
      const empty = !a || (["radio","checkbox","select"].includes(q.type) ? !(a.selected_option_ids?.length) : !(a.value?.trim()));
      if (empty) { setError(t("Please answer all required questions.", "يرجى الإجابة على جميع الأسئلة المطلوبة.")); return; }
    }
    setSubmitting(true); setError(null);
    try {
      await fetch(`/api/admin/surveys?respond=${survey.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, answers: survey.questions.map(q => ({ question_id: q.id, ...answers[q.id] })) }),
      });
      sessionStorage.setItem(`survey_done_${survey.id}`, "1");
      setSubmitted(true);
    } catch { setError(t("Something went wrong.", "حدث خطأ ما.")); }
    finally { setSubmitting(false); }
  };

  if (!survey || !open) return null;

  const q   = survey.questions[step];
  const ans = q ? answers[q.id] ?? {} : {};

  const renderQ = (q: Question) => {
    const a = answers[q.id] ?? {};
    const ph = t("Type your answer…", "اكتب إجابتك...");
    switch (q.type) {
      case "text":
        return <input value={a.value??""} onChange={e=>setVal(q.id,e.target.value)} style={inp} placeholder={ph} />;
      case "textarea":
        return <textarea value={a.value??""} onChange={e=>setVal(q.id,e.target.value)} rows={4} style={{...inp,resize:"vertical",height:88}} placeholder={ph} />;
      case "date":
        return <input type="date" value={a.value??""} onChange={e=>setVal(q.id,e.target.value)} style={inp} />;
      case "radio":
      case "select":
      case "checkbox": {
        const multi = q.type==="checkbox";
        return (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {q.options.map(opt=>{
              const sel = a.selected_option_ids?.includes(opt.id);
              return (
                <button key={opt.id} onClick={()=>toggleOpt(q.id,opt.id,multi)} type="button" style={{
                  padding:"11px 16px", borderRadius:10, border:`1.5px solid ${sel?"#1C75BC":"#e2e8f0"}`,
                  background:sel?"#eff8ff":"#fff", cursor:"pointer",
                  textAlign:isRTL?"right":"left", fontSize:14,
                  color:sel?"#1C75BC":"#334155", fontWeight:sel?600:400,
                }}>
                  {t(opt.label_en, opt.label_ar)}
                </button>
              );
            })}
          </div>
        );
      }
      case "rating":
        return (
          <div style={{ display:"flex", gap:10, justifyContent:"center", padding:"8px 0" }}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} type="button" onClick={()=>setVal(q.id,String(n))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:38, lineHeight:1, color:Number(a.value??0)>=n?"#F59E0B":"#e2e8f0" }}>★</button>
            ))}
          </div>
        );
      case "nps":
        return (
          <div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center" }}>
              {Array.from({length:11},(_,n)=>{
                const sel = a.value===String(n);
                const color = n<=6?"#ef4444":n<=8?"#f59e0b":"#22c55e";
                return (
                  <button key={n} type="button" onClick={()=>setVal(q.id,String(n))} style={{ width:42, height:42, borderRadius:8, fontSize:13, fontWeight:700, border:`2px solid ${sel?color:"#e2e8f0"}`, background:sel?color:"#fff", color:sel?"#fff":"#475569", cursor:"pointer" }}>{n}</button>
                );
              })}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#94a3b8", marginTop:8, paddingInline:4 }}>
              <span>{t("Not likely","غير محتمل")}</span>
              <span>{t("Very likely","محتمل جداً")}</span>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,.4)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div dir={isRTL?"rtl":"ltr"} style={{ background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,.14)", fontFamily:"Inter, system-ui, sans-serif", position:"relative" }}>

        {/* Close */}
        <button onClick={dismiss} aria-label="Close" style={{ position:"absolute", top:14, [isRTL?"left":"right"]:14, background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#94a3b8", lineHeight:1 }}>×</button>

        {submitted ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:8 }}>{t("Thank you!","شكراً لك!")}</h2>
            <p style={{ fontSize:14, color:"#64748b" }}>{t("Your response has been recorded.","تم تسجيل إجابتك بنجاح.")}</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a", marginBottom:6, paddingInlineEnd:28 }}>{t(survey.title_en,survey.title_ar)}</h2>
            {(survey.description_en||survey.description_ar) && (
              <p style={{ fontSize:13, color:"#64748b", marginBottom:20, lineHeight:1.6 }}>{t(survey.description_en,survey.description_ar)}</p>
            )}

            {/* Progress */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#94a3b8", marginBottom:6 }}>
                <span>{isRTL?`سؤال ${step+1} من ${survey.questions.length}`:`Question ${step+1} of ${survey.questions.length}`}</span>
                <span>{Math.round((step+1)/survey.questions.length*100)}%</span>
              </div>
              <div style={{ height:4, background:"#f1f5f9", borderRadius:999 }}>
                <div style={{ height:"100%", borderRadius:999, background:"#1C75BC", width:`${(step+1)/survey.questions.length*100}%`, transition:"width .35s" }} />
              </div>
            </div>

            {q && (
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:15, fontWeight:600, color:"#0f172a", marginBottom:14, lineHeight:1.5 }}>
                  {t(q.text_en,q.text_ar)}
                  {q.is_required && <span style={{ color:"#ef4444", marginInlineStart:4 }}>*</span>}
                </p>
                {renderQ(q)}
              </div>
            )}

            {error && <p style={{ color:"#ef4444", fontSize:13, marginBottom:14 }}>{error}</p>}

            <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
              {step>0
                ? <button type="button" onClick={()=>setStep(s=>s-1)} style={navBtn("#f1f5f9","#0f172a")}>{isRTL?"← السابق":"← Back"}</button>
                : <div />}
              {step<survey.questions.length-1
                ? <button type="button" onClick={()=>{setError(null);setStep(s=>s+1);}} style={navBtn("#1C75BC","#fff")}>{isRTL?"التالي →":"Next →"}</button>
                : <button type="button" onClick={submit} disabled={submitting} style={navBtn("#1C75BC","#fff")}>{submitting?t("Submitting…","جارٍ الإرسال…"):t("Submit","إرسال")}</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const navBtn = (bg: string, color: string): React.CSSProperties => ({ padding:"11px 24px", borderRadius:999, fontSize:14, fontWeight:600, background:bg, color, border:"none", cursor:"pointer" });