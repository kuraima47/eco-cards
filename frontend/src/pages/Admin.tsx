import { Edit2, Plus, Save, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import Card from '../components/Card/Card';
import CardBack from '../components/Card/CardBack';
import CreateCardForm from '../components/CreateCardForm';
import ImageUpload from '../components/ImageUpload';
import { useAdmin } from '../hooks/useAdmin.ts';
import { useQRCode } from "../hooks/useQRCode.tsx";
import type { Category } from '../types/game';

const Admin = () => {

    const admin = useAdmin();

    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState('');
    const [newCategory, setNewCategory] = useState({ categoryName: '', categoryDescription: '', categoryIcon: '', categoryColor: '' });
    const [newDeck, setNewDeck] = useState({ name: '', category_id: '' });
    const [newCard, setNewCard] = useState({
        cardActual: '',
        cardProposition: '',
        cardValue: 0,
        satisfaction_score: 0,
        image_url: ''
    });
    const qrCodeProps = useQRCode();
    console.log("fez")

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newCategory.categoryName || newCategory.categoryName.trim() === '') {
                alert('Le nom de la catégorie est requis');
                return;
            }

            await admin.addCategory(newCategory);
            setNewCategory({ categoryName: '', categoryDescription: '', categoryIcon: '', categoryColor: '' });
            setShowNewCategoryModal(false);
        } catch (error) {
            console.error('Error adding category:', error);
            alert(error instanceof Error
                ? `Erreur: ${error.message}`
                : 'Erreur lors de la création de la catégorie');
        }
    };

    const handleUpdateCategory = async (id: number, category: Partial<Category>) => {
        try {
            await admin.updateCategory(id, category);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Erreur lors de la mise à jour de la catégorie');
        }
    };

    const handleAddDeck = async () => {
        console.log("aaa")
        try {
            await admin.addDeck(newDeck);
            setNewDeck({ name: '', category_id: '' });
        } catch (error) {
            console.error('Error adding deck:', error);
            alert(error instanceof Error ? error.message : 'Erreur lors de la création du deck');
        }
    };

    const handleAddCard = async () => {
        try {
            await admin.addCard(newCard);
            setNewCard({
                cardActual: '',
                cardProposition: '',
                cardValue: 0,
                satisfaction_score: 0,
                image_url: ''
            });
        } catch (error) {
            console.error('Error adding card:', error);
            alert(error instanceof Error ? error.message : 'Erreur lors de l\'ajout de la carte');
        }
    };

    const handleImportCards = async () => {
        try {
            const cards = JSON.parse(importData);
            if (!Array.isArray(cards)) {
                throw new Error('Le format des données est invalide');
            }
            await admin.importCards(cards);
            setShowImportModal(false);
            setImportData('');
        } catch (error) {
            console.error('Error importing cards:', error);
            alert(error instanceof Error ? error.message : 'Erreur lors de l\'importation des cartes');
        }
    };

    if (admin.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Catégories */}
            <section className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Catégories</h2>
                    <button
                        onClick={() => setShowNewCategoryModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Nouvelle Catégorie
                    </button>
                </div>

                <div className="grid gap-4">
                    {admin.categories.map((category) => (
                        <div key={category.categoryId} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            {editingCategory === category.categoryId ? (
                                <>
                                    <input
                                        type="text"
                                        value={category.categoryName}
                                        onChange={(e) => handleUpdateCategory(category.categoryId, { categoryName: e.target.value })}
                                        className="rounded-md border-gray-300"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateCategory(category.categoryId, category)}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <Save className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setEditingCategory(null)}
                                            className="text-gray-600 hover:text-gray-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="font-medium">{category.categoryName}</h3>
                                        <p className="text-sm text-gray-600">{category.categoryDescription}</p>
                                        <p className="text-sm text-gray-600">{category.categoryIcon}</p>
                                        <p className="text-sm text-gray-600">{category.categoryColor}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingCategory(category.categoryId)}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Modal de création de catégorie */}
            {showNewCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Nouvelle Catégorie</h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom de la catégorie
                                </label>
                                <input
                                    type="text"
                                    value={newCategory.categoryName}
                                    onChange={(e) => setNewCategory({ ...newCategory, categoryName: e.target.value })}
                                    className="w-full rounded-md border-gray-300"
                                    placeholder="Ex: Bâtiment"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newCategory.categoryDescription}
                                    onChange={(e) => setNewCategory({ ...newCategory, categoryDescription: e.target.value })}
                                    className="w-full rounded-md border-gray-300"
                                    rows={3}
                                    placeholder="Description de la catégorie..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewCategoryModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                                >
                                    Créer la catégorie
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Decks */}
            <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Decks</h2>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Nom du deck"
                            value={newDeck.name}
                            onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                            className="flex-1 rounded-md border-gray-300"
                        />
                        <select
                            value={newDeck.category_id}
                            onChange={(e) => setNewDeck({ ...newDeck, category_id: e.target.value })}
                            className="rounded-md border-gray-300"
                        >
                            <option value="">Sélectionner une catégorie</option>
                            {admin.categories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddDeck}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Ajouter
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {admin.decks.map((deck) => (
                            <div
                                key={deck.id}
                                className={`flex items-center justify-between bg-gray-50 p-4 rounded-lg cursor-pointer
                  ${admin.selectedDeck === deck.id ? 'ring-2 ring-green-500' : ''}`}
                                onClick={() => admin.setSelectedDeck(deck.id)}
                            >
                                <div>
                                    <h3 className="font-medium">{deck.name}</h3>
                                    <p className="text-sm text-gray-600">Catégorie: {deck.category?.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cartes */}
            {admin.selectedDeck && (
                <section className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Cartes du Deck</h2>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Upload className="h-5 w-5" />
                            Importer des cartes
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium mb-4">Nouvelle Carte</h3>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Situation Actuelle
                                            </label>
                                            <textarea
                                                value={newCard.cardActual}
                                                onChange={(e) => setNewCard({ ...newCard, cardActual: e.target.value })}
                                                className="w-full rounded-md border-gray-300"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Proposition
                                            </label>
                                            <textarea
                                                value={newCard.cardProposition}
                                                onChange={(e) => setNewCard({ ...newCard, cardProposition: e.target.value })}
                                                className="w-full rounded-md border-gray-300"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valeur CO2
                                            </label>
                                            <input
                                                type="number"
                                                value={newCard.cardValue}
                                                onChange={(e) => setNewCard({ ...newCard, cardValue: parseFloat(e.target.value) })}
                                                className="w-full rounded-md border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Score Satisfaction
                                            </label>
                                            <input
                                                type="number"
                                                value={newCard.satisfaction_score}
                                                onChange={(e) => setNewCard({ ...newCard, satisfaction_score: parseInt(e.target.value) })}
                                                className="w-full rounded-md border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Image
                                            </label>
                                            <ImageUpload
                                                onImageUploaded={(url) => setNewCard({ ...newCard, image_url: url })}
                                                currentImage={newCard.image_url}
                                                onImageRemove={() => setNewCard({ ...newCard, image_url: '' })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddCard}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <Plus className="h-5 w-5" />
                                            Ajouter la carte
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {admin.cards.map((card) => {
                                    console.log(card);
                                    return (""
                                        // <Card
                                        //     key={card.id}
                                        //     name="Card Name"
                                        //     category="Bâtiment"
                                        //     co2Value={card.co2_value}
                                        //     current_situation={card.current_situation}
                                        //     proposal={card.proposal}
                                        //     // imageUrl={card.imageUrl}
                                        //     imageUrl="https://idinterdesign.ca/wp-content/uploads/2016/07/paysage-ID-02-750x468.jpg"
                                        // />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                    key={"4"}
                    cardName="Inciter au déplacement par véhicules électriques"
                    category="Transport"
                    cardValue={1}
                    cardActual={"Pas d'incitation à l'utilisation de voitures électriques"}
                    cardProposition={`Pour les étudiants et le personnel
                        - Mise à disposition d'une place de parking réservée
                        - recharge gratuite à l'Université`}
                    // imageUrl={card.imageUrl}
                    imageUrl="https://media.istockphoto.com/id/1069539210/fr/photo/coucher-de-soleil-automne-fantastique-du-lac-hintersee.jpg?s=612x612&w=0&k=20&c=bEO1YiSMBcrphxE7zg27ljwjMNZS57KCXw3Z0wUiVtc="
                    width={300}
                    height={500}
                />
                <CardBack
                    category="Achat"
                    indexInCategory={2}
                    totalInCategory={5}
                    deckName="Informatique"
                    width={300}
                    height={500}
                    qrCodeProps={qrCodeProps}
                />
            </div>
            <CreateCardForm {...qrCodeProps} />
            {/* Modal d'importation */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Importer des cartes</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Données JSON
                                </label>
                                <textarea
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    className="w-full rounded-md border-gray-300"
                                    rows={10}
                                    placeholder='[
  {
    "current_situation": "...",
    "proposal": "...",
    "co2_value": 0,
    "satisfaction_score": 0,
    "image_url": "..."
  }
]'
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleImportCards}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                                >
                                    Importer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;