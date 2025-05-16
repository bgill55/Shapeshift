import OpenAI from 'openai';

// Model mapping for different servers
const MODEL_MAP: Record<string, string> = {
  'general': 'shapesinc/general',
  'algebra': 'shapesinc/algebra',
  'logic': 'shapesinc/logic',
  'geometry': 'shapesinc/geometry',
  'bella-donna': 'shapesinc/bella-donna', // Corrected model name to match API specs
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
  // Check for UUID format (like '19623b2e-9e48-46bf-847c-5cd78cb3eecf')
  // or standard API key format (like 'sk-shapes-xxxxx')
  if (!key || typeof key !== 'string') {
    console.log('API key validation failed: key is empty or not a string');
    return false;
  }
  
  const trimmedKey = key.trim();
  
  // Check if it's a valid UUID format
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedKey);
  
  // Check if it's a valid Shapes API key format
  const isShapesKey = /^sk-shapes-[a-zA-Z0-9]+$/.test(trimmedKey);
  
  console.log(`API key validation: UUID format=${isUuid}, Shapes format=${isShapesKey}`);
  
  // If either format is valid, return true
  return isUuid || isShapesKey;
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
        throw new Error('Invalid API key format. Please check your key and try again. Accepted formats: UUID (8-4-4-4-12) or sk-shapes-xxx');
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
      return response.choices[0]?.message?.content || 'No response received';
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
