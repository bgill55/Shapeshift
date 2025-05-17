import OpenAI from 'openai';

// Load custom shapes from localStorage
const loadCustomShapes = (): Record<string, string> => {
  try {
    const storedShapes = localStorage.getItem('custom_shapes');
    return storedShapes ? JSON.parse(storedShapes) : {};
  } catch (error) {
    console.error('Failed to load custom shapes from localStorage:', error);
    return {};
  }
};

// Load custom shape names from localStorage
const loadCustomShapeNames = (): Record<string, string> => {
  try {
    const storedNames = localStorage.getItem('custom_shape_names');
    return storedNames ? JSON.parse(storedNames) : {};
  } catch (error) {
    console.error('Failed to load custom shape names from localStorage:', error);
    return {};
  }
};

// Store of custom shape names (ID -> display name)
const CUSTOM_SHAPE_NAMES: Record<string, string> = loadCustomShapeNames();

// Default model mapping for different servers
const DEFAULT_MODEL_MAP: Record<string, string> = {
  'general': 'shapesinc/general',
  'algebra': 'shapesinc/algebra',
  'logic': 'shapesinc/logic',
  'geometry': 'shapesinc/geometry',
  'bella-donna': 'shapesinc/bella-donna',
};

// Combined model mapping with custom shapes
const MODEL_MAP: Record<string, string> = {
  ...DEFAULT_MODEL_MAP,
  ...loadCustomShapes(),
};

// Function to add a new shape
export const addCustomShape = (id: string, displayName: string): void => {
  try {
    // Save model mapping
    const customShapes = loadCustomShapes();
    customShapes[id] = `shapesinc/${id}`;
    localStorage.setItem('custom_shapes', JSON.stringify(customShapes));
    
    // Save display name
    CUSTOM_SHAPE_NAMES[id] = displayName;
    localStorage.setItem('custom_shape_names', JSON.stringify(CUSTOM_SHAPE_NAMES));
    
    // Update the MODEL_MAP in memory
    Object.assign(MODEL_MAP, customShapes);
  } catch (error) {
    console.error('Failed to save custom shape to localStorage:', error);
    throw new Error('Failed to save custom shape');
  }
};

// Initialize with empty API key - will be set by user
let apiKey = '';
try {
  apiKey = localStorage.getItem('shapes_api_key') || '';
} catch (error) {
  console.error('Failed to access localStorage. Private browsing mode may be enabled:', error);
}

// Validate API key format
const isValidApiKey = (key: string): boolean => {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    console.log('API key validation failed: key is empty or not a string');
    return false;
  }

  console.log('API key validation: Key is a non-empty string');
  return true;
};

// Create OpenAI client with Shapes API base URL
const createClient = () => {
  if (!apiKey) {
    console.error('Cannot create client: API key is empty');
    return null;
  }
  
  try {
    if (!isValidApiKey(apiKey)) {
      console.error(`Invalid API key format: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
      throw new Error('Invalid API key format');
    }
    
    console.log('Creating OpenAI client with Shapes API base URL');
    return new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.shapes.inc/v1",
      dangerouslyAllowBrowser: true, // Enable browser support
    });
  } catch (error) {
    console.error('Failed to create OpenAI client:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

// Get current client or create new one
let shapesClient = apiKey && isValidApiKey(apiKey) ? createClient() : null;

export const ShapesAPI = {
  // Get all available models (both default and custom)
  getAvailableModels: () => {
    return { ...MODEL_MAP };
  },
  
  // Get custom shape display names
  getCustomShapeNames: () => {
    return { ...CUSTOM_SHAPE_NAMES };
  },
  
  // Add a custom shape
  addCustomShape: (id: string, displayName: string) => {
    addCustomShape(id, displayName);
  },
  // Set API key and create/update client
  setApiKey: (key: string) => {
    try {
      const trimmedKey = key.trim();
      console.log(`Setting API key: ${trimmedKey.substring(0, 4)}...${trimmedKey.substring(trimmedKey.length - 4)}`);
      
      if (!trimmedKey) {
        console.error('API key is empty after trimming');
        throw new Error('API key cannot be empty');
      }

      // Check if the key is valid
      if (!isValidApiKey(trimmedKey)) {
        console.error('API key validation failed');
        throw new Error('Invalid API key. Please provide a non-empty API key.');
      }
      
      console.log('API key validated successfully');
      apiKey = trimmedKey;
      
      // Check if localStorage is available (can fail in private browsing)
      try {
        localStorage.setItem('shapes_api_key', trimmedKey);
        console.log('API key saved to localStorage');
      } catch (storageError) {
        console.warn('Could not save API key to localStorage. Using in-memory storage instead.', storageError);
        // Continue execution - we'll use the in-memory apiKey variable
      }
      
      console.log('Creating API client...');
      shapesClient = createClient();
      
      // Verify client was created successfully
      if (!shapesClient) {
        console.error('Failed to create API client');
        throw new Error('Failed to initialize API client');
      }
      
      console.log('API client created successfully');
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      throw new Error('Failed to save API key: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  // Check if API key is set
  hasApiKey: () => {
    return Boolean(apiKey);
  },

  // Get API key
  getApiKey: () => {
    return apiKey;
  },

  // Send message to Shapes API
  sendMessage: async (serverId: string, message: string, chatHistory: Array<{role: string, content: string}>) => {
    if (!shapesClient) {
      if (!apiKey) {
        throw new Error('API key not set');
      } else {
        console.log('Recreating client for API request...');
        // Try to recreate client if it failed initially
        shapesClient = createClient();
        if (!shapesClient) {
          console.error('Failed to initialize API client for request');
          throw new Error('Unable to initialize API client. Please check your API key.');
        }
        console.log('Successfully recreated client for API request');
      }
    }

    try {
      // Get model for server
      const model = MODEL_MAP[serverId] || MODEL_MAP.general;
      
      // Add user message to history
      const messages = [
        ...chatHistory,
        { role: 'user', content: message }
      ];

      // Send to Shapes API
      const response = await shapesClient.chat.completions.create({
        model,
        messages,
      });

      // Return the assistant's message
      const messageContent = response.choices[0]?.message?.content || 'No response received';
      
      // Process the content to properly present audio links
      const processedContent = messageContent.replace(
        /(https:\/\/files\.shapes\.inc\/[a-zA-Z0-9_-]+\.mp3)/g,
        (match) => match
      );
      
      return processedContent;
    } catch (error) {
      console.error('Error calling Shapes API:', error);
      
      // Provide more user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          throw new Error('Authentication failed. Please check your API key.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }
};
