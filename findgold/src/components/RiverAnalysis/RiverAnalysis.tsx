import React, { useState, useEffect } from 'react';
import { GoldSite, RiverAnalysisResult, analyzeRiverForGold } from '../../services/openai';
import styles from './RiverAnalysis.module.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RiverAnalysisProps {
  site: GoldSite;
  onClose: () => void;
}

interface AnalysisPoint {
  description: string;
  type: 'meander' | 'bedrock' | 'confluence' | 'slowdown' | 'fault' | 'transverse_bar' | 'pothole' | 'erosion' | 'paleochannel' | 'fracture';
  coordinates: [number, number];
}

const RiverAnalysis: React.FC<RiverAnalysisProps> = ({ site, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<RiverAnalysisResult | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Circle[]>([]);

  useEffect(() => {
    const analyzeRiver = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer l'image satellite de la zone avec un zoom plus précis
        const satelliteImageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${site.coordinates[1]},${site.coordinates[0]},15,0/1024x1024@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`;

        // Vérifier si l'image est accessible
        const imageResponse = await fetch(satelliteImageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Erreur lors du chargement de l'image satellite: ${imageResponse.status}`);
        }

        // Analyser l'image avec GPT-4 Vision
        const analysis = await analyzeRiverForGold(satelliteImageUrl, site.river);
        if (!analysis || !analysis.points || analysis.points.length === 0) {
          throw new Error('Analyse incomplète ou invalide');
        }
        setAnalysisResults(analysis);

        // Initialiser la carte si elle n'existe pas
        if (!map && analysis.points.length > 0) {
          const newMap = L.map('analysisMap').setView(site.coordinates, 14);
          
          // Ajouter la couche satellite
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          }).addTo(newMap);

          // Ajouter la couche de rivières
          L.tileLayer.wms('https://wxs.ign.fr/hydro/geoportail/r/wms', {
            layers: 'HYDROGRAPHY.HYDROGRAPHY',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: '© IGN'
          }).addTo(newMap);

          setMap(newMap);

          // Ajouter les marqueurs pour les points d'intérêt
          const newMarkers = analysis.points.map(point => {
            const marker = L.circle(point.coordinates, {
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 0.3,
              radius: 50
            }).addTo(newMap);

            marker.bindPopup(`
              <div style="max-width: 200px;">
                <strong>${point.type}</strong>
                <p>${point.description}</p>
              </div>
            `);

            return marker;
          });

          setMarkers(newMarkers);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'analyse';
        console.error('Erreur détaillée:', err);
        setError(`Erreur: ${errorMessage}. Veuillez réessayer.`);
      } finally {
        setLoading(false);
      }
    };

    analyzeRiver();
  }, [site]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.header}>
          <h2>Analyse détaillée : {site.river}</h2>
          <div className={styles.distance}>{site.distance} de votre position</div>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Analyse de la rivière en cours...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {!loading && !error && analysisResults && (
            <>
              <div id="analysisMap" className={styles.mapContainer}></div>

              <div className={styles.analysisSection}>
                <div className={styles.geologicalContext}>
                  <h3>Contexte géologique</h3>
                  <p>{site.geology}</p>
                </div>

                <div className={styles.riverAnalysis}>
                  <h3>Analyse de la rivière</h3>
                <div className={styles.analysisText}>
                    {analysisResults.description}
                </div>
                </div>

                <div className={styles.prospectingTips}>
                  <h3>Conseils pour la prospection</h3>
                  <ul>
                    <li>Examinez attentivement les virages serrés de la rivière où l'or peut s'accumuler</li>
                    <li>Recherchez les zones de bedrock apparent qui peuvent piéger l'or</li>
                    <li>Concentrez-vous sur les zones où le courant ralentit</li>
                    <li>Vérifiez les confluences avec d'autres cours d'eau</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiverAnalysis;
