import React, { useCallback } from "react"
import { useMemo, useState } from "react"
import { Sparkles, ThumbsUp, Search, Check } from "lucide-react"
import type { GameCard } from "../../../types/game"
import { generateCodeFromCO2 } from "../../../utils/formatting"

interface SmallCardProps {
    cardData: GameCard
    width?: number
    height?: number
    isAdmin?: boolean
    isFlipped: boolean
    categoryName?: string
    categoryIcon?: string
    categoryColor?: string
    phase?: number
    co2Estimation?: number
    acceptanceLevel?: "high" | "medium" | "low" | null
    onCO2Estimate?: (value: number, e: React.MouseEvent) => void
    onAcceptanceChange?: (level: "high" | "medium" | "low" | null, e: React.MouseEvent) => void
    isSelected?: boolean
    onSelect?: () => void
    onOpenModal?: () => void
}

const SmallCard: React.FC<SmallCardProps> = ({
    cardData,
    isAdmin=false,
    isFlipped = false,
    phase = 1,
    co2Estimation,
    acceptanceLevel,
    onCO2Estimate,
    onAcceptanceChange,
    isSelected = false,
    onSelect,
    onOpenModal,
}) => {
    const [showPhaseControls, setShowPhaseControls] = useState(false)

    const encodedCo2Value = useMemo(() => generateCodeFromCO2(cardData.cardValue), [cardData.cardValue]);

    const handleCardClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        if (phase > 1) {
            // setShowPhaseControls(prev => !prev)
        } else if (onSelect) {
            onSelect()
        }
    }, [phase, onSelect])

    const handleSelectClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect && onSelect()
    }, [onSelect])

    const handleOpenModal = (e: React.MouseEvent) => {
        e.stopPropagation()
        onOpenModal && onOpenModal()
    }

    const handleCO2Estimate = useCallback((value: number, e: React.MouseEvent) => {
        e.stopPropagation()
        onCO2Estimate && onCO2Estimate(value, e)
        setShowPhaseControls(false)
    }, [cardData.cardId, onCO2Estimate])

    const handleAcceptanceChange = useCallback((level: "high" | "medium" | "low" | null, e: React.MouseEvent) => {
        e.stopPropagation()
        onAcceptanceChange && onAcceptanceChange(level, e)
        setShowPhaseControls(false)
    }, [cardData.cardId, onAcceptanceChange])

    // Render header with indicators (non-overlapping)
    const renderHeader = useMemo(() => {
        return (
            <div className="flex items-center justify-between bg-gray-800 p-2 text-white">
                {/* Left section: selection indicator */}
                <div>
                    {isSelected && (
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <Check size={16} className="text-white" />
                        </div>
                    )}
                </div>
                {/* Center section: phase indicators */}
                <div className="flex items-center space-x-1">
                    {phase === 2 && co2Estimation && (
                        <div className="bg-yellow-400/90 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg border border-yellow-500">
                            {co2Estimation}
                        </div>
                    )}
                    {(phase === 3 || phase === 4) && acceptanceLevel && (
                        <div className={`rounded-full px-2 py-0.5 text-xs font-bold shadow-lg border ${acceptanceLevel === "high"
                            ? "bg-emerald-400/90 border-emerald-500 text-emerald-900"
                            : acceptanceLevel === "medium"
                                ? "bg-yellow-400/90 border-yellow-500 text-yellow-900"
                                : "bg-red-400/90 border-red-500 text-red-900"
                            }`}>
                            {acceptanceLevel.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {phase === 4 && co2Estimation && (
                        <div className="bg-yellow-400/90 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg border border-yellow-500">
                            {co2Estimation}
                        </div>
                    )}
                </div>
                {/* Right section: search button */}
                <div>
                    <button
                        className="bg-white/80 hover:bg-white rounded-full p-1 shadow-md border border-black"
                        onClick={handleOpenModal}
                    >
                        <Search size={14} className="text-green-800" />
                    </button>
                </div>
            </div>
        )
    }, [isSelected, phase, co2Estimation, acceptanceLevel, handleOpenModal])

    const renderPhaseControls = () => {
        if (!showPhaseControls) return null

        if (phase === 2) {
            return (
                <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-yellow-400" />
                        Estimation de la réduction en CO2
                    </h3>
                    <div className="grid grid-cols-5 gap-2 w-full max-w-[200px]">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                onClick={(e) => handleCO2Estimate(value, e)}
                                className={`p-2 rounded-lg border-2 transition-all ${co2Estimation === value
                                    ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                                    : "border-white/20 hover:border-white/40 text-white/60 hover:text-white"
                                    }`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-white/60 text-center">Notez l'impact de réduction de CO2 (1-5)</p>
                    <button onClick={() => setShowPhaseControls(false)} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">
                        Annuler
                    </button>
                </div>
            )
        } else if (phase === 3) {
            return (
                <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        <ThumbsUp size={18} className="text-yellow-400" />
                        Niveau d'acceptation
                    </h3>
                    <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
                        <button
                            onClick={(e) => handleAcceptanceChange("high", e)}
                            className={`p-2 rounded-lg border-2 transition-all ${acceptanceLevel === "high"
                                ? "border-emerald-400 bg-emerald-400/20 text-emerald-400"
                                : "border-white/20 hover:border-white/40 text-white/60 hover:text-white"
                                }`}
                        >
                            Haut
                        </button>
                        <button
                            onClick={(e) => handleAcceptanceChange("medium", e)}
                            className={`p-2 rounded-lg border-2 transition-all ${acceptanceLevel === "medium"
                                ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                                : "border-white/20 hover:border-white/40 text-white/60 hover:text-white"
                                }`}
                        >
                            Mid
                        </button>
                        <button
                            onClick={(e) => handleAcceptanceChange("low", e)}
                            className={`p-2 rounded-lg border-2 transition-all ${acceptanceLevel === "low"
                                ? "border-red-400 bg-red-400/20 text-red-400"
                                : "border-white/20 hover:border-white/40 text-white/60 hover:text-white"
                                }`}
                        >
                            Bas
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-white/60 text-center">Évaluez le niveau d'acceptation de cette proposition</p>
                    <button onClick={() => setShowPhaseControls(false)} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">
                        Annuler
                    </button>
                </div>
            )
        }
        return null
    }

    const renderCardContent = () => {
        return (
            <div className="flex flex-col flex-grow p-2">
                <div className="flex justify-between items-center mb-2 bg-gray-700 text-white p-1 rounded">
                    <div className="text-xs font-bold truncate max-w-[70%]">{cardData.cardName}</div>
                    <div className="flex items-center px-1 py-0.5 bg-green-700 text-white text-xs rounded font-bold">
                        <span className="mr-1">{!isAdmin && phase < 4 ? encodedCo2Value : cardData.cardValue}</span>
                        <Sparkles className="w-3 h-3" />
                    </div>
                </div>
                {/* Card body with actual and proposed content */}
                <div className="flex-grow overflow-auto text-xs scrollbar-thin">
                    <div className="mb-1">
                        <strong className="text-gray-800">Actuellement</strong>
                        <p className="line-clamp-2 text-gray-700 mb-1">{cardData.cardActual}</p>
                    </div>
                    <div className="border-t border-gray-300 pt-1">
                        <strong className="text-gray-800">Propositions</strong>
                        <p className="line-clamp-2 text-gray-700">{cardData.cardProposition}</p>
                    </div>
                </div>
                {/* Phase-specific information section */}
                {phase > 1 && (
                    <div className="mt-auto pt-1 border-t border-gray-200">
                        <div className="bg-gray-100 rounded p-1 text-xs hover:bg-gray-300" onClick={() => isAdmin && setShowPhaseControls(true)}>
                            {phase === 2 && (
                                <div className="flex justify-between items-center" >
                                    <span className="text-gray-600">Impact en CO2 :</span>
                                    {co2Estimation ? (
                                        <span className="font-bold text-green-600">{co2Estimation}/5</span>
                                    ) : (
                                        <span className="italic text-gray-500 text-[10px]">Cliquez pour évaluezr</span>
                                    )}
                                </div>
                            )}
                            {phase === 3 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Acceptation :</span>
                                    {acceptanceLevel ? (
                                        <span className={`font-bold ${acceptanceLevel === "high"
                                            ? "text-green-600"
                                            : acceptanceLevel === "medium"
                                                ? "text-yellow-600"
                                                : "text-red-600"
                                            }`}>
                                            {acceptanceLevel.charAt(0).toUpperCase() + acceptanceLevel.slice(1)}
                                        </span>
                                    ) : (
                                        <span className="italic text-gray-500 text-[10px]">Cliquez pour évaluer</span>
                                    )}
                                </div>
                            )}
                            {phase === 4 && (
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-[10px]">CO2:</span>
                                        {co2Estimation ? (
                                            <span className="font-bold text-green-600 text-[10px]">{co2Estimation}/5</span>
                                        ) : (
                                            <span className="italic text-gray-500 text-[10px]">N/A</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-[10px]">Acceptation :</span>
                                        {acceptanceLevel ? (
                                            <span className={`font-bold text-[10px] ${acceptanceLevel === "high"
                                                ? "text-green-600"
                                                : acceptanceLevel === "medium"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                                }`}>
                                                {acceptanceLevel.charAt(0).toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="italic text-gray-500 text-[10px]">N/A</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Selection button */}
                {phase > 1 && isAdmin &&(
                    <button
                        onClick={handleSelectClick}
                        className={`mt-1 w-full py-1 text-xs font-medium rounded transition-colors ${isSelected ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                    >
                        {isSelected ? "Déselectionné" : "Sélectionné"}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div
            className={`relative flex flex-col border-4 ${isSelected ? "border-blue-500" : "border-black"} bg-white rounded-lg shadow-lg overflow-hidden w-full h-full`}
            style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "" }}
            onClick={handleCardClick}
        >
            {renderHeader}
            {renderCardContent()}
            {renderPhaseControls()}
        </div>
    )
}

export default React.memo(SmallCard)
