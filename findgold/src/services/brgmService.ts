// Service pour gérer les couches géologiques du BRGM

export interface GeologyLayer {
  id: string;
  name: string;
  wmsUrl: string;
  layers: string;
  color: string;
  description: string;
  visible: boolean;
  opacity: number;
}

// Couches géologiques disponibles
export const geologyLayers: GeologyLayer[] = [
  {
    id: 'geology',
    name: 'Carte géologique',
    wmsUrl: 'https://geoservices.brgm.fr/geologie',
    layers: 'GEOLOGIE',
    color: '#ff7700',
    description: 'Carte géologique de la France au 1/50 000',
    visible: false,
    opacity: 0.7
  },
  {
    id: 'quartz',
    name: 'Filons de quartz',
    wmsUrl: 'https://geoservices.brgm.fr/geologie',
    layers: 'GITES_SUBSTANCES',
    color: '#ffffff',
    description: 'Filons de quartz potentiellement aurifères',
    visible: false,
    opacity: 0.7
  },
  {
    id: 'minerals',
    name: 'Gîtes minéraux',
    wmsUrl: 'https://geoservices.brgm.fr/geologie',
    layers: 'GITES',
    color: '#ffcc00',
    description: 'Gîtes et indices minéraux (dont or)',
    visible: false,
    opacity: 0.7
  },
  {
    id: 'faults',
    name: 'Failles géologiques',
    wmsUrl: 'https://geoservices.brgm.fr/geologie',
    layers: 'FAILLES_50',
    color: '#ff0000',
    description: 'Failles et structures géologiques',
    visible: false,
    opacity: 0.7
  }
];

// Légende géologique pour l'or
export const goldGeologyLegend = [
  {
    title: 'Formations favorables à l\'or',
    items: [
      {
        name: 'Filons de quartz',
        color: '#ffffff',
        description: 'L\'or primaire se trouve souvent dans des filons de quartz associés à des minéralisations hydrothermales'
      },
      {
        name: 'Roches métamorphiques',
        color: '#a37cb7',
        description: 'Schistes, gneiss et autres roches métamorphiques peuvent contenir des minéralisations aurifères'
      },
      {
        name: 'Granites',
        color: '#ff7777',
        description: 'Les intrusions granitiques peuvent être associées à des gisements aurifères'
      },
      {
        name: 'Zones de failles',
        color: '#ff0000',
        description: 'Les failles sont des conduits pour les fluides minéralisateurs contenant de l\'or'
      }
    ]
  },
  {
    title: 'Indices de présence d\'or',
    items: [
      {
        name: 'Gîtes aurifères connus',
        color: '#ffcc00',
        description: 'Sites où la présence d\'or a été documentée par le BRGM'
      },
      {
        name: 'Anciennes mines d\'or',
        color: '#ff9900',
        description: 'Exploitations historiques d\'or, souvent associées à des placers encore actifs'
      },
      {
        name: 'Alluvions récentes',
        color: '#ffffcc',
        description: 'Dépôts alluviaux récents pouvant contenir de l\'or détritique'
      }
    ]
  }
];

// Fonction pour générer l'URL WMS avec les paramètres
export function generateWmsUrl(layer: GeologyLayer, width: number, height: number, bbox: string): string {
  return `${layer.wmsUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=${layer.layers}&WIDTH=${width}&HEIGHT=${height}&CRS=EPSG:4326&STYLES=&BBOX=${bbox}`;
}

// Fonction pour obtenir la légende d'une couche
export function getLayerLegendUrl(layer: GeologyLayer): string {
  return `${layer.wmsUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=${layer.layers}&STYLE=default`;
}
