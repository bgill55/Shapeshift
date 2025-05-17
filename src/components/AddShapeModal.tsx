import { useState } from 'react';
import { X } from 'lucide-react';

interface AddShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShape: (id: string, name: string) => void;
}

export default function AddShapeModal({ isOpen, onClose, onAddShape }: AddShapeModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      // Try to parse the URL to extract the shape ID
      let urlObj: URL;
      try {
        urlObj = new URL(url);
      } catch (error) {
        // If it's not a valid URL, try prepending https://
        try {
          urlObj = new URL(`https://${url}`);
        } catch (error) {
          throw new Error('Invalid URL format. Please enter a valid URL.');
        }
      }

      // Check if it's a shapes.inc URL
      if (!urlObj.hostname.includes('shapes.inc')) {
        throw new Error('URL must be from shapes.inc domain');
      }

      // Extract the shape ID from the path
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length === 0) {
        throw new Error('No shape ID found in URL. Format should be: https://shapes.inc/shape-id');
      }

      const shapeId = pathParts[0].toLowerCase();
      // Convert the shape ID to a friendly name (capitalize first letter of each word)
      const shapeName = shapeId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Add the shape
      onAddShape(shapeId, `${shapeName}`);
      
      setSuccess(true);
      setError('');
      setUrl('');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding shape:', error);
      setError(error instanceof Error ? error.message : 'Failed to add shape');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2b2d31] rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Shape</h2>
          <button 
            onClick={onClose}
            className="text-[#b5bac1] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[#b5bac1] text-sm mb-2">
            Enter a Shape's vanity URL to add it to your collection. 
            Example: https://shapes.inc/bella-donna
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="shapeUrl" className="block text-[#b5bac1] text-sm mb-1">
              Shape URL
            </label>
            <input
              id="shapeUrl"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://shapes.inc/shape-name"
              className="w-full px-3 py-2 bg-[#383a40] border border-[#1f2023] rounded-md text-white placeholder:text-[#6d6f78] focus:outline-none focus:ring-1 focus:ring-[#5865f2]"
            />
            {error && (
              <p className="text-[#ed4245] text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex justify-end">
            {success ? (
              <div className="text-[#3ba55c] px-4 py-2 rounded-md bg-[#3ba55c]/10">
                Shape added successfully!
              </div>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4] transition-colors"
              >
                Add Shape
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
