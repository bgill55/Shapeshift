import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ShapesAPI } from '../services/ShapesAPI';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  
  // Load API key when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const savedKey = ShapesAPI.getApiKey();
        console.log('Loading saved API key: ', savedKey ? `${savedKey.substring(0, 4)}...${savedKey.substring(savedKey.length - 4)}` : 'No key found');
        setApiKey(savedKey);
        setError('');
      } catch (error) {
        console.error('Error loading API key:', error);
        setError('Could not load saved API key');
      }
    }
  }, [isOpen]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    console.log(`Submitting API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    
    try {
      ShapesAPI.setApiKey(apiKey.trim());
      console.log('API key saved successfully');
      setSuccess(true);
      setError('');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error in API key modal:', error);
      
      // Handle specific known errors
      if (error instanceof Error) {
        if (error.message.includes('localStorage')) {
          setError('API key saved in memory only. Private browsing detected.');
        } else if (error.message.includes('Invalid API key format')) {
          setError('Invalid API key format. Please check your key and try again.');
        } else if (error.message.includes('initialize API client')) {
          setError('Failed to initialize API client. This is likely due to browser restrictions. Your key format is valid but we encountered a technical issue.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to set API key. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2b2d31] rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Shapes API Configuration</h2>
          <button 
            onClick={onClose}
            className="text-[#b5bac1] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[#b5bac1] text-sm mb-2">
            Enter your Shapes API key to connect with AI bots. You can find your API key in 
            your Shapes account dashboard. We support both UUID format keys and standard API keys.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-[#b5bac1] text-sm mb-1">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-shapes-xxxxx"
              className="w-full px-3 py-2 bg-[#383a40] border border-[#1f2023] rounded-md text-white placeholder:text-[#6d6f78] focus:outline-none focus:ring-1 focus:ring-[#5865f2]"
            />
            {error && (
              <p className="text-[#ed4245] text-sm mt-1">{error}</p>
            )}
            <p className="text-[#b5bac1] text-xs mt-1">
              Accepted formats: UUID (e.g., 19623b2e-9e48-46bf-847c-5cd78cb3eecf) or API key (e.g., sk-shapes-xxxxx). This app runs in the browser, so your key is saved locally.
            </p>
          </div>

          <div className="flex justify-end">
            {success ? (
              <div className="text-[#3ba55c] px-4 py-2 rounded-md bg-[#3ba55c]/10">
                API key saved successfully!
              </div>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4] transition-colors"
              >
                Save API Key
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
