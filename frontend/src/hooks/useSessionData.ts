import { useEffect, useState } from "react";
import { categoryService } from "../services/categoryService";
import { deckService } from "../services/deckService";
import { groupAcceptedCardService } from "../services/groupAcceptedCardService";
import { groupService } from "../services/groupService";
import { sessionService } from "../services/sessionService";
import type { Card, Category, Deck, Group, Session, TableData } from "../types/game";

export const useSessionData = (sessionId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [co2Estimations, setCO2Estimations] = useState({});
  const [acceptanceLevels, setAcceptanceLevels] = useState({});

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        const sessionData = await sessionService.getSessionById(sessionId);
        if (!sessionData) throw new Error("Session not found");

        // Fetch deck, groups, and categories
        const [deckData, groupsData, categoriesData] = await Promise.all([
          deckService.getDeckById(sessionData.deckId.toString()),
          groupService.getGroupsBySessionId(Number(sessionId)),
          categoryService.getCategoryByDeckId(sessionData.deckId.toString()),
        ]);

        // Fetch accepted cards for each group using the group's id
        const acceptedCardsArrays = await Promise.all(
          groupsData.map((group) =>
            groupAcceptedCardService.getGroupAcceptedCardsByGroupId(group.groupId.toString())
          )
        );
        // Flatten the accepted cards arrays into a single list
        const groupAcceptedCards = acceptedCardsArrays.flat();

        // Get deck contents
        const deckContents = await deckService.getDeckCards(sessionData.deckId.toString());
        console.log("Deck contents:", deckContents);

        // Map deck contents to Card interface
        const cardsData = deckContents.map((card: any) => {
          return {
            cardCategoryId: card.dataValues?.cardCategoryId,
            selected: false,
            cardId: card.dataValues?.cardId,
            deckId: card.dataValues?.deckId,
            cardName: card.dataValues?.cardName || "",
            cardDescription: card.dataValues?.cardDescription || "",
            cardImageData: card.dataValues?.cardImageData || null,
            qrCodeColor: card.dataValues?.qrCodeColor || "#000000",
            qrCodeLogoImageData: card.dataValues?.qrCodeLogoImageData || "",
            backgroundColor: card.dataValues?.backgroundColor || "#ffffff",
            category: card.dataValues?.category || "",
            cardValue: card.dataValues?.cardValue || 0,
            cardActual: card.dataValues?.cardActual || [],
            cardProposition: card.dataValues?.cardProposition || [],
            deckName: deckData?.deckName || "",
            cardNumber: card.dataValues?.cardNumber || 0,
            totalCards: card.dataValues?.totalCards || 0,
            times_selected: card.dataValues?.times_selected || 0,
          };
        });

        // Initialize tables (one per group) with empty category and no cards.
        const initialTables = groupsData.map((group, index) => ({
          id: index + 1,
          groupId: group.groupId,
          category: null,
          cards: [],
        }));

        // Build initial CO₂ estimations and acceptance levels from the accepted cards
        const initialCO2 = groupAcceptedCards.reduce((acc: any, card: any) => {
          acc[card.groupId] = acc[card.groupId] || {};
          acc[card.groupId][card.cardId] = card.co2Estimation;
          return acc;
        }, {});
        const initialAcceptance = groupAcceptedCards.reduce((acc: any, card: any) => {
          acc[card.groupId] = acc[card.groupId] || {};
          acc[card.groupId][card.cardId] = card.acceptanceLevel;
          return acc;
        }, {});

        setSession(sessionData);
        setDeck(deckData);
        setGroups(groupsData);
        setCategories(categoriesData);
        setCards(cardsData);
        setTables(initialTables);
        setCO2Estimations(initialCO2);
        setAcceptanceLevels(initialAcceptance);
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

  return {
    loading,
    error,
    session,
    groups,
    deck,
    cards,
    categories,
    tables,
    co2Estimations,
    acceptanceLevels,
    setTables,
  };
};

