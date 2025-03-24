import React, { useState, useCallback, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Clock, Users, Target, AlertTriangle, Eye } from "lucide-react"
import { TableCarousel } from "../../components/Sessions/carousel/TableCarousel"
import { useSessionSocket } from "../../hooks/useSessionSocket"
import { useSessionData } from "../../hooks/useSessionData"
import { useAuth } from "../../hooks/useAuth"
import type { SelectedCard } from "../../types/game"
import { groupPlayerService } from "../../services/groupPlayerService"
import Notification from "../../components/Notification";

const PHASE_DURATIONS = {
  1: 35 * 60, // Card selection phase
  2: 10 * 60, // CO2 estimation phase
  3: 10 * 60, // Acceptance voting phase
  4: 15 * 60, // Results phase
}

const MAX_CARDS_PER_GROUP = 10

const SessionPhases: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const { sessionId = "", phase: phaseParam = "1" } = useParams<{
    sessionId: string
    phase: string
  }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState(1)
  const [round, setRound] = useState(0)
  const [showEndPhaseConfirm, setShowEndPhaseConfirm] = useState(false)
  const prevPhaseRef = useRef(1)
  const initialLoadRef = useRef(true)
  const userGroupIdRef = useRef<number | null>(null)
  const userGroupIndexRef = useRef<number>(-1)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Track selected cards by group
  const [selectedCardsByGroup, setSelectedCardsByGroup] = useState<Record<number, SelectedCard[]>>({})

  // Track all cards that were ever selected in phase 1 (for reselection)
  const [everSelectedCardsByGroup, setEverSelectedCardsByGroup] = useState<Record<number, Set<number>>>({})

  // Track CO2 estimations and acceptance levels by group and cardId
  const [co2Estimations, setCO2Estimations] = useState<Record<number, Record<number, number>>>({})
  const [acceptanceLevels, setAcceptanceLevels] = useState<
    Record<number, Record<number, "high" | "medium" | "low" | null>>
  >({})

  // Track total CO2
  const [totalCO2, setTotalCO2] = useState(0)

  const {
    loading,
    error,
    session,
    groups,
    deck,
    cards: allCards,
    categories,
    tables,
    setTables,
  } = useSessionData(sessionId)

  // Derive current table index (and group) to ensure we reference the correct group
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentGroupId = tables[currentIndex]?.groupId || 0

  // Find the user's group ID and index if they are a player
  useEffect(() => {
    const findUserGroup = async () => {
      if (!isAdmin && user && groups.length > 0 && tables.length > 0) {
        try {
          // We need to fetch the group players data since it's not included in the groups
          const userGroups = []

          // Check each group to find which one the user belongs to
          for (const group of groups) {
            try {
              // Assuming there's a groupPlayerService that can get players by group ID
              const groupPlayers = await groupPlayerService.getGroupPlayersByGroupId(group.groupId)

              // Check if the current user is in this group
              const isUserInGroup = groupPlayers.some((player) => player.userId === user.userId)

              if (isUserInGroup) {
                userGroups.push(group)
              }
            } catch (error) {
              console.error(`Error fetching players for group ${group.groupId}:`, error)
            }
          }

          if (userGroups.length > 0) {
            // Use the first group the user is in
            const userGroup = userGroups[0]
            userGroupIdRef.current = userGroup.groupId

            // Find the index of the user's group in the tables array
            const userGroupIndex = tables.findIndex((table) => table.groupId === userGroup.groupId)
            if (userGroupIndex !== -1) {
              userGroupIndexRef.current = userGroupIndex

              // Set the initial table based on phase
              updateTableForPlayerBasedOnPhase(userGroupIndex)
            } else {
              console.warn(`Could not find table for user's group ${userGroup.groupId}`)
            }
          } else {
            console.warn("User not found in any group")
          }
        } catch (error) {
          console.error("Error finding user's group:", error)
        }
      }
    }

    findUserGroup()
  }, [isAdmin, user, groups, tables, phase])

  // Function to update the current table for players based on phase
  const updateTableForPlayerBasedOnPhase = useCallback(
    (userGroupIndex: number) => {
      if (tables.length === 0 || userGroupIndex < 0) return

      console.log(`Updating table for player based on phase ${phase}, user group index: ${userGroupIndex}`)

      if (phase === 1) {
        // In phase 1, show the player's own table
        console.log(`Phase 1: Setting current index to ${userGroupIndex}`)
        setCurrentIndex(userGroupIndex)
      } else if (phase === 2) {
        // In phase 2, show the next table (circular)
        const nextIndex = (userGroupIndex + 1) % tables.length
        console.log(`Phase 2: Setting current index to ${nextIndex}`)
        setCurrentIndex(nextIndex)
      } else if (phase === 3) {
        // In phase 3, show the table after the next one (circular)
        const nextNextIndex = (userGroupIndex + 2) % tables.length
        console.log(`Phase 3: Setting current index to ${nextNextIndex}`)
        setCurrentIndex(nextNextIndex)
      } else if (phase === 4) {
        // In phase 4, show the player's own table again
        console.log(`Phase 4: Setting current index to ${userGroupIndex}`)
        setCurrentIndex(userGroupIndex)
      }
    },
    [phase, tables.length, setCurrentIndex],
  )

  // Update table when phase changes for players
  useEffect(() => {
    if (!isAdmin && userGroupIndexRef.current !== -1 && tables.length > 0) {
      updateTableForPlayerBasedOnPhase(userGroupIndexRef.current)
    }
  }, [isAdmin, phase, tables.length, updateTableForPlayerBasedOnPhase])

  // Initialize on first load
  useEffect(() => {
    if (initialLoadRef.current && !loading && groups.length > 0) {
      initialLoadRef.current = false
    }
  }, [loading, groups])

  // Filter cards based on phase
  const cards = React.useMemo(() => {
    if (phase === 1) return allCards
    const allEverSelectedCardIds = new Set<number>()
    Object.values(everSelectedCardsByGroup).forEach((cardIds) => {
      cardIds.forEach((id) => allEverSelectedCardIds.add(id))
    })
    if (allEverSelectedCardIds.size === 0) {
      return allCards
    }
    return allCards.filter((card) => allEverSelectedCardIds.has(card.cardId))
  }, [allCards, phase, everSelectedCardsByGroup])

  // Initialize selectedCardsByGroup and everSelectedCardsByGroup when groups are loaded
  useEffect(() => {
    if (groups.length > 0) {
      const initialSelectedCards: Record<number, SelectedCard[]> = {}
      const initialEverSelectedCards: Record<number, Set<number>> = {}
      groups.forEach((group) => {
        initialSelectedCards[group.groupId] = []
        initialEverSelectedCards[group.groupId] = new Set()
      })
      setSelectedCardsByGroup(initialSelectedCards)
      setEverSelectedCardsByGroup(initialEverSelectedCards)
    }
  }, [groups])

  // Update phase when URL param changes and track phase changes
  useEffect(() => {
    const newPhase = Number.parseInt(phaseParam, 10)
    if (!isNaN(newPhase) && newPhase >= 1 && newPhase <= 4) {
      prevPhaseRef.current = phase
      setPhase(newPhase)
      if (newPhase > 1 && phase === 1) {
        setEverSelectedCardsByGroup((prev) => {
          const updated = { ...prev }
          Object.entries(selectedCardsByGroup).forEach(([groupId, cards]) => {
            const groupIdNum = Number(groupId)
            const cardIds = cards.map((card) => card.cardId)
            updated[groupIdNum] = new Set(cardIds)
          })
          return updated
        })
      }
    }
  }, [phaseParam, phase, selectedCardsByGroup])


  // Socket handlers
  const handleCardSelected = useCallback(
    (groupId: number, cardId: number, selected: boolean, selectedCards: SelectedCard[]) => {
      if (selectedCardsByGroup && selectedCardsByGroup[groupId] && selectedCardsByGroup[groupId].length !== selectedCards.length && (userGroupIdRef.current === null || userGroupIdRef.current == groupId)) // Admin ou Joueurs sur la table N

      console.log("selectedCardsByGroup[groupId]", selectedCardsByGroup[groupId], selectedCards)
        if(selectedCardsByGroup[groupId].length < selectedCards.length)
          setNotification({ message: "Une carte vient d'être sélectionnée. ", type: "success" });
        else 
          setNotification({ message: "Une carte vient d'être désélectionnée. ", type: "success" });

      setSelectedCardsByGroup((prev) => ({
        ...prev,
        [groupId]: selectedCards,
      }))
      if (phase === 1 && selected) {
        setEverSelectedCardsByGroup((prev) => {
          const updated = { ...prev }
          if (!updated[groupId]) {
            updated[groupId] = new Set()
          }
          updated[groupId].add(cardId)
          return updated
        })
      }
      setTables((prev) =>
        prev.map((table) => {
          if (table.groupId === groupId) {
            return {
              ...table,
              cards: table.cards.map((card) => ({
                ...card,
                selected: selectedCards.some((sc) => sc.cardId === card.cardId),
              })),
            }
          }
          return table
        }),
      )
    },
    [setTables, phase],
  )

  const handleGroupCardsUpdated = useCallback(
    (groups: { groupId: number; selectedCards: SelectedCard[] }[]) => {
      const newSelectedCards: Record<number, SelectedCard[]> = { ...selectedCardsByGroup }
      groups.forEach(({ groupId, selectedCards }) => {
        newSelectedCards[groupId] = selectedCards
        if (phase === 1) {
          setEverSelectedCardsByGroup((prev) => {
            const updated = { ...prev }
            if (!updated[groupId]) {
              updated[groupId] = new Set()
            }
            selectedCards.forEach((card) => {
              updated[groupId].add(card.cardId)
            })
            return updated
          })
        }
      })
      setSelectedCardsByGroup(newSelectedCards)
      setTables((prev) =>
        prev.map((table) => {
          const groupData = groups.find((g) => g.groupId === table.groupId)
          if (groupData) {
            return {
              ...table,
              cards: table.cards.map((card) => ({
                ...card,
                selected: groupData.selectedCards.some((sc) => sc.cardId === card.cardId),
              })),
            }
          }
          return table
        }),
      )
    },
    [selectedCardsByGroup, setTables, phase],
  )

  const handlePhaseChanged = useCallback(
    (newPhase: number, status: string) => {
      const parsedPhase = Number.parseInt(String(newPhase), 10)
      if (!isNaN(parsedPhase) && parsedPhase >= 1 && parsedPhase <= 4) {
        prevPhaseRef.current = phase
        if (parsedPhase > 1 && phase === 1) {
          setEverSelectedCardsByGroup((prev) => {
            const updated = { ...prev }
            Object.entries(selectedCardsByGroup).forEach(([groupId, cards]) => {
              const groupIdNum = Number(groupId)
              const cardIds = cards.map((card) => card.cardId)
              updated[groupIdNum] = new Set(cardIds)
            })
            return updated
          })
        }

        if(parsedPhase>phase)
          setNotification({ message: "La phase " + parsedPhase + " vient de débuter.", type: "success" });
        setPhase(parsedPhase)
        navigate(`/games/${sessionId}/phase/${parsedPhase}`)

        // Update table for player when phase changes
        if (!isAdmin && userGroupIndexRef.current !== -1) {
          updateTableForPlayerBasedOnPhase(userGroupIndexRef.current)
        }
      }
    },
    [navigate, sessionId, phase, selectedCardsByGroup, isAdmin, updateTableForPlayerBasedOnPhase],
  )

  const handleRoundChanged = useCallback(
    (newRound: number) => {
      if (round !== newRound) setNotification({ message: "Le tour vient de se terminer. ", type: "success" });
      setRound(newRound)
    },
    [],
  )

  const handleCO2Updated = useCallback((newTotalCO2: number) => {
    setTotalCO2(newTotalCO2)
  }, [])

  const handleCO2Estimation = useCallback((groupId: number, cardId: number, value: number) => {
    console.log("CO2 estimation", co2Estimations, groupId, cardId, value)
    if (co2Estimations && co2Estimations[groupId] && co2Estimations[groupId][cardId] !== value && (userGroupIdRef.current === null || userGroupIdRef.current == groupId)) // Admin ou Joueurs sur la table N
      setNotification({ message: "Une estimation en CO2 vient d'être modifiée. ", type: "success" });

    setCO2Estimations((prev) => {
      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [cardId]: value,
        },
      }
    })

  }, [])

  const handleAcceptanceLevel = useCallback(
    (groupId: number, cardId: number, level: "high" | "medium" | "low" | null) => {

      if (acceptanceLevels && acceptanceLevels[groupId] && acceptanceLevels[groupId][cardId] !== level && (userGroupIdRef.current === null || userGroupIdRef.current == groupId)) // Admin ou Joueurs sur la table N
        setNotification({ message: "Un niveau d'acceptation vient d'être modifié. ", type: "success" });

      setAcceptanceLevels((prev) => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [cardId]: level,
        },
      }))
    },
    [],
  )

  const {
    emitChangePhase,
    emitSelectCard,
    emitCO2Estimation,
    emitAcceptanceLevel,
    emitEndPhase,
    emitEndSession,
  } = useSessionSocket({
    sessionId,
    onCardSelected: handleCardSelected,
    onPhaseChanged: handlePhaseChanged,
    onRoundChanged: handleRoundChanged,
    onCO2Updated: handleCO2Updated,
    onGroupCardsUpdated: handleGroupCardsUpdated,
    onCO2Estimation: handleCO2Estimation,
    onAcceptanceLevel: handleAcceptanceLevel,
    onError: (error) => console.error(error),
  })

  // Handle CO2 estimation from the UI
  const handleCO2Estimate = useCallback(
    (groupId: number, cardId: number, value: number) => {
      if (isAdmin && currentGroupId) {
        emitCO2Estimation(groupId, cardId, value).catch((error) =>
          console.error("Failed to emit CO2 estimation:", error),
        )
      }
    },
    [emitCO2Estimation, currentGroupId, isAdmin],
  )

  // Handle acceptance level change from the UI
  const handleAcceptanceChange = useCallback(
    (groupId: number, cardId: number, level: "high" | "medium" | "low" | null) => {
      if (isAdmin && currentGroupId) {
        emitAcceptanceLevel(groupId, cardId, level).catch((error) =>
          console.error("Failed to emit acceptance level:", error),
        )
      }
    },
    [emitAcceptanceLevel, currentGroupId, isAdmin],
  )

  // Handle card select event
  const handleCardSelect = useCallback(
    async (groupId: number, cardId: number) => {
      if (!isAdmin) return // Uniquement les admins peuvent faire ça

      try {
        const groupSelectedCards = selectedCardsByGroup[groupId] || []
        const isCurrentlySelected = groupSelectedCards.some((card) => card.cardId === cardId)
        if (!isCurrentlySelected && groupSelectedCards.length > MAX_CARDS_PER_GROUP) {
          console.warn(`Maximum de cartes (${MAX_CARDS_PER_GROUP}) deja selectionnees pour le groupe ${groupId}`)
          return
        }
        await emitSelectCard(groupId, cardId)
      } catch (error) {
        console.error("Failed to select/unselect card:", error)
      }
    },
    [emitSelectCard, selectedCardsByGroup, isAdmin],
  )

  const handleNavigatePhase = useCallback(
    async (direction: "next" | "prev") => {
      if (!isAdmin) return // Only admins can navigate phases

      const newPhase = direction === "next" ? phase + 1 : phase - 1
      if (newPhase >= 1 && newPhase <= 4) {
        try {
          await emitChangePhase(newPhase)
        } catch (error) {
          console.error("Failed to change phase:", error)
        }
      }
    },
    [phase, emitChangePhase, isAdmin],
  )

  const handleEndPhase = useCallback(() => {
    if (isAdmin) {
      setShowEndPhaseConfirm(true)
    }
  }, [isAdmin])

  const confirmEndPhase = useCallback(async () => {
    if (!isAdmin) return

    try {
      await emitEndPhase()
      setShowEndPhaseConfirm(false)
    } catch (error) {
      console.error("Failed to end phase:", error)
    }
  }, [emitEndPhase, isAdmin])

  const handleEndSession = useCallback(async () => {
    if (!isAdmin) return

    if (window.confirm("Êtes-vous sur de vouloir terminer la session ?")) {
      try {
        await emitEndSession()
        navigate("/games")
      } catch (error) {
        console.error("Failed to end session:", error)
      }
    }
  }, [emitEndSession, navigate, isAdmin])

  const currentCategory = categories[round] || null

  // Get the player's current view description based on phase
  const getPlayerViewDescription = () => {
    if (!isAdmin && userGroupIndexRef.current !== -1) {
      const userGroupIndex = userGroupIndexRef.current

      if (phase === 1) {
        return "Votre table - Phase de sélection"
      } else if (phase === 2) {
        const nextGroupIndex = (userGroupIndex + 1) % tables.length
        const nextGroup = groups.find((g) => g.groupId === tables[nextGroupIndex]?.groupId)
        return `Table de ${nextGroup?.groupName || "groupe suivant"} - Phase d'estimation CO2`
      } else if (phase === 3) {
        const nextNextGroupIndex = (userGroupIndex + 2) % tables.length
        const nextNextGroup = groups.find((g) => g.groupId === tables[nextNextGroupIndex]?.groupId)
        return `Table de ${nextNextGroup?.groupName || "groupe suivant"} - Phase de vote d'acceptation`
      } else if (phase === 4) {
        return "Votre table - Phase de résultats"
      }
    }
    return null
  }

  const playerViewDescription = getPlayerViewDescription()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
        <Link to="/games" className="mt-4 inline-block text-green-600 hover:text-green-700">
          ← Retour aux sessions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          duration={3000}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <Link to="/games" className="flex items-center text-gray-600 hover:text-gray-800">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Retour aux sessions
          </Link>
          <div className="flex items-center gap-4">
            {!isAdmin && (
              <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <Eye className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Mode spectateur</span>
              </div>
            )}
            {isAdmin && (<button
              onClick={() => handleNavigatePhase("prev")}
              disabled={phase === 1 || !isAdmin}
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>)}
            <span className="text-xl font-semibold">Phase {phase} / 4</span>
            {isAdmin && (<button
              onClick={() => handleNavigatePhase("next")}
              disabled={phase === 4 || !isAdmin}
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>)}
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6">{session?.sessionName}</h1>

        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">État Actuel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-green-800">
              <strong>Phase :</strong> {phase === 1 && "Sélection des cartes"}
              {phase === 2 && "Estimation CO2"}
              {phase === 3 && "Vote d'acceptation"}
              {phase === 4 && "Résultats"}
            </div>
            <div className="text-green-800">
              <strong>Tour :</strong> {round + 1}/{categories.length}
              {currentCategory && ` - ${currentCategory.categoryName}`}
            </div>
          </div>
        </div>

        {/* Only show CO2 and card count to admins */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Progression</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700">
                  Réduction totale de CO2 : <span className="font-bold text-green-600">{totalCO2}</span>
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  Cartes sélectionnées :{" "}
                  <span className="font-bold text-blue-600">
                    {Object.values(selectedCardsByGroup).reduce((sum, cards) => sum + cards.length, 0)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Player view description */}
        {playerViewDescription && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-800">{playerViewDescription}</h3>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleEndPhase}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
            >
              <AlertTriangle className="inline-block w-4 h-4 mr-2" />
              Finir le tour courant
            </button>
            {phase === 4 && (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                Conclure la session
              </button>
            )}
          </div>
        )}

        {showEndPhaseConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-lg font-bold mb-4">Fin du tour courant ?</h3>
              <p className="mb-6">Êtes-vous sûr que vous souhaitez terminer le tour courant ?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowEndPhaseConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmEndPhase}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Terminer le tour
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-[400px]">
          <TableCarousel
            tables={tables}
            groups={groups}
            categories={categories}
            cards={cards}
            selectedCardsByGroup={selectedCardsByGroup}
            onCardSelect={handleCardSelect}
            onCO2Estimate={handleCO2Estimate}
            onAcceptanceChange={handleAcceptanceChange}
            sessionId={sessionId}
            currentRound={round}
            phase={phase}
            maxSelectableCards={MAX_CARDS_PER_GROUP}
            currentCategory={currentCategory}
            co2Estimations={co2Estimations}
            acceptanceLevels={acceptanceLevels}
            isReadOnly={!isAdmin}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            userGroupId={userGroupIdRef.current}
            hideCO2ForPlayers={!isAdmin}
          />
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Détails de sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span>Durée : {Math.floor(PHASE_DURATIONS[phase as keyof typeof PHASE_DURATIONS] / 60)} minutes</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <span>Groupes : {groups.length}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-5 w-5 text-green-600 mr-2" />
              <span>Deck : {deck?.deckName}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-5 w-5 text-green-600 mr-2" />
              <span>Catégories : {categories.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionPhases

