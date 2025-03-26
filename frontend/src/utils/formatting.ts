/**
 * Convertit une chaîne en format PascalCase
 * @param str - La chaîne à convertir
 * @returns La chaîne au format PascalCase
 */
export const toPascalCase = (str: string): string => {
    if (!str) return '';

    return str
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
};

/**
 * Permet de générer une valeur de CO2 sous forme de code afin de le cacher au près des joueurs
 * @param co2Value La valeur en CO2 de la carte
 * @returns Le code généré
 */
export const generateCodeFromCO2 = (co2Value: number | null): string => {
    const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

    if (co2Value === undefined || co2Value === null) {
        return '??';
    }

    const co2Str = String(co2Value);
    if (co2Str.length === 1) {
        const letter1 = getRandomLetter();
        let letter2 = getRandomLetter();
        while (letter1 === letter2) {
            letter2 = getRandomLetter();
        }
        const digit1 = Math.floor(Math.random() * 10);
        return `${letter1}${digit1}/${letter2}${co2Value}`;
    } else {
        const letter = getRandomLetter();
        const part1 = co2Str.slice(0, co2Str.length - 1);
        const part2 = co2Str.slice(-1);
        return `${letter}${part1}/${letter}${part2}`;
    }
}

/**
 * Formate une image en base64
 * @param data - Les données de l'image
 * @param type - Le type de l'image
 * @returns L'image en base64
 */
export const formatImageName = (data: string, type: string): string => {
    if (!data || !type) return '';
    return `data:${type};base64,${data}`;
}


/**
 * Convertit un buffer en chaîne de caractères base64
 * @param buffer - Le buffer à convertir
 * @returns La chaîne de caractères base64
 */
export const arrayBufferToBase64 = (buffer: Uint8Array) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/**
 * Convertit une valeur en tableau.
 * - Si c'est déjà un tableau, le retourne tel quel
 * - Si c'est une chaîne qui représente un tableau JSON, la parse
 * - Sinon, retourne un tableau avec la valeur ou un tableau vide
 */
export function ensureArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        try {
            // Vérifie si la chaîne ressemble à un tableau JSON
            if (value.trim().startsWith('[') && value.trim().endsWith(']')) {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
            // Si ce n'est pas un tableau JSON valide, traiter comme valeur unique
            return value ? [value as unknown as T] : [];
        } catch {
            // Si le parsing échoue, traiter comme valeur unique
            return value ? [value as unknown as T] : [];
        }
    }

    // Pour les autres types, inclure la valeur si elle existe
    return value ? [value as unknown as T] : [];
}