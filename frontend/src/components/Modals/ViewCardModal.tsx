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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#ebf7eb] rounded-xl shadow-2xl w-full max-w-[90rem] h-[90vh] flex flex-col items-center">
                <div className="w-full flex justify-between">
                    <div></div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="w-2/3 p-8 flex gap-8 overflow-y-auto justify-center scrollbar-custom">
                    <Card cardData={cardData}/>
                    <CardBack cardData={cardData}/>
                </div>
            </div>
        </div>
    );
}

export default CardModal;
