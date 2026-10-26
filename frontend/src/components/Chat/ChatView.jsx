import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  Mic, 
  MicOff, 
  MapPin, 
  ArrowRight,
  MessageSquare,
  Compass,
  AlertCircle,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import BusinessCard from '../Business/BusinessCard';

export default function ChatView() {
  const { 
    userLocation, 
    openBusinessDetails, 
    addToCompare, 
    setIsCompareOpen, 
    setActiveTab, 
    addToast 
  } = useApp();

  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: "Hi! 👋 Welcome to **LocalConnect**. I'm your AI-powered local discovery assistant.\n\nI can help you find trusted shops and verified service providers near you with authentic customer reviews and transparent pricing.\n\nWhat are you looking for today?",
      businessCards: [],
      suggestedFollowUps: [
        { label: '⚡ Best Electricians', action: 'query', text: 'Find the best electrician near me' },
        { label: '🍽️ Affordable Food', action: 'query', text: 'Suggest affordable restaurants nearby' },
        { label: '🦷 Dentists Open Today', action: 'query', text: 'Find a dentist who is open today' },
        { label: '💇 Salons under ₹500', action: 'query', text: 'Find a salon offering services under ₹500' },
        { label: '📱 Phone Screen Repair', action: 'query', text: 'Show me mobile repair shops with good reviews' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Quick Action Categories
  const QUICK_CATEGORIES = [
    { label: '🍽️ Restaurants', query: 'Suggest affordable restaurants nearby' },
    { label: '🔧 Home Services', query: 'Find the best electrician near me' },
    { label: '🏥 Healthcare', query: 'Find a dentist who is open today' },
    { label: '💇 Salons & Beauty', query: 'Find a salon offering services under ₹500' },
    { label: '🛒 Grocery Stores', query: 'Which grocery store has the highest rating near me?' },
    { label: '📱 Electronics & Repairs', query: 'Show me mobile repair shops with good reviews' }
  ];

  // Send message handler
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Append user message
    const userMsgId = `usr-${Date.now()}`;
    const newMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(
        query,
        userLocation,
        messages.map(m => ({ role: m.sender, content: m.text }))
      );

      const botMsgId = `bot-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: response.message || "I found these relevant results based on your inquiry:",
          businessCards: response.businessCards || [],
          suggestedFollowUps: response.suggestedFollowUps || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: "I encountered a slight network difficulty accessing the business registry. Please try asking again!",
          businessCards: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Follow-up chip click action
  const handleFollowUpAction = (chip) => {
    if (chip.action === 'compare' && chip.payload?.businessIds) {
      setIsCompareOpen(true);
    } else if (chip.action === 'view_map') {
      setActiveTab('explore');
    } else if (chip.action === 'set_area') {
      handleSendMessage(`Find services in ${chip.area}`);
    } else if (chip.action === 'filter_verified') {
      handleSendMessage('Only show verified businesses');
    } else if (chip.action === 'filter_open_now') {
      handleSendMessage('Only show businesses open right now');
    } else if (chip.text) {
      handleSendMessage(chip.text);
    } else {
      handleSendMessage(chip.label);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'bot',
        text: "Hi! 👋 Welcome back to **LocalConnect**. How can I help you find trusted local services today?",
        businessCards: [],
        suggestedFollowUps: [
          { label: '⚡ Best Electricians', action: 'query', text: 'Find the best electrician near me' },
          { label: '🍽️ Affordable Food', action: 'query', text: 'Suggest affordable restaurants nearby' },
          { label: '🦷 Dentists Open Today', action: 'query', text: 'Find a dentist who is open today' },
          { label: '💇 Salons under ₹500', action: 'query', text: 'Find a salon offering services under ₹500' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    addToast('New conversation started', 'info');
  };

  // Voice Dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Voice recognition is not supported in this browser. Please type your message.', 'warning');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        addToast('Listening... Speak now', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        addToast('Voice recognition canceled or timed out', 'warning');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      addToast('Could not start microphone', 'error');
    }
  };

  // Render markdown text formatting cleanly
  const renderFormattedText = (text) => {
    return text.split('\n\n').map((paragraph, pIdx) => {
      // Bold syntax replacer
      const parts = paragraph.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={pIdx} className="mb-2 last:mb-0 leading-relaxed">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={idx} className="italic text-slate-700 dark:text-slate-300">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4 py-3">
      
      {/* Top Bar with New Chat and Current Location Info */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
            AI
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            LocalConnect Assistant
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            • Searching around {userLocation.area}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="hidden sm:inline">View on Map</span>
          </button>

          <button
            onClick={handleResetChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
            title="Start a new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 space-y-6">
        
        {/* Quick Category Buttons Header (Shown initially) */}
        {messages.length <= 1 && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50/80 via-white to-accent-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/60 border border-brand-100/80 dark:border-slate-700/80 shadow-xs mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Popular Categories Near You
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleSendMessage(cat.query)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-brand-500 hover:shadow-sm text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <span>{cat.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
                  LC
                </div>
              )}

              <div className={`max-w-[92%] sm:max-w-[85%] space-y-3`}>
                {/* Bubble Container */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm shadow-xs ${
                    isBot
                      ? 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80'
                      : 'bg-brand-600 text-white font-medium ml-auto rounded-tr-sm'
                  }`}
                >
                  {isBot ? renderFormattedText(msg.text) : <p>{msg.text}</p>}

                  <div
                    className={`mt-2 text-[10px] text-right ${
                      isBot ? 'text-slate-400' : 'text-brand-100'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Attached Business Recommendation Cards */}
                {isBot && msg.businessCards && msg.businessCards.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        Recommended Options ({msg.businessCards.length})
                      </span>
                      <button
                        onClick={() => setActiveTab('explore')}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        Open Full Map
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {msg.businessCards.map((biz) => (
                        <BusinessCard key={biz.id} business={biz} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Follow-Up Action Chips */}
                {isBot && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFollowUpAction(chip)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:hover:bg-brand-950/40 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all shadow-2xs hover:scale-102"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Animated Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
              LC
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-2">
                Consulting verified database
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-600 typing-dot-1" />
              <span className="w-2 h-2 rounded-full bg-brand-600 typing-dot-2" />
              <span className="w-2 h-2 rounded-full bg-brand-600 typing-dot-3" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Suggestion Triggers */}
      <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
        
        {/* Sample query shortcuts marquee */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-[11px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0 text-[10px]">
            Try:
          </span>
          <button
            onClick={() => handleSendMessage('Find the best electrician near me.')}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            ⚡ Best electrician near me
          </button>
          <button
            onClick={() => handleSendMessage('Find a dentist who is open today.')}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            🦷 Dentist open today
          </button>
          <button
            onClick={() => handleSendMessage('Find a salon offering services under ₹500.')}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            💇 Salon under ₹500
          </button>
          <button
            onClick={() => handleSendMessage('Show me mobile repair shops with good reviews.')}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            📱 Mobile repair with good reviews
          </button>
        </div>

        {/* Text Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g., 'Find plumber for pipe leak', 'Suggest dinner under ₹600')..."
              className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 shadow-sm transition-all"
            />
            {/* Speech to text mic button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
              title={isListening ? 'Stop listening' : 'Dictate with microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-md shadow-brand-500/20 transition-all shrink-0 hover:scale-102 focus:outline-none"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Verified Local Database • Powered by LocalConnect AI</span>
          <span>Press Enter to send</span>
        </div>
      </div>

    </div>
  );
}
