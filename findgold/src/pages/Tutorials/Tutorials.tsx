import React from 'react';
import styles from './Tutorials.module.css';

const Tutorials: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Articles et tutoriels</h1>
      <div className={styles.content}>
        <div className={styles.resourcesContainer}>
          <div className={styles.resourceCard}>
            <h2 className={styles.resourceTitle}>Guides d'orpaillage</h2>
            <ul className={styles.resourceList}>
              <li className={styles.resourceItem}>
                <a 
                  href="https://www.orpaillage.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Guide pratique de l'orpailleur
                </a>
                <p className={styles.resourceDescription}>
                  Un guide complet sur les techniques d'orpaillage, la géologie de l'or et les meilleurs spots en France.
                </p>
              </li>
              <li className={styles.resourceItem}>
                <a 
                  href="https://www.prospection-de-loisir.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Prospection de loisir
                </a>
                <p className={styles.resourceDescription}>
                  Communauté de prospecteurs avec des guides, forums et conseils pour l'orpaillage en France.
                </p>
              </li>
              <li className={styles.resourceItem}>
                <a 
                  href="https://www.chercheur-or.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Chercheur d'or
                </a>
                <p className={styles.resourceDescription}>
                  Ressources et guides pour la prospection aurifère, techniques et matériel.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;
