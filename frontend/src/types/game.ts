import { ImageFormat } from ".";

// types/game.ts
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
    cards?: GameCard[];
}

export interface GameCard {
    cardCategoryId: number;
    selected: boolean;
    cardId: number;
    deckId: number;
    cardName: string; // anciennement cardName
    description: string; // anciennement cardDescription
    cardImageData: ImageFormat;
    qrCodeColor: string; // anciennement qrColor
    qrCodeLogoImageData: string; // anciennement qrLogo
    backgroundColor: string; // anciennement background_color
    category: string; // nom de la catégorie (par exemple "Énergie")
    cardValue: number; // anciennement cardValue
    cardActual: string[]; // anciennement situations
    cardProposition: string[];
    deckName: string;
    cardNumber: number;
    totalCards: number;
    times_selected?: number;
    co2Estimation?: number
    acceptanceLevel?: "high" | "medium" | "low" | null
    categoryColor?: string
}

export const defaultCard: GameCard = {
    cardId: -1,
    cardCategoryId: -1,
    deckId: -1,

    cardName: "",
    description: "",
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

export interface DeckWithCategories extends GameDeck {
    categories: CategoryType[];
}

export interface SelectedCard {
    cardId: number;
    cardValue: number;
}

export interface TableData {
    id: number;
    groupId: number;
    category: Category | null;
    cards: GameCard[];
}

export interface GameDeck {
    deckId: number;
    deckName: string;
    adminId: number;
    categories?: CategoryType[]; // Add categories as an optional property
}

export interface CategoryType {
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    cards: {
        cardId: string;
        cardName: string;
    }[];
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
