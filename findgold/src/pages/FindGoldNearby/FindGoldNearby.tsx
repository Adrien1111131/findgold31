import React, { useState } from 'react';
import SearchForm from '../../components/SearchForm';
import ProgressBar from '../../components/ProgressBar';
import RiverCard from '../../components/RiverCard';
import RiverDetails from '../../components/RiverDetails';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GoldLocation, GoldSearchResult, searchGoldLocations, SearchOptions } from '../../services/openai/search/goldLocations';
import { searchUnknownGoldLocations } from '../../services/openai/search/unknownGoldLocations';
import UnknownSpotsTab from '../../components/UnknownSpotsTab/UnknownSpotsTab';
import styles from './FindGoldNearby.module.css';

export const FindGoldNearby = () => {
  const [searchResult, setSearchResult] = useState<GoldSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRiver, setSelectedRiver] = useState<GoldLocation | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'secondary' | 'unknown'>('main');
  const [unknownSpots, setUnknownSpots] = useState<GoldLocation[]>([]);
  const [isSearchingUnknown, setIsSearchingUnknown] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ city: string; radius: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMainSpots, setHasMoreMainSpots] = useState(true);
  const [hasMoreSecondarySpots, setHasMoreSecondarySpots] = useState(true);

  const handleSearch = async (city: string, radius: number) => {
    setIsSearching(true);
    setError(null);
    setCurrentPage(0);
    setHasMoreMainSpots(true);
    setHasMoreSecondarySpots(true);
    
    try {
      const searchOptions: SearchOptions = {
        radius,
        page: 0,
        pageSize: 3,
        loadMainSpots: true,
        loadSecondarySpots: true
      };

      const results = await searchGoldLocations(city, searchOptions);
      setSearchResult(results);
      setActiveTab('main');
      setCurrentLocation({ city, radius });
      setHasMoreMainSpots(results.hasMoreResults);
      setHasMoreSecondarySpots(results.hasMoreResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError("Une erreur s'est produite lors de la recherche. Veuillez réessayer.");
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = async () => {
    if (!currentLocation || !searchResult) return;
    
    setIsLoadingMore(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      const searchOptions: SearchOptions = {
        radius: currentLocation.radius,
        page: nextPage,
        pageSize: 3,
        loadMainSpots: activeTab === 'main',
        loadSecondarySpots: activeTab === 'secondary'
      };

      const results = await searchGoldLocations(currentLocation.city, searchOptions);
      
      if ((activeTab === 'main' && results.mainSpots.length > 0) || 
          (activeTab === 'secondary' && results.secondarySpots.length > 0)) {
        setSearchResult({
          mainSpots: activeTab === 'main' 
            ? [...searchResult.mainSpots, ...results.mainSpots]
            : searchResult.mainSpots,
          secondarySpots: activeTab === 'secondary'
            ? [...searchResult.secondarySpots, ...results.secondarySpots]
            : searchResult.secondarySpots,
          hasMoreResults: results.hasMoreResults
        });
        
        setCurrentPage(nextPage);
        setHasMoreMainSpots(activeTab === 'main' ? results.hasMoreResults : hasMoreMainSpots);
        setHasMoreSecondarySpots(activeTab === 'secondary' ? results.hasMoreResults : hasMoreSecondarySpots);
      } else {
        if (activeTab === 'main') {
          setHasMoreMainSpots(false);
          setError("Aucun spot principal supplémentaire trouvé avec des sources vérifiables.");
        } else {
          setHasMoreSecondarySpots(false);
          setError("Aucun spot secondaire supplémentaire trouvé avec des sources vérifiables.");
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de spots supplémentaires:', error);
      setError("Une erreur s'est produite lors de la recherche de spots supplémentaires.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRiverDetailsClick = (river: GoldLocation) => {
    setSelectedRiver(river);
  };

  const handleCloseDetails = () => {
    setSelectedRiver(null);
  };

  const handleSearchUnknown = async () => {
    if (!currentLocation) {
      setError("Veuillez d'abord effectuer une recherche par ville pour définir la zone d'analyse.");
      return;
    }
    
    setIsSearchingUnknown(true);
    setError(null);
    try {
      const results = await searchUnknownGoldLocations(currentLocation.city, currentLocation.radius);
      
      if (results.unknownSpots.length === 0) {
        setError("Aucun cours d'eau potentiellement aurifère n'a été identifié dans cette zone d'après l'analyse géologique.");
      } else if (results.unknownSpots.length === 1 && 
                (results.unknownSpots[0].name === "Erreur d'analyse" || 
                 results.unknownSpots[0].name === "Erreur de connexion")) {
        setError(results.unknownSpots[0].description);
        setUnknownSpots([]);
      } else {
        setUnknownSpots(results.unknownSpots);
        setError(null);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de spots inconnus:', error);
      setError("Une erreur s'est produite lors de l'analyse géologique. Veuillez réessayer ultérieurement.");
      setUnknownSpots([]);
    } finally {
      setIsSearchingUnknown(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <h1 className={styles.title}>Trouve de l'or proche de chez toi</h1>
        <ProgressBar active={isSearching} />
        <SearchForm onSearch={handleSearch} isLoading={isSearching} />
        <LoadingSpinner 
          active={isSearching} 
          text="Recherche des cours d'eau aurifères en cours..."
        />
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
      </div>

      {searchResult && searchResult.mainSpots.length === 0 && searchResult.secondarySpots.length === 0 && activeTab !== 'unknown' && (
        <div className={styles.noResultsAction}>
          <p>Aucun spot connu trouvé dans cette zone.</p>
          <button 
            onClick={() => {
              setActiveTab('unknown');
              handleSearchUnknown();
            }}
            className={styles.unknownSearchButton}
          >
            <span>🔍</span> Chercher des spots potentiels par analyse géologique
          </button>
        </div>
      )}

      {(searchResult || unknownSpots.length > 0 || isSearchingUnknown) && (
        <div className={styles.resultsContainer}>
          <div className={styles.tabsContainer}>
            {searchResult && (
              <>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'main' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('main')}
                >
                  Spots principaux
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'secondary' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('secondary')}
                >
                  Autres cours d'eau
                </button>
              </>
            )}
            <button 
              className={`${styles.tabButton} ${activeTab === 'unknown' ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveTab('unknown');
                if (unknownSpots.length === 0 && !isSearchingUnknown) {
                  handleSearchUnknown();
                }
              }}
            >
              Spots inconnus
            </button>
          </div>

          {activeTab !== 'unknown' ? (
            <div className={styles.riversList}>
              {activeTab === 'main' ? (
                searchResult && searchResult.mainSpots.length > 0 ? (
                  <>
                    {searchResult.mainSpots.map((river, index) => (
                      <RiverCard 
                        key={`${river.name}_${index}`}
                        river={river} 
                        onDetailsClick={handleRiverDetailsClick} 
                      />
                    ))}
                    
                    {hasMoreMainSpots && (
                      <div className={styles.loadMoreContainer}>
                        <button 
                          className={styles.loadMoreButton}
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? (
                            <>
                              <span className={styles.loadingDots}></span>
                              Recherche en cours...
                            </>
                          ) : (
                            <>
                              <span>🔍</span> Voir plus de spots principaux
                            </>
                          )}
                        </button>
                        <div className={styles.loadMoreInfo}>
                          Recherche dans des forums spécialisés et publications scientifiques
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noResults}>
                    Aucun spot principal trouvé dans cette zone.
                  </div>
                )
              ) : (
                searchResult && searchResult.secondarySpots.length > 0 ? (
                  <>
                    {searchResult.secondarySpots.map((river, index) => (
                      <RiverCard 
                        key={`${river.name}_${index}`}
                        river={river} 
                        onDetailsClick={handleRiverDetailsClick} 
                      />
                    ))}
                    
                    {hasMoreSecondarySpots && (
                      <div className={styles.loadMoreContainer}>
                        <button 
                          className={styles.loadMoreButton}
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? (
                            <>
                              <span className={styles.loadingDots}></span>
                              Recherche en cours...
                            </>
                          ) : (
                            <>
                              <span>🔍</span> Voir plus de cours d'eau
                            </>
                          )}
                        </button>
                        <div className={styles.loadMoreInfo}>
                          Recherche dans des forums spécialisés et publications scientifiques
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noResults}>
                    Aucun spot secondaire trouvé dans cette zone.
                  </div>
                )
              )}
            </div>
          ) : (
            <UnknownSpotsTab
              spots={unknownSpots}
              onRiverDetailsClick={handleRiverDetailsClick}
              onSearchUnknownSpots={handleSearchUnknown}
              isLoading={isSearchingUnknown}
            />
          )}
        </div>
      )}

      {selectedRiver && (
        <RiverDetails river={selectedRiver} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

export default FindGoldNearby;
