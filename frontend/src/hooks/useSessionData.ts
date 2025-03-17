import { useState, useEffect } from "react";
import { sessionService } from "../services/sessionService";
import { groupService } from "../services/groupService";
import { deckService } from "../services/deckService";
import { categoryService } from "../services/categoryService";
import type { Session, Group, GameDeck, GameCard, Category, TableData } from "../types/game";

export const useSessionData = (sessionId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [deck, setDeck] = useState<GameDeck | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        const sessionData = await sessionService.getSessionById(sessionId);
        if (!sessionData) throw new Error("Session not found");

        const [deckData, groupsData, categoriesData] = await Promise.all([
          deckService.getDeckById(sessionData.deckId.toString()),
          groupService.getGroupsBySessionId(Number(sessionId)),
          categoryService.getCategoryByDeckId(sessionData.deckId.toString()),
        ]);

        // Get deck contents
        const deckContents = await deckService.getDeckCards(sessionData.deckId.toString());
        console.log('Deck contents:', deckContents);

        // Map deck contents to GameCard interface
        const cardsData = deckContents.map((content: any) => ({
          cardCategoryId: content.dataValues?.cardCategoryId,
          selected: false,
          cardId: content.dataValues?.cardId,
          deckId: content.dataValues?.deckId,
          cardName: content.dataValues?.cardName,
          description: content.dataValues?.cardDescription || content.dataValues?.description || '',
          cardImageType: 'default',
          cardImageData: content.dataValues?.cardImageData || null,
          qrCodeColor: '#000000',
          qrCodeLogoImage: '',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          category: content.dataValues?.category || '',
          cardValue: content.dataValues?.cardValue,
          cardActual: content.dataValues?.cardActual ? [content.dataValues?.cardActual] : [],
          cardProposition: content.dataValues?.cardProposition ? [content.dataValues?.cardProposition] : [],
          deckName: deckData?.deckName || '',
          cardNumber: content.dataValues?.cardNumber || 0,
          totalCards: content.dataValues?.totalCards || 0,
          times_selected: content.dataValues?.times_selected || 0
        }));

        // Log transformed cards
        console.log('Transformed cards:', cardsData.map(card => ({
          cardId: card.cardId,
          cardCategoryId: card.cardCategoryId,
          hasCategoryId: card.cardCategoryId !== undefined,
          category: card.category
        })));

        // Initialize tables (one per group) with empty category and no cards.
        const initialTables = groupsData.map((group, index) => ({
          id: index + 1,
          groupId: group.groupId,
          category: null,
          cards: [],
        }));

        setSession(sessionData);
        setDeck(deckData);
        setGroups(groupsData);
        setCategories(categoriesData);
        setCards(cardsData);
        setTables(initialTables);
        setError(null);
      } catch (error) {
        console.error("Error loading session data:", error);
        setError(error instanceof Error ? error.message : "Failed to load session data");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) loadSessionData();
  }, [sessionId]);

  return { loading, error, session, groups, deck, cards, categories, tables, setTables };
};