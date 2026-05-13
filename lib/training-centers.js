/**
 * Centres de formation handball en France
 *
 * Types :
 * - "pole"  : Pôle Espoirs FFHB (par région)
 * - "pro_m" : Centre de formation club masculin (Starligue / Proligue)
 * - "pro_f" : Centre de formation club féminin (LFH / D2F)
 *
 * Note : les sections sportives scolaires (collèges / lycées) ne sont pas listées
 * (trop nombreuses et variables par région). Le joueur indique simplement via
 * une case à cocher `is_section_sportive` dans son profil s'il est en section.
 */

export const TRAINING_CENTERS = [
  // ═══════════ PÔLES ESPOIRS FFHB ═══════════
  { id: "pole_ara", label: "Pôle Espoirs ARA", city: "Lyon", type: "pole" },
  { id: "pole_bfc", label: "Pôle Espoirs Bourgogne-FC", city: "Dijon", type: "pole" },
  { id: "pole_bretagne", label: "Pôle Espoirs Bretagne", city: "Rennes", type: "pole" },
  { id: "pole_centre", label: "Pôle Espoirs Centre-Val de Loire", city: "Orléans", type: "pole" },
  { id: "pole_corse", label: "Pôle Espoirs Corse", city: "Ajaccio", type: "pole" },
  { id: "pole_ge", label: "Pôle Espoirs Grand Est", city: "Strasbourg", type: "pole" },
  { id: "pole_hdf", label: "Pôle Espoirs Hauts-de-France", city: "Lille", type: "pole" },
  { id: "pole_idf", label: "Pôle Espoirs Île-de-France", city: "Eaubonne", type: "pole" },
  { id: "pole_normandie", label: "Pôle Espoirs Normandie", city: "Caen", type: "pole" },
  { id: "pole_na", label: "Pôle Espoirs Nouvelle-Aquitaine", city: "Talence", type: "pole" },
  { id: "pole_occ", label: "Pôle Espoirs Occitanie", city: "Montpellier", type: "pole" },
  { id: "pole_pdl", label: "Pôle Espoirs Pays de la Loire", city: "Nantes", type: "pole" },
  { id: "pole_paca", label: "Pôle Espoirs PACA", city: "Aix-en-Provence", type: "pole" },

  // ═══════════ CENTRES DE FORMATION MASCULINS (Starligue / Proligue) ═══════════
  { id: "cf_aix", label: "Pays d'Aix UCHB", city: "Aix-en-Provence", type: "pro_m" },
  { id: "cf_cesson", label: "Cesson-Rennes Métropole HB", city: "Cesson-Sévigné", type: "pro_m" },
  { id: "cf_chambery", label: "Chambéry Savoie Mont Blanc HB", city: "Chambéry", type: "pro_m" },
  { id: "cf_creteil", label: "US Créteil Handball", city: "Créteil", type: "pro_m" },
  { id: "cf_dunkerque", label: "Dunkerque HGL", city: "Dunkerque", type: "pro_m" },
  { id: "cf_istres", label: "Istres Provence HB", city: "Istres", type: "pro_m" },
  { id: "cf_ivry", label: "US Ivry Handball", city: "Ivry-sur-Seine", type: "pro_m" },
  { id: "cf_limoges", label: "Limoges Hand 87", city: "Limoges", type: "pro_m" },
  { id: "cf_massy", label: "Massy Essonne HB", city: "Massy", type: "pro_m" },
  { id: "cf_mhb", label: "Montpellier HB", city: "Montpellier", type: "pro_m" },
  { id: "cf_nantes", label: "HBC Nantes", city: "Nantes", type: "pro_m" },
  { id: "cf_nice", label: "Nice HB", city: "Nice", type: "pro_m" },
  { id: "cf_psg", label: "Paris Saint-Germain Handball", city: "Paris", type: "pro_m" },
  { id: "cf_saintraphael", label: "Saint-Raphaël VHB", city: "Saint-Raphaël", type: "pro_m" },
  { id: "cf_selestat", label: "Sélestat AHB", city: "Sélestat", type: "pro_m" },
  { id: "cf_tremblay", label: "Tremblay-en-France HB", city: "Tremblay-en-France", type: "pro_m" },

  // ═══════════ CENTRES DE FORMATION FÉMININS (LFH / D2F) ═══════════
  { id: "cff_besancon", label: "ES Besançon Féminin", city: "Besançon", type: "pro_f" },
  { id: "cff_bourg", label: "Bourg-de-Péage Drôme HB", city: "Bourg-de-Péage", type: "pro_f" },
  { id: "cff_brest", label: "Brest Bretagne HB", city: "Brest", type: "pro_f" },
  { id: "cff_chambray", label: "Chambray Touraine HB", city: "Chambray-lès-Tours", type: "pro_f" },
  { id: "cff_fleury", label: "Fleury Loiret HB", city: "Fleury-les-Aubrais", type: "pro_f" },
  { id: "cff_merignac", label: "Mérignac Handball", city: "Mérignac", type: "pro_f" },
  { id: "cff_metz", label: "Metz Handball", city: "Metz", type: "pro_f" },
  { id: "cff_nantes", label: "Nantes Loire-Atlantique HB", city: "Nantes", type: "pro_f" },
  { id: "cff_nice", label: "Nice HB Féminin", city: "Nice", type: "pro_f" },
  { id: "cff_paris92", label: "Paris 92", city: "Issy-les-Moulineaux", type: "pro_f" },
  { id: "cff_plan", label: "Plan-de-Cuques Allauch HB", city: "Plan-de-Cuques", type: "pro_f" },
  { id: "cff_toulon", label: "Toulon Saint-Cyr Var HB", city: "Toulon", type: "pro_f" },
];

export const CENTER_TYPE_META = {
  pole: { label: "Pôle Espoirs", color: "#FBBF24", icon: "🏆", priority: 1 },
  pro_m: { label: "Centre pro M", color: "#1D4ED8", icon: "⭐", priority: 2 },
  pro_f: { label: "Centre pro F", color: "#DB2777", icon: "⭐", priority: 2 },
};

// Méta affiché pour les joueurs en section sportive (champ is_section_sportive)
export const SECTION_SPORTIVE_META = { label: "Section sportive", color: "#10B981", icon: "🎓" };

export function getCenterById(id) {
  if (!id) return null;
  return TRAINING_CENTERS.find((c) => c.id === id) || null;
}

export function getCentersGrouped() {
  return {
    pole: TRAINING_CENTERS.filter((c) => c.type === "pole"),
    pro_m: TRAINING_CENTERS.filter((c) => c.type === "pro_m"),
    pro_f: TRAINING_CENTERS.filter((c) => c.type === "pro_f"),
  };
}
