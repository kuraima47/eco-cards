// CardModal.tsx
import React, {useEffect, useState} from 'react';
import { X } from 'lucide-react';
import { CreateCardForm } from '../CreateCardForm';
import Card from '../Card/Card';
import CardBack from '../Card/CardBack';
import { GameCard } from '../../types/game';

interface CardModalProps {
    initialData: GameCard;
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    onSubmit: (data: Partial<GameCard>) => void;
    currentDeckId: string;
}

export function CardModal({ initialData, isOpen, onClose, mode, currentDeckId, onSubmit }: CardModalProps) {
    console.log("[CardModal] initialData:", initialData);
    const [cardData, setCardData] = useState<GameCard>(initialData);

    useEffect(() => {
        setCardData(initialData);
    }, [initialData]);
    console.log("[CardModal] cardData:", cardData);
    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            console.log("[CardModal] handleSubmit:", cardData);
            onSubmit(cardData);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la création de la carte :", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#ebf7eb] rounded-xl shadow-2xl w-full max-w-[90rem] h-[90vh] flex">
                {/* Formulaire */}
                <div className="w-1/3 bg-white border-r border-gray-100 flex flex-col rounded-l-xl">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Créer une carte</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
                        <CreateCardForm cardData={cardData} setCardData={setCardData} onSubmit={handleSubmit} />
                    </div>
                </div>

                {/* Aperçus */}
                <div className="w-2/3 p-8 flex gap-8 overflow-y-auto justify-center scrollbar-custom">
                    <Card cardData={cardData}/>
                    <CardBack cardData={cardData} />
                </div>
            </div>
        </div>
    );
}

export default CardModal;
