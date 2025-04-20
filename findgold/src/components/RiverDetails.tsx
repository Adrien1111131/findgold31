import React, { useState } from 'react';
import { GoldLocation, Hotspot } from '../services/openai/search/goldLocations';
import { navigateToGoldmanIA } from '../services/navigationService';
import MapModal from './MapModal';

interface RiverDetailsProps {
  river: GoldLocation;
  onClose: () => void;
}

const RiverDetails: React.FC<RiverDetailsProps> = ({ river, onClose }) => {
  const [showMap, setShowMap] = useState(false);

  // Fonction pour afficher les étoiles de notation
  const renderRating = (rating: number) => {
    return '⭐'.repeat(Math.min(5, Math.max(1, Math.round(rating))));
  };

  const handleGoldmanIAClick = () => {
    navigateToGoldmanIA(river);
  };

  const handleMapClick = () => {
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#111',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>
            {river.name} 
            <span style={{ 
              fontSize: '1rem', 
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              color: 'white',
              verticalAlign: 'middle'
            }}>
              {river.type}
            </span>
          </h2>
          <div style={{ color: '#ffd700', marginBottom: '1rem' }}>
            Potentiel aurifère : {renderRating(river.rating)}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem' }}>
            Description
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6' }}>
            {river.description}
          </p>
        </div>

        {river.hotspots && river.hotspots.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              color: '#fff', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
              paddingBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>📍</span> Points d'intérêt
            </h3>
            <div>
              {river.hotspots.map((hotspot, index) => (
                <div 
                  key={index} 
                  style={{ 
                    backgroundColor: 'rgba(255, 215, 0, 0.1)', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                >
                  <h4 style={{ color: '#ffd700', marginTop: 0, marginBottom: '0.5rem' }}>
                    {hotspot.location}
                  </h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0' }}>
                    {hotspot.description}
                  </p>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontStyle: 'italic',
                    marginTop: '0.5rem'
                  }}>
                    Source: {hotspot.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem' }}>
            Géologie
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6' }}>
            {river.geology}
          </p>
        </div>

        {/* Section des sources vérifiées */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ 
            color: '#fff', 
            borderBottom: '1px solid rgba(255, 215, 0, 0.3)', 
            paddingBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>📚</span> Sources vérifiées
          </h3>
          <div style={{ 
            backgroundColor: 'rgba(255, 215, 0, 0.05)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {river.sources.map((source, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: source.includes('brgm') ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  borderLeft: source.includes('brgm') ? '3px solid #ffd700' : '3px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.3rem'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>
                    {source.includes('brgm') ? '🔍' : '📖'}
                  </span>
                  <span style={{
                    color: source.includes('brgm') ? '#ffd700' : 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {source.includes('brgm') ? 'BRGM' : 'Source spécialisée'}
                  </span>
                </div>
                <a 
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    wordBreak: 'break-all'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#ffd700';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  {source}
                </a>
              </div>
            ))}
          </div>
        </div>

        {river.goldOrigin && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              color: '#fff', 
              borderBottom: '1px solid rgba(255, 215, 0, 0.3)', 
              paddingBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>🔍</span> Analyse géologique
            </h3>
            <div style={{ 
              backgroundColor: 'rgba(255, 215, 0, 0.05)', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              {/* Données BRGM */}
              <div style={{
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                borderLeft: '3px solid #ffd700'
              }}>
                <h4 style={{ 
                  color: '#ffd700', 
                  marginTop: 0, 
                  marginBottom: '0.5rem', 
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>📊</span> Données BRGM
                </h4>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  margin: '0.5rem 0', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {river.goldOrigin.brgmData}
                </p>
              </div>

              {/* Origine de l'or */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ 
                  color: '#ffd700', 
                  marginTop: '1rem', 
                  marginBottom: '0.5rem', 
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>💫</span> Origine de l'or
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0', lineHeight: '1.6' }}>
                  {river.goldOrigin.description}
                </p>
              </div>
              
              {river.goldOrigin.entryPoints && river.goldOrigin.entryPoints.length > 0 && (
                <>
                  <h4 style={{ color: '#ffd700', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    Points d'entrée de l'or
                  </h4>
                  <ul style={{ color: 'rgba(255, 255, 255, 0.9)', paddingLeft: '1.5rem' }}>
                    {river.goldOrigin.entryPoints.map((point, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {river.goldOrigin.affluents && river.goldOrigin.affluents.length > 0 && (
                <>
                  <h4 style={{ color: '#ffd700', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    Affluents aurifères
                  </h4>
                  <ul style={{ color: 'rgba(255, 255, 255, 0.9)', paddingLeft: '1.5rem' }}>
                    {river.goldOrigin.affluents.map((affluent, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{affluent}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {river.referencedSpots && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              color: '#fff', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
              paddingBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>⭐</span> Spots référencés
            </h3>
            <div style={{ 
              backgroundColor: 'rgba(255, 215, 0, 0.05)', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0', lineHeight: '1.6' }}>
                {river.referencedSpots.description}
              </p>
              
              {river.referencedSpots.locations && river.referencedSpots.locations.length > 0 && (
                <>
                  <h4 style={{ color: '#ffd700', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    Emplacements connus
                  </h4>
                  <ul style={{ color: 'rgba(255, 255, 255, 0.9)', paddingLeft: '1.5rem' }}>
                    {river.referencedSpots.locations.map((location, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{location}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {river.referencedSpots.sources && river.referencedSpots.sources.length > 0 && (
                <>
                  <h4 style={{ color: '#ffd700', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    Sources
                  </h4>
                  <ul style={{ color: 'rgba(255, 255, 255, 0.7)', paddingLeft: '1.5rem', fontStyle: 'italic' }}>
                    {river.referencedSpots.sources.map((source, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{source}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem' }}>
            Historique
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6' }}>
            {river.history}
          </p>
        </div>

        {river.sources && river.sources.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem' }}>
              Sources
            </h3>
            <ul style={{ color: 'rgba(255, 255, 255, 0.7)', paddingLeft: '1.5rem' }}>
              {river.sources.map((source, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>{source}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={handleGoldmanIAClick}
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)',
              color: '#000',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>💬</span>
            Consulter Goldman IA pour des conseils
          </button>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginTop: '1rem',
            color: 'rgba(255, 255, 255, 0.5)', 
            fontSize: '0.8rem'
          }}>
            <span>Coordonnées: {river.coordinates[0].toFixed(6)}, {river.coordinates[1].toFixed(6)}</span>
            <button
              onClick={handleMapClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1a73e8',
                fontSize: '1.2rem',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Voir sur la carte"
            >
              🗺️
            </button>
          </div>
        </div>
      </div>
      
      {showMap && (
        <MapModal 
          coordinates={river.coordinates} 
          riverName={river.name} 
          onClose={handleCloseMap} 
        />
      )}
    </div>
  );
};

export default RiverDetails;
