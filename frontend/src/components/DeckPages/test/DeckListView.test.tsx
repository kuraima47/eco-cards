import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeckListView } from "../DeckListView";
import { useAdmin } from "../../../hooks/useAdmin";
import "@testing-library/jest-dom";
jest.mock("../../../hooks/useAdmin", () => ({
    useAdmin: jest.fn()
}));

//mock deckmodal
jest.mock("../../../components/Modals/DeckModal", () => ({
    __esModule: true,
    default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Ajouter un Deck</div> : null
}));


//mock lucide react
jest.mock('lucide-react', () => ({
    Download: () => null,
    Edit: () => null,
    Library: () => null,
    Plus: () => null,
    Trash2: () => null
}));

//mock components/Pdf/ModalCards.tsx
jest.mock("../../../components/Pdf/ModalCards", () => ({
    __esModule: true,
    default: () => null
}));

describe("DeckListView Component", () => {
    const mockOnSelectDeck = jest.fn();
    const mockRefreshParent = jest.fn();
    const mockAdmin = {
        decks: [
            { deckId: 1, deckName: "Deck 1", categories: [], adminId: 1 },
            { deckId: 2, deckName: "Deck 2", categories: [], adminId: 1 }
        ],
        addDeck: jest.fn(),
        updateDeck: jest.fn(),
        deleteDeck: jest.fn()
    };

    beforeEach(() => {
        (useAdmin as jest.Mock).mockReturnValue(mockAdmin);
    });

    test("renders deck list correctly", () => {
        render(
            <DeckListView
                decks={mockAdmin.decks}
                onSelectDeck={mockOnSelectDeck}
                refreshParent={mockRefreshParent}
            />
        );

        expect(screen.getByText("Mes Decks")).toBeInTheDocument();
        expect(screen.getByText("Deck 1")).toBeInTheDocument();
        expect(screen.getByText("Deck 2")).toBeInTheDocument();
    });

    test("calls onSelectDeck when clicking on a deck", () => {
        render(
            <DeckListView
                decks={mockAdmin.decks}
                onSelectDeck={mockOnSelectDeck}
                refreshParent={mockRefreshParent}
            />
        );

        fireEvent.click(screen.getByText("Deck 1"));
        expect(mockOnSelectDeck).toHaveBeenCalledWith(1);
    });

    test("opens add deck modal when clicking on 'Nouveau Deck' button", () => {
        render(
            <DeckListView
                decks={mockAdmin.decks}
                onSelectDeck={mockOnSelectDeck}
                refreshParent={mockRefreshParent}
            />
        );

        fireEvent.click(screen.getByText("Nouveau Deck"));
        expect(screen.getByText("Ajouter un Deck")); // Vérifie que le modal s'ouvre
    });
    //ecrit ce test "met à jour la liste des decks lorsqu'un nouveau est ajouté"
    test("met à jour la liste des decks lorsqu'un nouveau est ajouté", async () => {
        const { rerender } = render(<DeckListView decks={mockAdmin.decks} onSelectDeck={jest.fn()} refreshParent={mockRefreshParent} />);
        
        // Simuler un ajout de deck dans useAdmin
        (useAdmin as jest.Mock).mockReturnValueOnce({
          ...mockAdmin,
          decks: [
            ...mockAdmin.decks,
            { deckId: 3, deckName: "Nouveau Deck", categories: [] }
          ]
        });
      
        rerender(<DeckListView decks={mockAdmin.decks} onSelectDeck={jest.fn()} refreshParent={mockRefreshParent} />);
      
        await waitFor(() => {
          expect(screen.getByText("Nouveau Deck")).toBeInTheDocument();
        });
      });
});
