import { RiverNode, RiverWay } from '../types';

// Fonction pour obtenir les coordonnées précises sur une rivière
export const getRiverCoordinates = async (riverName: string, lat: number, lon: number, radius: number): Promise<[number, number]> => {
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

// Fonction pour obtenir les données des sources officielles
export const getGoldSourcesData = async (riverName: string, lat: number, lon: number): Promise<{
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
