
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { QRCodeForm } from "../QRCodeForm";
// Mock de lucide-react pour éviter les erreurs d'import
jest.mock("lucide-react", () => ({
  Upload: () => <svg data-testid="mock-upload" />,
  Download: () => <svg data-testid="mock-download" />,
}));

describe("QRCodeForm", () => {
  const mockSetUrl = jest.fn();
  const mockSetQrColor = jest.fn();
  const mockHandleLogoUpload = jest.fn();
  const mockHandleLogoDelete = jest.fn();
  const mockDownloadQRCode = jest.fn();
  const mockSetBgColor = jest.fn();

  it("affiche les champs URL, couleur, upload logo et le bouton de téléchargement", () => {
    render(
      <QRCodeForm
        url=""
        setUrl={mockSetUrl}
        qrColor="#000000"
        setQrColor={mockSetQrColor}
        bgColor="#FFFFFF"
        setBgColor={mockSetBgColor}
        logo={null}
        fileInputRef={{ current: null } as unknown as React.RefObject<HTMLInputElement>}
        handleLogoUpload={mockHandleLogoUpload}
        handleLogoDelete={mockHandleLogoDelete}
        downloadQRCode={mockDownloadQRCode}
      />
    );

    // Vérifier la présence du champ URL
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();

    // Vérifier la présence du sélecteur de couleur
    expect(screen.getByLabelText(/Couleur du QR Code/i)).toBeInTheDocument();

    // Vérifier la présence du bouton d'upload de logo (mocké)
    expect(screen.getByTestId("mock-upload")).toBeInTheDocument();

    // Vérifier la présence du bouton de téléchargement (mocké)
    expect(screen.getByTestId("mock-download")).toBeInTheDocument();
  });

  it("permet de modifier l'URL", () => {
    render(
      <QRCodeForm
        url=""
        setUrl={mockSetUrl}
        qrColor="#000000"
        setQrColor={mockSetQrColor}
        logo={null}
        fileInputRef={{ current: null } as unknown as React.RefObject<HTMLInputElement>}
        handleLogoUpload={mockHandleLogoUpload}
        handleLogoDelete={mockHandleLogoDelete}
        downloadQRCode={mockDownloadQRCode}
        bgColor="#FFFFFF"
        setBgColor={mockSetBgColor}

      />
    );

    const input = screen.getByLabelText(/URL/i);
    fireEvent.change(input, { target: { value: "https://example.com" } });

    expect(mockSetUrl).toHaveBeenCalledWith("https://example.com");
  });

  it("permet de changer la couleur du QR Code", () => {
    render(
      <QRCodeForm
        url=""
        setUrl={mockSetUrl}
        qrColor="#000000"
        setQrColor={mockSetQrColor}
        logo={null}
        fileInputRef={{ current: null } as unknown as React.RefObject<HTMLInputElement>}
        handleLogoUpload={mockHandleLogoUpload}
        handleLogoDelete={mockHandleLogoDelete}
        downloadQRCode={mockDownloadQRCode}
        bgColor="#FFFFFF"
        setBgColor={mockSetBgColor}
      />
    );

    const colorInput = screen.getByLabelText(/Couleur du QR Code/i);
    fireEvent.change(colorInput, { target: { value: "#FF5733" } });

    expect(mockSetQrColor).toHaveBeenCalledWith(("#FF5733").toLowerCase());
  });

  it("déclenche la fonction de téléchargement quand on clique sur le bouton", () => {
    render(
      <QRCodeForm
        url=""
        setUrl={mockSetUrl}
        qrColor="#000000"
        setQrColor={mockSetQrColor}
        logo={null}
        fileInputRef={{ current: null } as unknown as React.RefObject<HTMLInputElement>}
        handleLogoUpload={mockHandleLogoUpload}
        handleLogoDelete={mockHandleLogoDelete}
        downloadQRCode={mockDownloadQRCode}
        bgColor="#FFFFFF"
        setBgColor={mockSetBgColor}
      />
    );

    const downloadButton = screen.getByText(/Télécharger le QR Code/i);
    fireEvent.click(downloadButton);

    expect(mockDownloadQRCode).toHaveBeenCalled();
  });
});
