import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  currentPage: number; // This is 0-based
  totalRecords: number | null;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalRecords, onPageChange }: PaginationProps) => {
  const pageSize = 10;
  const totalPages = Math.ceil((totalRecords || 0) / pageSize);

  const uiCurrentPage = currentPage + 1; // Convert 0-based to 1-based for display
  const pageNumbers = [];

  let startPage = Math.max(1, uiCurrentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center mt-4 space-x-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant={uiCurrentPage === 1 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(0)}
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2 py-2 text-gray-500">...</span>}
        </>
      )}

      {pageNumbers.map((number) => (
        <Button
          key={number}
          variant={uiCurrentPage === number ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onPageChange(number - 1)} // Adjusting to 0-based
        >
          {number}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 py-2 text-gray-500">...</span>}
          <Button
            variant={uiCurrentPage === totalPages ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(totalPages - 1)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={uiCurrentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
