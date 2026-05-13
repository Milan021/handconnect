"use client";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: "20px" }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {/* Ambient glows */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.10) 0%, transparent 70%)", top: -200, right: -150, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(29,78,216,0.08) 0%, transparent 70%)", bottom: -150, left: -100, pointerEvents: "none" }} />

      <main style={{ width: "100%", maxWidth: 560, padding: "clamp(28px, 6vw, 48px) clamp(22px, 5vw, 44px)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, backdropFilter: "blur(24px)", position: "relative", zIndex: 1, textAlign: "center", boxSizing: "border-box" }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 12px 40px rgba(255,107,53,0.35)", marginBottom: 18 }}>🤾</div>
          <h1 style={{ fontSize: "clamp(32px, 7vw, 44px)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", margin: 0, lineHeight: 1 }}>
            HANDBALL<span style={{ color: "#FF6B35" }}>CONNECT</span>
          </h1>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 3, fontWeight: 600, marginTop: 6 }}>BETA</span>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", marginBottom: 28 }} />

        {/* Welcome */}
        <h2 style={{ fontSize: "clamp(20px, 4vw, 26px)", color: "#fff", margin: "0 0 18px", fontWeight: 700, lineHeight: 1.35 }}>
          Bienvenue sur <span style={{ color: "#FF6B35" }}>HandballConnect</span>, le site de mise en relation pour joueurs, entraîneurs et clubs de handball.
        </h2>

        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
          100% recrutement. HandballConnect est une plateforme de mise en relation entre joueurs, entraîneurs et clubs.
          Site créé par des handballeurs, pour des handballeurs.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #C13C00)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: 1, boxShadow: "0 8px 24px rgba(255,107,53,0.3)", transition: "transform .2s, box-shadow .2s", minWidth: 160 }}>
            S&apos;inscrire
          </Link>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 32px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: 1, border: "1px solid rgba(255,255,255,0.15)", transition: "all .2s", minWidth: 160 }}>
            👤 Se connecter
          </Link>
        </div>

        {/* Footer mentions */}
        <div style={{ marginTop: 36, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          {[["CGU", "/cgu"], ["Mentions légales", "/mentions-legales"], ["RGPD", "/politique-confidentialite"]].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", fontWeight: 500 }}>{label}</Link>
          ))}
        </div>
      </main>
    </div>
  );
}
