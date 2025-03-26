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
    if (socket?.connected) return;
    if (socket) {
      socket.connect();
      return;
    }
    
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      onConnectRef.current?.();
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
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

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setConnectionError('Maximum reconnection attempts reached. Please refresh the page.');
        newSocket.disconnect();
      }
    });

    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [socket]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socket) {
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