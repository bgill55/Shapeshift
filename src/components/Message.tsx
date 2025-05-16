import { useState } from 'react';
import { Bot, Pen, MoveHorizontal, Reply, Star, Trash2 } from 'lucide-react';

type MessageProps = {
  author: string;
  content: string;
  timestamp: string;
  isBot?: boolean;
};

export default function Message({ author, content, timestamp, isBot = false }: MessageProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  // Generate initials for avatar
  const initials = author
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Generate a consistent color based on the author's name
  const getAvatarColor = (name: string) => {
    const colors = [
      'rgb(88, 101, 242)', // Discord blue
      'rgb(59, 165, 93)',  // Discord green
      'rgb(237, 66, 69)',  // Discord red
      'rgb(250, 166, 26)', // Discord yellow
      'rgb(110, 86, 235)', // Discord purple
    ];
    
    // Simple hash function to get a consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  const avatarColor = isBot ? 'rgb(88, 101, 242)' : getAvatarColor(author);
  
  return (
    <div 
      className="py-2 px-1 hover:bg-[#2e3035] rounded group"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="flex">
        <div className="mr-4 mt-0.5">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {isBot ? <Bot size={20} /> : initials}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="font-medium text-white flex items-center">
              {author}
              {isBot && (
                <span className="ml-1 text-xs bg-[#5865f2] px-1.5 py-0.5 rounded-sm">BOT</span>
              )}
            </div>
            <div className="text-xs text-[#949ba4] ml-2">{formattedTime}</div>
            
            {showOptions && (
              <div className="ml-4 flex gap-1 text-[#949ba4]">
                <button className="hover:text-white p-1 rounded hover:bg-[#383a40]">
                  <Reply size={16} />
                </button>
                <button className="hover:text-white p-1 rounded hover:bg-[#383a40]">
                  <Star size={16} />
                </button>
                <button className="hover:text-white p-1 rounded hover:bg-[#383a40]">
                  <MoveHorizontal size={16} />
                </button>
              </div>
            )}
          </div>
          
          <div className="text-[#dcddde] mt-1 whitespace-pre-wrap break-words">{content}</div>
        </div>
      </div>
    </div>
  );
}
