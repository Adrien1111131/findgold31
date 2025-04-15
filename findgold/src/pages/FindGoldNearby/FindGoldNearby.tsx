import React, { useState, useEffect, useRef } from 'react';
import Map from '../../features/map/components/Map';
import { searchGoldLocations, getCitySuggestions, CityLocation, GoldSite, SearchOptions } from '../../services/openai';
import RiverAnalysis from '../../components/RiverAnalysis/RiverAnalysis';
import styles from './FindGoldNearby.module.css';

interface SearchResult {
  location: string;
  sites: GoldSite[];
}

export const FindGoldNearby = () => {
  const [location, setLocation] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [suggestions, setSuggestions] = useState<CityLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSite, setSelectedSite] = useState<GoldSite | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<CityLocation | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(200);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleMarkerClick = (site: GoldSite) => {
    setSelectedSite(site);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.length >= 3) {
      const citySuggestions = await getCitySuggestions(value);
      setSuggestions(citySuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: CityLocation) => {
    setLocation(suggestion.name);
    setSelectedLocation(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedLocation) {
      setIsSearching(true);
      setError(null);
      try {
        const searchOptions: SearchOptions = {
          radius: searchRadius,
          sortBy: sortBy
        };
        
        const goldSites = await searchGoldLocations(selectedLocation.fullName, {
          ...searchOptions,
          page: currentPage,
          perPage: 1
        });
        
        if (goldSites && goldSites.length > 0) {
          // Trier les résultats selon l'option choisie
          const sortedSites = [...goldSites].sort((a, b) => {
            if (sortBy === 'distance') {
              const distA = parseInt(a.distance.replace(/[^0-9]/g, '')) || 0;
              const distB = parseInt(b.distance.replace(/[^0-9]/g, '')) || 0;
              return distA - distB;
            } else {
              return b.rating - a.rating;
            }
          });

          setTotalResults(sortedSites.length);
          setSearchResult({
            location: selectedLocation.fullName,
            sites: sortedSites.slice(currentPage, currentPage + 1)
          });
        } else {
          setError("Aucune rivière aurifère n'a été trouvée dans cette zone.");
          setSearchResult(null);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setError("Une erreur s'est produite lors de la recherche. Veuillez réessayer.");
        setSearchResult(null);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const renderRating = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <h1 className={styles.title}>Trouve de l'or proche de chez toi</h1>
        
        <form onSubmit={handleSubmit} className={styles.locationForm}>
          <div className={styles.searchControls}>
            <div className={styles.searchInputContainer} ref={suggestionsRef}>
              <input
                type="text"
                value={location}
                onChange={handleInputChange}
                placeholder="Entrer le nom de votre ville"
                className={styles.input}
                disabled={isSearching}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={styles.suggestionItem}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <div className={styles.suggestionName}>{suggestion.name}</div>
                      <div className={styles.suggestionRegion}>{suggestion.region}</div>
                      <div className={styles.suggestionDistance}>
                        Rechercher les rivières aurifères autour de cette ville
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <select
              className={styles.radiusSelect}
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              disabled={isSearching}
            >
              <option value="50">50 km</option>
              <option value="100">100 km</option>
              <option value="150">150 km</option>
              <option value="200">200 km</option>
              <option value="250">250 km</option>
              <option value="300">300 km</option>
            </select>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
              disabled={isSearching}
            >
              <option value="distance">Trier par distance</option>
              <option value="rating">Trier par note</option>
            </select>
          </div>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSearching || !selectedLocation}
          >
            {isSearching ? 'Analyse en cours...' : 'Rechercher'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
      </div>

      {searchResult && (
        <div className={styles.resultsContainer}>
          <div className={styles.mapSection}>
            <Map 
              center={searchResult.sites[0].coordinates}
              sites={searchResult.sites}
              onMarkerClick={handleMarkerClick}
            />
          </div>
          
          <div className={styles.sitesInfo}>
            <h2>Rivières aurifères trouvées</h2>
            {searchResult.sites.some(site => {
              const distance = parseInt(site.distance.replace(/[^0-9]/g, '')) || 0;
              return distance > 50;
            }) && (
              <div className={styles.infoMessage}>
                Certaines rivières sont éloignées mais présentent un excellent potentiel aurifère.
              </div>
            )}
            <div className={styles.navigationControls}>
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(0, prev - 1));
                  handleSubmit(new Event('submit') as any);
                }}
                disabled={currentPage === 0 || isSearching}
                className={styles.navButton}
              >
                Cours d'eau précédent
              </button>
              <span className={styles.pageInfo}>
                {currentPage + 1} / {totalResults}
              </span>
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalResults - 1, prev + 1));
                  handleSubmit(new Event('submit') as any);
                }}
                disabled={currentPage >= totalResults - 1 || isSearching}
                className={styles.navButton}
              >
                Cours d'eau suivant
              </button>
            </div>
            <div className={styles.sitesList}>
              {searchResult.sites.map((site, index) => {
                const distance = parseInt(site.distance.replace(/[^0-9]/g, '')) || 0;
                const distanceClass = distance <= 50 ? 'nearby' : distance <= 100 ? 'medium' : 'far';
                
                return (
                  <div key={index} className={styles.siteCard}>
                    <div className={styles.siteHeader}>
                      <div className={styles.siteHeaderMain}>
                        <h3>{site.river} <span className={styles.waterType} data-type={site.type}>{site.type}</span></h3>
                        <div className={styles.rating}>{renderRating(site.rating)}</div>
                      </div>
                      <div 
                        className={styles.distanceBadge}
                        data-distance={distanceClass}
                      >
                        {site.distance}
                      </div>
                    </div>
                    <p>{site.description}</p>
                    <div className={styles.geologySection}>
                      <h4>Géologie (BRGM/InfoTerre):</h4>
                      <p>{site.geology}</p>
                    </div>
                    <div className={styles.ratingDetails}>
                      <h4>Détails de la notation :</h4>
                      <ul>
                        <li>Score géologique : {renderRating(site.ratingDetails.geologicalScore)}</li>
                        <li>Accessibilité : {renderRating(site.ratingDetails.accessibility)}</li>
                        <li>Historique : {site.ratingDetails.historicalData}</li>
                        {site.ratingDetails.forumMentions.length > 0 && (
                          <li>
                            Mentions sur les forums :
                            <ul>
                              {site.ratingDetails.forumMentions.map((mention, idx) => (
                                <li key={idx}>{mention}</li>
                              ))}
                            </ul>
                          </li>
                        )}
                      </ul>
                    </div>
                    <p className={styles.coordinates}>
                      Coordonnées: {site.coordinates[0].toFixed(6)}, {site.coordinates[1].toFixed(6)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedSite && (
        <RiverAnalysis
          site={selectedSite}
          onClose={() => setSelectedSite(null)}
        />
      )}
    </div>
  );
};

export default FindGoldNearby;
