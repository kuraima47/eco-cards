import React, { useState } from "react";
import { X } from "lucide-react";

interface ImageUploadProps {
    onImageUpload: (file: File | null) => void;
    onRemoveImage: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, onRemoveImage }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (file: File | null) => {
        if (!file || (file.type !== "image/png" && file.type !== "image/jpeg")) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            if (img.width > img.height) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
                onImageUpload(file);
            } else {
                alert("Veuillez sélectionner une image en format paysage (largeur > hauteur).");
                setPreview(null);
                onImageUpload(null);
            }
        };
    };


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Empêche le navigateur d'ouvrir le fichier
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        onImageUpload(null);
        onRemoveImage();

        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };


    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="w-full relative">
                <div
                    className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${dragOver ? "border-blue-500 bg-blue-100" : "border-gray-300"
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="space-y-1 text-center relative">
                        {preview ? (
                            <div className="relative">
                                <img src={preview} alt="Preview" className="mx-auto h-12 w-12 object-cover rounded-md" />
                                <button
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    onClick={handleRemoveImage}
                                    aria-label="Supprimer l'image"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H20V16H8V28H16V36H28V28H36V16H28V8Z"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                        <div className="flex text-sm text-gray-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                                <span>Téléchargez un fichier</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    className="sr-only"
                                    onChange={handleImageChange}
                                />
                            </label>
                            <p className="pl-1">ou glissez-déposez</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10Mo</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;