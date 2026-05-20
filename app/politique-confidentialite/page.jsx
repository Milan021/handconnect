import LegalLayout from "../../components/LegalLayout";

export const metadata = { title: "Politique de confidentialité (RGPD) — HandballConnect" };

export default function RGPDPage() {
  return (
    <LegalLayout title="Politique de confidentialité (RGPD)" lastUpdate="13 mai 2026">
      <p>La présente politique décrit comment HandballConnect collecte, utilise et protège les données personnelles des utilisateurs, conformément au Règlement Général sur la Protection des Données (UE 2016/679) et à la Loi Informatique et Libertés.</p>

      <h2>1. Responsable du traitement</h2>
      <p><strong>SASU JOKER TEAM</strong> — SIREN 942 163 924 — 10 rue Félix Brun, 69007 Lyon, France — <a href="mailto:contact@handballconnect.fr">contact@handballconnect.fr</a></p>

      <h2>2. Données collectées</h2>
      <p>HandballConnect collecte les catégories de données suivantes :</p>
      <h3>2.1 Données d'identification</h3>
      <ul>
        <li>Nom, prénom, date de naissance, sexe</li>
        <li>Email, téléphone</li>
        <li>Adresse postale / ville / région</li>
        <li>Photo (facultative)</li>
      </ul>
      <h3>2.2 Données sportives</h3>
      <ul>
        <li>Poste de jeu, niveau actuel et passé, club actuel</li>
        <li>Caractéristiques physiques (taille, poids, latéralité)</li>
        <li>Centre de formation, section sportive</li>
        <li>CV au format PDF (facultatif)</li>
      </ul>
      <h3>2.3 Données de connexion</h3>
      <ul>
        <li>Adresse IP, identifiant de session, logs techniques</li>
        <li>Historique des connexions et activités sur la plateforme</li>
      </ul>
      <h3>2.4 Données de paiement</h3>
      <p>Les données bancaires sont collectées et traitées exclusivement par notre prestataire de paiement (Stripe). HandballConnect ne stocke aucune donnée bancaire.</p>

      <h2>3. Finalités du traitement</h2>
      <p>Les données sont traitées pour :</p>
      <ul>
        <li>Permettre la création, la gestion et la sécurisation des comptes utilisateurs</li>
        <li>Mettre en relation joueurs, clubs et entraîneurs</li>
        <li>Gérer les candidatures et la messagerie privée</li>
        <li>Facturer les abonnements et gérer la relation commerciale</li>
        <li>Améliorer la plateforme (statistiques anonymisées)</li>
        <li>Respecter les obligations légales et réglementaires</li>
      </ul>

      <h2>4. Bases légales</h2>
      <ul>
        <li><strong>Exécution du contrat</strong> pour la fourniture du service</li>
        <li><strong>Consentement</strong> pour la diffusion publique du profil et les communications marketing</li>
        <li><strong>Intérêt légitime</strong> pour la sécurité et l'amélioration de la plateforme</li>
        <li><strong>Obligation légale</strong> pour la facturation et la lutte contre la fraude</li>
      </ul>

      <h2>5. Destinataires des données</h2>
      <p>Les données sont destinées :</p>
      <ul>
        <li>Aux équipes internes de HandballConnect, dans la limite stricte de leurs missions</li>
        <li>Aux autres utilisateurs de la plateforme, pour les informations publiquement diffusées sur le profil (les nom, prénom, téléphone et email des joueurs sont anonymisés tant qu'une connexion n'a pas été acceptée)</li>
        <li>À nos sous-traitants techniques : Supabase (base de données, USA / Singapour), Vercel (hébergement, USA), Stripe (paiements, USA)</li>
      </ul>
      <p>Les transferts hors UE sont encadrés par des Clauses Contractuelles Types (CCT) de la Commission Européenne.</p>

      <h2>6. Durée de conservation</h2>
      <ul>
        <li><strong>Compte actif</strong> : pendant toute la durée d'utilisation du service</li>
        <li><strong>Compte inactif</strong> : suppression après 3 ans d'inactivité, sauf demande contraire</li>
        <li><strong>Données de facturation</strong> : conservées 10 ans (obligation légale)</li>
        <li><strong>Logs techniques</strong> : 12 mois</li>
      </ul>

      <h2>7. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Accès</strong> : obtenir copie de vos données</li>
        <li><strong>Rectification</strong> : corriger des données inexactes ou incomplètes</li>
        <li><strong>Effacement</strong> (« droit à l'oubli ») : supprimer vos données dans les cas prévus</li>
        <li><strong>Limitation</strong> : restreindre temporairement le traitement</li>
        <li><strong>Portabilité</strong> : récupérer vos données dans un format structuré</li>
        <li><strong>Opposition</strong> : vous opposer au traitement pour motif légitime</li>
        <li><strong>Retrait du consentement</strong> à tout moment</li>
        <li><strong>Définir des directives</strong> relatives au sort de vos données après votre décès</li>
      </ul>
      <p>Pour exercer ces droits, contactez : <a href="mailto:contact@handballconnect.fr">contact@handballconnect.fr</a> (réponse sous 30 jours).</p>
      <p>Vous disposez également du droit d'introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr">www.cnil.fr</a>.</p>

      <h2>8. Sécurité</h2>
      <p>HandballConnect met en œuvre des mesures techniques et organisationnelles appropriées pour garantir un niveau de sécurité adapté au risque : chiffrement HTTPS, contrôle d'accès par RLS (Row Level Security) sur la base de données, sauvegardes régulières, audits de sécurité.</p>

      <h2>9. Cookies</h2>
      <p>HandballConnect utilise des cookies strictement nécessaires au fonctionnement du service (session, authentification). Aucun cookie de tracking publicitaire n'est utilisé sans votre consentement explicite.</p>

      <h2>10. Mineurs</h2>
      <p>L'inscription des mineurs requiert l'accord exprès du représentant légal. Les informations identifiantes des mineurs sont systématiquement anonymisées publiquement. Le représentant légal peut demander à tout moment la suppression du compte.</p>

      <h2>11. Modification de la politique</h2>
      <p>La présente politique peut être modifiée pour tenir compte d'évolutions légales ou techniques. Les utilisateurs seront informés des modifications substantielles par email.</p>
    </LegalLayout>
  );
}
