import { CityLocation } from '../types';

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

    const data = await response.json();

    const nodes = new Map<number, any>();
    const waterways: { name: string; coordinates: [number, number]; type: string }[] = [];
    const places: { name: string; coordinates: [number, number]; type: string }[] = [];

    // Indexer tous les nœuds
    data.elements.forEach(element => {
      if (element.type === 'node') {
        nodes.set(element.id, element);
      }
    });

    // Traiter les cours d'eau et les lieux
    data.elements.forEach(element => {
      if (element.type === 'way' && element.tags?.waterway && element.tags?.name) {
        const way = element;
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
        const node = element;
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
