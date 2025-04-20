import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';
import type { ChatCompletionMessage } from 'openai/resources/chat/completions';

// Types pour la vision
export interface VisionContent {
  type: "text";
  text: string;
}

export interface ImageUrlContent {
  type: "image_url";
  image_url: { url: string };
}

export type VisionMessage = Omit<ChatCompletionMessage, 'content'> & {
  content: string | Array<VisionContent | ImageUrlContent>;
};

// Types pour les suggestions de villes
export interface CityLocation {
  name: string;        // Nom de la ville
  region: string;      // Région/Département
  fullName: string;    // Nom complet pour l'IA
  lat: number;
  lon: number;
}

// Types pour les données OpenStreetMap
export interface OverpassNodeTags {
  name?: string;
  place?: string;
  waterway?: string;
}

export interface OverpassWayTags {
  name?: string;
  waterway?: string;
}

export interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: OverpassNodeTags;
}

export interface OverpassWay {
  type: 'way';
  id: number;
  nodes: number[];
  tags?: OverpassWayTags;
}

export interface OverpassResponse {
  elements: (OverpassNode | OverpassWay)[];
}

// Types pour les sites aurifères
export interface GoldSite {
  coordinates: [number, number];
  description: string;
  spot?: string;           // Nom du spot spécifique
  river: string;           // Nom du cours d'eau
  type: string;            // Type de cours d'eau (rivière, ruisseau, torrent, canal, etc.)
  distance: string;
  geology: string;
  features?: string;       // Points d'intérêt (méandres, confluences, etc.)
  rating: number;          // Note de 1 à 5
  ratingDetails: {
    forumMentions: string[];  // Références aux discussions de forum
    historicalData: string;   // Données historiques
    geologicalScore: number;  // Score géologique (1-5)
    accessibility: number;    // Score d'accessibilité (1-5)
  };
  satelliteImageUrl?: string;
}

export interface SearchOptions {
  radius: number;        // Rayon de recherche en km
  minRating?: number;    // Note minimum (optionnel)
  sortBy?: 'distance' | 'rating'; // Tri par distance ou par note
  page?: number;         // Numéro de la page (pour la navigation)
  perPage?: number;      // Nombre de résultats par page
}

// Types pour les analyses
export interface RiverAnalysisResult {
  description: string;
  points: Array<{
    type: 'meander' | 'bedrock' | 'confluence' | 'slowdown' | 'fault' | 'transverse_bar' | 'pothole' | 'erosion' | 'paleochannel' | 'fracture';
    coordinates: [number, number];
    description: string;
  }>;
}

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

// Types pour les données des sources
export interface GoldSourcesData {
  brgmData: string;
  mineralInfoData: string;
  guppyOrData: string;
  geoforumData: string;
  detecteursData: string;
}

// Types pour les noeuds de rivière
export interface RiverNode {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    waterway?: string;
  };
}

export interface RiverWay {
  id: number;
  nodes: number[];
  tags?: {
    waterway?: string;
    name?: string;
  };
}
