import React, { useEffect, useState } from 'react';
import { Category } from "../../types/game";
import Modal from './Modal';
import CategoryPreview from '../Card/CategoryPreview';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    initialData: Partial<Category> | null;
    onSubmit: (data: Partial<Category>) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    mode,
    initialData,
    onSubmit,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#ffffff'); // Valeur par défaut : blanc
    const [icon, setIcon] = useState('');

    // Mettre à jour l'état lorsque initialData change
    useEffect(() => {
        if (initialData) {
            setName(initialData.categoryName || '');
            setDescription(initialData.categoryDescription || '');
            setColor(initialData.categoryColor || '#ffffff');
            setIcon(initialData.categoryIcon || '');
        } else {
            setName('');
            setDescription('');
            setColor('#ffffff');
            setIcon('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData: Partial<Category> = {
            ...initialData,
            categoryName: name,
            categoryDescription: description,
            categoryColor: color,
            categoryIcon: icon,
        };
        onSubmit(updatedData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Ajouter une catégorie' : 'Modifier la catégorie'}
        >
            <form onSubmit={handleSubmit}>
                {/* Nom */}
                <div className="mb-6">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la catégorie
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optionnelle)
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Icône */}
                    <div className="flex-1">
                        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de l'icône (issue du site <a
                                href="https://lucide.dev/icons/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 underline"
                            >
                                Lucide React
                            </a>)
                        </label>
                        <input
                            type="text"
                            id="icon"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Ex: leaf, utensils, waves"
                        />
                    </div>

                    {/* Couleur */}
                    <div className="flex-1">
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                            Couleur (Hexadécimale)
                        </label>
                        <input
                            type="color"
                            id="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full h-10 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <CategoryPreview
                        categoryName={name}
                        categoryIcon={icon}
                        categoryColor={color}
                        className="text-sm  m-3 py-2"
                    />
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CategoryModal;
