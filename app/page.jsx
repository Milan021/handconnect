"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const C = {
  bg: "#0A0E1A",
  bgCard: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  primary: "#1D4ED8",
  primaryLight: "#3B82F6",
  primaryDark: "#1E3A8A",
  accent: "#DC2626",
  accentLight: "#F87171",
  green: "#10B981",
  gold: "#FBBF24",
  text: "#F1F5F9",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
};

const SECTORS = [
  { label: "Sécurité", icon: "🛡️" },
  { label: "Logistique", icon: "📦" },
  { label: "BTP", icon: "🏗️" },
  { label: "Commerce", icon: "🏪" },
  { label: "Santé", icon: "❤️" },
  { label: "Événementiel", icon: "🎉" },
  { label: "IT/Digital", icon: "💻" },
  { label: "Industrie", icon: "🏭" },
  { label: "Éducation", icon: "🎓" },
];

function CountUp({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {/* Background effects */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}06 0%, transparent 70%)`, top: -300, left: -200 }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}04 0%, transparent 70%)`, bottom: -200, right: -100 }} />
      </div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤾</div>
          <h1 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", margin: 0 }}>HAND<span style={{ color: C.primary }}>CONNECT</span></h1>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all .2s" }}>Se connecter</Link>
          <Link href="/beta" style={{ padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg, ${C.gold}, #D97706)`, color: "#0A0E1A", textDecoration: "none", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 16px ${C.gold}30` }}>🚀 Beta</Link>
          <Link href="/register" style={{ padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 16px ${C.primary}30` }}>S'inscrire</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "60px 24px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: `${C.primary}12`, border: `1px solid ${C.primary}25`, borderRadius: 20, marginBottom: 24 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          <span style={{ fontSize: 12, color: C.primaryLight, fontWeight: 600 }}>Nouveau — Plateforme de reconversion</span>
        </div>
        <h2 style={{ fontSize: 52, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 16px", lineHeight: 1.1 }}>
          DE LA DERNIÈRE MINUTE<br />
          <span style={{ color: C.primary }}>AU PREMIER JOUR</span>
        </h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          HandConnect accompagne les handballeurs professionnels dans leur reconversion.
          Connectez-vous avec des entreprises qui valorisent votre profil athlète.
        </p>
      </section>

      {/* Split Cards */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 60px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {/* Card Joueur Pro */}
          <div
            onMouseEnter={() => setHoveredCard("player")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: hoveredCard === "player" ? `${C.primary}08` : C.bgCard,
              border: `1px solid ${hoveredCard === "player" ? `${C.primary}40` : C.border}`,
              borderRadius: 24,
              padding: 40,
              transition: "all .35s cubic-bezier(0.16,1,0.3,1)",
              cursor: "pointer",
              transform: hoveredCard === "player" ? "translateY(-6px)" : "none",
              boxShadow: hoveredCard === "player" ? `0 24px 64px ${C.primary}15` : "none",
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20, boxShadow: `0 8px 32px ${C.primary}30` }}>🤾</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>Je suis handballeur pro</h3>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "0 0 24px" }}>
              Préparez votre reconversion dès maintenant. Créez votre profil, indiquez vos secteurs cibles et laissez les entreprises vous découvrir.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {["Profil reconversion valorisant vos soft skills", "Matching avec des entreprises ciblées", "Coaching et accompagnement carrière", "Réseau d'anciens handballeurs reconvertis"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: C.green, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: C.dim }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/register" style={{ display: "block", width: "100%", padding: "14px 0", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: 700, boxShadow: `0 6px 20px ${C.primary}30`, transition: "all .2s" }}>
              Créer mon profil →
            </Link>
          </div>

          {/* Card Entreprise */}
          <div
            onMouseEnter={() => setHoveredCard("company")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: hoveredCard === "company" ? `${C.accent}08` : C.bgCard,
              border: `1px solid ${hoveredCard === "company" ? `${C.accent}40` : C.border}`,
              borderRadius: 24,
              padding: 40,
              transition: "all .35s cubic-bezier(0.16,1,0.3,1)",
              cursor: "pointer",
              transform: hoveredCard === "company" ? "translateY(-6px)" : "none",
              boxShadow: hoveredCard === "company" ? `0 24px 64px ${C.accent}15` : "none",
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C.accent}, #991B1B)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20, boxShadow: `0 8px 32px ${C.accent}30` }}>🏢</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>Je suis une entreprise</h3>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "0 0 24px" }}>
              Recrutez des profils d'exception. Les handballeurs professionnels apportent leadership, résilience et travail d'équipe.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {["Accès à des profils vérifiés et motivés", "Matching intelligent par compétences", "Événements de rencontre exclusifs", "Commission uniquement si recrutement"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: C.green, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: C.dim }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/register?type=entreprise" style={{ display: "block", width: "100%", padding: "14px 0", borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, #991B1B)`, color: "#fff", textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: 700, boxShadow: `0 6px 20px ${C.accent}30`, transition: "all .2s" }}>
              Recruter des talents →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ position: "relative", zIndex: 10, padding: "40px 24px", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 24, textAlign: "center" }}>
          {[
            { value: 150, suffix: "+", label: "Handballeurs pros" },
            { value: 45, suffix: "", label: "Entreprises partenaires" },
            { value: 12, suffix: "", label: "Secteurs couverts" },
            { value: 28, suffix: "", label: "Placements réussis" },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: 36, fontFamily: "'Bebas Neue', sans-serif", color: C.primary, letterSpacing: 1 }}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section style={{ position: "relative", zIndex: 10, padding: "60px 24px", maxWidth: 960, margin: "0 auto" }}>
        <h3 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", textAlign: "center", margin: "0 0 12px" }}>SECTEURS <span style={{ color: C.primary }}>RECHERCHÉS</span></h3>
        <p style={{ fontSize: 14, color: C.muted, textAlign: "center", margin: "0 0 40px" }}>Les entreprises qui recrutent nos handballeurs</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          {SECTORS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 13, color: C.dim }}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ position: "relative", zIndex: 10, padding: "60px 24px", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h3 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", textAlign: "center", margin: "0 0 40px" }}>COMMENT ÇA <span style={{ color: C.primary }}>FONCTIONNE</span></h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { step: "01", title: "Créez votre profil", desc: "Renseignez votre parcours sportif, vos compétences transférables et vos secteurs cibles." },
              { step: "02", title: "Découvrez les offres", desc: "Notre algorithme vous suggère les entreprises et postes qui correspondent à votre profil." },
              { step: "03", title: "Postulez en un clic", desc: "Envoyez votre candidature avec votre CV et un message personnalisé aux recruteurs." },
              { step: "04", title: "Soyez recruté", desc: "Les entreprises vous contactent directement. HandConnect perçoit une commission uniquement si vous êtes embauché." },
            ].map((item, i) => (
              <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", color: C.primary, marginBottom: 12 }}>{item.step}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{item.title}</h4>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px 24px", textAlign: "center" }}>
        <h3 style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 16px" }}>PRÊT À PASSER LE <span style={{ color: C.primary }}>CAP ?</span></h3>
        <p style={{ fontSize: 15, color: C.muted, maxWidth: 500, margin: "0 auto 32px" }}>Rejoignez la première plateforme dédiée à la reconversion des handballeurs professionnels.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{ padding: "14px 32px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, boxShadow: `0 6px 20px ${C.primary}30` }}>Je suis handballeur pro</Link>
          <Link href="/register?type=entreprise" style={{ padding: "14px 32px", borderRadius: 12, border: `1px solid ${C.accent}40`, background: `${C.accent}10`, color: C.accentLight, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>Je suis une entreprise</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, padding: "32px 24px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤾</div>
          <span style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff" }}>HAND<span style={{ color: C.primary }}>CONNECT</span></span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", margin: 0 }}>HandConnect © {new Date().getFullYear()} — Tous droits réservés</p>
      </footer>
    </div>
  );
}
