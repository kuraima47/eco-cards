import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    debounceTime?: number;
}

export function SearchBar({ value, onChange, debounceTime = 300 }: SearchBarProps) {
    const [inputValue, setInputValue] = useState(value);

    // Utiliser useCallback pour éviter de recréer cette fonction à chaque rendu
    const debouncedOnChange = useCallback(
        (newValue: string) => {
            setInputValue(newValue);
        },
        []
    );

    // Effet pour appliquer le debounce
    useEffect(() => {
        // Programmer l'appel à onChange après le délai spécifié
        const timer = setTimeout(() => {
            if (inputValue !== value) {
                onChange(inputValue);
            }
        }, debounceTime);

        // Nettoyer le timer si l'input change à nouveau avant la fin du délai
        return () => clearTimeout(timer);
    }, [inputValue, onChange, debounceTime, value]);

    return (
        <div className="p-4 flex items-center">
            <div className="relative flex-1 max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => debouncedOnChange(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Recherchez un nom de deck, de catégorie ou de carte."
                />
                {inputValue && (
                    <button
                        onClick={() => {
                            setInputValue('');
                            onChange('');
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>
        </div>
    );
}