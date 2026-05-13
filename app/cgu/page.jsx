import LegalLayout from "../../components/LegalLayout";

export const metadata = { title: "Conditions Générales d'Utilisation — HandballConnect" };

export default function CGUPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdate="13 mai 2026">
      <h2>Préambule</h2>
      <p>HandballConnect (ci-après « la Plateforme ») est un service SaaS édité par la SASU JOKER TEAM, dont l'objet est la mise en relation entre acteurs du handball amateur français (joueurs, clubs, entraîneurs, sponsors).</p>
      <p>Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de la Plateforme. Toute inscription vaut acceptation pleine et entière des présentes CGU.</p>

      <h2>1. Objet</h2>
      <p>La Plateforme met à disposition de ses utilisateurs :</p>
      <ul>
        <li>Un service d'annonces (recherche de joueurs, entraîneurs, postes)</li>
        <li>Un service de profils détaillés (joueur / club / entraîneur)</li>
        <li>Un service de candidatures (réponse aux annonces avec CV)</li>
        <li>Un service de messagerie privée 1-1 sur demande de connexion</li>
        <li>Un service d'abonnement payant donnant accès à des fonctionnalités étendues</li>
      </ul>
      <p><strong>HandballConnect est une plateforme de mise en relation. Le contrat (engagement, licence, prestation) est conclu directement entre les parties. La Plateforme ne perçoit aucune commission sur les recrutements et n'exerce en aucun cas l'activité d'agent sportif (Code du sport L222-7).</strong></p>

      <h2>2. Inscription et compte utilisateur</h2>
      <p>L'inscription est ouverte à toute personne physique majeure ou, pour les mineurs, sous responsabilité du représentant légal. L'utilisateur s'engage à fournir des informations exactes, à jour et complètes.</p>
      <p>Chaque utilisateur dispose d'un compte personnel protégé par un mot de passe confidentiel. L'utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte.</p>

      <h2>3. Abonnements et essai gratuit</h2>
      <p>Trois formules d'abonnement sont proposées aux clubs : <strong>Club Free (25€/an), Club Standard (100€/an) et Club Premium (250€/an)</strong>. Les joueurs et entraîneurs peuvent souscrire des options de visibilité (Joueur Boost 5€/mois, Entraîneur Pro 10€/mois).</p>
      <p>Tout nouvel utilisateur club bénéficie d'une <strong>période d'essai gratuite de 7 jours</strong>, sans carte bancaire, sans engagement et résiliable à tout moment. À l'issue de l'essai, l'abonnement est facturé selon le plan choisi.</p>
      <p>Les abonnements sont reconduits tacitement chaque année. L'utilisateur peut résilier à tout moment depuis son espace personnel ; la résiliation prend effet à la fin de la période en cours.</p>

      <h2>4. Comportement des utilisateurs</h2>
      <p>L'utilisateur s'engage à :</p>
      <ul>
        <li>Respecter les autres utilisateurs et la législation en vigueur</li>
        <li>Ne pas publier de contenu illicite, diffamatoire, discriminatoire ou contraire aux bonnes mœurs</li>
        <li>Ne pas usurper l'identité d'un tiers</li>
        <li>Ne pas tenter de contourner les mécanismes techniques de la Plateforme</li>
        <li>Ne pas utiliser la Plateforme à des fins d'intermédiation rémunérée (activité d'agent sportif non autorisée)</li>
      </ul>
      <p>Tout manquement peut entraîner la suspension ou la suppression du compte sans préavis ni remboursement.</p>

      <h2>5. Anonymisation et protection des profils joueurs</h2>
      <p>Afin de protéger la vie privée des joueurs et notamment des mineurs, leurs nom, prénom et coordonnées personnelles (téléphone, email) sont <strong>anonymisés publiquement</strong>. Les informations identifiantes ne sont révélées qu'après acceptation d'une demande de connexion mutuelle entre les parties.</p>

      <h2>6. Propriété intellectuelle</h2>
      <p>L'utilisateur conserve la propriété intellectuelle du contenu qu'il publie. Il concède à HandballConnect une licence non exclusive d'utilisation, de reproduction et de diffusion du contenu sur la Plateforme, pendant toute la durée de son inscription, aux seules fins de fonctionnement du service.</p>

      <h2>7. Responsabilité</h2>
      <p>HandballConnect met tout en œuvre pour assurer la disponibilité et la sécurité du service mais ne peut garantir une disponibilité de 100%. La Plateforme ne saurait être tenue responsable des conséquences d'une indisponibilité temporaire, d'une perte de données ou d'un usage frauduleux par un tiers.</p>
      <p>La Plateforme n'est pas partie aux contrats conclus entre utilisateurs et décline toute responsabilité quant à leur bonne exécution.</p>

      <h2>8. Données personnelles</h2>
      <p>Le traitement des données personnelles est décrit dans la <a href="/politique-confidentialite">Politique de confidentialité</a>, conforme au RGPD.</p>

      <h2>9. Modification des CGU</h2>
      <p>HandballConnect se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles par email ou notification dans leur espace. La poursuite de l'utilisation après modification vaut acceptation.</p>

      <h2>10. Droit applicable et litiges</h2>
      <p>Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux de Lyon seront seuls compétents.</p>

      <h2>11. Contact</h2>
      <p>Pour toute question relative aux présentes CGU : <a href="mailto:contact@handballconnect.fr">contact@handballconnect.fr</a>.</p>
    </LegalLayout>
  );
}
