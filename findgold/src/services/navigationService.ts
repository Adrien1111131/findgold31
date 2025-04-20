import { GoldLocation } from './openai/search/goldLocations';

export interface ChatRedirectParams {
  riverName: string;
  type: string;
  description: string;
  geology: string;
  history: string;
  hotspots: string[];
}

/**
 * Redirige vers la page Assistant avec les informations du cours d'eau
 * @param river Les informations du cours d'eau
 */
export function navigateToGoldmanIA(river: GoldLocation) {
  // Préparer les paramètres à passer à la page Assistant
  const params: ChatRedirectParams = {
    riverName: river.name,
    type: river.type,
    description: river.description,
    geology: river.geology,
    history: river.history,
    hotspots: river.hotspots.map(h => h.location)
  };

  // Encoder les paramètres en JSON puis en base64 pour éviter les problèmes d'URL
  const encodedParams = btoa(JSON.stringify(params));
  
  // Rediriger vers la page Assistant avec les paramètres
  window.location.href = `/assistant?river=${encodedParams}`;
}

/**
 * Récupère les paramètres du cours d'eau depuis l'URL
 * @returns Les paramètres du cours d'eau ou null si aucun paramètre n'est présent
 */
export function getRiverParamsFromURL(): ChatRedirectParams | null {
  const urlParams = new URLSearchParams(window.location.search);
  const riverParam = urlParams.get('river');
  
  if (!riverParam) {
    return null;
  }
  
  try {
    // Décoder les paramètres
    const decodedParams = JSON.parse(atob(riverParam));
    return decodedParams as ChatRedirectParams;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres du cours d\'eau:', error);
    return null;
  }
}

/**
 * Génère un message initial pour Goldman IA basé sur les informations du cours d'eau
 * @param params Les paramètres du cours d'eau
 * @returns Le message initial pour Goldman IA
 */
export function generateInitialMessage(params: ChatRedirectParams): string {
  let message = `Je suis intéressé par l'orpaillage sur ${params.riverName} (${params.type}). `;
  
  message += `Peux-tu me donner des conseils de prospection pour ce cours d'eau, `;
  
  if (params.geology) {
    message += `en tenant compte de sa géologie (${params.geology.substring(0, 100)}${params.geology.length > 100 ? '...' : ''}) `;
  }
  
  if (params.history) {
    message += `et de son historique (${params.history.substring(0, 100)}${params.history.length > 100 ? '...' : ''}) ? `;
  }
  
  if (params.hotspots && params.hotspots.length > 0) {
    message += `\n\nJe suis particulièrement intéressé par ces zones spécifiques : ${params.hotspots.join(', ')}. `;
  }
  
  message += `\n\nQuelles techniques d'orpaillage me recommandes-tu pour ce cours d'eau spécifique ?`;
  
  return message;
}
