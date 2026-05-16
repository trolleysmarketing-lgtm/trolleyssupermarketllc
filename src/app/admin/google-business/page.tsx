"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period    = "7d" | "30d" | "90d" | "all";
type Sentiment = "all" | "positive" | "neutral" | "negative";
type View      = "overview" | "reviews" | "analytics";

interface Review {
  reviewId: string; author: string; rating: number;
  text: string; time: string; timeMs: number; photo: string;
}
interface Branch {
  placeId: string; name: string; city: string;
  rating: number; totalRatings: number; reviews: Review[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  brand:   "#1C75BC",
  bg:      "#f4f6f9",
  sidebar: "#ffffff",
  card:    "#ffffff",
  border:  "#eaecf0",
  text:    "#111827",
  sub:     "#6b7280",
  muted:   "#9ca3af",
  ok:      "#059669",
  warn:    "#d97706",
  bad:     "#dc2626",
};

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 3 months", "all": "All time",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const short  = (n: string) => n.replace("Trolleys Supermarket LLC – ","").replace("Trolleys - ","");
const sentOf = (r: number) => r >= 4 ? "positive" : r === 3 ? "neutral" : "negative";
const cutoff = (p: Period) => { const D=86400000, n=Date.now(); return p==="7d"?n-7*D:p==="30d"?n-30*D:p==="90d"?n-90*D:0; };
const fmtDate = (ms: number) => ms ? new Date(ms).toLocaleDateString("en-AE",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const clamp   = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Stars({ v, size=13 }: { v: number; size?: number }) {
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i<=Math.round(v) ? "#f59e0b" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function Avatar({ r }: { r: Review }) {
  return r.photo
    ? <img src={r.photo} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${T.border}`}}/>
    : <div style={{width:36,height:36,borderRadius:"50%",background:`${T.brand}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:T.brand,flexShrink:0}}>
        {r.author[0]?.toUpperCase()??"?"}
      </div>;
}

function Spinner() {
  return <>
    <div style={{width:36,height:36,border:`3px solid ${T.border}`,borderTopColor:T.brand,borderRadius:"50%",animation:"gmb-spin .7s linear infinite"}}/>
    <style>{`@keyframes gmb-spin{to{transform:rotate(360deg)}}`}</style>
  </>;
}

function Badge({ v }: { v: number }) {
  const [bg, color, label] =
    v >= 4 ? ["#dcfce7","#15803d","Positive"] :
    v <= 2 ? ["#fee2e2","#dc2626","Negative"] :
             ["#fef9c3","#ca8a04","Neutral"];
  return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:bg,color}}>{label}</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GoogleBusinessPage() {
  const [branches,  setBranches]  = useState<Branch[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [lastFetch, setLastFetch] = useState<Date|null>(null);

  const [view,      setView]      = useState<View>("overview");
  const [selIdx,    setSelIdx]    = useState(0);
  const [period,    setPeriod]    = useState<Period>("30d");
  const [sentiment, setSentiment] = useState<Sentiment>("all");
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true); setError("");
    fetch("/api/gmb/places",{cache:"no-store"})
      .then(r=>r.json())
      .then(d=>{ if(d.error&&!d.branches){setError(d.error);return;} setBranches(d.branches??[]); setLastFetch(new Date()); })
      .catch(()=>setError("Connection error"))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); },[]);

  const branch = branches[selIdx];

  const filtered = useMemo(()=>{
    if(!branch) return [];
    const cut=cutoff(period);
    return branch.reviews.filter(r=>(cut===0||r.timeMs>=cut)&&(sentiment==="all"||sentOf(r.rating)===sentiment));
  },[branch,period,sentiment]);

  const bStats = useMemo(()=>branches.map(b=>{
    const cut=cutoff(period);
    const rs=b.reviews.filter(r=>cut===0||r.timeMs>=cut);
    const pos=rs.filter(r=>r.rating>=4).length;
    const neg=rs.filter(r=>r.rating<=2).length;
    const neu=rs.filter(r=>r.rating===3).length;
    const avg=rs.length?rs.reduce((s,r)=>s+r.rating,0)/rs.length:0;
    return {...b,pr:rs.length,pos,neg,neu,pavg:avg};
  }),[branches,period]);

  const total = useMemo(()=>({
    ratings: branches.reduce((s,b)=>s+b.totalRatings,0),
    avg:     branches.length ? branches.reduce((s,b)=>s+b.rating,0)/branches.length : 0,
    period:  bStats.reduce((s,b)=>s+b.pr,0),
  }),[branches,bStats]);

  const recent = useMemo(()=>
    branches.flatMap(b=>b.reviews.map(r=>({...r,bn:b.name}))).sort((a,b)=>b.timeMs-a.timeMs).slice(0,8),
    [branches]
  );

  const barData = bStats.map(b=>({
    name:   short(b.name).split(" ")[0],
    Rating: parseFloat(b.rating.toFixed(1)),
    Total:  b.totalRatings,
    Period: b.pr,
  }));

  const pieData = [
    {name:"Positive",value:filtered.filter(r=>r.rating>=4).length},
    {name:"Neutral", value:filtered.filter(r=>r.rating===3).length},
    {name:"Negative",value:filtered.filter(r=>r.rating<=2).length},
  ].filter(d=>d.value>0);

  // Month timeline
  const tlData = useMemo(()=>{
    if(!branch) return [];
    const g: Record<string,{pos:number;neg:number;neu:number}> = {};
    branch.reviews.forEach(r=>{
      if(!r.timeMs) return;
      const k=new Date(r.timeMs).toLocaleDateString("en-AE",{month:"short",year:"2-digit"});
      if(!g[k]) g[k]={pos:0,neg:0,neu:0};
      if(r.rating>=4) g[k].pos++; else if(r.rating<=2) g[k].neg++; else g[k].neu++;
    });
    return Object.entries(g).slice(-8).map(([month,v])=>({month,...v}));
  },[branch]);

  // PDF export
  const handleExport = useCallback(async()=>{
    setExporting(true);
    try {
      const res = await fetch("/api/gmb/pdf",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          branches,
          period,
          generatedAt: new Date().toISOString(),
        }),
      });
      const ct = res.headers.get("content-type")??"";
      if(ct.includes("application/pdf")){
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `trolleys-reviews-${new Date().toISOString().split("T")[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: open HTML in new tab for print
        const html = await res.text();
        const tab  = window.open("","_blank");
        if(tab){ tab.document.write(html); tab.document.close(); tab.print(); }
      }
    } catch { alert("Export failed. Please try again."); }
    finally { setExporting(false); }
  },[branches,period]);

  if(loading) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <Spinner/>
      <p style={{fontSize:13,color:T.sub,fontWeight:600}}>Loading reviews…</p>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter',system-ui,-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>

      {/* ── Top bar ── */}
      <header style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:50,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Link href="/admin" style={{fontSize:13,color:T.muted,textDecoration:"none",fontWeight:500,display:"flex",alignItems:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Dashboard
          </Link>
          <span style={{color:T.border,fontSize:18}}>›</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:26,height:26,borderRadius:6,background:`${T.brand}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⭐</div>
            <span style={{fontSize:14,fontWeight:700,color:T.text}}>Google Business Reviews</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {lastFetch&&<span style={{fontSize:11,color:T.muted}}>Updated {lastFetch.toLocaleTimeString("en-AE",{hour:"2-digit",minute:"2-digit"})}</span>}
          <button onClick={handleExport} disabled={exporting}
            style={{display:"flex",alignItems:"center",gap:6,background:T.text,color:"white",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:exporting?"not-allowed":"pointer",opacity:exporting?.7:1,transition:"opacity .15s"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {exporting?"Generating PDF…":"Export PDF"}
          </button>
          <button onClick={load}
            style={{display:"flex",alignItems:"center",gap:6,background:"transparent",color:T.brand,border:`1px solid ${T.brand}`,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Refresh
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── Left sidebar ── */}
        <aside style={{width:256,background:T.sidebar,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>

          {/* Summary mini-stats */}
          <div style={{padding:"20px 18px 14px",borderBottom:`1px solid ${T.border}`}}>
            <p style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Overview</p>
            {[
              {label:"Total Reviews",value:total.ratings.toLocaleString()},
              {label:"Avg. Rating",  value:total.avg?total.avg.toFixed(2)+" ★":"—"},
              {label:"Period Reviews",value:total.period},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:12,color:T.sub}}>{s.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:T.text}}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Branch list */}
          <div style={{padding:"14px 0",flex:1}}>
            <p style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".1em",padding:"0 18px",marginBottom:8}}>Branches</p>
            {branches.map((b,i)=>{
              const bs = bStats[i];
              const active = selIdx===i;
              return (
                <button key={b.placeId} onClick={()=>setSelIdx(i)}
                  style={{width:"100%",textAlign:"left",padding:"10px 18px",border:"none",cursor:"pointer",transition:"background .12s",background:active?`${T.brand}10`:"transparent",borderLeft:`3px solid ${active?T.brand:"transparent"}`,display:"block"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:active?700:500,color:active?T.brand:T.text,lineHeight:1.3}}>{short(b.name)}</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#f59e0b",flexShrink:0,marginLeft:8}}>{b.rating.toFixed(1)}★</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:T.muted}}>{b.city} · {b.totalRatings} reviews</span>
                  </div>
                  {active&&bs&&(
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <span style={{fontSize:10,color:T.ok,fontWeight:600}}>✓ {bs.pos}</span>
                      <span style={{fontSize:10,color:T.bad,fontWeight:600}}>✗ {bs.neg}</span>
                      <span style={{fontSize:10,color:T.warn,fontWeight:600}}>~ {bs.neu}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>

          {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:T.bad,fontWeight:600}}>⚠️ {error}</div>}

          {/* Filter bar */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",flexWrap:"wrap",gap:16,alignItems:"center"}}>
            {/* Period */}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}}>Period</span>
              <div style={{display:"flex",gap:2,background:"#f3f4f6",borderRadius:6,padding:2}}>
                {(["7d","30d","90d","all"] as Period[]).map(p=>(
                  <button key={p} onClick={()=>setPeriod(p)}
                    style={{padding:"4px 12px",borderRadius:5,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .12s",
                      background:period===p?"white":    "transparent",
                      color:     period===p?T.text:     T.muted,
                      boxShadow: period===p?"0 1px 3px rgba(0,0,0,.1)":"none"}}>
                    {p==="7d"?"7d":p==="30d"?"30d":p==="90d"?"90d":"All"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{width:1,height:20,background:T.border}}/>

            {/* Sentiment */}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}}>Sentiment</span>
              <div style={{display:"flex",gap:2,background:"#f3f4f6",borderRadius:6,padding:2}}>
                {(["all","positive","neutral","negative"] as Sentiment[]).map(s=>(
                  <button key={s} onClick={()=>setSentiment(s)}
                    style={{padding:"4px 12px",borderRadius:5,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .12s",
                      background:sentiment===s?"white":   "transparent",
                      color:     sentiment===s?T.text:    T.muted,
                      boxShadow: sentiment===s?"0 1px 3px rgba(0,0,0,.1)":"none"}}>
                    {s.charAt(0).toUpperCase()+s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:T.muted,fontWeight:600}}>{filtered.length} reviews</span>
              <span style={{fontSize:11,color:T.muted}}>· {PERIOD_LABELS[period]}</span>
            </div>
          </div>

          {/* View tabs */}
          <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:24}}>
            {(["overview","reviews","analytics"] as View[]).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{padding:"10px 20px",border:"none",borderBottom:`2px solid ${view===v?T.brand:"transparent"}`,cursor:"pointer",fontSize:13,fontWeight:600,background:"transparent",color:view===v?T.brand:T.sub,transition:"all .15s",marginBottom:-1}}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>

          {/* ══ OVERVIEW ══ */}
          {view==="overview"&&(
            <>
              {/* KPI row */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
                {[
                  {label:"Branches",       value:branches.length,                             icon:"🏪"},
                  {label:"Avg. Rating",    value:total.avg?total.avg.toFixed(2)+" ★":"—",    icon:"⭐"},
                  {label:"Total Reviews",  value:total.ratings.toLocaleString(),              icon:"💬"},
                  {label:"Period Reviews", value:total.period,                                icon:"📊"},
                ].map((k,i)=>(
                  <div key={i} style={{background:T.card,borderRadius:10,padding:"18px 20px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:20,marginBottom:12}}>{k.icon}</div>
                    <div style={{fontSize:22,fontWeight:800,color:T.text,lineHeight:1,marginBottom:4}}>{k.value}</div>
                    <div style={{fontSize:11,color:T.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,marginBottom:20}}>
                {/* Bar - ratings */}
                <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"20px 22px"}}>
                  <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>Branch Ratings</p>
                  <p style={{fontSize:11,color:T.muted,marginBottom:16}}>Overall Google rating</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:11,fill:T.sub}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[0,5]} tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false} width={22}/>
                      <Tooltip contentStyle={{borderRadius:8,border:"none",boxShadow:"0 4px 16px rgba(0,0,0,.1)",fontSize:12}} cursor={{fill:`${T.brand}06`}}/>
                      <Bar dataKey="Rating" fill={T.brand} radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie - sentiment */}
                <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"20px 22px"}}>
                  <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>Sentiment</p>
                  <p style={{fontSize:11,color:T.muted,marginBottom:4}}>{branch?short(branch.name):"—"}</p>
                  {pieData.length>0?(
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="45%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                          {pieData.map((_,i)=><Cell key={i} fill={[T.ok,T.warn,T.bad][i]}/>)}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius:8,border:"none",fontSize:12}}/>
                        <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:11}}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ):(
                    <div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted,fontSize:12}}>No data</div>
                  )}
                </div>
              </div>

              {/* Recent reviews */}
              <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"20px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:T.text}}>Recent Reviews</p>
                    <p style={{fontSize:11,color:T.muted,marginTop:2}}>Latest across all branches</p>
                  </div>
                  <button onClick={()=>setView("reviews")}
                    style={{fontSize:12,fontWeight:600,color:T.brand,background:`${T.brand}10`,border:"none",borderRadius:6,padding:"5px 12px",cursor:"pointer"}}>
                    View all →
                  </button>
                </div>
                {recent.map((r,i)=>(
                  <div key={r.reviewId} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i<recent.length-1?`1px solid #f9fafb`:"none"}}>
                    <Avatar r={r}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:600,color:T.text}}>{r.author}</span>
                        <span style={{fontSize:11,color:T.muted}}>· {short((r as Review&{bn:string}).bn??"")}</span>
                        <Stars v={r.rating} size={11}/>
                        <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>{r.timeMs?fmtDate(r.timeMs):r.time}</span>
                      </div>
                      {r.text&&<p style={{fontSize:12,color:T.sub,lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const}}>{r.text}</p>}
                    </div>
                  </div>
                ))}
                {recent.length===0&&<p style={{color:T.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>No reviews yet — click Refresh.</p>}
              </div>
            </>
          )}

          {/* ══ REVIEWS ══ */}
          {view==="reviews"&&branch&&(
            <div style={{display:"flex",gap:20}}>
              {/* Rating sidebar */}
              <div style={{width:220,flexShrink:0}}>
                <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"20px"}}>
                  <div style={{fontSize:40,fontWeight:800,color:"#f59e0b",lineHeight:1,marginBottom:4}}>{branch.rating.toFixed(1)}</div>
                  <Stars v={branch.rating} size={16}/>
                  <p style={{fontSize:11,color:T.muted,margin:"8px 0 16px"}}>{branch.totalRatings.toLocaleString()} total · {branch.reviews.length} cached</p>
                  {[5,4,3,2,1].map(n=>{
                    const cnt=filtered.filter(r=>r.rating===n).length;
                    const pct=filtered.length?(cnt/filtered.length)*100:0;
                    return (
                      <div key={n} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <span style={{fontSize:11,color:T.sub,width:20,textAlign:"right",flexShrink:0,fontWeight:600}}>{n}★</span>
                        <div style={{flex:1,height:6,background:"#f3f4f6",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:n>=4?T.ok:n===3?T.warn:T.bad,borderRadius:3,transition:"width .5s"}}/>
                        </div>
                        <span style={{fontSize:11,color:T.muted,width:20,textAlign:"right",flexShrink:0}}>{cnt}</span>
                      </div>
                    );
                  })}
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:6}}>
                    {[
                      {l:"Positive",n:filtered.filter(r=>r.rating>=4).length,c:T.ok},
                      {l:"Neutral", n:filtered.filter(r=>r.rating===3).length,c:T.warn},
                      {l:"Negative",n:filtered.filter(r=>r.rating<=2).length,c:T.bad},
                    ].map(s=>(
                      <div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:12,color:T.sub}}>{s.l}</span>
                        <span style={{fontSize:13,fontWeight:700,color:s.c}}>{s.n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                {filtered.length===0?(
                  <div style={{padding:"48px",textAlign:"center",background:T.card,borderRadius:10,border:`1px solid ${T.border}`,color:T.muted}}>
                    <div style={{fontSize:36,marginBottom:10}}>💬</div>
                    <p style={{fontSize:14,fontWeight:600}}>No reviews match this filter</p>
                  </div>
                ):filtered.map(r=>(
                  <div key={r.reviewId} style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,borderLeft:`3px solid ${r.rating>=4?T.ok:r.rating<=2?T.bad:T.warn}`,padding:"16px 18px",transition:"box-shadow .2s"}}
                    onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,.06)")}
                    onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>
                    <div style={{display:"flex",gap:12,marginBottom:r.text?10:0}}>
                      <Avatar r={r}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:13,fontWeight:600,color:T.text}}>{r.author}</span>
                          <Stars v={r.rating} size={12}/>
                          <Badge v={r.rating}/>
                          <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>{r.timeMs?fmtDate(r.timeMs):r.time}</span>
                        </div>
                      </div>
                    </div>
                    {r.text&&<p style={{fontSize:13,color:T.sub,lineHeight:1.65,paddingLeft:48}}>{r.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {view==="analytics"&&(
            <>
              {/* Timeline */}
              <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"20px 22px",marginBottom:16}}>
                <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>Review Timeline</p>
                <p style={{fontSize:11,color:T.muted,marginBottom:16}}>{branch?short(branch.name):"—"} — monthly sentiment</p>
                {tlData.length>0?(
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={tlData} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                      <XAxis dataKey="month" tick={{fontSize:11,fill:T.muted}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false} width={22}/>
                      <Tooltip contentStyle={{borderRadius:8,border:"none",fontSize:12}} cursor={{fill:"#f9fafb"}}/>
                      <Legend wrapperStyle={{fontSize:11}}/>
                      <Bar dataKey="pos" name="Positive" fill={T.ok}   radius={[3,3,0,0]} stackId="s"/>
                      <Bar dataKey="neu" name="Neutral"  fill={T.warn} stackId="s"/>
                      <Bar dataKey="neg" name="Negative" fill={T.bad}  radius={[0,0,3,3]} stackId="s"/>
                    </BarChart>
                  </ResponsiveContainer>
                ):(
                  <div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted,fontSize:12}}>Reviews accumulate over time — check back later.</div>
                )}
              </div>

              {/* Horizontal bars */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                {[
                  {title:"Total Reviews", sub:"All-time count per branch",  key:"Total",  color:`${T.brand}cc`},
                  {title:"Period Reviews",sub:"Count in selected period",   key:"Period", color:`${T.ok}cc`},
                ].map(({title,sub,key,color})=>(
                  <div key={key} style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"20px 22px"}}>
                    <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>{title}</p>
                    <p style={{fontSize:11,color:T.muted,marginBottom:16}}>{sub}</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={barData} layout="vertical" barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                        <XAxis type="number" tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:T.sub}} axisLine={false} tickLine={false} width={52}/>
                        <Tooltip contentStyle={{borderRadius:8,border:"none",fontSize:12}} cursor={{fill:"#f9fafb"}}/>
                        <Bar dataKey={key} fill={color} radius={[0,4,4,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>

              {/* Branch cards grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
                {bStats.map(b=>(
                  <div key={b.placeId} style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"18px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <p style={{fontSize:13,fontWeight:600,color:T.text,lineHeight:1.3}}>{short(b.name)}</p>
                        <p style={{fontSize:11,color:T.muted,marginTop:2}}>{b.city}</p>
                      </div>
                      <span style={{fontSize:18,fontWeight:800,color:"#f59e0b",flexShrink:0,marginLeft:8}}>{b.rating.toFixed(1)}</span>
                    </div>
                    <Stars v={b.rating} size={12}/>
                    <p style={{fontSize:11,color:T.muted,margin:"8px 0"}}>{b.pr} period · {b.totalRatings} total</p>
                    <div style={{height:5,background:"#f3f4f6",borderRadius:99,overflow:"hidden",marginBottom:8}}>
                      {b.pr>0&&(
                        <div style={{display:"flex",height:"100%"}}>
                          <div style={{width:`${(b.pos/b.pr)*100}%`,background:T.ok}}/>
                          <div style={{width:`${(b.neu/b.pr)*100}%`,background:T.warn}}/>
                          <div style={{width:`${(b.neg/b.pr)*100}%`,background:T.bad}}/>
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {[
                        {l:`${b.pos} Pos`,c:T.ok},{l:`${b.neg} Neg`,c:T.bad},{l:`${b.neu} Neu`,c:T.warn}
                      ].map(s=><span key={s.l} style={{fontSize:10,color:s.c,fontWeight:600}}>{s.l}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}