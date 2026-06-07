import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, User } from '../types';
import { getSupportChatResponse } from '../services/geminiService';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  Bot, 
  User as UserIcon, 
  X, 
  PhoneCall, 
  CheckCheck, 
  Bell, 
  Info,
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ConciergeChatProps {
  user: User | null;
  activeContextText: string;
}

const ConciergeChat: React.FC<ConciergeChatProps> = ({ user, activeContextText }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Namaste! I am Rasa, your 24/7 GoRASA Travel Concierge. How can I assist with your flight check-in, premium hotel packages, or loyalty reward conversions today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Voice narration states
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakMessage = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(id);

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US')) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };
  const [whatsAppInbox, setWhatsAppInbox] = useState<{
    id: string;
    title: string;
    text: string;
    pnr: string;
    time: string;
    read: boolean;
  }[]>([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle support message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const responseText = await getSupportChatResponse(
        userMsg.text, 
        `User Name: ${user?.name || 'Anonymous Guest'}. Email: ${user?.email || 'N/A'}. Role: ${user?.role || 'Guest'}. Current screen info: ${activeContextText}`
      );

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Simulates drawing a custom WhatsApp Alert when bookings happen
  useEffect(() => {
    // We listen to changes or custom events or let App component trigger it
    const handleBookingAlert = (e: any) => {
      const { itemName, pnr, price, type } = e.detail;
      const targetBaggage = type === 'flight' ? '20kg Standard Check-in luggage included' : 'Flexible Check-in at 2:00 PM';
      
      const newAlert = {
        id: Math.random().toString(),
        title: `Booking Alert: ${itemName}`,
        text: `✈️ GoRASA Reservation Confirmed! Your booking for ${itemName} (PNR: ${pnr}) is successful. Total Paid: ₹${price.toLocaleString()}. ${targetBaggage}. Access your digital boarding pass under 'My Trips' or reply to this chat to request seat adjustments. Thank you for flying GoRASA!`,
        pnr: pnr,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };

      setWhatsAppInbox(prev => [newAlert, ...prev]);
      // Instantly open overlay or trigger drawer
      setSelectedWhatsApp(newAlert);
      setShowWhatsAppModal(true);
    };

    window.addEventListener('gorasa-booking-confirmed', handleBookingAlert);
    return () => window.removeEventListener('gorasa-booking-confirmed', handleBookingAlert);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Chat Window (2/3 width) */}
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col h-[550px] shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white relative shadow-md">
              <Bot className="w-5 h-5 animate-pulse" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-serif font-bold text-base">Rasa Concierge Chat</h4>
                <span className="text-[9px] bg-orange-500/20 text-orange-400 font-extrabold uppercase px-1.5 py-0.5 rounded">AI Agent</span>
              </div>
              <p className="text-slate-400 text-xs font-mono">Status: Connected • 24/7 Desk Help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Live Desk
            </span>
          </div>
        </div>

        {/* Message Thread body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/55 scrollbar-thin">
          <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar symbol */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm shrink-0 ${
                msg.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'
              }`}>
                {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Text cloud bubble */}
              <motion.div
                layout
                className={`max-w-[75%] p-4 rounded-3xl text-sm leading-relaxed relative group ${
                  msg.sender === 'user' 
                    ? 'bg-orange-500 text-white rounded-tr-none shadow-orange-100 shadow-md' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  {msg.sender === 'ai' ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSpeakMessage(msg.id, msg.text)}
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1 cursor-pointer ${
                        speakingMessageId === msg.id 
                          ? 'bg-red-50 text-red-600 animate-pulse font-extrabold border border-red-200' 
                          : 'text-slate-400 hover:text-orange-500 hover:bg-slate-50'
                      }`}
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>Mute Speech</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Hear Response</span>
                        </>
                      )}
                    </motion.button>
                  ) : <div />}
                  <span className={`block text-[9px] ${msg.sender === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
          </AnimatePresence>

          {isSending && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold pl-12">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
              <span>Rasa concierge is typing guidelines...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form panel inputs */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Ask about Indigo baggage, loyalty points upgrades, wallet top-up, etc..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 rounded-2xl px-5 py-3 text-sm font-medium transition-all"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-100 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>

      {/* Right Notifications Center & WhatsApp stream (1/3 width) */}
      <div className="space-y-6">
        {/* WhatsApp verified stream alert card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-green-600 font-extrabold uppercase bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                WhatsApp Business API
              </span>
              <span className="text-slate-400 text-xs font-bold">Simulated</span>
            </div>
            
            <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Verified Notification Tray</h3>
            <p className="text-slate-500 text-xs mb-4">
              GoRASA sends instant real-time reservation itineraries, flight tracking delays, and boarding ticket vouchers straight to your WhatsApp.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1">
              <Info className="w-4 h-4 text-orange-500" />
              How to view alerts:
            </h4>
            <p className="text-slate-500 leading-relaxed">
              When you book a ticket or reserve a luxury resort package, a real-time GoRASA verified corporate chat notification will slide open here!
            </p>
          </div>
        </div>

        {/* Mock WhatsApp Stream List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm h-72 flex flex-col">
          <h3 className="text-lg font-serif font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Alerts History ({whatsAppInbox.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3">
            {whatsAppInbox.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs space-y-3">
                <p>No recent triggers. Book a flight or click below to simulate an instant live WhatsApp GDS ticket transmission!</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const sampleAlert = {
                      id: 'sample_gds_1',
                      title: 'Live GDS Alert: Indigo 6E-243',
                      text: `✈️ GoRASA Verified Booking! Your reservation for Indigo Flight BOM to DEL (PNR: 6ERASA) is successful. Seat Ref: 12C. Standard luggage clearance OK. Reply with "Upgrades" or converse with Rasa chatbot to configure in-flight meals.`,
                      pnr: '6ERASA',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      read: false
                    };
                    setWhatsAppInbox([sampleAlert]);
                    setSelectedWhatsApp(sampleAlert);
                    setShowWhatsAppModal(true);
                  }}
                  className="px-4 py-2 border border-green-200 bg-green-500/10 text-green-700 hover:bg-green-500/15 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
                >
                  ⚡ Simulate Instant WhatsApp Alert
                </motion.button>
              </div>
            ) : (
              whatsAppInbox.map((alert) => (
                <div 
                  key={alert.id}
                  onClick={() => { setSelectedWhatsApp(alert); setShowWhatsAppModal(true); }}
                  className="p-3 bg-[#e7f7e9]/40 border border-[#c3ebc9] hover:bg-[#e7f7e9] rounded-2xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-green-800 text-[11px] line-clamp-1">{alert.title}</span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{alert.time}</span>
                  </div>
                  <p className="text-slate-600 text-[10px] mt-1 line-clamp-2 leading-relaxed">{alert.text}</p>
                  <div className="text-green-600 text-[9px] font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
                    <CheckCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    Delivered via GoRASA Desk
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Popup Detail Modal */}
      <AnimatePresence>
        {showWhatsAppModal && selectedWhatsApp && (
          <motion.div
            key="whatsapp-modal"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
                exit: { opacity: 0 }
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowWhatsAppModal(false)}
            />
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95, y: 10 }
              }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            {/* WhatsApp Header styled in classic verified business chat colors */}
            <div className="bg-[#075e54] text-white p-5 flex items-center justify-between shadow">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white font-serif font-extrabold text-sm border-2 border-green-400 relative">
                  G
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#075e54] text-white">
                    <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1">
                    GoRASA Desk
                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                  </h4>
                  <p className="text-[10px] text-[#25d366] font-medium font-mono">Official Corporate Notification</p>
                </div>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowWhatsAppModal(false)} className="text-white hover:text-red-200 cursor-pointer">
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Simulated WhatsApp wallpaper background */}
            <div className="p-6 bg-[#efeae2] h-80 overflow-y-auto space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-xs leading-relaxed text-slate-800 space-y-2 relative max-w-[90%]">
                <span className="absolute -left-1.5 top-3 w-3 h-3 bg-white transform rotate-45 border-l border-b border-white"></span>
                <p className="whitespace-pre-line">{selectedWhatsApp.text}</p>
                <div className="flex items-center justify-end text-[9px] text-slate-400 gap-1 mt-1.5">
                  <span>{selectedWhatsApp.time}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Quick response template triggers */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mb-1">Reply to notification</p>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: '#fff7ed' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setMessages(prev => [...prev, {
                      id: Math.random().toString(),
                      sender: 'user',
                      text: `Confirming check-in seat preference for PNR ${selectedWhatsApp.pnr}`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    setShowWhatsAppModal(false);
                  }}
                  className="flex-1 py-2 bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-orange-600 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Configure Seats
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: '#fff7ed' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setMessages(prev => [...prev, {
                      id: Math.random().toString(),
                      sender: 'user',
                      text: `What is the cancellation policy for boarding ticket ${selectedWhatsApp.pnr}?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    setShowWhatsAppModal(false);
                  }}
                  className="flex-1 py-2 bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-orange-600 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Baggage Limits
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default ConciergeChat;
