import React, { useState, useRef } from 'react';
import { searchGoldLocations, GoldSearchResult } from '../services/openai/search/goldLocations';
import { fetchCitySuggestions } from '../services/cityAutocomplete';
import styles from './SearchForm.module.css';

interface SearchFormProps {
  onSearch: (location: string, radius: number) => void;
  isLoading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(50); // Valeur par défaut: 50 km
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.length >= 2) {
      debounceTimer.current = setTimeout(async () => {
        const cities = await fetchCitySuggestions(value);
        setSuggestions(cities);
        setShowSuggestions(true);
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadius(parseInt(e.target.value));
  };

  const handleSuggestionClick = (city: string) => {
    setLocation(city);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    setShowSuggestions(false);
    onSearch(location, radius);
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" style={{ position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', position: 'relative' }}>
        <input
          type="text"
          value={location}
          onChange={handleInputChange}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setTimeout(() => setInputFocused(false), 200)}
          placeholder="Entrez le nom d'une ville"
          disabled={isLoading}
          autoComplete="off"
        />
        {showSuggestions && inputFocused && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              background: '#222',
              color: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 10,
              maxHeight: 200,
              overflowY: 'auto'
            }}
          >
            {suggestions.map((city, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.7rem 1rem',
                  cursor: 'pointer',
                  borderBottom: idx < suggestions.length - 1 ? '1px solid #333' : 'none'
                }}
                onMouseDown={() => handleSuggestionClick(city)}
              >
                {city}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: 400, 
        margin: '1rem auto', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          marginBottom: '0.5rem',
          color: '#fff'
        }}>
          <span>Rayon de recherche: {radius} km</span>
        </div>
        <input
          type="range"
          min="0"
          max="300"
          step="10"
          value={radius}
          onChange={handleRadiusChange}
          style={{ width: '100%' }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <span>0 km</span>
          <span>150 km</span>
          <span>300 km</span>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading || !location.trim()}
        className={isLoading ? styles.loadingButton : styles.searchButton}
      >
        {isLoading ? (
          <>
            <div className={styles.shimmer} />
            <span className={styles.buttonText}>Recherche en cours...</span>
          </>
        ) : (
          'Rechercher'
        )}
      </button>
    </form>
  );
};

export default SearchForm;
