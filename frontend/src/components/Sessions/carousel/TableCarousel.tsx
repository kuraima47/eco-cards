import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import type { TableData, Category, Group, GameCard, SelectedCard } from "../../../types/game"
import { TableSurface } from "../table/TableSurface"
import QRCodeReader from "../../QRCode/QRCodeReader"
import { QrCode, Info, ChevronLeft, ChevronRight, X, Sparkles, Leaf } from "lucide-react"

interface TableCarouselProps {
  tables: TableData[]
  groups: Group[]
  categories: Category[]
  cards: GameCard[]
  selectedCardsByGroup: Record<number, SelectedCard[]>
  onCardSelect: (groupId: number, cardId: number) => void
  sessionId: string
  currentRound: number
  phase: number
  maxSelectableCards?: number
  currentCategory: Category | null
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
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)

  // Ensure currentIndex is valid when tables change
  useEffect(() => {
    if (currentIndex >= tables.length) {
      setCurrentIndex(Math.max(0, tables.length - 1))
    }
  }, [tables.length, currentIndex])

  const handlePrevious = useCallback(() => {
    setAnimateCards(true)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : tables.length - 1))
    setTimeout(() => setAnimateCards(false), 700)
  }, [tables.length])

  const handleNext = useCallback(() => {
    setAnimateCards(true)
    setCurrentIndex((prev) => (prev < tables.length - 1 ? prev + 1 : 0))
    setTimeout(() => setAnimateCards(false), 700)
  }, [tables.length])

  // Filter cards for current category
  const categoryCards = useMemo(() => {
    if (!currentCategory) return []
    return cards.filter((card) => card.cardCategoryId === currentCategory.categoryId)
  }, [cards, currentCategory])

  const currentTable = tables[currentIndex]
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
    return selectedCardsForCurrentGroup.reduce((sum, card) => sum + (card.cardValue || 0), 0)
  }, [selectedCardsForCurrentGroup])

  // Handle card selection
  const handleCardSelect = useCallback(
    (groupId: number, cardId: number) => {
      onCardSelect(groupId, cardId)
    },
    [onCardSelect],
  )

  // Filter cards based on phase and current table
  const tableCards = useMemo(() => {
    if (!currentCategory) return []

    // Get all category cards
    const filteredCategoryCards = cards.filter((card) => card.cardCategoryId === currentCategory.categoryId)

    // In phase 1, show all category cards
    if (phase === 1) {
      return filteredCategoryCards
    }

    // In phases 2-4, only show cards that were selected by this group
    const groupSelectedCards = selectedCardsByGroup[currentGroupId] || []
    const groupSelectedCardIds = new Set(groupSelectedCards.map((card) => card.cardId))

    return filteredCategoryCards.filter((card) => groupSelectedCardIds.has(card.cardId))
  }, [cards, currentCategory, phase, selectedCardsByGroup, currentGroupId])

  return (
    <div className="flex flex-col w-full relative h-[calc(100vh-10rem)] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
      {/* Component Header - Modern Glassmorphism Design */}
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
            </h2>
            <div className="flex items-center gap-2 justify-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-200 text-emerald-800">
                <Leaf size={12} className="mr-1" />
                {currentCategory?.categoryName || "No category"}
              </span>
            </div>
          </div>
          <button
            className="focus:outline-none hover:bg-white/20 p-2 rounded-full transition-colors"
            onClick={() => setShowQRScanner(true)}
            aria-label="Scan QR code"
          >
            <QrCode size={22} />
          </button>
        </div>
      </div>

      {/* Game Stats Bar */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">Selected</span>
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

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 dark:text-slate-400">CO2 Reduction</span>
            <div className="flex items-center">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{tableCO2}</span>
              <Sparkles size={16} className="ml-1 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - takes up remaining space */}
      <div className="flex-grow relative perspective-1000 min-h-[350px] max-h-[calc(100%-10rem)]">
        <div className="absolute inset-0 overflow-hidden">
          {tables.map((table, index) => {
            const distance = index - currentIndex
            const isActive = index === currentIndex
            const tableGroupId = table.groupId

            // Get selected cards for this table's group
            const tableSelectedCards = selectedCardsByGroup[tableGroupId] || []
            const tableSelectedCardIds = tableSelectedCards.map((card) => card.cardId)

            // Filter cards for this specific table based on phase
            let cardsForTable = categoryCards

            // In phases 2-4, only show cards selected by this table's group
            if (phase > 1) {
              cardsForTable = categoryCards.filter((card) => tableSelectedCardIds.includes(card.cardId))
            }

            const style: React.CSSProperties = {
              transform: `translate(-50%, -50%) 
                translateX(${distance * 100}%) 
                translateZ(${isActive ? 0 : -500}px)
                rotateY(${distance * 45}deg)
              `,
              opacity: isActive ? 1 : 0.3,
              zIndex: isActive ? 1 : 0,
              position: "absolute",
              left: "50%",
              top: "50%",
              //transition: animateCards ? "all 0.7s cubic-bezier(0.19, 1, 0.22, 1)" : "opacity 0.3s ease",
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
                phase={phase}
                maxSelectableCards={maxSelectableCards}
                hideGroupInfo={true}
              />
            )
          })}
        </div>
      </div>

      {/* Navigation Controls - Floating design */}
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

      {/* Game Info Modal - Using modal instead of sidebar */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Info size={20} className="mr-2 text-emerald-500" />
                Game Information
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
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Current Category
                </h4>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                  <p className="text-lg font-medium text-slate-800 dark:text-white">
                    {currentCategory?.categoryName || "No category assigned"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  CO2 Reduction
                </h4>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{tableCO2}</p>
                  <div className="flex items-center">
                    <Sparkles size={18} className="text-amber-500 mr-1" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">points</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Selected Cards
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
                      {selectedCardIds.length} cards selected
                    </span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {maxSelectableCards - selectedCardIds.length} remaining
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Current Group
                </h4>
                <p className="text-lg font-medium text-slate-800 dark:text-white">
                  {currentGroup?.groupName || `Group ${currentGroupId}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Scanner Modal - Redesigned with a more modern look */}
      {showQRScanner && (
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
              <QRCodeReader />
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
              Position the QR code within the frame to scan
            </p>
            <button
              onClick={() => setShowQRScanner(false)}
              className="mt-4 w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

