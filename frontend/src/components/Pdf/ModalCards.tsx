import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { JSX, useRef, useState } from "react";
import { createRoot } from 'react-dom/client';
import { useAdmin } from "../../hooks/useAdmin";
import { Card, DeckWithCategories } from "../../types/game";
import { CardMetrics } from "../../types/index";
import type { ModalCardsType } from "../../types/props";
import { ensureArray } from "../../utils/formatting.ts";
import { CardFunc } from "../Card/Card";
import { CardBack } from "../Card/CardBack";
import Modal from "../Modals/Modal";
import { CardPreview } from "./CardPreview";

const ModalCards: React.FC<ModalCardsType> = ({ initialData, isOpen, onClose }) => {
    const [metrics, setMetrics] = useState<CardMetrics>({
        originalWidth: 0,
        originalHeight: 0,
        printWidth: 63.5,  // mm
        printHeight: 88.9, // mm
        dpi: 300
    });

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const cardsRef = useRef<HTMLDivElement>(null);
    const admin = useAdmin();

    const flattenAndTransformCards = (deck: DeckWithCategories) => {
        if (!deck) return [];
        return deck.categories.reduce((acc: Card[], category) => {
            const getCardNumber = (cardId: number) => {
                const index = category.cards.findIndex(card => card.cardId === cardId);
                return index !== -1 ? index + 1 : null;
            };
            const transformedCards = (category.cards || []).map((card) => ({
                cardId: card.cardId || 0,
                deckId: category.deckId,
                cardName: card.cardName || '...',
                cardDescription: card.cardDescription || '...',
                cardImageData: card.cardImageData || '',
                qrCodeColor: card.qrCodeColor || '#000000',
                qrCodeLogoImageData: card.qrCodeLogoImageData || '',
                backgroundColor: card.backgroundColor || '#FFFFFF',
                category: category.categoryName,
                cardValue: card.cardValue || 0,
                cardActual: ensureArray(card.cardActual),
                cardProposition: ensureArray(card.cardProposition),
                deckName: admin.getDeck(category.deckId) || '...',
                cardNumber: getCardNumber(card.cardId) || category.cards.length + 1,
                totalCards: category.cards.length + 1 || 0,
                cardCategoryId: category.categoryId || 0,
                selected: false
            }));
            return acc.concat(transformedCards as Card[]);
        }, []);
    };

    const flattenCategories = (deck: DeckWithCategories) => {
        if (!deck) return [];
        return deck.categories
            .map(category => category.cards.map(() => ({
                categoryIcon: category.categoryIcon || 'box', // Valeur par défaut 'box'
                categoryColor: category.categoryColor || '#6B7280' // Valeur par défaut gris
            })))
            .flat();
    };

    const flattenCards = (deck: DeckWithCategories) => {
        if (!deck) return [];
        return flattenAndTransformCards(deck);
    };

    // Conversion mm to px
    const mmToPx = (mm: number) => (mm * metrics.dpi) / 25.4;

    async function captureComponentPreview(component: JSX.Element): Promise<string> {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = `${mmToPx(metrics.printWidth)}px`;
        container.style.height = `${mmToPx(metrics.printHeight)}px`;
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(component);

        // Attendre le prochain cycle d'animation
        await new Promise((resolve) => requestAnimationFrame(resolve));
        // Délai supplémentaire pour s'assurer que le rendu est complet
        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(container, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "transparent",
            width: mmToPx(metrics.printWidth),
            height: mmToPx(metrics.printHeight),
            logging: false,
            imageTimeout: 15000
        });

        root.unmount();
        document.body.removeChild(container);
        return canvas.toDataURL("image/png", 0.4);
    }

    const generatePDF = async () => {
        setLoading(true);
        setProgress(0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
    
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const spacing = 2;
    
        const maxCardWidth = metrics.printWidth;
        const maxCardHeight = metrics.printHeight;
    
        const cards = flattenCards(initialData);
        const categories = flattenCategories(initialData);
    
        let step = 0;
        const totalSteps = cards.length * 2; // recto + verso
    
        let pageIndex = 0;
        let isFirstPage = true;
        
        while (pageIndex < cards.length) {
            if (!isFirstPage) {
                pdf.addPage();
            } else {
                pdf.text(
                    `Origine: (${margin}, ${margin}) | Dimensions: ${maxCardWidth}x${maxCardHeight} mm | Espacement: ${spacing} mm`,
                    2, // x position (tout à gauche)
                    5  // y position (tout en haut)
                );
                isFirstPage = false;
            }
    
            let currentX = margin;
            let currentY = margin;
            const cardsOnPage = [];
    
            // Placement des rectos
            while (pageIndex < cards.length) {
                const card = cards[pageIndex];
    
                if (currentY + maxCardHeight > pageHeight - margin) {
                    break;
                }
    
                cardsOnPage.push({ card, x: currentX, y: currentY });
    
                currentX += maxCardWidth + spacing;
                if (currentX + maxCardWidth > pageWidth - margin) {
                    currentX = margin;
                    currentY += maxCardHeight + spacing;
                }
    
                pageIndex++;
            }
    
            // Ajouter les cartes recto
            for (const { card, x, y } of cardsOnPage) {
                const frontImgData = await captureComponentPreview(
                    <CardFunc
                        cardData={card}
                        width={mmToPx(maxCardWidth)}
                        height={mmToPx(maxCardHeight)}
                        hiddenCo2={true}
                        categoryIcon={categories[cards.indexOf(card)].categoryIcon}
                        categoryColor={categories[cards.indexOf(card)].categoryColor}
                        isForPdf={true}
                    />
                );
                pdf.addImage(frontImgData, 'JPEG', x, y, maxCardWidth, maxCardHeight);
                step++;
                setProgress(Math.round((step / totalSteps) * 100));
            }
    
            // Nouvelle page pour les versos
            pdf.addPage();
    
            for (const { card, x, y } of cardsOnPage) {
                const backImgData = await captureComponentPreview(
                    <CardBack
                        cardData={{
                            ...card,
                            deckName: initialData.deckName,
                            cardNumber: cards.indexOf(card) + 1,
                            totalCards: cards.length,
                        }}
                        width={mmToPx(maxCardWidth)}
                        height={mmToPx(maxCardHeight)}
                        categoryIcon={categories[cards.indexOf(card)].categoryIcon}
                        categoryColor={categories[cards.indexOf(card)].categoryColor}
                        isForPdf={true}
                    />
                );
    
                // Mirroring pour aligner le verso au recto
                const flippedX = pageWidth - margin - maxCardWidth - (x - margin);
                pdf.addImage(backImgData, 'JPEG', flippedX, y, maxCardWidth, maxCardHeight);
                step++;
                setProgress(Math.round((step / totalSteps) * 100));
            }
        }
    
        pdf.save('cartes-eco_'+initialData.deckName+'.pdf');
        setLoading(false);
    };
    

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Générateur de PDF des cartes"
        >
            <div className="relative">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Largeur d'impression (mm)
                            </label>
                            <input
                                type="number"
                                value={metrics.printWidth}
                                onChange={(e) => setMetrics(prev => ({ ...prev, printWidth: Number(e.target.value) }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Hauteur d'impression (mm)
                            </label>
                            <input
                                type="number"
                                value={metrics.printHeight}
                                onChange={(e) => setMetrics(prev => ({ ...prev, printHeight: Number(e.target.value) }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Résolution (DPI)
                            </label>
                            <input
                                type="number"
                                value={metrics.dpi}
                                onChange={(e) => setMetrics(prev => ({ ...prev, dpi: Number(e.target.value) }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                        <CardPreview ref={cardsRef} cards={flattenCards(initialData)} metrics={metrics} categories={flattenCategories(initialData)} />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={generatePDF}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger le PDF
                        </button>
                    </div>
                </div>

                {/* Overlay de chargement */}
                {loading && (
                    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="p-6 bg-white rounded-lg shadow-xl">
                            <div className="flex flex-col items-center">
                                <p className="text-lg font-medium mb-4">Génération du PDF en cours...</p>
                                <div className="mb-4 w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-gray-500">{progress}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default ModalCards;
