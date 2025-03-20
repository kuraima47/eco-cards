import { renderHook, waitFor } from '@testing-library/react';
import { categoryService } from '../../services/categoryService';
import { deckService } from '../../services/deckService';
import { groupAcceptedCardService } from '../../services/groupAcceptedCardService';
import { groupService } from '../../services/groupService';
import { sessionService } from '../../services/sessionService';
import { useSessionData } from '../useSessionData';

// Mock the services
jest.mock('../../services/sessionService');
jest.mock('../../services/groupService');
jest.mock('../../services/deckService');
jest.mock('../../services/categoryService');
jest.mock('../../services/groupAcceptedCardService');

describe('useSessionData', () => {
  const mockSession = {
    sessionId: '123',
    deckId: 1,
    startTime: new Date(),
    status: 'active'
  };
  
  const mockGroups = [
    { groupId: 1, name: 'Group 1' },
    { groupId: 2, name: 'Group 2' }
  ];
  
  const mockDeck = {
    deckId: 1,
    deckName: 'Test Deck'
  };
  
  const mockCards = [
    { 
      dataValues: {
        cardId: 1, 
        cardName: 'Card 1', 
        deckId: 1,
        cardDescription: 'Description 1',
        cardNumber: 1,
        totalCards: 2
      }
    },
    { 
      dataValues: {
        cardId: 2, 
        cardName: 'Card 2', 
        deckId: 1,
        cardDescription: 'Description 2',
        cardNumber: 2,
        totalCards: 2
      }
    }
  ];
  
  const mockCategories = [
    { categoryId: 1, categoryName: 'Category 1', deckId: 1 },
    { categoryId: 2, categoryName: 'Category 2', deckId: 1 }
  ];

  const mockAcceptedCards = [
    { groupId: 1, cardId: 1, co2Estimation: 10, acceptanceLevel: 'high' },
    { groupId: 2, cardId: 2, co2Estimation: 20, acceptanceLevel: 'medium' }
  ];

  // Spy on console.error and silence it during tests
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  
  beforeAll(() => {
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    (sessionService.getSessionById as jest.Mock).mockResolvedValue(mockSession);
    (groupService.getGroupsBySessionId as jest.Mock).mockResolvedValue(mockGroups);
    (deckService.getDeckById as jest.Mock).mockResolvedValue(mockDeck);
    (deckService.getDeckCards as jest.Mock).mockResolvedValue(mockCards);
    (categoryService.getCategoryByDeckId as jest.Mock).mockResolvedValue(mockCategories);
    (groupAcceptedCardService.getGroupAcceptedCardsByGroupId as jest.Mock).mockImplementation((groupId) => {
      return Promise.resolve(mockAcceptedCards.filter(card => card.groupId.toString() === groupId));
    });
  });

  test('should load session data on initial render', async () => {
    const { result } = renderHook(() => useSessionData('123'));
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    
    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check that the services were called with correct parameters
    expect(sessionService.getSessionById).toHaveBeenCalledWith('123');
    expect(groupService.getGroupsBySessionId).toHaveBeenCalledWith(123);
    expect(deckService.getDeckById).toHaveBeenCalledWith('1');
    expect(categoryService.getCategoryByDeckId).toHaveBeenCalledWith('1');
    expect(deckService.getDeckCards).toHaveBeenCalledWith('1');
    expect(groupAcceptedCardService.getGroupAcceptedCardsByGroupId).toHaveBeenCalledWith('1');
    expect(groupAcceptedCardService.getGroupAcceptedCardsByGroupId).toHaveBeenCalledWith('2');
    
    // Check that state is updated correctly
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.groups).toEqual(mockGroups);
    expect(result.current.deck).toEqual(mockDeck);
    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
    
    // Check that tables are initialized correctly (one per group)
    expect(result.current.tables).toHaveLength(2);
    expect(result.current.tables[0]).toEqual({
      id: 1,
      groupId: 1,
      category: null,
      cards: [],
    });
    expect(result.current.tables[1]).toEqual({
      id: 2,
      groupId: 2,
      category: null,
      cards: [],
    });
    
    // Check CO2 estimations and acceptance levels are initialized correctly
    expect(result.current.co2Estimations).toEqual({
      1: { 1: 10 },
      2: { 2: 20 }
    });
    
    expect(result.current.acceptanceLevels).toEqual({
      1: { 1: 'high' },
      2: { 2: 'medium' }
    });
  });

  test('should handle error when session is not found', async () => {
    (sessionService.getSessionById as jest.Mock).mockResolvedValue(null);
    
    const { result } = renderHook(() => useSessionData('invalid-id'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Session not found');
    expect(result.current.session).toBeNull();
    
    // Verify that console.error was called with the expected error
    expect(console.error).toHaveBeenCalledWith(
      'Error loading session data:',
      expect.objectContaining({ message: 'Session not found' })
    );
  });

  test('should handle service errors', async () => {
    const error = new Error('Service unavailable');
    (sessionService.getSessionById as jest.Mock).mockRejectedValue(error);
    
    const { result } = renderHook(() => useSessionData('123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Service unavailable');
    
    // Verify that console.error was called with the expected error
    expect(console.error).toHaveBeenCalledWith(
      'Error loading session data:',
      expect.objectContaining({ message: 'Service unavailable' })
    );
  });
});