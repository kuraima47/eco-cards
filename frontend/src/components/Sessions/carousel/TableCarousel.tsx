import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import type { TableData, Category, Group, GameCard, SelectedCard } from "../../../types/game"
import { TableSurface } from "../table/TableSurface"
import QRCodeReader from "../../QRCode/QRCodeReader"
import { QrCode, Info, ChevronLeft, ChevronRight, X, Sparkles, Eye } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { toPascalCase } from "../../../utils/formatting"

interface TableCarouselProps {
  tables: TableData[]
  groups: Group[]
  categories: Category[]
  cards: GameCard[]
  selectedCardsByGroup: Record<number, SelectedCard[]>
  onCardSelect: (groupId: number, cardId: number) => void
  onCO2Estimate?: (groupId: number, cardId: number, value: number) => void
  onAcceptanceChange?: (groupId: number, cardId: number, level: "high" | "medium" | "low" | null) => void
  sessionId: string
  currentRound: number
  phase: number
  maxSelectableCards?: number
  currentCategory: Category | null
  co2Estimations?: Record<number, Record<number, number>>
  acceptanceLevels?: Record<number, Record<number, "high" | "medium" | "low" | null>>
  isReadOnly?: boolean
  currentIndex?: number
  setCurrentIndex?: (index: number) => void
  userGroupId?: number | null
  hideCO2ForPlayers?: boolean
}

export const TableCarousel: React.FC<TableCarouselProps> = ({
  tables,
  groups,
  cards,
  selectedCardsByGroup,
  onCardSelect,
  phase,
  maxSelectableCards = 10,
  currentCategory,
  co2Estimations = {},
  acceptanceLevels = {},
  onCO2Estimate,
  onAcceptanceChange,
  isReadOnly = false,
  currentIndex: controlledIndex,
  setCurrentIndex: setControlledIndex,
  userGroupId,
  hideCO2ForPlayers = false,
}) => {

  useEffect(() => {
    if (controlledIndex !== undefined) {
      console.log(`TableCarousel: Using controlled index ${controlledIndex}`)
    }
  }, [controlledIndex])
  const [internalIndex, setInternalIndex] = useState(0)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)

  // Use either controlled or internal index
  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex
  const setCurrentIndex = (index: number) => {
    if (setControlledIndex) {
      setControlledIndex(index)
    } else {
      setInternalIndex(index)
    }
  }

  const iconName = currentCategory?.categoryIcon ? toPascalCase(currentCategory?.categoryIcon) : "Box"
  const IconComponent = (LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Box) as React.ElementType

  // Ensure currentIndex is valid when tables change
  useEffect(() => {
    if (currentIndex >= tables.length) {
      const newIndex = Math.max(0, tables.length - 1)
      console.log(
        `TableCarousel: Adjusting index from ${currentIndex} to ${newIndex} (tables length: ${tables.length})`,
      )
      setCurrentIndex(newIndex)
    }
  }, [tables.length, currentIndex])

  const handlePrevious = useCallback(() => {
    if (isReadOnly) return // Disable navigation for read-only mode

    setAnimateCards(true)
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : tables.length - 1)
    setTimeout(() => setAnimateCards(false), 700)
  }, [tables.length, currentIndex, isReadOnly])

  const handleNext = useCallback(() => {
    if (isReadOnly) return // Disable navigation for read-only mode

    setAnimateCards(true)
    setCurrentIndex(currentIndex < tables.length - 1 ? currentIndex + 1 : 0)
    setTimeout(() => setAnimateCards(false), 700)
  }, [tables.length, currentIndex, isReadOnly])

  const categoryCards = useMemo(() => {
    if (!currentCategory) return []
    return cards.filter((card) => card.cardCategoryId === currentCategory.categoryId)
  }, [cards, currentCategory])

  const currentTable = tables[currentIndex] || { groupId: 0, id: 0, category: null, cards: [] }
  const currentGroup = groups.find((g) => g.groupId === currentTable?.groupId)
  const currentGroupId = currentTable?.groupId || 0

  // Get selected cards for current group
  const selectedCardsForCurrentGroup = useMemo(() => {
    return selectedCardsByGroup[currentGroupId] || []
  }, [selectedCardsByGroup, currentGroupId])

  // Get selected card IDs for current group
  const selectedCardIds = useMemo(() => {
    return selectedCardsForCurrentGroup.map((card) => card.cardId)
  }, [selectedCardsForCurrentGroup])

  // Calculate total CO2 for the current table
  const tableCO2 = useMemo(() => {
    return selectedCardsForCurrentGroup.reduce((sum, card) => {
      const cardCO2 =
        co2Estimations[currentGroupId]?.[card.cardId] !== undefined
          ? co2Estimations[currentGroupId]?.[card.cardId]
          : card.cardValue || 0
      return sum + cardCO2
    }, 0)
  }, [selectedCardsForCurrentGroup, co2Estimations, currentGroupId])

  // Handle card selection
  const handleCardSelect = useCallback(
    (groupId: number, cardId: number) => {
      if (isReadOnly) return // Don't allow selection in read-only mode
      onCardSelect(groupId, cardId)
    },
    [onCardSelect, isReadOnly],
  )

  // Fixed CO2 estimation handler to ensure correct values are passed
  const handleCO2Estimate = useCallback(
    (cardId: number, value: number) => {
      if (isReadOnly) return // Don't allow CO2 estimation in read-only mode
      if (onCO2Estimate) {
        onCO2Estimate(currentGroupId, cardId, value)
      }
    },
    [onCO2Estimate, currentGroupId, isReadOnly],
  )

  // Acceptance level handler to ensure correct values are passed
  const handleAcceptanceChange = useCallback(
    (cardId: number, level: "high" | "medium" | "low" | null) => {
      if (isReadOnly) return // Don't allow acceptance level changes in read-only mode
      if (onAcceptanceChange) {
        onAcceptanceChange(currentGroupId, cardId, level)
      }
    },
    [onAcceptanceChange, currentGroupId, isReadOnly],
  )

  const tableCards = useMemo(() => {
    if (!currentCategory) return []
    const filteredCategoryCards = cards.filter((card) => card.cardCategoryId === currentCategory.categoryId)
    if (phase === 1) {
      return filteredCategoryCards
    }
    const groupSelectedCards = selectedCardsByGroup[currentGroupId] || []
    const groupSelectedCardIds = new Set(groupSelectedCards.map((card) => card.cardId))
    return filteredCategoryCards.filter((card) => groupSelectedCardIds.has(card.cardId))
  }, [cards, currentCategory, phase, selectedCardsByGroup, currentGroupId])

  // Determine if the current table is the user's own table
  const isUserTable = userGroupId !== undefined && userGroupId === currentGroupId

  return (
    <div className="flex flex-col w-full relative h-[calc(100vh-10rem)] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
      {/* Component Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-4 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowInfoModal(true)}
            className="focus:outline-none hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label="Show game information"
          >
            <Info size={22} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight">
              {currentGroup?.groupName || `Table ${currentIndex + 1}`}
              {isUserTable && isReadOnly && (
                <span className="ml-2 text-sm bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Votre table</span>
              )}
            </h2>
            <div className="flex items-center gap-2 justify-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-200 text-emerald-800">
                <IconComponent size={12} className="mr-1" />
                {currentCategory?.categoryName || "No category"}
              </span>
              {isReadOnly && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                  <Eye size={12} className="mr-1" />
                  Spectateur
                </span>
              )}
            </div>
          </div>
          <button
            className="focus:outline-none hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={() => !isReadOnly && setShowQRScanner(true)}
            disabled={isReadOnly}
            aria-label="Scan QR code"
          >
            {!isReadOnly && (<QrCode size={22} className={isReadOnly ? "opacity-50" : ""} />)}
          </button>
        </div>
      </div>

      {/* Game Stats Bar - Hide CO2 for players if specified */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">Selectionné</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedCardIds.length / maxSelectableCards) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {selectedCardIds.length}/{maxSelectableCards}
              </span>
            </div>
          </div>
        </div>

        {/* Only show CO2 counter if not hidden for players or if admin */}
        {!hideCO2ForPlayers && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 dark:text-slate-400">Réduction en CO2</span>
              <div className="flex items-end">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{tableCO2}</span>
                <Sparkles size={16} className="ml-1 text-amber-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow relative perspective-1000 min-h-[350px] max-h-[calc(100%-10rem)]">
        <div className="absolute inset-0 overflow-hidden">
          {tables.map((table, index) => {
            const distance = index - currentIndex
            const isActive = index === currentIndex
            const tableGroupId = table.groupId
            const tableSelectedCards = selectedCardsByGroup[tableGroupId] || []
            const tableSelectedCardIds = tableSelectedCards.map((card) => card.cardId)
            let cardsForTable = categoryCards
            if (phase > 1) {
              cardsForTable = categoryCards.filter((card) => tableSelectedCardIds.includes(card.cardId))
            }

            const style: React.CSSProperties = {
              transform: `translate(-50%, -50%) translateX(${distance * 100}%) translateZ(${isActive ? 0 : -500}px) rotateY(${distance * 45}deg)`,
              opacity: isActive ? 1 : 0.3,
              zIndex: isActive ? 1 : 0,
              position: "absolute",
              left: "50%",
              top: "50%",
            }

            return (
              <TableSurface
                key={table.id}
                tableId={table.id}
                groupId={tableGroupId}
                category={currentCategory}
                cards={isActive ? tableCards : cardsForTable}
                selectedCardIds={tableSelectedCardIds}
                groups={groups}
                isActive={isActive}
                style={style}
                onCardSelect={handleCardSelect}
                onCO2Estimate={handleCO2Estimate}
                onAcceptanceChange={handleAcceptanceChange}
                phase={phase}
                maxSelectableCards={maxSelectableCards}
                hideGroupInfo={true}
                co2Estimations={co2Estimations[tableGroupId] || {}}
                acceptanceLevels={acceptanceLevels[tableGroupId] || {}}
                isReadOnly={isReadOnly}
                hideCO2={hideCO2ForPlayers}
              />
            )
          })}
        </div>
      </div>

      {/* Navigation Controls - Only show if not in read-only mode or if admin */}
      {!isReadOnly && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          <button
            onClick={handlePrevious}
            className="bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-white p-3 rounded-full transition-colors shadow-lg border border-slate-200 dark:border-slate-700"
            aria-label="Previous table"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="bg-white/90 dark:bg-slate-800/90 px-6 py-3 rounded-full text-slate-700 dark:text-white flex items-center shadow-lg border border-slate-200 dark:border-slate-700">
            <span className="font-medium">{currentIndex + 1}</span>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-500 dark:text-slate-400">{tables.length}</span>
          </div>
          <button
            onClick={handleNext}
            className="bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-white p-3 rounded-full transition-colors shadow-lg border border-slate-200 dark:border-slate-700"
            aria-label="Next table"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Game Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Info size={20} className="mr-2 text-emerald-500" />
                Informations du jeu
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              {/* Nouvelle section: Explication des tours et phases */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <h4 className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 font-semibold">
                  Comment fonctionne le jeu
                </h4>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    <span className="font-medium text-blue-700 dark:text-blue-400">Tour :</span> Un tour correspond à une catégorie de cartes. Pendant chaque tour, vous travaillez avec les cartes d'une même catégorie.
                  </p>
                  <p>
                    <span className="font-medium text-blue-700 dark:text-blue-400">Phase :</span> Une phase comprend tous les tours (toutes les catégories). Quand une phase se termine, vous changez de table et la nature des activités évolue.
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Catégorie actuelle
                </h4>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                  <p className="text-lg font-medium text-slate-800 dark:text-white">
                    {currentCategory?.categoryName || "Aucune catégorie affectée"}
                  </p>
                </div>
              </div>

              {/* Only show CO2 info if not hidden for players or if admin */}
              {!hideCO2ForPlayers && (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Réduction CO2
                  </h4>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{tableCO2}</p>
                    <div className="flex items-center">
                      <Sparkles size={18} className="text-amber-500 mr-1" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">points</p>
                    </div>
                  </div>
                </div>
              )}

              {phase >= 3 && !hideCO2ForPlayers && (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Niveau d'acceptation
                  </h4>
                  <div className="space-y-2">
                    {selectedCardsForCurrentGroup.map((card) => {
                      const aLevel = acceptanceLevels[currentGroupId]?.[card.cardId]
                      const cardInfo = cards.find((c) => c.cardId === card.cardId)
                      return (
                        <div key={card.cardId} className="flex justify-between items-center">
                          <span className="text-sm truncate max-w-[180px]">
                            {cardInfo?.cardName || `Card ${card.cardId}`}
                          </span>
                          <span
                            className={`text-sm font-medium px-2 py-0.5 rounded ${aLevel === "high"
                                ? "bg-green-100 text-green-800"
                                : aLevel === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : aLevel === "low"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-slate-100 text-slate-800"
                              }`}
                          >
                            {aLevel ? aLevel.charAt(0).toUpperCase() + aLevel.slice(1) : "Not rated"}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Cartes sélectionnées
                </h4>
                <div className="space-y-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(selectedCardIds.length / maxSelectableCards) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {selectedCardIds.length} cartes sélectionnées
                    </span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {maxSelectableCards - selectedCardIds.length} restantes
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Groupe Courant
                </h4>
                <p className="text-lg font-medium text-slate-800 dark:text-white">
                  {currentGroup?.groupName || `Groupe ${currentGroupId}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && !isReadOnly && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <QrCode size={20} className="mr-2 text-emerald-500" />
                Scan QR Code
              </h3>
              <button
                onClick={() => setShowQRScanner(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 aspect-square rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600">
              <QRCodeReader
                phase={phase}
                onCO2Estimate={onCO2Estimate}
                onSelect={onCardSelect}
                onAcceptanceChange={onAcceptanceChange}
                group = {currentGroup}
              />
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
              Positionnez le QR code dans le cadre pour scanner
            </p>
            <button
              onClick={() => setShowQRScanner(false)}
              className="mt-4 w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableCarousel