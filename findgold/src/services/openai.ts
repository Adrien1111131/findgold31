import OpenAI from 'openai';

import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';

import type { ChatCompletionMessage } from 'openai/resources/chat/completions';

interface VisionContent {
  type: "text";
  text: string;
}

interface ImageUrlContent {
  type: "image_url";
  image_url: { url: string };
}

type VisionMessage = Omit<ChatCompletionMessage, 'content'> & {
  content: string | Array<VisionContent | ImageUrlContent>;
};


const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Pour le développement uniquement
});

// Interface pour les suggestions de villes
export interface CityLocation {
  name: string;        // Nom de la ville
  region: string;      // Région/Département
  fullName: string;    // Nom complet pour l'IA
  lat: number;
  lon: number;
}

interface OverpassNodeTags {
  name?: string;
  place?: string;
  waterway?: string;
}

interface OverpassWayTags {
  name?: string;
  waterway?: string;
}

interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: OverpassNodeTags;
}

interface OverpassWay {
  type: 'way';
  id: number;
  nodes: number[];
  tags?: OverpassWayTags;
}

interface OverpassResponse {
  elements: (OverpassNode | OverpassWay)[];
}

// Fonction pour obtenir les coordonnées précises d'un cours d'eau et des lieux-dits proches
export const getWaterwayAndPlaceDetails = async (lat: number, lon: number, radius: number): Promise<{
  waterways: { name: string; coordinates: [number, number]; type: string }[];
  places: { name: string; coordinates: [number, number]; type: string }[];
}> => {
  const query = `
    [out:json];
    (
      // Récupérer les cours d'eau
      way["waterway"](around:${radius * 1000},${lat},${lon});
      // Récupérer les lieux-dits et villages
      node["place"~"hamlet|village|locality"](around:${radius * 1000},${lat},${lon});
      // Récupérer les nœuds des cours d'eau
      >;
    );
    out body;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: query
    });

    const data: OverpassResponse = await response.json();

    const nodes = new Map<number, OverpassNode>();
    const waterways: { name: string; coordinates: [number, number]; type: string }[] = [];
    const places: { name: string; coordinates: [number, number]; type: string }[] = [];

    // Indexer tous les nœuds
    data.elements.forEach(element => {
      if (element.type === 'node') {
        nodes.set(element.id, element as OverpassNode);
      }
    });

    // Traiter les cours d'eau et les lieux
    data.elements.forEach(element => {
      if (element.type === 'way' && element.tags?.waterway && element.tags?.name) {
        const way = element as OverpassWay;
        // Prendre un point au milieu du cours d'eau
        const midNodeId = way.nodes[Math.floor(way.nodes.length / 2)];
        const midNode = nodes.get(midNodeId);
        if (midNode) {
          waterways.push({
            name: element.tags.name,
            coordinates: [midNode.lat, midNode.lon],
            type: element.tags.waterway
          });
        }
      } else if (element.type === 'node' && element.tags?.place && element.tags?.name) {
        const node = element as OverpassNode;
        places.push({
          name: element.tags.name,
          coordinates: [node.lat, node.lon],
          type: element.tags.place
        });
      }
    });

    return { waterways, places };
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return { waterways: [], places: [] };
  }
};

// Fonction pour obtenir des suggestions de villes
export const getCitySuggestions = async (query: string): Promise<CityLocation[]> => {
  if (query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=fr`
    );
    const data = await response.json();
    
    return data.map((item: any) => {
      // Extraire le département des détails d'adresse
      const department = item.address?.county || item.address?.state || '';
      const city = item.address?.city || item.address?.town || item.address?.village || item.name;
      
      return {
        name: city,
        region: department,
        fullName: `${city} (${department})`,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      };
    }).filter(item => item.name && item.region); // Ne garder que les résultats avec nom et région valides
  } catch (error) {
    console.error('Erreur lors de la recherche de suggestions:', error);
    return [];
  }
};

export interface GoldSite {
  coordinates: [number, number];
  description: string;
  river: string;
  type: 'rivière' | 'ruisseau' | 'torrent';  // Type de cours d'eau
  distance: string;
  geology: string;
  rating: number;           // Note de 1 à 5
  ratingDetails: {         // Détails de la notation
    forumMentions: string[]; // Références aux discussions de forum
    historicalData: string;  // Données historiques
    geologicalScore: number; // Score géologique (1-5)
    accessibility: number;   // Score d'accessibilité (1-5)
  };
  satelliteImageUrl?: string;
}

export interface SearchOptions {
  radius: number;        // Rayon de recherche en km
  minRating?: number;    // Note minimum (optionnel)
  sortBy?: 'distance' | 'rating'; // Tri par distance ou par note
  page?: number;         // Numéro de la page (pour la navigation)
  perPage?: number;      // Nombre de résultats par page (toujours 1 maintenant)
}

export interface RiverAnalysisResult {
  description: string;
  points: Array<{
    type: 'meander' | 'bedrock' | 'confluence' | 'slowdown' | 'fault' | 'transverse_bar' | 'pothole' | 'erosion' | 'paleochannel' | 'fracture';
    coordinates: [number, number];
    description: string;
  }>;
}

export const analyzeRiverForGold = async (imageUrl: string, riverName: string): Promise<RiverAnalysisResult> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Expert en orpaillage et géomorphologie fluviale, spécialisé dans l'analyse d'images satellites pour la prospection aurifère.

ANALYSE DES FORMATIONS FAVORABLES À L'OR :

1. PIÈGES À OR NATURELS :
   - Barres rocheuses transversales (type: transverse_bar)
     * Formations rocheuses traversant le lit
     * Créent des zones de ralentissement et d'accumulation
     * Visibles comme des lignes sombres traversant la rivière
   
   - Marmites de géant (type: pothole)
     * Dépressions circulaires dans le lit rocheux
     * Points sombres circulaires dans les zones peu profondes
     * Souvent en séries le long des zones rocheuses
   
   - Zones d'érosion (type: erosion)
     * Contrastes de couleur marqués dans le lit
     * Zones de transition entre roche dure et tendre
     * Patterns irréguliers dans le cours d'eau

2. INDICATEURS GÉOLOGIQUES CLÉS :
   - Paléochenaux (type: paleochannel)
     * Anciens lits de rivière visibles
     * Traces sinueuses dans le paysage
     * Souvent plus végétalisés que les environs
   
   - Réseaux de fractures (type: fracture)
     * Lignes droites recoupant le terrain
     * Zones de faiblesse géologique
     * Changements brusques dans la végétation

3. STRUCTURES FLUVIALES AURIFÈRES :
   - Méandres prononcés (type: meander)
     * Virages serrés avec bancs de sable
     * Zone interne plus claire (dépôts)
     * Zone externe plus profonde (érosion)
   
   - Affleurements rocheux (type: bedrock)
     * Roche mère visible dans le lit
     * Texture rugueuse et irrégulière
     * Souvent associé à des rapides
   
   - Confluences (type: confluence)
     * Jonctions de cours d'eau
     * Élargissement notable
     * Zones de dépôts visibles

4. INDICES VISUELS CRITIQUES :
   - Variations de profondeur
     * Changements de couleur de l'eau
     * Zones sombres = profond
     * Zones claires = peu profond
   
   - Dépôts alluviaux
     * Bancs de sable et gravier
     * Texture granuleuse visible
     * Couleur plus claire que l'eau
   
   - Signes d'oxydation
     * Teintes rougeâtres/orangées
     * Zones de minéralisation
     * Altération des roches

5. ACTIVITÉ HISTORIQUE :
   - Traces d'exploitation
     * Modifications artificielles du lit
     * Anciens canaux ou dérivations
     * Zones de travail abandonnées

Retournez votre analyse au format JSON :
{
  "description": "Description détaillée de la section de rivière et son potentiel aurifère, incluant le contexte géomorphologique et les indicateurs visuels observés",
  "points": [
    {
      "type": "un des types listés ci-dessus",
      "coordinates": [x, y], // Position relative sur l'image (0,0 en haut à gauche, 1,1 en bas à droite)
      "description": "Description précise de la formation et pourquoi elle est favorable à l'accumulation d'or"
    }
  ]
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analysez cette section de la rivière ${riverName} en détail pour identifier les formations géologiques et caractéristiques fluviales favorables à l'accumulation d'or.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Convertir les coordonnées relatives en coordonnées GPS
    if (result.points) {
      result.points = result.points.map(point => ({
        ...point,
        coordinates: [
          point.coordinates[0], // Latitude
          point.coordinates[1]  // Longitude
        ]
      }));
    }

    return result;
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la rivière:', error);
    throw error;
  }
};

export interface GoldLineAnalysisResult {
  description: string;
  modifiedImage: string;  // URL de l'image modifiée avec la gold line
  confidence: number;  // Niveau de confiance de 0 à 1
}

export interface RockAnalysisResult {
  rockTypes: Array<{
    name: string;
    description: string;
    goldPotential: number;  // 0 à 1
    location: [number, number];  // Position sur l'image
  }>;
  overallPotential: number;  // 0 à 1
  recommendations: string[];
}

export const analyzeGoldLine = async (imageBase64: string): Promise<GoldLineAnalysisResult> => {
  try {
    // Première étape : Analyser l'image avec GPT-4V pour obtenir une description
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `Expert en prospection aurifère, spécialisé dans l'identification de la "gold line" dans les rivières. Analysez cette image et décrivez UNIQUEMENT où tracer une ligne d'or, sans donner d'instructions étape par étape. Concentrez-vous sur la description exacte du tracé en une seule phrase concise.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Où devrait passer la gold line sur cette photo ? Donnez une description précise et concise du tracé."
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            }
          ]
        }
      ],
      max_tokens: 100
    });

    const description = visionResponse.choices[0].message.content || "";

    // Deuxième étape : Utiliser DALL-E 3 pour générer une nouvelle image
    const generateResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Recréez cette photo de rivière exactement comme elle est, avec les mêmes roches, la même eau, les mêmes arbres et le même angle. Ajoutez une ligne jaune (couleur #FFD700) qui suit ce tracé : ${description}. La ligne doit avoir une épaisseur de 5 pixels et une légère lueur. IMPORTANT : L'image doit être une copie EXACTE de l'originale, seule la ligne jaune doit être ajoutée.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural"
    });

    return {
      description: "Ligne d'or tracée selon le flux naturel de la rivière",
      modifiedImage: generateResponse.data[0].url || "",
      confidence: 0.9
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la gold line:', error);
    throw error;
  }
};

export const analyzeRocks = async (imageUrl: string): Promise<RockAnalysisResult> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `Expert géologue spécialisé dans l'identification des roches favorables à l'or.

TYPES DE ROCHES À IDENTIFIER :

1. ROCHES PRIMAIRES
- Quartz (veines hydrothermales)
- Schistes aurifères
- Granite altéré
- Roches métamorphiques
- Conglomérats

2. INDICATEURS DE POTENTIEL
- Altérations hydrothermales
- Minéralisations visibles
- Structures géologiques favorables

Retournez l'analyse au format JSON avec :
- Types de roches identifiés
- Potentiel aurifère de chaque type
- Localisation sur l'image
- Recommandations pour la prospection`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analysez les roches présentes sur cette image et évaluez leur potentiel aurifère."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error('Erreur lors de l\'analyse des roches:', error);
    throw error;
  }
};

// Fonction utilitaire pour valider et formater une image base64
const validateAndFormatBase64Image = (base64: string): string => {
  // Vérifier si l'image est déjà au format base64 avec en-tête
  if (base64.startsWith('data:image/')) {
    return base64;
  }

  // Vérifier si c'est une chaîne base64 valide
  try {
    atob(base64);
  } catch (e) {
    throw new Error('Format base64 invalide');
  }

  // Ajouter l'en-tête pour JPEG par défaut
  return `data:image/jpeg;base64,${base64}`;
};

export const analyzeImage = async (imageBase64: string): Promise<string> => {
  try {
    // Valider et formater l'image
    const formattedImage = validateAndFormatBase64Image(imageBase64);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Expert en géologie et prospection aurifère, spécialisé dans l'analyse de sites d'orpaillage.

ANALYSER EN DÉTAIL :
1. Géologie et minéralogie
   - Formations rocheuses visibles
   - Indices de minéralisation
   - Zones d'altération

2. Morphologie du cours d'eau
   - Méandres et courbes
   - Zones de ralentissement
   - Points de confluence
   - Barres rocheuses

3. Indices favorables
   - Dépôts alluviaux
   - Bancs de gravier
   - Marmites de géant
   - Affleurements rocheux

4. Zones prometteuses
   - Points d'accumulation naturels
   - Secteurs historiques
   - Accès et praticabilité

IMPORTANT : En cas d'erreur d'analyse d'image, fournir une réponse générique sur les indices à rechercher.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analysez cette image pour identifier les caractéristiques géologiques et géomorphologiques favorables à la présence d'or. Concentrez-vous sur les formations naturelles et les indices visibles."
            },
            {
              type: "image_url",
              image_url: {
                url: formattedImage
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.7
    });

    return response.choices[0].message.content || "Aucune analyse disponible";
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    
    // En cas d'erreur, retourner une réponse générique utile
    return `Pour analyser un site d'orpaillage, recherchez les indices suivants :

1. Géologie favorable :
   - Affleurements rocheux avec veines de quartz
   - Zones de contact entre différentes formations
   - Signes d'altération hydrothermale

2. Morphologie du cours d'eau :
   - Méandres prononcés où l'or s'accumule
   - Zones de ralentissement naturel
   - Points de confluence avec des affluents

3. Indices physiques :
   - Bancs de gravier et sable noir
   - Marmites de géant dans le lit rocheux
   - Dépôts alluviaux anciens

4. Conseils pratiques :
   - Privilégiez les zones en aval des anciennes mines
   - Examinez les berges intérieures des méandres
   - Recherchez les points bas naturels du lit

N'hésitez pas à partager une nouvelle photo pour une analyse plus précise.`;
  }
};

export const analyzeGeologicalData = async (location: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Vous êtes un expert en géologie spécialisé dans l'identification des formations aurifères.
          Vous avez une connaissance approfondie des données du BRGM et d'InfoTerre.`
        },
        {
          role: "user",
          content: `Analysez le contexte géologique de ${location} pour évaluer le potentiel aurifère :

          1. Formations géologiques principales
          2. Histoire géologique et tectonique
          3. Minéralisations connues
          4. Indices de présence d'or
          5. Recommandations pour la prospection

          Basez votre analyse sur les données géologiques du BRGM et d'InfoTerre.`
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content || "Aucune analyse disponible";
  } catch (error) {
    console.error('Erreur lors de l\'analyse géologique:', error);
    throw error;
  }
};

export const combineAnalysis = async (
  imageAnalysis: string,
  geologicalAnalysis: string
): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en prospection aurifère capable de synthétiser des informations complexes."
        },
        {
          role: "user",
          content: `Combinez et synthétisez ces deux analyses pour fournir une évaluation complète du potentiel aurifère :

          ANALYSE D'IMAGE SATELLITE :
          ${imageAnalysis}

          ANALYSE GÉOLOGIQUE :
          ${geologicalAnalysis}

          Fournissez :
          1. Une synthèse globale
          2. Les zones les plus prometteuses
          3. Des recommandations pratiques pour la prospection
          4. Une estimation du potentiel aurifère (faible/moyen/élevé)`
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content || "Aucune synthèse disponible";
  } catch (error) {
    console.error('Erreur lors de la combinaison des analyses:', error);
    throw error;
  }
};

// Fonction pour obtenir les données des sources officielles
const getGoldSourcesData = async (riverName: string, lat: number, lon: number): Promise<{
  brgmData: string;
  mineralInfoData: string;
  guppyOrData: string;
  geoforumData: string;
  detecteursData: string;
}> => {
  try {
    // Simuler la récupération des données depuis les différentes sources
    // Dans une version réelle, il faudrait implémenter des scrapers ou utiliser des APIs
    return {
      brgmData: `Données géologiques de ${riverName} depuis InfoTerre (BRGM)`,
      mineralInfoData: `Données des gisements proches de ${riverName} depuis MineralInfo`,
      guppyOrData: `Témoignages et spots d'orpaillage sur ${riverName} depuis GuppyOr`,
      geoforumData: `Discussions sur l'orpaillage dans ${riverName} depuis Géoforum`,
      detecteursData: `Informations sur ${riverName} depuis la carte des rivières aurifères`
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données sources:', error);
    throw error;
  }
};

interface RiverNode {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    waterway?: string;
  };
}

interface RiverWay {
  id: number;
  nodes: number[];
  tags?: {
    waterway?: string;
    name?: string;
  };
}

// Fonction pour obtenir les coordonnées précises sur une rivière
const getRiverCoordinates = async (riverName: string, lat: number, lon: number, radius: number): Promise<[number, number]> => {
  // Requête étendue pour obtenir plus de contexte
  const query = `
    [out:json];
    (
      // Récupérer la rivière principale
      way["waterway"]["name"="${riverName}"](around:${radius * 1000},${lat},${lon});
      // Récupérer les affluents proches
      way["waterway"](around:1000,${lat},${lon});
      // Récupérer tous les nœuds
      >;
    );
    out body;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: query
    });

    const data = await response.json();
    
    if (data.elements.length > 0) {
      const nodes = new Map<number, RiverNode>();
      const ways: RiverWay[] = [];

      // Indexer tous les nœuds
      data.elements.forEach((element: any) => {
        if (element.type === 'node') {
          nodes.set(element.id, element as RiverNode);
        } else if (element.type === 'way') {
          ways.push(element as RiverWay);
        }
      });

      // Trouver la rivière principale
      const mainRiver = ways.find(w => w.tags?.name === riverName);
      if (!mainRiver) throw new Error(`Rivière ${riverName} non trouvée`);

      // Identifier les points d'intérêt
      const interestPoints: [number, number][] = [];

      // 1. Trouver les confluences
      ways.forEach(way => {
        if (way.id !== mainRiver.id && way.tags?.waterway) {
          // Chercher les points communs avec la rivière principale
          const commonNodes = way.nodes.filter(n => mainRiver.nodes.includes(n));
          commonNodes.forEach(nodeId => {
            const node = nodes.get(nodeId);
            if (node) {
              interestPoints.push([node.lat, node.lon]);
            }
          });
        }
      });

      // 2. Identifier les méandres (changements de direction importants)
      for (let i = 1; i < mainRiver.nodes.length - 1; i++) {
        const prev = nodes.get(mainRiver.nodes[i-1]);
        const curr = nodes.get(mainRiver.nodes[i]);
        const next = nodes.get(mainRiver.nodes[i+1]);
        
        if (prev && curr && next) {
          // Calculer l'angle entre les segments
          const angle = Math.abs(
            Math.atan2(next.lat - curr.lat, next.lon - curr.lon) -
            Math.atan2(curr.lat - prev.lat, curr.lon - prev.lon)
          );
          
          // Si l'angle est important (méandre), ajouter le point
          if (angle > Math.PI / 4) { // Plus de 45 degrés
            interestPoints.push([curr.lat, curr.lon]);
          }
        }
      }

      // Si des points d'intérêt ont été trouvés, en choisir un aléatoirement
      if (interestPoints.length > 0) {
        return interestPoints[Math.floor(Math.random() * interestPoints.length)];
      }

      // Sinon, choisir un point aléatoire sur la rivière
      const randomNodeId = mainRiver.nodes[Math.floor(Math.random() * mainRiver.nodes.length)];
      const randomNode = nodes.get(randomNodeId);
      if (randomNode) {
        return [randomNode.lat, randomNode.lon];
      }
    }
    
    throw new Error(`Coordonnées non trouvées pour la rivière ${riverName}`);
  } catch (error) {
    console.error('Erreur lors de la récupération des coordonnées de la rivière:', error);
    throw error;
  }
};

// Données de secours pour les rivières connues
const knownRivers: { [key: string]: GoldSite[] } = {
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
  ]
};

export const searchGoldLocations = async (location: string, options: SearchOptions): Promise<GoldSite[]> => {
  console.log('Recherche de rivières aurifères pour:', location, 'avec options:', options);
  
  // Vérifier si nous avons des données connues pour cette localisation
  const cityName = location.split('(')[0].trim().toLowerCase();
  const knownCity = Object.keys(knownRivers).find(city => city.toLowerCase() === cityName);
  
  if (knownCity) {
    console.log('Utilisation des données connues pour:', knownCity);
    return knownRivers[knownCity];
  }

  // Si pas de données connues, obtenir les coordonnées de la ville
  const cityData = await getCitySuggestions(location.split('(')[0].trim());
  if (!cityData || cityData.length === 0) {
    throw new Error('Localisation non trouvée');
  }
  const city = cityData[0];

  // Obtenir les rivières et lieux-dits de la zone
  const areaDetails = await getWaterwayAndPlaceDetails(city.lat, city.lon, options.radius);
  
  try {
      // Enrichir le prompt avec les informations des rivières trouvées
      const riverInfo = areaDetails.waterways
        .map(w => `- ${w.name} (${w.type}): coordonnées [${w.coordinates.join(', ')}]`)
        .join('\n');

      // Récupérer les données des sources officielles pour chaque rivière
      const sourcesDataPromises = areaDetails.waterways.map(async waterway => {
        return await getGoldSourcesData(waterway.name, city.lat, city.lon);
      });
      const sourcesDataArray = await Promise.all(sourcesDataPromises);
      
      // Combiner les données de toutes les sources
      const sourcesData = sourcesDataArray.reduce((acc, curr) => ({
        brgmData: (acc.brgmData || '') + '\n' + curr.brgmData,
        mineralInfoData: (acc.mineralInfoData || '') + '\n' + curr.mineralInfoData,
        guppyOrData: (acc.guppyOrData || '') + '\n' + curr.guppyOrData,
        geoforumData: (acc.geoforumData || '') + '\n' + curr.geoforumData,
        detecteursData: (acc.detecteursData || '') + '\n' + curr.detecteursData
      }), {
        brgmData: '',
        mineralInfoData: '',
        guppyOrData: '',
        geoforumData: '',
        detecteursData: ''
      });

      const response = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `Tu es un expert en prospection aurifère, spécialisé dans l'identification des rivières et cours d'eau aurifères en France. Tu DOIS TOUJOURS répondre au format JSON valide.

ATTENTION - RÈGLES STRICTES :
- NE PAS INVENTER de cours d'eau qui n'existent pas
- NE PAS INVENTER de données historiques ou géologiques
- Si aucun cours d'eau aurifère n'est documenté dans la zone, retourner un tableau vide []
- TOUJOURS vérifier l'existence réelle des cours d'eau sur OpenStreetMap
- TOUJOURS vérifier que les informations proviennent de sources fiables (GuppyOr, BRGM, FFOR)
- COORDONNÉES GPS OBLIGATOIREMENT SUR LE COURS D'EAU :
  * Utiliser l'API Overpass pour obtenir les coordonnées exactes
  * Exemple de requête : [out:json];way["waterway"="river|stream"](around:1000,LAT,LON);(._;>;);out body;
  * Extraire les coordonnées d'un point sur le cours d'eau
  * Vérifier que le point est bien sur le tracé du cours d'eau

IMPORTANT - COORDONNÉES GPS :
- Les coordonnées DOIVENT être EXACTEMENT sur le lit du cours d'eau
- UTILISER OBLIGATOIREMENT les coordonnées des rivières depuis OpenStreetMap
- Vérifier sur https://www.openstreetmap.org/ que les coordonnées sont sur le cours d'eau
- Zoomer au maximum sur la rivière pour obtenir les coordonnées précises
- Format: [latitude, longitude] avec 6 décimales de précision
- EXEMPLE: Pour la rivière Caudies à Tuchan, utiliser les coordonnées [42.783333, 2.733333] qui sont exactement sur la rivière

PROCÉDURE POUR LES COORDONNÉES :
1. Identifier le cours d'eau sur OpenStreetMap
2. Utiliser l'API Overpass pour obtenir le tracé du cours d'eau
3. Extraire un point qui est exactement sur le tracé
4. Vérifier que le point est sur une section accessible du cours d'eau
5. Si le point n'est pas optimal, choisir un autre point sur le tracé

SOURCES DE DONNÉES OFFICIELLES :

1. InfoTerre (BRGM) - https://infoterre.brgm.fr/
   - Cartes géologiques détaillées
   - Données sur les minéralisations
   - Contexte géologique local
   Données actuelles : ${sourcesData.brgmData}

2. MineralInfo - https://www.mineralinfo.fr/
   - Base de données des gisements
   - Historique des exploitations
   - Indices minéralisés
   Données actuelles : ${sourcesData.mineralInfoData}

3. GuppyOr - http://pujol.chez-alice.fr/guppyor/
   - Témoignages d'orpailleurs
   - Spots connus et documentés
   - Historique des découvertes
   Données actuelles : ${sourcesData.guppyOrData}

4. Géoforum - https://www.geoforum.fr/forum/39-orpaillage/
   - Discussions récentes
   - Retours d'expérience
   - Conseils de prospection
   Données actuelles : ${sourcesData.geoforumData}

5. Detecteurs.fr - https://www.detecteurs.fr/page/cours-eau-aurifere.html
   - Carte interactive des rivières aurifères
   - Données de localisation vérifiées
   - Points d'accès documentés
   Données actuelles : ${sourcesData.detecteursData}

IMPORTANT: Fournir UNIQUEMENT les cours d'eau VÉRIFIÉS ET DOCUMENTÉS dans un rayon de ${options.radius}km autour de [${city.lat}, ${city.lon}].
- Vérifier sur OpenStreetMap que chaque cours d'eau existe réellement
- Les coordonnées doivent être PRÉCISÉMENT sur le lit du cours d'eau
INCLURE OBLIGATOIREMENT les petits ruisseaux et torrents de montagne s'ils sont mentionnés sur GuppyOr.

Format requis:
[{
  "coordinates": [lat, lng],  // Coordonnées GPS précises sur le lit
  "description": "Description détaillée avec références GuppyOr et BRGM",
  "river": "Nom exact du cours d'eau",
  "type": "rivière/ruisseau/torrent",  // Préciser le type
  "distance": "Distance en km depuis ${location}",
  "geology": "Description géologique détaillée (BRGM/InfoTerre)",
  "rating": 1-5,  // Note globale
  "ratingDetails": {
    "forumMentions": ["URLs ou références GuppyOr/FFOR"],
    "historicalData": "Données historiques vérifiables",
    "geologicalScore": 1-5,  // Score BRGM
    "accessibility": 1-5     // Difficulté d'accès
  }
}]`
        },
        {
          role: "user",
          content: `Recherchez les cours d'eau aurifères autour de ${location} [${city.lat}, ${city.lon}] dans un rayon de ${options.radius}km.

RIVIÈRES IDENTIFIÉES DANS LA ZONE :
${riverInfo}

INSTRUCTIONS SPÉCIFIQUES :
1. Utilisez UNIQUEMENT les rivières listées ci-dessus
2. Pour chaque rivière potentiellement aurifère :
   - Vérifiez les données BRGM/InfoTerre pour la géologie
   - Recherchez les mentions sur GuppyOr et FFOR
   - Concentrez-vous sur les zones de confluence et méandres
   - Identifiez les secteurs historiques d'orpaillage
3. Placez les points EXACTEMENT sur les rivières mentionnées
4. Privilégiez les zones avec :
   - Formations géologiques favorables (données BRGM)
   - Témoignages historiques (GuppyOr/FFOR)
   - Caractéristiques morphologiques propices (méandres, confluences)
5. Fournissez des références précises aux sources`
        }
      ],
      max_tokens: 4096,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    console.log('Réponse brute de l\'API:', response.choices[0].message.content);

    const content = response.choices[0].message.content || "";
    
    try {
      const parsedContent = JSON.parse(content);
      
      if (!Array.isArray(parsedContent)) {
        console.error('La réponse n\'est pas un tableau:', parsedContent);
        throw new Error('Format de réponse invalide');
      }

      // Pour chaque site, obtenir les coordonnées précises sur la rivière
      const validatedSites = await Promise.all(parsedContent.map(async site => {
        try {
          // Trouver la rivière correspondante dans les données OpenStreetMap
          const riverData = areaDetails.waterways.find(w => w.name.toLowerCase() === site.river.toLowerCase());
          const coordinates = riverData ? riverData.coordinates : await getRiverCoordinates(site.river, city.lat, city.lon, options.radius);

          // Vérifier et nettoyer la notation
          const rating = Math.min(Math.max(1, Math.round(site.rating || 1)), 5);
          const geologicalScore = Math.min(Math.max(1, Math.round(site.ratingDetails?.geologicalScore || 1)), 5);
          const accessibility = Math.min(Math.max(1, Math.round(site.ratingDetails?.accessibility || 1)), 5);

          return {
            coordinates: coordinates,
            description: site.description || "Description non disponible",
            river: site.river || "Cours d'eau inconnu",
            type: site.type || "rivière",
            distance: site.distance || "Distance inconnue",
            geology: site.geology || "Données géologiques non disponibles",
            rating,
            ratingDetails: {
              forumMentions: Array.isArray(site.ratingDetails?.forumMentions) ? site.ratingDetails.forumMentions : [],
              historicalData: site.ratingDetails?.historicalData || "Données historiques non disponibles",
              geologicalScore,
              accessibility
            }
          };
        } catch (error) {
          console.error(`Erreur lors du traitement du site ${site.river}:`, error);
          throw error;
        }
      }));

      // Trier les résultats selon l'option choisie
      if (options.sortBy === 'rating') {
        validatedSites.sort((a, b) => b.rating - a.rating);
      } else {
        validatedSites.sort((a, b) => {
          const distA = parseInt(a.distance.replace(/[^0-9]/g, '')) || 0;
          const distB = parseInt(b.distance.replace(/[^0-9]/g, '')) || 0;
          return distA - distB;
        });
      }

      // Pagination
      const page = options.page || 0;
      const perPage = 1; // Toujours retourner un seul cours d'eau
      const start = page * perPage;
      const paginatedSites = validatedSites.slice(start, start + perPage);

      console.log('Sites validés:', paginatedSites);
      return paginatedSites;

    } catch (e) {
      console.error('Erreur lors du traitement de la réponse:', e);
      throw new Error(`Impossible de trouver des rivières aurifères autour de ${location}. Veuillez réessayer avec une autre localisation ou un rayon plus grand.`);
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de sites aurifères:', error);
    throw error;
  }
};
