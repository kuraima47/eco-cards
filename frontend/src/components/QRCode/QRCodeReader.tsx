import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Check } from 'lucide-react';

const QRCodeReader: React.FC = () => {
    const [showScanner, setShowScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [scannedText, setScannedText] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Vérifie qu'on peut accéder à la caméra
    const checkCameraPermission = async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (err) {
            console.error("Permission caméra refusée :", err);
            setError("Permission refusée pour accéder à la caméra.");
            return false;
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showScanner) {
            // On attend un court délai pour s'assurer que le DOM est bien à jour
            timer = setTimeout(async () => {
                const hasPermission = await checkCameraPermission();
                if (hasPermission) {
                    initializeScanner();
                } else {
                    stopScanner();
                }
            }, 500);
        }
        return () => {
            clearTimeout(timer);
            if (isScanning && scannerRef.current) {
                scannerRef.current.stop().catch((error) => {
                    console.debug("Erreur lors du nettoyage du scanner :", error);
                });
            }
        };
    }, [showScanner, showModal]);

    const initializeScanner = async () => {
        try {
            const container = document.getElementById('qr-reader-container');
            if (!container) {
                console.error("L'élément de lecture QR n'a pas été trouvé");
                setError("L'élément de lecture QR n'a pas été trouvé.");
                return;
            }

            // Nettoyer toute instance existante
            if (scannerRef.current) {
                await scannerRef.current.stop().catch(() => {});
                scannerRef.current = null;
            }

            const scanner = new Html5Qrcode('qr-reader-container');
            scannerRef.current = scanner;

            // Configuration minimale
            const config = {
                fps: 10,
                qrbox: 250
            };

            await scanner.start(
                { facingMode: 'environment' },
                config,
                (decodedText) => {
                    stopScanner();
                    setScannedText(decodedText);
                    setShowModal(true);
                },
                (errorMessage) => {
                    console.debug("Erreur de scan :", errorMessage);
                }
            );
            setIsScanning(true);
            setError(null);
        } catch (err: any) {
            console.error('Erreur lors du démarrage du scanner :', err);
            setError("Erreur lors du démarrage du scanner.");
            stopScanner();
        }
    };

    const startScanner = () => {
        setError(null);
        setShowScanner(true);
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop().catch((error: any) => {
                    if (error instanceof Error && error.message.includes("not running")) {
                        console.debug("Erreur ignorée lors de l'arrêt du scanner :", error.message);
                    } else {
                        throw error;
                    }
                });
            } catch (error) {
                console.error("Erreur lors de l'arrêt du scanner :", error);
            } finally {
                scannerRef.current = null;
                setIsScanning(false);
            }
        }
        setShowScanner(false);
    };

    // Fonctions pour la gestion de la modal
    const handleClose = () => {
        setShowModal(false);
        setScannedText('');
    };

    const handleValidate = () => {
        // Implémentez ici la logique de validation (redirection, appel d'API, etc.)
        console.log("QR Code validé :", scannedText);
        setShowModal(false);
    };

    return (
        <div className="text-center">
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {!showScanner ? (
                <button
                    onClick={startScanner}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    aria-label="Activer le scanner QR"
                >
                    <Camera className="w-6 h-6" />
                </button>
            ) : (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <div className="relative w-full max-w-[600px] aspect-square" ref={containerRef}>
                        <div id="qr-reader-container" className="w-full h-full"></div>
                        <button
                            onClick={stopScanner}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                            aria-label="Fermer le scanner"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
            {/* Modal pour afficher le résultat */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">QR Code of card Détecté</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <p className="text-gray-700 break-words">{scannedText}</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={handleValidate}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeReader;
