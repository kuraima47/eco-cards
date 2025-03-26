import React from 'react';
import { X } from 'lucide-react';
import type { CreateCardFormProps } from "../types/props";

export function CreateCardForm({ cardData, setCardData, onSubmit }: CreateCardFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (field: 'cardActual' | 'cardProposition', index: number, value: string) => {
        setCardData(prev => ({
            ...prev,
            [field]: prev[field].map((item: string, i: number) => (i === index ? value : item)),
        }));
    };

    const addListItem = (field: 'cardActual' | 'cardProposition') => {
        setCardData(prev => ({
            ...prev,
            [field]: [...prev[field], ''],
        }));
    };

    const removeListItem = (field: 'cardActual' | 'cardProposition', index: number) => {
        setCardData(prev => ({
            ...prev,
            [field]: prev[field].filter((_: string, i: number) => i !== index),
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'cardImage' | 'qrCodeLogoImage') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCardData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            {/* Titre */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                    type="text"
                    name="cardName"
                    value={cardData.cardName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    name="cardDescription"
                    value={cardData.cardDescription}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Image de la carte */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image de la carte</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cardImage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo du QR Code</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'qrCodeLogoImage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            {/* Couleur du QR Code et Logo */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleur du QR Code</label>
                    <input
                        type="color"
                        name="qrCodeColor"
                        value={cardData.qrCodeColor}
                        onChange={handleChange}
                        className="w-full h-10 rounded-md cursor-pointer"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
                    <input
                        type="color"
                        name="backgroundColor"
                        value={cardData.backgroundColor}
                        onChange={handleChange}
                        className="w-full h-10 rounded-md cursor-pointer"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CO2 économisé (kg)</label>
                <input
                    type="number"
                    name="cardValue"
                    value={cardData.cardValue}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Situation actuelle */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situation Actuelle</label>
                {cardData.cardActual.map((situation, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={situation}
                            onChange={(e) => handleListChange('cardActual', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={() => removeListItem('cardActual', index)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => addListItem('cardActual')}
                    className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                    + Ajouter une situation
                </button>
            </div>

            {/* Propositions */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propositions</label>
                {cardData.cardProposition.map((proposal, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={proposal}
                            onChange={(e) => handleListChange('cardProposition', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={() => removeListItem('cardProposition', index)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => addListItem('cardProposition')}
                    className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                    + Ajouter une proposition
                </button>
            </div>

            {/* Numéro de carte et total
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
                    <input
                        type="number"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total des cartes</label>
                    <input
                        type="number"
                        name="totalCards"
                        value={cardData.totalCards}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>*/}

            <button
                onClick={onSubmit}
                className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
                Confirmer
            </button>
        </div>
    );
}

export default CreateCardForm;
