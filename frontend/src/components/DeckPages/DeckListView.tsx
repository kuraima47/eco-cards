import { Download, Edit, Library, Plus, Trash2 } from 'lucide-react';
import { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
// import { Deck } from "../../types";
import DeckModal from "../Modals/DeckModal";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import Notification from "../Notification";
import ModalCards from "../Pdf/ModalCards";
import { DeckWithCategories, GameDeck } from '../../types/game';

interface DeckListViewProps {
    decks: DeckWithCategories[];
    onSelectDeck: (deckId: number) => void;
    refreshParent: () => void;
}

export function DeckListView({ decks, onSelectDeck, refreshParent }: DeckListViewProps) {
    // États pour les modals utiles
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // État pour le mode du modal (ajout ou édition)
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    // État pour les données initiales du modal deck
    const [currentDeck, setCurrentDeck] = useState<any>(null);

    // État pour l'élément à supprimer (unique)
    const [itemToDelete, setItemToDelete] = useState<{ type: 'deck' | 'category' | 'card'; id: string; name: string; } | null>(null);

    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const admin = useAdmin();

    const openAddDeckModal = () => {
        setModalMode('add');
        setCurrentDeck(null);
        setIsDeckModalOpen(true);
    };

    const openEditDeckModal = (deck: GameDeck) => {
        setModalMode('edit');
        setCurrentDeck(deck);
        setIsDeckModalOpen(true);
    };

    const openDownloadModal = (deck: GameDeck) => {
        setCurrentDeck(deck);
        setIsDownloadModalOpen(true);
    }

    const openDeleteModal = (type: 'deck' | 'category' | 'card', id: number, name: string) => {
        setItemToDelete({ type, id: String(id), name });
        setIsDeleteModalOpen(true);
    };

    const handleDeckSubmit = async (data: Partial<GameDeck>) => {
        try {
            if (modalMode === 'add') {
                await admin.addDeck(data);
                setNotification({ message: "Deck créé avec succès !", type: "success" });
                refreshParent();
            } else if (modalMode === 'edit' && currentDeck) {
                await admin.updateDeck(currentDeck.deckId, data);
                setNotification({ message: "Deck modifié avec succès !", type: "success" });
                refreshParent();
            }
            setIsDeckModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la soumission du deck :', error);
            if (modalMode === 'add') {
                setNotification({ message: "Erreur lors de la création du deck.", type: "error" });
            } else if (modalMode === 'edit' && currentDeck) {
                setNotification({ message: "Erreur lors de la modification du deck.", type: "error" });
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (itemToDelete) {
            try {
                if (itemToDelete.type === 'deck') {
                    await admin.deleteDeck(Number(itemToDelete.id));
                    setNotification({ message: "Deck supprimé avec succès !", type: "success" });
                    refreshParent();
                }
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error(`Erreur lors de la suppression du ${itemToDelete.type} :`, error);

                if (itemToDelete.type === 'deck') {
                    setNotification({ message: "Erreur lors de la suppression de la carte.", type: "error" });
                }
            }
        }
    };

    return (
        <div className="p-6">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    duration={3000}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mes Decks</h1>
                <button
                    onClick={openAddDeckModal}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Deck
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => {
                    const categoryCount = deck.categories.length;
                    const cardCount = deck.categories.reduce((sum, category) => sum + (category.cards?.length || 0), 0);
                    return (
                        <div
                            key={deck.deckId}
                            onClick={() => onSelectDeck(deck.deckId)}
                            role="button"
                            tabIndex={0}
                            className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-left cursor-pointer"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Library className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold">{deck.deckName}</h2>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-600">
                                    {categoryCount} catégorie{categoryCount !== 1 ? 's' : ''}
                                </p>
                                <p className="text-gray-600">
                                    {cardCount} carte{cardCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="flex space-x-1 justify-end">
                                {deck.categories &&
                                    deck.categories.length > 0 &&
                                    deck.categories.some(category => category.cards && category.cards.length > 0) && (

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // download deck
                                                openDownloadModal(deck);
                                            }}
                                            className="text-green-600 hover:text-green-800"
                                            title="Download deck"
                                        >
                                            <Download size={18} />
                                        </button>
                                    )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditDeckModal(deck);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Modifier le deck"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal('deck', deck.deckId, deck.deckName);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                    title="Supprimer le deck"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ModalCards
                key={currentDeck?.deckId}
                initialData={currentDeck}
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
            />

            <DeckModal
                isOpen={isDeckModalOpen}
                onClose={() => setIsDeckModalOpen(false)}
                mode={modalMode}
                initialData={currentDeck}
                onSubmit={handleDeckSubmit}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemType={itemToDelete?.type || 'deck'}
                name={itemToDelete?.name || ''}
            />
        </div>
    );
}
