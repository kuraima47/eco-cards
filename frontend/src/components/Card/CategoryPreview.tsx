import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Box } from 'lucide-react';
import { toPascalCase } from '../../utils/formatting';

interface CategoryPreviewProps {
    categoryName: string;
    categoryIcon?: string;
    categoryColor?: string;
    cardCount?: number;
    totalCards?: number;
    className?: string;
    style?: React.CSSProperties;
    iconSizePx?: string;
    isForPdf?: boolean;
}

/**
 * Composant qui affiche la bannière de catégorie avec l'icône et la couleur correspondante
 */
export function CategoryPreview({
    categoryName,
    categoryIcon,
    categoryColor = '#6B7280',
    className = '',
    style = {},
    iconSizePx = "5px",
    isForPdf = false
}: CategoryPreviewProps) {
    // Mémoriser l'icône pour éviter de la recalculer à chaque rendu
    const IconComponent = useMemo(() => {
        const iconName = categoryIcon ? toPascalCase(categoryIcon) : 'Box';
        return (LucideIcons[iconName as keyof typeof LucideIcons] || Box) as React.ElementType;
    }, [categoryIcon]);

    // Mémoriser les styles combinés pour éviter de créer un nouvel objet à chaque rendu
    const combinedStyles = useMemo(() => ({
        backgroundColor: categoryColor,
        ...style
    }), [categoryColor, style]);

    // Mémoriser les styles de l'icône
    const iconStyles = useMemo(() => ({
        width: iconSizePx,
        height: iconSizePx
    }), [iconSizePx]);

    // Mémoriser les styles du texte
    const textStyles = useMemo(() => ({
        marginTop: isForPdf ? "-24px" : "0"
    }), [isForPdf]);

    return (
        <div
            className={`px-3 text-white rounded-lg shadow-md uppercase flex items-center ${className}`}
            style={combinedStyles}
        >
            <IconComponent className="mr-2" style={iconStyles} />
            <span className="font-semibold" style={textStyles}>
                {categoryName}
            </span>
        </div>
    );
}

export default React.memo(CategoryPreview);