import { Html5Qrcode } from "html5-qrcode";
import { Check } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from "react";
import { QRCodePreviewProps } from '../../types/props';

export function QRCodePreview({ url, qrColor, bgColor, logo }: QRCodePreviewProps) {
    const [showScanner, setShowScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [card, setCard] = useState<any>(null);

    // Modifiez la valeur de phase selon vos besoins (ici phase2 ou phase3)
    let phase = 3;
    const onCO2Estimate = () => {};
    const onAcceptanceChange = () => {};
    const onSelect = () => {};

    // États pour la modale supplémentaire (phase2 ou phase3)
    const [showExtraModal, setShowExtraModal] = useState(false);
    const [extraModalType, setExtraModalType] = useState<"phase2" | "phase3" | null>(null);

    // Pour la phase 2 : estimation CO2
    const [co2Estimate, setCo2Estimate] = useState<number>(0);

    // Pour la phase 3 : choix d'acceptation
    const [acceptanceOption, setAcceptanceOption] = useState<"confirmer" | "refuser">("confirmer");

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

    // Lorsque l'utilisateur clique sur "Valider", on ferme la modale principale
    // et on affiche la modale de choix (deselect ou continuer)
    const handleValidate = () => {
        setShowModal(false);
        setShowChoiceModal(true);
    };

    return (
        <div className="flex items-center justify-center">
            <div className="relative group">
                <div className="relative bg-white rounded-2xl p-4">
                    <QRCodeSVG
                        role="img"
                        value={url}
                        size={100}
                        fgColor={qrColor}
                        bgColor={bgColor}
                        level="Q"
                        imageSettings={
                            logo
                                ? {
                                    src: logo,
                                    width: 25,
                                    height: 25,
                                    excavate: true,
                                }
                                : undefined
                        }
                    />
                    <button
                        onClick={() => {
                            // Simulation d'un scan avec des données fictives
                            setCard({
                                cardName: "Carte de Test",
                                category: "Fiction",
                                cardValue: "42",
                                deckName: "Deck de Test"
                            });
                            setShowModal(true);
                        }}
                    >
                        Show Modal
                    </button>
                </div>

                {/* Modale principale affichant les infos de la carte */}
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

                {/* Modale intermédiaire pour choisir entre "Unselect" et "Continuer" */}
                {showChoiceModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <h3 className="text-xl font-semibold mb-4">Choix</h3>
                            <p className="text-gray-700 mb-6">Voulez-vous déselectionner la carte ou continuer ?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        // Option "Unselect" : rappel de la fonction onSelect
                                        //onSelect?.(1, 1);
                                        setShowChoiceModal(false);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Unselect
                                </button>
                                <button
                                    onClick={() => {
                                        // Option "Continuer" : on prépare l'extramodale selon la phase
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
                                        //onSelect?.(1, 1);
                                        setShowExtraModal(false);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Unselect
                                </button>
                                <button
                                    onClick={() => {
                                        //onCO2Estimate?.(1, co2Estimate);
                                        //onSelect?.(1, 1);
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
                                        //onSelect?.(1, 1);
                                        setShowExtraModal(false);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Unselect
                                </button>
                                <button
                                    onClick={() => {
                                        if (acceptanceOption === "confirmer") {
                                            //onAcceptanceChange?.(1, "high");
                                        } else {
                                            //onAcceptanceChange?.(1, null);
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
        </div>
    );
}
