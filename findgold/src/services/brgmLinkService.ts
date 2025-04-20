/**
 * Service pour générer des liens vers les cartes et données du BRGM
 */

/**
 * Génère un lien vers InfoTerre du BRGM à partir de coordonnées
 * @param lat Latitude
 * @param lng Longitude
 * @param zoom Niveau de zoom (1-20)
 * @returns URL vers InfoTerre centré sur les coordonnées
 */
export function generateInfoTerreLink(lat: number, lng: number, zoom: number = 14): string {
  return `https://infoterre.brgm.fr/viewer/MainTileForward.do?x=${lng}&y=${lat}&zoom=${zoom}`;
}

/**
 * Génère un lien vers une carte géologique spécifique du BRGM
 * @param cardNumber Numéro de la carte géologique
 * @returns URL vers la carte géologique
 */
export function generateGeologicalMapLink(cardNumber: string): string {
  // Nettoyer le numéro de carte pour extraire juste les chiffres
  const cleanNumber = cardNumber.replace(/[^\d]/g, '');
  return `https://infoterre.brgm.fr/rechercher/search.htm?typesearch=cartegeol50&cartegeol50=${cleanNumber}`;
}

/**
 * Génère un lien vers un indice minier du BRGM
 * @param indexNumber Numéro de l'indice minier
 * @returns URL vers l'indice minier
 */
export function generateMineralIndexLink(indexNumber: string): string {
  // Nettoyer le numéro d'indice pour extraire juste les chiffres
  const cleanNumber = indexNumber.replace(/[^\d]/g, '');
  return `https://infoterre.brgm.fr/rechercher/search.htm?typesearch=gite&id=${cleanNumber}`;
}

/**
 * Génère un lien vers un sondage ou une carotte du BRGM
 * @param bssCode Code BSS du sondage
 * @returns URL vers les données du sondage
 */
export function generateDrillingDataLink(bssCode: string): string {
  return `https://infoterre.brgm.fr/rechercher/search.htm?typesearch=bss&id=${bssCode}`;
}

/**
 * Détermine le type de référence BRGM et génère le lien approprié
 * @param reference Texte de référence BRGM
 * @param coordinates Coordonnées [lat, lng] par défaut
 * @returns URL vers la ressource BRGM appropriée
 */
export function generateBrgmLink(reference: string, coordinates?: [number, number]): string {
  // Carte géologique
  if (reference.includes('Carte géologique') || reference.includes('Feuille')) {
    const cardMatch = reference.match(/n°(\d+)/);
    if (cardMatch && cardMatch[1]) {
      return generateGeologicalMapLink(cardMatch[1]);
    }
  }
  
  // Indice minier
  if (reference.includes('Indice') || reference.includes('Gîte')) {
    const indexMatch = reference.match(/n°(\d+)/);
    if (indexMatch && indexMatch[1]) {
      return generateMineralIndexLink(indexMatch[1]);
    }
  }
  
  // Sondage BSS
  if (reference.includes('BSS') || reference.includes('Sondage') || reference.includes('Carotte')) {
    const bssMatch = reference.match(/BSS\s*([A-Z0-9]+)/i);
    if (bssMatch && bssMatch[1]) {
      return generateDrillingDataLink(bssMatch[1]);
    }
  }
  
  // Par défaut, utiliser les coordonnées si disponibles
  if (coordinates && coordinates.length === 2) {
    return generateInfoTerreLink(coordinates[0], coordinates[1]);
  }
  
  // Fallback: recherche générale sur InfoTerre
  return 'https://infoterre.brgm.fr/';
}
