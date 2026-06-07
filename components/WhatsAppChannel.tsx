import React, { useState } from 'react';
import { User } from '../types';
import { 
  MessageCircle, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  ExternalLink,
  Smartphone,
  Check,
  MessageSquare,
  Users
} from 'lucide-react';

interface WhatsAppChannelProps {
  user: User | null;
}

const WhatsAppChannel: React.FC<WhatsAppChannelProps> = ({ user }) => {
  const WHATSAPP_NUMBER = '919810012345';
  const WHATSAPP_DISPLAY = '+91 98100 12345';

  const [activeTemplate, setActiveTemplate] = useState<string>('custom');
  const [customMsg, setCustomMsg] = useState('');
  const [notificationMock, setNotificationMock] = useState<{
    phone: string;
    msg: string;
    status: 'idle' | 'sending' | 'sent';
  }>({
    phone: user ? '9199999999' : '9198100000',
    msg: 'Namaste! Your GoRASA VIP flight boarding pass PNR GR87XJ is successfully issued. Check-in counters open 3h prior.',
    status: 'idle'
  });

  const templates = [
    {
      id: 'flights',
      title: '✈️ Flight Queries',
      text: 'Namaste GoRASA! I have a query regarding wholesale flight check-in and domestic carrier baggage policies. Please assist.',
      icon: '✈️'
    },
    {
      id: 'hotels',
      title: '🏨 Stay Reservation',
      text: 'Namaste GoRASA! I am looking for luxury boutique stay suites and priority upgrade rates check. Please share availability.',
      icon: '🏨'
    },
    {
      id: 'packages',
      title: '🏝️ Holiday Package Quote',
      text: 'Namaste GoRASA! I want a bespoke, all-inclusive tour guide entry and sightseeing itinerary quote for Goa/Andaman.',
      icon: '🏝️'
    },
    {
      id: 'corporate',
      title: '💼 Corporate Travel Program',
      text: `Namaste GoRASA! I want to inquire about setting up a joint corporate travel partner account. ${user?.companyName ? `Company: ${user.companyName}` : ''}`,
      icon: '💼'
    }
  ];

  const handleTemplateSelect = (id: string, text: string) => {
    setActiveTemplate(id);
    setCustomMsg(text);
  };

  const currentTextToSend = activeTemplate === 'custom' ? customMsg : (templates.find(t => t.id === activeTemplate)?.text || customMsg);

  const handleLaunchWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = currentTextToSend.trim() || 'Namaste GoRASA! I need support regarding my booking.';
    const wsUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMsg)}`;
    window.open(wsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerMockNotification = () => {
    setNotificationMock(prev => ({ ...prev, status: 'sending' }));
    setTimeout(() => {
      setNotificationMock(prev => ({ ...prev, status: 'sent' }));
      setTimeout(() => {
        setNotificationMock(prev => ({ ...prev, status: 'idle' }));
      }, 4000);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-in fade-in duration-300">
      
      {/* Consultation Box: Left 7 Cols */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <MessageCircle className="w-6 h-6 fill-emerald-600/10" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight">Instant WhatsApp Concierge Desk</h3>
              <p className="text-[11px] text-slate-400 font-medium font-mono">DIRECT COMM-LINK: {WHATSAPP_DISPLAY} • AVERAGE RESP: &lt; 5 MINS</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Bypass standard wait lines. Select a structured docket package template or compose a personalized request. Clicking the launch button will open an encrypted WhatsApp chat straight to our reservation office catalog.
          </p>

          {/* Quick templates panel */}
          <div className="mb-6">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-450 mb-3 font-mono">Select Query Dossier Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateSelect(t.id, t.text)}
                  className={`p-3.5 rounded-xl border text-xs text-left font-semibold transition-all relative flex items-center gap-3 cursor-pointer ${
                    activeTemplate === t.id
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500/50 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg shrink-0">{t.icon}</span>
                  <div className="truncate">
                    <span className="block truncate font-bold leading-none mb-1">{t.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium block truncate">{t.text}</span>
                  </div>
                  {activeTemplate === t.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500"></div>
                  )}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => handleTemplateSelect('custom', '')}
                className={`p-3.5 rounded-xl border text-xs text-left font-semibold transition-all relative flex items-center gap-3 cursor-pointer sm:col-span-2 ${
                  activeTemplate === 'custom'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-500/50 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg shrink-0">📝</span>
                <div>
                  <span className="block font-bold leading-none mb-1">Custom Inquiry</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Draft custom traveler specifications to the reservation deck</span>
                </div>
                {activeTemplate === 'custom' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500"></div>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic textarea block */}
          <form onSubmit={handleLaunchWhatsApp} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-405 mb-2 font-mono">Encrypted Message Payload</label>
              <textarea
                value={activeTemplate === 'custom' ? customMsg : currentTextToSend}
                onChange={(e) => {
                  setActiveTemplate('custom');
                  setCustomMsg(e.target.value);
                }}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-150 focus:ring-1 focus:ring-emerald-500 rounded-xl outline-none text-xs font-semibold text-slate-800 tracking-wide h-24 placeholder-slate-400 transition-all font-mono"
                placeholder="Namaste GoRASA! Please provide pricing indices or quote logs for..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md shadow-emerald-100 hover:shadow-xl transition-all active:scale-98 text-xs uppercase flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>Launch Encrypted WhatsApp Consultation</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>
          </form>
        </div>
      </div>

      {/* API Notification Logger: Right 5 Cols */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* official channel credentials */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
          
          <h4 className="text-md font-serif font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>GoRASA Official Business Account</span>
          </h4>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5 font-mono text-[11px]">
              <span className="text-slate-400">VERIFIED ID</span>
              <span className="text-emerald-400 font-bold">GORASA-WHATSAPP-VIP</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-mono text-[11px]">
              <span className="text-slate-400">GDS COMM LAYER</span>
              <span className="text-slate-205">Infobip / Meta WhatsApp API</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-mono text-[11px]">
              <span className="text-slate-400">WHITELIST STATUS</span>
              <span className="text-emerald-400 uppercase font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ACTIVE SECURE
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 text-[11px]">
              <span className="text-slate-400">GLOBAL ASSISTANCE</span>
              <span className="text-slate-200">24 Hours / 365 Days</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-slate-400 leading-normal bg-white/5 p-3 rounded-xl border border-white/5">
            🔒 Fully encrypted. GoRASA will never request login PIN keys or wallet seed identifiers over WhatsApp.
          </div>
        </div>

        {/* Live Notification Broker Log Sandbox */}
        <div className="bg-slate-50 rounded-3xl border border-slate-150 p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-450 mb-3 font-mono flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Live API Broadcast Simulator</span>
          </h4>

          <p className="text-[11px] text-slate-400 leading-normal mb-4">
            Test how verified PNR itineraries are broadcast via standard WhatsApp APIs instantly upon reservation completion.
          </p>

          <div className="space-y-3 text-left">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 font-mono">Recipient Phone Number</label>
              <input
                type="text"
                value={notificationMock.phone}
                onChange={(e) => setNotificationMock(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="E.g. 9199999999"
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:ring-1 focus:ring-emerald-500 rounded-lg outline-none text-xs font-semibold text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 font-mono">Sample Message Template</label>
              <div className="bg-white p-3 rounded-xl border border-slate-150 text-[11px] text-slate-600 font-mono leading-relaxed select-all">
                {notificationMock.msg}
              </div>
            </div>

            <div>
              {notificationMock.status === 'idle' ? (
                <button
                  type="button"
                  onClick={handleTriggerMockNotification}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  Trigger Test API Dispatch
                </button>
              ) : notificationMock.status === 'sending' ? (
                <div className="w-full py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 font-mono">
                  <span className="w-4 h-4 rounded-full border-2 border-emerald-505 border-t-transparent animate-spin"></span>
                  Pushing JSON packet via webhook...
                </div>
              ) : (
                <div className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 font-mono animate-bounce">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Broadcast verified (GR-202 Whitelisted)
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default WhatsAppChannel;
