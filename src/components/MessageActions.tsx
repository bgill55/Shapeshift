import { useState } from 'react';
import { Pencil, EllipsisVertical, RotateCcw, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  isBot: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}

export default function MessageActions({ isBot, onRegenerate, onEdit, onDelete }: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded hover:bg-[#383a40] text-[#b5bac1] hover:text-white transition-colors"
        aria-label="Message actions"
      >
        <EllipsisVertical size={16} />
      </button>
      
      {showMenu && (
        <div 
          className="absolute right-0 top-full mt-1 w-48 bg-[#2b2d31] rounded-md shadow-lg z-10 overflow-hidden"
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="py-1">
            {isBot && onRegenerate && (
              <button
                onClick={() => {
                  onRegenerate();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-[#dcddde] hover:bg-[#383a40] transition-colors"
              >
                <RotateCcw size={16} className="mr-2" />
                Regenerate Response
              </button>
            )}
            
            {isBot && onEdit && (
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-[#dcddde] hover:bg-[#383a40] transition-colors"
              >
                <Pencil size={16} className="mr-2" />
                Pencil Response
              </button>
            )}
            
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-[#ed4245] hover:bg-[#383a40] transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
