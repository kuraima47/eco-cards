import React, { useEffect, useState } from "react";
import Notification from "../components/Notification";
import GenericModalConfirm from "../components/Modals/GenericModalConfirm";
import { userService } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RGPD = () => {
    const { isAuthenticated, setIsAuthenticated, user, setUser } = useAuth();
    const [message, setMessage] = useState("");
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUserData = JSON.parse(userData);
            setUserId(parsedUserData.userId);
        }
    }, [userId]);

    const disconnect = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenExpiration');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        navigate('/');
    }

    const openDeleteConfirmation = () => {
        setIsModalOpen(true);
    };

    const performDelete = async () => {
        try {
            if (userId) {
                const response = await userService.deleteUser(userId as string);
                if (response) {
                    setNotification({ message: "Vos données ont été supprimées avec succès.", type: "success" });
                    setTimeout(() => {
                        disconnect();
                    }, 1000);
                } else {
                    setNotification({ message: "Une erreur s'est produite. Veuillez réessayer.", type: "error" });
                }
            }
        } catch (error) {
            setNotification({ message: "Impossible de supprimer les données. Vérifiez votre connexion.", type: "error" });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
            <GenericModalConfirm
                isOpen={isModalOpen}
                message="Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible."
                onConfirm={performDelete}
                onCancel={() => setIsModalOpen(false)}
            />

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    duration={3000}
                    onClose={() => setNotification(null)}
                />
            )}
            
            
            <section className="mb-6">
                <p>Le présent site <strong>Eco-Transitions</strong> est un projet de fin d'études réalisé à des fins pédagogiques.</p>
                <br />
                <h2 className="text-xl font-semibold">1. Éditeurs du site</h2>
                <ul>
                    <li>Nicholas JOURNET</li>
                    <li>Ismaïl EL AISSATE</li>
                    <li>Jeremy-Quang PHAM</li>
                    <li>Thibault POTTIER</li>
                    <li>Arris SAHED</li>
                    <li>Roman SCEAUX</li>
                    <li>Abdoulaye SOUMAH</li>
                    <li>Safouane MERZOUKI</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold">2. Hébergeur du site</h2>
                <p><strong>Nom :</strong> Nicholas Journet</p>
                <p><strong>Adresse :</strong> journet@labri.fr</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold">3. Propriété intellectuelle</h2>
                <p>
                    Tous les éléments présents sur ce site (textes, images, logos, bases de données) sont protégés par le droit d’auteur. Toute reproduction sans autorisation est interdite.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold">4. Responsabilité</h2>
                <p>
                    L’éditeur ne peut être tenu responsable des erreurs, omissions ou indisponibilités du site. Les utilisateurs sont responsables de leurs actions et contenus partagés.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold">5. Données personnelles</h2>
                <p>
                    Les données collectées sont utilisées uniquement pour le bon fonctionnement du site : gestion des comptes, sécurisation du service et amélioration de l’expérience utilisateur.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold">6. Cookies</h2>
                <p>
                    Le site utilise des cookies pour améliorer l’expérience utilisateur. Vous pouvez les gérer via les paramètres de votre navigateur.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold">7. Litiges et droit applicable</h2>
                <p>
                    Tout litige relatif à l’utilisation du site est soumis au droit français. En cas de différend, une médiation pourra être envisagée.
                </p>
            </section>
            
            { userId && 
            <div className="mt-6 text-center">
                <button
                    onClick={openDeleteConfirmation}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    Supprimer mes données
                </button>
                {message && <p className="mt-3 text-center text-gray-700">{message}</p>}
            </div>}
        </div>
    );
};

export default RGPD;
