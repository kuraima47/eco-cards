"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { GameCard } from "../../../types/game"
import "./card-animation.css"
import SmallCard from "./SmallCard"
import { useAuth } from "../../../hooks/useAuth"

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
  acceptanceLevel?: "high" | "medium" | "low" | null
  onCO2Estimate?: (cardId: number, value: number) => void
  onAcceptanceChange?: (cardId: number, level: "high" | "medium" | "low" | null) => void
  onOpenModal?: (card: GameCard) => void
  hideCO2?: boolean
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isSelected,
  onCardClick,
  isSelectable,
  phase,
  width = 220,
  height = 260,
  categoryName,
  co2Estimation,
  acceptanceLevel,
  onCO2Estimate,
  onAcceptanceChange,
  onOpenModal,
  hideCO2,
}) => {
  const [animating, setAnimating] = useState(false)
  const [showSelected, setShowSelected] = useState(isSelected)
  const { user } = useAuth()

  // Determine if CO2 should be hidden - use prop if provided, otherwise check user role
  const shouldHideCO2 = hideCO2 !== undefined ? hideCO2 : user?.role !== "admin"

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

  const handleCardClick = () => {
    if (isSelectable && !animating) {
      console.log(`PlayingCard: Card ${card.cardId} clicked, isSelected: ${isSelected}`)
      onCardClick(card.cardId)
    }
  }

  const handleOpenModal = () => {
    console.log(`PlayingCard: Opening modal for card ${card.cardId}`)
    onOpenModal && onOpenModal(card)
  }

  const handleCO2Estimate = (value: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log(`PlayingCard: CO2 estimation for card ${card.cardId}: ${value}`)
    if (onCO2Estimate) {
      onCO2Estimate(card.cardId, value)
    }
  }

  const handleAcceptanceChange = (level: "high" | "medium" | "low" | null, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log(`PlayingCard: Acceptance level for card ${card.cardId}: ${level}`)
    if (onAcceptanceChange) {
      onAcceptanceChange(card.cardId, level)
    }
  }

  return (
    <div
      className={`relative card-wrapper ${isSelectable ? "selectable cursor-pointer" : "cursor-default"}`}
      style={{ width, height }}
    >
      <SmallCard
        cardData={card}
        isFlipped={false}
        width={width}
        height={height}
        hiddenCo2={shouldHideCO2}
        categoryName={categoryName}
        phase={phase}
        co2Estimation={co2Estimation}
        acceptanceLevel={acceptanceLevel}
        onCO2Estimate={handleCO2Estimate}
        onAcceptanceChange={handleAcceptanceChange}
        isSelected={showSelected}
        onSelect={handleCardClick}
        onOpenModal={handleOpenModal}
      />
    </div>
  )
}

export default PlayingCard

