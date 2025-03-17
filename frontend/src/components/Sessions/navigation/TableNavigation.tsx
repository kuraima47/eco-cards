import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TableNavigationProps {
  currentTableIndex: number;
  totalTables: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const TableNavigation: React.FC<TableNavigationProps> = ({
  currentTableIndex,
  totalTables,
  onPrevious,
  onNext
}) => {
  return (
    <div className="bg-gray-900 absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-50 rounded-full">
      <button
        onClick={onPrevious}
        className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="bg-white/10 px-6 py-4 rounded-full text-white flex items-center">
        Table {currentTableIndex} of {totalTables}
      </div>
      <button
        onClick={onNext}
        className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};