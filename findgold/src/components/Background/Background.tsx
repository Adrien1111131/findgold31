import React from 'react';
import styles from './Background.module.css';

const Background: React.FC = () => {
  return (
    <div className={styles.background}>
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className={styles.sparkleLayer}
        />
      ))}
    </div>
  );
};

export default Background;
