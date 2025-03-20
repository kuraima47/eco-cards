import React, { use, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useQRCode } from "../../hooks/useQRCode";
import { arrayBufferToBase64, formatImageName, toPascalCase } from '../../utils/formatting';
import { ImageFormat } from '../../types';

export interface CardData {
    deckName: string;
    category: string;
    cardNumber: number;
    totalCards: number;
    cardName: string;
    cardValue: number;
    qrCodeColor: string;
    qrCodeLogoImageData: ImageFormat;
    backgroundColor: string;
    width?: number;
    height?: number;
}

interface CardBackProps {
    cardData: CardData;
    categoryColor: string;
    categoryIcon: string;
    width?: number;
    height?: number;
    isForPdf?: boolean;
}

export function CardBack({ cardData, categoryColor, categoryIcon, width = 416, height = 650, isForPdf = false }: CardBackProps) {
    const {
        deckName,
        category,
        cardNumber,
        totalCards,
        cardName,
        cardValue,
        qrCodeColor,
        qrCodeLogoImageData,
        backgroundColor,
    } = cardData;

    const qrCodeLogoImage = formatImageName(qrCodeLogoImageData.data ? arrayBufferToBase64(qrCodeLogoImageData.data) : '', qrCodeLogoImageData.type);

    const { url, qrColor, bgColor, logo, setUrl, setQrColor, setLogo } = useQRCode({
        initialUrl: JSON.stringify({ cardName, category, cardValue, deckName }),
        initialQrColor: qrCodeColor,
        initialLogo: qrCodeLogoImage
    });

    useEffect(() => {
        // ne se déclenche que quand les dépendances changent
        const cardDataUrl = JSON.stringify({ cardName, category, cardValue, deckName });
        setUrl(cardDataUrl);
        setQrColor(qrCodeColor);

        if (qrCodeLogoImage && qrCodeLogoImage !== logo) {
            setLogo(qrCodeLogoImage);
        }
    }, [cardName, category, cardValue, deckName, qrCodeColor, qrCodeLogoImage, logo]);

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
        adjustTextForPdf: {
            marginTop: isForPdf ? "-30px" : undefined,
            padding: isForPdf ? "2px" : undefined,
        },
    };

    const iconName = categoryIcon ? toPascalCase(categoryIcon) : 'Box';
    const CategoryIcon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType || LucideIcons.Box;

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
                    <div style={styles.adjustTextForPdf}>
                        {deckName}
                    </div>
                </div>

                <div
                    className="flex-grow flex items-center justify-center"
                    style={styles.qrContainer}
                >
                    <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-black">
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
                </div>

                <div
                    className={`w-full text-white rounded-lg shadow-md uppercase font-bold`}
                    style={{ ...styles.footer, backgroundColor: categoryColor }}
                >
                    <div className="flex items-center justify-center">
                        <CategoryIcon className="mr-1" style={{ width: styles.icon.size, height: styles.icon.size }} />
                        <span style={styles.adjustTextForPdf}>
                            {category} ({cardNumber}/{totalCards})
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardBack;