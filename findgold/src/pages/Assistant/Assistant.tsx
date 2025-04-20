import React, { useEffect, useState } from 'react';
import styles from './Assistant.module.css';
import ChatContainer from '../../components/Chat/ChatContainer';
import { getRiverParamsFromURL, generateInitialMessage } from '../../services/navigationService';

const Assistant: React.FC = () => {
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Récupérer les paramètres du cours d'eau depuis l'URL
    const riverParams = getRiverParamsFromURL();
    
    // Si des paramètres sont présents, générer un message initial
    if (riverParams) {
      const message = generateInitialMessage(riverParams);
      setInitialMessage(message);
    }
  }, []);

  return (
    <div className={styles.container}>
      <ChatContainer initialMessage={initialMessage} />
    </div>
  );
};

export default Assistant;
