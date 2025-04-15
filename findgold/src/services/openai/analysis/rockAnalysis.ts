import { openai } from '../client';
import { RockAnalysisResult } from '../types';

export const analyzeRocks = async (imageUrl: string): Promise<RockAnalysisResult> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Expert géologue spécialisé dans l'identification des roches favorables à l'or.

TYPES DE ROCHES À IDENTIFIER :

1. ROCHES PRIMAIRES
- Quartz (veines hydrothermales)
- Schistes aurifères
- Granite altéré
- Roches métamorphiques
- Conglomérats

2. INDICATEURS DE POTENTIEL
- Altérations hydrothermales
- Minéralisations visibles
- Structures géologiques favorables

Retournez l'analyse au format JSON avec :
- Types de roches identifiés
- Potentiel aurifère de chaque type
- Localisation sur l'image
- Recommandations pour la prospection`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analysez les roches présentes sur cette image et évaluez leur potentiel aurifère."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Vérifier et fournir des valeurs par défaut si nécessaire
    return {
      rockTypes: result.rockTypes || [],
      overallPotential: result.overallPotential || 0,
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse des roches:', error);
    // En cas d'erreur, retourner un résultat par défaut
    return {
      rockTypes: [{
        name: "Indéterminé",
        description: "Impossible d'analyser les roches sur l'image",
        goldPotential: 0,
        location: [0, 0]
      }],
      overallPotential: 0,
      recommendations: [
        "Prenez une nouvelle photo avec un meilleur éclairage",
        "Assurez-vous que les roches sont bien visibles",
        "Incluez un objet pour l'échelle"
      ]
    };
  }
};
