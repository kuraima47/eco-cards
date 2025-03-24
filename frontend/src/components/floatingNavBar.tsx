import React, { useState } from 'react';
import { Home, Search, Plus, Heart, Inbox, Camera, Edit, Send, X } from 'lucide-react';

const FloatingNavbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-md px-4">
            {/* Boutons d'action secondaires */}
            <div className="relative">
                {/* Bouton Camera (en haut) */}
                <button
                    className={`absolute left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all duration-300 ${
                        isOpen ? 'opacity-100 -translate-y-24' : 'opacity-0 translate-y-0 pointer-events-none'
                    }`}
                >
                    <Camera className="h-6 w-6" />
                </button>

                {/* Bouton Edit (à gauche) */}
                <button
                    className={`absolute left-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all duration-300 ${
                        isOpen ? 'opacity-100 -translate-y-16 -translate-x-16' : 'opacity-0 translate-y-0 pointer-events-none'
                    }`}
                >
                    <Edit className="h-6 w-6" />
                </button>

                {/* Bouton Send (à droite) */}
                <button
                    className={`absolute left-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all duration-300 ${
                        isOpen ? 'opacity-100 -translate-y-16 translate-x-12' : 'opacity-0 translate-y-0 pointer-events-none'
                    }`}
                >
                    <Send className="h-6 w-6" />
                </button>
            </div>

            {/* Overlay semi-transparent quand le menu est ouvert */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
                    onClick={toggleMenu}
                />
            )}

            <div className="relative flex items-center justify-between rounded-full bg-white p-4 shadow-lg">
                {/* Bouton d'accueil */}
                <button className="flex flex-1 flex-col items-center justify-center text-green-500">
                    <Home className="h-6 w-6 stroke-[1.5px]" />
                </button>

                {/* Bouton de recherche */}
                <button className="flex flex-1 flex-col items-center justify-center text-green-500">
                    <Search className="h-6 w-6 stroke-[1.5px]" />
                </button>

                {/* Espace pour le bouton flottant */}
                <div className="flex-1"></div>

                {/* Bouton favoris */}
                <button className="flex flex-1 flex-col items-center justify-center text-green-500">
                    <Heart className="h-6 w-6 stroke-[1.5px]" />
                </button>

                {/* Bouton boîte de réception */}
                <button className="flex flex-1 flex-col items-center justify-center text-green-500">
                    <Inbox className="h-6 w-6 stroke-[1.5px]" />
                </button>

                <button
                    onClick={toggleMenu}
                    className={`absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full ${
                        isOpen ? 'bg-green-700' : 'bg-green-600'
                    } text-white shadow-lg transition-all duration-300 hover:scale-110 z-10`}
                >
                    {isOpen ? (
                        <X className="h-8 w-8" />
                    ) : (
                        <Plus className="h-8 w-8" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default FloatingNavbar;