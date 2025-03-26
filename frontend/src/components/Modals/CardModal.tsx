import { X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, defaultCard } from '../../types/game';
import type { CardModalProps } from '../../types/props';
import CardFunc from '../Card/Card';
import CardBack from '../Card/CardBack';
import { CreateCardForm } from '../CreateCardForm';

function CardModalContent({
    cardData,
    setCardData,
    onClose,
    mode,
    handleSubmit,
    categoryIcon,
    categoryColor,
    cardWidth,
    cardHeight
}: {
    cardData: Card;
    setCardData: React.Dispatch<React.SetStateAction<Card>>;
    onClose: () => void;
    mode: 'add' | 'edit';
    handleSubmit: () => void;
    categoryIcon: string;
    categoryColor: string;
    cardWidth: number;
    cardHeight: number;
}) {
    // Ce composant ne contient pas de hooks, juste le rendu
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
                            <CardFunc
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

// Séparation du contenu et de la logique pour éviter les problèmes de hooks
export function CardModal(props: CardModalProps) {
    const { initialData, isOpen, onClose, mode, onSubmit, categoryIcon, categoryColor } = props;

    // Tous les hooks sont maintenant déclarés sans condition
    const [cardData, setCardData] = useState<Card>(initialData || defaultCard);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const handleResize = useCallback(() => {
        setWindowWidth(window.innerWidth);
    }, []);

    // Effet pour synchroniser cardData avec initialData
    useEffect(() => {
        if (initialData) {
            setCardData(initialData);
        }
    }, [initialData]);

    // Effet pour gérer les écouteurs d'événements
    useEffect(() => {
        if (isOpen) {
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [handleResize, isOpen]);

    // Fonction de soumission
    const handleSubmit = useCallback(() => {
        try {
            onSubmit(cardData);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la création/modification de la carte :", error);
        }
    }, [cardData, onSubmit, onClose]);

    // Calculs mémorisés
    const {cardWidth, cardHeight } = useMemo(() => {
        const isLargeScreen = windowWidth >= 1024;
        return {
            isLargeScreen,
            cardWidth: isLargeScreen ? 400 : 250,
            cardHeight: isLargeScreen ? 550 : 400
        };
    }, [windowWidth]);

    // Utilisation d'une condition pour le rendu, mais tous les hooks sont déjà appelés
    return isOpen ? (
        <CardModalContent
            cardData={cardData}
            setCardData={setCardData}
            onClose={onClose}
            mode={mode}
            handleSubmit={handleSubmit}
            categoryIcon={categoryIcon}
            categoryColor={categoryColor}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
        />
    ) : null;
}

// Optimisation avec React.memo
export default React.memo(CardModal, (prevProps, nextProps) => {
    // Vérification sécurisée pour éviter les erreurs de null/undefined
    const prevCardId = prevProps.initialData?.cardId;
    const nextCardId = nextProps.initialData?.cardId;
    
    return (
        prevProps.isOpen === nextProps.isOpen &&
        prevProps.mode === nextProps.mode &&
        prevProps.categoryIcon === nextProps.categoryIcon &&
        prevProps.categoryColor === nextProps.categoryColor &&
        prevCardId === nextCardId
    );
});