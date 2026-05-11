"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const USER_TYPES = [
  { key: "joueur", label: "Joueur", icon: "🤾", color: "#FF6B35", description: "Créez votre profil, montrez vos stats et trouvez votre prochain club." },
  { key: "club", label: "Club", icon: "🏟️", color: "#3B82F6", description: "Publiez vos annonces et recrutez les meilleurs talents du handball." },
  { key: "entraineur", label: "Entraîneur", icon: "🎯", color: "#8B5CF6", description: "Valorisez votre parcours et trouvez votre prochain poste d'entraîneur." },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const selectedType = USER_TYPES.find((t) => t.key === userType);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères"); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name: firstName, last_name: lastName, user_type: userType } },
    });
    if (authError) {
      setError(authError.message.includes("already registered") ? "Cet email est déjà utilisé." : authError.message);
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: 20 }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", bottom: -100, left: -100, pointerEvents: "none" }} />
      <div style={{ width: step === 1 ? 520 : 420, padding: step === 1 ? "36px 32px" : 40, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, backdropFilter: "blur(20px)", position: "relative", zIndex: 1, transition: "width 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 32px rgba(255,107,53,0.3)", marginBottom: 14 }}>🤾</div>
          <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", margin: "0 0 4px" }}>HAND<span style={{ color: "#FF6B35" }}>CONNECT</span></h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>{step === 1 ? "Choisissez votre profil pour commencer" : `Inscription ${selectedType?.label}`}</p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {[1, 2].map((s) => (<div key={s} style={{ width: s === step ? 32 : 10, height: 4, borderRadius: 4, background: s === step ? "#FF6B35" : s < step ? "#10B981" : "rgba(255,255,255,0.1)", transition: "all 0.3s ease" }} />))}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {USER_TYPES.map((type) => (
              <button key={type.key} onClick={() => { setUserType(type.key); setStep(2); }}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, border: `1px solid ${type.color}25`, background: "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${type.color}10`; e.currentTarget.style.borderColor = `${type.color}50`; e.currentTarget.style.transform = "translateX(6px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = `${type.color}25`; e.currentTarget.style.transform = ""; }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${type.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `1px solid ${type.color}25` }}>{type.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{type.description}</div>
                </div>
                <span style={{ fontSize: 18, color: type.color, opacity: 0.5 }}>→</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: `${selectedType.color}10`, border: `1px solid ${selectedType.color}25`, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{selectedType.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: selectedType.color }}>{selectedType.label}</span>
              <button onClick={() => { setStep(1); setError(""); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>Changer</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>PRÉNOM</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>NOM</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>MOT DE PASSE</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 caractères" style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14, padding: 0 }}>{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>CONFIRMER LE MOT DE PASSE</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Retapez votre mot de passe" onKeyDown={(e) => { if (e.key === "Enter") handleRegister(e); }} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
            </div>
            {error && (<div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}><span>⚠️</span> {error}</div>)}
            <button onClick={handleRegister} disabled={loading || !email || !password || !firstName || !lastName} style={{ padding: "14px 20px", borderRadius: 12, border: "none", background: loading || !email || !password ? "rgba(255,107,53,0.2)" : "linear-gradient(135deg, #FF6B35, #C13C00)", color: loading || !email || !password ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1, transition: "all 0.3s", boxShadow: loading || !email || !password ? "none" : "0 4px 20px rgba(255,107,53,0.3)", marginTop: 4 }}>{loading ? "Création du compte..." : "CRÉER MON COMPTE"}</button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Déjà un compte ? <Link href="/login" style={{ color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>Se connecter</Link></p>
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 16, marginBottom: 0 }}>Hand Connect © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
