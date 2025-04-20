import { GoldSite } from '../types';

// Données de secours pour les rivières connues
export const knownRivers: { [key: string]: GoldSite[] } = {
  'Carcassonne': [
    {
      coordinates: [43.2130, 2.3491],
      description: "L'Aude est la rivière principale traversant Carcassonne. Elle prend sa source dans les Pyrénées et a une histoire d'orpaillage.",
      spot: "Méandre de Carcassonne",
      river: "L'Aude",
      type: "rivière",
      distance: "0 km",
      geology: "Alluvions quaternaires, zones de dépôts favorables à l'accumulation d'or",
      features: "Méandre prononcé avec bancs de graviers, confluence avec un petit affluent, zones de ralentissement",
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
      spot: "Confluence Orbiel-Aude",
      river: "L'Orbiel",
      type: "rivière",
      distance: "15 km",
      geology: "Zone minéralisée, présence historique de mines d'or",
      features: "Confluence majeure avec l'Aude, affleurements rocheux, ancien site minier à proximité",
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
      spot: "Méandres du Fresquel",
      river: "Le Fresquel",
      type: "rivière",
      distance: "8 km",
      geology: "Alluvions quaternaires, zones de confluence favorables",
      features: "Série de méandres rapprochés, bancs de graviers exposés, zone de ralentissement",
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
  'Tuchan': [
    {
      coordinates: [42.8950, 2.7209],
      description: "Le Verdouble est une rivière qui traverse Tuchan et la région des Corbières, connue pour son potentiel aurifère modéré.",
      spot: "Gorges du Verdouble",
      river: "Le Verdouble",
      type: "rivière",
      distance: "0 km",
      geology: "Terrains métamorphiques et sédimentaires, zones de fracturation",
      features: "Gorges étroites, marmites de géants, bancs de graviers dans les méandres",
      rating: 3,
      ratingDetails: {
        forumMentions: ["FFOR - Corbières"],
        historicalData: "Quelques mentions d'orpaillage récréatif",
        geologicalScore: 3,
        accessibility: 4
      }
    },
    {
      coordinates: [42.9200, 2.7450],
      description: "Le Torgan est un petit affluent du Verdouble qui traverse des zones géologiquement intéressantes.",
      spot: "Confluence Torgan-Verdouble",
      river: "Le Torgan",
      type: "ruisseau",
      distance: "3 km",
      geology: "Zone de contact entre schistes et calcaires",
      features: "Petites cascades, poches de sédimentation, blocs rocheux",
      rating: 2,
      ratingDetails: {
        forumMentions: [],
        historicalData: "Pas de mention historique notable",
        geologicalScore: 2,
        accessibility: 3
      }
    }
  ]
};
