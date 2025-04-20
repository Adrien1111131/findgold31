import React, { ReactNode } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
