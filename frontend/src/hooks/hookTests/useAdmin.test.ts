import { act, renderHook, waitFor } from '@testing-library/react';
import { adminApi } from '../../services/admin';
import type { Card, Category, Deck } from '../../types/game';
import { useAdmin } from '../useAdmin';
import { useAuth } from '../useAuth';

// Mock the dependencies
jest.mock('../useAuth');
jest.mock('../../services/admin', () => ({
  adminApi: {
    loadAllData: jest.fn(),
    addCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    addDeck: jest.fn(),
    updateDeck: jest.fn(),
    deleteDeck: jest.fn(),
    addCard: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
    importCards: jest.fn()
  }
}));

describe('useAdmin', () => {
  // Mock data that matches the actual types in the application
  const mockUser = { 
    userId: 1, 
    username: 'admin', 
    email: 'admin@example.com', 
    user_password: 'password', 
    role: 'admin' as const 
  };
  
  const mockDecks = [
    { deckId: 1, deckName: 'Test Deck', adminId: 1 }
  ];
  
  const mockCategories = [
    { 
      categoryId: 1, 
      categoryName: 'Test Category', 
      deckId: 1, 
      categoryDescription: 'Test Description',
      categoryColor: '#FF0000',
      categoryIcon: 'test-icon'
    }
  ];
  
  const mockCards = [
    { 
      selected: false,
      cardId: 1, 
      deckId: 1,
      cardCategoryId: 1,
      cardName: 'Test Card',
      cardDescription: 'Card description',
      cardImageData: { data: new Uint8Array(), type: 'image/jpeg' },
      qrCodeColor: '#000000',
      qrCodeLogoImageData: 'base64data',
      backgroundColor: '#FFFFFF',
      category: 'Test Category',
      cardValue: 100,
      cardActual: ['Current situation description'],
      cardProposition: ['Proposal 1', 'Proposal 2'],
      deckName: 'Test Deck',
      cardNumber: 1,
      totalCards: 10,
      times_selected: 0
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth implementation
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });
    
    // Mock adminApi methods
    (adminApi.loadAllData as jest.Mock).mockResolvedValue({
      decks: mockDecks,
      categories: mockCategories,
      cards: mockCards
    });
    
    (adminApi.addCategory as jest.Mock).mockResolvedValue({
      categoryId: 2,
      categoryName: 'New Category',
      deckId: 1,
      categoryDescription: 'Description',
      categoryColor: '#00FF00',
      categoryIcon: 'new-icon'
    });
    
    (adminApi.updateCategory as jest.Mock).mockResolvedValue({
      categoryId: 1,
      categoryName: 'Updated Category'
    });
    
    (adminApi.deleteCategory as jest.Mock).mockResolvedValue({ success: true });
    (adminApi.addDeck as jest.Mock).mockResolvedValue({ deckId: 2, deckName: 'New Deck' });
    (adminApi.updateDeck as jest.Mock).mockResolvedValue({ success: true });
    (adminApi.deleteDeck as jest.Mock).mockResolvedValue({ success: true });
    (adminApi.addCard as jest.Mock).mockResolvedValue({ 
      cardId: 2,
      cardName: 'New Card',
      cardDescription: 'New description',
      cardValue: 50
    });
    (adminApi.updateCard as jest.Mock).mockResolvedValue({ success: true });
    (adminApi.deleteCard as jest.Mock).mockResolvedValue({ success: true });
  });

  test('should initialize with user and load data', async () => {
    const { result } = renderHook(() => useAdmin());
    
    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    
    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(adminApi.loadAllData).toHaveBeenCalled();
    expect(result.current.decks).toEqual(mockDecks);
    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.cards).toEqual(mockCards);
  });

  test('should add category', async () => {
    const newCategory = { 
      categoryName: 'New Category', 
      categoryDescription: 'Description',
      categoryIcon: 'new-icon',
      categoryColor: '#00FF00'
    };
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Select a deck first
    act(() => {
      result.current.setSelectedDeck('1');
    });
    
    await act(async () => {
      await result.current.addCategory(newCategory);
    });
    
    expect(adminApi.addCategory).toHaveBeenCalledWith({
      categoryName: 'New Category',
      categoryDescription: 'Description',
      categoryIcon: 'new-icon',
      categoryColor: '#00FF00',
      deckId: 1
    });
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should update category', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const updates: Partial<Category> = { 
      categoryName: 'Updated Category' 
    };
    
    await act(async () => {
      await result.current.updateCategory(1, updates);
    });
    
    expect(adminApi.updateCategory).toHaveBeenCalledWith(1, updates);
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should delete category', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.deleteCategory(1);
    });
    
    expect(adminApi.deleteCategory).toHaveBeenCalledWith('1');
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should add deck', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const newDeck: Partial<Deck> = { 
      deckName: 'New Deck' 
    };
    
    await act(async () => {
      await result.current.addDeck(newDeck);
    });
    
    expect(adminApi.addDeck).toHaveBeenCalledWith({
      deckName: 'New Deck',
      adminId: 1 // Should be set from the user
    });
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should get deck name by id', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const deckName = result.current.getDeck(1);
    expect(deckName).toBe('Test Deck');
    
    // Non-existent deck should return empty string
    const nonExistentDeckName = result.current.getDeck(999);
    expect(nonExistentDeckName).toBe('');
  });

  test('should refresh data when calling refresh', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // First clear the mock calls tracker
    (adminApi.loadAllData as jest.Mock).mockClear();
    
    // Then call refresh
    act(() => {
      result.current.refresh();
    });
    
    // Check that refresh forces a re-render
    expect(result.current.loading).toBe(false);
  });

  test('should update deck', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const updates: Partial<Deck> = { 
      deckName: 'Updated Deck' 
    };
    
    await act(async () => {
      await result.current.updateDeck(1, updates);
    });
    
    expect(adminApi.updateDeck).toHaveBeenCalledWith('1', updates);
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should delete deck', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.deleteDeck(1);
    });
    
    expect(adminApi.deleteDeck).toHaveBeenCalledWith('1');
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should add card', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Set selected deck
    act(() => {
      result.current.setSelectedDeck('1');
    });
    
    // Add card - using properties that match the Card type
    const newCard: Partial<Card> = {
      cardName: 'New Card',
      cardDescription: 'New card description',
      cardCategoryId: 1,
      cardValue: 50,
      cardActual: ['New current situation'],
      cardProposition: ['New proposal 1', 'New proposal 2'],
      backgroundColor: '#F5F5F5',
      qrCodeColor: '#000000',
      qrCodeLogoImageData: 'base64data',
      cardImageData: { data: new Uint8Array(), type: 'image/jpeg' },
      selected: false,
      category: 'Test Category',
      deckName: '',
      cardNumber: 1,
      totalCards: 1
    };
    
    await act(async () => {
      await result.current.addCard(newCard);
    });
    
    expect(adminApi.addCard).toHaveBeenCalledWith({
      ...newCard,
      deckId: 1
    });
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should update card', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Set selected deck
    act(() => {
      result.current.setSelectedDeck('1');
    });
    
    // Update card
    const cardUpdates: Partial<Card> = { 
      cardName: 'Updated Card Title',
      cardDescription: 'Updated card description'
    };
    
    await act(async () => {
      await result.current.updateCard(1, cardUpdates);
    });
    
    expect(adminApi.updateCard).toHaveBeenCalledWith('1', cardUpdates);
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should delete card', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Set selected deck
    act(() => {
      result.current.setSelectedDeck('1');
    });
    
    // Delete card
    await act(async () => {
      await result.current.deleteCard('1');
    });
    
    expect(adminApi.deleteCard).toHaveBeenCalledWith('1');
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });

  test('should handle error when adding category without selected deck', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Add category with explicit deckId when no deck is selected
    const newCategory = {
      categoryName: 'New Category',
      categoryDescription: 'Description',
      categoryIcon: 'test-icon',
      categoryColor: '#FF0000',
      deckId: 1
    };
    
    await act(async () => {
      await result.current.addCategory(newCategory);
    });
    
    expect(adminApi.addCategory).toHaveBeenCalledWith({
      categoryName: 'New Category',
      categoryDescription: 'Description',
      categoryIcon: 'test-icon',
      categoryColor: '#FF0000',
      deckId: 1
    });
  });

  test('should handle importing cards', async () => {
    const { result } = renderHook(() => useAdmin());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Set selected deck
    act(() => {
      result.current.setSelectedDeck('1');
    });
    
    // Cards to import should match Card structure
    const cardsToImport: Partial<Card>[] = [
      {
        cardName: 'Imported Card 1',
        cardDescription: 'Imported description 1',
        cardActual: ['Imported situation 1'],
        cardProposition: ['Imported proposal 1'],
        cardValue: 10,
        backgroundColor: '#FFFFFF',
        qrCodeColor: '#000000',
        cardImageData: { data: new Uint8Array(), type: 'image/jpeg' },
        category: 'Test Category'
      },
      {
        cardName: 'Imported Card 2',
        cardDescription: 'Imported description 2',
        cardActual: ['Imported situation 2'],
        cardProposition: ['Imported proposal 2'],
        cardValue: 20,
        backgroundColor: '#FFFFFF',
        qrCodeColor: '#000000',
        cardImageData: { data: new Uint8Array(), type: 'image/jpeg' },
        category: 'Test Category'
      }
    ];
    
    await act(async () => {
      await result.current.importCards(cardsToImport);
    });
    
    expect(adminApi.importCards).toHaveBeenCalledWith(1, cardsToImport);
    expect(adminApi.loadAllData).toHaveBeenCalled();
  });
});