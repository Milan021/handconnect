// Secteurs d'activité cibles pour la reconversion des handballeurs pros
// Synchronisé avec la table sectors de Supabase

export const SECTORS = [
  { id: "securite",     label: "Sécurité privée",           description: "Agent de sécurité, chef d'équipe, sûreté",              color: "#DC2626", icon: "🛡️" },
  { id: "logistique",   label: "Logistique & Transport",    description: "Responsable entrepôt, planificateur, conducteur",       color: "#F59E0B", icon: "📦" },
  { id: "btp",          label: "BTP & Travaux",             description: "Conducteur travaux, chef de chantier, gros œuvre",      color: "#EA580C", icon: "🏗️" },
  { id: "commerce",     label: "Commerce & Distribution",   description: "Responsable magasin, équipe, vente",                    color: "#10B981", icon: "🏪" },
  { id: "sante",        label: "Santé & Bien-être",         description: "Kiné, coach sportif, préparateur physique",             color: "#06B6D4", icon: "❤️" },
  { id: "evenementiel", label: "Événementiel",              description: "Chef de projet, opérations, organisation",              color: "#8B5CF6", icon: "🎉" },
  { id: "informatique", label: "Informatique & Digital",    description: "Support, cybersécurité, gestion de projet IT",          color: "#3B82F6", icon: "💻" },
  { id: "industrie",    label: "Industrie",                 description: "Production, qualité, maintenance",                      color: "#64748B", icon: "🏭" },
  { id: "education",    label: "Éducation & Formation",     description: "Formateur, éducateur sportif, accompagnateur",          color: "#EC4899", icon: "🎓" },
  { id: "autre",        label: "Autre secteur",             description: "Tous autres secteurs",                                  color: "#6B7280", icon: "🔹" },
];

export function getSectorById(id) {
  return SECTORS.find(s => s.id === id) || null;
}

export function getSectorLabel(id) {
  return getSectorById(id)?.label || id;
}

export function getSectorColor(id) {
  return getSectorById(id)?.color || "#3B82F6";
}
