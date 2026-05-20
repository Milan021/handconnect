// Compétences transférables des sportifs de haut niveau
// Synchronisé avec la table athlete_skills de Supabase

export const ATHLETE_SKILLS = [
  { id: "leadership",      label: "Leadership",          description: "Capacité à fédérer et entraîner une équipe",             category: "management" },
  { id: "travail_equipe",  label: "Travail d'équipe",    description: "Collaboration efficace dans des environnements collectifs", category: "social" },
  { id: "gestion_stress",  label: "Gestion du stress",   description: "Performance sous pression et dans l'urgence",            category: "mental" },
  { id: "discipline",      label: "Discipline & rigueur", description: "Respect des horaires, des consignes, des objectifs",    category: "mental" },
  { id: "perseverance",    label: "Persévérance",        description: "Capacité à rebondir après un échec",                    category: "mental" },
  { id: "organisation",    label: "Organisation",        description: "Planification, anticipation, gestion du temps",         category: "management" },
  { id: "communication",   label: "Communication",       description: "Expression claire, écoute active, négociation",         category: "social" },
  { id: "adaptabilite",    label: "Adaptabilité",        description: "Apprentissage rapide, polyvalence",                     category: "mental" },
  { id: "competitivite",   label: "Compétitivité",       description: "Envie de gagner, dépassement de soi",                   category: "mental" },
  { id: "prise_decision",  label: "Prise de décision",   description: "Décision rapide et éclairée sous pression",             category: "management" },
];

export function getSkillById(id) {
  return ATHLETE_SKILLS.find(s => s.id === id) || null;
}

export function getSkillLabel(id) {
  return getSkillById(id)?.label || id;
}

export function getSkillsByCategory(category) {
  return ATHLETE_SKILLS.filter(s => s.category === category);
}

export const SKILL_CATEGORIES = {
  mental: "Mental & Résilience",
  management: "Management & Organisation",
  social: "Communication & Relationnel",
};
