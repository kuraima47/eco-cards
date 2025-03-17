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
    deckId: number;
}

export interface GameCard {
    cardCategoryId: number;
    selected: boolean;
    cardId: number;
    deckId: number;
    cardName: string; // anciennement cardName
    description: string; // anciennement cardDescription
    cardImageType: string;
    cardImageData: string;
    qrCodeColor: string; // anciennement qrColor
    qrCodeLogoImage: string; // anciennement qrLogo
    backgroundColor: string; // anciennement background_color
    textColor: string; // anciennement font_color
    category: string; // nom de la catégorie (par exemple "Énergie")
    cardValue: number; // anciennement cardValue
    cardActual: string[]; // anciennement situations
    cardProposition: string[];
    deckName: string;
    cardNumber: number;
    totalCards: number;
    times_selected?: number;
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
}

export interface DeckContent {
    deckId: number;
    cardId: number;
}

export interface Session {
    sessionId: number;
    adminId: number;
    sessionName: string;
    deckId: number;
    createdAt: string;
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
