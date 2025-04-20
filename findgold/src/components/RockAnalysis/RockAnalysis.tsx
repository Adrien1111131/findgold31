import React, { useState } from 'react';
import styles from './RockAnalysis.module.css';

interface RockAnalysisProps {
  onImageUpload: (imageBase64: string) => void;
}

const RockAnalysis: React.FC<RockAnalysisProps> = ({ onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setSelectedImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      setIsAnalyzing(true);
      onImageUpload(selectedImage);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Analyse les roches environnantes</h2>
      <p>Identifiez les types de roches présentes et évaluez leur potentiel aurifère.</p>
      
      <div className={styles.uploadSection}>
        <label htmlFor="rockImageUpload" className={styles.uploadLabel}>
          <div className={styles.uploadBox}>
            {selectedImage ? (
              <img src={selectedImage} alt="Selected" className={styles.preview} />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.uploadIcon}>
                  <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                  <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <span>Cliquez ou déposez une photo des roches ici</span>
              </>
            )}
          </div>
        </label>
        <input
          type="file"
          id="rockImageUpload"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.hiddenInput}
        />
      </div>

      {selectedImage && (
        <button
          className={styles.analyzeButton}
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyse en cours...' : 'Analyser les roches'}
        </button>
      )}

      <div className={styles.infoSection}>
        <h3>Types de roches favorables à l'or :</h3>
        <ul>
          <li>Quartz - Souvent associé à l'or dans les veines hydrothermales</li>
          <li>Schistes - Peuvent contenir des minéralisations aurifères</li>
          <li>Granite altéré - Zones de contact avec des minéralisations</li>
          <li>Roches métamorphiques - Potentiel pour l'or orogénique</li>
          <li>Conglomérats - Peuvent contenir des placers fossiles</li>
        </ul>
      </div>
    </div>
  );
};

export default RockAnalysis;
