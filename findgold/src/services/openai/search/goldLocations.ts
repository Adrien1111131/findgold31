import { openai } from '../client';
import { GoldSite, SearchOptions } from '../types';
import { getCitySuggestions, getWaterwayAndPlaceDetails } from '../geo/citySearch';
import { getRiverCoordinates, getGoldSourcesData } from '../geo/riverData';
import { knownRivers } from './mockData';

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
      const perPage = options.perPage || 1;
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
