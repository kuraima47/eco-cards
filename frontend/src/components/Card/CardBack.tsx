import React, { useCallback, useEffect, useMemo } from 'react';
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
    qrCodeLogoImageData?: ImageFormat;
    backgroundColor: string;
    width?: number;
    height?: number;
}

interface CardBackProps {
    cardData: CardData;
    categoryColor?: string;
    categoryIcon?: string;
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

    const qrCodeLogoImage = useMemo(() => 
        qrCodeLogoImageData 
            ? formatImageName(
                qrCodeLogoImageData.data 
                    ? arrayBufferToBase64(qrCodeLogoImageData.data)
                    : '',
                qrCodeLogoImageData.type
            ) 
            : "",
    [qrCodeLogoImageData]);

    const initialUrl = useMemo(() => 
        JSON.stringify({ cardName, category, cardValue, deckName }),
    [cardName, category, cardValue, deckName]);

    const { url, qrColor, bgColor, logo, setUrl, setQrColor, setLogo } = useQRCode({
        initialUrl,
        initialQrColor: qrCodeColor,
        initialLogo: qrCodeLogoImage
    });

    // Utiliser useCallback pour créer une fonction mémorisée qui met à jour les données QR
    const updateQRData = useCallback(() => {
        const cardDataUrl = JSON.stringify({ cardName, category, cardValue, deckName });
        setUrl(cardDataUrl);
        setQrColor(qrCodeColor);

        if (qrCodeLogoImage && qrCodeLogoImage !== logo) {
            setLogo(qrCodeLogoImage);
        }
    }, [cardName, category, cardValue, deckName, qrCodeColor, qrCodeLogoImage, logo, setUrl, setQrColor, setLogo]);

    useEffect(() => {
        updateQRData();
    }, [updateQRData]);

    // Mémoriser les styles pour éviter des recalculs à chaque rendu
    const styles = useMemo(() => {
        const scale = width / 416; // Base scale factor
        return {
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
    }, [width, height, backgroundColor, isForPdf]);

    // Mémoriser l'icône de catégorie pour éviter des recherches inutiles
    const CategoryIcon = useMemo(() => {
        const iconName = categoryIcon ? toPascalCase(categoryIcon) : 'Box';
        return (LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType) || LucideIcons.Box;
    }, [categoryIcon]);

    // Mémoriser le contenu du QR Code
    const qrCodeContent = useMemo(() => (
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
    ), [url, qrColor, bgColor, logo, styles.qrCode.size, styles.qrCode.logoSize]);

    // Mémoriser le contenu du footer
    const footerContent = useMemo(() => (
        <div className="flex items-center justify-center">
            <CategoryIcon className="mr-1" style={{ width: styles.icon.size, height: styles.icon.size }} />
            <span style={styles.adjustTextForPdf}>
                {category} ({cardNumber}/{totalCards})
            </span>
        </div>
    ), [CategoryIcon, category, cardNumber, totalCards, styles.icon.size, styles.adjustTextForPdf]);

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
                        {qrCodeContent}
                    </div>
                </div>

                <div
                    className={`w-full text-white rounded-lg shadow-md uppercase font-bold`}
                    style={{ ...styles.footer, backgroundColor: categoryColor }}
                >
                    {footerContent}
                </div>
            </div>
        </div>
    );
}

// Utiliser React.memo pour éviter les rendus inutiles si les props n'ont pas changé
export default React.memo(CardBack);