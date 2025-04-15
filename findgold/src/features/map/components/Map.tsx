import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GoldSite } from '../../../services/openai';

interface MapProps {
  center: [number, number];
  sites?: GoldSite[];
  onMarkerClick?: (site: GoldSite) => void;
}

const Map: React.FC<MapProps> = ({ center, sites = [], onMarkerClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const layerControlRef = useRef<L.Control.Layers | null>(null);
  const riverLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Initialiser la carte
      mapRef.current = L.map(mapContainerRef.current).setView(center, 13);

      // Couche satellite avec noms des lieux
      const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google'
      }).addTo(mapRef.current);

      // Couche topographique avec dénivelés
      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
      });

      // Créer une couche vide pour le réseau hydrographique
      riverLayerRef.current = L.geoJSON().addTo(mapRef.current);

      // Initialiser le contrôle des couches
      layerControlRef.current = L.control.layers({
        "Vue satellite avec noms": satelliteLayer,
        "Carte topographique": topoLayer
      }, {
        "Réseau hydrographique": riverLayerRef.current
      }).addTo(mapRef.current);

      // Ajouter une échelle
      L.control.scale({
        imperial: false,
        metric: true
      }).addTo(mapRef.current);

      // Créer les icônes personnalisées selon le type de cours d'eau
      const icons = {
        'rivière': L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        }),
        'ruisseau': L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        }),
        'torrent': L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      };

      // Fonction pour charger et afficher le cours d'eau et ses affluents
      const showRiverNetwork = async (site: GoldSite) => {
        // Supprimer l'ancienne couche de rivière si elle existe
        if (riverLayerRef.current) {
          mapRef.current?.removeLayer(riverLayerRef.current);
        }

        // Requête Overpass pour obtenir la rivière et ses affluents
        const query = `
          [out:json];
          (
            way["waterway"="river"]["name"="${site.river}"](around:20000,${site.coordinates[0]},${site.coordinates[1]});
            way["waterway"="stream"](around:2000,${site.coordinates[0]},${site.coordinates[1]});
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
          
          // Convertir les données en GeoJSON
          const features = {
            type: 'FeatureCollection',
            features: data.elements
              .filter((e: any) => e.type === 'way')
              .map((e: any) => ({
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: e.nodes.map((n: number) => {
                    const node = data.elements.find((el: any) => el.type === 'node' && el.id === n);
                    return [node.lon, node.lat];
                  })
                },
                properties: {
                  name: e.tags?.name,
                  waterway: e.tags?.waterway,
                  isMainRiver: e.tags?.name === site.river
                }
              }))
          };

          // Mettre à jour la couche existante avec les nouvelles données
          riverLayerRef.current?.clearLayers();
          riverLayerRef.current?.addData(features as any);
          riverLayerRef.current?.setStyle((feature) => ({
            color: feature?.properties?.isMainRiver ? '#0066FF' : '#4DA6FF',
            weight: feature?.properties?.isMainRiver ? 4 : 2,
            opacity: feature?.properties?.isMainRiver ? 1 : 0.7
          }));

          // Ajuster la vue pour montrer tout le réseau hydrographique
          if (riverLayerRef.current) {
            mapRef.current?.fitBounds(riverLayerRef.current.getBounds());
          }
        } catch (error) {
          console.error('Erreur lors du chargement du réseau hydrographique:', error);
        }
      };

      // Ajouter les marqueurs pour chaque site
      if (sites.length > 0) {
        sites.forEach(site => {
          // Afficher le réseau hydrographique pour le premier site
          if (sites.length === 1) {
            showRiverNetwork(site);
          }
          const icon = icons[site.type || 'rivière'];
          const marker = L.marker(site.coordinates, { icon }).addTo(mapRef.current!);
          
          // Ajouter une popup avec un bouton d'analyse
          const popupContent = `
            <div style="max-width: 300px;">
              <h3 style="color: #FFD700; margin: 0 0 8px 0;">${site.river} (${site.type})</h3>
              <p style="margin: 0 0 8px 0;"><strong>Distance:</strong> ${site.distance}</p>
              <p style="margin: 0 0 8px 0;">${site.description}</p>
              <div style="background: rgba(0,0,0,0.05); padding: 8px; border-radius: 4px;">
                <strong>Géologie:</strong><br/>
                ${site.geology}
              </div>
              <button 
                onclick="document.dispatchEvent(new CustomEvent('analyzeRiver', {detail: ${JSON.stringify(site)}}))"
                style="
                  background: linear-gradient(45deg, #FFD700, #FFA500);
                  border: none;
                  border-radius: 4px;
                  padding: 8px 16px;
                  margin-top: 8px;
                  color: black;
                  font-weight: bold;
                  cursor: pointer;
                  width: 100%;
                "
              >
                Analyser la rivière
              </button>
            </div>
          `;
          marker.bindPopup(popupContent);

          // Ajouter un gestionnaire d'événement pour le bouton d'analyse
          document.addEventListener('analyzeRiver', ((e: CustomEvent) => {
            if (onMarkerClick) {
              onMarkerClick(e.detail);
            }
          }) as EventListener);
          markersRef.current.push(marker);
        });
      } else {
        // Ajouter un marqueur par défaut si aucun site n'est spécifié
        const marker = L.marker(center, { icon: icons['rivière'] }).addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    }

    // Cleanup lors du démontage du composant
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
        layerControlRef.current = null;
      }
    };
  }, [center, sites]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: '100%',
        width: '100%'
      }}
    />
  );
};

export default Map;
