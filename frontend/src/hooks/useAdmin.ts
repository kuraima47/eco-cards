import { useEffect, useMemo, useState } from "react";
import { adminApi } from '../services/admin';
import type { Card, Category, Deck, User } from '../types/game';
import { useAuth } from "./useAuth";

class AdminService {
    public decks: Deck[] = [];
    public categories: Category[] = [];
    public cards: Card[] = [];
    public loading = true;
    public selectedDeck: string | null = null;
    public user: User | null = null;
    public refresh: () => void = () => {};

    constructor(user?: User) {
        if (user) this.user = user;
        // Chargement initial des données
        this.loadAllData();
    }

    public setAuthenticatedUser(user: User): void {
        this.user = user;
        this.loadAllData();
    }

    public setSelectedDeck(deckId: string | null): void {
        this.selectedDeck = deckId;
    }

    public setDecks(decks: Deck[]): void {
        this.decks = decks;
    }

    public setCategories(categories: Category[]): void {
        this.categories = categories;
    }

    public setCards(cards: Card[]): void {
        this.cards = cards;
    }

    public setLoading(loading: boolean) {
        this.loading = loading;
    }

    public getCardData(cardName : string, categoryName:string, deckName: string) : number{
        
        const deckId = this.decks.find(deck => deck.deckName === deckName)?.deckId;
        const categoryId = this.categories.find(category => category.categoryName === categoryName && category.deckId === deckId)?.categoryId;

        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].cardName === cardName && this.cards[i].cardCategoryId === categoryId) {
                return this.cards[i].cardId;
            }
        }
        return 0;
    }

    public async loadAllData(): Promise<void> {
        try {
            const { decks, categories, cards } = await adminApi.loadAllData();
            // On s'assure de réassigner les tableaux de façon immuable
            this.decks = decks;
            this.categories = categories;
            this.cards = cards;
        } catch (error) {
            console.error('Error loading all data:', error);
        } finally {
            this.loading = false;
        }
    }

    public async loadDeckCategories(deckId: number): Promise<Category[]> {
        return this.categories.filter(category => category.deckId === deckId);
    }

    public getCategory(categoryId: number): Category | undefined {
        return this.categories.find(category => category.categoryId === categoryId);
    }

    public getCategoryFromCard(categoryId: number): Category | null {
        const category = this.categories.find(category => category.categoryId === categoryId);
        if (!category) return null;
        
        const categoryCards = this.cards.filter(card => card.cardCategoryId === categoryId);
        
        return { 
            ...category, 
            cards: categoryCards 
        } as Category & { cards: Card[] };
    }
    public async addCategory(category: { categoryName: string; categoryDescription: string; categoryIcon: string; categoryColor: string; deckId?: number }): Promise<void> {
        try {
            const result = await adminApi.addCategory({
                categoryName: category.categoryName,
                categoryDescription: category.categoryDescription,
                categoryIcon: category.categoryIcon,
                categoryColor: category.categoryColor,
                deckId: category.deckId || (this.selectedDeck ? Number(this.selectedDeck) : undefined)
            });

            if (result) {
                this.categories = [...this.categories, result];
            }

            await this.loadAllData();
        } catch (error) {
            console.error('Error adding category:', error);
        throw error;
        }
    }

    public async updateCategory(id: number, updates: Partial<Category>): Promise<void> {
        await adminApi.updateCategory(id, updates);
        await this.loadAllData();
    }

    public async deleteCategory(categoryId: number): Promise<void> {
        try {
            await adminApi.deleteCategory(String(categoryId));
            await this.loadAllData();
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    public getDeck(deckId: number): string {
        const deck = this.decks.find(deck => deck.deckId === deckId);
        return deck ? deck.deckName : '';
    }

    public getDeckAdmin(deckId: number): number {
        const deck = this.decks.find(deck => deck.deckId === deckId);
        return deck ? deck.adminId : 0;
    }

    public async addDeck(deck: Partial<Deck>): Promise<void> {
        if (!this.user) throw new Error('User not authenticated');
        deck.adminId = this.user.userId;
        await adminApi.addDeck(deck as Deck);
        await this.loadAllData();
    }

    public async updateDeck(deckId: number, data: Partial<Deck>): Promise<void> {
        await adminApi.updateDeck(String(deckId), data);
        await this.loadAllData();
    }

    public async deleteDeck(deckId: number): Promise<void> {
        await adminApi.deleteDeck(String(deckId));
        await this.loadAllData();
    }

    // Opérations sur les cartes
    public async addCard(card: Partial<Card>): Promise<void> {
        if (!card.deckId && this.selectedDeck) {
            card.deckId = parseInt(this.selectedDeck, 10);
        }
        await adminApi.addCard(card);
        await this.loadAllData();
    }

    public async updateCard(cardId: number, updates: Partial<Card>): Promise<void> {
        try {
            await adminApi.updateCard(String(cardId), updates);
            await this.loadAllData();
        } catch (error) {
            console.error('Error updating card:', error);
            throw error;
        }
    }

    public async deleteCard(cardId: string): Promise<void> {
        try {
            await adminApi.deleteCard(cardId);
            await this.loadAllData();
        } catch (error) {
            console.error('Error deleting card:', error);
            throw error;
        }
    }

    public async importCards(cards: Partial<Card>[]): Promise<void> {
        if (!this.selectedDeck) throw new Error('No deck selected');
        await adminApi.importCards(Number(this.selectedDeck), cards as Card[]);
        await this.loadAllData();
    }
}

export const useAdmin = () => {
    const { user } = useAuth();
    const [, forceUpdate] = useState(0);

    // Utilisation de useMemo pour créer l'instance de service.
    const adminService = useMemo(() => {
        // Pass the complete user object to the service
        const service = new AdminService(user || undefined);
        
        // On surcharge loadAllData pour forcer le re-render après la mise à jour des données.
        const originalLoadAllData = service.loadAllData.bind(service);
        service.loadAllData = async () => {
            await originalLoadAllData();
            forceUpdate((prev) => prev + 1);
        };

        service.refresh = () => {
            forceUpdate((prev) => prev + 1);
        };

        return service;
    }, [user]);

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                // Pass the complete user object
                adminService.setAuthenticatedUser(user);
                await adminService.loadAllData();
            }
        };
        loadData();
    }, [adminService, user]);

    return adminService;
};