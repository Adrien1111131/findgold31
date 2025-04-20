import React from 'react';
import styles from './Message.module.css';
import goldmanAvatar from '../../assets/images/goldman-avatar.png';

export interface MessageData {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  imageUrl?: string;
}

interface MessageProps {
  message: MessageData;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isAssistant = message.sender === 'assistant';
  
  return (
    <div className={`${styles.messageContainer} ${isAssistant ? styles.assistant : styles.user}`}>
      {isAssistant && (
        <div className={styles.avatar}>
          <img 
            src={goldmanAvatar} 
            alt="Goldman IA" 
            className={styles.avatarImage}
          />
        </div>
      )}
      
      <div className={styles.messageContent}>
        {message.imageUrl && (
          <div className={styles.imageContainer}>
            <img src={message.imageUrl} alt="Message attachment" />
          </div>
        )}
        <div className={styles.textContent}>
          {message.content.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div className={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default Message;
