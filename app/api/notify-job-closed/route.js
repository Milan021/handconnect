import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { job_id, job_title, company } = await req.json();

    if (!job_id || !job_title) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // Trouver tous les candidats qui ont postulé à cette offre via la messagerie/connections
    // Pour l'instant on notifie le club lui-même (confirmation de clôture)
    // Et on pourra ajouter les candidats quand le système de candidatures emploi sera en place

    // Envoyer un email de confirmation au club (via Resend si configuré)
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (!resendKey || !resendFrom) {
      // Pas de config email — on skip silencieusement
      return Response.json({ ok: true, email: false, reason: "no_email_config" });
    }

    // Récupérer l'email du club (auteur de l'offre)
    const { data: job } = await supabaseAdmin
      .from("jobs")
      .select("author_id")
      .eq("id", job_id)
      .single();

    if (!job) {
      return Response.json({ ok: true, email: false, reason: "job_not_found" });
    }

    const { data: author } = await supabaseAdmin.auth.admin.getUserById(job.author_id);
    const clubEmail = author?.user?.email;

    if (!clubEmail) {
      return Response.json({ ok: true, email: false, reason: "no_club_email" });
    }

    // Envoyer l'email de confirmation de clôture
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [clubEmail],
        subject: `✅ Offre clôturée : ${job_title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1D4ED8;">HandConnect</h2>
            <p>Bonjour,</p>
            <p>Votre offre d'emploi <strong>"${job_title}"</strong> chez <strong>${company}</strong> a bien été clôturée.</p>
            <p>Elle n'est plus visible sur la plateforme.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">— L'équipe HandConnect</p>
          </div>
        `,
      }),
    });

    return Response.json({ ok: true, email: true });
  } catch (err) {
    console.error("notify-job-closed error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
