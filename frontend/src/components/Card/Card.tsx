// Card.tsx
import React from 'react';
import {
    Activity,
    Lightbulb,
    ShoppingCart,
    Zap,
    Truck,
    Utensils,
    Home,
    ImageOff,
    HelpCircle,
    Sparkles,
} from 'lucide-react';
import { GameCard } from '../../types/game';

interface CategoryStyle {
    color: string;
    icon: React.ElementType;
}

const categoryStyles: { [key: string]: CategoryStyle } = {
    Achat: { color: 'bg-blue-600', icon: ShoppingCart },
    Énergie: { color: 'bg-green-600', icon: Zap },
    Transport: { color: 'bg-red-600', icon: Truck },
    Nourriture: { color: 'bg-yellow-600', icon: Utensils },
    Bâtiment: { color: 'bg-purple-600', icon: Home },
    Inconnue: { color: 'bg-gray-600', icon: HelpCircle },
};

function generateCodeFromCO2(co2Value: number | null): string {
    const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

    if (co2Value === undefined || co2Value === null) {
        return '??';
    }

    const co2Str = String(co2Value);
    if (co2Str.length === 1) {
        let letter1 = getRandomLetter();
        let letter2 = getRandomLetter();
        while (letter1 === letter2) {
            letter2 = getRandomLetter();
        }
        const digit1 = Math.floor(Math.random() * 10);
        return `${letter1}${digit1}/${letter2}${co2Value}`;
    } else {
        const letter = getRandomLetter();
        const part1 = co2Str.slice(0, co2Str.length - 1);
        const part2 = co2Str.slice(-1);
        return `${letter}${part1}/${letter}${part2}`;
    }
}

interface CardProps {
    cardData: GameCard;
    width?: number;
    height?: number;
    hiddenCo2?: boolean;
    isFlipped?: boolean;
    categoryName?: string;
}

export function Card({ cardData, width = 416, height = 650, hiddenCo2 = true, isFlipped = false }: CardProps) {
    console.log("[CardData.tsx]] cardData", cardData);
    const { cardName, category, cardValue, cardActual, cardProposition, cardImage } = cardData;
    const { color, icon: CategoryIcon } = categoryStyles[category] || categoryStyles.Inconnue;
    const encodedCo2Value = generateCodeFromCO2(cardValue);

    // Calculs des dimensions relatives
    const scale = width / 416; // Base scale factor
    const styles = {
        card: {
            width: `${width}px`,
            height: `${height}px`,
            padding: `${8 * scale}px`,
            fontSize: `${14 * scale}px`,
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "",
            backfaceVisibility: "hidden"
        },
        title: {
            fontSize: `${18 * scale}px`,
            lineHeight: `${24 * scale}px`,
            padding: `${6 * scale}px`,
            marginBottom: `${8 * scale}px`,
        },
        image: {
            flex: 1,
            marginBottom: `${12 * scale}px`,
        },
        icon: {
            size: `${20 * scale}px`,
        },
        iconContainer: {
            width: `${32 * scale}px`,
            height: `${32 * scale}px`,
            marginRight: `${8 * scale}px`,
        },
        section: {
            marginBottom: `${12 * scale}px`,
            padding: `${8 * scale}px`,
        },
        sectionTitle: {
            fontSize: `${16 * scale}px`,
            marginBottom: `${4 * scale}px`,
        },
        text: {
            fontSize: `${13 * scale}px`,
            lineHeight: `${18 * scale}px`,
        },
        footer: {
            padding: `${8 * scale}px`,
            marginTop: 'auto',
        },
        footerText: {
            fontSize: `${14 * scale}px`,
        },

    };

    return (
        <div
            className="relative border-4 border-black bg-white flex flex-col shadow-lg overflow-hidden"
            style={styles.card}
        >
            <div className="w-full bg-gray-50 border-b border-gray-200">
                <h2 className="text-center font-bold" style={styles.title}>
                    {cardName}
                </h2>
            </div>

            <div className="flex flex-col flex-grow min-h-0 px-2" style={{ minHeight: 0 }}>
                {cardImage ? (
                    <div className="relative" style={styles.image}>
                        <img
                            className="w-full h-full object-cover rounded-lg border-2 border-black"
                            src={cardImage}
                            alt={cardName}
                        />
                    </div>
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-700 border-2 border-black rounded-lg"
                        style={styles.image}
                    >
                        <ImageOff
                            className="text-white"
                            style={{ width: styles.icon.size, height: styles.icon.size }}
                        />
                    </div>
                )}

                <div className="flex flex-col">
                    <div className="space-y-3">
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
                            <div className="flex-grow">
                                <div style={styles.sectionTitle}>
                                    <strong>Actuellement</strong>
                                </div>
                                {cardActual.map((line, idx) => (
                                    <div key={idx} style={styles.text}>{line}</div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start border-t-2 border-gray-200 pt-3" style={styles.section}>
                            <div
                                className="flex-none bg-gray-600 rounded-full flex items-center justify-center border-2 border-black"
                                style={styles.iconContainer}
                            >
                                <Lightbulb
                                    className="text-white"
                                    style={{ width: styles.icon.size, height: styles.icon.size }}
                                />
                            </div>
                            <div className="flex-grow">
                                <div style={styles.sectionTitle}>
                                    <strong>Propositions</strong>
                                </div>
                                {cardProposition.map((line, idx) => (
                                    <div key={idx} style={styles.text}>{line}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="flex justify-between items-center bg-gray-700 mt-auto"
                style={styles.footer}
            >
                <span
                    className={`px-2 py-1 ${color} text-white rounded-lg shadow-md uppercase flex items-center`}
                    style={styles.footerText}
                >
                    {CategoryIcon && (
                        <CategoryIcon
                            style={{ width: styles.icon.size, height: styles.icon.size }}
                            className="mr-1"
                        />
                    )}
                    {category}
                </span>
                <div
                    className="flex items-center px-2 py-1 bg-green-700 text-white rounded-lg shadow-md"
                    style={styles.footerText}
                >
                    <span className="mr-1">{hiddenCo2 ? encodedCo2Value : cardValue}</span>
                    <Sparkles style={{ width: styles.icon.size, height: styles.icon.size }} />
                </div>
            </div>
        </div>
    );
}

export default Card;