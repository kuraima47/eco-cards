import { act, renderHook } from '@testing-library/react';
import { useSessionSocket } from '../useSessionSocket';
import { useSocketConnection } from '../useSocketConnection';

// Mock the useSocketConnection hook
jest.mock('../useSocketConnection', () => ({
  useSocketConnection: jest.fn(() => ({
    socket: {
      emit: jest.fn((event, data, callback) => {
        if (callback) callback(null, { success: true });
      }),
      on: jest.fn(),
      off: jest.fn(),
      connected: true,
      timeout: jest.fn().mockImplementation(() => ({
        emit: jest.fn((event, data, callback) => {
          if (callback) callback(null, { success: true });
        })
      }))
    },
    connectionError: null,
    connect: jest.fn()
  }))
}));

interface MockSocket {
  emit: jest.Mock;
  on: jest.Mock;
  off: jest.Mock;
  connected: boolean;
  timeout: jest.Mock;
}

describe('useSessionSocket', () => {
  // Original console methods
  const originalConsoleError = console.error;

  const mockSocket: MockSocket = {
    emit: jest.fn((event, data, callback) => {
      if (callback) callback(null, { success: true });
    }),
    on: jest.fn(),
    off: jest.fn(),
    connected: true,
    timeout: jest.fn().mockImplementation(() => mockSocket)
  };
  
  const mockProps = {
    sessionId: 'test-session-123',
    onCardSelected: jest.fn(),
    onPhaseChanged: jest.fn(),
    onRoundChanged: jest.fn(),
    onCO2Updated: jest.fn(),
    onGroupCardsUpdated: jest.fn(), // Added missing required callback
    onError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence or spy on console.error to avoid test output noise
    console.error = jest.fn();
    (useSocketConnection as jest.Mock).mockReturnValue({
      socket: mockSocket,
      connectionError: null
    });
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
  });

  test('should join session when socket is connected', () => {
    renderHook(() => useSessionSocket(mockProps));
    
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'joinSession',
      'test-session-123',
      expect.any(Function)
    );
  });

  test('should set up event listeners for session events', () => {
    renderHook(() => useSessionSocket(mockProps));
    
    // Check that each event has a listener registered
    expect(mockSocket.on).toHaveBeenCalledWith('sessionState', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('phaseChanged', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('roundChanged', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('cardSelected', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('groupCardsUpdated', expect.any(Function)); // Added check for missing event
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useSessionSocket(mockProps));
    
    unmount();
    
    // Check that off is called with each specific event name
    expect(mockSocket.off).toHaveBeenCalledWith('sessionState');
    expect(mockSocket.off).toHaveBeenCalledWith('phaseChanged');
    expect(mockSocket.off).toHaveBeenCalledWith('roundChanged');
    expect(mockSocket.off).toHaveBeenCalledWith('cardSelected');
    expect(mockSocket.off).toHaveBeenCalledWith('groupCardsUpdated'); // Added check for missing event
    expect(mockSocket.off).toHaveBeenCalledWith('error');
  });

  test('should emit phase change with retry', async () => {
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    await act(async () => {
      await result.current.emitChangePhase(2);
    });
    
    expect(mockSocket.timeout).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'changePhase',
      { sessionId: 'test-session-123', newPhase: 2 },
      expect.any(Function)
    );
  });

  test('should emit card selection with retry', async () => {
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    await act(async () => {
      await result.current.emitSelectCard(3, 42);
    });
    
    expect(mockSocket.timeout).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'selectCard',
      { sessionId: 'test-session-123', groupId: 3, cardId: 42 },
      expect.any(Function)
    );
  });

  test('should emit end phase with retry', async () => {
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    await act(async () => {
      await result.current.emitEndPhase();
    });
    
    expect(mockSocket.timeout).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'endPhase',
      { sessionId: 'test-session-123' },
      expect.any(Function)
    );
  });

  test('should emit end session with retry', async () => {
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    await act(async () => {
      await result.current.emitEndSession();
    });
    
    expect(mockSocket.timeout).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'endSession',
      { sessionId: 'test-session-123' },
      expect.any(Function)
    );
  });

  test('should handle socket disconnection', () => {
    (useSocketConnection as jest.Mock).mockReturnValue({
      socket: { ...mockSocket, connected: false },
      connectionError: 'Socket disconnected'
    });
    
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    expect(result.current.connectionError).toBe('Socket disconnected');
  });

  test('should handle socket errors during event emission', async () => {
    const mockError = new Error('Test error');
    
    // Mock the socket.emit to always call the callback with an error
    const failingSocket = {
      ...mockSocket,
      emit: jest.fn((event, data, callback) => {
        if (callback) callback(mockError);
      }),
      timeout: jest.fn().mockImplementation(() => ({
        emit: jest.fn((event, data, callback) => {
          if (callback) callback(mockError);
        })
      }))
    };
    
    // Override the useSocketConnection mock for this test
    (useSocketConnection as jest.Mock).mockReturnValue({
      socket: failingSocket,
      connectionError: null
    });
    
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    // Now the emitChangePhase should fail
    await expect(result.current.emitChangePhase(2)).rejects.toEqual(mockError);
  });

  test('should handle callbacks being called with session data', () => {
    renderHook(() => useSessionSocket(mockProps));
    
    // Find the sessionState handler and call it with mock data
    const sessionStateHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'sessionState'
    )[1];
    
    const mockSessionState = {
      phase: 2,
      round: 3,
      status: 'active',
      totalCO2: 1500,
      groups: [] // Added groups array
    };
    
    act(() => {
      sessionStateHandler(mockSessionState);
    });
    
    expect(mockProps.onPhaseChanged).toHaveBeenCalledWith(2, 'active');
    expect(mockProps.onRoundChanged).toHaveBeenCalledWith(3);
    expect(mockProps.onCO2Updated).toHaveBeenCalledWith(1500);
    expect(mockProps.onGroupCardsUpdated).toHaveBeenCalledWith([]); // Added test for the new callback
  });

  test('should handle card selection event', () => {
    renderHook(() => useSessionSocket(mockProps));
    
    // Find the cardSelected handler and call it with mock data
    const cardSelectedHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'cardSelected'
    )[1];
    
    const selectedCards = [{ id: 42, name: 'Test Card' }];
    
    act(() => {
      cardSelectedHandler({
        groupId: 2,
        cardId: 42,
        selected: true,
        totalCO2: 2000,
        selectedCards
      });
    });
    
    expect(mockProps.onCardSelected).toHaveBeenCalledWith(2, 42, true, selectedCards);
    expect(mockProps.onCO2Updated).toHaveBeenCalledWith(2000);
  });
  
  test('should handle phase change event', () => {
    renderHook(() => useSessionSocket(mockProps));
    
    // Find the phaseChanged handler and call it with mock data
    const phaseChangedHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'phaseChanged'
    )[1];
    
    act(() => {
      phaseChangedHandler({
        phase: 3,
        round: 4,
        status: 'active',
        groups: [] // Added groups array
      });
    });
    
    expect(mockProps.onPhaseChanged).toHaveBeenCalledWith(3, 'active');
    expect(mockProps.onRoundChanged).toHaveBeenCalledWith(4);
    expect(mockProps.onGroupCardsUpdated).toHaveBeenCalledWith([]); // Added test for the group cards update
  });
  
  test('should handle round change event', () => {
    renderHook(() => useSessionSocket(mockProps));
    
    // Find the roundChanged handler and call it with mock data
    const roundChangedHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'roundChanged'
    )[1];
    
    const mockCategory = { id: 1, name: 'Test Category' };
    
    act(() => {
      roundChangedHandler({
        round: 5,
        category: mockCategory
      });
    });
    
    expect(mockProps.onRoundChanged).toHaveBeenCalledWith(5, mockCategory);
  });
  
  test('should handle error event', () => {
    renderHook(() => useSessionSocket(mockProps));
    
    // Find the error handler and call it with mock data
    const errorHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'error'
    )[1];
    
    act(() => {
      errorHandler({
        message: 'Something went wrong'
      });
    });
    
    expect(mockProps.onError).toHaveBeenCalledWith('Something went wrong');
  });
  
  // Additional tests for new CO2 estimation and acceptance level functionality
  test('should emit CO2 estimation', async () => {
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    await act(async () => {
      await result.current.emitCO2Estimation(3, 42, 150);
    });
    
    expect(mockSocket.timeout).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'co2Estimation',
      { sessionId: 'test-session-123', groupId: 3, cardId: 42, value: 150 },
      expect.any(Function)
    );
  });
  
  test('should emit acceptance level', async () => {
    const { result } = renderHook(() => useSessionSocket(mockProps));
    
    await act(async () => {
      await result.current.emitAcceptanceLevel(3, 42, 'high');
    });
    
    expect(mockSocket.timeout).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'acceptanceLevel',
      { sessionId: 'test-session-123', groupId: 3, cardId: 42, level: 'high' },
      expect.any(Function)
    );
  });
});