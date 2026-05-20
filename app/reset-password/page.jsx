"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase ouvre la session via le hash quand on arrive depuis l'email
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });
    // Vérifie aussi la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères"); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => { window.location.href = "/dashboard"; }, 1800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: 20 }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ width: 420, padding: 40, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, backdropFilter: "blur(20px)", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 8px 32px rgba(255,107,53,0.3)", marginBottom: 16 }}>🔐</div>
          <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", margin: "0 0 4px" }}>HANDBALL<span style={{ color: "#FF6B35" }}>CONNECT</span></h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Nouveau mot de passe</p>
        </div>

        {done ? (
          <div style={{ padding: 24, borderRadius: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#10B981", margin: "0 0 8px" }}>Mot de passe modifié</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>Redirection vers votre espace...</p>
          </div>
        ) : !sessionReady ? (
          <div style={{ padding: 24, borderRadius: 14, background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.2)", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6 }}>
              Vérification du lien de réinitialisation…<br/>
              Si rien ne se passe, demandez un nouveau lien depuis la page <Link href="/forgot-password" style={{ color: "#FF6B35", fontWeight: 600 }}>mot de passe oublié</Link>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>NOUVEAU MOT DE PASSE</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 caractères" style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14, padding: 0 }}>{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>CONFIRMER</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Retapez le mot de passe" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
            </div>
            {error && (<div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}><span>⚠️</span> {error}</div>)}
            <button type="submit" disabled={loading || !password || !confirm} style={{ padding: "14px 20px", borderRadius: 12, border: "none", background: loading || !password || !confirm ? "rgba(255,107,53,0.2)" : "linear-gradient(135deg, #FF6B35, #C13C00)", color: loading || !password || !confirm ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 14, fontWeight: 700, cursor: loading || !password || !confirm ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>{loading ? "Mise à jour..." : "DÉFINIR LE MOT DE PASSE"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
