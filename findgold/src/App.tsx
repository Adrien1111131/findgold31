import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Background from './components/Background/Background';
import Home from './pages/Home/Home';
import FindGoldNearby from './pages/FindGoldNearby/FindGoldNearby';
import EnvironmentAnalysis from './pages/EnvironmentAnalysis/EnvironmentAnalysis';
import Tutorials from './pages/Tutorials/Tutorials';
import Assistant from './pages/Assistant/Assistant';
import './App.css';

function App() {
  return (
    <div className="app">
      <Background />
      <div className="content">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find-nearby" element={<FindGoldNearby />} />
            <Route path="/analysis" element={<EnvironmentAnalysis />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/assistant" element={<Assistant />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
