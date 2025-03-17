import React, { useState, useCallback, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Clock, Users, Target, AlertTriangle } from "lucide-react"
import { TableCarousel } from "../components/Sessions/carousel/TableCarousel"
import CardZoomedInTableModal from "../components/Sessions/card/CardZoomedInTableModal"
import { useSessionSocket } from "../hooks/useSessionSocket"
import { useSessionData } from "../hooks/useSessionData"
import type { SelectedCard, GameCard } from "../types/game"

const PHASE_DURATIONS = {
  1: 35 * 60, // Card selection phase
  2: 10 * 60, // CO2 estimation phase
  3: 10 * 60, // Acceptance voting phase
  4: 15 * 60, // Results phase
}

const MAX_CARDS_PER_GROUP = 10

const SessionPhases: React.FC = () => {
  const { sessionId = "", phase: phaseParam = "1" } = useParams<{ sessionId: string; phase: string }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState(1)
  const [round, setRound] = useState(0)
  const [showEndPhaseConfirm, setShowEndPhaseConfirm] = useState(false)
  const [selectedModalCard, setSelectedModalCard] = useState<GameCard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Track selected cards by group
  const [selectedCardsByGroup, setSelectedCardsByGroup] = useState<Record<number, SelectedCard[]>>({})

  // Track CO2 estimations and acceptance levels
  const [co2Estimations, setCO2Estimations] = useState<Record<number, number>>({})
  const [acceptanceLevels, setAcceptanceLevels] = useState<Record<number, "high" | "medium" | "low" | null>>({})

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

  // Filter cards based on phase
  const cards = React.useMemo(() => {
    if (phase === 1) return allCards

    // For phases 2-4, we'll show all selected cards across all groups
    // The TableCarousel component will filter them per table
    const allSelectedCardIds = new Set<number>()
    Object.values(selectedCardsByGroup).forEach((groupCards) => {
      groupCards.forEach((card) => allSelectedCardIds.add(card.cardId))
    })

    return allCards.filter((card) => allSelectedCardIds.has(card.cardId))
  }, [allCards, phase, selectedCardsByGroup])

  // Initialize selectedCardsByGroup when groups are loaded
  useEffect(() => {
    if (groups.length > 0) {
      const initialSelectedCards: Record<number, SelectedCard[]> = {}
      groups.forEach((group) => {
        initialSelectedCards[group.groupId] = []
      })
      setSelectedCardsByGroup(initialSelectedCards)
    }
  }, [groups])

  // Update phase when URL param changes
  useEffect(() => {
    const newPhase = Number.parseInt(phaseParam, 10)
    if (!isNaN(newPhase) && newPhase >= 1 && newPhase <= 4) {
      setPhase(newPhase)
    }
  }, [phaseParam])

  // Handle card click for modal
  const handleCardClick = useCallback((card: GameCard) => {
    setSelectedModalCard(card)
    setIsModalOpen(true)
  }, [])

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedModalCard(null)
  }, [])

  // Handle CO2 estimation
  const handleCO2Estimate = useCallback((cardId: number, value: number) => {
    setCO2Estimations((prev) => ({ ...prev, [cardId]: value }))
  }, [])

  // Handle acceptance level change
  const handleAcceptanceChange = useCallback((cardId: number, level: "high" | "medium" | "low" | null) => {
    setAcceptanceLevels((prev) => ({ ...prev, [cardId]: level }))
  }, [])

  // Socket handlers
  const handleCardSelected = useCallback(
    (groupId: number, cardId: number, selected: boolean, selectedCards: SelectedCard[]) => {
      setSelectedCardsByGroup((prev) => ({
        ...prev,
        [groupId]: selectedCards,
      }))

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
    [setTables],
  )

  const handleGroupCardsUpdated = useCallback(
    (groups: { groupId: number; selectedCards: SelectedCard[] }[]) => {
      const newSelectedCards: Record<number, SelectedCard[]> = { ...selectedCardsByGroup }
      groups.forEach(({ groupId, selectedCards }) => {
        newSelectedCards[groupId] = selectedCards
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
    [selectedCardsByGroup, setTables],
  )

  const handlePhaseChanged = useCallback(
    (newPhase: number, status: string) => {
      const parsedPhase = Number.parseInt(String(newPhase), 10)
      if (!isNaN(parsedPhase) && parsedPhase >= 1 && parsedPhase <= 4) {
        setPhase(parsedPhase)
        navigate(`/games/${sessionId}/phase/${parsedPhase}`)
      }
    },
    [navigate, sessionId],
  )

  const handleRoundChanged = useCallback((newRound: number) => {
    setRound(newRound)
  }, [])

  const handleCO2Updated = useCallback((newTotalCO2: number) => {
    setTotalCO2(newTotalCO2)
  }, [])

  const { emitChangePhase, emitSelectCard, emitEndPhase, emitEndSession, connectionError } = useSessionSocket({
    sessionId,
    onCardSelected: handleCardSelected,
    onPhaseChanged: handlePhaseChanged,
    onRoundChanged: handleRoundChanged,
    onCO2Updated: handleCO2Updated,
    onGroupCardsUpdated: handleGroupCardsUpdated,
    onError: (error) => console.error(error),
  })

  const handleNavigatePhase = useCallback(
    async (direction: "next" | "prev") => {
      const newPhase = direction === "next" ? phase + 1 : phase - 1
      if (newPhase >= 1 && newPhase <= 4) {
        try {
          await emitChangePhase(newPhase)
        } catch (error) {
          console.error("Failed to change phase:", error)
        }
      }
    },
    [phase, emitChangePhase],
  )

  const handleEndPhase = useCallback(() => {
    setShowEndPhaseConfirm(true)
  }, [])

  const confirmEndPhase = useCallback(async () => {
    try {
      await emitEndPhase()
      setShowEndPhaseConfirm(false)
    } catch (error) {
      console.error("Failed to end phase:", error)
    }
  }, [emitEndPhase])

  const handleEndSession = useCallback(async () => {
    if (window.confirm("Are you sure you want to end the session?")) {
      try {
        await emitEndSession()
        navigate("/games")
      } catch (error) {
        console.error("Failed to end session:", error)
      }
    }
  }, [emitEndSession, navigate])

  const handleCardSelect = useCallback(
    async (groupId: number, cardId: number) => {
      try {
        const groupSelectedCards = selectedCardsByGroup[groupId] || []
        const isCurrentlySelected = groupSelectedCards.some((card) => card.cardId === cardId)

        if (!isCurrentlySelected && groupSelectedCards.length >= MAX_CARDS_PER_GROUP) {
          return
        }

        await emitSelectCard(groupId, cardId)
      } catch (error) {
        console.error("Failed to select card:", error)
      }
    },
    [emitSelectCard, selectedCardsByGroup],
  )

  const currentCategory = categories[round] || null
  const currentGroupId = tables[0]?.groupId || 0

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
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Link to="/games" className="mt-4 inline-block text-green-600 hover:text-green-700">
          ← Back to sessions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <Link to="/games" className="flex items-center text-gray-600 hover:text-gray-800">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to sessions
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigatePhase("prev")}
              disabled={phase === 1}
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xl font-semibold">Phase {phase}</span>
            <button
              onClick={() => handleNavigatePhase("next")}
              disabled={phase === 4}
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6">{session?.sessionName}</h1>

        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Current Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-green-800">
              <strong>Phase:</strong> {phase === 1 && "Card Selection"}
              {phase === 2 && "CO2 Estimation"}
              {phase === 3 && "Acceptance Voting"}
              {phase === 4 && "Results"}
            </div>
            <div className="text-green-800">
              <strong>Round:</strong> {round + 1} of {categories.length}
              {currentCategory && ` - ${currentCategory.categoryName}`}
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700">
                Total CO2 Reduction: <span className="font-bold text-green-600">{totalCO2}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                Selected Cards:{" "}
                <span className="font-bold text-blue-600">
                  {Object.values(selectedCardsByGroup).reduce((sum, cards) => sum + cards.length, 0)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleEndPhase}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
          >
            <AlertTriangle className="inline-block w-4 h-4 mr-2" />
            End Current Round
          </button>
          {phase === 4 && (
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              End Session
            </button>
          )}
        </div>

        {showEndPhaseConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-lg font-bold mb-4">End Current Round?</h3>
              <p className="mb-6">Are you sure you want to end the current round?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowEndPhaseConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndPhase}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  End Round
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
            sessionId={sessionId}
            currentRound={round}
            phase={phase}
            maxSelectableCards={MAX_CARDS_PER_GROUP}
            currentCategory={currentCategory}
          />
        </div>

        {selectedModalCard && (
          <CardZoomedInTableModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            cardData={selectedModalCard}
            categoryName={currentCategory?.categoryName}
            isSelected={selectedCardsByGroup[currentGroupId]?.some((card) => card.cardId === selectedModalCard.cardId)}
            onSelect={() => handleCardSelect(currentGroupId, selectedModalCard.cardId)}
            phase={phase}
            co2Estimation={co2Estimations[selectedModalCard.cardId]}
            acceptanceLevel={acceptanceLevels[selectedModalCard.cardId]}
            onCO2Estimate={(value) => handleCO2Estimate(selectedModalCard.cardId, value)}
            onAcceptanceChange={(level) => handleAcceptanceChange(selectedModalCard.cardId, level)}
          />
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span>Duration: {Math.floor(PHASE_DURATIONS[phase as keyof typeof PHASE_DURATIONS] / 60)} minutes</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <span>Groups: {groups.length}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-5 w-5 text-green-600 mr-2" />
              <span>Deck: {deck?.deckName}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-5 w-5 text-green-600 mr-2" />
              <span>Categories: {categories.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionPhases

