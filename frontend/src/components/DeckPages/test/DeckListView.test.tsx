import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeckListView } from "../DeckListView";
import { useAdmin } from "../../../hooks/useAdmin.ts";
import "@testing-library/jest-dom"

jest.mock("../../hooks/useAdmin.ts"); // Mock du hook useAdmin

const mockUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;

describe("DeckListView", () => {
  beforeEach(() => {
    mockUseAdmin.mockReturnValue({
      decks: [
        {
          deckId: 1,
          deckName: "Deck 1",
          categories: [{ categoryId: 101, categoryName: "Category A", cards: [] }]
        },
      ],
      addDeck: jest.fn(),
      updateDeck: jest.fn(),
      deleteDeck: jest.fn(),
    });
  });

  it("affiche la liste des decks", () => {
    render(<DeckListView decks={mockUseAdmin().decks} onSelectDeck={jest.fn()} />);
    
    expect(screen.getByText("My Decks")).toBeInTheDocument();
    expect(screen.getByText("Deck 1")).toBeInTheDocument();
    expect(screen.getByText("1 catégories")).toBeInTheDocument();
  });

  it("ouvre le modal d'ajout de deck", () => {
    render(<DeckListView decks={mockUseAdmin().decks} onSelectDeck={jest.fn()} />);
    
    fireEvent.click(screen.getByText("New Deck"));
    
    expect(screen.getByText("Créer un Deck")).toBeInTheDocument();
  });

  it("ouvre le modal de modification avec les bonnes données", () => {
    render(<DeckListView decks={mockUseAdmin().decks} onSelectDeck={jest.fn()} />);
    
    fireEvent.click(screen.getByTitle("Modifier le deck"));
    
    expect(screen.getByText("Modifier un Deck")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Deck 1")).toBeInTheDocument();
  });

  it("supprime un deck et affiche une notification", async () => {
    render(<DeckListView decks={mockUseAdmin().decks} onSelectDeck={jest.fn()} />);
    
    fireEvent.click(screen.getByTitle("Supprimer le deck"));
    fireEvent.click(screen.getByText("Confirmer")); // Suppression confirmée
    
    await waitFor(() => {
      expect(mockUseAdmin().deleteDeck).toHaveBeenCalledWith(1);
      expect(screen.getByText("Deck supprimé avec succès !")).toBeInTheDocument();
    });
  });
});
