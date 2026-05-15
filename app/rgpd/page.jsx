"use client";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const C = {
  bg:"#0A0E1A",text:"#F1F5F9",muted:"rgba(255,255,255,0.5)",dim:"rgba(255,255,255,0.3)",
  border:"rgba(255,255,255,0.08)",primary:"#1D4ED8",
};

export default function RGPDPage() {
  const sectionStyle = { marginBottom: 32 };
  const h2Style = { fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 };
  const pStyle = { fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 10 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>
        <Link href="/dashboard" style={{ fontSize: 12, color: C.dim, textDecoration: "none", display: "inline-block", marginBottom: 24 }}>← Retour</Link>

        <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", marginBottom: 8 }}>POLITIQUE DE <span style={{ color: "#FF6B35" }}>CONFIDENTIALITE</span></h1>
        <p style={{ fontSize: 12, color: C.dim, marginBottom: 40 }}>Conformement au Reglement General sur la Protection des Donnees (RGPD) - Reglement (UE) 2016/679</p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. RESPONSABLE DU TRAITEMENT</h2>
          <p style={pStyle}>Le responsable du traitement des donnees personnelles collectees sur la Plateforme est :</p>
          <p style={pStyle}>Joker Team SAS, dont le siege social est situe a Lyon, France.</p>
          <p style={pStyle}>Contact : contact@handballconnect.fr</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. DONNEES COLLECTEES</h2>
          <p style={pStyle}>Dans le cadre de l'utilisation de la Plateforme, nous collectons les donnees suivantes :</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Donnees d'inscription :</strong> prenom, nom, adresse email, mot de passe (chiffre), type de profil (joueur, club, entraineur).</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Donnees de profil joueur :</strong> age, taille, poids, poste, niveau, ville, disponibilite, biographie, main forte, club actuel, origine de formation.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Donnees de profil club :</strong> nom du club, site web, ville, division, nombre de licencies, objectifs, motivation.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Donnees de profil entraineur :</strong> diplome, experience, resultats, specialite, ville.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Donnees d'utilisation :</strong> messages echanges, annonces publiees, candidatures, connexions entre utilisateurs.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Donnees techniques :</strong> adresse IP, type de navigateur, pages consultees (via les logs serveur).</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. FINALITES DU TRAITEMENT</h2>
          <p style={pStyle}>Les donnees collectees sont utilisees pour :</p>
          <p style={pStyle}>- Permettre la creation et la gestion du compte utilisateur</p>
          <p style={pStyle}>- Faciliter la mise en relation entre joueurs, entraineurs et clubs</p>
          <p style={pStyle}>- Permettre la publication et la consultation d'annonces et d'offres d'emploi</p>
          <p style={pStyle}>- Assurer le fonctionnement de la messagerie integree</p>
          <p style={pStyle}>- Envoyer des notifications liees a l'activite du compte (demandes de connexion, messages, candidatures)</p>
          <p style={pStyle}>- Ameliorer la Plateforme et l'experience utilisateur</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. BASE LEGALE DU TRAITEMENT</h2>
          <p style={pStyle}>Le traitement des donnees personnelles repose sur :</p>
          <p style={pStyle}>- Le consentement de l'utilisateur lors de son inscription (article 6.1.a du RGPD)</p>
          <p style={pStyle}>- L'execution du contrat entre l'utilisateur et l'Editeur, materialise par les CGU (article 6.1.b du RGPD)</p>
          <p style={pStyle}>- L'interet legitime de l'Editeur pour l'amelioration de ses services (article 6.1.f du RGPD)</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. DESTINATAIRES DES DONNEES</h2>
          <p style={pStyle}>Les donnees personnelles sont accessibles uniquement :</p>
          <p style={pStyle}>- A l'equipe de Joker Team SAS dans le cadre de l'administration de la Plateforme</p>
          <p style={pStyle}>- Aux autres utilisateurs de la Plateforme, dans les limites de l'anonymisation prevue (les coordonnees ne sont visibles qu'apres mise en relation acceptee)</p>
          <p style={pStyle}>- A nos sous-traitants techniques : Supabase (base de donnees, heberge aux Etats-Unis avec clauses contractuelles types) et Vercel (hebergement, heberge aux Etats-Unis avec clauses contractuelles types)</p>
          <p style={pStyle}>Les donnees ne sont jamais vendues, louees ou cedees a des tiers a des fins commerciales.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. TRANSFERTS HORS UE</h2>
          <p style={pStyle}>Certaines donnees sont hebergees aux Etats-Unis via nos prestataires Supabase et Vercel. Ces transferts sont encadres par des clauses contractuelles types approuvees par la Commission europeenne, conformement a l'article 46 du RGPD.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. DUREE DE CONSERVATION</h2>
          <p style={pStyle}>Les donnees personnelles sont conservees pendant toute la duree d'existence du compte utilisateur. En cas de suppression du compte, les donnees sont supprimees dans un delai de 30 jours, a l'exception des donnees que nous sommes tenus de conserver pour des raisons legales ou comptables.</p>
          <p style={pStyle}>Les donnees techniques (logs) sont conservees pendant une duree maximale de 12 mois.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>8. VOS DROITS</h2>
          <p style={pStyle}>Conformement au RGPD, vous disposez des droits suivants :</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Droit d'acces :</strong> obtenir la confirmation que des donnees vous concernant sont traitees et en obtenir une copie.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Droit de rectification :</strong> demander la correction de donnees inexactes ou incompletes.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Droit a l'effacement :</strong> demander la suppression de vos donnees personnelles.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Droit a la limitation du traitement :</strong> demander la suspension du traitement de vos donnees.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Droit a la portabilite :</strong> recevoir vos donnees dans un format structure et lisible par machine.</p>
          <p style={pStyle}><strong style={{ color: C.text }}>Droit d'opposition :</strong> vous opposer au traitement de vos donnees pour des motifs legitimes.</p>
          <p style={pStyle}>Pour exercer ces droits, contactez-nous a : contact@handballconnect.fr. Nous repondrons dans un delai de 30 jours.</p>
          <p style={pStyle}>Vous disposez egalement du droit d'introduire une reclamation aupres de la CNIL (Commission Nationale de l'Informatique et des Libertes) : www.cnil.fr.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>9. SECURITE</h2>
          <p style={pStyle}>Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger vos donnees personnelles contre tout acces non autorise, perte, alteration ou divulgation :</p>
          <p style={pStyle}>- Chiffrement des mots de passe (bcrypt via Supabase Auth)</p>
          <p style={pStyle}>- Connexion securisee (HTTPS/TLS)</p>
          <p style={pStyle}>- Controle d'acces aux donnees via des politiques de securite (Row Level Security)</p>
          <p style={pStyle}>- Anonymisation des profils joueurs et entraineurs</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>10. COOKIES</h2>
          <p style={pStyle}>La Plateforme utilise des cookies strictement necessaires au fonctionnement du service (authentification, session utilisateur). Aucun cookie publicitaire ou de tracking n'est utilise.</p>
          <p style={pStyle}>Ces cookies sont indispensables a la navigation et ne necessitent pas votre consentement prealable conformement a la directive ePrivacy.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>11. MODIFICATIONS</h2>
          <p style={pStyle}>La presente politique de confidentialite peut etre modifiee a tout moment. Les utilisateurs seront informes de toute modification substantielle par notification sur la Plateforme. La date de derniere mise a jour est indiquee en haut de cette page.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>12. CONTACT</h2>
          <p style={pStyle}>Pour toute question relative a la protection de vos donnees personnelles :</p>
          <p style={pStyle}>Joker Team SAS — contact@handballconnect.fr</p>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
          <Link href="/cgu" style={{ fontSize: 12, color: C.primary, textDecoration: "none" }}>Conditions Generales d'Utilisation</Link>
          <Link href="/mentions-legales" style={{ fontSize: 12, color: C.primary, textDecoration: "none" }}>Mentions legales</Link>
        </div>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.1)", marginTop: 40, textAlign: "center" }}>Handball Connect — Joker Team SAS © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
