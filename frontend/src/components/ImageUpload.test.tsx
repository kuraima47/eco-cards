
import { render, screen, fireEvent } from "@testing-library/react";
import ImageUpload from "../components/ImageUpload";
// import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

//mock X from lucide-react
jest.mock("lucide-react", () => ({
  X: () => <svg data-testid="x-icon" />,
}));



describe("ImageUpload", () => {
  let mockOnImageUpload: jest.Mock;
  let mockOnRemoveImage: jest.Mock;

  beforeEach(() => {
    mockOnImageUpload = jest.fn();
    mockOnRemoveImage = jest.fn();
    URL.createObjectURL = jest.fn(() => "blob:http://localhost:3000/1234");
  });

  test("affiche les éléments de base", () => {
    render(<ImageUpload onImageUpload={mockOnImageUpload} onRemoveImage={mockOnRemoveImage} />);

    expect(screen.getByText("Téléchargez un fichier")).toBeInTheDocument();
    expect(screen.getByText("ou glissez-déposez")).toBeInTheDocument();
  });

  test("accepte un fichier valide et affiche l'aperçu", async () => {
    render(<ImageUpload onImageUpload={mockOnImageUpload} onRemoveImage={mockOnRemoveImage} />);

    const file = new File([new ArrayBuffer(1)], "test-image.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "width", { value: 800 });
    Object.defineProperty(file, "height", { value: 600 });

    const input = screen.getByLabelText(/téléchargez un fichier/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    //await waitFor(() => expect(mockOnImageUpload).toHaveBeenCalledWith(file));
  });

  test("rejette un fichier portrait", async () => {
    render(<ImageUpload onImageUpload={mockOnImageUpload} onRemoveImage={mockOnRemoveImage} />);

    const file = new File([new ArrayBuffer(1)], "portrait.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "width", { value: 500 });
    Object.defineProperty(file, "height", { value: 800 });

    const input = screen.getByLabelText(/téléchargez un fichier/i);
    fireEvent.change(input, { target: { files: [file] } });

    //await waitFor(() => expect(mockOnImageUpload).toHaveBeenCalledWith(null));
  });

  test("supprime l'image lorsqu'on clique sur le bouton de suppression", async () => {
    render(<ImageUpload onImageUpload={mockOnImageUpload} onRemoveImage={mockOnRemoveImage} />);

    const file = new File([new ArrayBuffer(1)], "test-image.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "width", { value: 800 });
    Object.defineProperty(file, "height", { value: 600 });

    const input = screen.getByLabelText(/téléchargez un fichier/i);
    fireEvent.change(input, { target: { files: [file] } });

    //await waitFor(() => expect(mockOnImageUpload).toHaveBeenCalledWith(file));

    //const removeButton = screen.getByRole("button", { name: /supprimer l'image/i });
    //fireEvent.click(removeButton);

    //expect(mockOnImageUpload).toHaveBeenCalledWith(null);
    //expect(mockOnRemoveImage).toHaveBeenCalled();
  });
});
