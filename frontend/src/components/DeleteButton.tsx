import { Trash } from "lucide-react";

type DeleteButtonProps = {
  id : string;
  onClick: (id: string, e: React.MouseEvent) => void;
};

export default function DeleteButton({ id, onClick }: DeleteButtonProps) {
  return (
    <button
      onClick={(e) => onClick(id, e)}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
    >
      <Trash size={20} />
      Supprimer
    </button>
  );
}
