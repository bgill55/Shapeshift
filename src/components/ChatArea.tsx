import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AtSign, Ban, CircleAlert, CirclePlus, Gift, Image, Send, Smile, Trash2 } from 'lucide-react';
import Message from './Message';
import { ShapesAPI } from '../services/ShapesAPI';

interface MessageType {
  id: number;
  author: string;
  avatar: string | null;
  content: string;
  timestamp: string;
  isBot: boolean;
  isEditing?: boolean;
}

export default function ChatArea() {
  const { serverId, channelId } = useParams();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate some placeholder messages
  useEffect(() => {
    // Reuse getBotName function for consistency
    const getBotName = (id: string) => {
      const nameMap: Record<string, string> = {
        'general': 'Shapes Bot',
        'algebra': 'Algebra Bot',
        'logic': 'Logic Bot',
        'geometry': 'Geometry Bot',
        'bella-donna': 'Bella Donna'
      };

      // Check built-in names first
      if (nameMap[id]) {
        return nameMap[id];
      }

      // Then check for custom shape names
      const customNames = ShapesAPI.getCustomShapeNames();
      if (customNames[id]) {
        return customNames[id];
      }

      // As a fallback, generate a friendly name from ID
      return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const botName = getBotName(serverId || 'general');

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
    const getBotName = (id: string) => {
      const nameMap: Record<string, string> = {
        'general': 'Shapes Bot',
        'algebra': 'Algebra Bot',
        'logic': 'Logic Bot',
        'geometry': 'Geometry Bot',
        'bella-donna': 'Bella Donna'
      };

      // Check built-in names first
      if (nameMap[id]) {
        return nameMap[id];
      }

      // Then check for custom shape names
      const customNames = ShapesAPI.getCustomShapeNames();
      if (customNames[id]) {
        return customNames[id];
      }

      // As a fallback, generate a friendly name from ID
      return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const botName = getBotName(currentServerId);

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
          role: msg.isBot ? ('assistant' as 'assistant') : ('user' as 'user'),
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

  const handleDeleteMessage = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleEditMessage = (id: number, content: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id
          ? { ...msg, content, isEditing: false }
          : msg
      )
    );
  };

  const handleRegenerateResponse = async (id: number) => {
    // Find the message that triggered this response (the user message before this bot message)
    const botMessageIndex = messages.findIndex(msg => msg.id === id);
    if (botMessageIndex <= 0) return; // Can't find the message or it's the first message

    // Assuming the message before the bot is the user message that triggered it
    let userMessageIndex = botMessageIndex - 1;
    // Keep going back until we find a user message
    while (userMessageIndex >= 0 && messages[userMessageIndex].isBot) {
      userMessageIndex--;
    }

    if (userMessageIndex < 0) return; // Couldn't find a user message

    const userMessage = messages[userMessageIndex];

    // Remove the bot message we're regenerating
    setMessages(prev => prev.filter(msg => msg.id !== id));

    // Regenerate using the same approach as handleSendMessage
    setIsLoading(true);
    setError('');

    try {
      const currentServerId = serverId || 'general';

      // Get chat history excluding the message we're regenerating
      const chatHistory = messages
        .filter(msg => msg.id > 2 && msg.id !== id) // Skip welcome messages and the message being regenerated
        .map(msg => ({
          role: msg.isBot ? ('assistant' as 'assistant') : ('user' as 'user'),
          content: msg.content
        }));

      // Send message to Shapes API
      const response = await ShapesAPI.sendMessage(
        currentServerId,
        userMessage.content,
        chatHistory
      );

      // Create bot name based on server
      const getBotName = (id: string) => {
        const nameMap: Record<string, string> = {
          'general': 'Shapes Main',
          'algebra': 'Algebra Shape',
          'logic': 'Logic Shape',
          'geometry': 'Geometry Shape',
          'comedian': 'Stand-Up Shape',
        };

        // Check built-in names first
        if (nameMap[id]) {
          return nameMap[id];
        }

        // Then check for custom shape names
        const customNames = ShapesAPI.getCustomShapeNames();
        if (customNames[id]) {
          return customNames[id];
        }

        // As a fallback, generate a friendly name from ID
        return id
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const botName = getBotName(currentServerId);

      // Add new bot response
      const botResponse = {
        id: Date.now(),
        author: botName,
        avatar: null,
        content: response,
        timestamp: new Date().toISOString(),
        isBot: true,
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error regenerating response:', error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to regenerate response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    const currentServerId = serverId || 'general';
    const getBotName = (id: string) => {
      const nameMap: Record<string, string> = {
        'general': 'Shapes Main',
          'algebra': 'Algebra Shape',
          'logic': 'Logic Shape',
          'geometry': 'Geometry Shape',
          'comedian': 'Stand-Up Shape',
      };

      // Check built-in names first
      if (nameMap[id]) {
        return nameMap[id];
      }

      // Then check for custom shape names
      const customNames = ShapesAPI.getCustomShapeNames();
      if (customNames[id]) {
        return customNames[id];
      }

      // As a fallback, generate a friendly name from ID
      return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const botName = getBotName(currentServerId);

    // Reset to welcome messages
    setMessages([
      {
        id: Date.now(),
        author: botName,
        avatar: null,
        content: `Welcome to #${channelId}! This is the beginning of this channel.`,
        timestamp: new Date().toISOString(),
        isBot: true,
      },
      {
        id: Date.now() + 1,
        author: botName,
        avatar: null,
        content: "I'm your Shape assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
        isBot: true,
      }
    ]);
    setShowClearConfirm(false);
  };

  const toggleEditMode = (id: number) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id
          ? { ...msg, isEditing: !msg.isEditing }
          : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 border-b border-[#1f2023] flex items-center px-4 shadow-sm">
        <div className="text-[#b5bac1] mr-2">#</div>
        <h2 className="font-semibold text-white truncate">{channelId}</h2>

        <div className="ml-auto flex items-center">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center px-3 py-1.5 text-sm text-[#b5bac1] hover:text-white transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={16} className="mr-1" />
            <span className="hidden md:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-0">
        <div className="w-full max-w-[1200px] mx-auto">
          {messages.map((message) => (
            <Message
              key={message.id}
              id={message.id}
              author={message.author}
              content={message.content}
              timestamp={message.timestamp}
              isBot={message.isBot}
              isEditing={message.isEditing}
              onDelete={handleDeleteMessage}
              onRegenerate={message.isBot ? handleRegenerateResponse : undefined}
              onEdit={message.isBot ? (id, content) => {
                if (message.isEditing) {
                  handleEditMessage(id, content);
                } else {
                  toggleEditMode(id);
                }
              } : undefined}
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

      <div className="p-4 pt-0 w-full">
        <div className="w-full max-w-[1200px] mx-auto mt-4">
          <form onSubmit={handleSendMessage} className="relative w-full">
            <div className="flex items-center bg-[#383a40] rounded-lg px-4 py-2 w-full overflow-hidden">
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
                className="bg-transparent flex-1 min-w-0 outline-none text-white placeholder:text-[#6d6f78] w-full"
                disabled={isLoading}
              />

              <div className="flex gap-2 text-[#b5bac1] flex-shrink-0">
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

      {/* Clear Conversation Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg
-[#2b2d31] rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <Ban size={24} className="text-[#ed4245] mr-3 flex-shrink-0" />
              <h2 className="text-xl font-semibold">Clear Conversation</h2>
            </div>
            <p className="text-[#b5bac1] mb-6">
              Are you sure you want to clear this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-[#4f545c] text-white rounded-md hover:bg-[#5d6269] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearConversation}
                className="px-4 py-2 bg-[#ed4245] text-white rounded-md hover:bg-[#c03537] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
