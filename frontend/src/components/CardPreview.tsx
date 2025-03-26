import React, { forwardRef } from 'react';
import type { CardImagePreviewProps } from '../types/props';

export const CardPreview = forwardRef<HTMLDivElement, CardImagePreviewProps>(
    ({ cards, metrics }, ref) => {
        const cardStyle: React.CSSProperties = {
            width: metrics.printWidth + 'mm',
            height: metrics.printHeight + 'mm',
            margin: '4px',
            border: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        };

        return (
            <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap' }}>
                {cards.map((card, index) => (
                    <div key={index} style={cardStyle}>
                        <img
                            role='img'
                            src={card.preview}
                            alt={`Card ${index}`}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </div>
                ))}
            </div>
        );
    }
);