export async function POST(req) {
  try {
    const { job_id, job_title, company } = await req.json();

    if (!job_id || !job_title) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (!supabaseUrl || !supabaseKey || !resendKey || !resendFrom) {
      return Response.json({ ok: true, email: false, reason: "no_config" });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

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

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [clubEmail],
        subject: `Offre cloturee : ${job_title}`,
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px"><h2 style="color:#1D4ED8">Handball Connection</h2><p>Bonjour,</p><p>Votre offre d'emploi <strong>"${job_title}"</strong> chez <strong>${company}</strong> a bien ete cloturee.</p><p>Elle n'est plus visible sur la plateforme.</p><p style="color:#666;font-size:12px;margin-top:30px">— L'equipe Handball Connection</p></div>`,
      }),
    });

    return Response.json({ ok: true, email: true });
  } catch (err) {
    console.error("notify-job-closed error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}