import React from 'react';

interface ProgressBarProps {
  active: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ active }) => {
  return (
    <div style={{
      width: '100%',
      height: 6,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 4,
      overflow: 'hidden',
      margin: '1rem 0',
      opacity: active ? 1 : 0,
      transition: 'opacity 0.3s'
    }}>
      <div
        style={{
          width: active ? '100%' : '0%',
          height: '100%',
          background: 'linear-gradient(90deg, #ffd700 0%, #ffed4a 100%)',
          animation: active ? 'progressBarAnim 1.2s linear infinite' : 'none'
        }}
      />
      <style>
        {`
        @keyframes progressBarAnim {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        `}
      </style>
    </div>
  );
};

export default ProgressBar;
