import { openai } from '../client';
import { cacheService } from '../../cacheService';

export interface Hotspot {
  location: string;  // Description du lieu précis
  description: string;  // Pourquoi c'est intéressant
  source: string;  // BRGM ou retour d'expérience
}

export interface ProspectionSpot {
  coordinates: [number, number];
  description: string;
  geologicalFeatures: string[];
  accessInfo: string;
  priority: number; // 1-3, 1 étant la plus haute priorité
}

export interface GoldLocation {
  name: string;
  type: string;
  coordinates: [number, number];
  description: string;
  geology: string;
  history: string;
  rating: number; // 1-5
  sources: string[];
  hotspots: Hotspot[];
  isMainSpot: boolean; // true pour les 3 meilleurs spots, false pour les spots secondaires
  goldOrigin?: {
    description: string;
    brgmData: string;
    entryPoints: string[];
    affluents: string[];
  };
  referencedSpots?: {
    description: string;
    locations: string[];
    sources: string[];
  };
  prospectionSpots?: ProspectionSpot[]; // Nouveau champ pour les portions à prospecter
}

export interface GoldSearchResult {
  mainSpots: GoldLocation[];
  secondarySpots: GoldLocation[];
  hasMoreResults: boolean;
}

export interface SearchOptions {
  radius: number;
  page?: number;
  pageSize?: number;
  loadMainSpots?: boolean;
  loadSecondarySpots?: boolean;
}

const DEFAULT_PAGE_SIZE = 3;

export async function searchGoldLocations(
  city: string, 
  options: SearchOptions = { radius: 50 }
): Promise<GoldSearchResult> {
  const {
    radius,
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    loadMainSpots = true,
    loadSecondarySpots = true
  } = options;

  // Vérifier le cache
  const cacheKey = `${city}_${radius}_${page}_${pageSize}`;
  const cachedResult = cacheService.get<GoldSearchResult>(city, radius, cacheKey);
  if (cachedResult) {
    console.log('Résultats récupérés depuis le cache');
    return cachedResult;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en orpaillage et géologie, spécialisé dans l'identification des spots aurifères en France. 
          
TÂCHE :
Identifie les cours d'eau (rivières, ruisseaux, torrents) avec le meilleur potentiel aurifère autour de la localisation donnée, dans un rayon de ${radius} km.
${loadMainSpots ? 'Retourne les spots principaux.' : ''}
${loadSecondarySpots ? 'Retourne les spots secondaires.' : ''}
Limite les résultats à ${pageSize} spots par catégorie.

SOURCES À VÉRIFIER SYSTÉMATIQUEMENT :

1. Sites spécialisés en orpaillage (OBLIGATOIRE - vérifier au moins UNE de ces sources) :
- orpaillage.fr (Site de référence sur l'orpaillage)
- goldlineorpaillage.fr (Expériences et spots vérifiés)
- https://www.prospection-de-loisir.fr/ (Communauté de prospecteurs)
- https://www.chercheur-or.fr/ (Ressources et guides)
- https://www.orpaillage-loisir.com/ (Communauté d'orpailleurs)
- Forums spécialisés (FFOR, Mindat, etc.)

2. Données BRGM (OBLIGATOIRE) :
- http://infoterre.brgm.fr : cartes géologiques, gîtes minéraux
- Inventaire minier national du BRGM
- Cartes géologiques harmonisées
- Publications scientifiques BRGM

FORMAT DE RÉPONSE REQUIS :
{
  "mainSpots": [],    // Si loadMainSpots est true
  "secondarySpots": [],  // Si loadSecondarySpots est true
  "hasMoreResults": true/false  // Indique s'il y a plus de résultats disponibles
}`
        },
        {
          role: "user",
          content: `Identifie les meilleurs spots pour l'orpaillage autour de ${city} dans un rayon de ${radius} km. 
${loadMainSpots ? `Trouve les ${pageSize} prochains cours d'eau principaux les plus prometteurs (à partir de l'index ${page * pageSize}).` : ''}
${loadSecondarySpots ? `Trouve les ${pageSize} prochains cours d'eau secondaires (à partir de l'index ${page * pageSize}).` : ''}
Pour chaque cours d'eau, indique les points précis (hotspots) les plus intéressants et l'origine de l'or selon les données BRGM.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3500
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Pas de réponse de l'IA");
    }

    try {
      const parsedData = JSON.parse(content);
      
      // Valider chaque spot
      const validateSpot = (spot: any, index: number, isMain: boolean) => {
        if (!spot.name) {
          spot.name = isMain ? `Spot principal ${index + 1}` : `Spot secondaire ${index + 1}`;
        }
        
        if (!spot.coordinates || !Array.isArray(spot.coordinates)) {
          spot.coordinates = [0, 0];
        }
        
        spot.type = spot.type || "cours d'eau";
        spot.description = spot.description || "Aucune description disponible";
        spot.geology = spot.geology || "Aucune information géologique disponible";
        spot.history = spot.history || "Aucun historique disponible";
        spot.rating = spot.rating || 3;
        spot.sources = spot.sources || [];
        spot.hotspots = spot.hotspots || [];
        spot.isMainSpot = isMain;
      };
      
      if (loadMainSpots && parsedData.mainSpots) {
        parsedData.mainSpots.forEach((spot: any, index: number) => validateSpot(spot, index, true));
      }
      
      if (loadSecondarySpots && parsedData.secondarySpots) {
        parsedData.secondarySpots.forEach((spot: any, index: number) => validateSpot(spot, index, false));
      }

      const result = {
        mainSpots: loadMainSpots ? parsedData.mainSpots || [] : [],
        secondarySpots: loadSecondarySpots ? parsedData.secondarySpots || [] : [],
        hasMoreResults: parsedData.hasMoreResults ?? false
      };

      // Mettre en cache les résultats
      cacheService.set(city, radius, cacheKey, result);
      
      return result;
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      return createDefaultResult(city, loadMainSpots, loadSecondarySpots);
    }
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return createDefaultResult(city, loadMainSpots, loadSecondarySpots);
  }
}

function createDefaultResult(
  city: string,
  loadMainSpots: boolean = true,
  loadSecondarySpots: boolean = true
): GoldSearchResult {
  const defaultSpot: GoldLocation = {
    name: city,
    type: "rivière",
    coordinates: [0, 0],
    description: "Une erreur s'est produite lors de la recherche. Veuillez réessayer ultérieurement.",
    geology: "Information non disponible",
    history: "Information non disponible",
    rating: 3,
    sources: [],
    hotspots: [{
      location: "Non disponible",
      description: "Aucune information sur les points d'intérêt spécifiques",
      source: "N/A"
    }],
    isMainSpot: true
  };

  return {
    mainSpots: loadMainSpots ? [defaultSpot] : [],
    secondarySpots: loadSecondarySpots ? [] : [],
    hasMoreResults: false
  };
}
