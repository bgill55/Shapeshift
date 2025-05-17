import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ChatArea from './components/ChatArea';
import './index.css';

export function App() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Set page title
    document.title = "Shapes - AI Chat Hub";
  }, []);

  return (
    <BrowserRouter>
      <div className="fixed inset-0 bg-[#1a1b1e] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/server/general/welcome" replace />} />
            <Route path="/server/:serverId/:channelId" element={<ChatArea />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
