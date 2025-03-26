import { Eye, EyeOff, Leaf, LogIn, Mail, UserPlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS, authTokenExpirationTime } from '../services/config';
import { User } from '../types/game';

import CGU from '../components/CGU';

const Auth = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { setIsAuthenticated, setUser } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //CGU
    const [accepted, setAccepted] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isAuthTokenValid()) {
            navigate('/');
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    throw new Error('Les mots de passe ne correspondent pas');
                }
                if (password.length < 6) {
                    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
                }

                // Register
                const response = await fetch(`${API_ENDPOINTS.AUTH}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Une erreur est survenue lors de l\'inscription');
                }

                navigate('/', { state: { message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' } });
            } else {
                // Login
                const data = await login(email, password);
                if (data.token) {
                    saveAuthToken(data.token, data.user);
                    setIsAuthenticated(true);
                    setUser(data.user);
                }

                // Navigate vers la page appropriée
                navigate('/', { state: { message: 'Connexion réussie !' } });
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field: 'password' | 'confirm') => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.message === 'User not found') {
                throw new Error('Adresse mail inexistante.');
            } else if (errorData.message === 'Invalid password') {
                throw new Error('Mot de passe incorrect.');
            } else {
                throw new Error('Erreur lors de la connexion.');
            }
        }

        const data = await response.json();
        return data;
    };

    const saveAuthToken = (token: string, user: User) => {
        const expirationTime = authTokenExpirationTime;
        localStorage.setItem('authToken', token);
        localStorage.setItem('authTokenExpiration', expirationTime.toString());
        localStorage.setItem('user', JSON.stringify(user));
    };

    const isAuthTokenValid = () => {
        const token = localStorage.getItem('authToken');
        const expiration = localStorage.getItem('authTokenExpiration');
        if (!token || !expiration) {
            return false;
        }
        const expirationTime = parseInt(expiration, 10);
        return new Date().getTime() < expirationTime;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white p-3 rounded-full shadow-md">
                            <Leaf className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Éco-Transitions</h2>
                    <p className="mt-2 text-gray-600">
                        {isSignUp ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Nom d'utilisateur
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('password')}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {isSignUp && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirmer le mot de passe
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        {isSignUp && (
                            <div className="mt-6 flex items-center">
                                <input
                                type="checkbox"
                                id="acceptCGU"
                                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                checked={accepted}
                                onChange={() => setAccepted(!accepted)}
                                />
                                <label htmlFor="acceptCGU" className="text-sm text-gray-700">
                                Cochez pour accepter nos <span className="text-blue-600 cursor-pointer underline" onClick={() => setShowModal(true)}>Conditions Générales d'Utilisation</span>
                                </label>
                            </div>
                        )}

                        <div>
                        <button
                            type="submit"
                            disabled={loading || (isSignUp && !accepted)}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${loading || (isSignUp && !accepted) ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:ring-green-500"}
                                focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            ) : isSignUp ? (
                                <>
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    S'inscrire
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Se connecter
                                </>
                            )}
                        </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setPassword('');
                                setConfirmPassword('');
                            }}
                            className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
            </button>
            <div className="max-h-96 overflow-y-auto p-4 border border-gray-300 rounded-lg">
                <CGU />
            </div>
        </div>
      )}
        </div>
    );
};

export default Auth;