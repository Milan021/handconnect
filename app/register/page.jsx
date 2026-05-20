"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { SECTORS } from "../../lib/sectors";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", accentLight: "#F87171",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", gold: "#FBBF24", orange: "#FF6B35",
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "entreprise" || type === "joueur_pro") {
      setUserType(type);
      setStep(2);
    }
  }, [searchParams]);

  const selectType = (type) => {
    setUserType(type);
    setStep(2);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: step === 1 ? 540 : 460, padding: "32px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, backdropFilter: "blur(20px)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>🤾</div>
          <h1 style={{ fontSize: 26, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", margin: "0 0 6px" }}>HANDBALL <span style={{ color: C.primary }}>CONNECT</span></h1>
          <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>{step === 1 ? "Je suis..." : `Inscription ${userType === "joueur_pro" ? "handballeur pro" : "entreprise"}`}</p>
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => selectType("joueur_pro")} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px", borderRadius: 16, border: `1px solid ${C.primary}25`, background: "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.primary}10`; e.currentTarget.style.borderColor = `${C.primary}50`; e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = `${C.primary}25`; e.currentTarget.style.transform = ""; }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, border: `1px solid ${C.primary}25` }}>🤾</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Handballeur professionnel</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Je prépare ma reconversion et je cherche un emploi</div>
              </div>
              <span style={{ fontSize: 18, color: C.primary, opacity: 0.5 }}>→</span>
            </button>

            <button onClick={() => selectType("entreprise")} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px", borderRadius: 16, border: `1px solid ${C.accent}25`, background: "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.accent}10`; e.currentTarget.style.borderColor = `${C.accent}50`; e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = `${C.accent}25`; e.currentTarget.style.transform = ""; }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, border: `1px solid ${C.accent}25` }}>🏢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Entreprise</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Je recrute des anciens handballeurs pros</div>
              </div>
              <span style={{ fontSize: 18, color: C.accent, opacity: 0.5 }}>→</span>
            </button>
          </div>
        )}

        {step === 2 && userType === "joueur_pro" && (
          <JoueurProForm onBack={() => setStep(1)} />
        )}

        {step === 2 && userType === "entreprise" && (
          <EntrepriseForm onBack={() => setStep(1)} />
        )}

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p style={{ fontSize: 12, color: C.dim }}>Déjà un compte ? <Link href="/login" style={{ color: C.primaryLight, fontWeight: 600, textDecoration: "none" }}>Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}

/* ═══════ FORMULAIRE JOUEUR PRO ═══════ */
function JoueurProForm({ onBack }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", current_league: "", contract_end_date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères"); return; }
    if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName, user_type: "joueur_pro" } },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").update({
        first_name: form.firstName,
        last_name: form.lastName,
        user_type: "joueur_pro",
        is_pro: true,
        current_league: form.current_league || null,
        contract_end_date: form.contract_end_date || null,
        searching_job: true,
      }).eq("id", data.user.id);
    }

    setLoading(false);
    window.location.href = "/pro";
  };

  const inp = { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const lbl = { fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button type="button" onClick={onBack} style={{ alignSelf: "flex-start", background: "none", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", marginBottom: 4 }}>← Retour</button>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Prénom</label><input value={form.firstName} onChange={e => upd("firstName", e.target.value)} required style={inp} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Nom</label><input value={form.lastName} onChange={e => upd("lastName", e.target.value)} required style={inp} /></div>
      </div>
      <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={e => upd("email", e.target.value)} required style={inp} /></div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Ligue actuelle</label>
          <select value={form.current_league} onChange={e => upd("current_league", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            <option value="">—</option><option value="lnh">LNH</option><option value="proligue">Proligue</option><option value="starligue">Starligue</option><option value="d1f">D1 Féminine</option><option value="d2f">D2 Féminine</option><option value="d2m">D2 Masculine</option>
          </select>
        </div>
        <div style={{ flex: 1 }}><label style={lbl}>Fin de contrat</label><input type="date" value={form.contract_end_date} onChange={e => upd("contract_end_date", e.target.value)} style={inp} /></div>
      </div>
      <div>
        <label style={lbl}>Mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => upd("password", e.target.value)} required placeholder="Minimum 6 caractères" style={{ ...inp, paddingRight: 60 }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.dim, fontSize: 11, cursor: "pointer" }}>{showPassword ? "Masquer" : "Voir"}</button>
        </div>
      </div>
      <div><label style={lbl}>Confirmer le mot de passe</label><input type="password" value={form.confirmPassword} onChange={e => upd("confirmPassword", e.target.value)} required style={inp} /></div>
      {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 12 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ padding: "14px", borderRadius: 12, border: "none", background: loading ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: loading ? C.dim : "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>{loading ? "Création..." : "Créer mon compte"}</button>
    </form>
  );
}

/* ═══════ FORMULAIRE ENTREPRISE ═══════ */
function EntrepriseForm({ onBack }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", companyName: "", companySector: "", companyCity: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères"); return; }
    if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName, user_type: "entreprise" } },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").update({
        first_name: form.firstName,
        last_name: form.lastName,
        user_type: "entreprise",
      }).eq("id", data.user.id);

      await supabase.from("companies").insert({
        owner_id: data.user.id,
        name: form.companyName,
        sector: form.companySector,
        city: form.companyCity,
      });
    }

    setLoading(false);
    window.location.href = "/entreprise";
  };

  const inp = { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const lbl = { fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button type="button" onClick={onBack} style={{ alignSelf: "flex-start", background: "none", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", marginBottom: 4 }}>← Retour</button>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Prénom</label><input value={form.firstName} onChange={e => upd("firstName", e.target.value)} required style={inp} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Nom</label><input value={form.lastName} onChange={e => upd("lastName", e.target.value)} required style={inp} /></div>
      </div>
      <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={e => upd("email", e.target.value)} required style={inp} /></div>
      <div><label style={lbl}>Nom de l'entreprise</label><input value={form.companyName} onChange={e => upd("companyName", e.target.value)} required style={inp} /></div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Secteur</label>
          <select value={form.companySector} onChange={e => upd("companySector", e.target.value)} required style={{ ...inp, cursor: "pointer" }}>
            <option value="">—</option>
            {SECTORS.filter(s => s.id !== "autre").map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}><label style={lbl}>Ville</label><input value={form.companyCity} onChange={e => upd("companyCity", e.target.value)} required style={inp} /></div>
      </div>
      <div>
        <label style={lbl}>Mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => upd("password", e.target.value)} required placeholder="Minimum 6 caractères" style={{ ...inp, paddingRight: 60 }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.dim, fontSize: 11, cursor: "pointer" }}>{showPassword ? "Masquer" : "Voir"}</button>
        </div>
      </div>
      <div><label style={lbl}>Confirmer le mot de passe</label><input type="password" value={form.confirmPassword} onChange={e => upd("confirmPassword", e.target.value)} required style={inp} /></div>
      {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 12 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ padding: "14px", borderRadius: 12, border: "none", background: loading ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${C.accent}, #991B1B)`, color: loading ? C.dim : "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>{loading ? "Création..." : "Créer le compte entreprise"}</button>
    </form>
  );
}
