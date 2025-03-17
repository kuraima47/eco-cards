import { CardPreview } from "./CardPreview";
import { Download } from "lucide-react";
import { JSX, useRef, useState } from "react";
import Modal from "../Modals/Modal";
import { CardMetrics, Deck } from "../../types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { CardBack, CardData } from "../Card/CardBack";
import Card from "../Card/Card";
import { useAdmin } from "../../hooks/useAdmin.ts";
import { createRoot } from 'react-dom/client';

interface ModalCards {
    initialData: Deck;
    isOpen: boolean;
    onClose: () => void;
}

export function ModalCards({ initialData, isOpen, onClose }: ModalCards) {
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

    const flattenAndTransformCards = (deck: Deck) => {
        if (!deck) return [];
        return deck.categories.reduce((acc: CardData[], category) => {
            const getCardNumber = (cardId: number) => {
                const index = category.cards.findIndex(card => card.cardId === cardId);
                return index !== -1 ? index + 1 : null;
            };
            const transformedCards = (category.cards || []).map((card) => ({
                cardId: card.cardId || 0,
                deckId: category.deckId,
                title: card.cardName || '...',
                description: card.cardDescription || '...',
                cardImage: card.cardImage || '',
                qrCodeColor: card.qrCodeColor || '#000000',
                qrCodeLogoImage: card.qrCodeLogoImage || '',
                backgroundColor: card.backgroundColor || '#FFFFFF',
                textColor: card.textColor || '#000000',
                category: category.categoryName,
                co2Saved: card.cardValue || 0,
                currentSituation: card.cardActual ? [card.cardActual] : [],
                proposals: card.cardProposition ? [card.cardProposition] : [],
                deckName: admin.getDeck(category.deckId) || '...',
                cardNumber: getCardNumber(card.cardId) || category.cards.length + 1,
                totalCards: category.cards.length + 1 || 0
            }));
            return acc.concat(transformedCards);
        }, []);
    };

    const flattenCards = (deck: Deck) => {
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
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            width: mmToPx(metrics.printWidth),
            height: mmToPx(metrics.printHeight)
        });

        root.unmount();
        document.body.removeChild(container);
        return canvas.toDataURL("image/png");
    }

    const generatePDF = async () => {
        setLoading(true);
        setProgress(0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const spacing = 2;

        const cards = flattenCards(initialData);
        let currentX = margin;
        let currentY = margin;
        let pageCount = 1;
        const totalSteps = cards.length * 2; // front et back pour chaque carte
        let step = 0;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            // Passage à la ligne si besoin pour la face avant
            if (currentX + metrics.printWidth > pageWidth - margin) {
                currentX = margin;
                currentY += metrics.printHeight + spacing;
            }
            if (currentY + metrics.printHeight > pageHeight - margin) {
                pdf.addPage();
                pageCount++;
                currentX = margin;
                currentY = margin;
            }

            // Capture de la face avant
            const frontImgData = await captureComponentPreview(
                <Card
                    cardData={card}
                    width={mmToPx(metrics.printWidth)}
                    height={mmToPx(metrics.printHeight)}
                    hiddenCo2={false}
                />
            );
            pdf.addImage(
                frontImgData,
                'PNG',
                currentX,
                currentY,
                metrics.printWidth,
                metrics.printHeight
            );
            step++;
            setProgress(Math.round((step / totalSteps) * 100));

            // Passage à la position suivante pour la face arrière
            currentX += metrics.printWidth + spacing;
            if (currentX + metrics.printWidth > pageWidth - margin) {
                currentX = margin;
                currentY += metrics.printHeight + spacing;
                if (currentY + metrics.printHeight > pageHeight - margin) {
                    pdf.addPage();
                    pageCount++;
                    currentX = margin;
                    currentY = margin;
                }
            }

            // Capture de la face arrière
            const backImgData = await captureComponentPreview(
                <CardBack cardData={{
                    ...card,
                    deckName: "Eco Actions",
                    categoryColor: "bg-green-600",
                    cardNumber: i + 1,
                    totalCards: cards.length,
                    qrCodeColor: "#000000",
                    qrCodeLogoImage: "",
                    backgroundColor: "#ffffff",
                    width: mmToPx(metrics.printWidth),
                    height: mmToPx(metrics.printHeight)
                }} />
            );
            pdf.addImage(
                backImgData,
                'PNG',
                currentX,
                currentY,
                metrics.printWidth,
                metrics.printHeight
            );
            step++;
            setProgress(Math.round((step / totalSteps) * 100));

            // Passage à la position suivante pour la prochaine carte
            currentX += metrics.printWidth + spacing;
        }

        pdf.save('cartes-eco.pdf');
        setLoading(false);
    };

    console.log(flattenCards(initialData));

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
                        <CardPreview ref={cardsRef} cards={flattenCards(initialData)} metrics={metrics} />
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="p-4 bg-white rounded shadow">
                            <p className="mb-2">Génération du PDF en cours... {progress}%</p>
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default ModalCards;
