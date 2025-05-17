import { useNavigate, useParams } from 'react-router-dom';
import { Bot, House, Key, Plus, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import ApiKeyModal from './ApiKeyModal';
import AddShapeModal from './AddShapeModal';
import { ShapesAPI } from '../services/ShapesAPI';

type ServerSidebarProps = {
  onServerSelect: () => void;
};

type Server = {
  id: string;
  name: string;
  icon: JSX.Element;
  isCustom?: boolean;
};

export default function ServerSidebar({ onServerSelect }: ServerSidebarProps) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showAddShapeModal, setShowAddShapeModal] = useState(false);
  const hasApiKey = ShapesAPI.hasApiKey();
  const [servers, setServers] = useState<Server[]>([
    { id: 'general', name: 'General', icon: <House size={24} /> },
    { id: 'algebra', name: 'Algebra Bot', icon: <Bot size={24} /> },
    { id: 'logic', name: 'Logic Bot', icon: <Bot size={24} /> },
    { id: 'geometry', name: 'Geometry Bot', icon: <Bot size={24} /> },
    { id: 'bella-donna', name: 'Bella Donna', icon: <Bot size={24} /> },
  ]);
  
  // Load custom shapes on component mount
  useEffect(() => {
    loadCustomShapes();
  }, []);
  
  // Load custom shapes from localStorage
  const loadCustomShapes = () => {
    try {
      const models = ShapesAPI.getAvailableModels();
      const customNames = ShapesAPI.getCustomShapeNames();
      const defaultIds = ['general', 'algebra', 'logic', 'geometry', 'bella-donna'];
      
      // Find custom models (those not in the default list)
      const customShapes = Object.keys(models)
        .filter(id => !defaultIds.includes(id))
        .map(id => {
          // Use stored custom name if available, otherwise generate from ID
          const name = customNames[id] || id
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return {
            id,
            name,
            icon: <Bot size={24} />,
            isCustom: true
          };
        });
      
      // Add custom shapes to the servers list
      if (customShapes.length > 0) {
        setServers(prev => {
          // Filter out any existing custom shapes to avoid duplicates
          const defaultServers = prev.filter(server => !server.isCustom);
          return [...defaultServers, ...customShapes];
        });
      }
    } catch (error) {
      console.error('Failed to load custom shapes:', error);
    }
  };
  
  // Handle adding a new shape
  const handleAddShape = (id: string, name: string) => {
    try {
      // Add to ShapesAPI
      ShapesAPI.addCustomShape(id, name);
      
      // Add to UI
      setServers(prev => {
        // Check if already exists
        if (prev.some(server => server.id === id)) {
          return prev;
        }
        
        // Add new server
        return [
          ...prev,
          {
            id,
            name,
            icon: <Bot size={24} />,
            isCustom: true
          }
        ];
      });
    } catch (error) {
      console.error('Failed to add shape:', error);
    }
  };

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
        onClick={() => setShowAddShapeModal(true)}
        className="w-12 h-12 rounded-full bg-[#313338] text-[#3ba55d] flex items-center justify-center hover:bg-[#3ba55d] hover:text-white transition-colors"
        aria-label="Add Shape"
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
      
      <AddShapeModal
        isOpen={showAddShapeModal}
        onClose={() => setShowAddShapeModal(false)}
        onAddShape={handleAddShape}
      />
    </div>
  );
}
