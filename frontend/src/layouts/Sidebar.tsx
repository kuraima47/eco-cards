import { BarChart2, BookOpen, Leaf, LogIn, LogOut, Menu, PlaySquare, Settings, UserPlus, Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
    const { isAuthenticated, setIsAuthenticated, user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [isDesktopMenuOpen, setDesktopMenuOpen] = useState(false);

    const handleSignOut = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenExpiration');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserRole('');
        setUser(null);
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { path: '/games', icon: PlaySquare, label: 'Sessions' },
        { path: '/stats', icon: BarChart2, label: 'Statistiques' },
        { path: '/rules', icon: BookOpen, label: 'Règles' },
        { path: '/decks', icon: Wallet, label: 'Decks', adminAccess: true },
    ];

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Mobile Menu Content
    const MobileMenuContent = () => (
        <div className="flex flex-col h-full">
            <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        if (item.adminAccess && !(userRole === 'admin' || (user && user.role === 'admin'))) {
                            return null; // Ne pas afficher cet élément si l'utilisateur n'est pas admin
                        }
                        
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive(item.path)
                                        ? 'bg-green-50 text-green-600'
                                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="space-y-2 mt-2">
                    {isAuthenticated && (userRole === 'admin' || (user && user.role === 'admin')) && (
                        <Link
                            to="/decks"
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-green-50 hover:text-green-600"
                        >
                            <Settings className="h-5 w-5" />
                            <span>Admin</span>
                        </Link>
                    )}
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100 mt-auto">
                {isAuthenticated && (userRole === 'admin' || (user && user.role === 'admin')) && (
                    <Link to="/create-admin" className="flex items-center space-x-1 text-gray-600 hover:text-green-600 mb-2">
                        <UserPlus className="h-5 w-5" />
                        <span>Création de compte admin</span>
                    </Link>
                )}
                {isAuthenticated ? (
                    <button
                        onClick={() => {
                            handleSignOut();
                            closeMobileMenu();
                        }}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Déconnexion</span>
                    </button>
                ) : (
                    <Link
                        to="/auth"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                        <LogIn className="h-5 w-5" />
                        <span>Connexion</span>
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sticky Header - Increased z-index */}
            <header className="hidden lg:flex fixed top-0 left-0 right-0 bg-white z-50 h-16 shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4 flex items-center h-full">
                    {/* Logo & Title - Left Corner */}
                    <div className="flex-shrink-0 mr-8">
                        <Link to="/" className="flex items-center space-x-3">
                            <Leaf className="h-7 w-7 text-green-600" />
                            <span className="text-xl font-bold text-gray-800">Éco-Transitions</span>
                        </Link>
                    </div>

                    {/* Navigation Items - Center/Expanded */}
                    <nav className="flex-grow flex items-center">
                        <div className="flex space-x-6">
                            {menuItems.map((item) => {
                                if (item.adminAccess && !(userRole === 'admin' || (user && user.role === 'admin'))) {
                                    return null; // Ne pas afficher cet élément si l'utilisateur n'est pas admin
                                }
                                
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-2 px-2 py-1 rounded transition-colors ${
                                            isActive(item.path)
                                                ? 'text-green-600 font-medium'
                                                : 'text-gray-600 hover:text-green-600'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Auth & Admin (Right Corner) */}
                    <div className="flex-shrink-0 flex items-center ml-auto">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDesktopMenuOpen(!isDesktopMenuOpen)}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                >
                                    <span>Options de compte</span>
                                </button>
                                {isDesktopMenuOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40"
                                            onClick={() => setDesktopMenuOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                                            {(userRole === 'admin' || (user && user.role === 'admin')) && (
                                                <>
                                                    <Link
                                                        to="/create-admin"
                                                        onClick={() => setDesktopMenuOpen(false)}
                                                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 w-full text-left"
                                                    >
                                                        <UserPlus className="h-5 w-5" />
                                                        <span>Créer un compte administrateur</span>
                                                    </Link>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                </>
                                            )}
                                            <button
                                                onClick={() => {
                                                    handleSignOut();
                                                    setDesktopMenuOpen(false);
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 w-full text-left"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                <span>Déconnexion</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            >
                                <LogIn className="h-5 w-5" />
                                <span>Connexion</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Header - Increased z-index */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-50 flex items-center justify-between px-4 h-16 border-b border-gray-200">
                <Link to="/" className="flex items-center space-x-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    <span className="text-lg font-bold text-gray-800">Éco-Transitions</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`p-2 rounded-lg transition-colors mobile-menu-button ${
                        isMobileMenuOpen
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Menu Sidebar */}
            <div
                className={`lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out mobile-menu-container ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <MobileMenuContent />
            </div>

            {/* Content Padding */}
            <div className="pt-16 lg:pt-16">

            </div>
        </>
    );
};

export default Sidebar;