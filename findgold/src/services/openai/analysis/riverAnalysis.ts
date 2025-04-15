import { openai } from '../client';
import { RiverAnalysisResult } from '../types';

export const analyzeRiverForGold = async (imageUrl: string, riverName: string): Promise<RiverAnalysisResult> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
