import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import RGPDFooter from './layouts/RGPDFooter';
import Sidebar from './layouts/Sidebar';
import Auth from './pages/Auth';
import CreateAdmin from './pages/CreateAdmin';
import DeckPage from './pages/deckPage.tsx';
import Home from './pages/Home';
import RGPD from './pages/RGPD';
import Rules from './pages/Rules';
import Games from './pages/session/Games.tsx';
import GameSetup from './pages/session/GameSetup.tsx';
import SessionPhases from './pages/session/SessionPhase.tsx';
import Stats from './pages/Stats';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col">
                    <Sidebar />
                    <main className="flex-1 p-2 lg:p-8 pt-20 lg:pt-20 pb-10">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/games" element={<Games />} />
                            <Route path="/games/new" element={<ProtectedRoute><GameSetup /></ProtectedRoute>} />
                            <Route path="/games/:id" element={<ProtectedRoute><GameSetup /></ProtectedRoute>} />
                            <Route path="/games/:sessionId/phase/:phase" element={<ProtectedRoute><SessionPhases /></ProtectedRoute>} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/mentions-legales" element={<RGPD />} />
                            <Route
                                path="/create-admin"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <CreateAdmin />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/rules" element={<Rules />} />
                            <Route path="/deckpage" element={<DeckPage />} />
                            <Route
                                path="/stats"
                                element={
                                    <ProtectedRoute>
                                        <Stats />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/decks"
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <DeckPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                    <RGPDFooter />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;