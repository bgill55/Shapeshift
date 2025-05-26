import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';
import { ShapesProvider } from '../contexts/ShapesContext'; // Import provider

export default function Layout() {
  const [activeMobileView, setActiveMobileView] = useState<'servers' | 'channels' | 'chat'>('chat');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Only display the component that's active on mobile, show all on desktop
  const shouldShowServers = activeMobileView === 'servers' || windowWidth >= 768;
  const shouldShowChannels = activeMobileView === 'channels' || windowWidth >= 768;
  const shouldShowChat = activeMobileView === 'chat' || windowWidth >= 1024;

  return (
    <ShapesProvider> {/* Wrap with provider */}
      <div className="flex h-full overflow-hidden">
        {shouldShowServers && (
          <ServerSidebar 
            onServerSelect={() => setActiveMobileView('channels')}
            // servers and onAddShape props will be removed from ServerSidebar later,
            // as it will get them from context.
          />
        )}
        
        {shouldShowChannels && (
          <ChannelSidebar 
            onChannelSelect={() => setActiveMobileView('chat')}
            onBackClick={() => setActiveMobileView('servers')}
          />
        )}
        
        {shouldShowChat && (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
            <div className="md:hidden absolute top-4 left-4 z-10">
              <button 
                onClick={() => setActiveMobileView('channels')}
                className="p-2 bg-[#2b2d31] rounded-md text-white"
              >
                ← Back
              </button>
            </div>
            <Outlet />
          </div>
        )}
      </div>
    </ShapesProvider>
  );
}
