import React, { useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useQRCode } from "../../hooks/useQRCode";

export interface CardData {
    deckName: string;
    category: string;
    categoryColor: string;
    cardNumber: number;
    totalCards: number;
    cardName: string;
    description: string;
    cardValue: number;
    cardActual: string[];
    cardProposition: string[];
    qrCodeColor: string;
    qrCodeLogoImage: string;
    backgroundColor: string;
    width?: number;
    height?: number;
}

interface CardBackProps {
    cardData: CardData;
}

export function CardBack({ cardData }: CardBackProps) {
    const {
        deckName,
        category,
        categoryColor,
        cardNumber,
        totalCards,
        cardName,
        description,
        cardValue,
        cardActual,
        cardProposition,
        qrCodeColor,
        qrCodeLogoImage,
        backgroundColor,
        width = 416,
        height = 650,
    } = cardData;

    const { url, qrColor, bgColor, logo, setUrl, setQrColor, setLogo } = useQRCode();

    useEffect(() => {
        const cardDataUrl = JSON.stringify({
            cardName,
            description,
            category,
            cardValue,
            cardActual,
            cardProposition,
            deckName,
            cardNumber,
            totalCards,
        });
        setUrl(cardDataUrl);
        setQrColor(qrCodeColor);
        setLogo(qrCodeLogoImage);
    }, [
        cardName,
        description,
        category,
        cardValue,
        cardActual,
        cardProposition,
        deckName,
        cardNumber,
        totalCards,
        qrCodeColor,
        qrCodeLogoImage,
        setUrl,
        setQrColor,
        setLogo,
    ]);

    // Calculs des dimensions relatives
    const scale = width / 416; // Base scale factor
    const styles = {
        card: {
            width: `${width}px`,
            height: `${height}px`,
            padding: `${16 * scale}px`,
            backgroundColor,
        },
        header: {
            fontSize: `${24 * scale}px`,
            padding: `${12 * scale}px`,
            marginBottom: `${20 * scale}px`,
        },
        qrContainer: {
            marginBottom: `${20 * scale}px`,
        },
        qrCode: {
            size: Math.min(width * 0.6, height * 0.4),
            logoSize: Math.min(width * 0.12, height * 0.08),
        },
        footer: {
            padding: `${12 * scale}px`,
            fontSize: `${18 * scale}px`,
        },
        icon: {
            size: `${24 * scale}px`,
            marginRight: `${8 * scale}px`,
        },
    };

    return (
        <div
            className="relative border-4 border-black shadow-xl flex flex-col"
            style={styles.card}
        >
            <div className="flex flex-col flex-grow items-center">
                <div
                    className="w-full text-center text-white bg-gray-700 rounded-lg shadow-md"
                    style={styles.header}
                >
                    {deckName}
                </div>

                <div
                    className="flex-grow flex items-center justify-center"
                    style={styles.qrContainer}
                >
                    <QRCodeSVG
                        value={url}
                        size={styles.qrCode.size}
                        fgColor={qrColor}
                        bgColor={bgColor}
                        level="H"
                        imageSettings={{
                            src: logo || undefined,
                            height: styles.qrCode.logoSize,
                            width: styles.qrCode.logoSize,
                            excavate: true,
                        }}
                    />
                </div>

                <div
                    className={`w-full ${categoryColor} text-white rounded-lg shadow-md`}
                    style={styles.footer}
                >
                    <div className="flex items-center justify-center">
                        <Leaf style={{ width: styles.icon.size, height: styles.icon.size }} />
                        <span>
                            {category} ({cardNumber}/{totalCards})
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardBack;