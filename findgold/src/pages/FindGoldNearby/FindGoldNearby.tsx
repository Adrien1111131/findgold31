import React, { useState } from 'react';
import SearchForm from '../../components/SearchForm';
import ProgressBar from '../../components/ProgressBar';
import RiverCard from '../../components/RiverCard';
import RiverDetails from '../../components/RiverDetails';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GoldLocation, GoldSearchResult, searchGoldLocations } from '../../services/openai/search/goldLocations';
import { searchUnknownGoldLocations } from '../../services/openai/search/unknownGoldLocations';
import { searchAdditionalGoldLocations } from '../../services/openai/search/additionalGoldLocations';
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
  
  // États pour la fonctionnalité "Voir plus"
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMainSpots, setHasMoreMainSpots] = useState(true); // On suppose qu'il y a plus de résultats par défaut
  const [hasMoreSecondarySpots, setHasMoreSecondarySpots] = useState(true);

  // Fonction pour charger plus de spots
  const handleLoadMore = async () => {
    if (!currentLocation || !searchResult) return;
    
    setIsLoadingMore(true);
    setError(null);
    
    try {
      // Récupérer les noms des spots existants
      const existingMainSpots = searchResult.mainSpots.map(spot => spot.name);
      const existingSecondarySpots = searchResult.secondarySpots.map(spot => spot.name);
      
      const additionalResults = await searchAdditionalGoldLocations(
        currentLocation.city,
        currentLocation.radius,
        existingMainSpots,
        existingSecondarySpots
      );
      
      // Mettre à jour les résultats
      if (additionalResults.additionalMainSpots.length > 0 || additionalResults.additionalSecondarySpots.length > 0) {
        setSearchResult({
          mainSpots: [...searchResult.mainSpots, ...additionalResults.additionalMainSpots],
          secondarySpots: [...searchResult.secondarySpots, ...additionalResults.additionalSecondarySpots]
        });
        
        // Mettre à jour les indicateurs de résultats supplémentaires
        setHasMoreMainSpots(additionalResults.hasMoreResults && additionalResults.additionalMainSpots.length > 0);
        setHasMoreSecondarySpots(additionalResults.hasMoreResults && additionalResults.additionalSecondarySpots.length > 0);
      } else {
        setHasMoreMainSpots(false);
        setHasMoreSecondarySpots(false);
        
        if (activeTab === 'main') {
          setError("Aucun spot principal supplémentaire trouvé avec des sources vérifiables.");
        } else {
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

  const handleSearch = async (city: string, radius: number) => {
    setIsSearching(true);
    setError(null);
    setHasMoreMainSpots(true); // On suppose qu'il y a plus de résultats jusqu'à preuve du contraire
    setHasMoreSecondarySpots(true);
    
    try {
      const results = await searchGoldLocations(city, radius);
      setSearchResult(results);
      setActiveTab('main');
      setCurrentLocation({ city, radius });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError("Une erreur s'est produite lors de la recherche. Veuillez réessayer.");
      setSearchResult(null);
    } finally {
      setIsSearching(false);
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
        // Afficher le message d'erreur spécifique
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

      {/* Bouton "Trouver des spots inconnus" quand aucun résultat */}
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

      {/* Conteneur des résultats avec les onglets */}
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
                        key={index} 
                        river={river} 
                        onDetailsClick={handleRiverDetailsClick} 
                      />
                    ))}
                    
                    {/* Bouton "Voir plus" pour les spots principaux */}
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
                        key={index} 
                        river={river} 
                        onDetailsClick={handleRiverDetailsClick} 
                      />
                    ))}
                    
                    {/* Bouton "Voir plus" pour les spots secondaires */}
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
