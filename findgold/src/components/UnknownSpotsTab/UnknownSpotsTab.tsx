import React from 'react';
import RiverCard from '../RiverCard';
import { GoldLocation } from '../../services/openai/search/goldLocations';
import styles from './UnknownSpotsTab.module.css';

interface UnknownSpotsTabProps {
  spots: GoldLocation[];
  onRiverDetailsClick: (river: GoldLocation) => void;
  onSearchUnknownSpots: () => void;
  isLoading: boolean;
}

const UnknownSpotsTab: React.FC<UnknownSpotsTabProps> = ({
  spots,
  onRiverDetailsClick,
  onSearchUnknownSpots,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>
          Analyse géologique approfondie en cours...
          <br />
          <small>Recherche des cours d'eau traversant des formations favorables à l'or</small>
          <br />
          <small>Analyse des cartes géologiques du BRGM</small>
        </div>
      </div>
    );
  }

  if (!spots || spots.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyMessage}>
          <h3>Analyse géologique des cours d'eau</h3>
          <p>
            Notre système analyse les cartes géologiques du BRGM pour identifier les cours d'eau qui traversent des formations 
            favorables à l'or (filons de quartz, zones de failles, roches métamorphiques), même s'ils n'ont jamais été documentés 
            pour l'orpaillage.
          </p>
          <button 
            onClick={onSearchUnknownSpots}
            className={styles.searchButton}
          >
            <span>🔍</span> Lancer l'analyse géologique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.disclaimer}>
        <div className={styles.disclaimerIcon}>ℹ️</div>
        <div className={styles.disclaimerText}>
          <strong>Analyse géologique approfondie</strong>
          Ces spots ont été identifiés par une analyse détaillée des cartes géologiques du BRGM.
          Ils traversent des formations favorables à l'or (filons de quartz, zones de failles, roches métamorphiques)
          même s'ils n'ont pas encore été documentés pour l'orpaillage.
          
          <strong>Analyse détaillée</strong>
          Les portions recommandées pour la prospection sont basées uniquement sur des critères géologiques.
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Cours d'eau avec potentiel aurifère géologique</h2>
      
      <div className={styles.spotsList}>
        {spots.map((river, index) => (
          <div key={index} className={styles.spotContainer}>
            <RiverCard 
              river={river} 
              onDetailsClick={onRiverDetailsClick}
            />
            
            {/* Affichage des formations géologiques */}
            {river.geology && (
              <div className={styles.infoBox}>
                <div className={styles.infoTitle}>
                  <span>🪨</span> Formations géologiques
                </div>
                <div className={styles.infoContent}>
                  {river.geology}
                </div>
              </div>
            )}
            
            {/* Affichage des points d'intérêt */}
            {river.hotspots && river.hotspots.length > 0 && (
              <div className={styles.infoBox}>
                <div className={styles.infoTitle}>
                  <span>📍</span> Points d'intérêt géologique
                </div>
                <div className={styles.infoContent}>
                  {river.hotspots.map((hotspot, idx) => (
                    <div key={idx} style={{marginBottom: '0.8rem'}}>
                      <div style={{fontWeight: 'bold', marginBottom: '0.3rem'}}>
                        {hotspot.location}
                      </div>
                      <div>{hotspot.description}</div>
                      <div style={{fontSize: '0.8rem', color: '#ffd700', marginTop: '0.3rem'}}>
                        Source: {hotspot.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Affichage des portions à prospecter */}
            {river.prospectionSpots && river.prospectionSpots.length > 0 && (
              <div className={styles.infoBox}>
                <div className={styles.infoTitle}>
                  <span>🎯</span> Portions recommandées pour la prospection
                </div>
                <div className={styles.infoContent}>
                  {river.prospectionSpots.map((spot, idx) => (
                    <div key={idx} style={{marginBottom: '1rem', padding: '0.5rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px'}}>
                      <div style={{marginBottom: '0.5rem'}}>
                        {spot.description}
                      </div>
                      <div className={styles.coordinates}>
                        📍 Coordonnées: {spot.coordinates[0].toFixed(4)}, {spot.coordinates[1].toFixed(4)}
                      </div>
                      <div className={styles.tagsList}>
                        {spot.geologicalFeatures.map((feature, fidx) => (
                          <span key={fidx} className={styles.tag}>{feature}</span>
                        ))}
                      </div>
                      <div style={{fontSize: '0.8rem', marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.7)'}}>
                        Accès: {spot.accessInfo}
                      </div>
                      <div style={{fontSize: '0.8rem', marginTop: '0.3rem', color: '#ffd700'}}>
                        Priorité: {spot.priority === 1 ? '⭐⭐⭐ Très prometteur' : spot.priority === 2 ? '⭐⭐ Prometteur' : '⭐ À explorer'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnknownSpotsTab;
