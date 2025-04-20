import OpenAI from 'openai';

// Vérification que la clé API est bien récupérée depuis les variables d'environnement
if (!import.meta.env.VITE_OPENAI_API_KEY) {
  console.warn('Attention: VITE_OPENAI_API_KEY n\'est pas définie dans les variables d\'environnement');
}

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Pour le développement uniquement
});
