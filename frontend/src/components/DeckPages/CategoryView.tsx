import {Edit, Eye, Plus, Trash2} from 'lucide-react';
import React, { useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import type { Category } from '../../types/game';
import { GameCard } from '../../types/game';
import { CardModal } from "../Modals/CardModal";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import ViewCardModal from "../Modals/ViewCardModal.tsx";
import Notification from "../Notification";
import * as LucideIcons from 'lucide-react';
import { toPascalCase, ensureArray } from '../../utils/formatting';

interface CategoryViewProps {
    category: Category;
    onCreateCard: () => void;
    refreshParent: () => void;
}


export function CategoryView({ category, refreshParent }: CategoryViewProps) {
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isViewCardModalOpen, setIsViewCardModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentCard, setCurrentCard] = useState<GameCard | undefined>(undefined);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'card'; id: string; name: string } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [permissionsLoaded, setPermissionsLoaded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const admin = useAdmin();

    const CategoryIcon = useMemo(() => {
        const iconName = toPascalCase(category.categoryIcon);
        return LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType || LucideIcons.Box;
    }, [category.categoryIcon]);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                // Vérifier d'abord si l'utilisateur est admin global
                if (admin.user?.role === 'admin') {
                    setIsAdmin(true);
                    setPermissionsLoaded(true);
                    return;
                }
                
                // Sinon, vérifier les droits spécifiques au deck
                const deckAdmin = admin.getDeckAdmin(category.deckId);
                setIsAdmin(deckAdmin === admin.user?.userId);
                setPermissionsLoaded(true);
            } catch (error) {
                console.error("Erreur lors de la vérification des permissions:", error);
                setPermissionsLoaded(true); // Considérer que l'utilisateur n'est pas admin en cas d'erreur
            }
        };
        
        loadPermissions();
    }, [admin.user, category.deckId, admin]);

    const openAddCardModal = () => {
        setModalMode('add');
        setCurrentCard({
            cardId: -1,
            deckId: category.deckId,
            cardName: '...',
            description: '...',
            cardImageData: { data: new Uint8Array(), type: '' },
            qrCodeColor: '#000000',
            qrCodeLogoImageData: '',
            backgroundColor: '#FFFFFF',
            category: category.categoryName,
            cardValue: 0,
            cardActual: [],
            cardProposition: [],
            deckName: admin.getDeck(category.deckId) || '...',
            cardNumber: (category.cards?.length ?? 0) + 1,
            totalCards: modalMode === "edit" ? (category.cards?.length ?? 0) : (category.cards?.length ?? 0) + 1,
            cardCategoryId: -1,
            selected: false,
        });
        setIsCardModalOpen(true);
    };

    const getCardNumber = (cardId: number) => {
        // Utilisation de findIndex
        const index = (category.cards ?? []).findIndex(card => card.cardId === cardId);
        return index !== -1 ? index + 1 : null;
    };

    const openEditCardModal = (card: GameCard) => {
        setModalMode('edit');

        setCurrentCard({
            cardId: card.cardId || 0,
            deckId: category.deckId,
            cardName: card.cardName || '...',
            description: card.description || '...',
            cardImageData: card.cardImageData || null,
            qrCodeColor: card.qrCodeColor || '#000000',
            qrCodeLogoImageData: card.qrCodeLogoImageData || '',
            backgroundColor: card.backgroundColor || '#FFFFFF',
            category: category.categoryName,
            categoryColor: category.categoryColor,
            cardValue: card.cardValue || 0,
            cardActual: ensureArray(card.cardActual),
            cardProposition: ensureArray(card.cardProposition),
            deckName: admin.getDeck(category.deckId) || '...',
            // cardNumber: getCardNumber(card.cardId) || category.cards.length,
            // totalCards: modalMode === "edit" ? category.cards.length : category.cards.length || 0,
            cardNumber: getCardNumber(card.cardId) || (category.cards?.length ?? 0) + 1,
            totalCards: modalMode === "edit" ? (category.cards?.length ?? 0) : (category.cards?.length ?? 0) + 1,
            cardCategoryId: card.cardCategoryId || -1,
            selected: card.selected || false,
        });
        setIsCardModalOpen(true);
    };

    const openViewCardModal = (card: GameCard) => {
        setCurrentCard({
            cardId: card.cardId || 0,
            deckId: category.deckId,
            cardName: card.cardName || '...',
            description: card.description || '...',
            cardImageData: card.cardImageData || '',
            qrCodeColor: card.qrCodeColor || '#000000',
            qrCodeLogoImageData: card.qrCodeLogoImageData || '',
            backgroundColor: card.backgroundColor || '#FFFFFF',
            category: category.categoryName,
            categoryColor: category.categoryColor,
            cardValue: card.cardValue || 0,
            cardActual: ensureArray(card.cardActual),
            cardProposition: ensureArray(card.cardProposition),
            deckName: admin.getDeck(category.deckId) || '...',
            cardNumber: getCardNumber(card.cardId) || (category.cards?.length ?? 0) + 1,
            totalCards: modalMode === "edit" ? (category.cards?.length ?? 0) : (category.cards?.length ?? 0) + 1,
            cardCategoryId: card.cardCategoryId || -1,
            selected: card.selected || false
        });
        setIsViewCardModalOpen(true);
    };

    const openDeleteModal = (id: string, name: string) => {
        setItemToDelete({ type: 'card', id, name });
        setIsDeleteModalOpen(true);
    };

    const handleCardSubmit = async (data: Partial<GameCard>) => {
        try {
            // Convertir les tableaux en chaînes de caractères JSON et passer la value en number
            const formattedData = {
                ...data,
                cardValue: data.cardValue ? Number(data.cardValue) : undefined,
                cardActual: Array.isArray(data.cardActual) ? JSON.stringify(data.cardActual) : JSON.stringify([]),
                cardProposition: Array.isArray(data.cardProposition) ? JSON.stringify(data.cardProposition) : JSON.stringify([]),
            } as unknown as Partial<GameCard>;

            if (modalMode === 'add') {
                await admin.addCard(formattedData);
                setNotification({ message: "Carte créée avec succès !", type: "success" });
                refreshParent();
            } else if (modalMode === 'edit' && currentCard) {
                await admin.updateCard(currentCard.cardId, formattedData);
                setNotification({ message: "Carte modifiée avec succès !", type: "success" });
                refreshParent();
            }
            setIsCardModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la soumission de la carte :', error);
            if (modalMode === 'add') {
                setNotification({ message: "Erreur lors de la création de la carte.", type: "error" });
            } else if (modalMode === 'edit' && currentCard) {
                setNotification({ message: "Erreur lors de la modification de la carte.", type: "error" });
            }
        }
    };

    if (!permissionsLoaded) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <LucideIcons.Loader className="animate-spin h-8 w-8 text-green-600" />
            </div>
        );
    }

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
                <div>
                    <div className="flex items-center gap-2">
                        <CategoryIcon className="w-6 h-6" style={{ color: category.categoryColor || "#000000" }} />
                        <h1 className="text-2xl font-bold">{category.categoryName}</h1>
                    </div>
                    {category.categoryDescription && (
                        <p className="text-gray-600 mt-1">{category.categoryDescription}</p>
                    )}
                </div>
                <button
                    onClick={openAddCardModal}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle carte
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.cards && category.cards.map((card: GameCard) => (
                    <div
                        key={card.cardId}
                        className="p-4 bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full"
                    >
                        {/* Contenu de la carte qui prendra l'espace disponible */}
                        <div className="flex-grow">
                            <h3 className="font-semibold text-lg mb-2">{card.cardName}</h3>
                            <p className="text-gray-600">{card.description}</p>
                        </div>

                        {/* Les boutons seront toujours en bas */}
                        <div className="flex space-x-1 justify-end mt-auto pt-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openViewCardModal(card);
                                }}
                                className="text-green-600 hover:text-green-800"
                                title="Voir la carte"
                            >
                                <Eye size={18} />
                            </button>
                            {isAdmin && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditCardModal(card);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Modifier la carte"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal(String(card.cardId), card.cardName || '');
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                    title="Supprimer la carte"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <ViewCardModal
                key={currentCard?.cardId ? currentCard?.cardId * 1000000000 : undefined} // ou un autre identifiant unique
                isOpen={isViewCardModalOpen}
                onClose={() => {
                    setIsViewCardModalOpen(false)
                }
                }
                categoryIcon={category.categoryIcon}
                categoryColor={category.categoryColor}
                mode={modalMode}
                initialData={
                    currentCard
                }
                onSubmit={handleCardSubmit}
                currentDeckId={String(category.deckId)}
            />

            <CardModal
                key={currentCard?.cardId}
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                mode={modalMode}
                initialData={
                    currentCard
                }
                onSubmit={handleCardSubmit}
                currentDeckId={String(category.deckId)}
                categoryIcon={category.categoryIcon}
                categoryColor={category.categoryColor}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={async () => {
                    if (itemToDelete) {
                        try {
                            await admin.deleteCard(itemToDelete.id);
                            setNotification({ message: "Carte supprimée avec succès !", type: "success" });
                            setIsDeleteModalOpen(false);
                            refreshParent();
                        } catch (error) {
                            console.error(`Erreur lors de la suppression de la carte :`, error);
                            setNotification({ message: "Erreur lors de la suppression de la carte.", type: "error" });
                        }
                    }
                }}
                itemType="card"
                name={itemToDelete?.name || ''}
            />
        </div>
    );
}
