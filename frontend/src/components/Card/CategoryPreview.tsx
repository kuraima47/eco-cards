import React from 'react';
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
    // Déterminer l'icône à utiliser
    const iconName = categoryIcon ? toPascalCase(categoryIcon) : 'Box';
    // @ts-ignore - L'indexation dynamique n'est pas reconnue par TypeScript
    const IconComponent = (LucideIcons[iconName as keyof typeof LucideIcons] || Box) as React.ElementType;

    return (
        <div
            className={`px-3 text-white rounded-lg shadow-md uppercase flex items-center ${className}`}
            style={{
                backgroundColor: categoryColor,
                ...style
            }}
        >
            <IconComponent className="mr-2" style={{ width: iconSizePx, height: iconSizePx}}/>
            <span className="font-semibold" style={{ marginTop: isForPdf ? "-24px" : "0" }}>
                {categoryName}
            </span>
        </div>
    );
}

export default CategoryPreview;