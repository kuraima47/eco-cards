import { act, renderHook } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useSocketConnection } from '../useSocketConnection';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('useSocketConnection', () => {
  const mockSocket = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    connected: false
  };
  
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    jest.clearAllMocks();
    (io as jest.Mock).mockReturnValue(mockSocket);
    // Replace console.error with a mock implementation
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Restore original console.error after each test
    console.error = originalConsoleError;
  });

  test('should initialize socket connection on mount', () => {
    renderHook(() => useSocketConnection());
    
    expect(io).toHaveBeenCalledWith('http://localhost:3000', expect.any(Object));
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  test('should call onConnect callback when socket connects', () => {
    const onConnect = jest.fn();
    
    renderHook(() => useSocketConnection({ onConnect }));
    
    // Find the connect handler and call it
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });
    
    expect(onConnect).toHaveBeenCalled();
  });

  test('should call onDisconnect callback when socket disconnects', () => {
    const onDisconnect = jest.fn();
    
    renderHook(() => useSocketConnection({ onDisconnect }));
    
    // Find the disconnect handler and call it
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
    act(() => {
      disconnectHandler('io client disconnect');
    });
    
    expect(onDisconnect).toHaveBeenCalled();
  });

  test('should call onError callback when connection error occurs', () => {
    const onError = jest.fn();
    
    renderHook(() => useSocketConnection({ onError }));
    
    // Find the connect_error handler and call it
    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
    act(() => {
      errorHandler(new Error('Connection failed'));
    });
    
    expect(onError).toHaveBeenCalledWith('Connection error (attempt 1/5): Connection failed');
    // Optionally verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  test('should disconnect socket when component unmounts', () => {
    const { unmount } = renderHook(() => useSocketConnection());
    
    unmount();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});