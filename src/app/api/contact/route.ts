import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

   const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

    await transporter.sendMail({
      from: `"Trolleys Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafb;border-radius:12px;">
          <div style="background:#0e76bc;padding:20px 24px;border-radius:8px;margin-bottom:24px;">
            <h2 style="color:white;margin:0;font-size:18px;">New Contact Form Submission</h2>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">trolleyssupermarketllc.com</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:12px;color:#94a3b8;width:100px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:14px;font-weight:600;color:#0f172a;">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:12px;color:#94a3b8;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:14px;color:#0e76bc;">${email}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:12px;color:#94a3b8;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:14px;color:#0f172a;">${phone || "—"}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:12px;color:#94a3b8;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #e2edf5;font-size:14px;font-weight:600;color:#0f172a;">${subject}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:white;border-radius:8px;border:1px solid #e2edf5;">
            <p style="font-size:12px;color:#94a3b8;margin:0 0 8px;">Message</p>
            <p style="font-size:14px;color:#475569;line-height:1.7;margin:0;">${message.replace(/\n/g, "<br/>")}</p>
          </div>
          <p style="font-size:11px;color:#94a3b8;margin-top:20px;text-align:center;">Trolleys Supermarket LLC — trolleyssupermarketllc.com</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact email error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}