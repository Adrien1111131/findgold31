import React, { useState, useRef, useEffect } from 'react';
import styles from './GoldLineAnalysis.module.css';
import { analyzeGoldLine, GoldLinePoint } from '../../services/openai';
import LoadingSpinner from '../LoadingSpinner';

interface GoldLineAnalysisProps {
  onImageUpload: (imageBase64: string) => void;
}

const GoldLineCanvas: React.FC<{
  imageUrl: string;
  points: GoldLinePoint[];
  width: number;
  height: number;
}> = ({ imageUrl, points, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Charger l'image
    const img = new Image();
    img.onload = () => {
      // Dessiner l'image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Créer un effet de lueur pour la ligne d'or
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 10;
      
      // Dessiner la ligne d'or avec une courbe fluide
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFD700'; // Couleur or
      
      // Déplacer au premier point
      const firstPoint = points[0];
      ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
      
      // Utiliser une courbe de Bézier pour une ligne plus fluide
      if (points.length > 2) {
        for (let i = 1; i < points.length - 1; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const p2 = points[i + 1];
          
          // Calculer les points de contrôle pour la courbe
          const cp1x = (p0.x + p1.x) / 2 * canvas.width;
          const cp1y = (p0.y + p1.y) / 2 * canvas.height;
          const cp2x = (p1.x + p2.x) / 2 * canvas.width;
          const cp2y = (p1.y + p2.y) / 2 * canvas.height;
          
          // Tracer une courbe quadratique
          ctx.quadraticCurveTo(
            p1.x * canvas.width, 
            p1.y * canvas.height,
            cp2x, 
            cp2y
          );
        }
        
        // Connecter au dernier point
        const lastPoint = points[points.length - 1];
        ctx.lineTo(lastPoint.x * canvas.width, lastPoint.y * canvas.height);
      } else {
        // Si nous avons seulement 2 points, tracer une ligne droite
        for (let i = 1; i < points.length; i++) {
          const point = points[i];
          ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
      }
      
      // Tracer la ligne principale
      ctx.stroke();
      
      // Ajouter des points de repère aux endroits clés
      points.forEach((point, index) => {
        if (index % 3 === 0 || index === 0 || index === points.length - 1) {
          ctx.beginPath();
          ctx.arc(
            point.x * canvas.width, 
            point.y * canvas.height, 
            4, 0, Math.PI * 2
          );
          ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
          ctx.fill();
        }
      });
    };
    img.src = imageUrl;
  }, [imageUrl, points]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className={styles.canvas}
    />
  );
};

const GoldLineAnalysis: React.FC<GoldLineAnalysisProps> = ({ onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    description: string;
    points: GoldLinePoint[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 600, height: 400 });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setSelectedImage(base64Image);
        setAnalysisResult(null); // Réinitialiser les résultats précédents
        onImageUpload(base64Image);
        
        // Obtenir les dimensions de l'image
        const img = new Image();
        img.onload = () => {
          // Limiter la taille maximale pour l'affichage
          const maxWidth = 800;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          setImageSize({ width, height });
        };
        img.src = base64Image;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeGoldLine(selectedImage);
      setAnalysisResult({
        description: result.description,
        points: result.points || []
      });
    } catch (err) {
      console.error('Erreur lors de l\'analyse:', err);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Trouve la Gold Line</h2>
      <p>Analysez votre photo pour identifier la ligne d'or en fonction des caractéristiques de la rivière.</p>
      
      <div className={styles.uploadSection}>
        <label htmlFor="imageUpload" className={styles.uploadLabel}>
          <div className={styles.uploadBox}>
            {selectedImage ? (
              <img src={selectedImage} alt="Selected" className={styles.preview} />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.uploadIcon}>
                  <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                  <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <span>Cliquez ou déposez une photo de rivière ici</span>
              </>
            )}
          </div>
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.hiddenInput}
        />
      </div>

      {selectedImage && !isAnalyzing && !analysisResult && (
        <button
          className={styles.analyzeButton}
          onClick={handleAnalyze}
        >
          Analyser la Gold Line
        </button>
      )}

      {isAnalyzing && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner active={true} text="Analyse en cours... L'IA identifie la gold line sur votre image" />
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {analysisResult && (
        <div className={styles.resultContainer}>
          <h3>Résultat de l'analyse</h3>
          
          <div className={styles.imagesContainer}>
            <div className={styles.imageColumn}>
              <h4>Gold Line identifiée</h4>
              {selectedImage && analysisResult.points.length > 0 ? (
                <GoldLineCanvas 
                  imageUrl={selectedImage}
                  points={analysisResult.points}
                  width={imageSize.width}
                  height={imageSize.height}
                />
              ) : (
                <img 
                  src={selectedImage || ''} 
                  alt="Image originale" 
                  className={styles.resultImage} 
                />
              )}
            </div>
          </div>
          
          <div className={styles.descriptionResult}>
            <h4>Analyse détaillée de la Gold Line</h4>
            <div className={styles.description}>
              {analysisResult.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button
              className={styles.newAnalysisButton}
              onClick={() => {
                setSelectedImage(null);
                setAnalysisResult(null);
              }}
            >
              Analyser une nouvelle image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoldLineAnalysis;
