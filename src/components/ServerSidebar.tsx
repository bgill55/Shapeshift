import { useNavigate, useParams } from 'react-router-dom';
import { Bot, House, Key, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import ApiKeyModal from './ApiKeyModal';
import { ShapesAPI } from '../services/ShapesAPI';

type ServerSidebarProps = {
  onServerSelect: () => void;
};

export default function ServerSidebar({ onServerSelect }: ServerSidebarProps) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const hasApiKey = ShapesAPI.hasApiKey();
  
  const servers = [
    { id: 'general', name: 'General', icon: <House size={24} /> },
    { id: 'algebra', name: 'Algebra Bot', icon: <Bot size={24} /> },
    { id: 'logic', name: 'Logic Bot', icon: <Bot size={24} /> },
    { id: 'geometry', name: 'Geometry Bot', icon: <Bot size={24} /> },
    { id: 'bella-donna', name: 'Bella Donna', icon: <Bot size={24} /> },
  ];

  const handleServerClick = (id: string) => {
    navigate(`/server/${id}/welcome`);
    onServerSelect();
  };

  return (
    <div className="w-[72px] flex-shrink-0 bg-[#1e1f22] h-full flex flex-col items-center py-3 gap-2 overflow-y-auto">
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => handleServerClick(server.id)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:rounded-2xl ${
            serverId === server.id
              ? 'bg-[#5865f2] text-white'
              : 'bg-[#313338] text-[#dcddde] hover:bg-[#5865f2]'
          }`}
          aria-label={server.name}
        >
          {server.icon}
        </button>
      ))}
      
      <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1"></div>
      
      <button
        className="w-12 h-12 rounded-full bg-[#313338] text-[#3ba55d] flex items-center justify-center hover:bg-[#3ba55d] hover:text-white transition-colors"
        aria-label="Add Server"
      >
        <Plus size={24} />
      </button>
      
      <button
        onClick={() => setShowApiKeyModal(true)}
        className={`w-12 h-12 rounded-full ${
          hasApiKey 
            ? "bg-[#3ba55d] text-white" 
            : "bg-[#ed4245] text-white"
        } flex items-center justify-center hover:opacity-90 transition-colors mt-2`}
        aria-label="API Key"
      >
        <Key size={20} />
      </button>

      <button
        className="mt-auto w-12 h-12 rounded-full bg-[#313338] text-[#dcddde] flex items-center justify-center hover:bg-[#5865f2] hover:text-white transition-colors"
        aria-label="Settings"
      >
        <Settings size={24} />
      </button>
      
      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
}
