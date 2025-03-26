import React, { useEffect, useState } from 'react';
import type { DeckModalProps } from '../../types/props';
import Modal from './Modal';

const DeckModal: React.FC<DeckModalProps> = ({
    isOpen,
    onClose,
    mode,
    initialData,
    onSubmit,
    }) => {
    const [title, setTitle] = useState('');
    // Mettre à jour les états lorsque initialData change
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.deckName || '');
        } else {
            setTitle('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialData) {
            initialData = {
                deckName: title,
                deckId: 0,
                adminId: 0
                
            }
        }else {
            initialData.deckName = title;
        }
        console.log('Deck before create :', initialData);
        onSubmit(initialData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Ajouter un deck' : 'Modifier le deck'}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Titre
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
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

export default DeckModal;