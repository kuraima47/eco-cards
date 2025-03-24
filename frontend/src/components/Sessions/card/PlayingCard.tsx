import React, { useEffect, useState, useCallback, useMemo } from "react"
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
    const shouldHideCO2 = useMemo(() =>
        hideCO2 !== undefined ? hideCO2 : user?.role !== "admin",
        [hideCO2, user?.role]
    )

    useEffect(() => {
        if (showSelected !== isSelected) {
            setShowSelected(isSelected)
            setAnimating(true)
            const timer = setTimeout(() => {
                setAnimating(false)
            }, 200)
            return () => clearTimeout(timer)
        }
    }, [isSelected, showSelected])

    const handleCardClick = useCallback(() => {
        if (isSelectable) { 
            onCardClick(card.cardId)
        }
    }, [isSelectable, onCardClick, card.cardId])

    const handleOpenModal = useCallback(() => {
        onOpenModal?.(card)
    }, [onOpenModal, card])

    const handleCO2Estimate = useCallback((value: number, e: React.MouseEvent) => {
        e.stopPropagation()
        onCO2Estimate?.(card.cardId, value)
    }, [onCO2Estimate, card.cardId])

    const handleAcceptanceChange = useCallback((level: "high" | "medium" | "low" | null, e: React.MouseEvent) => {
        e.stopPropagation()
        onAcceptanceChange?.(card.cardId, level)
    }, [onAcceptanceChange, card.cardId])

    const containerStyle = useMemo(() => ({
        width,
        height
    }), [width, height])

    return (
        <div
            className={`relative card-wrapper ${isSelectable ? "selectable cursor-pointer" : "cursor-default"}`}
            style={containerStyle}
        >
            <SmallCard
                cardData={card}
                isFlipped={false}
                width={width}
                height={height}
                isAdmin={!shouldHideCO2}
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

export default React.memo(PlayingCard, (prevProps, nextProps) => {
    // Comparaison personnalisée pour optimiser encore plus les rendus
    return (
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.co2Estimation === nextProps.co2Estimation &&
        prevProps.acceptanceLevel === nextProps.acceptanceLevel &&
        prevProps.isSelectable === nextProps.isSelectable &&
        prevProps.phase === nextProps.phase &&
        prevProps.card.cardId === nextProps.card.cardId
    )
})

