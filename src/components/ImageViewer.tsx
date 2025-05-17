import { useState } from 'react';
import { Download, X, ZoomIn } from 'lucide-react';

interface ImageViewerProps {
  url: string;
}

export default function ImageViewer({ url }: ImageViewerProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract filename from URL to display
  const filename = url.split('/').pop() || 'Image';
  
  const handleDownload = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const openModal = () => {
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <>
      <div className="bg-[#2b2d31] rounded-md overflow-hidden my-2 max-w-md">
        <div className="p-3">
          <div className="text-sm text-[#dcddde] mb-2 truncate flex justify-between">
            <span>{filename}</span>
            <div className="flex gap-2">
              <button 
                onClick={openModal}
                className="text-[#b5bac1] hover:text-white transition-colors"
                aria-label="View full size"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={handleDownload}
                className="text-[#b5bac1] hover:text-white transition-colors"
                aria-label="Download image"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
          
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#232428]">
                <div className="w-8 h-8 border-4 border-[#5865f2] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              src={url} 
              alt={filename}
              className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
              onClick={openModal}
              onLoad={handleImageLoad}
            />
          </div>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button 
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white p-2 hover:text-[#b5bac1] transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <img 
              src={url} 
              alt={filename}
              className="max-w-full max-h-[90vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                className="bg-[#2b2d31] text-white p-2 rounded-full hover:bg-[#5865f2] transition-colors"
                aria-label="Download image"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
