import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rzpryrssvdphekjykfqu.supabase.co";

export async function POST(req: Request) {
  try {
    const { annonce_id, applicant_id } = await req.json();
    if (!annonce_id || !applicant_id) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM || "HandballConnect <notifications@handballconnect.fr>";

    if (!serviceKey || !resendKey) {
      console.warn("[notify-application] Env manquantes (SUPABASE_SERVICE_ROLE_KEY ou RESEND_API_KEY) — email skip.");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const admin = createClient(SUPABASE_URL, serviceKey);

    const [{ data: annonce }, { data: applicant }] = await Promise.all([
      admin.from("annonces").select("id, title, type, city, author_id").eq("id", annonce_id).maybeSingle(),
      admin.from("profiles").select("first_name, last_name, position, current_club, age").eq("id", applicant_id).maybeSingle(),
    ]);

    if (!annonce) return NextResponse.json({ error: "annonce not found" }, { status: 404 });

    const { data: owner } = await admin.from("profiles").select("email, first_name").eq("id", annonce.author_id).maybeSingle();
    if (!owner?.email) return NextResponse.json({ ok: true, reason: "no_owner_email" });

    const playerName = `${applicant?.first_name || ""} ${applicant?.last_name || ""}`.trim() || "Un candidat";
    const lines = [
      applicant?.position && `Poste : <strong>${applicant.position}</strong>`,
      applicant?.current_club && `Club actuel : <strong>${applicant.current_club}</strong>`,
      applicant?.age && `Âge : <strong>${applicant.age} ans</strong>`,
    ].filter(Boolean).join("<br/>");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0A0E1A;color:#F1F5F9;border-radius:16px">
        <h1 style="font-size:22px;margin:0 0 8px;color:#fff">🎯 Nouvelle candidature</h1>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 24px">Bonjour ${owner.first_name || ""}, vous avez reçu une candidature pour votre annonce.</p>
        <div style="background:rgba(29,78,216,0.12);border:1px solid rgba(29,78,216,0.3);border-radius:12px;padding:18px;margin-bottom:18px">
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Annonce</div>
          <div style="font-size:16px;font-weight:700;color:#fff">${annonce.title}</div>
          ${annonce.city ? `<div style="font-size:12px;color:#94a3b8;margin-top:4px">📍 ${annonce.city}</div>` : ""}
        </div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;margin-bottom:24px">
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Candidat</div>
          <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:6px">${playerName}</div>
          ${lines ? `<div style="font-size:13px;color:#cbd5e1;line-height:1.7">${lines}</div>` : ""}
        </div>
        <a href="https://handballconnect.fr/dashboard" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#1D4ED8,#1E3A8A);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:13px">Voir la candidature →</a>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0 12px"/>
        <p style="font-size:11px;color:#64748b;margin:0">HandballConnect — Plateforme de mise en relation handball</p>
      </div>
    `;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to: owner.email,
        subject: `🎯 Nouvelle candidature — ${annonce.title}`,
        html,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("[notify-application] Resend error:", errText);
      return NextResponse.json({ error: "email_failed", details: errText }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[notify-application]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
