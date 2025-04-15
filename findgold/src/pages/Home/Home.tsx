import React from 'react';
import NuggetGrid from '../../components/NuggetGrid/NuggetGrid';
import styles from './Home.module.css';

const Home: React.FC = () => {
  return (
    <main className={styles.container}>
      <NuggetGrid />
    </main>
  );
};

export default Home;
