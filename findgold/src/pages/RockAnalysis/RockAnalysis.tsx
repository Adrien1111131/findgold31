import React from 'react';
import RockAnalysisComponent from '../../components/RockAnalysis/RockAnalysis';
import { analyzeRocks } from '../../services/openai';
import styles from './RockAnalysis.module.css';

const RockAnalysisPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleImageUpload = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeRocks(imageBase64);
      // TODO: Afficher le résultat de l'analyse des roches
      console.log('Résultat de l\'analyse des roches:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Analyse les roches</h1>
      <p className={styles.description}>
        Identifiez les types de roches présentes et évaluez leur potentiel aurifère.
      </p>

      <RockAnalysisComponent onImageUpload={handleImageUpload} />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
};

export default RockAnalysisPage;
