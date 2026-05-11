import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "surveys.json");

export type QType = "text"|"textarea"|"radio"|"checkbox"|"select"|"rating"|"nps"|"date";
export type SurveyOption   = { id: string; label_en: string; label_ar: string };
export type SurveyQuestion = { id: string; text_en: string; text_ar: string; type: QType; is_required: boolean; options: SurveyOption[] };
export type Survey = {
  id: string;
  title_en: string; title_ar: string;
  description_en: string; description_ar: string;
  display_mode: "popup"|"page"|"both";
  trigger: "immediate"|"scroll"|"exit_intent"|"delay";
  trigger_delay_seconds: number;
  is_active: boolean;
  starts_at: string; ends_at: string;
  notify_email: string;
  collect_name: boolean;
  collect_phone: boolean;
  branches: string[];
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  slug: string;
};
export type SurveyResponse = {
  id: string;
  submitted_at: string;
  locale: string;
  respondent_name?: string;
  respondent_phone?: string;
  respondent_branch?: string;
  answers: { question_id: string; value?: string; selected_option_ids?: string[] }[];
};

async function getData(): Promise<{ surveys: Survey[] }> {
  if (!existsSync(dataPath)) {
    const dir = path.join(process.cwd(), "data");
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(dataPath, JSON.stringify({ surveys: [] }, null, 2));
    return { surveys: [] };
  }
  return JSON.parse(await readFile(dataPath, "utf-8"));
}

async function saveData(data: { surveys: Survey[] }) {
  await writeFile(dataPath, JSON.stringify(data, null, 2));
}

function isAuthorized(req: NextRequest): boolean {
  return req.cookies.get("admin_token")?.value === process.env.ADMIN_SECRET;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── GET ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const data = await getData();

  // Public: active survey for widget (?active=1) or specific survey (?active=1&survey_id=xxx)
  if (searchParams.get("active") === "1") {
    const now       = new Date();
    const surveyId  = searchParams.get("survey_id");

    let survey: Survey | undefined;

    if (surveyId) {
      // Specific survey by ID (for page mode)
      survey = data.surveys.find(s => s.id === surveyId && s.is_active);
    } else {
      // Most recent active survey (for popup widget)
      survey = [...data.surveys].reverse().find(s => s.is_active);
    }

    if (!survey) return NextResponse.json({ survey: null });

    const started = !survey.starts_at || new Date(survey.starts_at) <= now;
    const ended   = survey.ends_at ? new Date(survey.ends_at) < now : false;

    const { responses: _r, ...pub } = survey;
    return NextResponse.json({ survey: pub, started, ended });
  }

  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin: single survey with results
  const id = searchParams.get("id");
  if (id && searchParams.get("results") === "1") {
    const survey = data.surveys.find(s => s.id === id);
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ survey });
  }

  // Admin: list (without responses to keep payload small)
  return NextResponse.json({
    surveys: data.surveys.map(({ responses, ...s }) => ({
      ...s,
      response_count: responses?.length ?? 0,
    })),
  });
}

// ── POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const data = await getData();

  // Public: submit response
  const respondId = searchParams.get("respond");
  if (respondId) {
    const survey = data.surveys.find(s => s.id === respondId);
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const response: SurveyResponse = {
      id:                uid(),
      submitted_at:      new Date().toISOString(),
      locale:            body.locale ?? "en",
      respondent_name:   body.respondent_name,
      respondent_phone:  body.respondent_phone,
      respondent_branch: body.respondent_branch,
      answers:           body.answers ?? [],
    };

    if (!survey.responses) survey.responses = [];
    survey.responses.push(response);
    await saveData(data);

    // Email notification
    if (survey.notify_email && process.env.SMTP_HOST) {
      try {
        const nodemailer = await import("nodemailer");
        const transport  = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transport.sendMail({
          from:    process.env.SMTP_FROM ?? process.env.SMTP_USER,
          to:      survey.notify_email,
          subject: `New survey response — ${survey.title_en}`,
          text:    `New response received.\n\nName: ${response.respondent_name ?? "—"}\nPhone: ${response.respondent_phone ?? "—"}\nBranch: ${response.respondent_branch ?? "—"}\n\nTotal responses: ${survey.responses.length}`,
        });
      } catch { /* email is optional */ }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  }

  // Admin: create survey
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const survey: Survey = {
    ...body,
    id:        uid(),
    slug:      toSlug(body.title_en || "survey"),
    responses: [],
    collect_name:  body.collect_name  ?? false,
    collect_phone: body.collect_phone ?? false,
    branches:  body.branches ?? [],
    questions: (body.questions ?? []).map((q: any) => ({
      ...q,
      id:      q.id ?? uid(),
      options: (q.options ?? []).map((o: any) => ({ ...o, id: o.id ?? uid() })),
    })),
  };

  data.surveys.push(survey);
  await saveData(data);
  return NextResponse.json({ success: true, id: survey.id, slug: survey.slug }, { status: 201 });
}

// ── PUT ───────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await getData();
  const idx  = data.surveys.findIndex(s => s.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const responses = data.surveys[idx].responses;
  data.surveys[idx] = {
    ...body,
    slug:      body.slug || toSlug(body.title_en || "survey"),
    responses,
    collect_name:  body.collect_name  ?? false,
    collect_phone: body.collect_phone ?? false,
    questions: (body.questions ?? []).map((q: any) => ({
      ...q,
      id:      q.id ?? uid(),
      options: (q.options ?? []).map((o: any) => ({ ...o, id: o.id ?? uid() })),
    })),
  };
  await saveData(data);
  return NextResponse.json({ success: true });
}

// ── DELETE ────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const data = await getData();
  data.surveys = data.surveys.filter(s => s.id !== id);
  await saveData(data);
  return NextResponse.json({ success: true });
}