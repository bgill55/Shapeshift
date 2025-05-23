import { useState, useEffect } from 'react';
import { EllipsisVertical, Pencil, RotateCcw, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  isBot: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}

export default function MessageActions({ isBot, onRegenerate, onEdit, onDelete }: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  // Close menu when clicking outside
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!(event.target as Element).closest('.message-actions-menu') && 
            !(event.target as Element).closest('.message-actions-button')) {
          setShowMenu(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded hover:bg-[#383a40] text-[#b5bac1] hover:text-white transition-colors message-actions-button"
        aria-label="Message actions"
      >
        <EllipsisVertical size={16} />
      </button>
      
      {showMenu && (
        <div 
          className="fixed mt-1 w-48 bg-[#2b2d31] rounded-md shadow-lg z-50 overflow-hidden"
          style={{
            right: 'auto',
            left: 'auto',
            top: 'auto',
            bottom: 'auto',
          }}
          ref={(el) => {
            if (el) {
              // Get button position
              const button = el.parentElement?.querySelector('button');
              if (!button) return;
              
              const buttonRect = button.getBoundingClientRect();
              const menuRect = el.getBoundingClientRect();
              
              // Default position (right-aligned, below button)
              let left = buttonRect.right - menuRect.width;
              let top = buttonRect.bottom + 5;
              
              // Check right edge of screen
              if (left + menuRect.width > window.innerWidth) {
                left = window.innerWidth - menuRect.width - 10;
              }
              
              // Check left edge of screen
              if (left < 10) {
                left = 10;
              }
              
              // Check bottom edge of screen
              if (top + menuRect.height > window.innerHeight) {
                top = buttonRect.top - menuRect.height - 5;
              }
              
              // Apply calculated position
              el.style.left = `${left}px`;
              el.style.top = `${top}px`;
            }
          }}
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
                Edit Response
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
