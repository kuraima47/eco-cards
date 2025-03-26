import { ReactNode } from 'react';
import type { Card, CardImage, CardMetrics, Category, Deck, DeckWithCategories, Group, GroupCards, SelectedCard, TableData } from "./game";

export interface CardProps {
    cardData: Card;
    width?: number;
    height?: number;
    hiddenCo2?: boolean;
    isFlipped?: boolean;
    categoryIcon?: string;
    categoryColor?: string;
    isForPdf?: boolean;
}

export interface CardBackProps {
    cardData: Card;
    categoryColor?: string;
    categoryIcon?: string;
    width?: number;
    height?: number;
    isForPdf?: boolean;
}

export interface PlayingCardProps {
    card: Card
    isSelected: boolean
    onCardClick: (cardId: number) => void
    isSelectable: boolean
    phase: number
    width?: number
    height?: number
    categoryName?: string
    co2Estimation?: number
    acceptanceLevel?: "high" | "medium" | "low" | null
    onCO2Estimate?: (cardId: number, value: number) => void
    onAcceptanceChange?: (cardId: number, level: "high" | "medium" | "low" | null) => void
    onOpenModal?: (card: Card) => void
    hideCO2?: boolean
}

export interface CardStyleProps {
    width: number;
    height: number;
    isFlipped: boolean;
    isForPdf: boolean;
}

export interface TextAreaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    otherText?: string;
}

export interface CategoryPreviewProps {
    categoryName: string;
    categoryIcon?: string;
    categoryColor?: string;
    cardCount?: number;
    totalCards?: number;
    className?: string;
    style?: React.CSSProperties;
    iconSizePx?: string;
    isForPdf?: boolean;
}

export interface CategoryViewProps {
    category: Category;
    onCreateCard: () => void;
    refreshParent: () => void;
}

export interface DeckListViewProps {
    decks: DeckWithCategories[];
    onCreateDeck: () => void;
    onSelectDeck: (deckId: number) => void;
    refreshParent: () => void;
}

export interface DeckViewProps {
    deck: DeckWithCategories;
    onSelectCategory: (categoryId: number) => void;
    onCreateCategory: () => void;
    refreshParent?: () => void;
}

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    debounceTime?: number;
}

export interface SidebarProps {
    decks: DeckWithCategories[];
    selectedDeck?: number;
    selectedCategory?: number;
    onSelectDeck: (deckId: number) => void;
    onSelectCategory: (deckId: number, categoryId: number) => void;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export interface ModalCardsType {
    initialData: DeckWithCategories;
    isOpen: boolean;
    onClose: () => void;
}

export interface CardModalProps {
    initialData?: Card | null;
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    onSubmit: (data: Partial<Card>) => void;
    currentDeckId: string;
    categoryIcon: string;
    categoryColor: string;
}

export interface ViewCardModalProps {
    initialData?: Card;
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    onSubmit: (data: Partial<Card>) => void;
    currentDeckId: string;
    categoryIcon: string;
    categoryColor: string;
}

export interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    initialData: Partial<Category> | null;
    onSubmit: (data: Partial<Category>) => void;
}

export interface DeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    initialData?: Deck | null;
    onSubmit: (data: Partial<Deck>) => void;
}

export interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemType: 'deck' | 'category' | 'card';
    name?: string;
}

export interface GenericModalConfirmProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface CardPreviewProps {
    cards: Card[];
    metrics: CardMetrics;
    categories: {
        categoryIcon: string;
        categoryColor: string;
    }[];
}

export interface CardImagePreviewProps {
    cards: CardImage[];
    metrics: CardMetrics;
}

export interface QRCodePreviewProps {
    url: string;
    qrColor: string;
    bgColor: string;
    logo: string | null;
}

export interface QRCodeFormProps {
    url: string;
    setUrl: (url: string) => void;
    qrColor: string;
    setQrColor: (color: string) => void;
    bgColor: string;
    setBgColor: (color: string) => void;
    logo: string | undefined;
    fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
    handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleLogoDelete: () => void;
    downloadQRCode: () => void;
}

export interface CardZoomedInTableModalProps {
    isOpen: boolean
    onClose: () => void
    cardData: Card
    categoryName?: string
    categoryIcon?: string
    categoryColor?: string
    isSelected?: boolean
    onSelect?: () => void
    phase: number
    co2Estimation?: number
    acceptanceLevel?: "high" | "medium" | "low" | null
    onCO2Estimate?: (value: number) => void
    onAcceptanceChange?: (level: "high" | "medium" | "low" | null) => void
    isReadOnly?: boolean
    hideCO2?: boolean
}

export interface PlayingCardProps {
    card: Card
    isSelected: boolean
    onCardClick: (cardId: number) => void
    isSelectable: boolean
    phase: number
    width?: number
    height?: number
    categoryName?: string
    co2Estimation?: number
    acceptanceLevel?: "high" | "medium" | "low" | null
    onCO2Estimate?: (cardId: number, value: number) => void
    onAcceptanceChange?: (cardId: number, level: "high" | "medium" | "low" | null) => void
    onOpenModal?: (card: Card) => void
    hideCO2?: boolean
}

export interface SmallCardProps {
    cardData: Card
    width?: number
    height?: number
    isAdmin?: boolean
    isFlipped: boolean
    categoryName?: string
    categoryIcon?: string
    categoryColor?: string
    phase?: number
    co2Estimation?: number
    acceptanceLevel?: "high" | "medium" | "low" | null
    onCO2Estimate?: (value: number, e: React.MouseEvent) => void
    onAcceptanceChange?: (level: "high" | "medium" | "low" | null, e: React.MouseEvent) => void
    isSelected?: boolean
    onSelect?: () => void
    onOpenModal?: () => void
}

export interface TableCarouselProps {
    tables: TableData[]
    groups: Group[]
    categories: Category[]
    cards: Card[]
    selectedCardsByGroup: Record<number, SelectedCard[]>
    onCardSelect: (groupId: number, cardId: number) => void
    onCO2Estimate?: (groupId: number, cardId: number, value: number) => void
    onAcceptanceChange?: (groupId: number, cardId: number, level: "high" | "medium" | "low" | null) => void
    sessionId: string
    currentRound: number
    phase: number
    maxSelectableCards?: number
    currentCategory: Category | null
    co2Estimations?: Record<number, Record<number, number>>
    acceptanceLevels?: Record<number, Record<number, "high" | "medium" | "low" | null>>
    isReadOnly?: boolean
    currentIndex?: number
    setCurrentIndex?: (index: number) => void
    userGroupId?: number | null
    hideCO2ForPlayers?: boolean
}

export interface TableSurfaceProps {
    tableId: number
    groupId: number
    category: Category | null
    cards: Card[]
    selectedCardIds: number[]
    groups?: Group[]
    isActive?: boolean
    style?: React.CSSProperties
    onCardSelect: (groupId: number, cardId: number) => void
    phase: number
    maxSelectableCards?: number
    hideGroupInfo?: boolean
    co2Estimations?: Record<number, number>
    acceptanceLevels?: Record<number, "high" | "medium" | "low" | null>
    onCO2Estimate?: (cardId: number, value: number) => void
    onAcceptanceChange?: (cardId: number, level: "high" | "medium" | "low" | null) => void
    isReadOnly?: boolean
    hideCO2?: boolean
}

export interface CardUploaderProps {
    onImagesUploaded: (images: CardImage[]) => void;
}

export interface CreateCardFormProps {
    cardData: Card;
    setCardData: React.Dispatch<React.SetStateAction<Card>>;
    onSubmit: () => void;
}

export interface ImageUploadProps {
    onImageUpload: (file: File | null) => void;
    onRemoveImage: () => void;
}

export interface NotificationProps {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
    onClose?: () => void;
};

export interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'player';
}

export interface UseSessionSocketProps {
    sessionId: string;
    onCardSelected: (groupId: number, cardId: number, selected: boolean, selectedCards: SelectedCard[]) => void;
    onPhaseChanged: (phase: number, status: string) => void;
    onRoundChanged: (round: number, category?: Category) => void;
    onCO2Updated: (totalCO2: number) => void;
    onGroupCardsUpdated: (groups: GroupCards[]) => void;
    onCO2Estimation?: (groupId: number, cardId: number, value: number) => void;
    onAcceptanceLevel?: (groupId: number, cardId: number, level: "high" | "medium" | "low" | null) => void;
    onError: (error: string) => void;
}