import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

import { CardUploader } from '../components/CardUploader';
import { CardPreview } from '../components/CardPreview';
import { CardImage, CardMetrics } from '../types';

function PDFpoc() {
    const [cards, setCards] = useState<CardImage[]>([]);
    const [metrics, setMetrics] = useState<CardMetrics>({
        originalWidth: 0,
        originalHeight: 0,
        printWidth: 63.5,  // mm
        printHeight: 88.9, // mm
        dpi: 300
    });

    const cardsRef = useRef<HTMLDivElement>(null);

    const handleImagesUploaded = (newCards: CardImage[]) => {
        setCards(newCards);
        if (newCards.length > 0) {
            setMetrics(prev => ({
                ...prev,
                originalWidth: newCards[0].width,
                originalHeight: newCards[0].height
            }));
        }
    };

    const generatePDF = async () => {
        if (!cardsRef.current) return;

        const canvas = await html2canvas(cardsRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        });

        // Créer un PDF A4 (210 x 297 mm)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
        const margin = 10; // marge de 10mm

        // Calculer combien de cartes peuvent tenir sur une page
        const cardsPerRow = Math.floor((pageWidth - 2 * margin) / (metrics.printWidth + 2));
        const cardsPerColumn = Math.floor((pageHeight - 2 * margin) / (metrics.printHeight + 2));
        const cardsPerPage = cardsPerRow * cardsPerColumn;

        // Créer un tableau de cartes répétées pour remplir la page
        const repeatedCards: CardImage[] = [];
        while (repeatedCards.length < cardsPerPage) {
            repeatedCards.push(...cards);
        }
        repeatedCards.length = cardsPerPage; // Limiter au nombre exact de cartes qui tiennent sur la page

        // Dessiner les cartes sur le PDF
        let currentX = margin;
        let currentY = margin;

        // Ajouter les métriques en haut de la page
        pdf.setFontSize(8);
        pdf.text(`Format: ${metrics.printWidth}mm x ${metrics.printHeight}mm - DPI: ${metrics.dpi}`, margin, 5);

        repeatedCards.forEach((_, index) => {
            if (currentX + metrics.printWidth > pageWidth - margin) {
                currentX = margin;
                currentY += metrics.printHeight + 2;
            }

            // Ajouter l'image
            pdf.addImage(
                cards[index % cards.length].preview,
                'PNG',
                currentX,
                currentY,
                metrics.printWidth,
                metrics.printHeight
            );

            currentX += metrics.printWidth + 2;
        });

        pdf.save('cartes.pdf');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-4">Générateur de Planche de Cartes</h1>
    
                    <div className="mb-6">
                        <CardUploader onImagesUploaded={handleImagesUploaded} />
                    </div>
    
                    {cards.length > 0 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="printWidth" className="block text-sm font-medium text-gray-700">
                                        Largeur d'impression (mm)
                                    </label>
                                    <input
                                        id="printWidth"
                                        type="number"
                                        value={metrics.printWidth}
                                        onChange={(e) => setMetrics(prev => ({ ...prev, printWidth: Number(e.target.value) }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="printHeight" className="block text-sm font-medium text-gray-700">
                                        Hauteur d'impression (mm)
                                    </label>
                                    <input
                                        id="printHeight"
                                        type="number"
                                        value={metrics.printHeight}
                                        onChange={(e) => setMetrics(prev => ({ ...prev, printHeight: Number(e.target.value) }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="dpi" className="block text-sm font-medium text-gray-700">
                                        Résolution (DPI)
                                    </label>
                                    <input
                                        id="dpi"
                                        type="number"
                                        value={metrics.dpi}
                                        onChange={(e) => setMetrics(prev => ({ ...prev, dpi: Number(e.target.value) }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
    
                            <div className="border rounded-lg p-4">
                                <CardPreview ref={cardsRef} cards={cards} metrics={metrics} />
                            </div>
    
                            <button
                                onClick={generatePDF}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger le PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    
}

export default PDFpoc;