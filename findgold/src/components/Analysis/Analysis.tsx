import React, { useState } from 'react';
import { analyzeImage, analyzeGeologicalData, combineAnalysis } from '../../services/openai';
import styles from './Analysis.module.css';

interface AnalysisProps {
  location: string;
  imageUrl?: string;
}

interface AnalysisResults {
  imageAnalysis?: string;
  geologicalAnalysis?: string;
  combinedAnalysis?: string;
}

const Analysis: React.FC<AnalysisProps> = ({ location, imageUrl }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults>({});
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Analyse de l'image si disponible
      const imageAnalysisResult = imageUrl ? await analyzeImage(imageUrl) : '';

      // Analyse des données géologiques
      const geologicalAnalysisResult = await analyzeGeologicalData(location);

      // Combinaison des analyses
      const combinedResult = await combineAnalysis(imageAnalysisResult, geologicalAnalysisResult);

      setResults({
        imageAnalysis: imageAnalysisResult || undefined,
        geologicalAnalysis: geologicalAnalysisResult || undefined,
        combinedAnalysis: combinedResult || undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.analyzeButton}
        onClick={handleAnalysis}
        disabled={loading}
      >
        {loading ? 'Analyse en cours...' : 'Analyser la zone'}
      </button>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {results.combinedAnalysis && (
        <div className={styles.results}>
          <h3>Résultats de l'analyse</h3>
          <div className={styles.analysisText}>
            {results.combinedAnalysis}
          </div>
          
          <div className={styles.detailedResults}>
            {results.imageAnalysis && (
              <div className={styles.section}>
                <h4>Analyse de l'image satellite</h4>
                <p>{results.imageAnalysis}</p>
              </div>
            )}
            
            {results.geologicalAnalysis && (
              <div className={styles.section}>
                <h4>Analyse géologique</h4>
                <p>{results.geologicalAnalysis}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
