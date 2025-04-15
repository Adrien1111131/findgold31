import React from 'react';
import styles from './Tutorials.module.css';

const Tutorials: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Articles et tutoriels</h1>
      <div className={styles.content}>
        <p>Cette section est en cours de développement.</p>
      </div>
    </div>
  );
};

export default Tutorials;
