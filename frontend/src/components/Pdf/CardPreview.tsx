import { forwardRef } from 'react';
import type { CardPreviewProps } from '../../types/props';
import { CardFunc } from '../Card/Card';
import { CardBack } from '../Card/CardBack';

export const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
    ({ cards, metrics, categories }, ref) => {
        // Dimensions A4 en mm
        const a4Width = 210;
        const a4Height = 297;
        const margin = 10; // marge en mm
        const spacing = 2; // espacement entre les cartes en mm

        // Calcul de l'espace disponible
        const availableWidth = a4Width - (2 * margin);
        const availableHeight = a4Height - (2 * margin);

        // Traitement des cartes comme des éléments individuels
        const allCards = cards.flatMap(card => [
            { type: 'front', data: card },
            { type: 'back', data: card }
        ]);

        // Calcul du nombre de cartes par rangée
        const cardsPerRow = Math.floor(availableWidth / (metrics.printWidth + spacing));
        const rowHeight = metrics.printHeight + spacing;
        const rowsPerPage = Math.floor(availableHeight / rowHeight);
        const cardsPerPage = cardsPerRow * rowsPerPage;

        // Organisation des cartes en pages
        const pages = [];
        for (let i = 0; i < allCards.length; i += cardsPerPage) {
            pages.push(allCards.slice(i, i + cardsPerPage));
        }

        // Conversion mm to px pour la prévisualisation
        const mmToPx = (mm: number) => (mm * metrics.dpi) / 25.4;
        const previewScale = 0.5; // Échelle de prévisualisation réduite pour l'affichage

        return (
            <div ref={ref} className="space-y-8 w-full overflow-x-auto">
                {pages.map((pageCards, pageIndex) => (
                    <div
                        key={pageIndex}
                        className="bg-white shadow-lg p-4 rounded-lg"
                        style={{
                            width: `${mmToPx(a4Width) * previewScale}px`,
                            height: `${mmToPx(a4Height) * previewScale}px`,
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${cardsPerRow}, ${mmToPx(metrics.printWidth) * previewScale}px)`,
                                gridGap: `${mmToPx(spacing) * previewScale}px`,
                                padding: `${mmToPx(margin) * previewScale}px`,
                                justifyContent: 'start',
                            }}
                        >
                            {pageCards.map((card, index) => {
                                const globalIndex = index + (pageIndex * cardsPerPage);
                                const originalIndex = Math.floor(globalIndex / 2);

                                return (
                                    <div
                                        key={`${card.type}-${index}`}
                                        style={{
                                            width: `${mmToPx(metrics.printWidth) * previewScale}px`,
                                            height: `${mmToPx(metrics.printHeight) * previewScale}px`,
                                        }}
                                    >
                                        {card.type === 'front' ? (
                                            <CardFunc
                                                cardData={card.data}
                                                width={mmToPx(metrics.printWidth) * previewScale}
                                                height={mmToPx(metrics.printHeight) * previewScale}
                                                categoryColor={categories[originalIndex].categoryColor}
                                                categoryIcon={categories[originalIndex].categoryIcon}
                                            />
                                        ) : (
                                            <CardBack
                                                cardData={{
                                                    ...card.data,
                                                    deckName: "Eco Actions",
                                                    cardNumber: originalIndex + 1,
                                                    totalCards: cards.length,
                                                }}
                                                width={mmToPx(metrics.printWidth) * previewScale}
                                                height={mmToPx(metrics.printHeight) * previewScale}
                                                categoryColor={categories[originalIndex].categoryColor}
                                                categoryIcon={categories[originalIndex].categoryIcon}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
);

CardPreview.displayName = 'CardPreview';