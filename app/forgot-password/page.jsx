"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Saisissez votre email"); return; }
    setLoading(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: 20 }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ width: 420, padding: 40, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, backdropFilter: "blur(20px)", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 8px 32px rgba(255,107,53,0.3)", marginBottom: 16 }}>🔑</div>
          <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", margin: "0 0 4px" }}>HANDBALL<span style={{ color: "#FF6B35" }}>CONNECT</span></h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Réinitialiser votre mot de passe</p>
        </div>

        {sent ? (
          <div style={{ padding: 24, borderRadius: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📧</div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#10B981", margin: "0 0 8px" }}>Email envoyé !</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>
              Un lien de réinitialisation a été envoyé à <strong style={{ color: "#fff" }}>{email}</strong>.<br />
              Cliquez sur le lien dans l'email pour définir un nouveau mot de passe.
            </p>
            <Link href="/login" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>← Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0, textAlign: "center" }}>
              Saisissez l'email associé à votre compte. Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
            </p>
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: error ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
            </div>
            {error && (<div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}><span>⚠️</span> {error}</div>)}
            <button type="submit" disabled={loading || !email} style={{ padding: "14px 20px", borderRadius: 12, border: "none", background: loading || !email ? "rgba(255,107,53,0.2)" : "linear-gradient(135deg, #FF6B35, #C13C00)", color: loading || !email ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 14, fontWeight: 700, cursor: loading || !email ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>{loading ? "Envoi..." : "ENVOYER LE LIEN"}</button>
          </form>
        )}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500, textDecoration: "none" }}>← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}
