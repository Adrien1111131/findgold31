import React from 'react';
import styles from './Assistant.module.css';
import ChatContainer from '../../components/Chat/ChatContainer';

const Assistant: React.FC = () => {
  return (
    <div className={styles.container}>
      <ChatContainer />
    </div>
  );
};

export default Assistant;
