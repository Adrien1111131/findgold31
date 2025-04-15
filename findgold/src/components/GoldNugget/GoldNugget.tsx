import React from 'react';
import styles from './GoldNugget.module.css';

interface GoldNuggetProps {
  title: string;
  onClick: () => void;
}

const GoldNugget: React.FC<GoldNuggetProps> = ({ title, onClick }) => {
  return (
    <button 
      className={styles.nugget} 
      onClick={onClick}
      type="button"
      aria-label={title}
    >
      <img 
        src="https://i.postimg.cc/Yt45xk9x/228ad530-a407-45d3-848c-b35f693829eb.png" 
        alt=""
        className={styles.nuggetImg}
        aria-hidden="true"
      />
      <span className={styles.title}>{title}</span>
    </button>
  );
};

export default GoldNugget;
