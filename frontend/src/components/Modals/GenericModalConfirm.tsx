import React from "react";

interface GenericModalConfirmProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const GenericModalConfirm: React.FC<GenericModalConfirmProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-50" 
        onClick={onCancel}
      ></div>
      
      {/* Modal */}
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10 shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Confirmation</h3>
        <p className="mb-6 text-gray-700">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericModalConfirm;