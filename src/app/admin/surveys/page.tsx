"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

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
  notify_email: string;
  collect_name: boolean; collect_phone: boolean;
  questions: Question[];
  branches: string[];
  slug?: string;
  response_count?: number;
};
type Answer   = { question_id: string; value?: string; selected_option_ids?: string[] };
type Response = {
  id: string; submitted_at: string; locale: string;
  respondent_name?: string; respondent_phone?: string; respondent_branch?: string;
  answers: Answer[];
};

const BRANCHES = ["Mirdif - Dubai","Al Taawun - Sharjah","Al Khan - Sharjah","Al Nuaimia - Ajman","Oasis Street - Ajman"];
const CHART_COLORS = ["#1C75BC","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];
const OPTION_TYPES: QType[] = ["radio","checkbox","select"];
const Q_LABELS: Record<QType,string> = {
  text:"Short text", textarea:"Long text", radio:"Single choice",
  checkbox:"Multiple choice", select:"Dropdown", rating:"Star rating (1-5)",
  nps:"NPS score (0-10)", date:"Date picker",
};

const EMPTY: Omit<Survey,"id"> = {
  title_en:"", title_ar:"", description_en:"", description_ar:"",
  display_mode:"popup", trigger:"delay", trigger_delay_seconds:5,
  is_active:false, starts_at:"", ends_at:"", notify_email:"",
  collect_name:false, collect_phone:false, questions:[], branches:[],
};

/* ── Styles ── */
const inp: React.CSSProperties = {width:"100%",border:"1.5px solid #e5e7eb",borderRadius:10,padding:"9px 12px",fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit",background:"#fff"};
const lbl: React.CSSProperties = {fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6};
const card: React.CSSProperties = {background:"white",borderRadius:16,padding:28,border:"1px solid #e5e7eb",marginBottom:20};

/* ── CSV Export ── */
function exportCSV(survey: Survey & {responses:Response[]}) {
  const headers = ["#","Date","Locale","Name","Phone","Branch",...survey.questions.map(q=>q.text_en)];
  const rows = (survey.responses??[]).map((r,i) => {
    const cols: string[] = [String(i+1), new Date(r.submitted_at).toLocaleString("en-AE"), r.locale, r.respondent_name??"", r.respondent_phone??"", r.respondent_branch??""];
    survey.questions.forEach(q => {
      const ans = r.answers.find(a=>a.question_id===q.id);
      if (!ans) { cols.push(""); return; }
      if (ans.selected_option_ids?.length) cols.push(q.options.filter(o=>ans.selected_option_ids!.includes(o.id!)).map(o=>o.label_en).join(", "));
      else cols.push(ans.value??"");
    });
    return cols;
  });
  const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href=url; a.download=`survey-${survey.slug||survey.id}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ── QR Code (canvas, no lib needed) ── */
function QRModal({ url, title, onClose }: { url: string; title: string; onClose: ()=>void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrLoaded, setQrLoaded] = useState(false);

  useEffect(() => {
    // Use QRServer free API to generate QR as image
    setQrLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1C75BC&margin=10`;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0,0,300,300);
      ctx.drawImage(img, 0, 0, 300, 300);
      setQrLoaded(true);
    };
  }, [url]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${title.replace(/\s+/g,"-")}.png`;
    a.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"white",borderRadius:20,padding:32,width:"100%",maxWidth:420,boxShadow:"0 24px 60px rgba(0,0,0,.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{margin:0,fontSize:17,fontWeight:700,color:"#111"}}>Survey Link & QR</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af",lineHeight:1}}>×</button>
        </div>

        {/* QR */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <div style={{position:"relative",width:220,height:220,borderRadius:16,overflow:"hidden",border:"1px solid #e5e7eb",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {!qrLoaded&&<p style={{fontSize:12,color:"#9ca3af"}}>Generating QR…</p>}
            <canvas ref={canvasRef} width={300} height={300} style={{width:220,height:220,display:qrLoaded?"block":"none"}}/>
          </div>
        </div>

        {/* URL */}
        <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10,border:"1px solid #e5e7eb"}}>
          <span style={{fontSize:12,color:"#374151",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{url}</span>
          <button onClick={copyLink} style={{background:"#1C75BC",color:"white",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>Copy</button>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={downloadQR} disabled={!qrLoaded} style={{flex:1,background:"#0f172a",color:"white",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            ↓ Download QR
          </button>
          <button onClick={onClose} style={{flex:1,background:"#f3f4f6",color:"#374151",border:"1px solid #e5e7eb",borderRadius:10,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
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
  const [resTab,   setResTab]   = useState<"charts"|"individual">("charts");
  const [qrSurvey, setQrSurvey] = useState<Survey|null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(()=>{ fetchSurveys(); },[]);

  const fetchSurveys = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/surveys");
    if (res.ok) { const d=await res.json(); setSurveys(d.surveys); }
    setLoading(false);
  };

  const openNew  = () => { setEditing({...EMPTY,questions:[]}); setMessage(null); setTab("builder"); };
  const openEdit = (s:Survey) => { setEditing({...s}); setMessage(null); setTab("builder"); };

  const viewResults = async (id:string) => {
    const res = await fetch(`/api/admin/surveys?id=${id}&results=1`);
    if (res.ok) { const d=await res.json(); setResults(d); setTab("results"); setResTab("charts"); }
  };

  const handleSave = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!editing||!editing.title_en||!editing.title_ar) { setMessage({type:"error",text:"Both title fields are required."}); return; }
    setSaving(true); setMessage(null);
    const res = await fetch("/api/admin/surveys",{method:editing.id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(editing)});
    if (res.ok) {
      setMessage({type:"success",text:editing.id?"Survey updated!":"Survey created!"});
      fetchSurveys();
      setTimeout(()=>{setTab("list");setEditing(null);},700);
    } else { setMessage({type:"error",text:"Failed to save."}); }
    setSaving(false);
  };

  const handleDelete = async (id:string) => {
    if (!confirm("Delete this survey and all responses?")) return;
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
  const setQ      = (i:number,p:Partial<Question>) => setEditing(e=>{if(!e)return e;const qs=[...e.questions];qs[i]={...qs[i],...p};return{...e,questions:qs};});
  const addQ      = () => setEditing(e=>e?{...e,questions:[...e.questions,{text_en:"",text_ar:"",type:"radio",is_required:true,options:[]}]}:e);
  const removeQ   = (i:number) => setEditing(e=>e?{...e,questions:e.questions.filter((_,j)=>j!==i)}:e);
  const addOpt    = (qi:number) => setQ(qi,{options:[...(editing?.questions[qi]?.options??[]),{label_en:"",label_ar:""}]});
  const setOpt    = (qi:number,oi:number,p:Partial<Option>) => setQ(qi,{options:(editing?.questions[qi]?.options??[]).map((o,j)=>j===oi?{...o,...p}:o)});
  const removeOpt = (qi:number,oi:number) => setQ(qi,{options:(editing?.questions[qi]?.options??[]).filter((_,j)=>j!==oi)});

  /* ── Stats ── */
  const getBarData = (q:Question, responses:Response[]) => {
    const answers = responses.flatMap(r=>r.answers.filter(a=>a.question_id===q.id));
    return q.options.map(opt=>({
      name: opt.label_en.length>20 ? opt.label_en.slice(0,18)+"…" : opt.label_en,
      fullName: opt.label_en,
      count: answers.filter(a=>a.selected_option_ids?.includes(opt.id!)).length,
    }));
  };

  const getNumericStats = (q:Question, responses:Response[]) => {
    const answers = responses.flatMap(r=>r.answers.filter(a=>a.question_id===q.id));
    const vals = answers.map(a=>Number(a.value)).filter(v=>!isNaN(v)&&v>0);
    if (!vals.length) return null;
    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
    const max = q.type==="rating" ? 5 : 10;
    const dist = Array.from({length:max+1},(_,i)=>({value:String(i),count:vals.filter(v=>v===i).length})).filter((_,i)=>i>0);
    return { avg: avg.toFixed(1), count: vals.length, dist };
  };

  const getTextAnswers = (q:Question, responses:Response[]) => {
    return responses.flatMap(r=>r.answers.filter(a=>a.question_id===q.id).map(a=>a.value)).filter(Boolean) as string[];
  };

  const getAnswerDisplay = (q:Question, ans?:Answer):string => {
    if (!ans) return "—";
    if (ans.selected_option_ids?.length) return q.options.filter(o=>ans.selected_option_ids!.includes(o.id!)).map(o=>o.label_en).join(", ")||"—";
    return ans.value||"—";
  };

  /* ── Branch distribution for pie chart ── */
  const getBranchData = (responses:Response[]) => {
    const counts: Record<string,number> = {};
    responses.forEach(r => {
      const b = r.respondent_branch || "Not specified";
      counts[b] = (counts[b]||0)+1;
    });
    return Object.entries(counts).map(([name,value])=>({name,value}));
  };

  /* ═══════════════════════════════════ RENDER ══ */
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

      <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>

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
                <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:12,padding:"14px 18px",display:"flex",gap:12}}>
                  <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
                  <div>
                    <p style={{margin:0,fontSize:13,fontWeight:700,color:"#92400e"}}>{surveys.filter(s=>s.is_active).length} active surveys</p>
                    <p style={{margin:"4px 0 0",fontSize:12,color:"#b45309"}}>Only the most recently created active survey shows as a popup. Deactivate older ones unless they have different branches.</p>
                  </div>
                </div>
              )}
              {surveys.map(s=>{
                const st=surveyStatus(s);
                const surveyUrl=`${baseUrl}/en/survey/${s.id}`;
                return(
                  <div key={s.id} style={{border:"1px solid #e5e7eb",borderRadius:14,padding:"18px 20px",background:"white"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{margin:0,fontSize:14,fontWeight:700,color:"#111"}}>{s.title_en}</p>
                        <p style={{margin:"2px 0 8px",fontSize:12,color:"#9ca3af"}}>{s.title_ar}</p>
                        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                          <span style={{fontSize:11,color:"#6b7280"}}>📊 {s.response_count??0} responses</span>
                          <span style={{fontSize:11,color:"#6b7280"}}>🖥 {s.display_mode}</span>
                          <span style={{fontSize:11,color:"#6b7280"}}>❓ {s.questions?.length??0} questions</span>
                          <span style={{fontSize:11,color:"#6b7280"}}>🏪 {(!s.branches||s.branches.length===0)?"All branches":s.branches.join(" · ")}</span>
                          {s.collect_name&&<span style={{fontSize:11,color:"#6b7280"}}>👤 Collects name</span>}
                          {s.collect_phone&&<span style={{fontSize:11,color:"#6b7280"}}>📞 Collects phone</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                        <button onClick={()=>toggleActive(s)} style={{padding:"4px 14px",borderRadius:999,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:st.bg,color:st.color}}>{st.label}</button>
                        <div style={{display:"flex",gap:7}}>
                          <button onClick={()=>setQrSurvey(s)} style={{background:"#f8fafc",color:"#374151",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>🔗 QR & Link</button>
                          <button onClick={()=>viewResults(s.id!)} style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>📊 Results</button>
                          <button onClick={()=>openEdit(s)} style={{background:"#eff6ff",color:"#1d4ed8",border:"1px solid #bfdbfe",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✏️ Edit</button>
                          <button onClick={()=>handleDelete(s.id!)} style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>🗑️</button>
                        </div>
                      </div>
                    </div>
                    {/* Survey URL preview */}
                    <div style={{marginTop:12,background:"#f8fafc",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8,border:"1px solid #e5e7eb"}}>
                      <span style={{fontSize:11,color:"#9ca3af",flexShrink:0}}>🔗</span>
                      <span style={{fontSize:11,color:"#374151",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{surveyUrl}</span>
                      <button onClick={()=>{navigator.clipboard.writeText(surveyUrl);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#1C75BC",fontWeight:600,flexShrink:0}}>Copy</button>
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
                    <option value="popup">Popup only</option>
                    <option value="page">Dedicated page only</option>
                    <option value="both">Both (popup + page)</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Trigger</label>
                  <select value={editing.trigger} onChange={e=>setEditing(x=>x&&{...x,trigger:e.target.value as any})} style={inp}>
                    <option value="immediate">Immediate</option>
                    <option value="delay">After delay</option>
                    <option value="scroll">On 50% scroll</option>
                    <option value="exit_intent">Exit intent</option>
                  </select>
                </div>
                {editing.trigger==="delay"&&(
                  <div><label style={lbl}>Delay (seconds)</label><input type="number" min={0} max={300} value={editing.trigger_delay_seconds} onChange={e=>setEditing(x=>x&&{...x,trigger_delay_seconds:Number(e.target.value)})} style={inp}/></div>
                )}
                <div><label style={lbl}>Start date</label><input type="datetime-local" value={editing.starts_at} onChange={e=>setEditing(x=>x&&{...x,starts_at:e.target.value})} style={inp}/></div>
                <div><label style={lbl}>End date</label><input type="datetime-local" value={editing.ends_at} onChange={e=>setEditing(x=>x&&{...x,ends_at:e.target.value})} style={inp}/></div>
                <div style={{gridColumn:"1/-1"}}><label style={lbl}>Notify email</label><input type="email" value={editing.notify_email} onChange={e=>setEditing(x=>x&&{...x,notify_email:e.target.value})} style={inp} placeholder="admin@trolleys.ae"/></div>
              </div>

              {/* Collect personal info */}
              <div style={{background:"#f8fafc",borderRadius:12,padding:"16px 18px",marginBottom:20,border:"1px solid #e5e7eb"}}>
                <p style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:"#374151"}}>Collect respondent info (optional fields shown to user)</p>
                <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:500,color:"#374151"}}>
                    <input type="checkbox" checked={editing.collect_name} onChange={e=>setEditing(x=>x&&{...x,collect_name:e.target.checked})} style={{width:15,height:15}}/>
                    👤 Ask for name
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:500,color:"#374151"}}>
                    <input type="checkbox" checked={editing.collect_phone} onChange={e=>setEditing(x=>x&&{...x,collect_phone:e.target.checked})} style={{width:15,height:15}}/>
                    📞 Ask for phone number
                  </label>
                </div>
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
                        <input type="checkbox" checked={checked} onChange={e=>setEditing(x=>{if(!x)return x;const branches=e.target.checked?[...(x.branches??[]),b]:(x.branches??[]).filter(br=>br!==b);return{...x,branches};})} style={{width:15,height:15}}/>
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
              {editing.questions.length===0&&<p style={{color:"#9ca3af",fontSize:13,textAlign:"center",padding:"32px 0"}}>No questions yet.</p>}
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
              <button type="button" onClick={()=>{setTab("list");setEditing(null);}} style={{background:"#f3f4f6",color:"#374151",border:"1px solid #e5e7eb",borderRadius:10,padding:"11px 24px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
            </div>
          </form>
        )}

        {/* ══ RESULTS ══ */}
        {tab==="results"&&results&&(()=>{
          const survey    = results.survey;
          const responses = survey.responses??[];
          const branchData = getBranchData(responses);

          return(
            <div>
              {/* KPI cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
                {[
                  {label:"Total Responses", value:responses.length,       icon:"📊", color:"#1C75BC"},
                  {label:"Questions",       value:survey.questions?.length??0, icon:"❓", color:"#8b5cf6"},
                  {label:"Status",          value:surveyStatus(survey).label,  icon:"🔴", color:"#16a34a"},
                  {label:"Completion Rate", value:`${responses.length>0?"100":"0"}%`, icon:"✅", color:"#f59e0b"},
                ].map(({label,value,icon,color})=>(
                  <div key={label} style={{background:"white",borderRadius:14,padding:"18px 20px",border:"1px solid #e5e7eb",borderLeft:`4px solid ${color}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <p style={{margin:"0 0 6px",fontSize:11,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".08em"}}>{label}</p>
                        <p style={{margin:0,fontSize:26,fontWeight:700,color:"#111"}}>{value}</p>
                      </div>
                      <span style={{fontSize:22}}>{icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-tabs */}
              <div style={{display:"flex",borderBottom:"1px solid #e5e7eb",marginBottom:24}}>
                {(["charts","individual"] as const).map(t=>(
                  <button key={t} onClick={()=>setResTab(t)} style={{
                    padding:"9px 20px",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",background:"transparent",
                    borderBottom:resTab===t?"2px solid #16a34a":"2px solid transparent",
                    color:resTab===t?"#16a34a":"#6b7280",marginBottom:-1,
                  }}>
                    {t==="charts"?"📊 Charts & Analytics":"👤 Individual Responses"}
                  </button>
                ))}
              </div>

              {/* ── CHARTS ── */}
              {resTab==="charts"&&(
                responses.length===0?(
                  <div style={{textAlign:"center",padding:"64px 0",color:"#9ca3af"}}>
                    <div style={{fontSize:48,marginBottom:12}}>📭</div>
                    <p style={{fontSize:15}}>No responses yet</p>
                  </div>
                ):(
                  <div>
                    {/* Branch distribution pie */}
                    {branchData.length>1&&(
                      <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:"24px",marginBottom:20}}>
                        <h3 style={{margin:"0 0 20px",fontSize:15,fontWeight:700,color:"#111"}}>Responses by Branch</h3>
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie data={branchData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                              {branchData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Per question charts */}
                    {survey.questions.map((q,i)=>{
                      const answerCount=responses.filter(r=>r.answers.some(a=>a.question_id===q.id)).length;
                      return(
                        <div key={q.id} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:"24px",marginBottom:20}}>
                          <div style={{marginBottom:16}}>
                            <p style={{margin:0,fontSize:15,fontWeight:700,color:"#111"}}>{i+1}. {q.text_en}</p>
                            <p style={{margin:"4px 0 0",fontSize:12,color:"#9ca3af"}}>{Q_LABELS[q.type]} · {answerCount} answers</p>
                          </div>

                          {/* Bar chart for options */}
                          {OPTION_TYPES.includes(q.type)&&(()=>{
                            const data=getBarData(q,responses);
                            const total=data.reduce((s,d)=>s+d.count,0);
                            return(
                              <div>
                                <ResponsiveContainer width="100%" height={Math.max(200,data.length*52)}>
                                  <BarChart data={data} layout="vertical" margin={{top:0,right:60,bottom:0,left:0}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                    <XAxis type="number" tick={{fontSize:12}} allowDecimals={false}/>
                                    <YAxis type="category" dataKey="name" width={160} tick={{fontSize:12}}/>
                                    <Tooltip formatter={(v:any,_:any,p:any)=>[`${v} (${total>0?Math.round(v/total*100):0}%)`,p.payload.fullName||"Count"]}/>
                                    <Bar dataKey="count" radius={[0,6,6,0]}>
                                      {data.map((_,idx)=><Cell key={idx} fill={CHART_COLORS[idx%CHART_COLORS.length]}/>)}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            );
                          })()}

                          {/* Rating / NPS */}
                          {(q.type==="rating"||q.type==="nps")&&(()=>{
                            const stats=getNumericStats(q,responses);
                            if (!stats) return <p style={{color:"#9ca3af",fontSize:13}}>No answers yet</p>;
                            return(
                              <div>
                                <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:20}}>
                                  <span style={{fontSize:48,fontWeight:700,color:"#1C75BC"}}>{stats.avg}</span>
                                  <span style={{fontSize:14,color:"#9ca3af"}}>{q.type==="rating"?"/ 5":"/10"} · {stats.count} responses</span>
                                  {q.type==="rating"&&(
                                    <div style={{display:"flex",gap:2,marginInlineStart:8}}>
                                      {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:22,color:n<=Math.round(Number(stats.avg))?"#F59E0B":"#e2e8f0"}}>★</span>)}
                                    </div>
                                  )}
                                </div>
                                <ResponsiveContainer width="100%" height={160}>
                                  <BarChart data={stats.dist} margin={{top:0,right:20,bottom:0,left:0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="value" tick={{fontSize:12}}/>
                                    <YAxis tick={{fontSize:12}} allowDecimals={false}/>
                                    <Tooltip/>
                                    <Bar dataKey="count" fill="#1C75BC" radius={[4,4,0,0]}/>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            );
                          })()}

                          {/* Text answers */}
                          {(q.type==="text"||q.type==="textarea")&&(()=>{
                            const texts=getTextAnswers(q,responses);
                            if (!texts.length) return <p style={{color:"#9ca3af",fontSize:13}}>No answers yet</p>;
                            return(
                              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                                {texts.slice(0,10).map((t,j)=>(
                                  <div key={j} style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#374151",borderLeft:"3px solid #1C75BC"}}>{t}</div>
                                ))}
                                {texts.length>10&&<p style={{fontSize:12,color:"#9ca3af",margin:0}}>+{texts.length-10} more — export CSV to see all</p>}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* ── INDIVIDUAL ── */}
              {resTab==="individual"&&(
                responses.length===0?(
                  <div style={{textAlign:"center",padding:"64px 0",color:"#9ca3af"}}>
                    <div style={{fontSize:48,marginBottom:12}}>📭</div>
                    <p>No responses yet</p>
                  </div>
                ):(
                  responses.slice().reverse().map((r,ri)=>(
                    <div key={r.id} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:"18px 22px",marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:12,borderBottom:"1px solid #f1f5f9"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:36,height:36,borderRadius:"50%",background:"#eff8ff",color:"#1C75BC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>
                            {responses.length-ri}
                          </div>
                          <div>
                            <p style={{margin:0,fontSize:13,fontWeight:700,color:"#111"}}>
                              {r.respondent_name||`Response #${responses.length-ri}`}
                              {r.respondent_phone&&<span style={{marginInlineStart:8,fontSize:12,color:"#9ca3af",fontWeight:400}}>📞 {r.respondent_phone}</span>}
                            </p>
                            <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>
                              {new Date(r.submitted_at).toLocaleString("en-AE")} · {r.locale.toUpperCase()}
                              {r.respondent_branch&&<span style={{marginInlineStart:8}}>🏪 {r.respondent_branch}</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
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

      {/* QR Modal */}
      {qrSurvey&&(
        <QRModal
          url={`${baseUrl}/en/survey/${qrSurvey.id}`}
          title={qrSurvey.title_en}
          onClose={()=>setQrSurvey(null)}
        />
      )}
    </div>
  );
}