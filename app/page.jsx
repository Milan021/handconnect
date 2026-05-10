"use client";
import { useState, useMemo } from "react";

/* ═══════════════════════ MOCK DATA ═══════════════════════ */
const MOCK_PLAYERS = [
  { id: 1, user_first_name: "Lucas", user_last_name: "Moreau", position: "arriere_gauche", current_club: "USM Villeparisis", city: "Paris", rating: 4.7, height_cm: 192, weight_kg: 88, hand_side: "Droite", years_experience: 8, age: 26, is_available: true, bio: "Arrière puissant avec un tir à 9m redoutable. Leadership naturel.", tags: ["Tir puissant", "Leadership"], phone: "06 12 34 56 78", email: "lucas.moreau@email.com", ffhb_verified: true, ffhb_license: "0234589F", last_synced: "07/05/2026", premium: true,
    career: [
      { season: "2025-26", club: "USM Villeparisis", division: "N2", matches: 22, goals: 89, assists: 34, shots: 142, efficiency: 62.7, minutes: 1456, exclusions: 8, current: true },
      { season: "2024-25", club: "USM Villeparisis", division: "N2", matches: 26, goals: 94, assists: 28, shots: 158, efficiency: 59.5, minutes: 1689, exclusions: 11 },
      { season: "2023-24", club: "AS Cergy", division: "N3", matches: 24, goals: 78, assists: 19, shots: 132, efficiency: 59.1, minutes: 1542, exclusions: 9 },
    ] },
  { id: 2, user_first_name: "Aminata", user_last_name: "Diallo", position: "ailier_gauche", current_club: "AS Bondy", city: "Bondy", rating: 4.3, height_cm: 174, weight_kg: 68, hand_side: "Gauche", years_experience: 6, age: 24, is_available: true, bio: "Ailière explosive, très rapide en contre-attaque.", tags: ["Vitesse", "Contre-attaque"], phone: "06 23 45 67 89", email: "aminata.d@email.com", ffhb_verified: true, ffhb_license: "0345678F", last_synced: "06/05/2026", premium: false,
    career: [
      { season: "2025-26", club: "AS Bondy", division: "N3", matches: 20, goals: 67, assists: 45, shots: 95, efficiency: 70.5, minutes: 1320, exclusions: 4, current: true },
      { season: "2024-25", club: "AS Bondy", division: "N3", matches: 24, goals: 81, assists: 52, shots: 118, efficiency: 68.6, minutes: 1567, exclusions: 6 },
    ] },
  { id: 3, user_first_name: "Thomas", user_last_name: "Bernard", position: "pivot", current_club: "HBC Nantes Réserve", city: "Nantes", rating: 4.1, height_cm: 196, weight_kg: 102, hand_side: "Droite", years_experience: 10, age: 30, is_available: false, bio: "Pivot expérimenté, jeu de bloc.", tags: ["Bloc", "Puissance"], phone: "06 34 56 78 90", email: "thomas.b@email.com", ffhb_verified: true, ffhb_license: "0156789F", last_synced: "07/05/2026", premium: false,
    career: [
      { season: "2025-26", club: "HBC Nantes R.", division: "N1", matches: 18, goals: 45, assists: 22, shots: 68, efficiency: 66.2, minutes: 987, exclusions: 15, current: true },
      { season: "2024-25", club: "HBC Nantes R.", division: "N1", matches: 26, goals: 68, assists: 31, shots: 102, efficiency: 66.7, minutes: 1567, exclusions: 22 },
    ] },
  { id: 4, user_first_name: "Chloé", user_last_name: "Lefèvre", position: "demi_centre", current_club: null, city: "Lyon", rating: 4.5, height_cm: 175, weight_kg: 70, hand_side: "Droite", years_experience: 7, age: 27, is_available: true, bio: "Meneuse de jeu créative, vision exceptionnelle.", tags: ["Vision", "Passe décisive"], phone: "06 45 67 89 01", email: "chloe.lf@email.com", ffhb_verified: false, ffhb_license: null, last_synced: null, premium: true,
    career: [
      { season: "2024-25", club: "Lyon Métropole", division: "N1F", matches: 26, goals: 72, assists: 88, shots: 124, efficiency: 58.1, minutes: 1689, exclusions: 7 },
    ] },
  { id: 5, user_first_name: "Karim", user_last_name: "Benzarti", position: "gardien", current_club: "USAM Nîmes", city: "Nîmes", rating: 4.8, height_cm: 190, weight_kg: 92, hand_side: "Droite", years_experience: 12, age: 32, is_available: false, bio: "Gardien haut niveau, réflexes exceptionnels.", tags: ["Réflexes", "Envergure"], phone: "06 56 78 90 12", email: "karim.bz@email.com", ffhb_verified: true, ffhb_license: "0098765F", last_synced: "07/05/2026", premium: false,
    career: [
      { season: "2025-26", club: "USAM Nîmes", division: "Starligue", matches: 22, goals: 2, assists: 5, saves: 198, save_rate: 34.2, minutes: 1654, exclusions: 2, current: true, isGoalkeeper: true },
      { season: "2024-25", club: "USAM Nîmes", division: "Starligue", matches: 30, goals: 3, assists: 8, saves: 287, save_rate: 35.1, minutes: 2245, exclusions: 4, isGoalkeeper: true },
    ] },
  { id: 6, user_first_name: "Emma", user_last_name: "Petit", position: "ailier_droit", current_club: "Brest BH", city: "Brest", rating: 3.9, height_cm: 170, weight_kg: 64, hand_side: "Droite", years_experience: 4, age: 22, is_available: true, bio: "Jeune ailière prometteuse.", tags: ["Jeune talent", "Rapidité"], phone: "06 67 89 01 23", email: "emma.p@email.com", ffhb_verified: true, ffhb_license: "0445678F", last_synced: "05/05/2026", premium: false,
    career: [
      { season: "2025-26", club: "Brest BH", division: "D1F", matches: 18, goals: 54, assists: 28, shots: 78, efficiency: 69.2, minutes: 987, exclusions: 3, current: true },
    ] },
  { id: 7, user_first_name: "Yassine", user_last_name: "Khaldi", position: "arriere_droit", current_club: "Créteil", city: "Créteil", rating: 4.2, height_cm: 188, weight_kg: 85, hand_side: "Gauche", years_experience: 5, age: 25, is_available: true, bio: "Arrière gaucher, tir extérieur décisif.", tags: ["Tir extérieur", "Gaucher"], phone: "06 78 90 12 34", email: "yassine.k@email.com", ffhb_verified: true, ffhb_license: "0567890F", last_synced: "07/05/2026", premium: true,
    career: [
      { season: "2025-26", club: "Créteil", division: "N2", matches: 19, goals: 61, assists: 39, shots: 105, efficiency: 58.1, minutes: 1198, exclusions: 6, current: true },
    ] },
  { id: 8, user_first_name: "Inès", user_last_name: "Garcia", position: "demi_centre", current_club: "Metz HB", city: "Metz", rating: 4.6, height_cm: 172, weight_kg: 67, hand_side: "Droite", years_experience: 9, age: 28, is_available: false, bio: "Demi-centre d'expérience, capitaine.", tags: ["Capitaine", "Stratégie"], phone: "06 89 01 23 45", email: "ines.g@email.com", ffhb_verified: true, ffhb_license: "0678901F", last_synced: "06/05/2026", premium: false,
    career: [
      { season: "2025-26", club: "Metz HB", division: "D1F", matches: 22, goals: 80, assists: 95, shots: 145, efficiency: 55.2, minutes: 1654, exclusions: 5, current: true },
    ] },
];

/* ═════════════ ENTRAÎNEURS (Titre IV / V) ═════════════ */
const MOCK_TRAINERS = [
  { id: 101, first_name: "Marc", last_name: "Dubois", age: 42, city: "Lyon", region: "Auvergne-Rhône-Alpes",
    titles: { titre4: { obtained: true, year: 2015 }, titre5: { obtained: true, year: 2019 } },
    other_diplomas: ["BP JEPS Sports Co", "PSC1"],
    specialties: ["Performance adulte", "Système défensif"], coaching_style: "Discipliné, axé travail défensif",
    target_audience: ["seniors_h", "u18"], available_from: "01/07/2026", mobility_km: 100,
    salary_expectation: "1500-2200€/mois", years_coaching: 12, is_available: true,
    former_player: { was_pro: true, level: "N1" },
    career: [
      { season: "2024-25", club: "Bron Handball", role: "Entraîneur Seniors M", division: "N3", current: true },
      { season: "2022-24", club: "Lyon Caluire", role: "Adjoint + U18", division: "N2" },
      { season: "2019-22", club: "AS Saint-Priest", role: "Entraîneur Seniors", division: "Pré-N" },
    ],
    achievements: ["Montée Pré-N → N3 en 2021", "Champion régional U18 2023"],
    bio: "Ancien joueur N1, je transmets ce que j'ai vécu. Mon credo : la défense gagne les matchs.",
    phone: "06 11 22 33 44", email: "marc.dubois@email.com", premium: true },
  { id: 102, first_name: "Sophie", last_name: "Renard", age: 35, city: "Grenoble", region: "Auvergne-Rhône-Alpes",
    titles: { titre4: { obtained: true, year: 2018 }, titre5: { obtained: false } },
    other_diplomas: ["DEUST Animation Sportive"],
    specialties: ["Formation jeunes", "Babyhand"], coaching_style: "Pédagogue, ludique",
    target_audience: ["u11", "u13", "u15"], available_from: "01/09/2026", mobility_km: 50,
    salary_expectation: "1200-1600€/mois", years_coaching: 7, is_available: true,
    former_player: { was_pro: false, level: "N3" },
    career: [
      { season: "2024-25", club: "Grenoble Sud HB", role: "Responsable école de hand", division: "—", current: true },
      { season: "2021-24", club: "Échirolles HB", role: "Entraîneur U13/U15", division: "—" },
    ],
    achievements: ["Label école de hand Argent FFHB"],
    bio: "J'aime voir les jeunes grandir avec le hand. La technique d'abord, le jeu après.",
    phone: "06 22 33 44 55", email: "sophie.renard@email.com", premium: false },
  { id: 103, first_name: "Julien", last_name: "Martinez", age: 38, city: "Saint-Étienne", region: "Auvergne-Rhône-Alpes",
    titles: { titre4: { obtained: true, year: 2014 }, titre5: { obtained: true, year: 2018 } },
    other_diplomas: ["DE JEPS"],
    specialties: ["Performance adulte", "Préparation physique"], coaching_style: "Exigeant, axé physique",
    target_audience: ["seniors_h", "seniors_f"], available_from: "01/06/2026", mobility_km: 200,
    salary_expectation: "1800-2500€/mois", years_coaching: 15, is_available: true,
    former_player: { was_pro: false, level: "N2" },
    career: [
      { season: "2023-25", club: "Saint-Étienne HB", role: "Entraîneur Seniors M", division: "N2", current: true },
      { season: "2020-23", club: "AS Caluire", role: "Entraîneur Seniors M", division: "N3" },
    ],
    achievements: ["Maintien N2 3 saisons consécutives"],
    bio: "Coach exigeant. Je crois en la préparation physique comme socle de tout.",
    phone: "06 33 44 55 66", email: "julien.martinez@email.com", premium: true },
  { id: 104, first_name: "Léa", last_name: "Bonnet", age: 29, city: "Annecy", region: "Auvergne-Rhône-Alpes",
    titles: { titre4: { obtained: true, year: 2020 }, titre5: { obtained: false } },
    other_diplomas: ["Licence STAPS"],
    specialties: ["Animation socio-sportive", "Handball loisir"], coaching_style: "Bienveillante, inclusive",
    target_audience: ["u13", "loisir", "féminines"], available_from: "01/08/2026", mobility_km: 80,
    salary_expectation: "1100-1500€/mois", years_coaching: 4, is_available: true,
    former_player: { was_pro: false, level: "Pré-N" },
    career: [
      { season: "2023-25", club: "Annecy HB", role: "Animatrice + U13F", division: "—", current: true },
    ],
    achievements: ["Doublement effectif U11 féminin en 2 ans"],
    bio: "Le hand pour tous, à tous les niveaux.",
    phone: "06 44 55 66 77", email: "lea.bonnet@email.com", premium: false },
  { id: 105, first_name: "Pierre", last_name: "Vallier", age: 47, city: "Clermont-Ferrand", region: "Auvergne-Rhône-Alpes",
    titles: { titre4: { obtained: true, year: 2010 }, titre5: { obtained: true, year: 2014 } },
    other_diplomas: ["DE JEPS Perf Sportive", "Master Entraînement Sportif"],
    specialties: ["Direction technique", "Coordination club", "Performance"], coaching_style: "Stratège, structurant",
    target_audience: ["seniors_h", "u18"], available_from: "01/07/2026", mobility_km: 300,
    salary_expectation: "2200-3000€/mois", years_coaching: 20, is_available: false,
    former_player: { was_pro: true, level: "Proligue" },
    career: [
      { season: "2022-25", club: "Clermont HB", role: "DTC + Entraîneur Seniors", division: "N1", current: true },
      { season: "2018-22", club: "Pôle Espoirs Cournon", role: "Entraîneur", division: "—" },
    ],
    achievements: ["Montée N2 → N1 en 2024", "Formation 6 joueurs centre formation pro"],
    bio: "Ex-pro Proligue, 20 ans de coaching. Construire un projet sportif global, c'est ma passion.",
    phone: "06 55 66 77 88", email: "pierre.vallier@email.com", premium: true },
];

const MOCK_CLUBS = [
  { id: 1, name: "USM Villeparisis", short_name: "USMV", city: "Villeparisis", division: "Nationale 2", seeking_positions: ["pivot", "ailier_gauche"], members_count: 45, contact_email: "contact@usmv-hand.fr", contact_phone: "01 60 12 34 56", subscription: "premium" },
  { id: 2, name: "AS Bondy Handball", short_name: "ASB", city: "Bondy", division: "Nationale 3", seeking_positions: ["gardien", "demi_centre"], members_count: 38, contact_email: "secretariat@asb-hand.fr", contact_phone: "01 48 23 45 67", subscription: "standard" },
  { id: 3, name: "HBC Nantes Réserve", short_name: "HBCN", city: "Nantes", division: "Nationale 1", seeking_positions: [], members_count: 52, contact_email: "reserve@hbcnantes.com", contact_phone: "02 40 34 56 78", subscription: "premium" },
  { id: 4, name: "Brest Bretagne HB", short_name: "BBH", city: "Brest", division: "D1F", seeking_positions: ["arriere_gauche"], members_count: 30, contact_email: "contact@bbh.fr", contact_phone: "02 98 45 67 89", subscription: "standard" },
  { id: 5, name: "USAM Nîmes Gard", short_name: "USAM", city: "Nîmes", division: "Starligue", seeking_positions: ["pivot", "ailier_droit"], members_count: 28, contact_email: "club@usam-nimes.fr", contact_phone: "04 66 56 78 90", subscription: "premium" },
];

const MOCK_ANNONCES_PLAYERS = [
  { id: 1, type: "player", title: "Pivot expérimenté recherché", club_id: 1, club_name: "USM Villeparisis", division: "N2", city: "Villeparisis", position: "pivot", min_goals_per_match: 3, description: "Recherchons un pivot solide. Min 3 ans d'expérience.", is_urgent: true, candidatures_count: 7,
    benefits: { prime: { active: true, amount: "150€/match + bonus victoire" }, logement: { active: true, type: "Chambre chez un dirigeant", details: "Chambre meublée à 10min du gymnase" }, job: { active: true, partner: "Décathlon Villeparisis", role: "Vendeur sport co.", contract: "CDI 25h/semaine", salary: "1100€ net/mois" }, formation: { active: false } } },
  { id: 2, type: "player", title: "Gardien(ne) saison 2026-2027", club_id: 2, club_name: "AS Bondy", division: "N3", city: "Bondy", position: "gardien", description: "Profil fiable pour la saison.", is_urgent: false, candidatures_count: 12,
    benefits: { prime: { active: true, amount: "80€/match" }, logement: { active: false }, job: { active: true, partner: "Crédit Agricole Bondy", role: "Conseiller clientèle", contract: "Alternance / CDI", salary: "Selon profil" }, formation: { active: true, type: "BTS Banque", details: "Formation prise en charge par l'entreprise" } } },
  { id: 3, type: "player", title: "Ailier gauche rapide", club_id: 5, club_name: "USAM Nîmes", division: "Starligue", city: "Nîmes", position: "ailier_gauche", min_goals_per_match: 2, description: "Profil athlétique pour aile gauche.", is_urgent: true, candidatures_count: 4,
    benefits: { prime: { active: true, amount: "300€/match" }, logement: { active: true, type: "T2 meublé", details: "Centre-ville Nîmes" }, job: { active: false }, formation: { active: false } } },
];

const MOCK_ANNONCES_TRAINERS = [
  { id: 201, type: "trainer", title: "Entraîneur Seniors Masculins N3", club_id: 2, club_name: "AS Bondy", division: "N3", city: "Bondy",
    required_titre: "titre5", target_audience: "seniors_h", weekly_hours: 12, contract_type: "CDD 1 saison", salary_range: "1400-1800€/mois",
    description: "Recherchons un entraîneur Titre V pour notre équipe Seniors masculins en N3. Mission : maintien et développement du collectif.",
    is_urgent: false, candidatures_count: 5,
    benefits: { prime: { active: true, amount: "Bonus performance fin de saison" }, logement: { active: false }, job: { active: false }, formation: { active: false } } },
  { id: 202, type: "trainer", title: "Éducateur jeunes (U13-U15)", club_id: 4, club_name: "Brest BH", division: "D1F", city: "Brest",
    required_titre: "titre4", target_audience: "u13_u15", weekly_hours: 8, contract_type: "CDI temps partiel", salary_range: "900-1300€/mois",
    description: "Notre école de hand recherche un éducateur Titre IV pour encadrer les U13 et U15. Projet pédagogique en cours de structuration.",
    is_urgent: false, candidatures_count: 8,
    benefits: { prime: { active: false }, logement: { active: true, type: "Aide au logement", details: "Réseau de propriétaires partenaires" }, job: { active: false }, formation: { active: true, type: "Modules complémentaires", details: "Possibilité de suivre des modules Titre V via l'ITFE" } } },
];

const MOCK_ENTREPRISES = [
  { id: 1, name: "Décathlon", sector: "Équipement sportif", logo: "🏪", description: "Partenaire équipement officiel.", offers: ["Réduction -30% équipement", "Sponsoring maillots", "Postes vendeurs"], budget: "5k-20k€", type: "Équipementier", color: "#0082C3", contact_email: "partenariats@decathlon.com", contact_phone: "03 20 33 55 00", partner_clubs: 12, sponsorship_plan: "annual" },
  { id: 2, name: "Groupama", sector: "Assurance", logo: "🛡️", description: "Assurance adaptée aux clubs et joueurs.", offers: ["Assurance joueur", "RC club", "Postes commerciaux"], budget: "2k-10k€", type: "Assureur", color: "#00A650", contact_email: "sport@groupama.fr", contact_phone: "01 44 56 78 90", partner_clubs: 6, sponsorship_plan: "annual" },
  { id: 3, name: "Région Île-de-France", sector: "Collectivité", logo: "🏛️", description: "Subventions handball amateur.", offers: ["Subvention", "Aide équipement", "Financement formation"], budget: "10k-50k€", type: "Institution", color: "#E30613", contact_email: "sport@iledefrance.fr", contact_phone: "01 53 85 53 85", partner_clubs: 24, sponsorship_plan: "premium" },
  { id: 4, name: "Crédit Agricole", sector: "Banque", logo: "🏦", description: "Recrute sportifs en alternance.", offers: ["Compte asso gratuit", "Prêt équipement", "Postes alternance"], budget: "Variable", type: "Banque", color: "#009F4D", contact_email: "asso@credit-agricole.fr", contact_phone: "09 69 39 92 91", partner_clubs: 18, sponsorship_plan: "annual" },
  { id: 5, name: "Kinesport", sector: "Santé", logo: "💪", description: "Réseau kinésithérapeutes sport.", offers: ["Bilan préventif", "Suivi équipe", "Postes assistants"], budget: "3k-15k€", type: "Santé", color: "#8B5CF6", contact_email: "clubs@kinesport.fr", contact_phone: "04 67 12 34 56", partner_clubs: 8, sponsorship_plan: "annual" },
];

const MOCK_STATS = { total_players: 847, total_clubs: 126, total_trainers: 184, active_annonces: 34, available_players: 312, available_trainers: 67, total_entreprises: 89, ffhb_verified_players: 612, paying_clubs: 38, paying_users: 142, mrr_eur: 2850 };

/* ═════════════ PRICING TIERS (évolutif) ═════════════ */
const PRICING = {
  club_free: { price_monthly: 0, price_yearly: 0, label: "Club Free", features: ["1 annonce active", "Voir 10 profils max", "Messagerie limitée"] },
  club_standard: { price_monthly: 19, price_yearly: 190, label: "Club Standard", features: ["Annonces illimitées", "Tous les profils", "Messagerie illimitée", "Alertes nouveaux candidats"] },
  club_premium: { price_monthly: 49, price_yearly: 490, label: "Club Premium", features: ["Tout Standard +", "Mise en avant annonces", "Stats FFHB avancées", "Suggestions IA priorité", "Support prioritaire"] },
  player_free: { price_monthly: 0, price_yearly: 0, label: "Joueur Free", features: ["Profil basique", "Candidatures illimitées"] },
  player_boost: { price_monthly: 5, price_yearly: 50, label: "Joueur Boost", features: ["Profil mis en avant", "Stats de visite", "Badge actif", "Apparaît en premier dans les recherches"] },
  trainer_free: { price_monthly: 0, price_yearly: 0, label: "Entraîneur Free", features: ["Profil basique"] },
  trainer_pro: { price_monthly: 10, price_yearly: 100, label: "Entraîneur Pro", features: ["Visibilité accrue", "Alertes prioritaires", "Profil mis en avant", "Stats de visite"] },
  sponsor_annual: { price_yearly: 500, label: "Sponsor Standard", features: ["Page entreprise dédiée", "Mise en avant", "Stats de vue"] },
  sponsor_premium: { price_yearly: 2000, label: "Sponsor Premium", features: ["Tout Standard +", "Multi-clubs", "Analytics détaillées", "Évènements partenaires"] },
};

const POS_LABELS = { gardien: "Gardien", ailier_gauche: "Ailier G.", ailier_droit: "Ailier D.", arriere_gauche: "Arrière G.", arriere_droit: "Arrière D.", demi_centre: "Demi-centre", pivot: "Pivot" };

const TARGET_AUDIENCE_LABELS = { u11: "U11", u13: "U13", u15: "U15", u18: "U18", seniors_h: "Seniors M", seniors_f: "Seniors F", loisir: "Loisir", féminines: "Féminines", u13_u15: "U13/U15" };

const BENEFIT_META = {
  prime: { icon: "💰", label: "Prime", color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
  logement: { icon: "🏠", label: "Logement", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  job: { icon: "💼", label: "Job", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  formation: { icon: "🎓", label: "Formation", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
};

/* Helpers */
function getCurrentSeason(player) { return player.career.find(s => s.current) || player.career[0]; }
function getCurrentTrainerJob(trainer) { return trainer.career.find(s => s.current) || trainer.career[0]; }
function getGoalsPerMatch(player) {
  const cur = getCurrentSeason(player);
  if (!cur || !cur.matches) return 0;
  return ((cur.goals || 0) / cur.matches).toFixed(1);
}
function getCompatibilityScore(player, annonce) {
  let score = 0; let factors = [];
  if (player.position === annonce.position) { score += 40; factors.push("Poste identique"); }
  const cur = getCurrentSeason(player);
  if (!cur) return { score: 0, factors: [] };
  if (cur.division === annonce.division) { score += 25; factors.push("Même division"); }
  else { score += 10; factors.push("Division proche"); }
  if (player.is_available) { score += 15; factors.push("Disponible"); }
  if (player.ffhb_verified) { score += 10; factors.push("Stats vérifiées FFHB"); }
  const gpm = parseFloat(getGoalsPerMatch(player));
  if (annonce.min_goals_per_match && gpm >= annonce.min_goals_per_match) { score += 10; factors.push(`${gpm} buts/match`); }
  return { score: Math.min(score, 100), factors };
}
function getTrainerCompatibility(trainer, annonce) {
  let score = 0; let factors = [];
  if (annonce.required_titre === "titre5" && trainer.titles.titre5.obtained) { score += 40; factors.push("Titre V validé"); }
  else if (annonce.required_titre === "titre4" && trainer.titles.titre4.obtained) { score += 40; factors.push("Titre IV validé"); }
  if (trainer.target_audience.some(a => annonce.target_audience.includes(a))) { score += 25; factors.push("Public coaché compatible"); }
  if (trainer.is_available) { score += 20; factors.push("Disponible"); }
  if (trainer.years_coaching >= 5) { score += 10; factors.push(`${trainer.years_coaching} ans d'expérience`); }
  if (trainer.former_player?.was_pro) { score += 5; factors.push("Ancien pro"); }
  return { score: Math.min(score, 100), factors };
}

/* ═══════════════════════ SMALL COMPONENTS ═══════════════════════ */
function Stars({ r }) {
  return (
    <span style={{ letterSpacing: 2, display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(r) ? "#FBBF24" : "rgba(255,255,255,0.1)", fontSize: 13 }}>★</span>)}
      <span style={{ marginLeft: 6, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>{Number(r).toFixed(1)}</span>
    </span>
  );
}

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const colors = { error: ["rgba(239,68,68,0.15)", "rgba(239,68,68,0.3)", "#FCA5A5"], info: ["rgba(59,130,246,0.15)", "rgba(59,130,246,0.3)", "#93C5FD"], success: ["rgba(16,185,129,0.15)", "rgba(16,185,129,0.3)", "#6EE7B7"] };
  const c = colors[type] || colors.success;
  return (
    <div style={{ position: "fixed", top: 24, right: 24, padding: "14px 22px", borderRadius: 16, zIndex: 9999, background: c[0], backdropFilter: "blur(20px)", border: `1px solid ${c[1]}`, color: c[2], fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "slideDown .4s cubic-bezier(0.16,1,0.3,1)", display: "flex", alignItems: "center", gap: 10 }}>
      {msg}<span onClick={onClose} style={{ marginLeft: 8, cursor: "pointer", opacity: 0.5, fontSize: 16 }}>✕</span>
    </div>
  );
}

const inputStyle = { padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#F1F5F9", fontSize: 14, fontFamily: "'Instrument Sans', sans-serif", boxSizing: "border-box", outline: "none", transition: "all .25s ease", width: "100%" };

function BenefitTag({ kind }) {
  const m = BENEFIT_META[kind];
  if (!m) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: m.bg, color: m.color, borderRadius: 8, fontSize: 10, fontWeight: 700, border: `1px solid ${m.color}25` }}><span>{m.icon}</span><span>{m.label}</span></span>;
}

function FFHBBadge({ verified, size = "md" }) {
  if (!verified) return null;
  const isSm = size === "sm", isLg = size === "lg";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: isLg ? 8 : 5, padding: isLg ? "6px 14px" : isSm ? "3px 8px" : "4px 10px", background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))", color: "#93C5FD", borderRadius: isLg ? 10 : 8, fontSize: isLg ? 12 : isSm ? 9 : 10, fontWeight: 700, border: "1px solid rgba(59,130,246,0.25)", letterSpacing: 0.5 }}>
      <span style={{ fontSize: isLg ? 14 : 11 }}>✓</span>
      <span style={{ fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>FFHB Vérifié</span>
    </span>
  );
}

/* Premium Crown — visible on profiles with paid plan */
function PremiumBadge({ size = "sm" }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: size === "sm" ? "3px 8px" : "5px 12px", background: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(255,107,53,0.1))", color: "#FBBF24", borderRadius: 8, fontSize: size === "sm" ? 9 : 11, fontWeight: 700, border: "1px solid rgba(251,191,36,0.3)", letterSpacing: 0.5, textTransform: "uppercase" }}>
    <span style={{ fontSize: 10 }}>👑</span>
    <span style={{ fontFamily: "'Space Mono', monospace" }}>Boost</span>
  </span>;
}

/* Title Badge for trainers (Titre IV / V) */
function TitleBadge({ titre, size = "sm" }) {
  const meta = { titre4: { label: "Titre IV", color: "#10B981", bg: "rgba(16,185,129,0.12)" }, titre5: { label: "Titre V", color: "#FF6B35", bg: "rgba(255,107,53,0.12)" } }[titre];
  if (!meta) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: size === "sm" ? "3px 9px" : "5px 12px", background: meta.bg, color: meta.color, borderRadius: 8, fontSize: size === "sm" ? 10 : 12, fontWeight: 700, border: `1px solid ${meta.color}30`, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>{meta.label}</span>;
}

function DivisionBadge({ division, size = "sm" }) {
  const isPro = ["Starligue", "Proligue", "D1F"].includes(division);
  const isNat = ["N1", "N1F", "N2", "N2F", "N3", "Nationale 1", "Nationale 2", "Nationale 3"].includes(division);
  const color = isPro ? "#FBBF24" : isNat ? "#FF6B35" : "#94A3B8";
  const bg = isPro ? "rgba(251,191,36,0.1)" : isNat ? "rgba(255,107,53,0.1)" : "rgba(148,163,184,0.08)";
  return <span style={{ display: "inline-flex", alignItems: "center", padding: size === "sm" ? "2px 8px" : "3px 10px", background: bg, color, borderRadius: 6, fontSize: size === "sm" ? 9 : 10, fontWeight: 700, border: `1px solid ${color}25`, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Space Mono', monospace" }}>{division}</span>;
}

function CompatibilityRing({ score, size = 60 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#FBBF24" : score >= 40 ? "#FF6B35" : "#94A3B8";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={4} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset .8s ease" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={color} style={{ fontSize: size * 0.32, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
    </svg>
  );
}

function MiniBarChart({ data, color = "#FF6B35", valueKey = "goals", labelKey = "season" }) {
  if (!data || data.length === 0) return null;
  const reversed = [...data].reverse();
  const max = Math.max(...reversed.map(d => d[valueKey] || 0));
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80, padding: "4px 0" }}>
        {reversed.map((d, i) => {
          const v = d[valueKey] || 0; const h = max > 0 ? (v / max) * 100 : 0;
          return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif" }}>{v}</div>
            <div style={{ width: "100%", height: `${h}%`, minHeight: 2, borderRadius: "3px 3px 0 0", background: `linear-gradient(180deg, ${color} 0%, ${color}33 100%)`, transition: "height .6s ease" }} />
          </div>;
        })}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        {reversed.map((d, i) => <div key={i} style={{ flex: 1, fontSize: 9, color: "rgba(255,255,255,0.35)", textAlign: "center", fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>{d[labelKey].replace("20", "'")}</div>)}
      </div>
    </div>
  );
}

/* ═════════════ UPGRADE PROMPT (when free user hits a limit) ═════════════ */
function UpgradePrompt({ open, plan, onClose, onUpgrade }) {
  if (!open) return null;
  const planMeta = PRICING[plan];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", zIndex: 2500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg, #141829 0%, #0d1117 100%)", borderRadius: 24, maxWidth: 460, width: "100%", overflow: "hidden", border: "1px solid rgba(255,107,53,0.25)", boxShadow: "0 40px 100px rgba(255,107,53,0.15)", animation: "modalUp .4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ padding: "28px 32px 22px", background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(251,191,36,0.05))", borderBottom: "1px solid rgba(255,107,53,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔓</div>
          <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#F1F5F9" }}>DÉBLOQUER {planMeta?.label?.toUpperCase()}</h2>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Cette fonctionnalité fait partie du plan {planMeta?.label}</p>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ marginBottom: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {planMeta?.features.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(16,185,129,0.05)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.1)" }}>
                <span style={{ color: "#10B981", fontSize: 14, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,107,53,0.06)", borderRadius: 14, padding: 16, marginBottom: 18, textAlign: "center", border: "1px solid rgba(255,107,53,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 36, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 800, color: "#FF6B35" }}>{planMeta?.price_monthly}€</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/mois</span>
            </div>
            {planMeta?.price_yearly && <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>ou <strong style={{ color: "#FBBF24" }}>{planMeta.price_yearly}€/an</strong> (2 mois offerts)</p>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "13px 0", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif" }}>Plus tard</button>
            <button onClick={onUpgrade} style={{ flex: 2, padding: "13px 0", border: "none", borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #C13C00)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif", boxShadow: "0 8px 24px rgba(255,107,53,0.3)" }}>Passer au plan {planMeta?.label?.split(" ")[1]} →</button>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5 }}>Sans engagement · Annulable à tout moment · Paiement sécurisé Stripe</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ PLAYER CARD & MODAL ═══════════════════════ */
function PlayerCard({ p, onClick, index, locked }) {
  const cur = getCurrentSeason(p);
  return (
    <div onClick={() => onClick(p)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 20, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", transition: "all .4s cubic-bezier(0.16,1,0.3,1)", position: "relative", animation: `fadeUp .5s cubic-bezier(0.16,1,0.3,1) ${index * 0.05}s both`, opacity: locked ? 0.55 : 1 }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(255,107,53,0.12)"; e.currentTarget.style.borderColor = "rgba(255,107,53,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
      {locked && (
        <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "rgba(10,14,26,0.6)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>Plan Standard requis</span>
        </div>
      )}
      {p.is_available && <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, display: "flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.15)", backdropFilter: "blur(10px)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.25)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
        <span style={{ color: "#6EE7B7", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>Dispo</span>
      </div>}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        {p.ffhb_verified && <FFHBBadge verified={true} size="sm" />}
        {p.premium && <PremiumBadge size="sm" />}
      </div>
      <div style={{ height: 88, background: "linear-gradient(135deg, rgba(255,107,53,0.6) 0%, rgba(168,50,0,0.8) 100%)", position: "relative" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "3px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#FF6B35", fontFamily: "'Bebas Neue', sans-serif", position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>{p.user_first_name[0]}{p.user_last_name[0]}</div>
      </div>
      <div style={{ padding: "32px 16px 16px", textAlign: "center" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{p.user_first_name} {p.user_last_name}</h3>
        <p style={{ margin: "3px 0", fontSize: 10, color: "#FF6B35", fontWeight: 700, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>{POS_LABELS[p.position]}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
          <span>{p.current_club || "Sans club"}</span>
          {cur && <DivisionBadge division={cur.division} />}
        </div>
        <div style={{ margin: "10px 0 12px" }}><Stars r={p.rating} /></div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            ["Buts", cur?.isGoalkeeper ? cur?.saves : cur?.goals],
            ["MJ", cur?.matches],
            [cur?.isGoalkeeper ? "%Arr." : "Eff.", cur?.isGoalkeeper ? `${cur?.save_rate}%` : `${cur?.efficiency}%`],
          ].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Bebas Neue', sans-serif" }}>{v}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerModal({ player, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!player) return null;
  const cur = getCurrentSeason(player); const isGK = cur?.isGoalkeeper;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg, #141829 0%, #0d1117 100%)", borderRadius: 24, maxWidth: 600, width: "100%", overflow: "hidden", maxHeight: "92vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)", animation: "modalUp .4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ height: 130, background: "linear-gradient(135deg, #FF6B35 0%, #C13C00 100%)", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          {player.ffhb_verified && <div style={{ position: "absolute", top: 14, left: 14 }}><FFHBBadge verified={true} size="md" /></div>}
          <div style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg, #141829, #1a1a2e)", border: "4px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#FF6B35", fontFamily: "'Bebas Neue', sans-serif", position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>{player.user_first_name[0]}{player.user_last_name[0]}</div>
        </div>
        <div style={{ padding: "52px 28px 0", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#F1F5F9" }}>{player.user_first_name} {player.user_last_name}</h2>
          <p style={{ color: "#FF6B35", fontWeight: 700, fontSize: 11, fontFamily: "'Space Mono', monospace", margin: "5px 0", textTransform: "uppercase", letterSpacing: 2 }}>{POS_LABELS[player.position]}</p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{player.current_club || "Sans club"} · {player.city} · {player.age} ans</p>
          <div style={{ margin: "12px 0" }}><Stars r={player.rating} /></div>
        </div>
        <div style={{ padding: "0 28px", marginTop: 8 }}>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 3 }}>
            {[["overview", "Vue d'ensemble"], ["stats", "Stats"], ["contact", "Contact"]].map(([k, lbl]) => (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer", background: tab === k ? "rgba(255,107,53,0.15)" : "transparent", color: tab === k ? "#FF6B35" : "rgba(255,255,255,0.35)" }}>{lbl}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 28px 28px" }}>
          {tab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, margin: "10px 0 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                {[["Taille", `${player.height_cm}cm`], ["Poids", `${player.weight_kg}kg`], ["Main", player.hand_side], ["Exp.", `${player.years_experience}a`]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Bebas Neue', sans-serif" }}>{v}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              {cur && (
                <div style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,107,53,0.02))", borderRadius: 16, padding: 18, border: "1px solid rgba(255,107,53,0.15)" }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Saison en cours</span>
                  <p style={{ margin: "2px 0 12px", fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{cur.season} · {cur.club} · {cur.division}</p>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    {(isGK ? [["Arrêts", cur.saves], ["%Arrêts", `${cur.save_rate}%`], ["MJ", cur.matches]] : [["Buts", cur.goals], ["Passes", cur.assists], ["Eff.", `${cur.efficiency}%`], ["MJ", cur.matches]]).map(([l, v]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color: "#FF6B35", fontFamily: "'Bebas Neue', sans-serif" }}>{v}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {player.bio && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "16px 0 10px" }}>{player.bio}</p>}
              {player.tags && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", margin: "10px 0 0" }}>
                  {player.tags.map(t => <span key={t} style={{ background: "rgba(255,107,53,0.1)", color: "#FF6B35", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,107,53,0.15)" }}>{t}</span>)}
                </div>
              )}
            </>
          )}
          {tab === "stats" && (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 18, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>📊 {isGK ? "Arrêts" : "Buts"} par saison</h4>
                <MiniBarChart data={player.career} valueKey={isGK ? "saves" : "goals"} color="#FF6B35" />
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>📈 {isGK ? "% Arrêts" : "Efficacité"}</h4>
                <MiniBarChart data={player.career} valueKey={isGK ? "save_rate" : "efficiency"} color="#10B981" />
              </div>
              <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(59,130,246,0.05)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.1)", fontSize: 11, color: "rgba(147,197,253,0.7)", textAlign: "center" }}>
                {player.ffhb_verified ? <>✓ Données officielles FFHB · Sync {player.last_synced}</> : <>⚠ Stats déclaratives</>}
              </div>
            </>
          )}
          {tab === "contact" && (
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Coordonnées</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: 10 }}><span style={{ fontSize: 14 }}>📱</span><span style={{ fontSize: 13, color: "#F1F5F9", fontFamily: "'Space Mono', monospace" }}>{player.phone}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: 10 }}><span style={{ fontSize: 14 }}>✉️</span><span style={{ fontSize: 13, color: "#F1F5F9", fontFamily: "'Space Mono', monospace" }}>{player.email}</span></div>
              </div>
              <p style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, textAlign: "center" }}>Le contact se fait directement entre vous. HandConnect est une plateforme de mise en relation, sans intermédiaire dans le contrat.</p>
            </div>
          )}
          <button style={{ width: "100%", marginTop: 16, padding: "13px 0", border: "none", borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #C13C00)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,53,0.25)" }}>💬 Envoyer un message</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TRAINER CARD & MODAL ═══════════════════════ */
function TrainerCard({ t, onClick, index, locked }) {
  const cur = getCurrentTrainerJob(t);
  const highestTitre = t.titles.titre5.obtained ? "titre5" : t.titles.titre4.obtained ? "titre4" : null;
  return (
    <div onClick={() => onClick(t)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 20, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", transition: "all .4s cubic-bezier(0.16,1,0.3,1)", position: "relative", animation: `fadeUp .5s cubic-bezier(0.16,1,0.3,1) ${index * 0.05}s both`, opacity: locked ? 0.55 : 1 }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(139,92,246,0.12)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
      {locked && (
        <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "rgba(10,14,26,0.6)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>Plan Standard requis</span>
        </div>
      )}
      {t.is_available && <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, display: "flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.15)", backdropFilter: "blur(10px)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.25)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
        <span style={{ color: "#6EE7B7", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>Dispo</span>
      </div>}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        {highestTitre && <TitleBadge titre={highestTitre} size="sm" />}
        {t.premium && <PremiumBadge size="sm" />}
      </div>
      <div style={{ height: 88, background: "linear-gradient(135deg, rgba(139,92,246,0.6) 0%, rgba(91,33,182,0.8) 100%)", position: "relative" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "3px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#8B5CF6", fontFamily: "'Bebas Neue', sans-serif", position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>{t.first_name[0]}{t.last_name[0]}</div>
      </div>
      <div style={{ padding: "32px 16px 16px", textAlign: "center" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{t.first_name} {t.last_name}</h3>
        <p style={{ margin: "3px 0", fontSize: 10, color: "#8B5CF6", fontWeight: 700, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>Entraîneur · {t.years_coaching} ans</p>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{cur?.club} · {t.city}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", margin: "10px 0 12px" }}>
          {t.target_audience.slice(0, 3).map(a => <span key={a} style={{ background: "rgba(139,92,246,0.1)", color: "#A78BFA", fontSize: 9, padding: "2px 8px", borderRadius: 6, fontWeight: 600, border: "1px solid rgba(139,92,246,0.15)" }}>{TARGET_AUDIENCE_LABELS[a] || a}</span>)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            ["Saisons", t.career.length],
            ["Mobilité", `${t.mobility_km}km`],
            ["Ex-pro", t.former_player?.was_pro ? "✓" : "—"],
          ].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Bebas Neue', sans-serif" }}>{v}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainerModal({ trainer, onClose }) {
  if (!trainer) return null;
  const t = trainer;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg, #141829 0%, #0d1117 100%)", borderRadius: 24, maxWidth: 600, width: "100%", overflow: "hidden", maxHeight: "92vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)", animation: "modalUp .4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ height: 130, background: "linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
            {t.titles.titre4.obtained && <TitleBadge titre="titre4" size="md" />}
            {t.titles.titre5.obtained && <TitleBadge titre="titre5" size="md" />}
          </div>
          <div style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg, #141829, #1a1a2e)", border: "4px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#8B5CF6", fontFamily: "'Bebas Neue', sans-serif", position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>{t.first_name[0]}{t.last_name[0]}</div>
        </div>
        <div style={{ padding: "52px 28px 0", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#F1F5F9" }}>{t.first_name} {t.last_name}</h2>
          <p style={{ color: "#8B5CF6", fontWeight: 700, fontSize: 11, fontFamily: "'Space Mono', monospace", margin: "5px 0", textTransform: "uppercase", letterSpacing: 2 }}>Entraîneur · {t.years_coaching} ans d'expérience</p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{t.city} · {t.age} ans · Mobilité {t.mobility_km}km</p>
        </div>
        <div style={{ padding: "20px 28px 28px" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, textAlign: "center", margin: "0 0 20px" }}>{t.bio}</p>

          {/* Specialties */}
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>🎯 Spécialités</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {t.specialties.map(s => <span key={s} style={{ background: "rgba(139,92,246,0.1)", color: "#A78BFA", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(139,92,246,0.15)" }}>{s}</span>)}
            </div>
          </div>

          {/* Target audience */}
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>👥 Public coaché</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {t.target_audience.map(a => <span key={a} style={{ background: "rgba(255,107,53,0.1)", color: "#FF6B35", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,107,53,0.15)" }}>{TARGET_AUDIENCE_LABELS[a] || a}</span>)}
            </div>
          </div>

          {/* Career */}
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>📅 Parcours coaching</h4>
            <div style={{ position: "relative", paddingLeft: 18 }}>
              <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: "linear-gradient(180deg, rgba(139,92,246,0.4), rgba(139,92,246,0.05))" }} />
              {t.career.map((s, i) => (
                <div key={i} style={{ position: "relative", paddingBottom: i < t.career.length - 1 ? 12 : 0 }}>
                  <div style={{ position: "absolute", left: -16, top: 4, width: 11, height: 11, borderRadius: "50%", background: s.current ? "#8B5CF6" : "rgba(139,92,246,0.3)", border: "2px solid #0a0e1a" }} />
                  <div style={{ background: s.current ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 14px", border: `1px solid ${s.current ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{s.season}</span>
                      {s.division !== "—" && <DivisionBadge division={s.division} />}
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{s.role}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{s.club}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {t.achievements?.length > 0 && (
            <div style={{ marginBottom: 18, background: "rgba(251,191,36,0.05)", borderRadius: 12, padding: 14, border: "1px solid rgba(251,191,36,0.12)" }}>
              <h4 style={{ fontSize: 11, color: "#FBBF24", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>🏆 Réalisations</h4>
              {t.achievements.map(a => <div key={a} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", padding: "3px 0" }}>· {a}</div>)}
            </div>
          )}

          {/* Salary */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, marginBottom: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Prétentions salariales</span>
              <span style={{ fontSize: 14, color: "#FF6B35", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{t.salary_expectation}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Disponible à partir du</span>
              <span style={{ fontSize: 12, color: "#F1F5F9", fontFamily: "'Space Mono', monospace" }}>{t.available_from}</span>
            </div>
          </div>

          {/* Other diplomas */}
          {t.other_diplomas?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>🎓 Autres diplômes</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {t.other_diplomas.map(d => <span key={d} style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)", fontSize: 11, padding: "3px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>{d}</span>)}
              </div>
            </div>
          )}

          {/* Contact */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}><span>📱</span><span style={{ color: "#F1F5F9", fontFamily: "'Space Mono', monospace" }}>{t.phone}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}><span>✉️</span><span style={{ color: "#F1F5F9", fontFamily: "'Space Mono', monospace" }}>{t.email}</span></div>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, textAlign: "center", marginBottom: 16, padding: "10px 14px", background: "rgba(59,130,246,0.04)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.08)" }}>
            ℹ️ HandConnect est une plateforme de mise en relation. La conclusion du contrat se fait directement entre l'entraîneur et le club.
          </p>

          <button style={{ width: "100%", padding: "13px 0", border: "none", borderRadius: 12, background: "linear-gradient(135deg, #8B5CF6, #5B21B6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(139,92,246,0.25)" }}>💬 Contacter cet entraîneur</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ ANNONCE CARDS (PLAYERS + TRAINERS) ═══════════════════════ */
function AnnonceCard({ a, index, onClick, suggestedCount = 0 }) {
  const isTrainer = a.type === "trainer";
  const activeBenefits = Object.entries(a.benefits).filter(([_, v]) => v.active).map(([k]) => k);
  const accent = isTrainer ? "#8B5CF6" : "#FF6B35";
  return (
    <div onClick={() => onClick(a)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: 22, border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${a.is_urgent ? "#EF4444" : accent}`, transition: "all .3s ease", animation: `fadeUp .5s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both`, cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateX(4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = ""; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: accent, background: `${accent}15`, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 1.5, border: `1px solid ${accent}25` }}>{isTrainer ? "🎯 Entraîneur" : "🤾 Joueur"}</span>
            {isTrainer && <TitleBadge titre={a.required_titre} size="sm" />}
            {a.is_urgent && <span style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 1, border: "1px solid rgba(239,68,68,0.2)" }}>Urgent</span>}
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{a.title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: accent, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>{a.club_name} · {a.division} · {a.city}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{a.candidatures_count} cand.</span>
          {suggestedCount > 0 && <span style={{ fontSize: 10, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)", fontWeight: 700 }}>✨ {suggestedCount} match{suggestedCount > 1 ? "s" : ""} IA</span>}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "8px 0 12px", lineHeight: 1.7 }}>{a.description}</p>
      {isTrainer && (
        <div style={{ display: "flex", gap: 12, padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 10, marginBottom: 10, fontSize: 11 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>💼 <strong style={{ color: "#F1F5F9" }}>{a.contract_type}</strong></span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>⏱ <strong style={{ color: "#F1F5F9" }}>{a.weekly_hours}h/sem</strong></span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>💶 <strong style={{ color: "#FF6B35" }}>{a.salary_range}</strong></span>
        </div>
      )}
      {activeBenefits.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {activeBenefits.map(b => <BenefitTag key={b} kind={b} />)}
        </div>
      )}
    </div>
  );
}

function AnnonceModal({ annonce, onClose, suggestedPlayers, suggestedTrainers, onProfileClick }) {
  if (!annonce) return null;
  const a = annonce;
  const isTrainer = a.type === "trainer";
  const accent = isTrainer ? "#8B5CF6" : "#FF6B35";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg, #141829 0%, #0d1117 100%)", borderRadius: 24, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)", animation: "modalUp .4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ padding: "26px 32px", background: `linear-gradient(135deg, ${accent}15, ${accent}03)`, borderBottom: `1px solid ${accent}20`, position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: accent, background: `${accent}15`, padding: "3px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 1.5, border: `1px solid ${accent}25` }}>{isTrainer ? "🎯 Recherche entraîneur" : "🤾 Recherche joueur"}</span>
            {isTrainer && <TitleBadge titre={a.required_titre} />}
            {a.is_urgent && <span style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 1, border: "1px solid rgba(239,68,68,0.2)" }}>Urgent</span>}
            {!isTrainer && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>{POS_LABELS[a.position]}</span>}
            <DivisionBadge division={a.division} />
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>{a.title}</h2>
          <p style={{ margin: 0, fontSize: 13, color: accent, fontWeight: 600 }}>{a.club_name} · {a.city}</p>
        </div>
        <div style={{ padding: 32 }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "0 0 22px" }}>{a.description}</p>

          {isTrainer && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Bebas Neue', sans-serif" }}>{a.contract_type}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>Contrat</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Bebas Neue', sans-serif" }}>{a.weekly_hours}h</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>Volume hebdo</div>
              </div>
              <div style={{ background: "rgba(255,107,53,0.06)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid rgba(255,107,53,0.15)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FF6B35", fontFamily: "'Bebas Neue', sans-serif" }}>{a.salary_range}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>Rémunération</div>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>✨ Ce que ce club propose</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {Object.entries(a.benefits).filter(([_, v]) => v.active).map(([key, value]) => {
              const meta = BENEFIT_META[key];
              return (
                <div key={key} style={{ background: meta.bg, borderRadius: 12, padding: 14, border: `1px solid ${meta.color}25` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><span style={{ fontSize: 18 }}>{meta.icon}</span><span style={{ fontSize: 12, fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: 1 }}>{meta.label}</span></div>
                  {key === "prime" && <p style={{ margin: 0, fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{value.amount}</p>}
                  {key === "logement" && (<><p style={{ margin: 0, fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{value.type}</p><p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{value.details}</p></>)}
                  {key === "job" && (<><p style={{ margin: 0, fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{value.role} · <span style={{ color: meta.color }}>{value.partner}</span></p><div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: 6 }}>{value.contract}</span><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: 6 }}>{value.salary}</span></div></>)}
                  {key === "formation" && (<><p style={{ margin: 0, fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{value.type}</p><p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{value.details}</p></>)}
                </div>
              );
            })}
          </div>

          {/* Suggested matches */}
          {((isTrainer ? suggestedTrainers : suggestedPlayers) || []).length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>✨ {isTrainer ? "Entraîneurs" : "Joueurs"} recommandés</h3>
                <span style={{ fontSize: 10, color: "#10B981", background: "rgba(16,185,129,0.08)", padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.15)", fontWeight: 700 }}>IA · BÊTA</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(isTrainer ? suggestedTrainers : suggestedPlayers).slice(0, 4).map(s => {
                  const profile = s.player || s.trainer;
                  return (
                    <div key={profile.id} onClick={() => onProfileClick(profile, isTrainer ? "trainer" : "player")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "all .25s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.05)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                      <CompatibilityRing score={s.score} size={48} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{profile.user_first_name || profile.first_name} {profile.user_last_name || profile.last_name}</span>
                          {profile.ffhb_verified && <FFHBBadge verified={true} size="sm" />}
                          {profile.titles?.titre5?.obtained && <TitleBadge titre="titre5" size="sm" />}
                          {profile.titles?.titre4?.obtained && !profile.titles?.titre5?.obtained && <TitleBadge titre="titre4" size="sm" />}
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{profile.position ? POS_LABELS[profile.position] : `${profile.years_coaching} ans coach`} · {profile.city}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                          {s.factors.slice(0, 3).map(f => <span key={f} style={{ fontSize: 9, color: "rgba(16,185,129,0.7)", background: "rgba(16,185,129,0.06)", padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>✓ {f}</span>)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", margin: "20px 0", padding: "10px 14px", background: "rgba(59,130,246,0.04)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.08)", lineHeight: 1.6 }}>
            ℹ️ HandConnect met en relation. Le contrat est conclu directement entre les parties.
          </p>

          <button style={{ width: "100%", padding: "14px 0", border: "none", borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 20px ${accent}30` }}>✉️ Postuler</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ CLUB CARD ═══════════════════════ */
function ClubCard({ c, index }) {
  const subMeta = { free: { label: "Free", color: "#94A3B8" }, standard: { label: "Standard", color: "#3B82F6" }, premium: { label: "Premium", color: "#FBBF24" } }[c.subscription || "free"];
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: 22, border: "1px solid rgba(255,255,255,0.06)", animation: `fadeUp .5s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both`, transition: "all .3s ease" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,53,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Bebas Neue', sans-serif" }}>{c.short_name}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{c.name}</h3>
            {c.subscription === "premium" && <span style={{ fontSize: 9, color: subMeta.color, background: `${subMeta.color}15`, padding: "2px 8px", borderRadius: 6, fontWeight: 700, border: `1px solid ${subMeta.color}30`, textTransform: "uppercase", letterSpacing: 1 }}>👑 {subMeta.label}</span>}
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{c.city} · {c.division}</p>
        </div>
      </div>
      {c.seeking_positions?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontWeight: 600 }}>Postes recherchés</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {c.seeking_positions.map(p => <span key={p} style={{ background: "rgba(255,107,53,0.1)", color: "#FF6B35", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,107,53,0.15)" }}>{POS_LABELS[p] || p}</span>)}
          </div>
        </div>
      )}
      <div style={{ marginTop: 14, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}><span>📱</span><span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Space Mono', monospace" }}>{c.contact_phone}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}><span>✉️</span><span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Space Mono', monospace" }}>{c.contact_email}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ ENTREPRISE CARD & MODAL ═══════════════════════ */
function EntrepriseCard({ e, onClick, index }) {
  return (
    <div onClick={() => onClick(e)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 20, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", animation: `fadeUp .5s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both`, transition: "all .3s ease" }}
      onMouseEnter={ev => { ev.currentTarget.style.transform = "translateY(-4px)"; ev.currentTarget.style.borderColor = `${e.color}40`; }}
      onMouseLeave={ev => { ev.currentTarget.style.transform = ""; ev.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${e.color}, ${e.color}88)` }} />
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: `${e.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1px solid ${e.color}25` }}>{e.logo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{e.name}</h3>
              {e.sponsorship_plan === "premium" && <span style={{ fontSize: 9, color: "#FBBF24", background: "rgba(251,191,36,0.15)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid rgba(251,191,36,0.25)" }}>★ PREMIUM</span>}
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{e.sector}</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: "0 0 12px" }}>{e.description}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{e.partner_clubs} clubs partenaires</span>
          <span style={{ fontSize: 11, color: e.color, fontWeight: 600 }}>{e.budget}</span>
        </div>
      </div>
    </div>
  );
}

function EntrepriseModal({ entreprise, onClose }) {
  if (!entreprise) return null;
  const e = entreprise;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .2s ease" }}>
      <div onClick={ev => ev.stopPropagation()} style={{ background: "linear-gradient(180deg, #141829 0%, #0d1117 100%)", borderRadius: 24, maxWidth: 500, width: "100%", overflow: "hidden", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)", animation: "modalUp .4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ height: 8, background: `linear-gradient(90deg, ${e.color}, ${e.color}66)` }} />
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: `${e.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `1px solid ${e.color}25` }}>{e.logo}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>{e.name}</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{e.sector}</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 18px" }}>{e.description}</p>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>Offres</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {e.offers.map(o => (
                <div key={o} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}><span>✉️</span><span style={{ color: "#F1F5F9", fontFamily: "'Space Mono', monospace" }}>{e.contact_email}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}><span>📱</span><span style={{ color: "#F1F5F9", fontFamily: "'Space Mono', monospace" }}>{e.contact_phone}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ PRICING TAB ═══════════════════════ */
function PricingTab({ currentPlan, onChoose }) {
  const [billing, setBilling] = useState("yearly");
  const plans = [
    { key: "club_free", color: "#94A3B8", description: "Pour découvrir la plateforme" },
    { key: "club_standard", color: "#3B82F6", description: "Pour les clubs actifs", popular: true },
    { key: "club_premium", color: "#FBBF24", description: "Pour les clubs ambitieux" },
  ];
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 3, color: "#F1F5F9", margin: "0 0 6px" }}>NOS <span style={{ color: "#FF6B35" }}>OFFRES CLUBS</span></h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Plateforme de mise en relation, sans commission sur recrutement</p>
        <div style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 3, marginTop: 18, border: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setBilling("monthly")} style={{ padding: "8px 18px", border: "none", borderRadius: 9, background: billing === "monthly" ? "rgba(255,107,53,0.15)" : "transparent", color: billing === "monthly" ? "#FF6B35" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Mensuel</button>
          <button onClick={() => setBilling("yearly")} style={{ padding: "8px 18px", border: "none", borderRadius: 9, background: billing === "yearly" ? "rgba(255,107,53,0.15)" : "transparent", color: billing === "yearly" ? "#FF6B35" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Annuel <span style={{ fontSize: 10, color: "#10B981", marginLeft: 4 }}>-17%</span></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 32 }}>
        {plans.map((p, i) => {
          const meta = PRICING[p.key];
          const price = billing === "yearly" ? meta.price_yearly : meta.price_monthly;
          const isCurrent = currentPlan === p.key;
          return (
            <div key={p.key} style={{ background: p.popular ? "linear-gradient(180deg, rgba(255,107,53,0.06), rgba(255,107,53,0.01))" : "rgba(255,255,255,0.03)", borderRadius: 22, padding: 26, border: `1px solid ${p.popular ? "rgba(255,107,53,0.25)" : "rgba(255,255,255,0.06)"}`, position: "relative", animation: `fadeUp .5s ease ${i * 0.08}s both`, transition: "all .3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
              {p.popular && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #FF6B35, #C13C00)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "5px 14px", borderRadius: 14, letterSpacing: 1.5, textTransform: "uppercase", boxShadow: "0 4px 12px rgba(255,107,53,0.3)" }}>★ Populaire</div>}
              <h3 style={{ margin: "0 0 4px", fontSize: 18, color: p.color, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>{meta.label.toUpperCase()}</h3>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.description}</p>
              <div style={{ margin: "20px 0", display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>{price === 0 ? "0" : price}€</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>/{billing === "yearly" ? "an" : "mois"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, minHeight: 140 }}>
                {meta.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                    <span style={{ color: p.color, fontSize: 12, marginTop: 1 }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onChoose(p.key)} disabled={isCurrent} style={{ width: "100%", padding: "12px 0", border: isCurrent ? `1px solid ${p.color}40` : "none", borderRadius: 12, background: isCurrent ? `${p.color}15` : (p.popular ? "linear-gradient(135deg, #FF6B35, #C13C00)" : "rgba(255,255,255,0.05)"), color: isCurrent ? p.color : "#fff", fontSize: 12, fontWeight: 700, cursor: isCurrent ? "default" : "pointer", boxShadow: p.popular && !isCurrent ? "0 6px 20px rgba(255,107,53,0.25)" : "none" }}>
                {isCurrent ? "✓ Plan actuel" : (price === 0 ? "Commencer gratuitement" : "Choisir ce plan")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Other plans */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14, fontWeight: 600 }}>Vous êtes joueur, entraîneur ou entreprise ?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { key: "player_boost", icon: "🤾", color: "#FF6B35" },
            { key: "trainer_pro", icon: "🎯", color: "#8B5CF6" },
            { key: "sponsor_annual", icon: "🏢", color: "#3B82F6" },
          ].map(p => {
            const meta = PRICING[p.key];
            const price = meta.price_monthly !== undefined ? meta.price_monthly : meta.price_yearly;
            const period = meta.price_monthly !== undefined ? "/mois" : "/an";
            return (
              <div key={p.key} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, border: `1px solid ${p.color}15`, transition: "all .25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${p.color}15`; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{ fontSize: 13, color: p.color, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{meta.label.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Bebas Neue', sans-serif" }}>{price}€<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Instrument Sans'", fontWeight: 500 }}>{period}</span></div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "6px 0 0", lineHeight: 1.5 }}>{meta.features.slice(0, 2).join(" · ")}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ marginTop: 22, fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.7, padding: "12px 16px", background: "rgba(59,130,246,0.04)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.08)" }}>
    ℹ️ HandConnect est une plateforme de mise en relation. Aucune commission n'est prélevée sur les recrutements ou les contrats. Les abonnements financent l'accès à l'outil et à la base de données. Sans engagement · Annulable à tout moment · Paiement sécurisé.
      </p>
    </div>
  );
}

/* ═══════════════════════ DASHBOARD TAB ═══════════════════════ */
function DashboardTab({ stats }) {
  const cards = [
    { label: "Joueurs inscrits", value: stats.total_players, icon: "🤾", color: "#FF6B35" },
    { label: "Entraîneurs", value: stats.total_trainers, icon: "🎯", color: "#8B5CF6" },
    { label: "Clubs", value: stats.total_clubs, icon: "🏟️", color: "#3B82F6" },
    { label: "Annonces actives", value: stats.active_annonces, icon: "📢", color: "#10B981" },
    { label: "FFHB Vérifiés", value: `${Math.round(stats.ffhb_verified_players / stats.total_players * 100)}%`, icon: "✓", color: "#3B82F6", sub: `${stats.ffhb_verified_players} joueurs` },
    { label: "Entreprises", value: stats.total_entreprises, icon: "🏢", color: "#F59E0B" },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 3, color: "#F1F5F9", margin: "0 0 22px" }}>TABLEAU DE <span style={{ color: "#FF6B35" }}>BORD</span></h2>

      {/* MRR + traction banner */}
      <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(255,107,53,0.04))", borderRadius: 18, padding: 22, marginBottom: 22, border: "1px solid rgba(16,185,129,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>💰</span>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Revenu mensuel récurrent (MRR)</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", color: "#10B981" }}>{stats.mrr_eur}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>€/mois</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Abonnés payants</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#FF6B35", fontFamily: "'Bebas Neue', sans-serif", marginTop: 4 }}>{stats.paying_clubs} clubs · {stats.paying_users} utilisateurs</div>
          </div>
        </div>
      </div>

      {/* FFHB API */}
      <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(255,107,53,0.04))", borderRadius: 18, padding: 22, marginBottom: 22, border: "1px solid rgba(59,130,246,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 32 }}>🔗</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>API FFHB connectée</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{stats.ffhb_verified_players} joueurs avec stats officielles synchronisées quotidiennement</p>
          </div>
          <span style={{ fontSize: 10, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "5px 12px", borderRadius: 8, fontWeight: 700, border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />ACTIVE</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {cards.map((c, i) => (
          <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.06)", animation: `fadeUp .5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both` }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 500 }}>{c.label}</div>
            {c.sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════ MAIN APP ═════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */
export default function HandConnect() {
  const [tab, setTab] = useState("annonces");
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [divFilter, setDivFilter] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [titreFilter, setTitreFilter] = useState("");
  const [annonceTypeFilter, setAnnonceTypeFilter] = useState("all"); // all/player/trainer
  const [benefitFilters, setBenefitFilters] = useState({ prime: false, logement: false, job: false, formation: false });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [upgradePrompt, setUpgradePrompt] = useState({ open: false, plan: null });
  const [currentPlan, setCurrentPlan] = useState("club_free"); // simulated user plan

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "" }), 3500); };

  const handleProfileClick = (profile, type) => {
    // Free plan: only first 3 profiles visible
    if (currentPlan === "club_free") {
      // Simulated: assume profiles after id 3 are locked
      const id = profile.id;
      const isPlayerLocked = type === "player" && id > 3;
      const isTrainerLocked = type === "trainer" && id > 102;
      if (isPlayerLocked || isTrainerLocked) {
        setUpgradePrompt({ open: true, plan: "club_standard" });
        return;
      }
    }
    if (type === "trainer") setSelectedTrainer(profile);
    else setSelectedPlayer(profile);
  };

  const handleUpgrade = (plan) => {
    setCurrentPlan(plan);
    setUpgradePrompt({ open: false, plan: null });
    showToast(`✓ Plan ${PRICING[plan].label} activé`, "success");
  };

  /* Filters */
  const filteredPlayers = useMemo(() => MOCK_PLAYERS.filter(p => {
    if (posFilter && p.position !== posFilter) return false;
    if (availableOnly && !p.is_available) return false;
    if (verifiedOnly && !p.ffhb_verified) return false;
    const cur = getCurrentSeason(p);
    if (divFilter && cur?.division !== divFilter) return false;
    if (search) return (p.user_first_name + " " + p.user_last_name + " " + p.city + " " + (p.current_club || "")).toLowerCase().includes(search.toLowerCase());
    return true;
  }), [search, posFilter, divFilter, availableOnly, verifiedOnly]);

  const filteredTrainers = useMemo(() => MOCK_TRAINERS.filter(t => {
    if (availableOnly && !t.is_available) return false;
    if (titreFilter === "titre5" && !t.titles.titre5.obtained) return false;
    if (titreFilter === "titre4" && !t.titles.titre4.obtained) return false;
    if (search) return (t.first_name + " " + t.last_name + " " + t.city).toLowerCase().includes(search.toLowerCase());
    return true;
  }), [search, titreFilter, availableOnly]);

  const filteredClubs = MOCK_CLUBS.filter(c => search ? (c.name + " " + c.city + " " + c.division).toLowerCase().includes(search.toLowerCase()) : true);

  const allAnnonces = [...MOCK_ANNONCES_PLAYERS, ...MOCK_ANNONCES_TRAINERS];
  const filteredAnnonces = allAnnonces.filter(a => {
    if (annonceTypeFilter !== "all" && a.type !== annonceTypeFilter) return false;
    if (posFilter && a.type === "player" && a.position !== posFilter) return false;
    const activeBenefits = Object.keys(benefitFilters).filter(k => benefitFilters[k]);
    if (activeBenefits.length > 0 && !activeBenefits.every(b => a.benefits[b]?.active)) return false;
    if (search) return (a.title + " " + a.club_name + " " + a.city).toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const filteredEntreprises = MOCK_ENTREPRISES.filter(e => search ? (e.name + " " + e.sector).toLowerCase().includes(search.toLowerCase()) : true);

  /* Compute suggestions */
  const suggestionsForAnnonce = useMemo(() => {
    if (!selectedAnnonce) return { players: [], trainers: [] };
    if (selectedAnnonce.type === "trainer") {
      return { players: [], trainers: MOCK_TRAINERS.filter(t => t.is_available).map(t => ({ trainer: t, ...getTrainerCompatibility(t, selectedAnnonce) })).filter(s => s.score >= 50).sort((a, b) => b.score - a.score) };
    }
    return { players: MOCK_PLAYERS.filter(p => p.is_available).map(p => ({ player: p, ...getCompatibilityScore(p, selectedAnnonce) })).filter(s => s.score >= 50).sort((a, b) => b.score - a.score), trainers: [] };
  }, [selectedAnnonce]);

  const suggestionsByAnnonce = useMemo(() => {
    const map = {};
    allAnnonces.forEach(a => {
      if (a.type === "trainer") map[a.id] = MOCK_TRAINERS.filter(t => t.is_available).map(t => getTrainerCompatibility(t, a)).filter(s => s.score >= 70).length;
      else map[a.id] = MOCK_PLAYERS.filter(p => p.is_available).map(p => getCompatibilityScore(p, a)).filter(s => s.score >= 70).length;
    });
    return map;
  }, []);

  const tabs = [
    { key: "annonces", label: "Annonces", icon: "📢" },
    { key: "joueurs", label: "Joueurs", icon: "🤾" },
    { key: "entraineurs", label: "Entraîneurs", icon: "🎯" },
    { key: "clubs", label: "Clubs", icon: "🏟️" },
    { key: "entreprises", label: "Entreprises", icon: "🏢" },
    { key: "pricing", label: "Mon plan", icon: "💎" },
    { key: "dashboard", label: "Stats", icon: "📊" },
  ];

  const allDivisions = [...new Set(MOCK_PLAYERS.map(p => getCurrentSeason(p)?.division).filter(Boolean))];

  const styleString = "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Instrument+Sans:wght@400;500;600;700&display=swap');" +
    "* { box-sizing: border-box; margin: 0; padding: 0; }" +
    "@keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }" +
    "@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }" +
    "@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }" +
    "@keyframes modalUp { from { opacity:0; transform:translateY(30px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }" +
    "@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }" +
    "input:focus, select:focus, textarea:focus { border-color: rgba(255,107,53,0.5) !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.1) !important; }" +
    "::-webkit-scrollbar { width: 4px; }" +
    "::-webkit-scrollbar-track { background: transparent; }" +
    "::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }";

  return (
    <>
      <style>{styleString}</style>
      <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#F1F5F9", fontFamily: "'Instrument Sans', sans-serif", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: -300, left: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "" })} />

        <header style={{ background: "rgba(10,14,26,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>🤾</div>
              <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1 }}>HAND<span style={{ color: "#FF6B35" }}>CONNECT</span></h1>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 6, fontWeight: 600, letterSpacing: 1 }}>BETA</span>
            </div>
            <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); setPosFilter(""); setDivFilter(""); setTitreFilter(""); setAnnonceTypeFilter("all"); setBenefitFilters({ prime: false, logement: false, job: false, formation: false }); }} style={{ padding: "8px 12px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Instrument Sans', sans-serif", transition: "all .25s", background: tab === t.key ? "rgba(255,107,53,0.12)" : "transparent", color: tab === t.key ? "#FF6B35" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                  <span style={{ marginRight: 5, fontSize: 13 }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 9, color: currentPlan === "club_free" ? "rgba(255,255,255,0.4)" : currentPlan === "club_premium" ? "#FBBF24" : "#3B82F6", background: currentPlan === "club_free" ? "rgba(255,255,255,0.05)" : currentPlan === "club_premium" ? "rgba(251,191,36,0.1)" : "rgba(59,130,246,0.1)", padding: "4px 10px", borderRadius: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, border: `1px solid ${currentPlan === "club_free" ? "rgba(255,255,255,0.08)" : currentPlan === "club_premium" ? "rgba(251,191,36,0.25)" : "rgba(59,130,246,0.25)"}`, fontFamily: "'Space Mono', monospace" }}>
                {currentPlan === "club_free" ? "Free" : currentPlan === "club_premium" ? "👑 Premium" : "Standard"}
              </span>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Bebas Neue', sans-serif" }}>HC</div>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 80px" }}>
          {/* Filters */}
          {(tab === "joueurs" || tab === "annonces" || tab === "clubs" || tab === "entreprises" || tab === "entraineurs") && (
            <div style={{ marginBottom: 22, animation: "fadeUp .4s ease" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ ...inputStyle, flex: "1 1 240px", width: "auto" }} />
                {(tab === "joueurs" || (tab === "annonces" && annonceTypeFilter !== "trainer")) && (
                  <select value={posFilter} onChange={e => setPosFilter(e.target.value)} style={{ ...inputStyle, minWidth: 150, width: "auto" }}>
                    <option value="">Tous postes</option>
                    {Object.entries(POS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                )}
                {tab === "joueurs" && (
                  <>
                    <select value={divFilter} onChange={e => setDivFilter(e.target.value)} style={{ ...inputStyle, minWidth: 140, width: "auto" }}>
                      <option value="">Toutes divisions</option>
                      {allDivisions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={() => setVerifiedOnly(!verifiedOnly)} style={{ padding: "13px 16px", border: "1px solid", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", background: verifiedOnly ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)", borderColor: verifiedOnly ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)", color: verifiedOnly ? "#3B82F6" : "rgba(255,255,255,0.35)" }}>✓ FFHB</button>
                  </>
                )}
                {tab === "entraineurs" && (
                  <select value={titreFilter} onChange={e => setTitreFilter(e.target.value)} style={{ ...inputStyle, minWidth: 150, width: "auto" }}>
                    <option value="">Tous titres</option>
                    <option value="titre4">Titre IV uniquement</option>
                    <option value="titre5">Titre V uniquement</option>
                  </select>
                )}
                {(tab === "joueurs" || tab === "entraineurs") && <button onClick={() => setAvailableOnly(!availableOnly)} style={{ padding: "13px 16px", border: "1px solid", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", background: availableOnly ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)", borderColor: availableOnly ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)", color: availableOnly ? "#10B981" : "rgba(255,255,255,0.35)" }}>🟢 Disponibles</button>}
              </div>

              {tab === "annonces" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginRight: 4 }}>Type :</span>
                  {[["all", "Toutes", "#FF6B35"], ["player", "🤾 Joueur", "#FF6B35"], ["trainer", "🎯 Entraîneur", "#8B5CF6"]].map(([k, lbl, c]) => (
                    <button key={k} onClick={() => setAnnonceTypeFilter(k)} style={{ padding: "6px 12px", border: `1px solid ${annonceTypeFilter === k ? c + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer", background: annonceTypeFilter === k ? `${c}15` : "rgba(255,255,255,0.02)", color: annonceTypeFilter === k ? c : "rgba(255,255,255,0.4)" }}>{lbl}</button>
                  ))}
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginLeft: 12 }}>Avantages :</span>
                  {Object.entries(BENEFIT_META).map(([key, meta]) => {
                    const active = benefitFilters[key];
                    return <button key={key} onClick={() => setBenefitFilters(prev => ({ ...prev, [key]: !prev[key] }))} style={{ padding: "6px 12px", border: `1px solid ${active ? meta.color + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer", background: active ? meta.bg : "rgba(255,255,255,0.02)", color: active ? meta.color : "rgba(255,255,255,0.4)", display: "inline-flex", alignItems: "center", gap: 5 }}><span>{meta.icon}</span> {meta.label}</button>;
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABS */}
          {tab === "annonces" && (
            <>
              <div style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(139,92,246,0.06))", borderRadius: 18, padding: 22, marginBottom: 22, border: "1px solid rgba(255,107,53,0.12)", animation: "fadeUp .5s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 32 }}>🎯</span>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>Annonces joueurs & entraîneurs</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Recherche d'<strong style={{ color: "#FF6B35" }}>équipiers</strong> ou de coaches <strong style={{ color: "#8B5CF6" }}>Titre IV / Titre V</strong>, avec avantages et suggestions IA.</p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredAnnonces.map((a, i) => <AnnonceCard key={a.id} a={a} index={i} onClick={setSelectedAnnonce} suggestedCount={suggestionsByAnnonce[a.id] || 0} />)}
                {filteredAnnonces.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.2)" }}><div style={{ fontSize: 40, marginBottom: 10 }}>📭</div><p>Aucune annonce trouvée</p></div>}
              </div>
            </>
          )}

          {tab === "joueurs" && (
            <>
              <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(255,107,53,0.04))", borderRadius: 14, padding: "12px 18px", marginBottom: 18, border: "1px solid rgba(59,130,246,0.12)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🔗</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}><strong style={{ color: "#3B82F6" }}>{filteredPlayers.filter(p => p.ffhb_verified).length}</strong> joueurs vérifiés FFHB · stats officielles</span>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{filteredPlayers.length} résultat(s)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {filteredPlayers.map((p, i) => <PlayerCard key={p.id} p={p} index={i} onClick={pl => handleProfileClick(pl, "player")} locked={currentPlan === "club_free" && p.id > 3} />)}
                {filteredPlayers.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "rgba(255,255,255,0.2)" }}><p>Aucun joueur trouvé</p></div>}
              </div>
            </>
          )}

          {tab === "entraineurs" && (
            <>
              <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(255,107,53,0.04))", borderRadius: 14, padding: "12px 18px", marginBottom: 18, border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Entraîneurs <strong style={{ color: "#8B5CF6" }}>Titre IV</strong> (éducateurs) et <strong style={{ color: "#FF6B35" }}>Titre V</strong> (entraîneurs nationaux)</span>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{filteredTrainers.length} résultat(s)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {filteredTrainers.map((t, i) => <TrainerCard key={t.id} t={t} index={i} onClick={tr => handleProfileClick(tr, "trainer")} locked={currentPlan === "club_free" && t.id > 102} />)}
                {filteredTrainers.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "rgba(255,255,255,0.2)" }}><p>Aucun entraîneur trouvé</p></div>}
              </div>
            </>
          )}

          {tab === "clubs" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {filteredClubs.map((c, i) => <ClubCard key={c.id} c={c} index={i} />)}
            </div>
          )}

          {tab === "entreprises" && (
            <>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: "#F1F5F9", margin: "0 0 18px" }}>PARTENAIRES &<span style={{ color: "#FF6B35" }}> SPONSORS</span></h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {filteredEntreprises.map((e, i) => <EntrepriseCard key={e.id} e={e} index={i} onClick={setSelectedEntreprise} />)}
              </div>
            </>
          )}

          {tab === "pricing" && <PricingTab currentPlan={currentPlan} onChoose={handleUpgrade} />}
          {tab === "dashboard" && <DashboardTab stats={MOCK_STATS} />}
        </main>

        {/* Modals */}
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
        <TrainerModal trainer={selectedTrainer} onClose={() => setSelectedTrainer(null)} />
        <AnnonceModal annonce={selectedAnnonce} onClose={() => setSelectedAnnonce(null)} suggestedPlayers={suggestionsForAnnonce.players} suggestedTrainers={suggestionsForAnnonce.trainers} onProfileClick={(p, type) => { setSelectedAnnonce(null); if (type === "trainer") setSelectedTrainer(p); else setSelectedPlayer(p); }} />
        <EntrepriseModal entreprise={selectedEntreprise} onClose={() => setSelectedEntreprise(null)} />
        <UpgradePrompt open={upgradePrompt.open} plan={upgradePrompt.plan} onClose={() => setUpgradePrompt({ open: false, plan: null })} onUpgrade={() => handleUpgrade(upgradePrompt.plan)} />
      </div>
    </>
  );
}
