import React from 'react';
import { goldGeologyLegend } from '../services/brgmService';

interface GeologyLegendProps {
  visible: boolean;
  onClose: () => void;
}

const GeologyLegend: React.FC<GeologyLegendProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      right: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '8px',
      padding: '1rem',
      maxHeight: '300px',
      overflowY: 'auto',
      zIndex: 10,
      border: '1px solid rgba(255, 215, 0, 0.3)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
    }}>
      <button 
        onClick={onClose}
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
        title="Fermer la légende"
      >
        ✕
      </button>

      <h3 style={{ 
        color: '#ffd700', 
        marginTop: 0, 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Légende géologique pour l'orpaillage
      </h3>

      {goldGeologyLegend.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ 
            color: '#fff', 
            marginTop: 0, 
            marginBottom: '0.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '0.3rem'
          }}>
            {section.title}
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: item.color,
                  marginRight: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {item.name}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ 
        fontSize: '0.8rem', 
        color: 'rgba(255, 255, 255, 0.5)', 
        textAlign: 'center',
        marginTop: '1rem',
        fontStyle: 'italic'
      }}>
        Source: BRGM (Bureau de Recherches Géologiques et Minières)
      </div>
    </div>
  );
};

export default GeologyLegend;
