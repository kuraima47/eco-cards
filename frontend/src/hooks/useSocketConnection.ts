import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

// Get the socket server URL from environment variables or use default
const SOCKET_SERVER_URL =
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_API_URL) ||
  'http://localhost:3000';

interface UseSocketConnectionProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export const useSocketConnection = ({
  onConnect,
  onDisconnect,
  onError,
}: UseSocketConnectionProps = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Use refs for callbacks to avoid stale closures
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  // Update callback refs when props change
  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onConnect, onDisconnect, onError]);

  // Initialize socket connection
  const connect = useCallback(() => {
    // If already connected, do nothing
    if (socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // If we have a socket but it's not connected, try to reconnect
    if (socket) {
      console.log('Attempting to reconnect existing socket...');
      socket.connect();
      return;
    }

    console.log('Initializing new socket connection...');
    
    // Create new socket instance
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Set up event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      onConnectRef.current?.();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      // If server disconnected us, try to reconnect
      if (reason === 'io server disconnect') {
        console.log('Server disconnected the socket, attempting to reconnect...');
        newSocket.connect();
      }
      
      onDisconnectRef.current?.();
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      reconnectAttemptsRef.current++;
      
      const errorMessage = `Connection error (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}): ${error.message}`;
      setConnectionError(errorMessage);
      onErrorRef.current?.(errorMessage);

      // If we've reached max reconnect attempts, stop trying
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error('Maximum reconnection attempts reached');
        setConnectionError('Maximum reconnection attempts reached. Please refresh the page.');
        newSocket.disconnect();
      }
    });

    // Store the socket instance
    setSocket(newSocket);
    
    return () => {
      console.log('Cleaning up socket connection...');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [socket]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socket) {
      console.log('Disconnecting socket...');
      socket.disconnect();
      setIsConnected(false);
      reconnectAttemptsRef.current = 0;
    }
  }, [socket]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
  };
};