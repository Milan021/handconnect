"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const CONTRACT_TYPES = [
  { v: "CDI", l: "CDI" },
  { v: "CDD", l: "CDD" },
  { v: "alternance", l: "Alternance" },
  { v: "stage", l: "Stage" },
  { v: "interim", l: "Intérim" },
  { v: "mi-temps", l: "Mi-temps" },
  { v: "temps-partiel", l: "Temps partiel" },
];

const SECTORS = [
  { v: "sport", l: "Sport", i: "⚽" },
  { v: "commerce", l: "Commerce", i: "🏪" },
  { v: "btp", l: "BTP", i: "🏗️" },
  { v: "restauration", l: "Restauration", i: "🍽️" },
  { v: "securite", l: "Sécurité", i: "🛡️" },
  { v: "logistique", l: "Logistique", i: "📦" },
  { v: "informatique", l: "Informatique", i: "💻" },
  { v: "sante", l: "Santé", i: "🏥" },
  { v: "education", l: "Éducation", i: "📚" },
  { v: "industrie", l: "Industrie", i: "🏭" },
  { v: "transport", l: "Transport", i: "🚛" },
  { v: "autre", l: "Autre", i: "📋" },
];

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", green: "#10B981", gold: "#FBBF24",
  bg: "#0A0E1A", text: "#F1F5F9", muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)", border: "rgba(255,255,255,0.08)",
};

export default function PublierEmploiPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [contractType, setContractType] = useState("CDI");
  const [sector, setSector] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  const [handballCompatible, setHandballCompatible] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = "/login"; return; }
      setUser(u);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      setProfile(p);
      if (p?.user_type !== "club") { window.location.href = "/dashboard"; return; }
      setLoading(false);
    };
    check();
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) { setError("L'intitulé du poste est requis"); return; }
    if (!company.trim()) { setError("Le nom de l'entreprise est requis"); return; }
    if (!city.trim()) { setError("La ville est requise"); return; }
    if (!description.trim()) { setError("La description est requise"); return; }

    setSubmitting(true);

    const clubName = profile?.club_name || profile?.first_name || "Club";

    const { error: dbErr } = await supabase.from("jobs").insert({
      author_id: user.id,
      club_name: clubName,
      title: title.trim(),
      company: company.trim(),
      city: city.trim(),
      contract_type: contractType,
      sector: sector || null,
      salary_range: salaryRange.trim() || null,
      description: description.trim(),
      handball_compatible: handballCompatible,
      schedule_info: scheduleInfo.trim() || null,
      contact_email: contactEmail.trim() || null,
    });

    if (dbErr) {
      setError(dbErr.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  const inpS = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)",
    color: "#fff", fontSize: 14, outline: "none",
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const lblS = {
    fontSize: 11, color: C.dim, fontWeight: 600,
    letterSpacing: 0.5, display: "block", marginBottom: 6,
    textTransform: "uppercase",
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontFamily: "'DM Sans', sans-serif" }}>
        <link href={FONT_LINK} rel="stylesheet" />
        Chargement...
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
        <link href={FONT_LINK} rel="stylesheet" />
        <div style={{ width: 440, padding: 40, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 24, backdropFilter: "blur(20px)", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", margin: "0 0 8px" }}>OFFRE PUBLIÉE !</h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 24px" }}>
            Votre offre d'emploi est maintenant visible dans l'onglet Emploi. Les joueurs et entraîneurs peuvent la consulter.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dashboard" style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>← Dashboard</Link>
            <button onClick={() => { setSuccess(false); setTitle(""); setCompany(""); setCity(""); setDescription(""); setSalaryRange(""); setScheduleInfo(""); setContactEmail(""); setHandballCompatible(false); setSector(""); }} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.green}, #047857)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Publier une autre</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: 20 }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", bottom: -100, left: -100, pointerEvents: "none" }} />

      <div style={{ width: 520, padding: "36px 32px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 24, backdropFilter: "blur(20px)", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.green}, #047857)`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 8px 32px ${C.green}30`, marginBottom: 14 }}>💼</div>
          <h1 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", margin: "0 0 4px" }}>PUBLIER UNE <span style={{ color: C.green }}>OFFRE D'EMPLOI</span></h1>
          <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>Proposez un emploi partenaire pour attirer des joueurs</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Poste */}
          <div>
            <label style={lblS}>INTITULÉ DU POSTE *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Commercial terrain, Éducateur sportif..." style={inpS} />
          </div>

          {/* Entreprise + Ville */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={lblS}>ENTREPRISE *</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex: Décathlon Montpellier" style={inpS} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lblS}>VILLE *</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Montpellier" style={inpS} />
            </div>
          </div>

          {/* Contrat + Secteur */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={lblS}>TYPE DE CONTRAT</label>
              <select value={contractType} onChange={(e) => setContractType(e.target.value)} style={{ ...inpS, cursor: "pointer" }}>
                {CONTRACT_TYPES.map((ct) => (
                  <option key={ct.v} value={ct.v}>{ct.l}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={lblS}>SECTEUR D'ACTIVITÉ</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)} style={{ ...inpS, cursor: "pointer" }}>
                <option value="">— Choisir —</option>
                {SECTORS.map((s) => (
                  <option key={s.v} value={s.v}>{s.i} {s.l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Salaire */}
          <div>
            <label style={lblS}>RÉMUNÉRATION (optionnel)</label>
            <input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="Ex: 1800€ - 2200€ brut/mois" style={inpS} />
          </div>

          {/* Description */}
          <div>
            <label style={lblS}>DESCRIPTION DU POSTE *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le poste, les missions, le profil recherché..." rows={5} maxLength={2000} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
            <div style={{ textAlign: "right", fontSize: 10, color: C.dim, marginTop: 4 }}>{description.length}/2000</div>
          </div>

          {/* Compatibilité handball */}
          <div>
            <label style={lblS}>COMPATIBILITÉ HANDBALL</label>
            <div onClick={() => setHandballCompatible(!handballCompatible)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: handballCompatible ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${handballCompatible ? "rgba(16,185,129,0.3)" : C.border}`, borderRadius: 12, cursor: "pointer", transition: "all .25s" }}>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: handballCompatible ? C.green : "rgba(255,255,255,0.1)", position: "relative", transition: "background .25s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: handballCompatible ? 20 : 2, transition: "left .25s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>🤾 Emploi compatible avec les entraînements</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{handballCompatible ? "Horaires aménagés pour la pratique" : "Non précisé"}</div>
              </div>
            </div>
          </div>

          {/* Infos horaires */}
          {handballCompatible && (
            <div>
              <label style={lblS}>PRÉCISIONS SUR LES HORAIRES</label>
              <input value={scheduleInfo} onChange={(e) => setScheduleInfo(e.target.value)} placeholder="Ex: Mi-temps, libre pour les entraînements le soir" style={inpS} />
            </div>
          )}

          {/* Email de contact */}
          <div>
            <label style={lblS}>EMAIL DE CONTACT (optionnel)</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="rh@entreprise.fr" style={inpS} />
            <p style={{ fontSize: 10, color: C.dim, marginTop: 4, lineHeight: 1.5 }}>💡 Si renseigné, les candidats pourront postuler directement par email. Sinon, ils passeront par la messagerie Handball Connect.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Link href="/dashboard" style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.dim, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>← Annuler</Link>
            <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: "14px 0", borderRadius: 12, border: "none", background: submitting ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg, ${C.green}, #047857)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1, boxShadow: submitting ? "none" : `0 4px 20px ${C.green}30`, opacity: submitting ? 0.6 : 1, transition: "all 0.3s" }}>{submitting ? "Publication..." : "💼 PUBLIER L'OFFRE"}</button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 20, marginBottom: 0 }}>Handball Connect © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
