import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { QRCodePreview } from '../QRCodePreview';



describe('QRCodePreview', () => {
  const defaultProps = {
    url: 'http://example.com',
    qrColor: '#000000',
    bgColor: '#ffffff',
    logo: null,
  };

  test('affiche un QR Code avec l\'URL donnée', () => {
    render(<QRCodePreview {...defaultProps} />);

    // Vérifie que le QR Code SVG est bien présent
    const qrCode = screen.getByRole('img');
    expect(qrCode).toBeInTheDocument();
  });

  test('affiche le QR Code avec un logo si un logo est fourni', () => {
    const logoUrl = 'https://example.com/logo.png';

    render(<QRCodePreview {...defaultProps} logo={logoUrl} />);

    // Vérifie que le logo est bien intégré dans le QR Code
    const qrCode = screen.getByRole('img');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode.innerHTML).toContain(logoUrl); // Vérifie que le logo est bien présent dans l'image
  });

  test('fonctionne sans logo', () => {
    render(<QRCodePreview {...defaultProps} />);

    // Vérifie qu'il n'y a pas d'image de logo spécifique dans le QR Code
    const qrCode = screen.getByRole('img');
    expect(qrCode.innerHTML).not.toContain('<image'); // Un logo SVG serait une balise <image>
  });
});
