import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface AddShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShape: (id: string, name: string, avatarUrl?: string | null) => void;
}

export default function AddShapeModal({ isOpen, onClose, onAddShape }: AddShapeModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetAvatarStates = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  const handleCloseModal = () => {
    resetAvatarStates();
    setUrl('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        setError('File is too large. Max 2MB allowed.');
        resetAvatarStates();
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear previous errors
    } else {
      resetAvatarStates();
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    console.log('Attempting to upload file:', file.name);
    const formData = new FormData();
    formData.append('avatar', file); // 'avatar' is the field name the backend expects
    try {
      const response = await fetch('http://localhost:3001/api/avatar-upload', { // Absolute URL for backend
        method: 'POST',
        body: formData,
        // No Content-Type header needed for FormData with fetch, browser sets it.
      });

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        try {
          // Try to get more specific error from backend response body
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage; 
        } catch (e) {
          // Could not parse error JSON, or no JSON body; stick with HTTP status
          console.warn('Could not parse error JSON from backend response for non-OK status.', e);
        }
        throw new Error(`Failed to upload avatar. ${errorMessage}`);
      }

      const data = await response.json();

      if (data && data.avatarUrl) {
        console.log('Avatar uploaded successfully. URL:', data.avatarUrl);
        return data.avatarUrl;
      } else {
        throw new Error('Avatar URL not found in backend response.');
      }
    } catch (error) {
      console.error('handleAvatarUpload error:', error);
      // Re-throw the error so handleSubmit can catch it and set the UI error state.
      // Ensure the error message is useful.
      throw error instanceof Error ? error : new Error('An unknown error occurred during avatar upload.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear errors from previous attempts

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    console.log('Selected file for avatar:', selectedFile); 

    let uploadedAvatarUrl: string | null = null;
    if (selectedFile) {
      try {
        uploadedAvatarUrl = await handleAvatarUpload(selectedFile); // Call renamed function
        if (!uploadedAvatarUrl) {
          // This case should ideally be covered by errors thrown in handleAvatarUpload
          setError('Avatar upload failed: No URL returned. Please try again.');
          return; 
        }
        console.log('Actual avatar URL from backend:', uploadedAvatarUrl);
      } catch (uploadError) {
        console.error('Avatar upload error in handleSubmit:', uploadError);
        setError(uploadError instanceof Error ? uploadError.message : 'An error occurred during avatar upload.');
        return; 
      }
    }

    try {
      // Try to parse the URL to extract the shape ID
      let urlObj: URL;
      try {
        urlObj = new URL(url);
      } catch (parseError) {
        // If it's not a valid URL, try prepending https://
        try {
          urlObj = new URL(`https://${url}`);
        } catch (innerParseError) {
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

      // The uploadedAvatarUrl (which can be null if no avatar was selected/uploaded)
      // is now passed to onAddShape.
      onAddShape(shapeId, shapeName, uploadedAvatarUrl);
      
      setSuccess(true);
      setUrl('');
      
      // Auto-close after success
      setTimeout(() => {
        handleCloseModal(); // Use the new handler to also reset avatar states
      }, 1500);
    } catch (err) {
      console.error('Error adding shape:', err);
      setError(err instanceof Error ? err.message : 'Failed to add shape');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2b2d31] rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Shape</h2>
          <button 
            onClick={handleCloseModal} // Use the new handler
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
          </div>

          <div className="mb-4">
            <label className="block text-[#b5bac1] text-sm mb-1">
              Shape Avatar (Optional)
            </label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar Preview" className="w-20 h-20 rounded-md object-cover border border-[#383a40]" />
              ) : (
                <div className="w-20 h-20 rounded-md bg-[#383a40] flex items-center justify-center text-[#6d6f78] text-xs border border-[#1f2023]">
                  Preview
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatarUpload"
                  ref={fileInputRef}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 border border-[#383a40] rounded-md text-[#b5bac1] hover:bg-[#383a40] text-sm"
                >
                  Choose Image
                </button>
                <p className="text-[#6d6f78] text-xs mt-1">Max 2MB. JPG, PNG.</p>
              </div>
            </div>
          </div>
          
          {error && (
            <p className="text-[#ed4245] text-sm mt-1 mb-4">{error}</p> 
          )}

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
