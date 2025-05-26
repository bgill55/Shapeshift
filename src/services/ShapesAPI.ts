import OpenAI from 'openai';
// Import the specific message parameter types from the OpenAI SDK
import {
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam
  // If your "shapes" use tool/function calling extensively and 'tool' role messages
  // (or assistant messages with 'tool_calls') appear in chatHistory, you might also need:
  // import { ChatCompletionToolMessageParam } from 'openai/resources/chat/completions';
} from 'openai/resources/chat/completions';

// Define the new CustomShapeDetails interface
interface CustomShapeDetails {
  name: string;
  customAvatarUrl?: string | null;
}

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

// Load custom shape details from localStorage (renamed and modified)
const loadCustomShapeDetails = (): Record<string, CustomShapeDetails> => {
  try {
    const storedDetails = localStorage.getItem('custom_shape_details');
    const parsedDetails = storedDetails ? JSON.parse(storedDetails) : {};
    
    // Migration logic
    const migratedDetails: Record<string, CustomShapeDetails> = {};
    for (const id in parsedDetails) {
      const item = parsedDetails[id];
      if (typeof item === 'string') {
        // Old format: value is just the name string
        migratedDetails[id] = { name: item, customAvatarUrl: null };
      } else if (item && typeof item.name === 'string') {
        // New format or already migrated: value is an object
        migratedDetails[id] = {
          name: item.name,
          customAvatarUrl: item.customAvatarUrl !== undefined ? item.customAvatarUrl : null,
        };
      } else {
        // Handle unexpected structure if necessary, or skip
        console.warn(`Skipping invalid custom shape detail for id: ${id}`, item);
      }
    }
    return migratedDetails;
  } catch (error) {
    console.error('Failed to load custom shape details from localStorage:', error);
    return {};
  }
};

// Store of custom shape details (ID -> { name, customAvatarUrl })
const CUSTOM_SHAPE_DETAILS: Record<string, CustomShapeDetails> = loadCustomShapeDetails();

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
  ...loadCustomShapes(), // This still loads the model mapping, which is separate from display details
};

// Function to add a new shape (modified signature and logic)
export const addCustomShape = (id: string, displayName: string, avatarUrl?: string | null): void => {
  try {
    // Save model mapping (if this part is still needed, otherwise remove)
    // For now, assuming model mapping is still relevant via loadCustomShapes()
    const customShapes = loadCustomShapes(); 
    customShapes[id] = `shapesinc/${id}`; // This seems to map ID to a model identifier
    localStorage.setItem('custom_shapes', JSON.stringify(customShapes));
    Object.assign(MODEL_MAP, customShapes); // Update in-memory MODEL_MAP

    // Save shape details (name and avatar)
    CUSTOM_SHAPE_DETAILS[id] = { name: displayName, customAvatarUrl: avatarUrl };
    localStorage.setItem('custom_shape_details', JSON.stringify(CUSTOM_SHAPE_DETAILS));

  } catch (error) {
    console.error('Failed to save custom shape to localStorage:', error);
    throw new Error('Failed to save custom shape');
  }
};

// Initialize with empty API key - will be set by user
let apiKey = '';
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
  console.error('Failed to access localStorage. Private Browse mode may be enabled:', error);
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

// Define the ShapeProfile interface
interface ShapeProfile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  avatar?: string;
  custom_html?: string;
  // Add other properties from the profile JSON if you need them
}

export const ShapesAPI = {
  // Get all available models (both default and custom)
  getAvailableModels: () => {
    return { ...MODEL_MAP };
  },

  // Get custom shape details (renamed)
  getCustomShapeDetails: () => {
    return { ...CUSTOM_SHAPE_DETAILS };
  },

  // Add a custom shape (modified signature)
  addCustomShape: (id: string, displayName: string, avatarUrl?: string | null) => {
    // The top-level addCustomShape is already modified, so this just calls it.
    // Ensure the one being called is the exported one if there's any ambiguity,
    // but in this structure, it should directly call the modified top-level function.
    addCustomShape(id, displayName, avatarUrl); 
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

      if (!isValidApiKey(trimmedKey)) {
        console.error('API key validation failed');
        throw new Error('Invalid API key. Please provide a non-empty API key.');
      }

      console.log('API key validated successfully');
      apiKey = trimmedKey;

      try {
        localStorage.setItem('shapes_api_key', trimmedKey);
        console.log('API key saved to localStorage');
      } catch (storageError) {
        console.warn('Could not save API key to localStorage. Using in-memory storage instead.', storageError);
      }

      console.log('Creating API client...');
      shapesClient = createClient();

      if (!shapesClient) {
        console.error('Failed to create API client');
        throw new Error('Unable to initialize API client. Please check your API key.');
      }

      console.log('API client created successfully');
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      throw new Error('Failed to save API key: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  hasApiKey: () => {
    return Boolean(apiKey);
  },

  getApiKey: () => {
    return apiKey;
  },

  // Send message to Shapes API
  sendMessage: async (
    serverId: string,
    message: string,
    // MODIFIED: Use specific types for chatHistory items
    chatHistory: Array<
      | ChatCompletionSystemMessageParam
      | ChatCompletionUserMessageParam
      | ChatCompletionAssistantMessageParam
      // If your "shapes" use tool/function calling that might appear in history,
      // you would add ChatCompletionToolMessageParam here. For example:
      // | ChatCompletionToolMessageParam
    >
  ) => {
    if (!shapesClient) {
      if (!apiKey) {
        throw new Error('API key not set');
      } else {
        console.log('Recreating client for API request...');
        shapesClient = createClient();
        if (!shapesClient) {
          console.error('Failed to initialize API client for request');
          throw new Error('Unable to initialize API client. Please check your API key.');
        }
        console.log('Successfully recreated client for API request');
      }
    }

    try {
      const model = MODEL_MAP[serverId] || MODEL_MAP.general;

      // MODIFIED: Explicitly type the 'messages' array
      const messages: ChatCompletionMessageParam[] = [
        ...chatHistory,
        { role: 'user', content: message } // This conforms to ChatCompletionUserMessageParam
      ];

      const response = await shapesClient.chat.completions.create({
        model,
        messages, // This array is now correctly typed
      });

      const messageContent = response.choices[0]?.message?.content || 'No response received';
      const processedContent = messageContent.replace(
        /(https:\/\/files\.shapes\.inc\/[a-zA-Z0-9_-]+\.mp3)/g,
        (match) => match
      );

      return processedContent;
    } catch (error) {
      console.error('Error calling Shapes API:', error);
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
  },

  // Function to fetch Shape profile information
  fetchShapeProfileInfo: async (vanityUrl: string): Promise<ShapeProfile | null> => {
    console.log('ShapesAPI - fetchShapeProfileInfo - Attempting to fetch profile for vanityUrl:', vanityUrl);
    try {
      const response = await fetch(`https://shapes.inc/api/public/shapes/${vanityUrl}`);
      if (!response.ok) {
        console.error(`Failed to fetch profile for ${vanityUrl}: ${response.status}`);
        return null;
      }
      const data = await response.json() as ShapeProfile;
      return data;
    } catch (error) {
      console.error(`Error fetching profile for ${vanityUrl}:`, error);
      return null;
    }
  },

  // Function to extract the avatar URL from the Shape profile data
  getShapeAvatarUrlFromProfile: (profileData: ShapeProfile): string | null => {
    if (profileData?.avatar_url) {
      return profileData.avatar_url;
    } else if (profileData?.avatar) {
      return profileData.avatar;
    } else if (profileData?.custom_html) {
      const match = profileData.custom_html.match(/<img.*?class="profile-picture".*?src="(.*?)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  },
};
