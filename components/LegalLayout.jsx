"use client";
import Link from "next/link";

const C = {
  primary: "#1D4ED8",
  accent: "#DC2626",
  bg: "#0B1120",
  bgCard: "rgba(255,255,255,0.04)",
  text: "#F1F5F9",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.08)",
};

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

export default function LegalLayout({ title, lastUpdate, children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <header style={{ background: "rgba(11,17,32,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: `0 4px 14px ${C.primary}30` }}>🤾</div>
            <h1 style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
          </Link>
          <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Link href="/cgu" style={{ padding: "6px 10px", fontSize: 11, color: C.muted, textDecoration: "none", borderRadius: 8, fontWeight: 600 }}>CGU</Link>
            <Link href="/mentions-legales" style={{ padding: "6px 10px", fontSize: 11, color: C.muted, textDecoration: "none", borderRadius: 8, fontWeight: 600 }}>Mentions légales</Link>
            <Link href="/politique-confidentialite" style={{ padding: "6px 10px", fontSize: 11, color: C.muted, textDecoration: "none", borderRadius: 8, fontWeight: 600 }}>RGPD</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 20px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>← Retour à l'accueil</Link>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 3, color: C.text, margin: "0 0 8px" }}>{title}</h1>
        {lastUpdate && <p style={{ fontSize: 12, color: C.dim, margin: "0 0 28px" }}>Dernière mise à jour : {lastUpdate}</p>}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: "32px 28px", lineHeight: 1.7, fontSize: 14, color: C.muted }}>
          {children}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: C.dim, margin: 0 }}>HandballConnect © {new Date().getFullYear()} — SASU JOKER TEAM</p>
      </footer>

      <style>{`
        h2 { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2; color: ${C.text}; font-size: 22px; margin: 28px 0 12px; }
        h3 { color: ${C.text}; font-size: 16px; font-weight: 700; margin: 20px 0 8px; }
        p { margin: 0 0 12px; }
        ul, ol { margin: 0 0 14px 20px; padding: 0; }
        li { margin-bottom: 6px; }
        a { color: ${C.primary}; text-decoration: underline; }
        strong { color: ${C.text}; }
      `}</style>
    </div>
  );
}
