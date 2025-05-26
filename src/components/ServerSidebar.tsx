import { useNavigate, useParams } from 'react-router-dom';
import { Bot, House, Key, Plus, Settings } from 'lucide-react';
import { useState } from 'react'; // Removed useEffect
import ApiKeyModal from './ApiKeyModal';
import AddShapeModal from './AddShapeModal';
// ShapesAPI import might still be needed for hasApiKey, or that could be moved to context too.
// For now, assume it's still needed for hasApiKey.
import { ShapesAPI } from '../services/ShapesAPI'; 
import { useShapes } from '../contexts/ShapesContext'; // Import Server type and hook
// Server type from context will be used, local definition removed.

type ServerSidebarProps = {
  onServerSelect: () => void;
};

// Local 'Server' type definition is removed as it's imported/used from ShapesContext.

export default function ServerSidebar({ onServerSelect }: ServerSidebarProps) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const { servers, addShape } = useShapes(); // Use context
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showAddShapeModal, setShowAddShapeModal] = useState(false);
  const hasApiKey = ShapesAPI.hasApiKey(); // Assuming ShapesAPI.hasApiKey() is still valid

  // Helper function to get Lucide icons for shapes
  const getIconForShape = (shapeId: string) => {
    if (shapeId === 'general') return <House size={24} />;
    if (shapeId === 'algebra') return <Bot size={24} />; // Example, customize as needed
    if (shapeId === 'logic') return <Bot size={24} />;
    if (shapeId === 'geometry') return <Bot size={24} />;
    if (shapeId === 'bella-donna') return <Bot size={24} />;
    // Default for other custom shapes or if no specific icon is defined
    return <Bot size={24} />;
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
          {getIconForShape(server.id)} {/* Use helper for icon */}
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
        onAddShape={addShape} // Pass `addShape` from context
      />
    </div>
  );
}
