import { openai } from '../client';
import { GoldLineAnalysisResult } from '../types';

export const analyzeGoldLine = async (imageBase64: string): Promise<GoldLineAnalysisResult> => {
  try {
    // Première étape : Analyser l'image avec GPT-4 pour obtenir une description
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Expert en prospection aurifère, spécialisé dans l'identification de la "gold line" dans les rivières. Analysez cette image et décrivez UNIQUEMENT où tracer une ligne d'or, sans donner d'instructions étape par étape. Concentrez-vous sur la description exacte du tracé en une seule phrase concise.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Où devrait passer la gold line sur cette photo ? Donnez une description précise et concise du tracé."
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            }
          ]
        }
      ],
      max_tokens: 100
    });

    const description = visionResponse.choices[0].message.content || "";

    // Deuxième étape : Utiliser DALL-E 3 pour générer une nouvelle image
    const generateResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Recréez cette photo de rivière exactement comme elle est, avec les mêmes roches, la même eau, les mêmes arbres et le même angle. Ajoutez une ligne jaune (couleur #FFD700) qui suit ce tracé : ${description}. La ligne doit avoir une épaisseur de 5 pixels et une légère lueur. IMPORTANT : L'image doit être une copie EXACTE de l'originale, seule la ligne jaune doit être ajoutée.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural"
    });

    return {
      description: "Ligne d'or tracée selon le flux naturel de la rivière",
      modifiedImage: generateResponse.data[0].url || "",
      confidence: 0.9
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la gold line:', error);
    throw error;
  }
};
