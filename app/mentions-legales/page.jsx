import LegalLayout from "../../components/LegalLayout";

export const metadata = { title: "Mentions légales — HandballConnect" };

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" lastUpdate="13 mai 2026">
      <h2>1. Éditeur du site</h2>
      <p>Le site <strong>HandballConnect</strong> (accessible à l'adresse <a href="https://handballconnect.fr">handballconnect.fr</a>) est édité par :</p>
      <ul>
        <li><strong>Raison sociale</strong> : SASU JOKER TEAM</li>
        <li><strong>SIREN</strong> : 942 163 924</li>
        <li><strong>SIRET</strong> : 942 163 924 00015</li>
        <li><strong>Capital social</strong> : 1 000 €</li>
        <li><strong>RCS</strong> : Lyon, immatriculée le 19/03/2025</li>
        <li><strong>N° TVA intracommunautaire</strong> : FR54942163924</li>
        <li><strong>Siège social</strong> : 10 rue Félix Brun, 69007 Lyon, France</li>
        <li><strong>Directeur de la publication</strong> : Milan Calic</li>
        <li><strong>Contact</strong> : contact@handballconnect.fr</li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>Le site est hébergé par :</p>
      <ul>
        <li><strong>Vercel Inc.</strong> — 340 S Lemon Ave #4133, Walnut, CA 91789, USA — <a href="https://vercel.com">vercel.com</a></li>
        <li><strong>Supabase Inc.</strong> (base de données) — 970 Toa Payoh North #07-04, Singapore — <a href="https://supabase.com">supabase.com</a></li>
      </ul>

      <h2>3. Propriété intellectuelle</h2>
      <p>L'ensemble du site (textes, images, logos, charte graphique, code source) est protégé par le droit d'auteur et le droit des marques. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, par quelque procédé que ce soit, sans autorisation écrite préalable, est interdite.</p>

      <h2>4. Nature de l'activité</h2>
      <p><strong>HandballConnect est une plateforme de mise en relation</strong> entre joueurs, clubs, entraîneurs et entreprises du milieu du handball amateur français. La société édite un service SaaS par abonnement et <strong>ne perçoit aucune commission sur les recrutements</strong>. Le contrat de travail ou de licence sportive est conclu directement entre les parties, sans intermédiation financière.</p>
      <p>Conformément à l'article L222-7 du Code du sport, HandballConnect <strong>n'exerce pas l'activité d'agent sportif</strong>.</p>

      <h2>5. Limitation de responsabilité</h2>
      <p>Les informations diffusées sur HandballConnect sont fournies par les utilisateurs. L'éditeur ne saurait être tenu responsable de l'exactitude, de l'exhaustivité ou de l'actualité des informations publiées. L'utilisateur reste seul responsable de l'usage qu'il fait de la plateforme.</p>

      <h2>6. Données personnelles</h2>
      <p>Les modalités de collecte, de traitement et de protection des données personnelles sont décrites dans notre <a href="/politique-confidentialite">Politique de confidentialité (RGPD)</a>.</p>

      <h2>7. Droit applicable</h2>
      <p>Les présentes mentions légales sont régies par le droit français. Tout litige relatif au site sera de la compétence exclusive des tribunaux du ressort du siège social de l'éditeur, sauf disposition légale d'ordre public contraire.</p>
    </LegalLayout>
  );
}
