import React from 'react';

interface LoadingSpinnerProps {
  active: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ active, text = "Chargement en cours..." }) => {
  if (!active) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '1.5rem 0',
      color: '#ffd700'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid rgba(255, 215, 0, 0.3)',
        borderTop: '3px solid #ffd700',
        animation: 'spin 1s linear infinite',
        marginBottom: '0.8rem'
      }} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
      <div style={{
        animation: 'pulse 1.5s infinite ease-in-out',
        fontWeight: 'bold'
      }}>
        {text}
      </div>
    </div>
  );
};

export default LoadingSpinner;
