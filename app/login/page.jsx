"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : authError.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role === "admin") { window.location.href = "/agents"; }
    else { window.location.href = "/dashboard"; }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)", bottom: -100, left: -100, pointerEvents: "none" }} />
      <div style={{ width: 400, padding: 40, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, backdropFilter: "blur(20px)", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 8px 32px rgba(255,107,53,0.3)", marginBottom: 16 }}>🤾</div>
          <h1 style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", margin: "0 0 4px" }}>HANDBALL<span style={{ color: "#FF6B35" }}>CONNECT</span></h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Connectez-vous à votre espace</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>EMAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: error ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>MOT DE PASSE</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" onKeyDown={(e) => { if (e.key === "Enter") handleLogin(e); }} style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: error ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: 0 }}>{showPassword ? "🙈" : "👁️"}</button>
            </div>
          </div>
          {error && (<div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}><span>⚠️</span> {error}</div>)}
          <button onClick={handleLogin} disabled={loading || !email || !password} style={{ padding: "14px 20px", borderRadius: 12, border: "none", background: loading || !email || !password ? "rgba(255,107,53,0.2)" : "linear-gradient(135deg, #FF6B35, #C13C00)", color: loading || !email || !password ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 14, fontWeight: 700, cursor: loading || !email || !password ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1, transition: "all 0.3s", boxShadow: loading || !email || !password ? "none" : "0 4px 20px rgba(255,107,53,0.3)", marginTop: 4 }}>{loading ? "Connexion en cours..." : "SE CONNECTER"}</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Pas encore de compte ? <Link href="/register" style={{ color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>S'inscrire gratuitement</Link></p>
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 20, marginBottom: 0 }}>Handball Connect © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
