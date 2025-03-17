import { Pencil } from "lucide-react";

type UpdateButtonProps = {
  id : string;
  onClick: (id: string, e: React.MouseEvent) => void;
};

export default function UpdateButton({ id, onClick }: UpdateButtonProps) {
  return (
    <button
      onClick={(e) => onClick(id, e)}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
    >
      <Pencil size={20} />
      Mettre à jour
    </button>
  );
}
