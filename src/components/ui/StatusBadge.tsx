import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: 'Active' | 'Inactive';
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        status === 'Active' 
          ? "bg-green-100 text-green-800" 
          : "bg-gray-100 text-gray-800",
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-2 w-2 rounded-full",
          status === 'Active' ? "bg-green-400" : "bg-gray-400"
        )}
      />
      {status}
    </span>
  );
};

export default StatusBadge;