import React from 'react';
import { useNavigate } from 'react-router-dom';
import GoldNugget from '../GoldNugget/GoldNugget';
import styles from './NuggetGrid.module.css';

interface NuggetData {
  id: number;
  title: string;
  route: string;
}

const nuggets: NuggetData[] = [
  {
    id: 1,
    title: "Trouve de l'or proche de\nchez toi",
    route: "/find-nearby"
  },
  {
    id: 2,
    title: "Analyse ton\nspot",
    route: "/analysis"
  },
  {
    id: 3,
    title: "Articles et\ntutoriels",
    route: "/tutorials"
  },
  {
    id: 5,
    title: "Goldman IA",
    route: "/assistant"
  }
];

const NuggetGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleNuggetClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className={styles.grid}>
      <img 
        src="https://i.postimg.cc/4y7wpFsD/Capture-d-cran-2025-04-13-214613-removebg-preview.png"
        alt=""
        className={styles.centerLogo}
      />
      {nuggets.map((nugget) => (
        <GoldNugget
          key={nugget.id}
          title={nugget.title}
          onClick={() => handleNuggetClick(nugget.route)}
        />
      ))}
    </div>
  );
};

export default NuggetGrid;
