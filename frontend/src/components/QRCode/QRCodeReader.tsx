import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Check } from 'lucide-react';
import {useAdmin} from "../../hooks/useAdmin.ts";
import {Group} from "../../types/game.ts";

interface QRCodeReaderProps {
    phase?: number;
    onCO2Estimate?: (groupId:number, cardId: number, value: number) => void;
    onAcceptanceChange?: ((groupId: number, cardId: number, level: "high" | "medium" | "low" | null) => void) | undefined;
    onSelect?: (groupId: number, cardId: number) => void;
    group? : Group | undefined;
}

const QRCodeReader: React.FC<QRCodeReaderProps> = ({
                                                       phase,
                                                       onCO2Estimate,
                                                       onAcceptanceChange,
                                                       onSelect,
                                                       group
                                                   }) => {
    const [showScanner, setShowScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [card, setCard] = useState<any>(null);
    const [showChoiceModal, setShowChoiceModal] = useState(false);

    // États pour la modale supplémentaire
    const [showExtraModal, setShowExtraModal] = useState(false);
    const [extraModalType, setExtraModalType] = useState<"phase2" | "phase3" | null>(null);

    // Pour la phase 2 : estimation CO2
    const [co2Estimate, setCo2Estimate] = useState<number>(0);

    // Pour la phase 3 : choix d'acceptation
    const [acceptanceOption, setAcceptanceOption] = useState<"confirmer" | "refuser">("confirmer");

    const admin = useAdmin();

    // Vérifie qu'on peut accéder à la caméra
    const checkCameraPermission = async (): Promise<boolean> => {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.error("L'accès à la caméra nécessite une connexion sécurisée (HTTPS).");
            setError("L'accès à la caméra nécessite une connexion sécurisée (HTTPS).");
            return false;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
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
                    setShowScanner(false);
                }
            }, 500);
        }
        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                try {
                    // Utilisation d'une approche plus sécurisée avec un indicateur d'état
                    if (isScanning) {
                        scannerRef.current.stop()
                            .then(() => {
                                console.log("Scanner arrêté avec succès");
                            })
                            .catch((error) => {
                                if (error instanceof Error && !error.message.includes("not running")) {
                                    console.warn("Erreur non critique lors de l'arrêt du scanner:", error);
                                }
                            });
                    }
                } catch (e) {
                    console.warn("Erreur lors du nettoyage du scanner:", e);
                }
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
                qrbox: 250,
            };

            await scanner.start(
                { facingMode: 'environment' },
                config,
                (decodedText) => {
                    stopScanner();
                    try {
                        setCard(JSON.parse(decodedText));
                    } catch (e) {
                        console.error("Erreur lors du parsing du JSON :", e);
                    }
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

    // Gestion de la modale principale
    const handleClose = () => {
        setShowModal(false);
        setCard(null);
    };

    // Lorsqu'on clique sur "Valider" dans la modale principale,
    // on ferme cette modale et on ouvre la modale intermédiaire de choix
    const handleValidate = () => {
        const cardId = admin.getCardData(card?.cardName, card?.category, card?.deckName);
        console.log("Card ID : ", cardId);
        if (phase === 2 || phase === 3) {
            setShowModal(false);
            setShowChoiceModal(true);
        } else {
            if (phase === 1 || phase === 4) {
                onSelect?.(group? group.groupId : -1,cardId);
            }
            setShowModal(false);
        }
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

            {/* Modale principale pour afficher le résultat du QR */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">QR Code de la carte détectée</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <p className="text-gray-700"><strong>Nom de la carte :</strong> {card?.cardName}</p>
                            <p className="text-gray-700"><strong>Catégorie :</strong> {card?.category}</p>
                            <p className="text-gray-700"><strong>Valeur :</strong> {card?.cardValue}</p>
                            <p className="text-gray-700"><strong>Nom du deck :</strong> {card?.deckName}</p>
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

            {/* Modale intermédiaire pour choisir entre "Désélectionner" et "Continuer" */}
            {showChoiceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Choix</h3>
                        <p className="text-gray-700 mb-6">Voulez-vous déselectionner la carte ou continuer ?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    const cardId = admin.getCardData(card?.cardName, card?.category, card?.deckName);
                                    onSelect?.(group? group.groupId : -1,cardId);
                                    setShowChoiceModal(false);
                                }}
                                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                            >
                                Désélectionner
                            </button>
                            <button
                                onClick={() => {
                                    if (phase === 2) {
                                        setExtraModalType("phase2");
                                    } else if (phase === 3) {
                                        setExtraModalType("phase3");
                                    }
                                    setShowChoiceModal(false);
                                    setShowExtraModal(true);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                Continuer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale supplémentaire pour la phase 2 : Estimation CO2 */}
            {showExtraModal && extraModalType === "phase2" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Estimation CO2</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <p className="text-gray-700 mb-2">Voulez-vous estimer le CO₂ ?</p>
                            <input
                                type="number"
                                value={co2Estimate}
                                onChange={(e) => setCo2Estimate(parseFloat(e.target.value))}
                                className="w-full border border-gray-300 rounded p-2"
                                placeholder="Entrez une valeur"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowExtraModal(false);
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Désélectionné
                            </button>
                            <button
                                onClick={() => {
                                    const cardId = admin.getCardData(card?.cardName, card?.category, card?.deckName);
                                    onCO2Estimate?.(group? group.groupId : -1,cardId, co2Estimate);
                                    setShowExtraModal(false);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Estimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale supplémentaire pour la phase 3 : Confirmation */}
            {showExtraModal && extraModalType === "phase3" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Confirmation de la carte</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <p className="text-gray-700 mb-2">Veuillez choisir une option :</p>
                            <select
                                value={acceptanceOption}
                                onChange={(e) => setAcceptanceOption(e.target.value as "confirmer" | "refuser")}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="confirmer">Confirmer</option>
                                <option value="refuser">Refuser</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowExtraModal(false);
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Désélectionné
                            </button>
                            <button
                                onClick={() => {
                                    const cardId = admin.getCardData(card?.cardName, card?.category, card?.deckName);
                                    if (acceptanceOption === "confirmer") {
                                        onAcceptanceChange?.(group? group.groupId : -1, cardId, "high");
                                    } else {
                                        onAcceptanceChange?.(group? group.groupId : -1, cardId, null);
                                    }
                                    setShowExtraModal(false);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeReader;
