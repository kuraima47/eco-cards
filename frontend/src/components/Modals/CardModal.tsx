import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { CreateCardForm } from '../CreateCardForm';
import Card from '../Card/Card';
import CardBack from '../Card/CardBack';
import { defaultCard, GameCard } from '../../types/game';

interface CardModalProps {
    initialData?: GameCard;
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    onSubmit: (data: Partial<GameCard>) => void;
    currentDeckId: string;
    categoryIcon: string;
    categoryColor: string;
}

// ✅ On évite de rendre le composant si isOpen est false AVANT les hooks
export function CardModal({ initialData, isOpen, onClose, mode, currentDeckId, onSubmit, categoryIcon, categoryColor }: CardModalProps) {

    const [cardData, setCardData] = useState<GameCard>(defaultCard);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        if (initialData) {
            setCardData(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async () => {
        try {
            console.log("[CardModal] handleSubmit:", cardData);
            onSubmit(cardData);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la création de la carte :", error);
        }
    };

    const isLargeScreen = windowWidth >= 1024;
    const cardWidth = isLargeScreen ? 400 : 250;
    const cardHeight = isLargeScreen ? 550 : 400;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-16 px-4 pb-4">
            <div className="bg-[#ebf7eb] rounded-xl shadow-2xl w-full max-w-[90rem] h-[calc(90vh-64px)] flex">
                {/* Formulaire */}
                <div className="w-1/3 bg-white border-r border-gray-100 flex flex-col rounded-l-xl">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{mode === "add" ? "Créer une carte" : "Modifier une carte"}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
                        <CreateCardForm cardData={cardData} setCardData={setCardData} onSubmit={handleSubmit} />
                    </div>
                </div>

                {/* Aperçus */}
                <div className="w-2/3 p-4 lg:p-8 overflow-y-auto justify-center scrollbar-custom">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <div className="mb-6 lg:mb-0 transform scale-90 lg:scale-100">
                            <Card
                                cardData={cardData}
                                categoryColor={categoryColor}
                                categoryIcon={categoryIcon}
                                width={cardWidth}
                                height={cardHeight}
                            />
                        </div>
                        <div className="transform scale-90 lg:scale-100">
                            <CardBack
                                cardData={cardData}
                                categoryColor={categoryColor}
                                categoryIcon={categoryIcon}
                                width={cardWidth}
                                height={cardHeight}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardModal;
