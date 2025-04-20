import { openai } from '../client';
import { GoldLocation, GoldSearchResult } from './goldLocations';

export interface AdditionalGoldSearchResult {
  additionalMainSpots: GoldLocation[];
  additionalSecondarySpots: GoldLocation[];
  hasMoreResults: boolean;
}

export async function searchAdditionalGoldLocations(
  city: string, 
  radius: number = 50,
  existingMainSpots: string[] = [],
  existingSecondarySpots: string[] = []
): Promise<AdditionalGoldSearchResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en orpaillage et géologie, spécialisé dans l'identification des spots aurifères en France. 
          
TÂCHE :
Identifie des cours d'eau SUPPLÉMENTAIRES (rivières, ruisseaux, torrents) avec un potentiel aurifère autour de la localisation donnée, dans un rayon de ${radius} km. Ces spots doivent être DIFFÉRENTS de ceux déjà identifiés.

SPOTS DÉJÀ IDENTIFIÉS (À EXCLURE) :
Spots principaux : ${existingMainSpots.join(', ')}
Spots secondaires : ${existingSecondarySpots.join(', ')}

SOURCES À VÉRIFIER SYSTÉMATIQUEMENT (SOURCES ADDITIONNELLES) :

1. Forums spécialisés en orpaillage (OBLIGATOIRE) :
- Forum de l'Association des Orpailleurs de France
- Forum Chercheurs d'or
- Groupes Facebook dédiés à l'orpaillage en France
- Blogs et récits d'orpailleurs

2. Publications scientifiques et rapports (OBLIGATOIRE) :
- Publications universitaires sur la géologie aurifère
- Rapports détaillés du BRGM
- Études minéralogiques régionales
- Thèses et mémoires sur les gisements aurifères

3. Sources historiques (OBLIGATOIRE) :
- Archives départementales sur l'exploitation minière
- Documents historiques sur l'orpaillage
- Cartes minières anciennes
- Témoignages historiques documentés

4. Sources cartographiques officielles (OBLIGATOIRE) :
- Cartes IGN 1:25000 (Série Bleue)
- Base SANDRE des cours d'eau français
- Base BD Carthage de l'IGN
- Base hydrographique nationale

RÈGLES DE VALIDATION STRICTES :

1. Pour chaque cours d'eau mentionné :
   - OBLIGATOIRE : Vérifier sur au moins une source spécialisée
   - OBLIGATOIRE : Confirmer avec des données géologiques
   - Citer PRÉCISÉMENT les sources (URLs, références de publications, etc.)
   - NE PAS INVENTER de noms de cours d'eau - utiliser UNIQUEMENT les noms officiels des cartes IGN et BRGM
   - Inclure le code hydrographique officiel quand disponible

2. Types de spots à inclure :
   - Spots mentionnés dans des forums avec témoignages vérifiables
   - Spots documentés dans des publications scientifiques
   - Spots avec un fort potentiel géologique ET des mentions historiques
   - NE PAS INCLURE les spots sans source fiable ou sans indice géologique fort

FORMAT DE RÉPONSE REQUIS :
Ta réponse doit être un objet JSON valide avec la structure suivante :
{
  "additionalMainSpots": [
    {
      "name": "Nom RÉEL du cours d'eau (avec ville/village proche)",
      "type": "rivière/ruisseau/torrent",
      "coordinates": [latitude, longitude],
      "description": "Description détaillée du spot",
      "geology": "Description géologique (failles, quartz, roches)",
      "history": "Historique des découvertes",
      "rating": 5,
      "sources": [
        "Carte géologique BRGM n°XXX - Feuille de XXX",
        "Carte IGN n°XXX - Série Bleue",
        "Source 3 (URL ou référence précise)"
      ],
      "hotspots": [
        {
          "location": "Description précise du lieu",
          "description": "Pourquoi ce point précis est intéressant pour l'orpaillage",
          "source": "Source de l'information (forum, publication, etc.)"
        }
      ],
      "goldOrigin": {
        "description": "Explication détaillée de l'origine de l'or dans ce cours d'eau",
        "brgmData": "Données BRGM pertinentes (gîtes, filons, etc.)",
        "entryPoints": ["Point 1 où l'or entre dans le cours d'eau", "Point 2..."],
        "affluents": ["Affluent 1 qui apporte de l'or", "Affluent 2..."]
      },
      "referencedSpots": {
        "description": "Vue d'ensemble des spots connus",
        "locations": ["Spot 1 mentionné dans les forums/publications", "Spot 2..."],
        "sources": ["Source 1 pour ces spots", "Source 2..."]
      },
      "isMainSpot": true
    }
  ],
  "additionalSecondarySpots": [
    // Même format que ci-dessus mais avec isMainSpot: false
  ],
  "hasMoreResults": true/false // Indique s'il existe potentiellement d'autres spots à découvrir
}

IMPORTANT :
- Ne retourner que des spots DIFFÉRENTS de ceux déjà identifiés
- Inclure 2-3 spots principaux supplémentaires si possible
- Inclure 3-5 spots secondaires supplémentaires si possible
- Attribuer une note objective basée sur les données disponibles
- Citer PRÉCISÉMENT les sources utilisées pour chaque spot
- Pour chaque cours d'eau, identifier 1-3 "hotspots" (points d'intérêt spécifiques)
- Indiquer "hasMoreResults": false s'il n'y a plus de spots vérifiables à trouver
- NE PAS INVENTER de spots sans sources vérifiables
- N'INVENTE PAS de noms de cours d'eau - utilise UNIQUEMENT les noms officiels des cartes IGN et BRGM
- Ta réponse doit être uniquement le JSON, sans texte avant ou après`
        },
        {
          role: "user",
          content: `Recherche des spots supplémentaires pour l'orpaillage autour de ${city} dans un rayon de ${radius} km. 
          
J'ai déjà identifié ces spots principaux : ${existingMainSpots.join(', ')}
Et ces spots secondaires : ${existingSecondarySpots.join(', ')}

Trouve des VRAIS cours d'eau DIFFÉRENTS de ceux-ci, en te basant uniquement sur des sources vérifiables (forums spécialisés, publications scientifiques, rapports BRGM, archives historiques). 

Utilise UNIQUEMENT les noms officiels des cours d'eau qui existent réellement sur les cartes IGN et BRGM. N'INVENTE PAS de noms de cours d'eau.

Si tu ne trouves pas de spots supplémentaires vérifiables, indique "hasMoreResults": false.`
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
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
      
      const parsedData = JSON.parse(cleanedContent);
      
      // Vérifier la structure des données
      if (!parsedData.additionalMainSpots || !Array.isArray(parsedData.additionalMainSpots)) {
        parsedData.additionalMainSpots = [];
      }
      
      if (!parsedData.additionalSecondarySpots || !Array.isArray(parsedData.additionalSecondarySpots)) {
        parsedData.additionalSecondarySpots = [];
      }
      
      if (typeof parsedData.hasMoreResults !== 'boolean') {
        parsedData.hasMoreResults = false;
      }
      
      // Valider chaque spot
      const validateSpot = (spot: any, index: number, isMain: boolean) => {
        if (!spot.name) {
          spot.name = isMain ? `Spot principal supplémentaire ${index + 1}` : `Spot secondaire supplémentaire ${index + 1}`;
        }
        
        if (!spot.coordinates || !Array.isArray(spot.coordinates)) {
          spot.coordinates = [0, 0]; // Coordonnées par défaut
        }
        
        // S'assurer que tous les champs requis sont présents
        spot.type = spot.type || "cours d'eau";
        spot.description = spot.description || "Aucune description disponible";
        spot.geology = spot.geology || "Aucune information géologique disponible";
        spot.history = spot.history || "Aucun historique disponible";
        spot.rating = spot.rating || 3;
        spot.sources = spot.sources || [];
        spot.hotspots = spot.hotspots || [];
        spot.isMainSpot = isMain;
        
        // Vérifier si le spot a au moins une source
        if (spot.sources.length === 0) {
          spot.sources = ["Source non spécifiée"];
        }
      };
      
      parsedData.additionalMainSpots.forEach((spot: any, index: number) => validateSpot(spot, index, true));
      parsedData.additionalSecondarySpots.forEach((spot: any, index: number) => validateSpot(spot, index, false));
      
      return {
        additionalMainSpots: parsedData.additionalMainSpots,
        additionalSecondarySpots: parsedData.additionalSecondarySpots,
        hasMoreResults: parsedData.hasMoreResults
      };
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      
      // Fallback: créer un résultat par défaut
      return {
        additionalMainSpots: [],
        additionalSecondarySpots: [],
        hasMoreResults: false
      };
    }
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    
    // Fallback: créer un résultat par défaut en cas d'erreur
    return {
      additionalMainSpots: [],
      additionalSecondarySpots: [],
      hasMoreResults: false
    };
  }
}
