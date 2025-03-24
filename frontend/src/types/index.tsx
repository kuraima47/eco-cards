import { RefObject } from 'react';

export interface ImageFormat {
    data?: Uint8Array;
    type?: string;
}
export interface QRCodeFormProps {
    url: string;
    setUrl: (url: string) => void;
    bgColor: string;
    setBgColor: (color: string) => void;
    qrColor: string;
    setQrColor: (color: string) => void;
    logo: string | null;
    fileInputRef: RefObject<HTMLInputElement>;
    handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleLogoDelete: () => void;
    downloadQRCode: () => void;
}
export interface CardImage {
    file: File;
    preview: string;
    width: number;
    height: number;
}
    
export interface CardMetrics {
    originalWidth: number;
    originalHeight: number;
    printWidth: number;
    printHeight: number;
    dpi: number;
}

export interface Deck {
    id: string;
    deckName: string;
    categories: Category[];
}

export interface Category {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    deckId: string;
    cards: Card[];
}

export interface Card {
    id: string;
    categoryId: string;
    title: string;
    content: string;
}

export interface QRCodePreviewProps {
    url: string;
    qrColor: string;
    bgColor: string;
    logo: string | null;
}
