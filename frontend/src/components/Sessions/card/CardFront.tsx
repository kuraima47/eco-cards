import type React from "react"
import type { GameCard } from "../../../types/game"

interface CardFrontProps {
  card: GameCard
}

export const CardFront: React.FC<CardFrontProps> = ({ card }) => {
  return (
    <div className="card-front bg-white rounded-lg p-3 shadow-md flex flex-col h-full">
      <h4 className="font-bold text-xs sm:text-sm md:text-base mb-1 line-clamp-2 flex-shrink-0">{card.cardName}</h4>
      <p className="text-xs md:text-sm mb-1 line-clamp-3 flex-grow overflow-y-auto">{card.cardProposition}</p>
      <div className="text-emerald-800 font-bold text-xs md:text-sm mt-auto text-right">{card.cardValue} CO2</div>
    </div>
  )
}

