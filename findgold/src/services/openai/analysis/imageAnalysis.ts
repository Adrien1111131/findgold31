import { openai } from '../client';

// Fonction utilitaire pour valider et formater une image base64
const validateAndFormatBase64Image = (base64: string): string => {
  // Vérifier si l'image est déjà au format base64 avec en-tête
  if (base64.startsWith('data:image/')) {
    return base64;
  }

  // Vérifier si c'est une chaîne base64 valide
  try {
    atob(base64);
  } catch (e) {
    throw new Error('Format base64 invalide');
  }

  // Ajouter l'en-tête pour JPEG par défaut
  return `data:image/jpeg;base64,${base64}`;
};

export const analyzeImage = async (imageBase64: string): Promise<string> => {
  try {
    // Valider et formater l'image
    const formattedImage = validateAndFormatBase64Image(imageBase64);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Expert en géologie et prospection aurifère, spécialisé dans l'analyse de sites d'orpaillage.

ANALYSER EN DÉTAIL :
1. Géologie et minéralogie
   - Formations rocheuses visibles
   - Indices de minéralisation
   - Zones d'altération

2. Morphologie du cours d'eau
   - Méandres et courbes
   - Zones de ralentissement
   - Points de confluence
   - Barres rocheuses

3. Indices favorables
   - Dépôts alluviaux
   - Bancs de gravier
   - Marmites de géant
   - Affleurements rocheux

4. Zones prometteuses
   - Points d'accumulation naturels
   - Secteurs historiques
   - Accès et praticabilité

IMPORTANT : En cas d'erreur d'analyse d'image, fournir une réponse générique sur les indices à rechercher.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analysez cette image pour identifier les caractéristiques géologiques et géomorphologiques favorables à la présence d'or. Concentrez-vous sur les formations naturelles et les indices visibles."
            },
            {
              type: "image_url",
              image_url: {
                url: formattedImage
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.7
    });

    return response.choices[0].message.content || "Aucune analyse disponible";
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    
    // En cas d'erreur, retourner une réponse générique utile
    return `Pour analyser un site d'orpaillage, recherchez les indices suivants :

1. Géologie favorable :
   - Affleurements rocheux avec veines de quartz
   - Zones de contact entre différentes formations
   - Signes d'altération hydrothermale

2. Morphologie du cours d'eau :
   - Méandres prononcés où l'or s'accumule
   - Zones de ralentissement naturel
   - Points de confluence avec des affluents

3. Indices physiques :
   - Bancs de gravier et sable noir
   - Marmites de géant dans le lit rocheux
   - Dépôts alluviaux anciens

4. Conseils pratiques :
   - Privilégiez les zones en aval des anciennes mines
   - Examinez les berges intérieures des méandres
   - Recherchez les points bas naturels du lit

N'hésitez pas à partager une nouvelle photo pour une analyse plus précise.`;
  }
};
