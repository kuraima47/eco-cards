import React from 'react';
import type { DeleteConfirmationModalProps } from '../../types/props';
import Modal from './Modal';

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemType,
    name = 'DeckName',
    }) => {
    const getItemTypeText = () => {
        switch (itemType) {
            case 'deck':
                return 'le deck';
            case 'category':
                return 'la catégorie';
            case 'card':
                return 'la carte';
            default:
                return 'cet élément';
        }
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmation de suppression">
            <div className="mb-6">
                <p className="text-gray-700">
                    Êtes-vous sûr de vouloir supprimer {getItemTypeText()} <span className="font-medium">"{name}"</span> ?
                </p>
                {itemType === 'deck' && (
                    <p className="mt-2 text-sm text-red-600">
                        Attention : Toutes les categories & cartes associées à ce deck seront également supprimées.
                    </p>
                )}
                {itemType === 'category' && (
                    <p className="mt-2 text-sm text-red-600">
                        Attention : Tous les cartes associés à cette catégorie seront dissociés de celle-ci.
                    </p>
                )}
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
                    type="button"
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Supprimer
                </button>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;