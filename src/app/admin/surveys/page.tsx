"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ── Types ── */
type QType = "text"|"textarea"|"radio"|"checkbox"|"select"|"rating"|"nps"|"date";
type Option   = { id?: string; label_en: string; label_ar: string };
type Question = { id?: string; text_en: string; text_ar: string; type: QType; is_required: boolean; options: Option[] };
type Survey   = {
  id?: string; title_en: string; title_ar: string;
  description_en: string; description_ar: string;
  display_mode: "popup"|"page"|"both";
  trigger: "immediate"|"scroll"|"exit_intent"|"delay";
  trigger_delay_seconds: number;
  is_active: boolean; starts_at: string; ends_at: string;
  notify_email: string; questions: Question[];
  branches: string[];
  response_count?: number;
};
type Answer   = { question_id: string; value?: string; selected_option_ids?: string[] };
type Response = { id: string; submitted_at: string; locale: string; answers: Answer[] };

const BRANCHES = [
  "Mirdif - Dubai",
  "Al Taawun - Sharjah",
  "Al Khan - Sharjah",
  "Al Nuaimia - Ajman",
  "Oasis Street - Ajman",
];

const EMPTY_SURVEY: Omit<Survey,"id"> = {
  title_en: "", title_ar: "", description_en: "", description_ar: "",
  display_mode: "popup", trigger: "delay", trigger_delay_seconds: 5,
  is_active: false, starts_at: "", ends_at: "", notify_email: "",
  questions: [], branches: [],
};

const OPTION_TYPES: QType[] = ["radio","checkbox","select"];
const Q_LABELS: Record<QType,string> = {
  text:"Short text", textarea:"Long text", radio:"Single choice",
  checkbox:"Multiple choice", select:"Dropdown", rating:"Star rating (1-5)",
  nps:"NPS score (0-10)", date:"Date picker",
};

/* ── Style tokens ── */
const inp: React.CSSProperties = { width:"100%", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"9px 12px", fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:"inherit" };
const lbl: React.CSSProperties = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 };
const card: React.CSSProperties = { background:"white", borderRadius:16, padding:28, border:"1px solid #e5e7eb", marginBottom:20 };

/* ── CSV Export (client-side) ── */
function exportCSV(survey: Survey & { responses: Response[] }) {
  const headers = ["Response ID","Date","Locale",...survey.questions.map(q=>q.text_en)];
  const rows = (survey.responses??[]).map(r => {
    const cols: string[] = [r.id, new Date(r.submitted_at).toLocaleString("en-AE"), r.locale];
    survey.questions.forEach(q => {
      const ans = r.answers.find(a=>a.question_id===q.id);
      if (!ans) { cols.push(""); return; }
      if (ans.selected_option_ids?.length) {
        cols.push(q.options.filter(o=>ans.selected_option_ids!.includes(o.id!)).map(o=>o.label_en).join(", "));
      } else {
        cols.push(ans.value ?? "");
      }
    });
    return cols;
  });
  const csv = [headers,...rows].map(row=>row.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `survey-${survey.title_en.replace(/\s+/g,"-")}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════ */
export default function AdminSurveysPage() {
  const [surveys,  setSurveys]  = useState<Survey[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [editing,  setEditing]  = useState<Survey|null>(null);
  const [saving,   setSaving]   = useState(false);
  const [message,  setMessage]  = useState<{type:"success"|"error";text:string}|null>(null);
  const [results,  setResults]  = useState<{survey:Survey&{responses:Response[]}}|null>(null);
  const [tab,      setTab]      = useState<"list"|"builder"|"results">("list");
  const [resTab,   setResTab]   = useState<"summary"|"individual">("summary");

  useEffect(()=>{ fetchSurveys(); },[]);

  const fetchSurveys = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/surveys");
    if (res.ok) { const d=await res.json(); setSurveys(d.surveys); }
    setLoading(false);
  };

  const openNew  = () => { setEditing({...EMPTY_SURVEY,questions:[]}); setMessage(null); setTab("builder"); };
  const openEdit = (s:Survey) => { setEditing({...s}); setMessage(null); setTab("builder"); };

  const viewResults = async (id:string) => {
    const res = await fetch(`/api/admin/surveys?id=${id}&results=1`);
    if (res.ok) { const d=await res.json(); setResults(d); setTab("results"); setResTab("summary"); }
  };

  const handleSave = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.title_en||!editing.title_ar) { setMessage({type:"error",text:"Both title fields are required."}); return; }
    setSaving(true); setMessage(null);
    const res = await fetch("/api/admin/surveys",{
      method:editing.id?"PUT":"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(editing),
    });
    if (res.ok) {
      setMessage({type:"success",text:editing.id?"Survey updated!":"Survey created!"});
      fetchSurveys();
      setTimeout(()=>{setTab("list");setEditing(null);},700);
    } else {
      setMessage({type:"error",text:"Failed to save."});
    }
    setSaving(false);
  };

  const handleDelete = async (id:string) => {
    if (!confirm("Delete this survey and all its responses?")) return;
    await fetch("/api/admin/surveys",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    fetchSurveys();
  };

  const toggleActive = async (s:Survey) => {
    await fetch("/api/admin/surveys",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...s,is_active:!s.is_active})});
    fetchSurveys();
  };

  const surveyStatus = (s:Survey) => {
    if (!s.is_active) return {label:"⚪ Draft",    bg:"#f1f5f9",color:"#6b7280"};
    const now=new Date();
    if (s.starts_at&&new Date(s.starts_at)>now) return {label:"⏳ Scheduled",bg:"#fef9c3",color:"#854d0e"};
    if (s.ends_at  &&new Date(s.ends_at)  <now) return {label:"🔴 Ended",    bg:"#fef2f2",color:"#dc2626"};
    return {label:"🟢 Live",bg:"#dcfce7",color:"#16a34a"};
  };

  /* ── Question helpers ── */
  const setQ      = (i:number,patch:Partial<Question>) => setEditing(e=>{if(!e)return e;const qs=[...e.questions];qs[i]={...qs[i],...patch};return{...e,questions:qs};});
  const addQ      = () => setEditing(e=>e?{...e,questions:[...e.questions,{text_en:"",text_ar:"",type:"radio",is_required:true,options:[]}]}:e);
  const removeQ   = (i:number) => setEditing(e=>e?{...e,questions:e.questions.filter((_,j)=>j!==i)}:e);
  const addOpt    = (qi:number) => setQ(qi,{options:[...(editing?.questions[qi]?.options??[]),{label_en:"",label_ar:""}]});
  const setOpt    = (qi:number,oi:number,patch:Partial<Option>) => setQ(qi,{options:(editing?.questions[qi]?.options??[]).map((o,j)=>j===oi?{...o,...patch}:o)});
  const removeOpt = (qi:number,oi:number) => setQ(qi,{options:(editing?.questions[qi]?.options??[]).filter((_,j)=>j!==oi)});

  /* ── Stats ── */
  const getStats = (q:Question, responses:Response[]) => {
    const answers = responses.flatMap(r=>r.answers.filter(a=>a.question_id===q.id));
    if (OPTION_TYPES.includes(q.type)) {
      return q.options.map(opt=>{
        const count=answers.filter(a=>a.selected_option_ids?.includes(opt.id!)).length;
        return {label:opt.label_en,count,pct:responses.length?Math.round(count/responses.length*100):0};
      });
    }
    if (q.type==="rating"||q.type==="nps") {
      const vals=answers.map(a=>Number(a.value)).filter(v=>!isNaN(v)&&v>0);
      return vals.length?{avg:(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1),count:vals.length}:{avg:"—",count:0};
    }
    return answers.map(a=>a.value).filter(Boolean) as string[];
  };

  const getAnswerDisplay = (q:Question, ans?:Answer):string => {
    if (!ans) return "—";
    if (ans.selected_option_ids?.length) return q.options.filter(o=>ans.selected_option_ids!.includes(o.id!)).map(o=>o.label_en).join(", ")||"—";
    return ans.value||"—";
  };

  /* ══════════════════════════════════════ RENDER ══ */
  return (
    <div style={{minHeight:"100vh",background:"#f8fafc"}}>

      {/* Header */}
      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Link href="/admin" style={{color:"#16a34a",textDecoration:"none",fontSize:14,fontWeight:600}}>← Admin</Link>
          <span style={{color:"#d1d5db"}}>/</span>
          <h1 style={{margin:0,fontSize:18,fontWeight:700,color:"#111"}}>Surveys</h1>
        </div>
        {tab==="results"&&results&&(
          <button onClick={()=>exportCSV(results.survey as Survey&{responses:Response[]})}
            style={{display:"flex",alignItems:"center",gap:8,background:"#0f172a",color:"white",border:"none",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            ↓ Export CSV
          </button>
        )}
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"1px solid #e5e7eb",marginBottom:28}}>
          {(["list","builder","results"] as const).map(t=>(
            <button key={t} onClick={()=>{setTab(t);if(t==="builder"&&!editing)openNew();}} style={{
              padding:"10px 22px",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",background:"transparent",
              borderBottom:tab===t?"2px solid #16a34a":"2px solid transparent",
              color:tab===t?"#16a34a":"#6b7280",marginBottom:-1,
            }}>
              {t==="list"?"📋 Surveys":t==="builder"?"🔧 Builder":"📊 Results"}
            </button>
          ))}
          {tab==="list"&&(
            <button onClick={openNew} style={{marginInlineStart:"auto",marginBottom:8,background:"linear-gradient(135deg,#16a34a,#15803d)",color:"white",border:"none",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              + New Survey
            </button>
          )}
        </div>

        {/* ══ LIST ══ */}
        {tab==="list"&&(
          loading?<p style={{color:"#9ca3af"}}>Loading...</p>:
          surveys.length===0?(
            <div style={{textAlign:"center",padding:"64px 0",color:"#9ca3af"}}>
              <div style={{fontSize:52,marginBottom:16}}>📋</div>
              <p style={{fontSize:15,marginBottom:20}}>No surveys yet</p>
              <button onClick={openNew} style={{background:"#16a34a",color:"white",border:"none",borderRadius:10,padding:"11px 28px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Create first survey</button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {surveys.filter(s=>s.is_active).length>1&&(
                <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:12,padding:"14px 18px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
                  <div>
                    <p style={{margin:0,fontSize:13,fontWeight:700,color:"#92400e"}}>{surveys.filter(s=>s.is_active).length} active surveys</p>
                    <p style={{margin:"4px 0 0",fontSize:12,color:"#b45309"}}>Only the most recently created active survey shows on the website. Deactivate older ones unless they target different branches.</p>
                  </div>
                </div>
              )}
              {surveys.map(s=>{
                const st=surveyStatus(s);
                return(
                  <div key={s.id} style={{border:"1px solid #e5e7eb",borderRadius:14,padding:"18px 20px",background:"white",display:"flex",alignItems:"center",gap:16}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:0,fontSize:14,fontWeight:700,color:"#111"}}>{s.title_en}</p>
                      <p style={{margin:"2px 0 6px",fontSize:12,color:"#9ca3af"}}>{s.title_ar}</p>
                      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:"#6b7280"}}>📊 {s.response_count??0} responses</span>
                        <span style={{fontSize:11,color:"#6b7280"}}>🖥 {s.display_mode}</span>
                        <span style={{fontSize:11,color:"#6b7280"}}>❓ {s.questions?.length??0} questions</span>
                        <span style={{fontSize:11,color:"#6b7280"}}>🏪 {(!s.branches||s.branches.length===0)?"All branches":s.branches.join(" · ")}</span>
                      </div>
                    </div>
                    <button onClick={()=>toggleActive(s)} style={{padding:"4px 14px",borderRadius:999,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",flexShrink:0,background:st.bg,color:st.color}}>{st.label}</button>
                    <div style={{display:"flex",gap:7,flexShrink:0}}>
                      <button onClick={()=>viewResults(s.id!)} style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",borderRadius:8,padding:"7px 13px",fontSize:12,fontWeight:600,cursor:"pointer"}}>📊 Results</button>
                      <button onClick={()=>openEdit(s)} style={{background:"#eff6ff",color:"#1d4ed8",border:"1px solid #bfdbfe",borderRadius:8,padding:"7px 13px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✏️ Edit</button>
                      <button onClick={()=>handleDelete(s.id!)} style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:8,padding:"7px 13px",fontSize:12,fontWeight:600,cursor:"pointer"}}>🗑️ Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ══ BUILDER ══ */}
        {tab==="builder"&&editing&&(
          <form onSubmit={handleSave}>
            <div style={card}>
              <h2 style={{margin:"0 0 22px",fontSize:16,fontWeight:700,color:"#111"}}>Survey Settings</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div><label style={lbl}>Title (English)</label><input value={editing.title_en} onChange={e=>setEditing(x=>x&&{...x,title_en:e.target.value})} required style={inp} placeholder="e.g. Store Experience Survey"/></div>
                <div><label style={lbl}>Title (Arabic)</label><input value={editing.title_ar} dir="rtl" onChange={e=>setEditing(x=>x&&{...x,title_ar:e.target.value})} required style={inp}/></div>
                <div><label style={lbl}>Description (EN)</label><textarea value={editing.description_en} onChange={e=>setEditing(x=>x&&{...x,description_en:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                <div><label style={lbl}>Description (AR)</label><textarea value={editing.description_ar} dir="rtl" onChange={e=>setEditing(x=>x&&{...x,description_ar:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                <div>
                  <label style={lbl}>Display mode</label>
                  <select value={editing.display_mode} onChange={e=>setEditing(x=>x&&{...x,display_mode:e.target.value as any})} style={inp}>
                    <option value="popup">Popup</option><option value="page">Dedicated page</option><option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Trigger</label>
                  <select value={editing.trigger} onChange={e=>setEditing(x=>x&&{...x,trigger:e.target.value as any})} style={inp}>
                    <option value="immediate">Immediate</option><option value="delay">After delay</option>
                    <option value="scroll">On 50% scroll</option><option value="exit_intent">Exit intent</option>
                  </select>
                </div>
                {editing.trigger==="delay"&&(
                  <div><label style={lbl}>Delay (seconds)</label><input type="number" min={0} max={300} value={editing.trigger_delay_seconds} onChange={e=>setEditing(x=>x&&{...x,trigger_delay_seconds:Number(e.target.value)})} style={inp}/></div>
                )}
                <div><label style={lbl}>Start date</label><input type="datetime-local" value={editing.starts_at} onChange={e=>setEditing(x=>x&&{...x,starts_at:e.target.value})} style={inp}/></div>
                <div><label style={lbl}>End date</label><input type="datetime-local" value={editing.ends_at} onChange={e=>setEditing(x=>x&&{...x,ends_at:e.target.value})} style={inp}/></div>
                <div style={{gridColumn:"1/-1"}}><label style={lbl}>Notify email</label><input type="email" value={editing.notify_email} onChange={e=>setEditing(x=>x&&{...x,notify_email:e.target.value})} style={inp} placeholder="admin@trolleys.ae"/></div>
              </div>

              {/* Branch selector */}
              <div style={{marginBottom:20}}>
                <label style={lbl}>Show on branches</label>
                <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 10px"}}>Leave all unchecked to show on every branch.</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {BRANCHES.map(b=>{
                    const checked=editing.branches?.includes(b)??false;
                    return(
                      <label key={b} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",background:checked?"#f0fdf4":"#f8fafc",border:`1.5px solid ${checked?"#86efac":"#e5e7eb"}`,borderRadius:8,padding:"7px 12px",fontSize:13,fontWeight:500,color:checked?"#16a34a":"#374151",transition:"all .15s"}}>
                        <input type="checkbox" checked={checked}
                          onChange={e=>setEditing(x=>{
                            if(!x)return x;
                            const branches=e.target.checked?[...(x.branches??[]),b]:(x.branches??[]).filter(br=>br!==b);
                            return{...x,branches};
                          })}
                          style={{width:15,height:15}}
                        />
                        🏪 {b}
                      </label>
                    );
                  })}
                </div>
              </div>

              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                <input type="checkbox" checked={editing.is_active} onChange={e=>setEditing(x=>x&&{...x,is_active:e.target.checked})} style={{width:16,height:16}}/>
                <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>Active (live on website)</span>
              </label>
            </div>

            {/* Questions */}
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <h2 style={{margin:0,fontSize:16,fontWeight:700,color:"#111"}}>Questions</h2>
                <button type="button" onClick={addQ} style={{background:"#eff6ff",color:"#1d4ed8",border:"1px solid #bfdbfe",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Add question</button>
              </div>
              {editing.questions.length===0&&(
                <p style={{color:"#9ca3af",fontSize:13,textAlign:"center",padding:"32px 0"}}>No questions yet. Click "+ Add question" to start.</p>
              )}
              {editing.questions.map((q,qi)=>(
                <div key={qi} style={{border:"1px solid #e5e7eb",borderRadius:12,padding:18,marginBottom:14,background:"#fafbfd"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#6b7280",background:"#f1f5f9",padding:"3px 10px",borderRadius:999}}>Q{qi+1}</span>
                    <button type="button" onClick={()=>removeQ(qi)} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,color:"#dc2626",cursor:"pointer",padding:"4px 12px",fontSize:12,fontWeight:600}}>Remove</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                    <div><label style={lbl}>Question (EN)</label><input value={q.text_en} onChange={e=>setQ(qi,{text_en:e.target.value})} style={inp}/></div>
                    <div><label style={lbl}>Question (AR)</label><input value={q.text_ar} dir="rtl" onChange={e=>setQ(qi,{text_ar:e.target.value})} style={inp}/></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,marginBottom:12}}>
                    <div>
                      <label style={lbl}>Type</label>
                      <select value={q.type} onChange={e=>setQ(qi,{type:e.target.value as QType,options:[]})} style={inp}>
                        {Object.entries(Q_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginTop:22,whiteSpace:"nowrap"}}>
                      <input type="checkbox" checked={q.is_required} onChange={e=>setQ(qi,{is_required:e.target.checked})} style={{width:15,height:15}}/>
                      <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>Required</span>
                    </label>
                  </div>
                  {OPTION_TYPES.includes(q.type)&&(
                    <div>
                      <label style={lbl}>Options</label>
                      {q.options.map((opt,oi)=>(
                        <div key={oi} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginBottom:8}}>
                          <input value={opt.label_en} placeholder="Label EN" onChange={e=>setOpt(qi,oi,{label_en:e.target.value})} style={inp}/>
                          <input value={opt.label_ar} placeholder="Label AR" dir="rtl" onChange={e=>setOpt(qi,oi,{label_ar:e.target.value})} style={inp}/>
                          <button type="button" onClick={()=>removeOpt(qi,oi)} style={{background:"none",border:"1px solid #fca5a5",borderRadius:8,color:"#ef4444",cursor:"pointer",padding:"0 10px",fontSize:16}}>×</button>
                        </div>
                      ))}
                      <button type="button" onClick={()=>addOpt(qi)} style={{background:"#f3f4f6",color:"#374151",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:4}}>+ Add option</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {message&&(
              <div style={{background:message.type==="success"?"#f0fdf4":"#fef2f2",border:"1px solid "+(message.type==="success"?"#bbf7d0":"#fecaca"),borderRadius:10,padding:"11px 16px",fontSize:13,color:message.type==="success"?"#16a34a":"#dc2626",marginBottom:16}}>
                {message.text}
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button type="submit" disabled={saving} style={{background:saving?"#9ca3af":"linear-gradient(135deg,#16a34a,#15803d)",color:"white",border:"none",borderRadius:10,padding:"11px 28px",fontSize:14,fontWeight:600,cursor:saving?"not-allowed":"pointer"}}>
                {saving?"Saving...":editing.id?"Update Survey":"Create Survey"}
              </button>
              <button type="button" onClick={()=>{setTab("list");setEditing(null);}} style={{background:"#f3f4f6",color:"#374151",border:"1px solid #e5e7eb",borderRadius:10,padding:"11px 24px",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ══ RESULTS ══ */}
        {tab==="results"&&results&&(()=>{
          const survey    = results.survey;
          const responses = survey.responses??[];
          return(
            <div>
              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
                {[
                  {label:"Total Responses", value:responses.length},
                  {label:"Questions",       value:survey.questions?.length??0},
                  {label:"Status",          value:surveyStatus(survey).label},
                  {label:"Branches",        value:(!survey.branches||survey.branches.length===0)?"All":survey.branches.length},
                ].map(({label,value})=>(
                  <div key={label} style={{background:"white",borderRadius:12,padding:"16px 20px",border:"1px solid #e5e7eb"}}>
                    <p style={{margin:"0 0 6px",fontSize:11,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".08em"}}>{label}</p>
                    <p style={{margin:0,fontSize:26,fontWeight:700,color:"#111"}}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Sub-tabs */}
              <div style={{display:"flex",borderBottom:"1px solid #e5e7eb",marginBottom:20}}>
                {(["summary","individual"] as const).map(t=>(
                  <button key={t} onClick={()=>setResTab(t)} style={{
                    padding:"9px 20px",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",background:"transparent",
                    borderBottom:resTab===t?"2px solid #16a34a":"2px solid transparent",
                    color:resTab===t?"#16a34a":"#6b7280",marginBottom:-1,
                  }}>
                    {t==="summary"?"📊 Summary":"👤 Individual responses"}
                  </button>
                ))}
              </div>

              {/* Summary */}
              {resTab==="summary"&&(
                responses.length===0?(
                  <div style={{textAlign:"center",padding:"48px 0",color:"#9ca3af"}}>
                    <div style={{fontSize:40,marginBottom:12}}>📭</div><p>No responses yet</p>
                  </div>
                ):(
                  survey.questions.map((q,i)=>{
                    const stats=getStats(q,responses);
                    const answerCount=responses.filter(r=>r.answers.some(a=>a.question_id===q.id)).length;
                    return(
                      <div key={q.id} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:"22px 24px",marginBottom:16}}>
                        <p style={{margin:"0 0 3px",fontSize:14,fontWeight:700,color:"#111"}}>{i+1}. {q.text_en}</p>
                        <p style={{margin:"0 0 16px",fontSize:11,color:"#9ca3af"}}>{Q_LABELS[q.type]} · {answerCount} answers</p>

                        {/* Option bars */}
                        {Array.isArray(stats)&&stats.length>0&&typeof stats[0]==="object"&&"pct" in stats[0]&&(
                          <div>
                            {(stats as {label:string;count:number;pct:number}[]).map(s=>(
                              <div key={s.label} style={{marginBottom:12}}>
                                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",marginBottom:5}}>
                                  <span>{s.label}</span>
                                  <span style={{fontWeight:700,color:"#111"}}>{s.pct}% <span style={{color:"#9ca3af",fontWeight:400}}>({s.count})</span></span>
                                </div>
                                <div style={{height:10,background:"#f1f5f9",borderRadius:999,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${s.pct}%`,background:"linear-gradient(90deg,#16a34a,#22c55e)",borderRadius:999,transition:"width .6s"}}/>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Numeric avg */}
                        {stats&&typeof stats==="object"&&"avg" in stats&&(
                          <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                            <span style={{fontSize:40,fontWeight:700,color:"#16a34a"}}>{(stats as any).avg}</span>
                            <span style={{fontSize:14,color:"#9ca3af"}}>{q.type==="rating"?"/ 5 stars":"/ 10 NPS"} · {(stats as any).count} responses</span>
                          </div>
                        )}

                        {/* Text */}
                        {Array.isArray(stats)&&stats.length>0&&typeof stats[0]==="string"&&(
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {(stats as string[]).slice(0,10).map((r,j)=>(
                              <div key={j} style={{background:"#f8fafc",borderRadius:8,padding:"9px 13px",fontSize:13,color:"#374151",borderLeft:"3px solid #e2e8f0"}}>{r}</div>
                            ))}
                            {(stats as string[]).length>10&&(
                              <p style={{fontSize:12,color:"#9ca3af",margin:0}}>+{(stats as string[]).length-10} more — export CSV to see all</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              )}

              {/* Individual */}
              {resTab==="individual"&&(
                responses.length===0?(
                  <div style={{textAlign:"center",padding:"48px 0",color:"#9ca3af"}}>
                    <div style={{fontSize:40,marginBottom:12}}>📭</div><p>No responses yet</p>
                  </div>
                ):(
                  responses.slice().reverse().map((r,ri)=>(
                    <div key={r.id} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:"18px 22px",marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:12,borderBottom:"1px solid #f1f5f9"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:"#f0fdf4",color:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>
                            {responses.length-ri}
                          </div>
                          <div>
                            <p style={{margin:0,fontSize:13,fontWeight:600,color:"#111"}}>Response #{responses.length-ri}</p>
                            <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{new Date(r.submitted_at).toLocaleString("en-AE")} · {r.locale.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {survey.questions.map(q=>(
                          <div key={q.id} style={{display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:12,fontSize:13,padding:"6px 0",borderBottom:"1px solid #f8fafc"}}>
                            <span style={{color:"#6b7280",fontWeight:500}}>{q.text_en}</span>
                            <span style={{color:"#111",fontWeight:600}}>{getAnswerDisplay(q,r.answers.find(a=>a.question_id===q.id))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}