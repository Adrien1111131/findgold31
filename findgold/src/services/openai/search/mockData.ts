import { GoldSite } from '../types';

// Données de secours pour les rivières connues
export const knownRivers: { [key: string]: GoldSite[] } = {
  'Carcassonne': [
    {
      coordinates: [43.2130, 2.3491],
      description: "L'Aude est la rivière principale traversant Carcassonne. Elle prend sa source dans les Pyrénées et a une histoire d'orpaillage.",
      river: "L'Aude",
      type: "rivière",
      distance: "0 km",
      geology: "Alluvions quaternaires, zones de dépôts favorables à l'accumulation d'or",
      rating: 4,
      ratingDetails: {
        forumMentions: ["GuppyOr - Orpaillage dans l'Aude"],
        historicalData: "Activité historique d'orpaillage documentée",
        geologicalScore: 4,
        accessibility: 5
      }
    },
    {
      coordinates: [43.3119, 2.2275],
      description: "L'Orbiel est un affluent de l'Aude connu pour ses anciennes mines d'or, notamment dans le secteur de Salsigne.",
      river: "L'Orbiel",
      type: "rivière",
      distance: "15 km",
      geology: "Zone minéralisée, présence historique de mines d'or",
      rating: 5,
      ratingDetails: {
        forumMentions: ["GuppyOr - Mines de Salsigne", "FFOR - L'Orbiel"],
        historicalData: "Anciennes mines d'or de Salsigne",
        geologicalScore: 5,
        accessibility: 4
      }
    },
    {
      coordinates: [43.2275, 2.2647],
      description: "Le Fresquel est un affluent de l'Aude qui traverse une zone géologique intéressante.",
      river: "Le Fresquel",
      type: "rivière",
      distance: "8 km",
      geology: "Alluvions quaternaires, zones de confluence favorables",
      rating: 3,
      ratingDetails: {
        forumMentions: ["GuppyOr - Affluents de l'Aude"],
        historicalData: "Quelques mentions historiques d'orpaillage",
        geologicalScore: 3,
        accessibility: 4
      }
    }
  ],
  // Ajouter d'autres villes et leurs rivières ici
};
