"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", accentLight: "#F87171",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)", bgHover: "rgba(255,255,255,0.07)",
  surface: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", gold: "#FBBF24",
};

export default function BetaPage() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    type: "joueur", // joueur | entreprise
    current_club: "", current_league: "",
    company_name: "", company_sector: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr("");
    if (!form.first_name || !form.last_name || !form.email) {
      setErr("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("beta_signups").insert({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      type: form.type,
      current_club: form.current_club || null,
      current_league: form.current_league || null,
      company_name: form.company_name || null,
      company_sector: form.company_sector || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    setSubmitted(true);
  };

  const inpS = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const lblS = { fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤾</div>
          <h1 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
        </Link>
      </header>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 80px" }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "60px 32px", background: C.bgCard, borderRadius: 24, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 12px" }}>BIENVENUE DANS LA BÊTA</h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "0 0 24px" }}>
              Merci pour votre inscription ! Nous vous recontacterons très prochainement avec vos accès.
            </p>
            <Link href="/" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: `${C.gold}12`, border: `1px solid ${C.gold}25`, borderRadius: 20, marginBottom: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold, boxShadow: `0 0 8px ${C.gold}` }} />
                <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>Beta fermée — Places limitées</span>
              </div>
              <h2 style={{ fontSize: 36, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 12px" }}>
                DEVENEZ <span style={{ color: C.primary }}>BÊTA TESTEUR</span>
              </h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                Handball Connect ouvre sa plateforme de reconversion en beta. <br />
                Inscrivez-vous pour tester en avant-première et nous aider à construire le meilleur outil.
              </p>
            </div>

            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
              {/* Type toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4 }}>
                {[
                  { key: "joueur", label: "🤾 Handballeur pro", desc: "Je cherche une reconversion" },
                  { key: "entreprise", label: "🏢 Entreprise", desc: "Je veux recruter des talents" },
                ].map(t => (
                  <button key={t.key} onClick={() => upd("type", t.key)} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "none", background: form.type === t.key ? `${C.primary}15` : "transparent", color: form.type === t.key ? C.primaryLight : C.dim, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                    <div>{t.label}</div>
                    <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{t.desc}</div>
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div><label style={lblS}>Prénom *</label><input value={form.first_name} onChange={e => upd("first_name", e.target.value)} style={inpS} /></div>
                <div><label style={lblS}>Nom *</label><input value={form.last_name} onChange={e => upd("last_name", e.target.value)} style={inpS} /></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={lblS}>Email *</label>
                <input type="email" value={form.email} onChange={e => upd("email", e.target.value)} style={inpS} />
              </div>

              {form.type === "joueur" ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <div><label style={lblS}>Club actuel</label><input value={form.current_club} onChange={e => upd("current_club", e.target.value)} placeholder="Ex: PSG Handball" style={inpS} /></div>
                    <div><label style={lblS}>Championnat</label><select value={form.current_league} onChange={e => upd("current_league", e.target.value)} style={{ ...inpS, cursor: "pointer" }}><option value="">—</option><option value="lnh">LNH</option><option value="proligue">Proligue</option><option value="starligue">Starligue</option><option value="d1f">D1 Féminine</option><option value="d2f">D2 Féminine</option><option value="d2m">D2 Masculine</option></select></div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <div><label style={lblS}>Nom de l'entreprise</label><input value={form.company_name} onChange={e => upd("company_name", e.target.value)} style={inpS} /></div>
                    <div><label style={lblS}>Secteur</label><select value={form.company_sector} onChange={e => upd("company_sector", e.target.value)} style={{ ...inpS, cursor: "pointer" }}><option value="">—</option><option value="securite">Sécurité</option><option value="logistique">Logistique</option><option value="btp">BTP</option><option value="commerce">Commerce</option><option value="sante">Santé</option><option value="evenementiel">Événementiel</option><option value="informatique">Informatique</option><option value="industrie">Industrie</option><option value="education">Éducation</option><option value="autre">Autre</option></select></div>
                  </div>
                </>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={lblS}>Message (optionnel)</label>
                <textarea value={form.message} onChange={e => upd("message", e.target.value)} placeholder="Parlez-nous de votre projet, vos attentes, vos idées..." rows={3} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
              </div>

              {err && <div style={{ padding: "12px 16px", background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 10, color: C.accent, fontSize: 12, marginBottom: 16 }}>{err}</div>}

              <button onClick={submit} disabled={submitting} style={{ width: "100%", padding: "14px 0", border: "none", borderRadius: 12, background: submitting ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "wait" : "pointer", boxShadow: submitting ? "none" : `0 6px 20px ${C.primary}30` }}>
                {submitting ? "Envoi..." : "Rejoindre la beta"}
              </button>

              <p style={{ fontSize: 11, color: C.dim, textAlign: "center", marginTop: 14 }}>
                En vous inscrivant, vous acceptez d'être contacté par l'équipe Handball Connect.
              </p>
            </div>
          </>
        )}
      </main>

      <footer style={{ padding: "32px 24px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", margin: 0 }}>Handball Connect © {new Date().getFullYear()} — Tous droits réservés</p>
      </footer>
    </div>
  );
}
