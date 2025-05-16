import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';

export default function Layout() {
  const [activeMobileView, setActiveMobileView] = useState<'servers' | 'channels' | 'chat'>('chat');
  
  // Only display the component that's active on mobile, show all on desktop
  const shouldShowServers = activeMobileView === 'servers' || window.innerWidth >= 768;
  const shouldShowChannels = activeMobileView === 'channels' || window.innerWidth >= 768;
  const shouldShowChat = activeMobileView === 'chat' || window.innerWidth >= 1024;

  return (
    <div className="flex h-full overflow-hidden">
      {shouldShowServers && (
        <ServerSidebar 
          onServerSelect={() => setActiveMobileView('channels')}
        />
      )}
      
      {shouldShowChannels && (
        <ChannelSidebar 
          onChannelSelect={() => setActiveMobileView('chat')}
          onBackClick={() => setActiveMobileView('servers')}
        />
      )}
      
      {shouldShowChat && (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="md:hidden absolute top-4 left-4 z-10">
            <button 
              onClick={() => setActiveMobileView('channels')}
              className="p-2 bg-[#2b2d31] rounded-md"
            >
              ← Back
            </button>
          </div>
          <Outlet />
        </div>
      )}
    </div>
  );
}
