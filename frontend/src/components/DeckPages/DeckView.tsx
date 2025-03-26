import { Download, Edit, FolderClosed, Plus, Trash2 } from 'lucide-react';
import { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin.ts";
import CategoryModal from "../Modals/CategoryModal.tsx";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal.tsx";
import Notification from "../Notification";
import ModalCards from "../Pdf/ModalCards.tsx";
import { toPascalCase } from '../../utils/formatting';
import * as LucideIcons from 'lucide-react';
import { Category, DeckWithCategories } from '../../types/game.ts';

interface DeckViewProps {
    deck: DeckWithCategories;  // deck contient déjà deck.categories filtrées par le parent
    onSelectCategory: (categoryId: number) => void;
    onCreateCategory: () => void;
    refreshParent?: () => void;
}

export function DeckView({ deck, onSelectCategory, refreshParent }: DeckViewProps) {

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

    const isAdmin = admin.user?.userId === deck.adminId;

    /**
     * Ouvre la modale d'ajout de catégorie
     */
    const openAddCategoryModal = (deckId?: string) => {
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
        setModalMode('edit');
        setCurrentCategory(category);
        setIsCategoryModalOpen(true);
    };

    /**
     * Ouvre la modale de confirmation de suppression
     */
    const openDeleteModal = (type: 'deck' | 'category' | 'card', id: string, name: string) => {
        setItemToDelete({ type, id, name });
        setIsDeleteModalOpen(true);
    };

    /**
     * Gère la soumission de la modale de catégorie (ajout/édition)
     */
    const handleCategorySubmit = async (data: Partial<Category>) => {
        try {
            if (modalMode === 'add') {
                // Ajout d'une nouvelle catégorie
                await admin.addCategory({
                    categoryName: data.categoryName || '',
                    categoryDescription: data.categoryDescription || '',
                    categoryColor: data.categoryColor || '',
                    categoryIcon: data.categoryIcon || '',
                    deckId: currentCategory?.deckId ? Number(currentCategory.deckId) : Number(deck.deckId)
                });
                setNotification({ message: "Catégorie créée avec succès !", type: "success" });
            } else if (modalMode === 'edit' && currentCategory) {
                // Mise à jour d'une catégorie existante
                await admin.updateCategory(Number(currentCategory.categoryId), {
                    categoryName: data.categoryName || '',
                    categoryDescription: data.categoryDescription || '',
                    categoryColor: data.categoryColor || '',
                    categoryIcon: data.categoryIcon || ''
                });
                setNotification({ message: "Catégorie modifiée avec succès !", type: "success" });
            }

            // On recharge toutes les données globales
            await admin.loadAllData();

            // Call the parent's refresh function if provided
            if (refreshParent) {
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
        if (itemToDelete) {
            try {
                if (itemToDelete.type === 'category') {
                    // Suppression d'une catégorie
                    await admin.deleteCategory(Number(itemToDelete.id));
                    setNotification({ message: "Catégorie supprimée avec succès !", type: "success" });
                    await admin.loadAllData();

                    // Call the parent's refresh function if provided
                    if (refreshParent) {
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

    const renderCategoryIcon = (categoryIcon?: string, categoryColor?: string) => {

        const defaultIcon = <LucideIcons.Box
            className="w-5 h-5"
            style={{ color: categoryColor || '#FFFFFF' }}
        />

        if (!categoryIcon) return defaultIcon;

        const iconName = toPascalCase(categoryIcon);
        const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType || LucideIcons.Box;

        if (!IconComponent) return defaultIcon;

        return <IconComponent
            className="w-5 h-5"
            style={{ color: categoryColor || '#FFFFFF' }}
        />;
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
                    {/* Vérifie si le deck a des catégories et si au moins une catégorie a des cartes */}
                    {deck.categories &&
                        deck.categories.length > 0 &&
                        deck.categories.some(category => category.cards && category.cards.length > 0) && (
                            <button
                                onClick={() => {
                                    console.log("Download Deck");
                                    openDownloadModal();
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                                title="Download deck"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                            </button>
                        )}
                    <button
                        onClick={() => openAddCategoryModal(String(deck.deckId))}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle Catégorie
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
                            onSelectCategory(Number(category.categoryId));
                        }}
                    >
                        <div className="flex items-center space-x-3">
                            <FolderClosed className="w-6 h-6 text-green-600" />
                            {renderCategoryIcon(category.categoryIcon, category.categoryColor)}
                            <span className="font-medium">{category.categoryName}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {category.cards?.length || 0} carte{(category.cards?.length > 1) ? 's' : ''}
                        </p>
                        {isAdmin && (
                            <div className="flex space-x-1 justify-end">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditCategoryModal(category);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                    title="Modifier la catégorie"
                                >
                                    <Edit size={18} />
                                </div>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal('category', String(category.categoryId), category.categoryName);
                                    }}
                                    className="text-red-600 hover:text-red-800 cursor-pointer"
                                    title="Supprimer la catégorie"
                                >
                                    <Trash2 size={18} />
                                </div>
                            </div>
                        )}
                    </button>

                ))}
            </div>
            <ModalCards
                key={deck.deckId}
                initialData={deck}
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
            // categoryIcon={deck.categoryIcon}
            // categoryColor={deck.categoryColor}
            />

            {/* Modale d'ajout/édition de catégorie */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
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
                    setIsDeleteModalOpen(false);
                }}
                onConfirm={handleDeleteConfirm}
                itemType={itemToDelete?.type || 'deck'}
                name={itemToDelete?.name || ''}
            />
        </div>
    );
}
