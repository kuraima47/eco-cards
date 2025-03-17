import type React from "react"
import ReactDOM from "react-dom"
import { X, Check, Sparkles, AlertTriangle } from "lucide-react"
import type { GameCard } from "../../../types/game"
import { Card } from "../../Card/Card"
import {useAdmin} from "../../../hooks/useAdmin.ts";

interface CardZoomedInTableModalProps {
  isOpen: boolean
  onClose: () => void
  cardData: GameCard
  categoryName?: string
  isSelected?: boolean
  onSelect?: () => void
  phase: number
  co2Estimation?: number
  acceptanceLevel?: 'high' | 'medium' | 'low' | null
  onCO2Estimate?: (value: number) => void
  onAcceptanceChange?: (level: 'high' | 'medium' | 'low' | null) => void
}

const CardZoomedInTableModal: React.FC<CardZoomedInTableModalProps> = ({
  isOpen,
  onClose,
  cardData,
  categoryName,
  isSelected = false,
  onSelect,
  phase,
  co2Estimation = 0,
  acceptanceLevel = null,
  onCO2Estimate,
  onAcceptanceChange,
}) => {
  const admin = useAdmin();
  const category = admin.getCategoryFromCard(cardData.cardCategoryId);
  const getCardNumber = (cardId: number) => {
    console.log("category", category);
    const index = category.cards.findIndex(card => card.cardId === cardId);
    return index !== -1 ? index + 1 : null;
  };
  if (!isOpen) return null;
  const renderPhaseContent = () => {
    switch (phase) {
      case 1:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onSelect) onSelect()
            }}
            className={`mt-4 w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
              ${
                isSelected 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
          >
            {isSelected ? (
              <>
                <X size={18} />
                Remove Selection
              </>
            ) : (
              <>
                <Check size={18} />
                Select Card
              </>
            )}
          </button>
        )

      case 2:
        return (
          <div className="mt-4 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-400" />
              CO2 Reduction Estimation
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => onCO2Estimate?.(value)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    co2Estimation === value
                      ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                      : "border-white/20 hover:border-white/40 text-white/60 hover:text-white"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-sm text-white/60">
              Rate the potential CO2 reduction impact (1-5)
            </p>
          </div>
        )

      case 3:
        return (
          <div className="mt-4 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-400" />
              Acceptance Level
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 'high', label: 'High', color: 'emerald' },
                { level: 'medium', label: 'Medium', color: 'yellow' },
                { level: 'low', label: 'Low', color: 'red' }
              ].map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => onAcceptanceChange?.(level as 'high' | 'medium' | 'low')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    acceptanceLevel === level
                      ? `border-${color}-400 bg-${color}-400/20 text-${color}-400`
                      : "border-white/20 hover:border-white/40 text-white/60 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-white/60">
              Rate the social acceptance level of this measure
            </p>
          </div>
        )

      case 4:
        return (
          <div className="mt-4 space-y-4">
            <div className="bg-white/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-white">
                <span>CO2 Reduction Impact:</span>
                <span className="flex items-center gap-1">
                  <Sparkles size={16} className="text-yellow-400" />
                  {co2Estimation}/5
                </span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span>Acceptance Level:</span>
                <span className={`
                  ${acceptanceLevel === 'high' ? 'text-emerald-400' : ''}
                  ${acceptanceLevel === 'medium' ? 'text-yellow-400' : ''}
                  ${acceptanceLevel === 'low' ? 'text-red-400' : ''}
                `}>
                  {acceptanceLevel ? acceptanceLevel.charAt(0).toUpperCase() + acceptanceLevel.slice(1) : 'Not rated'}
                </span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-emerald-800 rounded-xl p-6 max-w-lg w-full h-auto max-h-[90vh] shadow-2xl flex flex-col items-center overflow-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 rounded-full p-1.5 text-white transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="flex flex-col flex-grow justify-center items-center mb-4">
          <Card
              cardData={{
                cardId: cardData.cardId || 0,
                deckId: cardData.deckId, 
                selected : cardData.selected,
                cardName: cardData.cardName || '...',
                description: cardData.description || '...',
                cardImageData: cardData.cardImageData || '',
                cardImageType: cardData.cardImageType || '',
                qrCodeColor: cardData.qrCodeColor || '#000000',
                qrCodeLogoImage: cardData.qrCodeLogoImage || '',
                backgroundColor: cardData.backgroundColor || '#FFFFFF',
                textColor: cardData.textColor || '#000000',
                cardCategoryId: cardData.cardCategoryId,
                category: cardData.category,
                cardValue: cardData.cardValue || 0,
                cardActual: cardData.cardActual || [],
                cardProposition: cardData.cardProposition || [],
                deckName: admin.getDeck(cardData.deckId) || '...',
                cardNumber: getCardNumber(cardData.cardId) || category.cards.length + 1,
                totalCards: category.cards.length + 1 || 0,
              }}
            categoryName={categoryName}
            isFlipped={false}
            width={300}
            height={450}
            hiddenCo2={false}
          />
        </div>

        {renderPhaseContent()}
      </div>
    </div>,
    document.body,
  )
}

export default CardZoomedInTableModal