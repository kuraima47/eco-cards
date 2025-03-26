import * as LucideIcons from "lucide-react"
import { AlertTriangle, Sparkles } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import type { Card } from "../../../types/game"
import type { TableSurfaceProps } from "../../../types/props"
import { toPascalCase } from "../../../utils/formatting"
import CardZoomedInTableModal from "../card/CardZoomedInTableModal"
import { PlayingCard } from "../card/PlayingCard"

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
  acceptanceLevels = {},
  onCO2Estimate,
  onAcceptanceChange,
  isReadOnly = false,
  hideCO2 = false,
}) => {
  const [showMaxWarning, setShowMaxWarning] = useState(false)
  const [animateWarning, setAnimateWarning] = useState(false)
  const [showUnselectModal, setShowUnselectModal] = useState(false)
  const [pendingUnselectCard, setPendingUnselectCard] = useState<number | null>(null)
  const [selectedModalCard, setSelectedModalCard] = useState<Card | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const iconName = category?.categoryIcon ? toPascalCase(category?.categoryIcon) : "Box"
  const IconComponent = (LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Box) as React.ElementType

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
      if (!isActive || isReadOnly) return

      const isCurrentlySelected = selectedCardIds.includes(cardId)
      if (isCurrentlySelected) {
        if (phase > 1) {
          setPendingUnselectCard(cardId)
          setShowUnselectModal(true)
          return
        }
        onCardSelect(groupId, cardId)
        return
      }
      if (selectedCardIds.length > maxSelectableCards) {
        console.log("ERROR: Max selectable cards reached")
        setShowMaxWarning(true)
        return
      }
      onCardSelect(groupId, cardId)
    },
    [isActive, onCardSelect, groupId, selectedCardIds, maxSelectableCards, phase, isReadOnly],
  )

  const handleOpenModal = useCallback((card: Card) => {
    setSelectedModalCard(card)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedModalCard(null)
  }, [])

  // The following two handlers simply pass through the callback.
  const handleCO2Estimate = useCallback(
    (cardId: number, value: number) => {
      if (isReadOnly) return
      console.log(`TableSurface: CO2 estimation for card ${cardId} in group ${groupId}: ${value}`)
      onCO2Estimate?.(cardId, value)
    },
    [onCO2Estimate, groupId, isReadOnly],
  )

  const handleAcceptanceChange = useCallback(
    (cardId: number, level: "high" | "medium" | "low" | null) => {
      if (isReadOnly) return
      console.log(`TableSurface: Acceptance level for card ${cardId} in group ${groupId}: ${level}`)
      if (onAcceptanceChange) {
        onAcceptanceChange(cardId, level)
      }
    },
    [onAcceptanceChange, groupId, isReadOnly],
  )

  // Calculate total CO2 for the current table's selected cards
  const tableCO2 = cards
    .filter((card) => selectedCardIds.includes(card.cardId))
    .reduce((sum, card) => {
      // Use the CO2 estimation if available, otherwise use the card's value
      const cardCO2 = co2Estimations[card.cardId] !== undefined ? co2Estimations[card.cardId] : card.cardValue || 0
      return sum + cardCO2
    }, 0)

  return (
    <div
      className="w-[min(90vw,800px)] h-[min(60vh,500px)] transition-all duration-700 transform-style-preserve-3d"
      style={style}
    >
      {/* Max Selection Warning */}
      {showMaxWarning && (
        <div
          className={`absolute top-[50px] left-1/2 transform -translate-x-1/2 -translate-y-full bg-amber-50 dark:bg-amber-900/70 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl shadow-lg z-50 flex items-center space-x-2 transition-opacity duration-300 backdrop-blur-sm ${animateWarning ? "opacity-100" : "opacity-0"}`}
        >
          <AlertTriangle size={16} className="text-amber-500" />
          <span>Au maximum {maxSelectableCards} cartes peuvent être sélectionnées</span>
        </div>
      )}

      {/* Unselect Confirmation Modal */}
      {showUnselectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-emerald-100 dark:border-slate-700">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 text-center">
                Confirmer la désélection
              </h3>
              <p className="text-center text-slate-600 dark:text-slate-400">
                Attention : Modifier vos sélections à la phase {phase} peut impacter votre stratégie. Êtes-vous sûr(e) ?
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setShowUnselectModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (pendingUnselectCard !== null) {
                      onCardSelect(groupId, pendingUnselectCard)
                    }
                    setShowUnselectModal(false)
                    setPendingUnselectCard(null) // Reset after use
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Zoomed In Modal */}
      {selectedModalCard && (
        <CardZoomedInTableModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          cardData={selectedModalCard}
          categoryName={category?.categoryName}
          categoryIcon={category?.categoryIcon}
          categoryColor={category?.categoryColor}
          isSelected={selectedCardIds.includes(selectedModalCard.cardId)}
          onSelect={() => handleCardClick(selectedModalCard.cardId)}
          phase={phase}
          isReadOnly={isReadOnly}
          co2Estimation={co2Estimations[selectedModalCard.cardId]}
          acceptanceLevel={acceptanceLevels[selectedModalCard.cardId]}
          hideCO2={hideCO2}
        />
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
                  <IconComponent size={14} />
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
                      <p className="text-xs sm:text-sm text-emerald-100">
                        {groups.find((g) => g.groupId === groupId)?.groupName}
                      </p>
                    </div>
                  )}

                  {isActive && (
                    <div className="flex space-x-3 ml-auto">
                      <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                        <div className="flex items-center space-x-2">
                          <div className="bg-white/20 rounded-full h-1.5 w-16">
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

                      {/* Only show CO2 counter if not hidden */}
                      {!hideCO2 && (
                        <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center space-x-2 border border-white/10">
                          <Sparkles size={14} className="text-amber-300" />
                          <span className="text-white text-xs font-medium">{tableCO2} CO2</span>
                        </div>
                      )}
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
                        <p className="text-lg font-medium mb-2">Aucune catégorie assignée</p>
                        <p className="text-sm text-emerald-100">Veuillez attendre que la catégorie soit assignée</p>
                      </div>
                    </div>
                  ) : cards.length === 0 ? (
                    <div className="flex items-center justify-center text-white p-8 text-center h-full">
                      <div className="max-w-sm bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-2xl">0</span>
                        </div>
                        <p className="text-lg font-medium mb-2">Aucune carte disponible</p>
                        <p className="text-sm text-emerald-100">
                          Il n'y a aucune carte de disponible pour la catégorie sélectionnée
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                      {cards.map((card) => (
                        <PlayingCard
                          key={card.cardId}
                          card={card}
                          isSelected={selectedCardIds.includes(card.cardId)}
                          onCardClick={handleCardClick}
                          isSelectable={isActive && !isReadOnly}
                          phase={phase}
                          co2Estimation={co2Estimations[card.cardId]}
                          acceptanceLevel={acceptanceLevels[card.cardId]}
                          onCO2Estimate={handleCO2Estimate}
                          onAcceptanceChange={handleAcceptanceChange}
                          onOpenModal={handleOpenModal}
                          hideCO2={hideCO2}
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

export default TableSurface

