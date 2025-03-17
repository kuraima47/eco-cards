import React from 'react';
import {
    ChevronDown,
    ChevronRight,
    FolderClosed,
    FolderOpen,
    FileText,
    Library
} from 'lucide-react';

interface CategoryType {
    categoryId: number;
    categoryName: string;
    cards: {
        cardId: string;
        cardName: string;
    }[];
}

interface DeckWithCategories {
    deckId: number;
    deckName: string;
    categories: CategoryType[];
}

interface SidebarProps {
    decks: DeckWithCategories[];
    selectedDeck?: number;
    selectedCategory?: number;
    onSelectDeck: (deckId: number) => void;
    onSelectCategory: (deckId: number, categoryId: number) => void;
}

export function Sidebar({
                            decks,
                            selectedDeck,
                            selectedCategory,
                            onSelectDeck,
                            onSelectCategory,
                        }: SidebarProps) {
    console.log('[Sidebar] rendering with decks:', decks);
    console.log('[Sidebar] selectedDeck:', selectedDeck, 'selectedCategory:', selectedCategory);

    const [expandedDecks, setExpandedDecks] = React.useState<Set<number>>(new Set());
    const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set());

    const toggleDeck = (deckId: number) => {
        console.log('[Sidebar] toggleDeck called with deckId:', deckId);
        setExpandedDecks((prev) => {
            const next = new Set(prev);
            if (next.has(deckId)) {
                next.delete(deckId);
            } else {
                next.add(deckId);
            }
            return next;
        });
    };

    const toggleCategory = (categoryId: number) => {
        console.log('[Sidebar] toggleCategory called with categoryId:', categoryId);
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    return (
        <div className="w-64 border-r border-gray-200 h-full overflow-y-auto">
            <div className="p-4">
                <button
                    onClick={() => {
                        console.log('[Sidebar] onClick Deck Explorer -> onSelectDeck(1)');
                        onSelectDeck(-1);
                    }}
                    className="flex items-center space-x-2 text-lg font-semibold mb-4 hover:text-green-600 transition-colors"
                >
                    <Library className="w-5 h-5" />
                    <span>Deck Explorer</span>
                </button>
                <div className="space-y-1">
                    {decks.map((deck: DeckWithCategories) => (
                        <div key={deck.deckId}>
                            <button
                                className={`w-full flex items-center px-2 py-1.5 rounded-md text-left ${
                                    selectedDeck === deck.deckId ? 'bg-green-100 text-green-700' : 'hover:bg-gray-200'
                                }`}
                                onClick={() => {
                                    console.log('[Sidebar] onClick deck:', deck.deckId);
                                    onSelectDeck(deck.deckId);
                                    toggleDeck(deck.deckId);
                                }}
                            >
                                {expandedDecks.has(deck.deckId) ? (
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 mr-1" />
                                )}
                                {expandedDecks.has(deck.deckId) ? (
                                    <FolderOpen className="w-4 h-4 mr-2" />
                                ) : (
                                    <FolderClosed className="w-4 h-4 mr-2" />
                                )}
                                <span>{deck.deckName}</span>
                            </button>
                            {expandedDecks.has(deck.deckId) && deck.categories && (
                                <div className="ml-6 mt-1 space-y-1">
                                    {deck.categories.map((category) => (
                                        <div key={category.categoryId}>
                                            <button
                                                className={`w-full flex items-center px-2 py-1.5 rounded-md text-left ${
                                                    selectedCategory === category.categoryId
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'hover:bg-gray-200'
                                                }`}
                                                onClick={() => {
                                                    console.log('[Sidebar] onClick category:', category.categoryId, 'in deck:', deck.deckId);
                                                    onSelectCategory(deck.deckId, category.categoryId);
                                                    toggleCategory(category.categoryId);
                                                }}
                                            >
                                                {expandedCategories.has(category.categoryId) ? (
                                                    <ChevronDown className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 mr-1" />
                                                )}
                                                <FolderClosed className="w-4 h-4 mr-2" />
                                                <span>{category.categoryName}</span>
                                            </button>
                                            {expandedCategories.has(category.categoryId) && category.cards && (
                                                <div className="ml-6 mt-1 space-y-1">
                                                    {category.cards.map((card) => (
                                                        <div
                                                            key={card.cardId}
                                                            className="flex items-center px-2 py-1.5 text-sm text-gray-600"
                                                        >
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            <span className="truncate">{card.cardName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
