import React, { useState } from 'react';

interface MapModalProps {
  coordinates: [number, number];
  riverName: string;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ coordinates, riverName, onClose }) => {
  const [lat, lng] = coordinates;
  const [showGuide, setShowGuide] = useState(true);
  
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=14`;
  
  const openInGoogleMaps = () => {
    window.open(googleMapsUrl, '_blank');
  };

  const toggleGuide = () => {
    setShowGuide(!showGuide);
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
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#111',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
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
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          ✕
        </button>

        <h3 style={{ color: '#ffd700', marginBottom: '1rem' }}>
          Localisation: {riverName}
        </h3>
        
        <div style={{
          width: '100%',
          height: '400px',
          position: 'relative',
          marginBottom: '1rem',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <iframe 
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=14&maptype=satellite`}
            style={{
              border: 'none',
              width: '100%',
              height: '100%'
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        
        <button
          onClick={openInGoogleMaps}
          style={{
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: '1rem'
          }}
        >
          <span style={{ marginRight: '0.5rem' }}>🔍</span>
          Ouvrir dans Google Maps
        </button>
        
        {showGuide ? (
          <div style={{
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '0.5rem',
            position: 'relative'
          }}>
            <button 
              onClick={toggleGuide}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Fermer le guide"
            >
              ✕
            </button>
            <h4 style={{ color: '#ffd700', marginTop: 0, marginBottom: '0.5rem' }}>
              Guide de prospection
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0', lineHeight: '1.5' }}>
              Sur Google Maps, recherchez ces éléments favorables à l'or :
            </p>
            <ul style={{ color: 'rgba(255, 255, 255, 0.9)', paddingLeft: '1.5rem' }}>
              <li>Les méandres (accumulation dans les courbes extérieures)</li>
              <li>Les zones de bedrock apparent (pièges naturels pour l'or)</li>
              <li>Les bancs de sable et placers (dépôts alluviaux)</li>
              <li>Les confluences avec d'autres cours d'eau (zones de ralentissement)</li>
              <li>Les zones de ralentissement naturel (où les particules lourdes se déposent)</li>
            </ul>
          </div>
        ) : (
          <button
            onClick={toggleGuide}
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: 'none',
              color: '#ffd700',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
            }}
          >
            Afficher le guide de prospection
          </button>
        )}
      </div>
    </div>
  );
};

export default MapModal;
