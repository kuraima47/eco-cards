import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import '@testing-library/jest-dom';

// Mock du hook useAuth
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute', () => {
  const mockAuth = (isAuthenticated: boolean, role?: string) => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated,
      user: role ? { role } : null,
    });
  };

  test('redirige vers /auth si l’utilisateur n’est pas authentifié', () => {
    mockAuth(false); // L'utilisateur n'est pas connecté

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute>Private Content</ProtectedRoute>} />
          <Route path="/auth" element={<div>Auth Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  test('redirige vers / si l’utilisateur n’a pas le rôle requis', () => {
    mockAuth(true, 'player'); // L'utilisateur est connecté mais n'a pas le bon rôle

    render(
      <MemoryRouter initialEntries={['/decks']}>
        <Routes>
          <Route path="/decks" element={<ProtectedRoute requiredRole="admin">Admin Page</ProtectedRoute>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  test('affiche le contenu si l’utilisateur est authentifié et a le bon rôle', () => {
    mockAuth(true, 'admin'); // L'utilisateur est connecté et a le bon rôle

    render(
      <MemoryRouter initialEntries={['/decks']}>
        <Routes>
          <Route path="/decks" element={<ProtectedRoute requiredRole="admin">Admin Page</ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });
});
