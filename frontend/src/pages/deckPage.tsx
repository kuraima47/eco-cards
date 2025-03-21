import { useEffect, useMemo, useState } from 'react';
import { CategoryView } from '../components/DeckPages/CategoryView';
import { DeckListView } from '../components/DeckPages/DeckListView';
import { DeckView } from '../components/DeckPages/DeckView';
import { SearchBar } from '../components/DeckPages/SearchBar';
import { Sidebar } from '../components/DeckPages/Sidebar';
import { useAdmin } from '../hooks/useAdmin.ts';

function DeckPage() {
    const admin = useAdmin();
    const [selectedCategory, setSelectedCategory] = useState < number | undefined > (undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [forceUpdateValue, setForceUpdate] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const refreshUI = () => {
        setRefreshTrigger(prev => prev + 1);
        setForceUpdate(prev => prev + 1);
    };

    const handleSelectDeck = (deckId: number) => {
        setIsInitialLoad(false);
        try {
            if (deckId === -1) {
                admin.setSelectedDeck(null);
            } else {
                admin.setSelectedDeck(String(deckId));
            }
            setSelectedCategory(undefined);
            // Forcer le re-render
            setForceUpdate(prev => prev + 1);
        } catch (error) {
            console.error('[DeckPage] Error in handleSelectDeck:', error);
        }
    };

    // Sélection d'une catégorie dans un deck donné
    const handleSelectCategory = (deckId: number, categoryId: number) => {
        setIsInitialLoad(false);
        try {
            admin.setSelectedDeck(String(deckId));
            setSelectedCategory(categoryId);
            setForceUpdate(prev => prev + 1);
        } catch (error) {
            console.error('[DeckPage] Error in handleSelectCategory:', error);
        }
    };

    const handleCreateDeck = () => {
        setIsInitialLoad(false);
    };

    const handleCreateCategory = () => {
        setIsInitialLoad(false);
    };

    const handleCreateCard = () => {
        setIsInitialLoad(false);
    };

    const handleBackNavigation = () => {
        setIsInitialLoad(false);
        if (selectedCategory) {
            setSelectedCategory(undefined);
        } else if (admin.selectedDeck) {
            admin.setSelectedDeck(null);
        }
        setForceUpdate(prev => prev + 1);
    };

    const showBackButton = !isInitialLoad && admin.selectedDeck;

    useEffect(() => {
        const loadData = async () => {
            await admin.loadAllData();
        };
        loadData();
    }, [admin, refreshTrigger]);

    // Filtrage des decks en fonction de la recherche
    const filteredDecks = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const result = admin.decks
            .map(deck => {
                // Filtrer les catégories appartenant au deck
                const deckCategories = admin.categories.filter(cat => {
                    return cat.deckId === deck.deckId;
                });
                // Pour chaque catégorie, filtrer les cartes correspondantes
                const deckCategoriesWithCards = deckCategories.map(category => {
                    const categoryCards = admin.cards
                        .filter(card => {
                            return card.cardCategoryId === category.categoryId;
                        })
                        .filter(card => {
                            const query = searchQuery.toLowerCase();
                            const nameMatch = card.cardName.toLowerCase().includes(query);

                            const actualMatch = Array.isArray(card.cardActual)
                                ? card.cardActual.some(text => text.toLowerCase().includes(query))
                                : false;

                            return nameMatch || actualMatch;
                        });
                    return {
                        ...category,
                        cards: categoryCards
                    };
                }).filter(category => {
                    const isMatch = category.categoryName.toLowerCase().includes(query) ||
                        (category.cards && category.cards.length > 0);
                    return isMatch;
                });
                return { ...deck, categories: deckCategoriesWithCards };
            })
            .filter(deck => {
                const isDeckMatch = deck.deckName.toLowerCase().includes(query) ||
                    (deck.categories && deck.categories.length > 0);
                return isDeckMatch;
            });
        return result;
    }, [searchQuery, admin.decks, admin.categories, admin.cards, forceUpdateValue]);

    // Recherche du deck et de la catégorie actuellement sélectionnés
    const currentDeck = filteredDecks.find(deck => deck.deckId === Number(admin.selectedDeck));
    const currentCategory = currentDeck?.categories?.find(cat => cat.categoryId == selectedCategory);

    if (admin.loading) {
        return <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>;
    }

    return (
        <div className="flex h-screen rounded-md">
            <Sidebar
                decks={filteredDecks}
                selectedDeck={admin.selectedDeck ? Number(admin.selectedDeck) : undefined}
                selectedCategory={selectedCategory}
                onSelectDeck={handleSelectDeck}
                onSelectCategory={handleSelectCategory}
            />
            <main className="flex-1 overflow-y-auto flex flex-col">
                <div className="sticky top-0 border-b border-gray-200 z-1 flex items-center">
                    <div style={{ visibility: showBackButton ? 'visible' : 'hidden' }}>
                    <button
                        onClick={handleBackNavigation}
                        className="p-2 mx-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                        aria-label="Go back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    </div>
                    <div className="flex-1">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            debounceTime={300}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    {admin.selectedDeck && !selectedCategory && currentDeck && (
                        <DeckView
                            deck={currentDeck}
                            onSelectCategory={(categoryId: number) => {
                                handleSelectCategory(currentDeck.deckId, categoryId);
                            }}
                            onCreateCategory={handleCreateCategory}
                            refreshParent={refreshUI}
                        />
                    )}
                    {selectedCategory && currentCategory && (
                        <CategoryView
                            category={currentCategory}
                            onCreateCard={handleCreateCard}
                            refreshParent={refreshUI}
                        />
                    )}
                    {!admin.selectedDeck && (
                        <DeckListView
                            decks={filteredDecks}
                            onSelectDeck={(deckId) => {
                                handleSelectDeck(deckId);
                            }}
                            onCreateDeck={handleCreateDeck}
                            refreshParent={refreshUI}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default DeckPage;