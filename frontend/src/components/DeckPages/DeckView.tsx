import { Download, Edit, FolderClosed, Plus, Trash2 } from 'lucide-react';
import { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin.ts";
import type { Deck } from '../../types';
import CategoryModal from "../Modals/CategoryModal.tsx";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal.tsx";
import Notification from "../Notification";
import ModalCards from "../Pdf/ModalCards.tsx";

interface DeckViewProps {
    deck: Deck;  // deck contient déjà deck.categories filtrées par le parent
    onSelectCategory: (categoryId: number) => void;
    onCreateCategory: () => void;
    refreshParent?: () => void;
}

export function DeckView({ deck, onSelectCategory, onCreateCategory, refreshParent }: DeckViewProps) {
    console.log('[DeckView] rendering with deck:', deck);

    // États pour gérer les modales
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [itemToDelete, setItemToDelete] = useState<{
        type: 'deck' | 'category' | 'card';
        id: string;
        name: string;
    } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Méthodes du hook useAdmin
    const admin = useAdmin();

    /**
     * Ouvre la modale d'ajout de catégorie
     */
    const openAddCategoryModal = (deckId?: string) => {
        console.log('[DeckView] openAddCategoryModal with deckId:', deckId);
        setModalMode('add');
        setCurrentCategory({ deckId: deckId });
        setIsCategoryModalOpen(true);
    };

    const openDownloadModal = () => {
        setIsDownloadModalOpen(true)
    }

    /**
     * Ouvre la modale d'édition de catégorie
     */
    const openEditCategoryModal = (category: any) => {
        console.log('[DeckView] openEditCategoryModal with category:', category);
        setModalMode('edit');
        setCurrentCategory(category);
        setIsCategoryModalOpen(true);
    };

    /**
     * Ouvre la modale de confirmation de suppression
     */
    const openDeleteModal = (type: 'deck' | 'category' | 'card', id: string, name: string) => {
        console.log('[DeckView] openDeleteModal, type:', type, 'id:', id, 'name:', name);
        setItemToDelete({ type, id, name });
        setIsDeleteModalOpen(true);
    };

    /**
     * Gère la soumission de la modale de catégorie (ajout/édition)
     */
    const handleCategorySubmit = async (data: Partial<Category>) => {
        console.log('[DeckView] handleCategorySubmit, data:', data, 'modalMode:', modalMode, 'currentCategory:', currentCategory);
        try {
            if (modalMode === 'add') {
                // Ajout d'une nouvelle catégorie
                await admin.addCategory({
                    categoryName: data.categoryName || '',
                    categoryDescription: data.categoryDescription || '',
                    deckId: currentCategory?.deckId ? Number(currentCategory.deckId) : Number(deck.deckId)
                });
                setNotification({ message: "Catégorie créée avec succès !", type: "success" });
            } else if (modalMode === 'edit' && currentCategory) {
                // Mise à jour d'une catégorie existante
                await admin.updateCategory(Number(currentCategory.categoryId), {
                    categoryName: data.categoryName || '',
                    categoryDescription: data.categoryDescription || ''
                });
                setNotification({ message: "Catégorie modifiée avec succès !", type: "success" });
            }
    
            // On recharge toutes les données globales
            await admin.loadAllData();
            
            // Call the parent's refresh function if provided
            if (refreshParent) {
                console.log('[DeckView] Calling refreshParent');
                refreshParent();
            }
            
            // Now we can safely call the refresh method
            admin.refresh();
            
            setIsCategoryModalOpen(false);
        } catch (error) {
            if (modalMode === 'add') {
                setNotification({ message: "Erreur lors de la création de la catégorie.", type: "error" });
            } else if (modalMode === 'edit' && currentCategory) {
                setNotification({ message: "Erreur lors de la modification de la catégorie.", type: "error" });
            }
            console.error('[DeckView] Error in handleCategorySubmit:', error);
        }
    };

    /**
     * Gère la confirmation de suppression
     */
    const handleDeleteConfirm = async () => {
        console.log('[DeckView] handleDeleteConfirm, itemToDelete:', itemToDelete);
        if (itemToDelete) {
            try {
                if (itemToDelete.type === 'category') {
                    // Suppression d'une catégorie
                    await admin.deleteCategory(Number(itemToDelete.id));
                    setNotification({ message: "Catégorie supprimée avec succès !", type: "success" });
                    await admin.loadAllData();
                    
                    // Call the parent's refresh function if provided
                    if (refreshParent) {
                        console.log('[DeckView] Calling refreshParent after deletion');
                        refreshParent();
                    }
                    
                    // Now we can safely call the refresh method
                    admin.refresh();
                }
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error('[DeckView] Error deleting item:', error);
                if (itemToDelete.type === 'category') {
                    setNotification({ message: "Erreur lors de la suppression de la catégorie.", type: "error" });
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
                <h1 className="text-2xl font-bold">{deck.deckName}</h1>
                <div className="flex flex-row gap-2">
                    <button
                        onClick={(e) => {
                            // openEditDeckModal(deck);
                            console.log("Download Deck");
                            openDownloadModal();
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                        title="Download deck"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </button>
                    <button
                        onClick={() => openAddCategoryModal(String(deck.deckId))}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Category
                    </button>
                </div>

            </div>

            {/* On utilise directement deck.categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deck.categories?.map((category) => (
                    <button
                        key={category.categoryId}
                        className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                        onClick={() => {
                            console.log('[DeckView] onClick category -> onSelectCategory called with:', category.categoryId);
                            onSelectCategory(category.categoryId);
                        }}
                    >
                        <div className="flex items-center space-x-3">
                            <FolderClosed className="w-6 h-6 text-green-600" />
                            <span className="font-medium">{category.categoryName}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {category.cards?.length || 0} cards
                        </p>
                        <div className="flex space-x-1 justify-end">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEditCategoryModal(category);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Modifier la catégorie"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal('category', String(category.categoryId), category.categoryName);
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer la catégorie"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </button>
                ))}
            </div>

            <ModalCards
                key={deck.id}
                initialData={deck}
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
            />

            {/* Modale d'ajout/édition de catégorie */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    console.log('[DeckView] CategoryModal onClose');
                    setIsCategoryModalOpen(false);
                }}
                mode={modalMode}
                initialData={currentCategory}
                onSubmit={handleCategorySubmit}
            />

            {/* Modale de confirmation de suppression */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    console.log('[DeckView] DeleteConfirmationModal onClose');
                    setIsDeleteModalOpen(false);
                }}
                onConfirm={handleDeleteConfirm}
                itemType={itemToDelete?.type || 'deck'}
                name={itemToDelete?.name || ''}
            />
        </div>
    );
}
