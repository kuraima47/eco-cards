import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';
import { useNavigate, useLocation } from 'react-router-dom';
import "@testing-library/jest-dom"

// Mock des icônes de lucide-react
jest.mock('lucide-react', () => ({
  Play: () => <div>Play Icon</div>,
  Users: () => <div>Users Icon</div>,
  BarChart2: () => <div>BarChart2 Icon</div>,
  Camera: () => <div>Camera Icon</div>,
}));

// Mock de useNavigate et useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('Home', () => {
  it('affiche un message si un message est passé dans location.state', () => {
    (useLocation as jest.Mock).mockReturnValue({
      state: { message: 'Bienvenue sur notre plateforme de jeu!' },
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Vérifie que le message est bien affiché
    expect(screen.getByText('Bienvenue sur notre plateforme de jeu!')).toBeInTheDocument();
  });

  it('n\'affiche pas de message si aucun message n\'est passé dans location.state', () => {
    (useLocation as jest.Mock).mockReturnValue({
      state: undefined,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Vérifie qu'il n'y a pas de message
    expect(screen.queryByText('Bienvenue sur notre plateforme de jeu!')).toBeNull();
  });

  it('affiche correctement toutes les features avec des icônes mockées', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Vérifie que les titres des features sont bien affichés
    expect(screen.getByText('Sessions de Jeu')).toBeInTheDocument();
    expect(screen.getByText('Mode Hybride')).toBeInTheDocument();
    expect(screen.getByText('Reconnaissance de Cartes')).toBeInTheDocument();
    expect(screen.getByText('Statistiques')).toBeInTheDocument();

    // Vérifie que les icônes mockées sont affichées
    expect(screen.getByText('Play Icon')).toBeInTheDocument();
    expect(screen.getByText('Users Icon')).toBeInTheDocument();
    expect(screen.getByText('Camera Icon')).toBeInTheDocument();
    expect(screen.getByText('BarChart2 Icon')).toBeInTheDocument();
  });

  it('redirige vers /games lorsqu\'on clique sur le bouton "Commencer une Partie"', () => {
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Clique sur le bouton
    fireEvent.click(screen.getByText('Commencer une Partie'));

    // Vérifie que navigate a été appelé avec "/games"
    expect(navigate).toHaveBeenCalledWith('/games');
  });
});
