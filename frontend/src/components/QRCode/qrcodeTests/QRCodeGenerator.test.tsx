import "@testing-library/jest-dom";
import { render, screen } from '@testing-library/react';
import { useQRCode } from '../../../hooks/useQRCode';
import { QRCodeGenerator } from '../QRCodeGenerator';
// Mock des composants enfants
jest.mock('../QRCodeForm', () => ({
  QRCodeForm: () => <div data-testid="qr-code-form">QRCodeForm</div>,
}));

jest.mock('../QRCodePreview', () => ({
  QRCodePreview: () => <div data-testid="qr-code-preview">QRCodePreview</div>,
}));

jest.mock('../QRCodeReader', () => ({
  __esModule: true,
  default: () => <div data-testid="qr-code-reader">QRCodeReader</div>,
}));

// Mock du hook useQRCode
jest.mock('../../../hooks/useQRCode', () => ({
  useQRCode: jest.fn(() => ({
    value: 'test-value',
    setValue: jest.fn(),
  })),
}));

jest.mock('lucide-react', () => ({
  Link2: () => <svg data-testid="link2-icon" />, // Mock de l'icône Link2
  Upload: () => <svg data-testid="mock-upload" />, // Mock simple du composant Upload
}));


describe('QRCodeGenerator', () => {
  test('affiche les éléments principaux du générateur de QR Code', () => {
    render(<QRCodeGenerator />);

    // Vérifie la présence du titre
    expect(screen.getByText('Générateur de QR Code')).toBeInTheDocument();

    // Vérifie la présence des composants enfants mockés
    expect(screen.getByTestId('qr-code-form')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code-preview')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code-reader')).toBeInTheDocument();
  });

  test('utilise correctement le hook useQRCode', () => {
    render(<QRCodeGenerator />);

    // Vérifie que le hook useQRCode a été appelé
    expect(useQRCode).toHaveBeenCalled();
  });
});

