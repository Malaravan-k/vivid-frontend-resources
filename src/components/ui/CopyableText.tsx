// components/ui/CopyableText.tsx
import { Copy } from 'lucide-react';

const CopyableText = ({ text }: { text: string }) => {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents parent click
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="flex items-center space-x-1 cursor-pointer hover:underline"
      onClick={handleCopy}
    >
      <Copy className="w-4 h-4 text-blue-500" />
      <span>{text}</span>
      
    </div>
  );
};

export default CopyableText;
