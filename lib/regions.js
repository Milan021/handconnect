/**
 * Régions françaises (métropole + DOM-TOM regroupés).
 * Le code court (id) est stocké dans profiles.region.
 */

export const REGIONS = [
  { id: "ara",      label: "Auvergne-Rhône-Alpes" },
  { id: "bfc",      label: "Bourgogne-Franche-Comté" },
  { id: "bretagne", label: "Bretagne" },
  { id: "cvl",      label: "Centre-Val de Loire" },
  { id: "corse",    label: "Corse" },
  { id: "ge",       label: "Grand Est" },
  { id: "hdf",      label: "Hauts-de-France" },
  { id: "idf",      label: "Île-de-France" },
  { id: "normandie",label: "Normandie" },
  { id: "na",       label: "Nouvelle-Aquitaine" },
  { id: "occ",      label: "Occitanie" },
  { id: "pdl",      label: "Pays de la Loire" },
  { id: "paca",     label: "Provence-Alpes-Côte d'Azur" },
  { id: "domtom",   label: "Outre-mer (DOM-TOM)" },
];

export const REGION_MAP = Object.fromEntries(REGIONS.map(r => [r.id, r.label]));

export function getRegionLabel(id) {
  return REGION_MAP[id] || null;
}
