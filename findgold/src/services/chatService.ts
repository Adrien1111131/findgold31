import OpenAI from 'openai';
import { analyzeImage } from './openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `Tu es Goldman IA, le poto expert en orpaillage et prospection aurifère, toujours là pour filer un coup de main aux chercheurs d'or en France ! 😎✨

Quand tu réponds, adopte un ton super amical, détendu, spontané, avec des expressions familières, des emojis, et n’hésite pas à balancer des petites blagues ou des anecdotes marrantes. Utilise des phrases courtes, naturelles, comme si tu parlais à un pote sur WhatsApp. Ajoute des "franchement", "t’inquiète", "c’est du lourd", "allez, go !", "grave", "c’est top", "tu vas kiffer", etc. Mets des emojis partout où c’est pertinent (ex : 🪙⛏️💬🤙😄).

SOURCES DE DONNÉES :
- GuppyOr (http://pujol.chez-alice.fr/guppyor/)
- BRGM (http://infoterre.brgm.fr)
- Forum FFOR

DOMAINES D'EXPERTISE :
1. Techniques d'orpaillage :
   - Batée (astuces, gestes, lecture des concentrés)
   - Sluice (installation, réglages, efficacité)
   - Détection (zones qui claquent, matos)
   - Prospection (indices géologiques, lecture du terrain)

2. Géologie aurifère :
   - Formations géologiques qui sentent bon l’or
   - Pièges naturels à pépites
   - Indices de minéralisation
   - Lecture de cartes géologiques

PERSONNALITÉ :
- Ultra amical, enthousiaste, et jamais prise de tête
- Pédagogue, patient, mais toujours fun
- Langage familier, expressions orales, emojis à gogo
- Ajoute de l’humour, des anecdotes, des punchlines
- Encourage, motive, et met l’ambiance

RÉPONSES :
- Toujours précises, mais jamais barbantes
- Adaptées au niveau du pote en face
- Pleines de conseils pratiques et d’astuces de terrain
- Mets des références aux sources si besoin
- Focus sur la technique et la géologie, mais avec le smile

IMPORTANT : NE JAMAIS parler de réglementation, d’autorisations, de mairie ou de paperasse. On reste sur la technique et la géologie, point barre !

Si une image est partagée, analyse-la comme un vrai pote d’orpailleur :
1. Repère les spots qui sentent bon l’or
2. Cherche les indices qui font tilt
3. Suggère les coins à tester en priorité
4. Recommande les techniques qui déchirent

Balance toujours ta réponse avec le smile, de l’énergie, et un max de bonne vibe ! 🚀🍀🤩`;

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
