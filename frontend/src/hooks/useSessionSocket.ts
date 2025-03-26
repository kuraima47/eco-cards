import { useCallback, useEffect, useRef } from "react";
import type { AcceptanceLevelData, CardSelectedData, CO2EstimationData, GroupCards, PhaseChangedData, RoundChangedData, SessionState } from "../types/game";
import type { UseSessionSocketProps } from "../types/props";
import { useSocketConnection } from "./useSocketConnection";

export const useSessionSocket = ({
  sessionId,
  onCardSelected,
  onPhaseChanged,
  onRoundChanged,
  onCO2Updated,
  onGroupCardsUpdated,
  onCO2Estimation,
  onAcceptanceLevel,
  onError,
}: UseSessionSocketProps) => {
  // Use refs to avoid stale closures in event handlers
  const callbackRefs = useRef({
    onCardSelected,
    onPhaseChanged,
    onRoundChanged,
    onCO2Updated,
    onGroupCardsUpdated,
    onCO2Estimation,
    onAcceptanceLevel,
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
      onCO2Estimation,
      onAcceptanceLevel,
      onError,
    };
  }, [
    onCardSelected,
    onPhaseChanged,
    onRoundChanged,
    onCO2Updated,
    onGroupCardsUpdated,
    onCO2Estimation,
    onAcceptanceLevel,
    onError,
  ]);

  // Get socket connection from the base hook
  const { socket, connectionError, connect } = useSocketConnection({
    onConnect: () => {},
    onDisconnect: () => {},
    onError: (error) => {
      console.error("Socket connection error:", error);
      callbackRefs.current.onError(`Connection error: ${error}`);
    },
  });

  // Join session when socket is connected and sessionId is available
  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit("joinSession", sessionId, (error: Error | null) => {
      if (error) {
        console.error("Failed to join session:", error);
        callbackRefs.current.onError(`Failed to join session: ${error.message}`);
      }
    });

    // Set up event handlers
    const handlers = {
      // Initial session state
      sessionState: (data: SessionState) => {
        callbackRefs.current.onPhaseChanged(data.phase, data.status);
        callbackRefs.current.onRoundChanged(data.round);
        callbackRefs.current.onCO2Updated(data.totalCO2);

        if (data.groups) {
          callbackRefs.current.onGroupCardsUpdated(data.groups);
        }

        // Iterate over groups for CO₂ estimations
        if (data.co2Estimations) {
          Object.entries(data.co2Estimations).forEach(([groupId, cards]) => {
            const groupIdNum = Number(groupId);
            Object.entries(cards).forEach(([cardId, value]) => {
              if (callbackRefs.current.onCO2Estimation) {
                callbackRefs.current.onCO2Estimation(groupIdNum, Number(cardId), Number(value));
              }
            });
          });
        }

        // Iterate over groups for acceptance levels
        if (data.acceptanceLevels) {
          Object.entries(data.acceptanceLevels).forEach(([groupId, cards]) => {
            const groupIdNum = Number(groupId);
            Object.entries(cards).forEach(([cardId, level]) => {
              if (callbackRefs.current.onAcceptanceLevel) {
                callbackRefs.current.onAcceptanceLevel(
                  groupIdNum,
                  Number(cardId),
                  level as "high" | "medium" | "low" | null
                );
              }
            });
          });
        }
      },

      // Phase changed event
      phaseChanged: (data: PhaseChangedData) => {
        callbackRefs.current.onPhaseChanged(data.phase, data.status);
        callbackRefs.current.onRoundChanged(data.round);
        if (data.groups) {
          callbackRefs.current.onGroupCardsUpdated(data.groups);
        }
      },

      // Round changed event
      roundChanged: (data: RoundChangedData) => {
        callbackRefs.current.onRoundChanged(data.round, data.category);
      },

      // Card selected event
      cardSelected: (data: CardSelectedData) => {
        callbackRefs.current.onCardSelected(data.groupId, data.cardId, data.selected, data.selectedCards);
        callbackRefs.current.onCO2Updated(data.totalCO2);
      },

      // Group cards updated event
      groupCardsUpdated: (data: { groups: GroupCards[] }) => {
        callbackRefs.current.onGroupCardsUpdated(data.groups);
      },

      // CO₂ estimation event
      co2Estimation: (data: CO2EstimationData) => {
        if (callbackRefs.current.onCO2Estimation) {
          callbackRefs.current.onCO2Estimation(data.groupId, data.cardId, data.value);
        }
      },

      // Acceptance level event
      acceptanceLevel: (data: AcceptanceLevelData) => {
        if (callbackRefs.current.onAcceptanceLevel) {
          callbackRefs.current.onAcceptanceLevel(data.groupId, data.cardId, data.level);
        }
      },

      // Error event
      error: (error: { message: string }) => {
        console.error("Socket error:", error);
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
      Object.keys(handlers).forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket, sessionId, connect]);

  // Helper function to emit events with retry logic
  const emitWithRetry = useCallback(
    async (eventName: string, data: any, retries = 2): Promise<any> => {
      if (!socket?.connected) {
        connect();
        throw new Error("Socket not connected");
      }
      
      return new Promise((resolve, reject) => {
        // Use socket.timeout for automatic retry handling
        socket.timeout(5000)
          .emit(eventName, data, (err: Error | null, response: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          });
      });
    },
    [socket, connect]
  );

  const emitChangePhase = useCallback(
    (newPhase: number) => {
      return emitWithRetry("changePhase", { sessionId, newPhase });
    },
    [emitWithRetry, sessionId]
  );

  const emitChangeRound = useCallback(
    (newRound: number) => {
      return emitWithRetry("changeRound", { sessionId, newRound });
    },
    [emitWithRetry, sessionId]
  );

  const emitSelectCard = useCallback(
    (groupId: number, cardId: number) => {
      return emitWithRetry("selectCard", { sessionId, groupId, cardId });
    },
    [emitWithRetry, sessionId]
  );

  const emitCO2Estimation = useCallback(
    (groupId: number, cardId: number, value: number) => {
      return emitWithRetry("co2Estimation", { sessionId, groupId, cardId, value });
    },
    [emitWithRetry, sessionId]
  );

  const emitAcceptanceLevel = useCallback(
    (groupId: number, cardId: number, level: "high" | "medium" | "low" | null) => {
      return emitWithRetry("acceptanceLevel", { sessionId, groupId, cardId, level });
    },
    [emitWithRetry, sessionId]
  );

  const emitEndPhase = useCallback(() => {
    return emitWithRetry("endPhase", { sessionId });
  }, [emitWithRetry, sessionId]);

  const emitEndSession = useCallback(() => {
    return emitWithRetry("endSession", { sessionId });
  }, [emitWithRetry, sessionId]);

  const requestSessionState = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket || !sessionId) {
        reject(new Error("Socket not connected or no session ID"));
        return;
      }
      socket.emit("requestSessionState", sessionId, (error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve(null);
        }
      });
    });
  }, [socket, sessionId]);

  return {
    emitChangePhase,
    emitChangeRound,
    emitSelectCard,
    emitCO2Estimation,
    emitAcceptanceLevel,
    emitEndPhase,
    emitEndSession,
    requestSessionState,
    connectionError,
  };
};
