import React, { createContext, useState, useEffect, useContext } from 'react';
import { ShapesAPI } from '../services/ShapesAPI'; // Assuming ShapesAPI is correctly pathed
import { Bot, House } from 'lucide-react'; // Import Lucide icons for default shapes

export interface Server {
  id: string;
  name: string;
  icon: JSX.Element; // For sidebar display
  isCustom?: boolean;
  customAvatarUrl?: string | null; // For chat display
}

interface ShapesContextType {
  servers: Server[];
  addShape: (id: string, name: string, avatarUrl?: string | null) => void;
}

const ShapesContext = createContext<ShapesContextType | undefined>(undefined);

// Helper to generate placeholder icons - Defined at the top level
const getDefaultIcon = (id: string, _name?: string): JSX.Element => { // name param often unused here if id dictates icon
  if (id === 'general') return <House size={24} />;
  // For specific default shapes, ensure their IDs are checked here.
  // e.g., if (id === 'algebra') return <SomeSpecificIconForAlgebra />;
  return <Bot size={24} />; // Fallback for other defaults and custom shapes
};

// Define DEFAULT_SERVERS_CONFIG at the top level
const DEFAULT_SERVERS_CONFIG: Server[] = [
  { id: 'general', name: 'General', icon: getDefaultIcon('general', 'General'), customAvatarUrl: null, isCustom: false },
  { id: 'algebra', name: 'Algebra Bot', icon: getDefaultIcon('algebra', 'Algebra Bot'), customAvatarUrl: null, isCustom: false },
  { id: 'logic', name: 'Logic Bot', icon: getDefaultIcon('logic', 'Logic Bot'), customAvatarUrl: null, isCustom: false },
  { id: 'geometry', name: 'Geometry Bot', icon: getDefaultIcon('geometry', 'Geometry Bot'), customAvatarUrl: null, isCustom: false },
  { id: 'bella-donna', name: 'Bella Donna', icon: getDefaultIcon('bella-donna', 'Bella Donna'), customAvatarUrl: null, isCustom: false },
];

export const ShapesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [servers, setServers] = useState<Server[]>(DEFAULT_SERVERS_CONFIG.map(s => ({ ...s }))); // Initialize with a copy

  useEffect(() => {
    const loadCustomShapes = () => {
      try {
        const customShapeDetails = ShapesAPI.getCustomShapeDetails();
        // Start with a deep copy of DEFAULT_SERVERS_CONFIG
        let newServersList = DEFAULT_SERVERS_CONFIG.map(s => ({ ...s }));

        for (const id in customShapeDetails) {
          const details = customShapeDetails[id];
          const existingServerIndex = newServersList.findIndex(s => s.id === id);

          if (existingServerIndex !== -1) {
            // Update existing default server with custom details
            newServersList[existingServerIndex].name = details.name;
            newServersList[existingServerIndex].customAvatarUrl = details.customAvatarUrl;
            newServersList[existingServerIndex].isCustom = true; // Mark as customized
            // Icon can remain the default, or be updated if needed:
            // newServersList[existingServerIndex].icon = getDefaultIcon(id, details.name); 
          } else {
            // Add new custom shape not in defaults
            newServersList.push({
              id,
              name: details.name,
              icon: getDefaultIcon(id, details.name), // Use helper for icon
              isCustom: true,
              customAvatarUrl: details.customAvatarUrl,
            });
          }
        }
        setServers(newServersList);

      } catch (error) {
        console.error('Failed to load custom shapes:', error);
        // Optionally, set servers to a copy of defaults if loading fails:
        // setServers(DEFAULT_SERVERS_CONFIG.map(s => ({ ...s })));
      }
    };
    loadCustomShapes();
  }, []); // Empty dependency array to run once on mount

  const addShape = (id: string, name: string, avatarUrl?: string | null) => {
    try {
      ShapesAPI.addCustomShape(id, name, avatarUrl); // Persist with ShapesAPI
      
      setServers(prev => {
        // Check if shape already exists (by ID)
        const existingShapeIndex = prev.findIndex(server => server.id === id);
        if (existingShapeIndex !== -1) {
          // Update existing shape
          const updatedServers = [...prev];
          updatedServers[existingShapeIndex] = {
            ...prev[existingShapeIndex], // Keep existing icon if not overriding
            name,
            customAvatarUrl: avatarUrl,
            isCustom: true, // Mark as custom even if it was a default one
          };
          return updatedServers;
        } else {
          // Add new shape
          return [
            ...prev,
            {
              id,
              name,
              icon: getDefaultIcon(id, name), // Use helper for icon
              isCustom: true,
              customAvatarUrl: avatarUrl,
            },
          ];
        }
      });
    } catch (error) {
      console.error('Failed to add shape:', error);
      // Potentially re-throw or set an error state for the UI
    }
  };

  return (
    <ShapesContext.Provider value={{ servers, addShape }}>
      {children}
    </ShapesContext.Provider>
  );
};

export const useShapes = () => {
  const context = useContext(ShapesContext);
  if (context === undefined) {
    throw new Error('useShapes must be used within a ShapesProvider');
  }
  return context;
};
