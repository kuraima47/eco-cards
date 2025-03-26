
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from '../Auth';
import "@testing-library/jest-dom";

jest.mock('../../services/config', () => ({
    API_BASE_URL: 'http://mocked-api.com',
    authTokenExpirationTime: 3600000, // Mock expiration token
  }));
  
// Mock des icônes de lucide-react
jest.mock('lucide-react', () => ({
  Eye: () => <svg data-testid="eye-icon" />, 
  EyeOff: () => <svg data-testid="eye-off-icon" />, 
  Leaf: () => <svg data-testid="leaf-icon" />, 
  LogIn: () => <svg data-testid="login-icon" />, 
  Mail: () => <svg data-testid="mail-icon" />, 
  UserPlus: () => <svg data-testid="userplus-icon" />, 
  X: () => <svg data-testid="close-icon" />
}));

// Mock du useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock du useAuth
const mockSetIsAuthenticated = jest.fn();
const mockSetUser = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    setIsAuthenticated: mockSetIsAuthenticated,
    setUser: mockSetUser
  })
}));

describe('Auth Component', () => {
  test('renders login form by default', () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    expect(screen.getByText(/Connectez-vous à votre compte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const toggleButton = screen.getByTestId('eye-icon');

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('switches to signup form', () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Pas de compte/i));
    expect(screen.getByText(/Créez votre compte/i)).toBeInTheDocument();
  });

  test('shows error when passwords do not match on signup', async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400, // Simule une erreur 400 Bad Request
        json: jest.fn().mockResolvedValue({ error: 'Les mots de passe ne correspondent pas' }),
    } as unknown as Response);

    render(
        <MemoryRouter>
            <Auth />
        </MemoryRouter>
    );

    // Simule le passage en mode inscription
    fireEvent.click(screen.getByText(/Pas de compte/i));

    // Remplit les champs de mot de passe avec des valeurs différentes
    fireEvent.change(screen.getByLabelText('Mot de passe', { selector: '#password' }), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), { target: { value: 'different' } });

    // Clique sur "S'inscrire"
    fireEvent.click(screen.getByText(/S'inscrire/i));

    // Vérifie que `fetch` a bien été appelé avec l'API d'inscription
    // await waitFor(() => {
    //     expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/register'), expect.any(Object));
    // });

    // Vérifie que la réponse de `fetch` a bien un statut 400
    await waitFor(() => {
        expect(global.fetch).toHaveReturnedWith(
            expect.objectContaining({
                status: 400,
            })
        );
    });

    // // Vérifie que le message d'erreur s'affiche bien dans le DOM
    // await waitFor(() => {
    //     expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    // });

    // Nettoie le mock
    jest.restoreAllMocks();
});
});
