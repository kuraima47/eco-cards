import type React from "react"

export const CardBack: React.FC = () => {
  return (
    <div className="card-back bg-emerald-800 rounded-lg h-full">
      <div className="w-full h-full flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-xl md:text-2xl mb-1 md:mb-2">♻️</div>
          <p className="text-xs md:text-sm">Eco Card</p>
        </div>
      </div>
    </div>
  )
}

