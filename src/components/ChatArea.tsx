import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AtSign, CircleAlert, CirclePlus, Gift, Image, Send, Smile } from 'lucide-react';
import Message from './Message';
import { ShapesAPI } from '../services/ShapesAPI';

export default function ChatArea() {
  const { serverId, channelId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate some placeholder messages
  useEffect(() => {
    const botName = serverId === 'general' ? 'Shapes Bot' : 
                   serverId === 'algebra' ? 'Algebra Bot' : 
                   serverId === 'logic' ? 'Logic Bot' : 
                   serverId === 'bella-donna' ? 'Bella Donna' : 'Geometry Bot';
    
    const newMessages = [
      {
        id: 1,
        author: botName,
        avatar: null,
        content: `Welcome to #${channelId}! This is the beginning of this channel.`,
        timestamp: new Date().toISOString(),
        isBot: true,
      },
      {
        id: 2,
        author: botName,
        avatar: null,
        content: "I'm your AI assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
        isBot: true,
      }
    ];
    
    setMessages(newMessages);
  }, [serverId, channelId]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    // Check if API key is set
    if (!ShapesAPI.hasApiKey()) {
      setError('Please set your Shapes API key to chat with the bots');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Get current server ID (fallback to 'general')
    const currentServerId = serverId || 'general';
    
    // Create bot name based on server
    const botName = currentServerId === 'general' ? 'Shapes Bot' : 
                   currentServerId === 'algebra' ? 'Algebra Bot' : 
                   currentServerId === 'logic' ? 'Logic Bot' : 
                   currentServerId === 'bella-donna' ? 'Bella Donna' : 'Geometry Bot';
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      author: 'You',
      avatar: null,
      content: inputValue,
      timestamp: new Date().toISOString(),
      isBot: false,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      // Convert previous messages to the format expected by the API
      const chatHistory = messages
        .filter(msg => msg.id > 2) // Skip the welcome messages
        .map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.content
        }));
      
      // Send message to Shapes API
      const response = await ShapesAPI.sendMessage(
        currentServerId,
        inputValue,
        chatHistory
      );
      
      // Add bot response
      const botResponse = {
        id: Date.now() + 1,
        author: botName,
        avatar: null,
        content: response,
        timestamp: new Date().toISOString(),
        isBot: true,
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to get a response from the AI. Please check your API key and try again.');
      }
      
      // Add a system message about the error
      const errorMessage = {
        id: Date.now() + 1,
        author: 'System',
        avatar: null,
        content: error instanceof Error ? `Error: ${error.message}` : 'An unknown error occurred. Please try again.',
        timestamp: new Date().toISOString(),
        isBot: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 border-b border-[#1f2023] flex items-center px-4 shadow-sm">
        <div className="text-[#b5bac1] mr-2">#</div>
        <h2 className="font-semibold text-white">{channelId}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pb-0">
        <div className="max-w-[1200px] mx-auto">
          {messages.map((message) => (
            <Message
              key={message.id}
              author={message.author}
              content={message.content}
              timestamp={message.timestamp}
              isBot={message.isBot}
            />
          ))}
          
          {isLoading && (
            <div className="py-4 px-4 text-[#b5bac1] italic">
              Bot is typing...
            </div>
          )}
          
          {error && (
            <div className="py-3 px-4 bg-[#ed4245]/10 text-[#ed4245] rounded-md mb-4 flex items-center">
              <CircleAlert size={16} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {!ShapesAPI.hasApiKey() && (
            <div className="py-3 px-4 bg-[#5865f2]/10 text-[#b5bac1] rounded-md mb-4">
              <p className="font-medium text-white mb-1">Set up your Shapes API Key</p>
              <p className="text-sm">Click the key icon in the server sidebar to set your API key and start chatting with the bots.</p>
            </div>
          )}
          
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      
      <div className="p-4 pt-0">
        <div className="max-w-[1200px] mx-auto mt-4">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-center bg-[#383a40] rounded-lg px-4 py-2">
              <button 
                type="button"
                className="text-[#b5bac1] hover:text-white mr-2"
                aria-label="Add file"
              >
                <CirclePlus size={20} />
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message #${channelId}`}
                className="bg-transparent flex-1 outline-none text-white placeholder:text-[#6d6f78]"
                disabled={isLoading}
              />
              
              <div className="flex gap-2 text-[#b5bac1]">
                <button type="button" aria-label="Mention" className="hover:text-white">
                  <AtSign size={20} />
                </button>
                <button type="button" aria-label="Emoji" className="hover:text-white">
                  <Smile size={20} />
                </button>
                <button type="button" aria-label="Gift" className="hover:text-white">
                  <Gift size={20} />
                </button>
                <button type="button" aria-label="Image" className="hover:text-white">
                  <Image size={20} />
                </button>
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`hover:text-white ${(!inputValue.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
