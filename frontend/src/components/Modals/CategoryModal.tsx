import React, { useEffect, useState } from 'react';
import { Category } from "../../types/game";
import Modal from './Modal';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    initialData: Partial<Category>| null;
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

    // Mettre à jour l'état lorsque initialData change
    useEffect(() => {
        console.log('[CategoryModal] initialData changed:', initialData);
        if (initialData) {
            setName(initialData.categoryName || '');
            setDescription(initialData.categoryDescription || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData: Partial<Category> = {
            ...initialData,
            categoryName: name,
            categoryDescription: description
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

                <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                    />
                </div>

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