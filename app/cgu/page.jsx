"use client";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const C = {
  bg:"#0A0E1A",text:"#F1F5F9",muted:"rgba(255,255,255,0.5)",dim:"rgba(255,255,255,0.3)",
  border:"rgba(255,255,255,0.08)",primary:"#1D4ED8",
};

export default function CGUPage() {
  const sectionStyle = { marginBottom: 32 };
  const h2Style = { fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 };
  const pStyle = { fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 10 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>
        <Link href="/dashboard" style={{ fontSize: 12, color: C.dim, textDecoration: "none", display: "inline-block", marginBottom: 24 }}>← Retour</Link>

        <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", marginBottom: 8 }}>CONDITIONS GENERALES <span style={{ color: "#FF6B35" }}>D'UTILISATION</span></h1>
        <p style={{ fontSize: 12, color: C.dim, marginBottom: 40 }}>Derniere mise a jour : mai 2026</p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. OBJET</h2>
          <p style={pStyle}>Les presentes conditions generales d'utilisation (ci-apres "CGU") ont pour objet de definir les modalites et conditions d'utilisation de la plateforme Handball Connect, accessible a l'adresse www.handballconnect.fr (ci-apres "la Plateforme"), ainsi que les droits et obligations des utilisateurs.</p>
          <p style={pStyle}>La Plateforme est editee par Joker Team SAS, societe par actions simplifiee dont le siege social est situe a Lyon (ci-apres "l'Editeur").</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. ACCEPTATION DES CGU</h2>
          <p style={pStyle}>L'inscription sur la Plateforme implique l'acceptation pleine et entiere des presentes CGU. L'utilisateur reconnait en avoir pris connaissance et s'engage a les respecter.</p>
          <p style={pStyle}>L'Editeur se reserve le droit de modifier les presentes CGU a tout moment. Les utilisateurs seront informes de toute modification par notification sur la Plateforme.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. DESCRIPTION DU SERVICE</h2>
          <p style={pStyle}>Handball Connect est une plateforme gratuite de mise en relation entre joueurs, entraineurs et clubs de handball amateur en France. La Plateforme permet notamment de :</p>
          <p style={pStyle}>- Creer un profil joueur, entraineur ou club</p>
          <p style={pStyle}>- Publier et consulter des annonces de recrutement</p>
          <p style={pStyle}>- Publier et consulter des offres d'emploi partenaires</p>
          <p style={pStyle}>- Echanger via la messagerie integree entre utilisateurs connectes</p>
          <p style={pStyle}>- Consulter les actualites du handball amateur via le blog</p>
          <p style={pStyle}>Handball Connect est une plateforme de mise en relation uniquement. L'Editeur n'intervient pas dans les negociations, accords ou contrats conclus entre les utilisateurs. Tout contrat (transfert, emploi, prestation) est conclu directement entre les parties concernees.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. INSCRIPTION ET COMPTE UTILISATEUR</h2>
          <p style={pStyle}>L'inscription est gratuite et ouverte a toute personne physique agee d'au moins 16 ans ou a toute personne morale (club, association). Pour les mineurs de moins de 16 ans, l'autorisation d'un representant legal est requise.</p>
          <p style={pStyle}>L'utilisateur s'engage a fournir des informations exactes et a jour lors de son inscription et a maintenir la confidentialite de ses identifiants de connexion.</p>
          <p style={pStyle}>Chaque utilisateur est responsable de l'ensemble des activites realisees depuis son compte.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. OBLIGATIONS DES UTILISATEURS</h2>
          <p style={pStyle}>Les utilisateurs s'engagent a :</p>
          <p style={pStyle}>- Utiliser la Plateforme de maniere loyale et conformement a sa finalite</p>
          <p style={pStyle}>- Ne pas publier de contenu illicite, diffamatoire, discriminatoire ou portant atteinte aux droits de tiers</p>
          <p style={pStyle}>- Ne pas utiliser la Plateforme a des fins commerciales non autorisees</p>
          <p style={pStyle}>- Respecter les autres utilisateurs dans leurs echanges</p>
          <p style={pStyle}>- Ne pas tenter de contourner les mesures de securite de la Plateforme</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. ANONYMISATION DES PROFILS</h2>
          <p style={pStyle}>Les profils des joueurs et entraineurs sont anonymises sur la Plateforme. Les informations personnelles (nom, prenom, coordonnees) ne sont accessibles qu'apres acceptation mutuelle d'une demande de mise en relation.</p>
          <p style={pStyle}>Cette mesure vise a proteger la vie privee des utilisateurs et a garantir un processus de mise en relation serein.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. CONTRIBUTIONS LIBRES</h2>
          <p style={pStyle}>La Plateforme est gratuite. Les utilisateurs ont la possibilite de soutenir le projet par une contribution financiere libre et volontaire. Cette contribution ne donne droit a aucun avantage supplementaire et ne constitue ni un abonnement ni un don au sens fiscal.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>8. RESPONSABILITE</h2>
          <p style={pStyle}>L'Editeur met tout en oeuvre pour assurer la disponibilite et le bon fonctionnement de la Plateforme, sans toutefois pouvoir garantir une disponibilite continue.</p>
          <p style={pStyle}>L'Editeur ne saurait etre tenu responsable des contenus publies par les utilisateurs, des echanges entre utilisateurs, ni des consequences de toute mise en relation effectuee via la Plateforme.</p>
          <p style={pStyle}>L'Editeur se reserve le droit de supprimer tout contenu contraire aux presentes CGU et de suspendre ou supprimer le compte de tout utilisateur ne respectant pas ces conditions.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>9. PROPRIETE INTELLECTUELLE</h2>
          <p style={pStyle}>L'ensemble des elements de la Plateforme (textes, graphismes, logo, logiciels, base de donnees) sont la propriete exclusive de l'Editeur ou font l'objet d'une autorisation d'utilisation. Toute reproduction, representation ou exploitation non autorisee est interdite.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>10. DROIT APPLICABLE ET LITIGES</h2>
          <p style={pStyle}>Les presentes CGU sont soumises au droit francais. En cas de litige, une solution amiable sera recherchee avant toute action judiciaire. A defaut, les tribunaux competents de Lyon seront seuls competents.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>11. CONTACT</h2>
          <p style={pStyle}>Pour toute question relative aux presentes CGU, vous pouvez nous contacter a l'adresse : contact@handballconnect.fr</p>
        </div>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.1)", marginTop: 40, textAlign: "center" }}>Handball Connect — Joker Team SAS © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
