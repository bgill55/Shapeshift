import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, ChevronRight, Hash, Settings, UserPlus, Users, Volume2 } from 'lucide-react';

type ChannelSidebarProps = {
  onChannelSelect: () => void;
  onBackClick: () => void;
};

export default function ChannelSidebar({ onChannelSelect, onBackClick }: ChannelSidebarProps) {
  const { serverId, channelId } = useParams();
  const navigate = useNavigate();
  const [channelCategories] = useState([
    {
      name: 'INFORMATION',
      channels: [
        { id: 'welcome', name: 'welcome', type: 'text' },
        { id: 'announcements', name: 'announcements', type: 'text' },
      ],
    },
    {
      name: 'TEXT CHANNELS',
      channels: [
        { id: 'general', name: 'general', type: 'text' },
        { id: 'help', name: 'help', type: 'text' },
        { id: 'showcase', name: 'showcase', type: 'text' },
      ],
    },
    {
      name: 'VOICE CHANNELS',
      channels: [
        { id: 'voice-lobby', name: 'Voice Lobby', type: 'voice' },
        { id: 'meeting-room', name: 'Meeting Room', type: 'voice' },
      ],
    },
  ]);

  const serverName = {
    'general': 'Shapes Hub',
    'algebra': 'Algebra Bot',
    'logic': 'Logic Bot',
    'geometry': 'Geometry Bot',
  }[serverId || ''] || 'Unknown Server';

  const handleChannelClick = (channelId: string) => {
    navigate(`/server/${serverId}/${channelId}`);
    onChannelSelect();
  };

  return (
    <div className="w-60 flex-shrink-0 bg-[#2b2d31] h-full flex flex-col">
      <div className="h-12 border-b border-[#1f2023] flex items-center px-4 shadow-sm">
        <button 
          className="md:hidden mr-2 text-[#b5bac1]"
          onClick={onBackClick}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold text-white truncate max-w-[180px]">{serverName}</h2>
        <button className="ml-auto text-[#b5bac1]">
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {channelCategories.map((category) => (
          <div key={category.name} className="mb-4">
            <div className="px-2 mb-1 flex items-center">
              <button className="text-xs font-semibold text-[#b5bac1] flex items-center">
                <ChevronRight size={12} className="mr-1" />
                {category.name}
              </button>
            </div>
            
            {category.channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(channel.id)}
                className={`w-full text-[#949ba4] hover:text-[#dcddde] hover:bg-[#35373c] px-2 py-1.5 rounded flex items-center mb-0.5 ${
                  channelId === channel.id ? 'bg-[#35373c] text-white' : ''
                }`}
              >
                {channel.type === 'text' ? (
                  <Hash size={18} className="mr-1.5 flex-shrink-0" />
                ) : (
                  <Volume2 size={18} className="mr-1.5 flex-shrink-0" />
                )}
                <span className="truncate font-medium">{channel.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      
      <div className="h-14 mt-auto bg-[#232428] px-2 py-2 flex items-center">
        <div className="w-8 h-8 rounded-full bg-[#5865f2] mr-2 flex items-center justify-center text-xs text-white font-medium">
          ME
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">User</div>
          <div className="text-xs text-[#b5bac1]">Online</div>
        </div>
        <div className="flex gap-2 text-[#b5bac1]">
          <button aria-label="Mute">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
