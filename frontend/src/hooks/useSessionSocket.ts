import { useCallback, useRef, useEffect } from 'react';
import { useSocketConnection } from './useSocketConnection';
import type { SelectedCard, Category } from '../types/game';

interface GroupCards {
  groupId: number;
  selectedCards: SelectedCard[];
}

interface SessionState {
  phase: number;
  round: number;
  status: string;
  totalCO2: number;
  groups: GroupCards[];
  categories: Category[];
}

interface CardSelectedData {
  groupId: number;
  cardId: number;
  selected: boolean;
  totalCO2: number;
  selectedCards: SelectedCard[];
}

interface PhaseChangedData {
  phase: number;
  round: number;
  status: string;
  groups?: GroupCards[];
}

interface RoundChangedData {
  round: number;
  category?: Category;
}

interface UseSessionSocketProps {
  sessionId: string;
  onCardSelected: (groupId: number, cardId: number, selected: boolean, selectedCards: SelectedCard[]) => void;
  onPhaseChanged: (phase: number, status: string) => void;
  onRoundChanged: (round: number, category?: Category) => void;
  onCO2Updated: (totalCO2: number) => void;
  onGroupCardsUpdated: (groups: GroupCards[]) => void;
  onError: (error: string) => void;
}

export const useSessionSocket = ({
  sessionId,
  onCardSelected,
  onPhaseChanged,
  onRoundChanged,
  onCO2Updated,
  onGroupCardsUpdated,
  onError,
}: UseSessionSocketProps) => {
  // Use refs to avoid stale closures in event handlers
  const callbackRefs = useRef({
    onCardSelected,
    onPhaseChanged,
    onRoundChanged,
    onCO2Updated,
    onGroupCardsUpdated,
    onError,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbackRefs.current = {
      onCardSelected,
      onPhaseChanged,
      onRoundChanged,
      onCO2Updated,
      onGroupCardsUpdated,
      onError,
    };
  }, [onCardSelected, onPhaseChanged, onRoundChanged, onCO2Updated, onGroupCardsUpdated, onError]);

  // Get socket connection from the base hook
  const { socket, connectionError, connect } = useSocketConnection({
    onConnect: () => {
      console.log('Connected to socket server');
    },
    onDisconnect: () => {
      console.log('Disconnected from socket server');
    },
    onError: (error) => {
      console.error('Socket connection error:', error);
      callbackRefs.current.onError(`Connection error: ${error}`);
    },
  });

  // Join session when socket is connected and sessionId is available
  useEffect(() => {
    if (!socket || !sessionId) return;

    console.log(`Joining session: ${sessionId}`);
    socket.emit('joinSession', sessionId, (error: Error | null) => {
      if (error) {
        console.error('Failed to join session:', error);
        callbackRefs.current.onError(`Failed to join session: ${error.message}`);
      } else {
        console.log(`Successfully joined session: ${sessionId}`);
      }
    });

    // Set up event handlers
    const handlers = {
      // Initial session state
      sessionState: (data: SessionState) => {
        console.log('Received session state:', data);
        callbackRefs.current.onPhaseChanged(data.phase, data.status);
        callbackRefs.current.onRoundChanged(data.round);
        callbackRefs.current.onCO2Updated(data.totalCO2);
        if (data.groups) {
          callbackRefs.current.onGroupCardsUpdated(data.groups);
        }
      },
      
      // Phase changed event
      phaseChanged: (data: PhaseChangedData) => {
        console.log('Phase changed:', data);
        callbackRefs.current.onPhaseChanged(data.phase, data.status);
        callbackRefs.current.onRoundChanged(data.round);
        if (data.groups) {
          callbackRefs.current.onGroupCardsUpdated(data.groups);
        }
      },
      
      // Round changed event
      roundChanged: (data: RoundChangedData) => {
        console.log('Round changed:', data);
        callbackRefs.current.onRoundChanged(data.round, data.category);
      },
      
      // Card selected event
      cardSelected: (data: CardSelectedData) => {
        console.log('Card selected:', data);
        callbackRefs.current.onCardSelected(
          data.groupId,
          data.cardId,
          data.selected,
          data.selectedCards
        );
        callbackRefs.current.onCO2Updated(data.totalCO2);
      },
      
      // Group cards updated event
      groupCardsUpdated: (data: { groups: GroupCards[] }) => {
        console.log('Group cards updated:', data);
        callbackRefs.current.onGroupCardsUpdated(data.groups);
      },
      
      // Error event
      error: (error: { message: string }) => {
        console.error('Socket error:', error);
        callbackRefs.current.onError(error.message);
      },
    };

    // Register all event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Clean up event handlers when component unmounts
    return () => {
      if (!socket) return;
      
      console.log('Cleaning up socket event handlers');
      Object.keys(handlers).forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket, sessionId]);

  // Helper function to emit events with retry logic
  const emitWithRetry = useCallback(
    async (eventName: string, data: any, retries = 2): Promise<any> => {
      if (!socket?.connected) {
        console.warn('Socket not connected, attempting to reconnect...');
        connect();
        throw new Error('Socket not connected');
      }

      return new Promise((resolve, reject) => {
        const attempt = (retriesLeft: number) => {
          console.log(`Emitting ${eventName}:`, data);
          
          socket.timeout(5000).emit(eventName, data, (err: Error | null, response: any) => {
            if (err) {
              console.error(`Error emitting ${eventName}:`, err);
              
              if (retriesLeft > 0) {
                console.log(`Retrying ${eventName}, attempts left: ${retriesLeft}`);
                setTimeout(() => attempt(retriesLeft - 1), 1000);
              } else {
                console.error(`Failed to emit ${eventName} after multiple retries`);
                reject(err);
              }
            } else {
              console.log(`Successfully emitted ${eventName}:`, response);
              resolve(response);
            }
          });
        };

        attempt(retries);
      });
    },
    [socket, connect]
  );

  // Emit change phase event
  const emitChangePhase = useCallback(
    (newPhase: number) => {
      return emitWithRetry('changePhase', { sessionId, newPhase });
    },
    [emitWithRetry, sessionId]
  );

  // Emit change round event
  const emitChangeRound = useCallback(
    (newRound: number) => {
      return emitWithRetry('changeRound', { sessionId, newRound });
    },
    [emitWithRetry, sessionId]
  );

  // Emit select card event
  const emitSelectCard = useCallback(
    (groupId: number, cardId: number) => {
      return emitWithRetry('selectCard', { sessionId, groupId, cardId });
    },
    [emitWithRetry, sessionId]
  );

  // Emit end phase event
  const emitEndPhase = useCallback(
    () => {
      return emitWithRetry('endPhase', { sessionId });
    },
    [emitWithRetry, sessionId]
  );

  // Emit end session event
  const emitEndSession = useCallback(
    () => {
      return emitWithRetry('endSession', { sessionId });
    },
    [emitWithRetry, sessionId]
  );

  return {
    emitChangePhase,
    emitChangeRound,
    emitSelectCard,
    emitEndPhase,
    emitEndSession,
    connectionError,
  };
};