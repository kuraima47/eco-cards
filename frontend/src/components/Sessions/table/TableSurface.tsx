import type React from "react"
import { useState, useCallback, useEffect } from "react"
import type { GameCard, Category, Group } from "../../../types/game"
import { PlayingCard } from "../card/PlayingCard"
import { AlertTriangle, Leaf, Sparkles } from "lucide-react"

interface TableSurfaceProps {
  tableId: number
  groupId: number
  category: Category | null
  cards: GameCard[]
  selectedCardIds: number[]
  groups?: Group[]
  isActive?: boolean
  style?: React.CSSProperties
  onCardSelect: (groupId: number, cardId: number) => void
  phase: number
  maxSelectableCards?: number
  hideGroupInfo?: boolean
  co2Estimations?: Record<number, number>
  acceptanceLevels?: Record<number, 'high' | 'medium' | 'low' | null>
}

export const TableSurface: React.FC<TableSurfaceProps> = ({
  tableId,
  groupId,
  category,
  cards,
  selectedCardIds,
  groups = [],
  isActive = false,
  style,
  onCardSelect,
  phase,
  maxSelectableCards = 10,
  hideGroupInfo = false,
  co2Estimations = {},
  acceptanceLevels = {}
}) => {
  const [showMaxWarning, setShowMaxWarning] = useState(false)
  const [animateWarning, setAnimateWarning] = useState(false)

  useEffect(() => {
    if (showMaxWarning) {
      setAnimateWarning(true)
      const timer = setTimeout(() => {
        setAnimateWarning(false)
        setTimeout(() => setShowMaxWarning(false), 300)
      }, 2700)
      return () => clearTimeout(timer)
    }
  }, [showMaxWarning])

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (!isActive) return

      const isCurrentlySelected = selectedCardIds.includes(cardId)

      if (isCurrentlySelected) {
        onCardSelect(groupId, cardId)
        return
      }

      if (selectedCardIds.length >= maxSelectableCards) {
        setShowMaxWarning(true)
        return
      }

      onCardSelect(groupId, cardId)
    },
    [isActive, onCardSelect, groupId, selectedCardIds, maxSelectableCards]
  )

  const groupName = groups?.find((g) => g.groupId === groupId)?.groupName || `Group ${groupId}`

  const totalCO2 = cards
    .filter((card) => selectedCardIds.includes(card.cardId))
    .reduce((sum, card) => sum + (card.cardValue || 0), 0)

  return (
    <div
      className="w-[min(90vw,800px)] h-[min(60vh,500px)] transition-all duration-700 transform-style-preserve-3d"
      style={style}
    >
      {showMaxWarning && (
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full 
                      bg-amber-50 dark:bg-amber-900/70 border border-amber-200 dark:border-amber-700/50 
                      text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl shadow-lg z-50
                      flex items-center space-x-2 transition-opacity duration-300 backdrop-blur-sm
                      ${animateWarning ? "opacity-100" : "opacity-0"}`}
        >
          <AlertTriangle size={16} className="text-amber-500" />
          <span>Maximum {maxSelectableCards} cards can be selected</span>
        </div>
      )}

      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl border border-emerald-400/50 dark:border-emerald-600/30 overflow-hidden">
          <div
            className="absolute inset-1 bg-emerald-500/90 rounded-xl shadow-inner backdrop-blur-sm"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {category && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                <span className="px-5 py-1.5 bg-white/90 dark:bg-slate-800/90 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium shadow-lg inline-flex items-center gap-2 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/50">
                  <Leaf size={14} className="text-emerald-500" />
                  {category.categoryName}
                </span>
              </div>
            )}

            <div className="relative h-full p-4 sm:p-6">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  {!hideGroupInfo && (
                    <div className="text-white">
                      <h3 className="text-lg sm:text-xl font-bold">Table {tableId}</h3>
                      <p className="text-xs sm:text-sm text-emerald-100">{groupName}</p>
                    </div>
                  )}

                  {isActive && (
                    <div className="flex space-x-3 ml-auto">
                      <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-white/20 rounded-full h-1.5 w-16">
                            <div
                              className="bg-white h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${(selectedCardIds.length / maxSelectableCards) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-xs font-medium">
                            {selectedCardIds.length}/{maxSelectableCards}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center space-x-2 border border-white/10">
                        <Sparkles size={14} className="text-amber-300" />
                        <span className="text-white text-xs font-medium">{totalCO2} CO2</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-thumb-opacity-20 scrollbar-track-transparent pr-1">
                  {!category ? (
                    <div className="flex items-center justify-center text-white p-8 text-center h-full">
                      <div className="max-w-sm bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-2xl">?</span>
                        </div>
                        <p className="text-lg font-medium mb-2">No Category Assigned</p>
                        <p className="text-sm text-emerald-100">Please wait for the category to be assigned</p>
                      </div>
                    </div>
                  ) : cards.length === 0 ? (
                    <div className="flex items-center justify-center text-white p-8 text-center h-full">
                      <div className="max-w-sm bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-2xl">0</span>
                        </div>
                        <p className="text-lg font-medium mb-2">No Cards Available</p>
                        <p className="text-sm text-emerald-100">
                          There are no cards available for the selected category
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                      {cards.map((card) => (
                        <PlayingCard
                          key={card.cardId}
                          card={card}
                          categoryName={category?.categoryName || "Unknown"}
                          isSelected={selectedCardIds.includes(card.cardId)}
                          onCardClick={handleCardClick}
                          isSelectable={isActive}
                          phase={phase}
                          co2Estimation={co2Estimations[card.cardId]}
                          acceptanceLevel={acceptanceLevels[card.cardId]}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}