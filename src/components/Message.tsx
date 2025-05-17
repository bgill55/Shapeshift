import { useState } from 'react';
import React from 'react';
import { Bot, MoveHorizontal, Reply, Star } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import ImageViewer from './ImageViewer';
import MessageActions from './MessageActions';

type MessageProps = {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  isBot?: boolean;
  onDelete: (id: number) => void;
  onRegenerate?: (id: number) => void;
  onEdit?: (id: number, content: string) => void;
  isEditing?: boolean;
};

export default function Message({ 
  id, 
  author, 
  content, 
  timestamp, 
  isBot = false,
  onDelete,
  onRegenerate,
  onEdit,
  isEditing = false 
}: MessageProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [editContent, setEditContent] = useState(content);
  
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
  
  // Function to detect and render shapes audio and image URLs
  const renderMessageContent = (content: string) => {
    // Regex to match shapes.inc audio URLs
    const audioUrlRegex = /https?:\/\/files\.shapes\.inc\/[a-zA-Z0-9_-]+\.mp3/g;
    // Regex to match shapes.inc image URLs (png, jpg, jpeg, gif, webp)
    const imageUrlRegex = /https?:\/\/files\.shapes\.inc\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif|webp)/g;
    
    const audioMatches = content.match(audioUrlRegex);
    const imageMatches = content.match(imageUrlRegex);
    
    // If we have both audio and image URLs
    if ((audioMatches && audioMatches.length > 0) || (imageMatches && imageMatches.length > 0)) {
      // Create a combined regex to split the content
      const combinedRegex = new RegExp(audioUrlRegex.source + '|' + imageUrlRegex.source, 'g');
      const allMatches = content.match(combinedRegex) || [];
      const parts = content.split(combinedRegex);
      
      return (
        <>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < allMatches.length && (
                isAudioUrl(allMatches[index]) 
                  ? <AudioPlayer url={allMatches[index]} />
                  : <ImageViewer url={allMatches[index]} />
              )}
            </React.Fragment>
          ))}
        </>
      );
    }
    
    // No media URLs, just return the content
    return content;
  };
  
  // Helper function to check if a URL is an audio URL
  const isAudioUrl = (url: string) => {
    return url.match(/\.mp3$/i) !== null;
  };
  
  return (
    <div 
      className="py-2 px-1 hover:bg-[#2e3035] rounded group max-w-full"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="flex w-full">
        <div className="mr-4 mt-0.5">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {isBot ? <Bot size={20} /> : initials}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center flex-wrap">
            <div className="font-medium text-white flex items-center overflow-hidden text-ellipsis">
              {author}
              {isBot && (
                <span className="ml-1 text-xs bg-[#5865f2] px-1.5 py-0.5 rounded-sm">BOT</span>
              )}
            </div>
            <div className="text-xs text-[#949ba4] ml-2">{formattedTime}</div>
            
            {showOptions && (
              <div className="ml-4 flex gap-1 text-[#949ba4] flex-shrink-0">
                <button className="hover:text-white p-1 rounded hover:bg-[#383a40]">
                  <Reply size={16} />
                </button>
                <button className="hover:text-white p-1 rounded hover:bg-[#383a40]">
                  <Star size={16} />
                </button>
                <button className="hover:text-white p-1 rounded hover:bg-[#383a40]">
                  <MoveHorizontal size={16} />
                </button>
                <MessageActions 
                  isBot={isBot}
                  onDelete={() => onDelete(id)}
                  onRegenerate={isBot && onRegenerate ? () => onRegenerate(id) : undefined}
                  onEdit={isBot && onEdit ? () => onEdit(id, content) : undefined}
                />
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-[#383a40] border border-[#1f2023] rounded-md text-white p-2 min-h-[100px]"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  className="px-3 py-1 text-sm bg-transparent text-[#b5bac1] hover:text-white rounded transition-colors"
                  onClick={() => setEditContent(content)}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-1 text-sm bg-[#5865f2] text-white rounded hover:bg-[#4752c4] transition-colors"
                  onClick={() => onEdit && onEdit(id, editContent)}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[#dcddde] mt-1 whitespace-pre-wrap break-words max-w-full overflow-hidden">
              {renderMessageContent(content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
