import React, { useState, useEffect } from 'react';
import GoldLineAnalysis from '../../components/GoldLineAnalysis/GoldLineAnalysis';
import RockAnalysis from '../../components/RockAnalysis/RockAnalysis';
import { analyzeGoldLine, analyzeRocks } from '../../services/openai';
import styles from './EnvironmentAnalysis.module.css';

type AnalysisTab = 'goldline' | 'rocks';

const EnvironmentAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('goldline');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    description: string;
    modifiedImage?: string;
  } | null>(null);

  const handleImageUpload = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      if (activeTab === 'goldline') {
        const result = await analyzeGoldLine(imageBase64);
        setAnalysisResult({
          description: result.description,
          modifiedImage: result.modifiedImage
        });
      } else {
        const result = await analyzeRocks(imageBase64);
        setAnalysisResult({
          description: `Potentiel aurifère global : ${result.overallPotential * 100}%\n\n` +
            result.rockTypes.map(rock => 
              `${rock.name}: ${rock.description} (Potentiel: ${rock.goldPotential * 100}%)`
            ).join('\n\n') + '\n\n' +
            'Recommandations:\n' + result.recommendations.join('\n')
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    console.log('EnvironmentAnalysis mounted');
    console.log('Active tab:', activeTab);
  }, []);

  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  return (
    <div className={styles.container}>
      <h1>Analyse ton spot</h1>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'goldline' ? styles.active : ''}`}
          onClick={() => setActiveTab('goldline')}
        >
          Trouve la Gold Line
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'rocks' ? styles.active : ''}`}
          onClick={() => setActiveTab('rocks')}
        >
          Analyse les roches
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'goldline' ? (
          <GoldLineAnalysis onImageUpload={handleImageUpload} />
        ) : (
          <RockAnalysis onImageUpload={handleImageUpload} />
        )}

        {isAnalyzing && (
          <div className={styles.analyzing}>
            Analyse en cours...
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <div className={styles.result}>
            <div className={styles.description}>
              {analysisResult.description}
            </div>
            {analysisResult.modifiedImage && (
              <div className={styles.imageResult}>
                <h3>Gold Line identifiée :</h3>
                <img 
                  src={analysisResult.modifiedImage} 
                  alt="Image avec gold line" 
                  className={styles.resultImage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentAnalysis;
