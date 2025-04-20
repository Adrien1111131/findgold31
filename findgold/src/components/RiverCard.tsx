import React from 'react';
import { GoldLocation } from '../services/openai/search/goldLocations';
import styles from './RiverCard.module.css';

interface RiverCardProps {
  river: GoldLocation;
  onDetailsClick: (river: GoldLocation) => void;
}

const RiverCard: React.FC<RiverCardProps> = ({ river, onDetailsClick }) => {
  // Fonction pour afficher les étoiles de notation
  const renderRating = (rating: number) => {
    return '⭐'.repeat(Math.min(5, Math.max(1, Math.round(rating))));
  };

  return (
    <div className={styles.riverCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {river.name}
          <span className={styles.typeTag}>
            {river.type}
          </span>
        </h3>
        <div className={styles.rating}>{renderRating(river.rating)}</div>
      </div>
      
      <div>
        <p className={styles.description}>
          {river.description.length > 150 
            ? `${river.description.substring(0, 150)}...` 
            : river.description}
        </p>
        
        {/* Sources vérifiées */}
        <div className={styles.sourcesTags}>
          {river.sources.map((source, index) => (
            <div
              key={index}
              className={`${styles.sourceTag} ${source.includes('brgm') ? styles.sourceTagBrgm : ''}`}
            >
              {source.includes('brgm') ? '🔍 BRGM' : '📚 ' + (source.length > 30 ? source.substring(0, 30) + '...' : source)}
            </div>
          ))}
        </div>
      </div>
      
      {river.hotspots && river.hotspots.length > 0 && (
        <div className={styles.infoSection}>
          <div className={styles.infoTitle}>
            <span className={styles.infoIcon}>📍</span> Points d'intérêt: {river.hotspots.length}
          </div>
          <div className={styles.infoContent}>
            {river.hotspots.map(h => h.location).join(', ')}
          </div>
        </div>
      )}

      {river.prospectionSpots && river.prospectionSpots.length > 0 && (
        <div className={`${styles.infoSection} ${styles.infoSectionBordered}`}>
          <div className={styles.infoTitle}>
            <span className={styles.infoIcon}>🎯</span> Portions recommandées
          </div>
          {river.prospectionSpots.map((spot, index) => (
            <div key={index} className={styles.spotItem}>
              <div className={styles.spotHeader}>
                <div className={styles.spotPriority}>
                  {spot.priority === 1 && '⭐⭐⭐'}
                  {spot.priority === 2 && '⭐⭐'}
                  {spot.priority === 3 && '⭐'}
                  <span>Priorité {spot.priority}</span>
                </div>
                <div className={styles.spotCoordinates}>
                  {spot.coordinates[0].toFixed(4)}, {spot.coordinates[1].toFixed(4)}
                </div>
              </div>
              <div className={styles.spotDescription}>
                {spot.description}
              </div>
              <div className={styles.featureTags}>
                {spot.geologicalFeatures.map((feature, featureIndex) => (
                  <span key={featureIndex} className={styles.featureTag}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {river.goldOrigin && river.goldOrigin.brgmData && (
        <div className={`${styles.infoSection} ${styles.infoSectionBordered}`}>
          <div className={styles.infoTitle}>
            <span className={styles.infoIcon}>🔍</span> Formations géologiques (BRGM)
          </div>
          <div className={styles.infoContent}>
            {river.goldOrigin.brgmData.length > 100 
              ? `${river.goldOrigin.brgmData.substring(0, 100)}...` 
              : river.goldOrigin.brgmData}
          </div>
        </div>
      )}
      
      <div className={styles.footer}>
        <div className={styles.coordinates}>
          Coordonnées: {river.coordinates[0].toFixed(4)}, {river.coordinates[1].toFixed(4)}
        </div>
        
        <button 
          onClick={() => onDetailsClick(river)}
          className={styles.detailsButton}
        >
          En savoir plus
        </button>
      </div>
    </div>
  );
};

export default RiverCard;
