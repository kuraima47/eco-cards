import { X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../../types/game';
import type { ViewCardModalProps } from '../../types/props';
import CardFunc from '../Card/Card';
import CardBack from '../Card/CardBack';

function ViewCardModal({
    initialData,
    isOpen,
    onClose,
    categoryIcon,
    categoryColor
}: ViewCardModalProps) {
    // Utiliser useState avec une fonction d'initialisation pour éviter les calculs inutiles
    const [cardData, setCardData] = useState<Card>(() => initialData || {} as Card);
    const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);

    // Calculer les dimensions de la carte une seule fois par changement de taille d'écran
    const { cardWidth, cardHeight } = useMemo(() => {
        if (windowWidth < 600) {
            // Très petits écrans (téléphones)
            return { cardWidth: 200, cardHeight: 300 };
        } else if (windowWidth < 1024) {
            // Écrans moyens (tablettes)
            return { cardWidth: 250, cardHeight: 400 };
        } else {
            // Grands écrans (desktop)
            return { cardWidth: 400, cardHeight: 550 };
        }
    }, [windowWidth]);

    // Mettre à jour cardData uniquement si initialData change
    useEffect(() => {
        if (initialData) {
            setCardData(initialData);
        }
    }, [initialData]);

    // Utiliser useCallback pour éviter de recréer la fonction à chaque rendu
    const handleResize = useCallback(() => {
        setWindowWidth(window.innerWidth);
    }, []);

    // Ajouter/supprimer les event listeners de façon optimisée
    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    // Court-circuit pour éviter de rendre le modal quand il est fermé

    // Mémoriser le contenu du layout en fonction de la taille d'écran
    const modalContent = useMemo(() => (
        <div className={`flex ${windowWidth < 600 ? 'flex-col' : 'flex-row'} gap-6 items-center justify-center`}>
            <div className={windowWidth < 600 ? 'mb-6' : ''}>
                <CardFunc
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
    ), [cardData, categoryIcon, categoryColor, cardWidth, cardHeight, windowWidth]);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#ebf7eb] rounded-xl shadow-2xl max-w-4xl flex flex-col items-center">
                <div className="w-full flex justify-between">
                    <div></div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 md:p-8 w-full">
                    {modalContent}
                </div>
            </div>
        </div>
    );
}

// Exporter le composant optimisé par défaut
export default React.memo(ViewCardModal, (prevProps, nextProps) => {
    // Vérifier d'abord si les deux objets initialData existent
    if (!prevProps.initialData || !nextProps.initialData) {
        // Si l'un d'eux est null/undefined, comparer s'ils sont égaux
        return prevProps.initialData === nextProps.initialData &&
            prevProps.isOpen === nextProps.isOpen &&
            prevProps.categoryIcon === nextProps.categoryIcon &&
            prevProps.categoryColor === nextProps.categoryColor;
    }

    // comparer seulement les props qui affectent le rendu visuel
    return (
        prevProps.isOpen === nextProps.isOpen &&
        prevProps.initialData.cardId === nextProps.initialData.cardId &&
        prevProps.categoryIcon === nextProps.categoryIcon &&
        prevProps.categoryColor === nextProps.categoryColor
    );
});
