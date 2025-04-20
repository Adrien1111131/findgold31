import React from 'react';
import { GeologyLayer } from '../services/brgmService';

interface GeologyControlsProps {
  layers: GeologyLayer[];
  onLayerToggle: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  onShowLegend: () => void;
}

const GeologyControls: React.FC<GeologyControlsProps> = ({ 
  layers, 
  onLayerToggle, 
  onOpacityChange,
  onShowLegend
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '8px',
      padding: '0.8rem',
      zIndex: 10,
      border: '1px solid rgba(255, 215, 0, 0.3)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      maxWidth: '250px'
    }}>
      <h4 style={{ 
        color: '#ffd700', 
        margin: '0 0 0.8rem 0',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        Couches géologiques (BRGM)
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {layers.map(layer => (
          <div key={layer.id} style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
              <input
                type="checkbox"
                id={`layer-${layer.id}`}
                checked={layer.visible}
                onChange={() => onLayerToggle(layer.id)}
                style={{ marginRight: '0.5rem' }}
              />
              <label 
                htmlFor={`layer-${layer.id}`} 
                style={{ 
                  color: '#fff', 
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {layer.name}
              </label>
            </div>
            
            {layer.visible && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginLeft: '1.5rem',
                marginTop: '0.2rem'
              }}>
                <span style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.8rem',
                  marginRight: '0.5rem',
                  minWidth: '60px'
                }}>
                  Opacité:
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.opacity * 100}
                  onChange={(e) => onOpacityChange(layer.id, parseInt(e.target.value) / 100)}
                  style={{ 
                    width: '100%',
                    accentColor: layer.color
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={onShowLegend}
          style={{
            background: 'rgba(255, 215, 0, 0.2)',
            border: 'none',
            color: '#ffd700',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
          }}
        >
          <span style={{ marginRight: '0.3rem' }}>🔍</span>
          Afficher la légende
        </button>
      </div>
    </div>
  );
};

export default GeologyControls;
