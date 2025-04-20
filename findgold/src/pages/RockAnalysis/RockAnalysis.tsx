import React, { useState } from 'react';
import RockAnalysisComponent from '../../components/RockAnalysis/RockAnalysis';
import { analyzeRocks } from '../../services/openai';
import { RockAnalysisResult } from '../../services/openai/types';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './RockAnalysis.module.css';

const RockAnalysisPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RockAnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = async (imageBase64: string) => {
    setSelectedImage(imageBase64);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeRocks(imageBase64);
      setAnalysisResult(result);
      console.log('Résultat de l\'analyse des roches:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors de l\'analyse des roches:', err);
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

      {isAnalyzing && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner active={true} text="Analyse en cours... L'IA identifie les types de roches" />
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {analysisResult && (
        <div className={styles.resultContainer}>
          <h2>Types de roches favorables à l'or :</h2>
          
          <div className={styles.rockTypesContainer}>
            {analysisResult.rockTypes && analysisResult.rockTypes.length > 0 ? (
              <ul className={styles.rockTypesList}>
                {analysisResult.rockTypes.map((rock, index) => (
                  <li key={index} className={styles.rockTypeItem}>
                    <h3>{rock.name}</h3>
                    <p>{rock.description}</p>
                    <div className={styles.potentialBar}>
                      <div 
                        className={styles.potentialFill} 
                        style={{ width: `${rock.goldPotential * 100}%` }}
                      />
                      <span>Potentiel aurifère: {Math.round(rock.goldPotential * 100)}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun type de roche identifié</p>
            )}
          </div>
          
          <div className={styles.overallPotential}>
            <h3>Potentiel aurifère global</h3>
            <div className={styles.potentialBar}>
              <div 
                className={styles.potentialFill} 
                style={{ width: `${analysisResult.overallPotential * 100}%` }}
              />
              <span>{Math.round(analysisResult.overallPotential * 100)}%</span>
            </div>
          </div>
          
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div className={styles.recommendations}>
              <h3>Recommandations</h3>
              <ul>
                {analysisResult.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RockAnalysisPage;
