import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from '../Auth';
import { AuthProvider } from '../../context/AuthContext';
import "@testing-library/jest-dom";

jest.mock('lucide-react', () => ({
    Leaf: () => <svg />,
    Mail: () => <svg />,
    Lock: () => <svg />,
    UserPlus: () => <svg />,
    LogIn: () => <svg />,
    Eye: () => <svg />,
    EyeOff: () => <svg />
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));

//mock saveToken
const saveToken = jest.fn();


//mock local storage
const localStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key],
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();

const mockNavigate = require('react-router-dom').useNavigate;

const renderAuth = () => {
    return render(
        <AuthProvider>
            <MemoryRouter>
                <Auth />
            </MemoryRouter>
        </AuthProvider>
    );
};

// Avant chaque test, on réinitialise le stockage local et les mocks
beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    globalThis.fetch = jest.fn();
});

// Après chaque test, on reset les mocks
afterEach(() => {
    jest.resetAllMocks();
});

test('Affiche le formulaire de connexion par défaut', () => {
    renderAuth();
    expect(screen.getByText(/Connectez-vous à votre compte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
});

test('Peut basculer entre connexion et inscription', async () => {
    renderAuth();
    
    fireEvent.click(screen.getByText(/Pas de compte \? Inscrivez-vous/i));
    
    expect(screen.getByText(/Créez votre compte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
});

test("Empêche l'inscription si les mots de passe ne correspondent pas", async () => {
    renderAuth();
    fireEvent.click(screen.getByText(/Pas de compte \? Inscrivez-vous/i));
    
    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'TestUser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe', { selector: '#password' }), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe', { selector: '#confirmPassword' }), { target: { value: 'abcdef' } });

    fireEvent.click(screen.getByText(/S'inscrire/i));

    await waitFor(() => {
        expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
});

// test('Affiche une erreur si la connexion échoue', async () => {
//     (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
//         Promise.resolve({
//             ok: false,
//             status: 400,
//             json: async () => ({ message: 'Erreur lors de la connexion' })
//         })
//     );

//     renderAuth();

//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@example.com' } });
//     fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'wrongpass' } });

//     fireEvent.click(screen.getByText(/Se connecter/i));

//     const error = await screen.findByText(/Erreur lors de la connexion/i);
//     expect(error).toBeInTheDocument();
// });

// test('Connexion réussie redirige et stocke le token', async () => {
//     (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
//         Promise.resolve({
//             ok: true,
//             status: 200,
//             json: async () => ({
//                 token: 'fake-jwt-token',
//                 user: { email: 'valid@example.com' }
//             })
//         })
//     );

//     localStorage.setItem('authToken', 'fake-jwt-token');

//     renderAuth();

//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'valid@example.com' } });
//     fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } });

//     fireEvent.click(screen.getByText(/Se connecter/i));

//     await waitFor(() => {
//         expect(localStorage.getItem('authToken')).toBe('fake-jwt-token');
//         expect(localStorage.getItem('user')).toContain('valid@example.com');
//         expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
//     });

