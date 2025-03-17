import { useEffect, useMemo, useState } from 'react';
import { CategoryView } from '../components/DeckPages/CategoryView';
import { DeckListView } from '../components/DeckPages/DeckListView';
import { DeckView } from '../components/DeckPages/DeckView';
import { SearchBar } from '../components/DeckPages/SearchBar';
import { Sidebar } from '../components/DeckPages/Sidebar';
import { useAdmin } from '../hooks/useAdmin.ts';

function DeckPage() {
    const admin = useAdmin();
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [forceUpdateValue, setForceUpdate] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const refreshUI = () => {
        console.log('[DeckPage] refreshUI called');
        setRefreshTrigger(prev => prev + 1);
        setForceUpdate(prev => prev + 1);
    };

    const handleSelectDeck = (deckId: number) => {
        console.log('[DeckPage] handleSelectDeck called with deckId:', deckId);
        setIsInitialLoad(false);
        try {
            if (deckId === -1) {
                admin.setSelectedDeck(undefined);
                console.log('[DeckPage] selectedDeck reset to undefined');
            } else {
                admin.setSelectedDeck(String(deckId));
                console.log('[DeckPage] setSelectedDeck done, new value:', String(deckId));
            }
            setSelectedCategory(undefined);
            // Forcer le re-render
            setForceUpdate(prev => prev + 1);
            console.log('[DeckPage] setSelectedCategory undefined');
        } catch (error) {
            console.error('[DeckPage] Error in handleSelectDeck:', error);
        }
    };

    // Sélection d'une catégorie dans un deck donné
    const handleSelectCategory = (deckId: number, categoryId: number) => {
        console.log('[DeckPage] handleSelectCategory called with deckId:', deckId, 'categoryId:', categoryId);
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
        console.log('[DeckPage] handleCreateDeck called');
        setIsInitialLoad(false);
    };

    const handleCreateCategory = () => {
        console.log('[DeckPage] handleCreateCategory called');
        setIsInitialLoad(false);
    };

    const handleCreateCard = () => {
        console.log('[DeckPage] handleCreateCard called');
        setIsInitialLoad(false);
    };

    const handleBackNavigation = () => {
        console.log('[DeckPage] handleBackNavigation called');
        setIsInitialLoad(false);
        if (selectedCategory) {
            setSelectedCategory(undefined);
        } else if (admin.selectedDeck) {
            admin.setSelectedDeck(undefined);
        }
        setForceUpdate(prev => prev + 1);
    };

    const showBackButton = !isInitialLoad && admin.selectedDeck !== undefined;

    useEffect(() => {
        const loadData = async () => {
            console.log('[DeckPage] useEffect for loadAllData called');
            await admin.loadAllData();
            console.log('[DeckPage]', admin.loading);
        };
        loadData();
    }, [admin, refreshTrigger]);

    // Filtrage des decks en fonction de la recherche
    const filteredDecks = useMemo(() => {
        // ...existing code...
        console.log('[DeckPage] useMemo for filteredDecks called with searchQuery:', searchQuery);
        const query = searchQuery.toLowerCase();
        const result = admin.decks
            .map(deck => {
                console.log('[DeckPage] Mapping deck:', deck.deckId, deck.deckName);
                // Filtrer les catégories appartenant au deck
                const deckCategories = admin.categories.filter(cat => {
                    console.log('[DeckPage]   Filtering category for deck:', deck.deckId, 'cat.deckId:', cat.deckId);
                    return cat.deckId === deck.deckId;
                });
                // Pour chaque catégorie, filtrer les cartes correspondantes
                const deckCategoriesWithCards = deckCategories.map(category => {
                    console.log('[DeckPage]   Mapping category:', category.categoryId, category.categoryName);
                    const categoryCards = admin.cards
                        .filter(card => {
                            console.log('[DeckPage]     Filtering card for category:', category.categoryId, 'card.cardCategoryId:', card.cardCategoryId);
                            return card.cardCategoryId === category.categoryId;
                        })
                        .filter(card => {
                            console.log('[DeckPage]     Filtering card by query:', card.cardName, card.cardActual);
                            return card.cardName.toLowerCase().includes(query) ||
                                card.cardActual.toLowerCase().includes(query);
                        });
                    console.log('[DeckPage]   Resulting cards for category:', category.categoryId, categoryCards);
                    return { ...category, cards: categoryCards };
                }).filter(category => {
                    const isMatch = category.categoryName.toLowerCase().includes(query) ||
                        (category.cards && category.cards.length > 0);
                    console.log('[DeckPage]   Category match for query:', category.categoryId, isMatch);
                    return isMatch;
                });
                console.log('[DeckPage] Resulting categories for deck:', deck.deckId, deckCategoriesWithCards);
                return { ...deck, categories: deckCategoriesWithCards };
            })
            .filter(deck => {
                const isDeckMatch = deck.deckName.toLowerCase().includes(query) ||
                    (deck.categories && deck.categories.length > 0);
                console.log('[DeckPage] Deck match for query:', deck.deckId, isDeckMatch);
                return isDeckMatch;
            });
        console.log('[DeckPage] Filtered decks result:', result);
        return result;
    }, [searchQuery, admin.decks, admin.categories, admin.cards, forceUpdateValue]);

    // Recherche du deck et de la catégorie actuellement sélectionnés
    console.log('[DeckPage] Selected deck:', admin.selectedDeck);
    const currentDeck = filteredDecks.find(deck => deck.deckId === Number(admin.selectedDeck));
    const currentCategory = currentDeck?.categories?.find(cat => cat.categoryId === selectedCategory);
    console.log('[DeckPage] Current deck:', currentDeck);
    console.log('[DeckPage] Current category:', currentCategory);

    if (admin.loading) {
        console.log('[DeckPage] Loading is true, rendering loading screen');
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
                    {showBackButton && (
                        <button 
                            onClick={handleBackNavigation}
                            className="p-2 mx-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            aria-label="Go back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    )}
                    <div className="flex-1">
                        <SearchBar
                            value={searchQuery}
                            onChange={(value) => {
                                console.log('[DeckPage] SearchBar onChange called with value:', value);
                                setSearchQuery(value);
                            }}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    {admin.selectedDeck && !selectedCategory && currentDeck && (
                        <DeckView
                            deck={currentDeck}
                            onSelectCategory={(categoryId: number) => {
                                console.log('[DeckPage] DeckView onSelectCategory called with:', categoryId);
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
                                console.log('[DeckPage] DeckListView onSelectDeck called with:', deckId);
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