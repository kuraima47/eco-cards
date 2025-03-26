export type UserRole = "admin" | "player";

export interface User {
    userId: number;
    username: string;
    email: string;
    user_password: string;
    role: UserRole;
}

export interface Category {
    categoryId: number;
    categoryName: string;
    categoryDescription: string;
    categoryColor: string;
    categoryIcon: string;
    deckId: number;
    cards?: Card[];
}

export interface CategoryWithCards extends Category {
    categoryId: number;
    categoryName: string;
    categoryDescription: string;
    categoryColor: string;
    categoryIcon: string;
    deckId: number;
    cards: Card[];
}

export interface Card {
    cardCategoryId: number;
    selected: boolean;
    cardId: number;
    deckId: number;
    cardName: string;
    cardDescription: string;
    cardImageData: ImageFormat;
    qrCodeColor: string;
    qrCodeLogoImageData: string;
    backgroundColor: string;
    category: string;
    cardValue: number;
    cardActual: string[];
    cardProposition: string[];
    deckName: string;
    cardNumber: number;
    totalCards: number;
    times_selected?: number;
    co2Estimation?: number
    acceptanceLevel?: "high" | "medium" | "low" | null
    categoryColor?: string
}

export const defaultCard: Card = {
    cardId: -1,
    cardCategoryId: -1,
    deckId: -1,

    cardName: "",
    cardDescription: "",
    cardValue: 0,
    category: "",
    deckName: "",

    cardImageData: { data: new Uint8Array(), type: '' },
    backgroundColor: "#FFFFFF",

    qrCodeColor: "#000000",
    qrCodeLogoImageData: "",

    cardActual: [],
    cardProposition: [],

    selected: false,
    cardNumber: 1,
    totalCards: 1,
    times_selected: 0
};

export interface SelectedCard {
    cardId: number;
    cardValue: number;
}

export interface TableData {
    id: number;
    groupId: number;
    category: Category | null;
    cards: Card[];
}

export interface Deck {
    deckId: number;
    deckName: string;
    adminId: number;
    categories?: CategoryWithCards[]; // Add categories as an optional property
}

export interface DeckWithCategories extends Deck {
    deckId: number;
    deckName: string;
    adminId: number;
    categories: CategoryWithCards[];
}

export interface DeckContent {
    deckId: number;
    cardId: number;
}

export interface Session {
    sessionId: number;
    adminId: number;
    sessionName: string;
    status: string;
    deckId: number;
    createdAt: string;
    endedAt: string;
}

export interface Group {
    groupId: number;
    sessionId: number;
    groupName: string;
    GroupAcceptedCards?: GroupAcceptedCard[];
}

export interface GroupPlayer {
    groupId: number;
    username: string;
    userId?: number | null;
}

export interface GroupAcceptedCard {
    groupId: number;
    cardId: number;
}
export interface GroupSelectedCards {
    groupId: number
    categoriesCards: Record<number, number[]> // categoryId -> cardIds[]
}

export interface UseQRCodeOptions {
    initialUrl?: string;
    initialQrColor?: string;
    initialBgColor?: string;
    initialLogo?: string;
}

export interface ImageFormat {
    data?: Uint8Array;
    type?: string;
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

export interface GroupCards {
    groupId: number;
    selectedCards: SelectedCard[];
}

export interface SessionState {
    phase: number;
    round: number;
    status: string;
    totalCO2: number;
    groups: GroupCards[];
    categories: Category[];
    co2Estimations?: Record<number, Record<number, number>>;
    acceptanceLevels?: Record<number, Record<number, "high" | "medium" | "low" | null>>;
}

export interface CardSelectedData {
    groupId: number;
    cardId: number;
    selected: boolean;
    totalCO2: number;
    selectedCards: SelectedCard[];
}

export interface PhaseChangedData {
    phase: number;
    round: number;
    status: string;
    groups?: GroupCards[];
}

export interface RoundChangedData {
    round: number;
    category?: Category;
}

export interface CO2EstimationData {
    groupId: number;
    cardId: number;
    value: number;
}

export interface AcceptanceLevelData {
    groupId: number;
    cardId: number;
    level: "high" | "medium" | "low" | null;
}

export interface Stats {
    totalGames: number
    playedGames: number
    totalUsers: number
    totalDecks: number
    totalCards: number
    completeCards: number
    incompleteCards: number
    averageSessionDuration: { hours: number; minutes: number; seconds: number }
    sessionsPerMonth?: { month: string; count: number }[]
    cardCompletionRate?: number
    sessionCompletionRate?: number
    cardsByDeck?: { deckName: string; cardCount: number }[]
    userActivity?: { date: string; count: number }[]
  }