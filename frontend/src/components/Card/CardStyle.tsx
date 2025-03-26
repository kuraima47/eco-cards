import type { CSSProperties } from 'react';
import type { CardStyleProps } from '../../types/props';

export const getCardStyles = ({
    width = 416,
    height = 650,
    isFlipped = false,
    isForPdf = false,
}: CardStyleProps) => {
    const scale = width / 416;

    return {
        card: {
            width: `${width}px`,
            height: `${height}px`,
            fontSize: `${14 * scale}px`,
            transformStyle: "preserve-3d" as CSSProperties['transformStyle'],
            transform: isFlipped ? "rotateY(180deg)" : "",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
        },
        title: {
            fontSize: `${18 * scale}px`,
            lineHeight: `${24 * scale}px`,
            padding: isForPdf ? `${16 * scale}px` : `${8 * scale}px`,
            margin: `${8 * scale}px`,
            marginBottom: `0px`,
        },
        paddingCard: {
            padding: isForPdf ? `16px` : `8px`,
        },
        image: {
            flex: 1,
            marginBottom: `${2 * scale}px`,
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
        adjustTextForPdf: {
            marginTop: isForPdf ? "-24px" : undefined,
            padding: isForPdf ? "2px" : undefined,
        },
        footer: {
            padding: `${8 * scale}px`,
            marginTop: 'auto',
        },
        footerText: {
            fontSize: `${14 * scale}px`,
        },
    };
};

export default getCardStyles;