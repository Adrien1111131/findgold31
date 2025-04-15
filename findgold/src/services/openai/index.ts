// Client OpenAI
export { openai } from './client';

// Types
export * from './types';

// Géolocalisation
export { getCitySuggestions, getWaterwayAndPlaceDetails } from './geo/citySearch';
export { getRiverCoordinates, getGoldSourcesData } from './geo/riverData';

// Analyses
export { analyzeImage } from './analysis/imageAnalysis';
export { analyzeRiverForGold, analyzeGeologicalData, combineAnalysis } from './analysis/riverAnalysis';
export { analyzeRocks } from './analysis/rockAnalysis';
export { analyzeGoldLine } from './analysis/goldLine';

// Recherche
export { searchGoldLocations } from './search/goldLocations';
export { knownRivers } from './search/mockData';
