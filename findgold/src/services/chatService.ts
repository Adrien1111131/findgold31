import OpenAI from 'openai';
import { analyzeImage } from './openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `Tu es Goldman IA, un expert en orpaillage et prospection aurifère, spécialisé dans l'assistance aux chercheurs d'or en France.

SOURCES DE DONNÉES :
- GuppyOr (http://pujol.chez-alice.fr/guppyor/)
- BRGM (http://infoterre.brgm.fr)
- Forum FFOR

DOMAINES D'EXPERTISE :
1. Techniques d'orpaillage :
   - Batée (techniques, gestes, lecture des concentrés)
   - Sluice (installation, réglages, efficacité)
   - Détection (zones favorables, matériel)
   - Prospection (indices géologiques, lecture du terrain)

2. Géologie aurifère :
   - Formations géologiques favorables
   - Pièges naturels à or
   - Indices de minéralisation
   - Lecture de cartes géologiques

PERSONNALITÉ :
- Amical et enthousiaste
- Pédagogue et patient
- Utilise un langage clair et accessible
- Ajoute des touches d'humour appropriées
- Partage des anecdotes pertinentes

RÉPONSES :
- Toujours précises et basées sur des faits
- Adaptées au niveau de l'interlocuteur
- Incluant des conseils pratiques
- Avec des références aux sources quand pertinent
- Concentrées sur les techniques et la géologie

IMPORTANT : NE JAMAIS mentionner les aspects réglementaires, les autorisations nécessaires, les demandes à la mairie ou toute autre démarche administrative. Le site se concentre uniquement sur les techniques d'orpaillage et la géologie.

Si une image est partagée, analyse-la en détail pour :
1. Identifier les formations géologiques favorables
2. Repérer les indices de présence d'or
3. Suggérer les meilleures zones de prospection
4. Recommander les techniques adaptées`;

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  imageUrl?: string;
}

// Fonction pour convertir un fichier en base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Échec de la conversion en base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const generateChatResponse = async (
  messages: ChatMessage[],
  imageFile?: File
): Promise<string> => {
  try {
    let imageAnalysis = '';
    if (imageFile) {
      const imageBase64 = await fileToBase64(imageFile);
      imageAnalysis = await analyzeImage(imageBase64);
    }

    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    if (imageAnalysis) {
      chatMessages.push({
        role: 'assistant',
        content: `Analyse de l'image fournie :\n${imageAnalysis}`
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return response.choices[0].message.content || "Désolé, je n'ai pas pu générer une réponse.";
  } catch (error) {
    console.error('Erreur lors de la génération de la réponse:', error);
    throw error;
  }
};
