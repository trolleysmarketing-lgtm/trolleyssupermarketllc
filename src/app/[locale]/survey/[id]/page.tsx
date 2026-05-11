"use client";

import { useState, useEffect } from "react";
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
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const id     = params?.id as string;
  const isRTL  = locale === "ar";
  const t      = (en: string, ar: string) => isRTL ? ar : en;

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

  const BRANCHES = ["Mirdif - Dubai","Al Taawun - Sharjah","Al Khan - Sharjah","Al Nuaimia - Ajman","Oasis Street - Ajman"];

  useEffect(() => {
    fetch(`/api/admin/surveys?active=1&survey_id=${id}`)
      .then(r => r.json())
      .then(({ survey, ended }) => {
        if (!survey || survey.id !== id) { setNotFound(true); }
        else if (ended) { setEnded(true); setSurvey(survey); }
        else { setSurvey(survey); }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const setVal    = (qid: string, value: string) => setAnswers(a => ({...a,[qid]:{...a[qid],value}}));
  const toggleOpt = (qid: string, oid: string, multi: boolean) =>
    setAnswers(a => {
      const prev = a[qid]?.selected_option_ids ?? [];
      const next = multi ? (prev.includes(oid) ? prev.filter(x=>x!==oid) : [...prev,oid]) : [oid];
      return {...a,[qid]:{...a[qid],selected_option_ids:next}};
    });

  const submit = async () => {
    if (!survey) return;
    // Validate required questions
    for (const q of survey.questions) {
      if (!q.is_required) continue;
      const a = answers[q.id];
      const empty = !a || (["radio","checkbox","select"].includes(q.type) ? !(a.selected_option_ids?.length) : !(a.value?.trim()));
      if (empty) { setError(t("Please answer all required questions.","يرجى الإجابة على جميع الأسئلة المطلوبة.")); return; }
    }
    setSubmitting(true); setError(null);
    try {
      await fetch(`/api/admin/surveys?respond=${survey.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          respondent_name:  name  || undefined,
          respondent_phone: phone || undefined,
          respondent_branch: branch || undefined,
          answers: survey.questions.map(q => ({ question_id: q.id, ...answers[q.id] })),
        }),
      });
      setSubmitted(true);
    } catch { setError(t("Something went wrong. Please try again.","حدث خطأ ما. يرجى المحاولة مرة أخرى.")); }
    finally { setSubmitting(false); }
  };

  const q = survey?.questions[step];

  const renderQ = (q: Question) => {
    const a = answers[q.id] ?? {};
    const ph = t("Type your answer…","اكتب إجابتك...");
    switch (q.type) {
      case "text":
        return <input value={a.value??""} onChange={e=>setVal(q.id,e.target.value)} style={inp} placeholder={ph}/>;
      case "textarea":
        return <textarea value={a.value??""} onChange={e=>setVal(q.id,e.target.value)} rows={4} style={{...inp,resize:"vertical",height:100}} placeholder={ph}/>;
      case "date":
        return <input type="date" value={a.value??""} onChange={e=>setVal(q.id,e.target.value)} style={inp}/>;
      case "radio": case "select": case "checkbox": {
        const multi = q.type==="checkbox";
        return (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {q.options.map(opt=>{
              const sel=a.selected_option_ids?.includes(opt.id);
              return(
                <button key={opt.id} type="button" onClick={()=>toggleOpt(q.id,opt.id,multi)} style={{
                  padding:"12px 18px",borderRadius:12,border:`2px solid ${sel?"#1C75BC":"#e5e7eb"}`,
                  background:sel?"#eff8ff":"#fff",cursor:"pointer",textAlign:isRTL?"right":"left",
                  fontSize:15,color:sel?"#1C75BC":"#374151",fontWeight:sel?600:400,transition:"all .15s",
                }}>
                  {t(opt.label_en,opt.label_ar)}
                </button>
              );
            })}
          </div>
        );
      }
      case "rating":
        return(
          <div style={{display:"flex",gap:12,justifyContent:"center",padding:"12px 0"}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} type="button" onClick={()=>setVal(q.id,String(n))} style={{background:"none",border:"none",cursor:"pointer",fontSize:44,lineHeight:1,color:Number(a.value??0)>=n?"#F59E0B":"#e2e8f0",transition:"color .15s"}}>★</button>
            ))}
          </div>
        );
      case "nps":
        return(
          <div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
              {Array.from({length:11},(_,n)=>{
                const sel=a.value===String(n);
                const color=n<=6?"#ef4444":n<=8?"#f59e0b":"#22c55e";
                return(
                  <button key={n} type="button" onClick={()=>setVal(q.id,String(n))} style={{width:48,height:48,borderRadius:10,fontSize:15,fontWeight:700,border:`2px solid ${sel?color:"#e5e7eb"}`,background:sel?color:"#fff",color:sel?"#fff":"#374151",cursor:"pointer",transition:"all .15s"}}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#9ca3af",marginTop:8,paddingInline:4}}>
              <span>{t("Not likely","غير محتمل")}</span>
              <span>{t("Very likely","محتمل جداً")}</span>
            </div>
          </div>
        );
      default: return null;
    }
  };

  // ── Loading ──
  if (loading) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc"}}>
      <div style={{textAlign:"center",color:"#9ca3af"}}>
        <div style={{fontSize:40,marginBottom:12,animation:"spin 1s linear infinite"}}>⏳</div>
        <p style={{fontSize:15}}>Loading survey…</p>
      </div>
    </div>
  );

  // ── Not found ──
  if (notFound) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <div style={{fontSize:52,marginBottom:16}}>🔍</div>
        <h1 style={{fontSize:22,fontWeight:700,color:"#111",marginBottom:8}}>{t("Survey not found","الاستطلاع غير موجود")}</h1>
        <p style={{fontSize:14,color:"#9ca3af",marginBottom:24}}>{t("This survey may have been removed or the link is incorrect.","ربما تم حذف هذا الاستطلاع أو الرابط غير صحيح.")}</p>
        <Link href={`/${locale}`} style={{background:"#1C75BC",color:"white",textDecoration:"none",padding:"11px 28px",borderRadius:999,fontSize:14,fontWeight:600}}>{t("Go home","الصفحة الرئيسية")}</Link>
      </div>
    </div>
  );

  return(
    <div dir={isRTL?"rtl":"ltr"} style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f7ff 0%,#f8fafc 100%)",padding:"40px 20px",fontFamily:"Inter,system-ui,sans-serif"}}>
      <div style={{maxWidth:580,margin:"0 auto"}}>

        {/* Logo/back */}
        <div style={{marginBottom:32,textAlign:"center"}}>
          <Link href={`/${locale}`} style={{display:"inline-flex",alignItems:"center",gap:8,textDecoration:"none",color:"#1C75BC",fontSize:14,fontWeight:600}}>
            ← {t("Back to Trolleys","العودة إلى تروليز")}
          </Link>
        </div>

        <div style={{background:"white",borderRadius:24,padding:"36px 32px",boxShadow:"0 4px 24px rgba(0,0,0,.06)",border:"1px solid #e5e7eb"}}>

          {/* ── Ended ── */}
          {ended&&(
            <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{fontSize:52,marginBottom:16}}>🔒</div>
              <h1 style={{fontSize:22,fontWeight:700,color:"#111",marginBottom:8}}>{t(survey?.title_en??"",survey?.title_ar??"")}</h1>
              <p style={{fontSize:15,color:"#9ca3af"}}>{t("This survey has ended. Thank you for your interest.","انتهى هذا الاستطلاع. شكراً لاهتمامك.")}</p>
            </div>
          )}

          {/* ── Submitted ── */}
          {!ended&&submitted&&(
            <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{fontSize:56,marginBottom:16}}>🎉</div>
              <h1 style={{fontSize:24,fontWeight:700,color:"#111",marginBottom:10}}>{t("Thank you!","شكراً لك!")}</h1>
              <p style={{fontSize:15,color:"#6b7280",lineHeight:1.7}}>{t("Your response has been recorded successfully.","تم تسجيل إجابتك بنجاح.")}</p>
              <Link href={`/${locale}`} style={{display:"inline-block",marginTop:24,background:"#1C75BC",color:"white",textDecoration:"none",padding:"11px 28px",borderRadius:999,fontSize:14,fontWeight:600}}>{t("Back to home","العودة للرئيسية")}</Link>
            </div>
          )}

          {/* ── Survey form ── */}
          {!ended&&!submitted&&survey&&(
            <>
              {/* Header */}
              <div style={{marginBottom:28}}>
                <h1 style={{fontSize:22,fontWeight:700,color:"#111",marginBottom:8}}>{t(survey.title_en,survey.title_ar)}</h1>
                {(survey.description_en||survey.description_ar)&&(
                  <p style={{fontSize:14,color:"#6b7280",lineHeight:1.7}}>{t(survey.description_en,survey.description_ar)}</p>
                )}
              </div>

              {/* Respondent info — shown on first step */}
              {step===0&&(survey.collect_name||survey.collect_phone||(survey.branches&&survey.branches?.length>0))&&(
                <div style={{background:"#f8fafc",borderRadius:14,padding:"18px 20px",marginBottom:24,border:"1px solid #e5e7eb"}}>
                  <p style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:"#374151"}}>{t("Your details (optional)","بياناتك (اختياري)")}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {survey.collect_name&&(
                      <div>
                        <label style={{fontSize:12,fontWeight:600,color:"#6b7280",display:"block",marginBottom:5}}>{t("Name","الاسم")}</label>
                        <input value={name} onChange={e=>setName(e.target.value)} style={inp} placeholder={t("Your name (optional)","اسمك (اختياري)")}/>
                      </div>
                    )}
                    {survey.collect_phone&&(
                      <div>
                        <label style={{fontSize:12,fontWeight:600,color:"#6b7280",display:"block",marginBottom:5}}>{t("Phone","رقم الهاتف")}</label>
                        <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" style={inp} placeholder={t("Phone number (optional)","رقم هاتفك (اختياري)")}/>
                      </div>
                    )}
                    {survey.branches&&survey.branches.length>0&&(
                      <div>
                        <label style={{fontSize:12,fontWeight:600,color:"#6b7280",display:"block",marginBottom:5}}>{t("Branch visited","الفرع الذي زرته")}</label>
                        <select value={branch} onChange={e=>setBranch(e.target.value)} style={inp}>
                          <option value="">{t("Select branch…","اختر الفرع...")}</option>
                          {(survey.branches as string[]).map(b=><option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress */}
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#9ca3af",marginBottom:8}}>
                  <span>{isRTL?`سؤال ${step+1} من ${survey.questions.length}`:`Question ${step+1} of ${survey.questions.length}`}</span>
                  <span style={{fontWeight:600,color:"#1C75BC"}}>{Math.round((step+1)/survey.questions.length*100)}%</span>
                </div>
                <div style={{height:6,background:"#f1f5f9",borderRadius:999}}>
                  <div style={{height:"100%",borderRadius:999,background:"linear-gradient(90deg,#1C75BC,#38bdf8)",width:`${(step+1)/survey.questions.length*100}%`,transition:"width .4s"}}/>
                </div>
              </div>

              {/* Question */}
              {q&&(
                <div style={{marginBottom:28}}>
                  <p style={{fontSize:17,fontWeight:700,color:"#111",marginBottom:18,lineHeight:1.5}}>
                    {t(q.text_en,q.text_ar)}
                    {q.is_required&&<span style={{color:"#ef4444",marginInlineStart:4}}>*</span>}
                  </p>
                  {renderQ(q)}
                </div>
              )}

              {error&&<p style={{color:"#ef4444",fontSize:13,marginBottom:16}}>{error}</p>}

              {/* Navigation */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {step>0
                  ?<button type="button" onClick={()=>setStep(s=>s-1)} style={navBtn("#f3f4f6","#374151")}>{isRTL?"← السابق":"← Back"}</button>
                  :<div/>}
                {step<survey.questions.length-1
                  ?<button type="button" onClick={()=>{setError(null);setStep(s=>s+1);}} style={navBtn("#1C75BC","#fff")}>{isRTL?"التالي →":"Next →"}</button>
                  :<button type="button" onClick={submit} disabled={submitting} style={navBtn("#1C75BC","#fff")}>{submitting?t("Submitting…","جارٍ الإرسال…"):t("Submit","إرسال")}</button>}
              </div>
            </>
          )}
        </div>

        {/* Branding */}
        <p style={{textAlign:"center",fontSize:12,color:"#d1d5db",marginTop:24}}>
          Powered by <span style={{color:"#1C75BC",fontWeight:600}}>Trolleys Supermarket</span>
        </p>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {width:"100%",padding:"11px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:15,outline:"none",fontFamily:"inherit",boxSizing:"border-box",background:"#fff"};
const navBtn = (bg:string,color:string):React.CSSProperties => ({padding:"12px 28px",borderRadius:999,fontSize:14,fontWeight:600,background:bg,color,border:"none",cursor:"pointer",transition:"opacity .2s"});