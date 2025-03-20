import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeckListView } from "../DeckListView";
import { useAdmin } from "../../../hooks/useAdmin";
import "@testing-library/jest-dom"

jest.mock("../../hooks/useAdmin"); // Mock du hook useAdmin

const mockUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;
it("met à jour la liste des decks lorsqu'un nouveau est ajouté", async () => {
    const { rerender } = render(<DeckListView decks={mockUseAdmin().decks} onSelectDeck={jest.fn()} />);
    
    // Simuler un ajout de deck dans useAdmin
    mockUseAdmin.mockReturnValueOnce({
      ...mockUseAdmin(),
      decks: [
        ...mockUseAdmin().decks,
        { deckId: 2, deckName: "Nouveau Deck", categories: [] }
      ]
    });
  
    rerender(<DeckListView decks={mockUseAdmin().decks} onSelectDeck={jest.fn()} />);
  
    await waitFor(() => {
      expect(screen.getByText("Nouveau Deck")).toBeInTheDocument();
    });
  });
  