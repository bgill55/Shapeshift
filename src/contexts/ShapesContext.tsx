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

// Helper to generate placeholder icons for context, actual icons will be in ServerSidebar
const getDefaultIcon = (id: string, name: string): JSX.Element => {
  if (id === 'general') return <House size={24} />;
  // For other specific default shapes, you can add more cases here if needed
  // e.g. if (id === 'algebra') return <SpecificAlgebraIcon />;
  // Default placeholder for custom or other bots
  return <Bot size={24} />; // Fallback to Bot icon
};


export const ShapesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [servers, setServers] = useState<Server[]>([
    { id: 'general', name: 'General', icon: getDefaultIcon('general', 'General'), customAvatarUrl: null, isCustom: false },
    { id: 'algebra', name: 'Algebra Bot', icon: getDefaultIcon('algebra', 'Algebra Bot'), customAvatarUrl: null, isCustom: false },
    { id: 'logic', name: 'Logic Bot', icon: getDefaultIcon('logic', 'Logic Bot'), customAvatarUrl: null, isCustom: false },
    { id: 'geometry', name: 'Geometry Bot', icon: getDefaultIcon('geometry', 'Geometry Bot'), customAvatarUrl: null, isCustom: false },
    { id: 'bella-donna', name: 'Bella Donna', icon: getDefaultIcon('bella-donna', 'Bella Donna'), customAvatarUrl: null, isCustom: false },
  ]);

  useEffect(() => {
    const loadCustomShapes = () => {
      try {
        const customShapeDetails = ShapesAPI.getCustomShapeDetails();
        const initialDefaultServers = [ // Define default servers explicitly for comparison
            { id: 'general', name: 'General', icon: getDefaultIcon('general', 'General'), customAvatarUrl: null, isCustom: false },
            { id: 'algebra', name: 'Algebra Bot', icon: getDefaultIcon('algebra', 'Algebra Bot'), customAvatarUrl: null, isCustom: false },
            { id: 'logic', name: 'Logic Bot', icon: getDefaultIcon('logic', 'Logic Bot'), customAvatarUrl: null, isCustom: false },
            { id: 'geometry', name: 'Geometry Bot', icon: getDefaultIcon('geometry', 'Geometry Bot'), customAvatarUrl: null, isCustom: false },
            { id: 'bella-donna', name: 'Bella Donna', icon: getDefaultIcon('bella-donna', 'Bella Donna'), customAvatarUrl: null, isCustom: false },
        ];
        const defaultIds = initialDefaultServers.map(s => s.id);

        const loadedCustomShapes = Object.keys(customShapeDetails)
          .map(id => {
            const details = customShapeDetails[id];
            return {
              id,
              name: details.name,
              icon: getDefaultIcon(id, details.name), // Use helper for icon
              isCustom: true, // Mark as custom
              customAvatarUrl: details.customAvatarUrl,
            };
          });
        
        // Combine default and custom shapes, ensuring no duplicates for default shapes
        // Custom shapes from storage will override defaults if IDs match
        const uniqueServers = [...initialDefaultServers];
        loadedCustomShapes.forEach(customShape => {
            const existingIndex = uniqueServers.findIndex(s => s.id === customShape.id);
            if (existingIndex !== -1) {
                // If a shape with the same ID exists (e.g. a default shape now customized)
                // update it. Make sure isCustom is true.
                uniqueServers[existingIndex] = { ...customShape, isCustom: true }; 
            } else {
                uniqueServers.push(customShape);
            }
        });
        setServers(uniqueServers);

      } catch (error) {
        console.error('Failed to load custom shapes:', error);
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
