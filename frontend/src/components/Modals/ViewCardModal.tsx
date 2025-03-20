// CardModal.tsx
import React, { useEffect, useState } from 'react';
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
    categoryIcon: string;
    categoryColor: string;
}

export function CardModal({ initialData, isOpen, onClose, mode, currentDeckId, onSubmit, categoryIcon, categoryColor }: CardModalProps) {
    console.log("[CardModal] initialData:", initialData);
    const [cardData, setCardData] = useState<GameCard>(initialData);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    let cardWidth, cardHeight;
    if (windowWidth < 600) {
        // Très petits écrans (téléphones)
        cardWidth = 200;
        cardHeight = 300;
    } else if (windowWidth < 1024) {
        // Écrans moyens (tablettes)
        cardWidth = 250;
        cardHeight = 400;
    } else {
        // Grands écrans (desktop)
        cardWidth = 400;
        cardHeight = 550;
    }

    useEffect(() => {
        if (initialData) {
            setCardData(initialData);
        }
    }, [initialData]);
    
    console.log("[CardModal] cardData:", cardData);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [windowWidth]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#ebf7eb] rounded-xl shadow-2xl max-w-4xl flex flex-col items-center">
                <div className="w-full flex justify-between">
                    <div></div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 md:p-8 w-full">
                    <div className={`flex ${windowWidth < 600 ? 'flex-col' : 'flex-row'} gap-6 items-center justify-center`}>
                        <div className={windowWidth < 600 ? 'mb-6' : ''}>
                            <Card
                                cardData={cardData}
                                categoryIcon={categoryIcon}
                                categoryColor={categoryColor}
                                hiddenCo2={false}
                                width={cardWidth}
                                height={cardHeight}
                            />
                        </div>
                        <div>
                            <CardBack
                                cardData={cardData}
                                categoryIcon={categoryIcon}
                                categoryColor={categoryColor}
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
