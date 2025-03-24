import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ImageOff, Activity, Lightbulb, Sparkles } from 'lucide-react';
import { GameCard } from '../../types/game';
import { generateCodeFromCO2, formatImageName, arrayBufferToBase64 } from '../../utils/formatting';
import CategoryPreview from './CategoryPreview';
import getCardStyles from './CardStyle';

interface CardProps {
    cardData: GameCard;
    width?: number;
    height?: number;
    hiddenCo2?: boolean;
    isFlipped?: boolean;
    categoryIcon?: string;
    categoryColor?: string;
    isForPdf?: boolean;
}

export function Card({ cardData, width = 416, height = 650, hiddenCo2 = true, isFlipped = false, categoryIcon, categoryColor, isForPdf = false }: CardProps) {
    const { cardName, cardValue, cardActual, cardProposition, cardImageData } = cardData;
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const encodedCo2Value = useMemo(() =>
        hiddenCo2 ? generateCodeFromCO2(cardValue) : '',
        [hiddenCo2, cardValue]
    );

    useEffect(() => {
        if (textRef.current) {
            const textHeight = textRef.current.clientHeight;
            const maxAvailableHeight = height * 0.65; // 65% de la carte max pour le contenu
            const newImageHeight = Math.max(100, maxAvailableHeight - textHeight); // Min 100px

            // N'appliquer un nouveau état que si l'imageHeight a changé
            if (newImageHeight !== imageHeight) {
                setImageHeight(newImageHeight);
            }
        }
    }, [cardActual, cardProposition, height, imageHeight]);

    const cardImage = useMemo(() =>
        formatImageName(
            cardImageData?.data ? arrayBufferToBase64(cardImageData.data) : '',
            cardImageData?.type || ''
        ),
        [cardImageData]
    );

    const styles = useMemo(() =>
        getCardStyles({
            width,
            height,
            isFlipped,
            isForPdf
        }),
        [width, height, isFlipped, isForPdf]
    );

    const renderContent = (content: string[] | string) => {
        // C'est un tableau JavaScript normal
        if (Array.isArray(content)) {
            if (typeof content[0] === 'string' && content[0].trim().startsWith('[') && content[0].trim().endsWith(']')) {
                try {
                    const parsedContent = JSON.parse(content[0]);
                    
                    if (Array.isArray(parsedContent)) {
                        // Limiter à 4 éléments maximum
                        
                        return (
                            <div className="list-disc">
                                {parsedContent.map((item, index) => (
                                    <div key={index} className="text-gray-700 ">{item}</div>
                                ))}
                            </div>
                        );
                    }
                } catch (e) {
                    // Si la conversion échoue, on traite comme une str simple
                    console.warn("Failed to parse JSON string:", content);
                }
            }
    
            return (
                <div className="list-disc">
                    {content.map((item, index) => (
                        <div key={index} className="text-gray-700 ">{item}</div>
                    ))}
                </div>
            );
        }
        
        // Pour les chaînes simples, utiliser line-clamp-4 pour limiter à 4 lignes
        return <p className="line-clamp-4 text-gray-700">{content}</p>;
    };

    // Mémoriser les sections de rendu pour éviter de recréer des éléments JSX à chaque rendu
    const renderImage = useMemo(() => {
        if (cardImage) {
            return (
                <div className="relative" style={{ ...styles.image, height: imageHeight ?? 'auto' }}>
                    <img
                        className="w-full h-full object-cover rounded-lg border-2 border-black"
                        src={cardImage}
                        alt={cardName}
                    />
                </div>
            );
        }

        return (
            <div
                className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-700 border-2 border-black rounded-lg"
                style={styles.image}
            >
                <ImageOff
                    className="text-white"
                    style={{ width: styles.icon.size, height: styles.icon.size }}
                />
            </div>
        );
    }, [cardImage, cardName, imageHeight, styles.image, styles.icon.size]);

    return (
        <div
            className="relative border-4 border-black bg-white flex flex-col shadow-lg overflow-hidden" style={styles.card}
        >

            <div
                className="text-center text-white bg-gray-700 rounded-lg shadow-md border-2 border-black"
                style={styles.title}
            >
                <div style={styles.adjustTextForPdf}>{cardName}</div>
            </div>

            <div className="flex flex-col flex-grow min-h-0" style={{ ...styles.paddingCard, minHeight: 0 }}>
                {renderImage}

                <div ref={textRef} className="flex flex-col">
                    <div className="flex items-start" style={styles.section}>
                        <div
                            className="flex-none bg-gray-600 rounded-full flex items-center justify-center border-2 border-black"
                            style={styles.iconContainer}
                        >
                            <Activity
                                className="text-white"
                                style={{ width: styles.icon.size, height: styles.icon.size }}
                            />
                        </div>
                        <div className="flex-grow" style={styles.adjustTextForPdf}>
                            <div style={styles.sectionTitle}>
                                <strong>Actuellement</strong>
                            </div>
                            {renderContent(cardActual)}
                        </div>
                    </div>

                    <div className="flex items-start border-t-2 border-gray-200" style={styles.section}>
                        <div
                            className="flex-none bg-gray-600 rounded-full flex items-center justify-center border-2 border-black"
                            style={styles.iconContainer}
                        >
                            <Lightbulb
                                className="text-white"
                                style={{ width: styles.icon.size, height: styles.icon.size }}
                            />
                        </div>
                        <div className="flex-grow" style={styles.adjustTextForPdf}>
                            <div style={styles.sectionTitle}>
                                <strong>Propositions</strong>
                            </div>
                            {renderContent(cardProposition)}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="flex justify-between items-center bg-gray-700 mt-auto"
                style={styles.footer}
            >
                <CategoryPreview
                    categoryName={cardData.category}
                    categoryIcon={categoryIcon}
                    categoryColor={categoryColor}
                    className=" py-1 rounded-lg shadow-md uppercase flex items-center font-bold"
                    style={styles.footerText}
                    iconSizePx={styles.icon.size}
                    isForPdf={isForPdf}
                />
                <div
                    className="flex items-center px-2 py-1 bg-green-700 text-white rounded-lg shadow-md"
                    style={styles.footerText}
                >
                    <span className="mr-1" style={styles.adjustTextForPdf}>{hiddenCo2 ? encodedCo2Value : cardValue}</span>
                    <Sparkles style={{ width: styles.icon.size, height: styles.icon.size }} />
                </div>
            </div>
        </div>
    );
}

export default React.memo(Card);