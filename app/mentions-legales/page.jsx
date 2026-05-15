"use client";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const C = {
  bg:"#0A0E1A",text:"#F1F5F9",muted:"rgba(255,255,255,0.5)",dim:"rgba(255,255,255,0.3)",
  border:"rgba(255,255,255,0.08)",primary:"#1D4ED8",
};

export default function MentionsLegalesPage() {
  const sectionStyle = { marginBottom: 32 };
  const h2Style = { fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 };
  const pStyle = { fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 10 };
  const labelStyle = { fontSize: 12, color: C.dim, fontWeight: 600, marginBottom: 4, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>
        <Link href="/dashboard" style={{ fontSize: 12, color: C.dim, textDecoration: "none", display: "inline-block", marginBottom: 24 }}>← Retour</Link>

        <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", marginBottom: 8 }}>MENTIONS <span style={{ color: "#FF6B35" }}>LEGALES</span></h1>
        <p style={{ fontSize: 12, color: C.dim, marginBottom: 40 }}>Conformement aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'economie numerique.</p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. EDITEUR DU SITE</h2>
          <p style={pStyle}>Le site www.handballconnect.fr est edite par :</p>
          <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 10 }}>
            <p style={pStyle}><span style={labelStyle}>Raison sociale</span>Joker Team SAS</p>
            <p style={pStyle}><span style={labelStyle}>Forme juridique</span>Societe par Actions Simplifiee (SAS)</p>
            <p style={pStyle}><span style={labelStyle}>Siege social</span>Lyon, France</p>
            <p style={pStyle}><span style={labelStyle}>SIRET</span>[A completer]</p>
            <p style={pStyle}><span style={labelStyle}>RCS</span>Lyon [A completer]</p>
            <p style={pStyle}><span style={labelStyle}>Directeur de la publication</span>Milan</p>
            <p style={pStyle}><span style={labelStyle}>Email</span>contact@handballconnect.fr</p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. HEBERGEUR</h2>
          <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 10 }}>
            <p style={pStyle}><span style={labelStyle}>Raison sociale</span>Vercel Inc.</p>
            <p style={pStyle}><span style={labelStyle}>Adresse</span>340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            <p style={pStyle}><span style={labelStyle}>Site web</span>https://vercel.com</p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. BASE DE DONNEES</h2>
          <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 10 }}>
            <p style={pStyle}><span style={labelStyle}>Service</span>Supabase Inc.</p>
            <p style={pStyle}><span style={labelStyle}>Site web</span>https://supabase.com</p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. PROPRIETE INTELLECTUELLE</h2>
          <p style={pStyle}>L'ensemble du contenu du site (textes, images, logo, graphismes, base de donnees, code source) est la propriete exclusive de Joker Team SAS, sauf mention contraire. Toute reproduction, representation, modification, publication ou adaptation de tout ou partie du site, quel que soit le moyen ou le procede utilise, est interdite sans autorisation prealable ecrite de Joker Team SAS.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. LIMITATION DE RESPONSABILITE</h2>
          <p style={pStyle}>L'Editeur s'efforce de fournir des informations aussi precises que possible sur la Plateforme. Toutefois, il ne pourra etre tenu responsable des omissions, des inexactitudes et des carences dans la mise a jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.</p>
          <p style={pStyle}>Handball Connect est une plateforme de mise en relation. L'Editeur ne peut etre tenu responsable des relations entre utilisateurs, des contrats conclus entre eux, ni des informations fournies par les utilisateurs sur leurs profils.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. LIENS HYPERTEXTES</h2>
          <p style={pStyle}>Le site peut contenir des liens hypertextes vers d'autres sites. L'Editeur ne dispose d'aucun moyen de controle du contenu de ces sites tiers et n'assume aucune responsabilite quant a leur contenu.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. DROIT APPLICABLE</h2>
          <p style={pStyle}>Les presentes mentions legales sont soumises au droit francais. En cas de litige, et apres echec de toute tentative de recherche d'une solution amiable, les tribunaux de Lyon seront seuls competents.</p>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
          <Link href="/cgu" style={{ fontSize: 12, color: C.primary, textDecoration: "none" }}>Conditions Generales d'Utilisation</Link>
          <Link href="/rgpd" style={{ fontSize: 12, color: C.primary, textDecoration: "none" }}>Politique de confidentialite</Link>
        </div>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.1)", marginTop: 40, textAlign: "center" }}>Handball Connect — Joker Team SAS © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
