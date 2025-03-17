import React, { useEffect, useState } from "react"
import type { GameCard } from "../../../types/game"
import "./card-animation.css"
import SmallCard from "./SmallCard"

interface PlayingCardProps {
  card: GameCard
  isSelected: boolean
  onCardClick: (cardId: number) => void
  isSelectable: boolean
  phase: number
  width?: number
  height?: number
  categoryName?: string
  co2Estimation?: number
  acceptanceLevel?: 'high' | 'medium' | 'low' | null
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  isSelected, 
  onCardClick, 
  isSelectable,
  phase,
  width,
  height,
  categoryName,
  co2Estimation,
  acceptanceLevel
}) => {
  const [animating, setAnimating] = useState(false)
  const [showSelected, setShowSelected] = useState(isSelected)
  
  useEffect(() => {
    if (showSelected !== isSelected) {
      setAnimating(true)
      const timer = setTimeout(() => {
        setShowSelected(isSelected)
        setAnimating(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isSelected, showSelected])

  const handleClick = () => {
    if (isSelectable && !animating) {
      onCardClick(card.cardId)
    }
  }

  const renderPhaseIndicator = () => {
    switch (phase) {
      case 2:
        return co2Estimation ? (
          <div className="absolute top-2 left-2 z-20 bg-yellow-400/90 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg border border-yellow-500">
            {co2Estimation}
          </div>
        ) : null
      case 3:
      case 4:
        if (!acceptanceLevel) return null
        const colors = {
          high: 'bg-emerald-400/90 border-emerald-500 text-emerald-900',
          medium: 'bg-yellow-400/90 border-yellow-500 text-yellow-900',
          low: 'bg-red-400/90 border-red-500 text-red-900'
        }
        return (
          <div className={`absolute top-2 left-2 z-20 ${colors[acceptanceLevel]} rounded-full px-2 py-0.5 text-xs font-bold shadow-lg border`}>
            {acceptanceLevel.charAt(0).toUpperCase()}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={`relative w-full pb-[90%] card-wrapper ${isSelectable ? "selectable cursor-pointer" : "cursor-default"}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0">
        {/* Phase-specific indicator */}
        {renderPhaseIndicator()}

        {/* Selection indicator */}
        {isSelected && (
          <div className="selected-badge">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Card with flip animation */}
        <div className={`card-container ${isSelected ? "ring-4 ring-blue-500 rounded-lg" : ""}`}>
          <div className={`card ${isSelected ? "flipped" : ""}`}>
            <SmallCard 
              cardData={card} 
              isFlipped={isSelected} 
              width={width} 
              height={height} 
              hiddenCo2={false} 
              categoryName={categoryName}
              phase={phase}
              co2Estimation={co2Estimation}
              acceptanceLevel={acceptanceLevel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}