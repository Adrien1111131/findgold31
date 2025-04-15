import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ChatMessage, generateChatResponse } from '../../services/chatService';
import styles from './ChatContainer.module.css';

const WELCOME_MESSAGE: ChatMessage = {
  id: uuidv4(),
  content: `Bonjour ! Je suis Goldman IA, votre assistant spécialisé en orpaillage. 🌟

Je peux vous aider avec :
• Les techniques d'orpaillage (batée, sluice, etc.)
• L'identification des zones prometteuses
• L'analyse d'images de terrain
• La réglementation et les bonnes pratiques

N'hésitez pas à me poser vos questions ou à partager des photos de vos sites de prospection !`,
  sender: 'assistant',
  timestamp: new Date()
};

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = useCallback(async (content: string, imageFile?: File) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    if (imageFile) {
      userMessage.imageUrl = URL.createObjectURL(imageFile);
    }

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await generateChatResponse([...messages, userMessage], imageFile);
      
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "Désolé, une erreur est survenue lors de la génération de la réponse. Veuillez réessayer.",
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      if (imageFile && userMessage.imageUrl) {
        URL.revokeObjectURL(userMessage.imageUrl);
      }
    }
  }, [messages]);

  return (
    <div className={styles.container}>
      <MessageList messages={messages} loading={loading} />
      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
};

export default ChatContainer;
