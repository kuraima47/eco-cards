import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PDFPoc from '../PDFPoc';
import jsPDF from 'jspdf';
import "@testing-library/jest-dom";

// Mock des icônes Lucide
jest.mock('lucide-react', () => ({
    Plus: () => <svg data-testid="plus-icon" />,
    Upload: () => <svg data-testid="upload-icon" />,
    Download: jest.fn()
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  }));
});
  
// Mock de html2canvas
jest.mock('html2canvas', () => jest.fn().mockResolvedValue({
  toDataURL: jest.fn(),
}));


// Mock des composants CardUploader et CardPreview
jest.mock('../../components/CardUploader', () => ({
  CardUploader: ({ onImagesUploaded }: { onImagesUploaded: (cards: any[]) => void }) => (
    <button onClick={() => onImagesUploaded([{
      file: new File([''], 'test.png', { type: 'image/png' }),
      preview: 'test-preview-url',
      width: 100,
      height: 140
    }])}>
      Upload Images
    </button>
  )
}));

jest.mock('../../components/CardPreview', () => ({
  CardPreview: jest.fn().mockImplementation(({ cards, metrics }: { cards: any[], metrics: { printWidth: number, printHeight: number } }) => (
    <div data-testid="card-preview">
      {cards.length} cartes - {metrics.printWidth}x{metrics.printHeight}mm
    </div>
  ))
}));


describe('PDFpoc Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche l’état initial correctement', () => {
    render(<PDFPoc />);
    expect(screen.getByText('Générateur de Planche de Cartes')).toBeInTheDocument();
    expect(screen.queryByTestId('card-preview')).not.toBeInTheDocument();
  });

  it('gère correctement l’upload des images', async () => {
    render(<PDFPoc />);
    
    const uploadButton = screen.getByText('Upload Images');
    await userEvent.click(uploadButton);

    expect(screen.getByTestId('card-preview')).toBeInTheDocument();
    expect(screen.getByText(/1 cartes/)).toBeInTheDocument();
  });

  it('met à jour les métriques quand les valeurs des inputs changent', async () => {
    render(<PDFPoc />);
    
    // Upload images pour afficher les inputs
    const uploadButton = screen.getByText('Upload Images');
    await userEvent.click(uploadButton);

    // Récupérer les inputs
    const widthInput = screen.getByLabelText(/Largeur d'impression/i) as HTMLInputElement;
    const heightInput = screen.getByLabelText(/Hauteur d'impression/i) as HTMLInputElement;
    const dpiInput = screen.getByLabelText(/Résolution/i) as HTMLInputElement;

    // Modifier les valeurs avec userEvent.type
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, '70');

    await userEvent.clear(heightInput);
    await userEvent.type(heightInput, '95');
    
    await userEvent.clear(dpiInput);
    await userEvent.type(dpiInput, '400');

    expect(widthInput.value).toBe('70');
    expect(heightInput.value).toBe('95');
    expect(dpiInput.value).toBe('400');
  });

  // test('génère un PDF quand le bouton est cliqué', async () => {
  //   render(<PDFPoc />);

  //   // Simuler l'ajout d'une carte pour rendre le bouton visible
  //   // const testCard = { id: 1, preview: 'test.png', width: 100, height: 150 };
  //   // act(() => {
  //   //   screen.getByText('Générateur de Planche de Cartes'); // Attendre le rendu
  //   // });
  //   const uploadButton = screen.getByText('Upload Images');
  //   await userEvent.click(uploadButton);

  //   // Trouver le bouton une fois les cartes ajoutées
  //   const bouton = await screen.findByRole('button', { name: /télécharger le pdf/i });
  //   expect(bouton).toBeInTheDocument();

  //   // Simuler un clic sur le bouton
  //   fireEvent.click(bouton);

  //   // Vérifier que jsPDF a été instancié
  //   expect(jsPDF).toHaveBeenCalledTimes(1);

  //   // Vérifier que save() a été appelé sur l'instance mockée
  //   const mockInstance = (jsPDF as unknown as jest.Mock).mock.instances[0];
  //   expect(mockInstance.save).toHaveBeenCalledTimes(1);
  // });

  it('affiche correctement la prévisualisation après l’upload', async () => {
    render(<PDFPoc />);
    
    const uploadButton = screen.getByText('Upload Images');
    await userEvent.click(uploadButton);

    const preview = screen.getByTestId('card-preview');
    expect(preview).toHaveTextContent('63.5x88.9mm'); // Dimensions par défaut
  });

  it('met à jour la prévisualisation après modification des métriques', async () => {
    render(<PDFPoc />);
    
    // Upload des images
    const uploadButton = screen.getByText('Upload Images');
    await userEvent.click(uploadButton);

    // Modifier la largeur
    const widthInput = screen.getByLabelText(/Largeur d'impression/i);
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, '70');

    const preview = screen.getByTestId('card-preview');
    expect(preview).toHaveTextContent('70x88.9mm');
  });

  it('valide les valeurs des inputs de métriques', async () => {
    render(<PDFPoc />);
    
    // Upload des images
    const uploadButton = screen.getByText('Upload Images');
    await userEvent.click(uploadButton);

    const widthInput = screen.getByLabelText(/Largeur d'impression/i);
    const heightInput = screen.getByLabelText(/Hauteur d'impression/i);
    const dpiInput = screen.getByLabelText(/Résolution/i);

    // Tester des valeurs négatives
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, '-10');
    await userEvent.clear(heightInput);
    await userEvent.type(heightInput, '-10');
    await userEvent.clear(dpiInput);
    await userEvent.type(dpiInput, '-10');

    // Vérifier que les valeurs restent valides
    expect(Number((widthInput as HTMLInputElement).value)).toBeGreaterThanOrEqual(0);
    expect(Number((heightInput as HTMLInputElement).value)).toBeGreaterThanOrEqual(0);
    expect(Number((dpiInput as HTMLInputElement).value)).toBeGreaterThanOrEqual(0);
  });


  function setCards(arg0: { id: number; imageUrl: string; }[]) {
    throw new Error('Function not implemented.');
  }
//   it('calcule correctement le nombre de cartes par page', async () => {
//     render(<PDFPoc />);
    
//     // Upload des images
//     const uploadButton = screen.getByText('Upload Images');
//     await userEvent.click(uploadButton);

//     const downloadButton = screen.getByText('Télécharger le PDF');
//     await userEvent.click(downloadButton);

//     // Vérifier les calculs de génération du PDF
//     const mockJsPDF = (jsPDF as unknown as jest.Mock).mock.results[0].value;
//     const pageWidth = mockJsPDF.internal.pageSize.getWidth();
//     const pageHeight = mockJsPDF.internal.pageSize.getHeight();
    
//     expect(pageWidth).toBe(210); // Largeur A4 en mm
//     expect(pageHeight).toBe(297); // Hauteur A4 en mm
//   });
});
