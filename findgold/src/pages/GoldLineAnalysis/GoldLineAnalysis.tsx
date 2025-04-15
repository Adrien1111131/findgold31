import React from 'react';
import GoldLineAnalysisComponent from '../../components/GoldLineAnalysis/GoldLineAnalysis';
import { analyzeGoldLine } from '../../services/openai';
import styles from './GoldLineAnalysis.module.css';

const GoldLineAnalysisPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleImageUpload = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeGoldLine(imageBase64);
      // TODO: Afficher le résultat avec la ligne d'or tracée
      console.log('Résultat de l\'analyse de la gold line:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Trouve la Gold Line</h1>
      <p className={styles.description}>
        Analysez votre photo pour identifier la ligne d'or en fonction des grosses roches visibles.
      </p>

      <GoldLineAnalysisComponent onImageUpload={handleImageUpload} />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
};

export default GoldLineAnalysisPage;
