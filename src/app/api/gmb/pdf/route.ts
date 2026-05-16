// src/app/api/gmb/pdf/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export const dynamic     = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const body                        = await req.json();
  const { branches, period, generatedAt } = body;

  const html = buildReportHTML({ branches, period, generatedAt });

  try {
    // Dynamic import to avoid build errors if packages missing
    const puppeteer = await import("puppeteer-core" as any).catch(() => null) as any;
    const chromium  = await import("@sparticuz/chromium" as any).catch(() => null) as any;

    if (puppeteer && chromium) {
      const executablePath = await chromium.default.executablePath();
      const browser = await puppeteer.default.launch({
        args:            chromium.default.args as string[],
        defaultViewport: chromium.default.defaultViewport as any,
        executablePath,
        headless:        true as any,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdf = await page.pdf({
        format:          "A4",
        landscape:       false,
        printBackground: true,
        margin:          { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
      });

      await browser.close();

      return new NextResponse(new Uint8Array(pdf as Buffer), {
        headers: {
          "Content-Type":        "application/pdf",
          "Content-Disposition": `attachment; filename="trolleys-reviews-${generatedAt ?? "report"}.pdf"`,
        },
      });
    }
  } catch {
    // Fall through to HTML fallback
  }

  // Fallback: return HTML (client opens in new tab + prints)
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildReportHTML({ branches, period, generatedAt }: {
  branches:    any[];
  period:      string;
  generatedAt: string;
}) {
  const PERIOD: Record<string, string> = {
    "7d": "Last 7 Days", "30d": "Last 30 Days",
    "90d": "Last 3 Months", "all": "All Time",
  };

  const short  = (n: string) => n.replace("Trolleys Supermarket LLC – ", "").replace("Trolleys - ", "");
  const stars  = (v: number) => [1,2,3,4,5].map(i => `<span style="color:${i<=Math.round(v)?"#f59e0b":"#e5e7eb"}">★</span>`).join("");
  const fmtDt  = (iso: string) => new Date(iso).toLocaleDateString("en-AE", { day:"2-digit", month:"long", year:"numeric" });

  const totalRatings = branches.reduce((s: number, b: any) => s + (b.totalRatings ?? 0), 0);
  const avgRating    = branches.length ? branches.reduce((s: number, b: any) => s + (b.rating ?? 0), 0) / branches.length : 0;
  const totalCached  = branches.reduce((s: number, b: any) => s + (b.reviews?.length ?? 0), 0);

  const branchRows = branches.map((b: any) => {
    const rs     = b.reviews ?? [];
    const pos    = rs.filter((r: any) => r.rating >= 4).length;
    const neg    = rs.filter((r: any) => r.rating <= 2).length;
    const neu    = rs.filter((r: any) => r.rating === 3).length;
    const posRate = rs.length ? Math.round((pos / rs.length) * 100) : 0;
    return `
      <tr>
        <td class="td fw6 dark">${short(b.name)}</td>
        <td class="td muted">${b.city}</td>
        <td class="td">${stars(b.rating)} <b>${b.rating.toFixed(1)}</b></td>
        <td class="td center">${(b.totalRatings ?? 0).toLocaleString()}</td>
        <td class="td center">${rs.length}</td>
        <td class="td center ok fw7">${pos}</td>
        <td class="td center bad fw7">${neg}</td>
        <td class="td center warn fw7">${neu}</td>
        <td class="td center">
          <div style="background:#f3f4f6;border-radius:99px;height:5px;overflow:hidden;width:60px;margin:0 auto 3px">
            <div style="background:#059669;height:100%;width:${posRate}%"></div>
          </div>
          <span class="muted" style="font-size:10px">${posRate}%</span>
        </td>
      </tr>`;
  }).join("");

  const recentBlocks = branches.map((b: any) => {
    const reviews = (b.reviews ?? []).slice(0, 3).map((r: any) => `
      <div style="padding:10px 0;border-bottom:1px solid #f9fafb">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
          <div style="width:30px;height:30px;border-radius:50%;background:#e8f4fd;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#1C75BC;flex-shrink:0">${(r.author??"?")[0]?.toUpperCase()}</div>
          <div style="flex:1">
            <span style="font-size:12px;font-weight:600;color:#111827">${r.author}</span>
            <span style="font-size:11px;margin-left:8px">${stars(r.rating)}</span>
            <span style="font-size:10px;font-weight:700;margin-left:8px;padding:1px 7px;border-radius:99px;background:${r.rating>=4?"#dcfce7":r.rating<=2?"#fee2e2":"#fef9c3"};color:${r.rating>=4?"#15803d":r.rating<=2?"#dc2626":"#ca8a04"}">${r.rating>=4?"Positive":r.rating<=2?"Negative":"Neutral"}</span>
          </div>
          <span style="font-size:10px;color:#9ca3af;flex-shrink:0">${r.time ?? ""}</span>
        </div>
        ${r.text ? `<p style="font-size:11px;color:#6b7280;line-height:1.6;margin:0;padding-left:40px">${String(r.text).slice(0,220)}${r.text.length>220?"…":""}</p>` : ""}
      </div>`).join("");

    return `
      <div style="background:white;border-radius:10px;border:1px solid #eaecf0;padding:16px 18px;margin-bottom:14px;break-inside:avoid">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #f3f4f6">
          <h3 style="font-size:13px;font-weight:700;color:#111827;margin:0">${short(b.name)}</h3>
          <span style="font-size:11px;color:#9ca3af">${b.city}</span>
          <span style="margin-left:auto;font-size:16px;font-weight:800;color:#f59e0b">${b.rating.toFixed(1)} ★</span>
          <span style="font-size:11px;color:#6b7280">${(b.totalRatings??0).toLocaleString()} reviews</span>
        </div>
        ${reviews || '<p style="font-size:12px;color:#9ca3af;padding:8px 0">No reviews cached yet</p>'}
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Trolleys — Google Reviews Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f6f9;color:#374151;font-size:13px;line-height:1.5}
  .td{padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:12px}
  .fw6{font-weight:600}.fw7{font-weight:700}.dark{color:#111827}
  .muted{color:#9ca3af}.ok{color:#059669}.bad{color:#dc2626}.warn{color:#d97706}
  .center{text-align:center}
  @media print{body{background:white}@page{margin:10mm;size:A4}}
</style>
</head>
<body>

<!-- Header -->
<div style="background:linear-gradient(135deg,#1C75BC 0%,#1557a0 100%);color:white;padding:36px 44px 28px">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <p style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.75;margin-bottom:8px">Trolleys Supermarket LLC</p>
      <h1 style="font-size:26px;font-weight:800;letter-spacing:-.3px;margin-bottom:6px">Google Business Reviews</h1>
      <p style="font-size:13px;opacity:.8">${PERIOD[period] ?? period} · Generated ${fmtDt(generatedAt)}</p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
    ${[
      {icon:"🏪",label:"Branches",     value:branches.length},
      {icon:"⭐",label:"Avg. Rating",  value:avgRating.toFixed(2)+" ★"},
      {icon:"💬",label:"Total Reviews",value:totalRatings.toLocaleString()},
      {icon:"📊",label:"Cached",       value:totalCached},
    ].map(k=>`
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:14px 16px">
        <div style="font-size:18px;margin-bottom:8px">${k.icon}</div>
        <div style="font-size:20px;font-weight:800;margin-bottom:3px">${k.value}</div>
        <div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.8">${k.label}</div>
      </div>`).join("")}
  </div>
</div>

<!-- Content -->
<div style="padding:28px 44px">

  <!-- Branch table -->
  <h2 style="font-size:14px;font-weight:700;color:#111827;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #eaecf0">Branch Summary</h2>
  <div style="background:white;border-radius:10px;border:1px solid #eaecf0;overflow:hidden;margin-bottom:28px">
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f9fafb">
          ${["Branch","City","Rating","Total","Cached","Positive","Negative","Neutral","Pos Rate"].map(h=>
            `<th style="padding:9px 14px;text-align:left;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap">${h}</th>`
          ).join("")}
        </tr>
      </thead>
      <tbody>${branchRows}</tbody>
    </table>
  </div>

  <!-- Reviews -->
  <h2 style="font-size:14px;font-weight:700;color:#111827;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #eaecf0">Recent Reviews by Branch</h2>
  ${recentBlocks}

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:14px;border-top:1px solid #eaecf0;display:flex;justify-content:space-between">
    <span style="font-size:10px;color:#9ca3af">Trolleys Supermarket LLC · Confidential</span>
    <span style="font-size:10px;color:#9ca3af">Generated ${new Date(generatedAt).toLocaleString("en-AE")}</span>
  </div>
</div>

</body>
</html>`;
}