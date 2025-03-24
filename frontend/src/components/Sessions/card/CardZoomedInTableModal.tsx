import type React from "react"
import ReactDOM from "react-dom"
import { X, Check, ArrowLeft } from "lucide-react"
import type { Category, GameCard } from "../../../types/game"
import { Card } from "../../Card/Card"
import { useAdmin } from "../../../hooks/useAdmin"
import { useAuth } from "../../../hooks/useAuth"

interface CardZoomedInTableModalProps {
  isOpen: boolean
  onClose: () => void
  cardData: GameCard
  categoryName?: string
  categoryIcon?: string
  categoryColor?: string
  isSelected?: boolean
  onSelect?: () => void
  phase: number
  co2Estimation?: number
  acceptanceLevel?: "high" | "medium" | "low" | null
  onCO2Estimate?: (value: number) => void
  onAcceptanceChange?: (level: "high" | "medium" | "low" | null) => void
  isReadOnly?: boolean
  hideCO2?: boolean
}

const CardZoomedInTableModal: React.FC<CardZoomedInTableModalProps> = ({
  isOpen,
  onClose,
  cardData,
  categoryName,
  categoryIcon,
  categoryColor,
  isSelected = false,
  onSelect,
  isReadOnly = false,
  hideCO2,
}) => {
  const admin = useAdmin()
  const { user } = useAuth()
  const category: Category | null = admin?.getCategoryFromCard?.(cardData.cardCategoryId)

  // Determine if CO2 should be hidden - use prop if provided, otherwise check user role
  const shouldHideCO2 = hideCO2 !== undefined ? hideCO2 : user?.role !== "admin"

  const getCardNumber = (cardId: number) => {
    if (!category?.cards) return 1
    const index = category.cards.findIndex((card: { cardId: number }) => card.cardId === cardId)
    return index !== -1 ? index + 1 : 1
  }

  const renderContent = (content: string[] | string) => {
    const LIMIT_LINE_PER_CONTENT = 2;
    // C'est un tableau JavaScript normal
    console.log(typeof(content), content)
    if (Array.isArray(content)) {
        if (typeof content[0] === 'string' && content[0].trim().startsWith('[') && content[0].trim().endsWith(']')) {
            try {
                const parsedContent = JSON.parse(content[0]);
                
                if (Array.isArray(parsedContent)) {
                    // Limiter à 4 éléments maximum
                    const limitedContent = parsedContent.slice(0, LIMIT_LINE_PER_CONTENT);
                    const hasMore = parsedContent.length > LIMIT_LINE_PER_CONTENT;
                    
                    return (
                        <div className="list-disc">
                            {limitedContent.map((item, index) => (
                                <div key={index} className="text-gray-700 mb-0.5 line-clamp-1">{item}</div>
                            ))}
                            {hasMore && (
                                <div className="text-xs text-gray-500 italic mt-0.5">
                                    + {parsedContent.length - LIMIT_LINE_PER_CONTENT} autres...
                                </div>
                            )}
                        </div>
                    );
                }
            } catch (e) {
                // Si la conversion échoue, on traite comme une str simple
                console.warn("Failed to parse JSON string:", content);
            }
        }

        // Limiter à LIMIT_LINE_PER_CONTENT éléments maximum
        const limitedContent = content.slice(0, LIMIT_LINE_PER_CONTENT);
        const hasMore = content.length > LIMIT_LINE_PER_CONTENT;
        
        return (
            <div className="list-disc">
                {limitedContent.map((item, index) => (
                    <div key={index} className="text-gray-700 mb-0.5 line-clamp-1">{item}</div>
                ))}
                {hasMore && (
                    <div className="text-xs text-gray-500 italic mt-0.5">
                        + {content.length - LIMIT_LINE_PER_CONTENT} autres...
                    </div>
                )}
            </div>
        );
    }
    
    // Pour les chaînes simples, utiliser line-clamp-4 pour limiter à 4 lignes
    return <p className="line-clamp-4 text-gray-700">{content}</p>;
};

  if (!isOpen) return null

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect && onSelect()
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] flex flex-col items-center overflow-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full p-1.5 text-slate-600 dark:text-slate-300 transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div className="flex flex-col flex-grow justify-center items-center mb-4">
          <Card
            cardData={{
              cardId: cardData.cardId || 0,
              deckId: cardData.deckId,
              selected: cardData.selected,
              cardName: cardData.cardName || "...",
              description: cardData.description || "...",
              cardImageData: cardData.cardImageData || "",
              qrCodeColor: cardData.qrCodeColor || "#000000",
              qrCodeLogoImageData: cardData.qrCodeLogoImageData || "",
              backgroundColor: cardData.backgroundColor || "#FFFFFF",
              cardCategoryId: cardData.cardCategoryId,
              category: categoryName || "Inconnue",
              cardValue: cardData.cardValue || 0,
              cardActual: cardData.cardActual || [],
              cardProposition: cardData.cardProposition || [],
              deckName: admin?.getDeck ? admin.getDeck(cardData.deckId) || "..." : "...",
              cardNumber: getCardNumber(cardData.cardId) || (category?.cards?.length || 0) + 1,
              totalCards: category?.cards?.length || 0,
            }}
            categoryIcon={categoryIcon}
            categoryColor={categoryColor}
            isFlipped={false}
            width={300}
            height={450}
            hiddenCo2={shouldHideCO2}
          />
        </div>
        <div className="mt-4 w-full flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors font-medium flex items-center justify-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSelect}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isSelected ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              <Check size={18} className="mr-2" />
              {isSelected ? "Remove" : "Select"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CardZoomedInTableModal

