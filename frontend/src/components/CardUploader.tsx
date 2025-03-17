// CardUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { CardImage } from '../types';

interface CardUploaderProps {
    onImagesUploaded: (images: CardImage[]) => void;
}

export function CardUploader({ onImagesUploaded }: CardUploaderProps) {
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const processedImages: CardImage[] = await Promise.all(
                acceptedFiles.map(
                    (file) =>
                        new Promise<CardImage>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const img = new Image();
                                img.onload = () => {
                                    resolve({
                                        file,
                                        preview: URL.createObjectURL(file),
                                        width: img.width,
                                        height: img.height,
                                    });
                                };
                                img.src = reader.result as string;
                            };
                            reader.readAsDataURL(file);
                        })
                )
            );
            onImagesUploaded(processedImages);
        },
        [onImagesUploaded]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
    });

    return (
        <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                    ? 'Déposez les images ici...'
                    : 'Glissez-déposez vos images de cartes ici, ou cliquez pour sélectionner des fichiers'}
            </p>
        </div>
    );
}
