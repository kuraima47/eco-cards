// Card.tsx
import React, { useState } from 'react';
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
    Search,
    X
} from 'lucide-react';
import { GameCard } from '../../../types/game';
import CardZoomedInTableModal from './CardZoomedInTableModal';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 180;

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

    const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z

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
    isFlipped: boolean;
    categoryName?: string;
    phase: number;
    co2Estimation?: number;
    acceptanceLevel?: 'high' | 'medium' | 'low' | null;
}

export function Card({ cardData, width = MIN_WIDTH, height = MIN_HEIGHT, hiddenCo2 = true, isFlipped = false, categoryName, phase, co2Estimation, acceptanceLevel }: CardProps) {
    console.log("[Card] cardData:", cardData, cardData.cardActual);
    console.log("[Card] cardData:", cardData, cardData.cardActual);

    const [showModal, setShowModal] = useState(false);
    const encodedCo2Value = generateCodeFromCO2(cardData.cardValue);

    const finalWidth = Math.max(width, MIN_WIDTH); // Minimum width de 100px
    const finalHeight = Math.max(height, MIN_HEIGHT); // Minimum height de 150px

    return (
        <div className={`relative border-4 border-black bg-white transform transition duration-300 flex flex-col shadow-lg h-full ${isFlipped ? "rotate-y-180" : ""}`}
            style={{
                width: finalWidth,
                height: finalHeight,
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "",
                backfaceVisibility: "hidden"
            }}>

            <button
                className="absolute top-1 right-1 z-20 bg-white/80 hover:bg-white rounded-full p-1 shadow-md border border-black"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                }}
            >
                <Search size={14} className="text-green-800" />
            </button>
            {/* Titre */}
            <div className="w-full px-2 my-2">
                <div className="relative w-full flex justify-between items-center px-2 py-1 text-gray-100 bg-gray-700 border-2 border-black rounded-md shadow-lg">
                    {/* Titre à gauche */}
                    <div className="text-sm font-bold truncate max-w-[70%]">
                        <span className="relative z-10">{cardData.cardName}</span>
                    </div>

                    {/* Valeur CO2 à droite */}
                    <div className="flex items-center px-2 py-0.5 bg-green-700 text-white text-xs rounded-lg shadow-md font-bold">
                        <span className="mr-1">{hiddenCo2 ? encodedCo2Value : cardData.cardValue}</span>
                        <Sparkles className={`w-3 h-3`} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-grow min-h-0 px-2">
                <div className="pb-2 flex flex-col bg-white flex-grow min-h-0">
                    <div className="flex items-start text-black mb-3">
                        <div className="flex-grow self-start break-words overflow-hidden text-xs">
                            <strong>Actuellement</strong>
                            <br />
                            <div className="line-clamp-2">
                                {cardData.cardActual}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start text-black border-t-2 border-gray-600 pt-2">
                        <div className="flex-grow self-start break-words overflow-hidden text-xs">
                            <strong>Propositions</strong>
                            <br />
                            <div className="line-clamp-2">
                                {cardData.cardProposition}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CardZoomedInTableModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                cardData={cardData}
                categoryName={categoryName}
                phase={phase}
                co2Estimation={co2Estimation}
                acceptanceLevel={acceptanceLevel}
            />
        </div>
    );
}

export default Card;
