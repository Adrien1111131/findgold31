import { openai } from '../client';
import { GoldLocation } from './goldLocations';

export interface UnknownGoldSearchResult {
  unknownSpots: GoldLocation[];
}

export async function searchUnknownGoldLocations(city: string, radius: number = 50): Promise<UnknownGoldSearchResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en géologie aurifère qui va générer UNIQUEMENT un objet JSON valide sans aucun texte avant ou après. 

IMPORTANT: Ta réponse doit être UNIQUEMENT un objet JSON valide, sans aucun texte explicatif.

Voici la structure JSON exacte à utiliser:

{
  "unknownSpots": [
    {
      "name": "Nom RÉEL du cours d'eau (avec localité proche)",
      "type": "rivière/ruisseau/torrent",
      "coordinates": [45.123, 3.456],
      "description": "Description géologique avec références BRGM",
      "geology": "Formations traversées avec numéros de cartes",
      "rating": 5,
      "sources": [
        "Carte géologique BRGM n°XXX - Feuille de XXX",
        "Carte IGN n°XXX - Série Bleue",
        "Inventaire minier - Indice n°XXX"
      ],
      "hotspots": [
        {
          "location": "Point d'intérêt précis",
          "description": "Explication géologique avec références",
          "source": "Référence BRGM précise"
        }
      ],
      "goldOrigin": {
        "description": "Origine potentielle de l'or",
        "brgmData": "Données BRGM avec références",
        "entryPoints": ["Points d'entrée potentiels"],
        "affluents": ["Affluents intéressants"]
      },
      "prospectionSpots": [
        {
          "coordinates": [45.124, 3.457],
          "description": "Portion à prospecter",
          "geologicalFeatures": [
            "Caractéristique favorable 1",
            "Caractéristique favorable 2"
          ],
          "accessInfo": "Accès à cette portion",
          "priority": 1
        }
      ]
    }
  ]
}

RÈGLES ABSOLUES:
1. Ta réponse doit être UNIQUEMENT le JSON, sans texte avant ou après
2. Utilise uniquement des guillemets doubles pour les chaînes
3. Les valeurs numériques (comme rating et coordinates) ne doivent pas être entre guillemets
4. Inclus 3-5 cours d'eau RÉELS qui traversent des formations favorables à l'or
5. Cite précisément les numéros de cartes BRGM et références
6. Fournis des coordonnées GPS réelles et précises
7. Évalue uniquement sur des critères géologiques (filons de quartz, failles, roches métamorphiques)
8. Inclus les codes BSS des sondages quand disponibles
9. N'INVENTE PAS de noms de cours d'eau - utilise UNIQUEMENT les noms officiels des cartes IGN et BRGM
10. Inclus le code hydrographique officiel quand disponible

SOURCES POUR LES NOMS DE COURS D'EAU:
- Cartes IGN 1:25000 (Série Bleue)
- Base SANDRE des cours d'eau français
- Base BD Carthage de l'IGN
- Cartes géologiques BRGM
- Base hydrographique nationale

FORMATIONS FAVORABLES À L'OR:
- Filons de quartz
- Zones de failles
- Roches métamorphiques (schistes, gneiss)
- Granites
- Zones de contact entre formations différentes
- Présence de minéraux indicateurs (arsénopyrite, pyrite)

RAPPEL: Ta réponse doit être UNIQUEMENT un objet JSON valide, sans aucun texte explicatif.`
        },
        {
          role: "user",
          content: `Génère un JSON avec 3-5 VRAIS cours d'eau autour de ${city} (rayon ${radius} km) qui traversent des formations géologiques favorables à l'or. Utilise UNIQUEMENT les noms officiels des cours d'eau qui existent réellement sur les cartes IGN et BRGM. Cite précisément les cartes BRGM, numéros d'indices et codes BSS. Fournis des coordonnées GPS précises. N'INVENTE PAS de noms de cours d'eau. IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après.`
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Pas de réponse de l'IA");
    }

    try {
      // Nettoyer la réponse avant le parsing
      let cleanedContent = content;
      
      // Supprimer tout texte avant le premier '{'
      const firstBraceIndex = cleanedContent.indexOf('{');
      if (firstBraceIndex > 0) {
        cleanedContent = cleanedContent.substring(firstBraceIndex);
      }
      
      // Supprimer tout texte après le dernier '}'
      const lastBraceIndex = cleanedContent.lastIndexOf('}');
      if (lastBraceIndex !== -1 && lastBraceIndex < cleanedContent.length - 1) {
        cleanedContent = cleanedContent.substring(0, lastBraceIndex + 1);
      }
      
      // Essayer de parser le JSON nettoyé
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedContent);
      } catch (initialParseError) {
        console.error("Erreur lors du parsing initial:", initialParseError);
        console.log("Contenu problématique:", cleanedContent);
        
        // Tentative de récupération - rechercher un objet JSON valide dans la réponse
        const jsonRegex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/g;
        const jsonMatches = cleanedContent.match(jsonRegex);
        
        if (jsonMatches && jsonMatches.length > 0) {
          // Prendre le plus grand objet JSON trouvé
          const largestMatch = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
          try {
            parsedData = JSON.parse(largestMatch);
            console.log("Récupération réussie avec regex");
          } catch (regexParseError) {
            console.error("Échec de la récupération avec regex:", regexParseError);
            throw new Error("Impossible de parser la réponse JSON, même après tentative de récupération");
          }
        } else {
          throw new Error("Aucun objet JSON valide trouvé dans la réponse");
        }
      }
      
      // Vérifier la structure des données
      if (!parsedData.unknownSpots || !Array.isArray(parsedData.unknownSpots)) {
        console.error("Structure de données invalide:", parsedData);
        throw new Error("Format de réponse invalide : 'unknownSpots' manquant ou incorrect");
      }
      
      // Valider chaque spot
      parsedData.unknownSpots.forEach((spot: any, index: number) => {
        if (!spot.name) {
          spot.name = `Spot potentiel ${index + 1}`;
        }
        
        if (!spot.coordinates || !Array.isArray(spot.coordinates)) {
          spot.coordinates = [0, 0];
        }
        
        // S'assurer que tous les champs requis sont présents
        spot.type = spot.type || "cours d'eau";
        spot.description = spot.description || "Aucune description disponible";
        spot.geology = spot.geology || "Aucune information géologique disponible";
        spot.history = "Aucun historique - Spot identifié par analyse géologique";
        spot.rating = spot.rating || 3;
        spot.sources = spot.sources || [];
        spot.hotspots = spot.hotspots || [];
        // Initialiser et valider prospectionSpots
        spot.prospectionSpots = spot.prospectionSpots || [];
        spot.prospectionSpots.forEach((pSpot: any) => {
          if (!pSpot.coordinates || !Array.isArray(pSpot.coordinates)) {
            pSpot.coordinates = spot.coordinates; // Utiliser les coordonnées du spot principal
          }
          pSpot.description = pSpot.description || "Portion intéressante à prospecter";
          pSpot.geologicalFeatures = pSpot.geologicalFeatures || ["Caractéristiques géologiques favorables"];
          pSpot.accessInfo = pSpot.accessInfo || "Information d'accès non disponible";
          pSpot.priority = pSpot.priority || 3; // Priorité par défaut
        });
        spot.isMainSpot = false;
        
        // Initialiser goldOrigin s'il est manquant
        if (!spot.goldOrigin) {
          spot.goldOrigin = {
            description: "Analyse géologique non disponible",
            brgmData: "Données BRGM non disponibles",
            entryPoints: [],
            affluents: []
          };
        } else {
          // S'assurer que tous les champs de goldOrigin sont présents
          spot.goldOrigin.description = spot.goldOrigin.description || "Analyse géologique non disponible";
          spot.goldOrigin.brgmData = spot.goldOrigin.brgmData || "Données BRGM non disponibles";
          spot.goldOrigin.entryPoints = spot.goldOrigin.entryPoints || [];
          spot.goldOrigin.affluents = spot.goldOrigin.affluents || [];
        }
      });
      
      return {
        unknownSpots: parsedData.unknownSpots
      };
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      // Retourner un message d'erreur plus informatif
      return { 
        unknownSpots: [{
          name: "Erreur d'analyse",
          type: "erreur",
          coordinates: [0, 0],
          description: "Une erreur s'est produite lors de l'analyse géologique. Veuillez réessayer.",
          geology: "Erreur de traitement des données géologiques",
          history: "Erreur d'analyse",
          rating: 0,
          sources: ["Erreur de traitement"],
          hotspots: [],
          isMainSpot: false,
          goldOrigin: {
            description: "Erreur d'analyse",
            brgmData: "Erreur de traitement des données BRGM",
            entryPoints: [],
            affluents: []
          },
          prospectionSpots: []
        }]
      };
    }
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    // Retourner un message d'erreur plus informatif
    return { 
      unknownSpots: [{
        name: "Erreur de connexion",
        type: "erreur",
        coordinates: [0, 0],
        description: "Une erreur s'est produite lors de la connexion à l'API. Veuillez vérifier votre connexion et réessayer.",
        geology: "Erreur de connexion",
        history: "Erreur de connexion",
        rating: 0,
        sources: ["Erreur de connexion"],
        hotspots: [],
        isMainSpot: false,
        goldOrigin: {
          description: "Erreur de connexion",
          brgmData: "Erreur de connexion aux données BRGM",
          entryPoints: [],
          affluents: []
        },
        prospectionSpots: []
      }]
    };
  }
}
