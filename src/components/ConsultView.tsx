import React, { useState } from 'react';
import { askAIPharmacist } from '../services/aiService';

interface ConsultViewProps {
  onOpenAICenter?: (tab?: 'pharmacist' | 'interactions' | 'rx_scanner' | 'generics') => void;
}

export const ConsultView: React.FC<ConsultViewProps> = ({ onOpenAICenter }) => {
  const [activeChat, setActiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'pharmacist'; text: string; time: string; badge?: string }[]
  >([
    {
      sender: 'pharmacist',
      text: 'Namaste! I am Sneha Patel, Chief Clinical Pharmacist at CuraMed (Reg. No: KA-PH-49201). Supported by our Gemini 3.8 Flash AI Clinical Assistant, how can I assist you with tablet dosages, syrups, sexual wellness, or drug interactions today?',
      time: '11:40 AM',
      badge: 'Licensed PCI & Gemini AI',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const quickQuestions = [
    'Can I take Glycomet GP2 and Telma 40 together in the morning?',
    'What should I do if my Lantus insulin was left out of the fridge?',
    'Are Durex condoms safe with silicone-based lubricants?',
    'Need clarification on generic substitution for Shelcal 500.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isSending) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsSending(true);

    try {
      const history = chatMessages.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: m.text,
      }));
      const res = await askAIPharmacist(text, history);

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'pharmacist',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: res.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash AI' : 'CDSCO Pharmacopoeia',
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'pharmacist',
          text: 'Under CDSCO and Pharmacy Practice Regulations, please adhere strictly to your prescribing physician’s dosage schedule or contact our 24/7 duty pharmacist.',
          time: 'Just now',
          badge: 'Clinical Protocol',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Consult Banner */}
      <div className="bg-gradient-to-r from-[#004357] to-[#0d5c75] text-white p-5 rounded-2xl shadow-md mb-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[#bde9ff] text-[10px] font-bold mb-2">
            <span className="material-symbols-outlined text-xs">verified</span>
            <span>24x7 Clinical Support &amp; AI Intelligence</span>
          </div>
          <h2 className="font-headline text-[20px] font-bold">Licensed Pharmacist &amp; Tele-Doctor</h2>
          <p className="text-[12px] text-[#93d3ef] mt-1">
            Compliant with Telemedicine Practice Guidelines issued by Ministry of Health &amp; Family Welfare.
          </p>
        </div>
      </div>

      {/* Gemini AI Clinical Suite Quick Launch Card */}
      <div className="bg-gradient-to-br from-[#f0f4ff] via-white to-[#eef9f5] rounded-2xl p-4 border border-[#0d5c75]/25 shadow-xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#004357] text-[#6cf8bb] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-lg">neurology</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[14px] font-bold text-[#111c2d]">CuraMed Clinical AI Suite</h3>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-[#004357] text-[#6cf8bb] rounded-full uppercase">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-[#70787d]">
                Instant prescription OCR, multi-drug interaction reviews &amp; Jan Aushadhi generic mapping
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => onOpenAICenter?.('interactions')}
            className="p-2.5 rounded-xl bg-white hover:bg-[#dee8ff]/50 border border-[#e1e8f0] flex flex-col items-center text-center gap-1 transition-all cursor-pointer shadow-2xs group"
          >
            <span className="material-symbols-outlined text-xl text-[#ba1a1a] group-hover:scale-110 transition-transform">
              troubleshoot
            </span>
            <span className="text-[11px] font-bold text-[#111c2d] leading-tight">Drug Safety Check</span>
            <span className="text-[9px] text-[#70787d]">Interaction Risk</span>
          </button>

          <button
            onClick={() => onOpenAICenter?.('rx_scanner')}
            className="p-2.5 rounded-xl bg-white hover:bg-[#dee8ff]/50 border border-[#e1e8f0] flex flex-col items-center text-center gap-1 transition-all cursor-pointer shadow-2xs group"
          >
            <span className="material-symbols-outlined text-xl text-[#006c49] group-hover:scale-110 transition-transform">
              document_scanner
            </span>
            <span className="text-[11px] font-bold text-[#111c2d] leading-tight">Prescription OCR</span>
            <span className="text-[9px] text-[#70787d]">Digitize &amp; Cart</span>
          </button>

          <button
            onClick={() => onOpenAICenter?.('generics')}
            className="p-2.5 rounded-xl bg-white hover:bg-[#dee8ff]/50 border border-[#e1e8f0] flex flex-col items-center text-center gap-1 transition-all cursor-pointer shadow-2xs group"
          >
            <span className="material-symbols-outlined text-xl text-[#004357] group-hover:scale-110 transition-transform">
              savings
            </span>
            <span className="text-[11px] font-bold text-[#111c2d] leading-tight">Jan Aushadhi</span>
            <span className="text-[9px] text-[#70787d]">Save up to 80%</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Free Pharmacist Review */}
        <div className="bg-white p-4 rounded-2xl border border-[#e7eeff] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#6cf8bb]/30 flex items-center justify-center text-[#006c49] mb-2">
              <span className="material-symbols-outlined text-xl">medication_liquid</span>
            </div>
            <h3 className="text-[14px] font-bold text-[#111c2d]">Pharmacist Review</h3>
            <p className="text-[11px] text-[#70787d] mt-1 leading-relaxed">
              Drug interaction checks, dosage timing &amp; cold-chain advice.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#f0f3ff] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#006c49]">100% Free</span>
            <button
              onClick={() => setActiveChat(true)}
              className="px-3 py-1 bg-[#0d5c75] text-white text-[11px] font-bold rounded-lg hover:bg-[#004357] cursor-pointer"
            >
              Chat Now
            </button>
          </div>
        </div>

        {/* MBBS Doctor Teleconsult */}
        <div className="bg-white p-4 rounded-2xl border border-[#e7eeff] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#dee8ff] flex items-center justify-center text-[#004357] mb-2">
              <span className="material-symbols-outlined text-xl">stethoscope</span>
            </div>
            <h3 className="text-[14px] font-bold text-[#111c2d]">Doctor Consult</h3>
            <p className="text-[11px] text-[#70787d] mt-1 leading-relaxed">
              New prescriptions, chronic condition reviews &amp; lab advice.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#f0f3ff] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#111c2d]">₹199</span>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-3 py-1 bg-[#004357] text-white text-[11px] font-bold rounded-lg hover:bg-[#0d5c75] cursor-pointer"
            >
              Book Video
            </button>
          </div>
        </div>
      </div>

      {/* Available Medical Staff */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e7eeff] mb-4">
        <h3 className="text-[14px] font-bold text-[#111c2d] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#004357] text-lg">medical_services</span>
          Duty Clinical Team Online
        </h3>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-2.5 bg-[#f9f9ff] rounded-xl border border-[#e7eeff]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6cf8bb]/30 flex items-center justify-center font-bold text-[#006c49]">
                SP
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#111c2d]">Sneha Patel, B.Pharm</span>
                  <span className="w-2 h-2 rounded-full bg-[#006c49]" />
                </div>
                <span className="text-[11px] text-[#70787d]">Chief Pharmacist · Reg: KA-PH-49201</span>
              </div>
            </div>
            <button
              onClick={() => setActiveChat(true)}
              className="px-3 py-1.5 bg-[#f0f3ff] text-[#004357] text-[11px] font-bold rounded-lg hover:bg-[#dee8ff] cursor-pointer"
            >
              Chat (Online)
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#f9f9ff] rounded-xl border border-[#e7eeff]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#dee8ff] flex items-center justify-center font-bold text-[#004357]">
                AR
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#111c2d]">Dr. Arvind Rao, MD</span>
                  <span className="w-2 h-2 rounded-full bg-[#006c49]" />
                </div>
                <span className="text-[11px] text-[#70787d]">Internal Medicine · Reg: KMC-88192</span>
              </div>
            </div>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-3 py-1.5 bg-[#004357] text-white text-[11px] font-bold rounded-lg hover:bg-[#0d5c75] cursor-pointer"
            >
              Call (5m wait)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Clinical Chat Room */}
      {activeChat && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#0d5c75]/30 mb-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7eeff] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#006c49] animate-pulse" />
              <div>
                <h4 className="text-[13px] font-bold text-[#111c2d]">Pharmacist Consultation Live</h4>
                <p className="text-[10px] text-[#70787d]">Backed by Gemini 3.8 Flash Clinical AI · PCI Regulated</p>
              </div>
            </div>
            <button
              onClick={() => setActiveChat(false)}
              className="text-[#70787d] hover:text-[#111c2d] text-xs font-semibold cursor-pointer"
            >
              Minimize
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1 mb-3">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[88%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-[12px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0d5c75] text-white rounded-br-xs'
                      : 'bg-[#f0f3ff] text-[#111c2d] border border-[#dee8ff] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 px-1">
                  <span className="text-[9px] text-[#70787d]">{msg.time}</span>
                  {msg.badge && (
                    <span className="text-[8.5px] font-bold text-[#006c49] bg-[#6cf8bb]/30 px-1 py-0.2 rounded-full">
                      {msg.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 p-3 bg-[#f0f3ff] rounded-2xl max-w-[75%] border border-[#dee8ff]">
                <div className="w-3.5 h-3.5 border-2 border-[#004357] border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-[#004357] font-medium animate-pulse">
                  Gemini Clinical AI preparing medical response...
                </span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-col gap-1 mb-2.5">
            <span className="text-[10px] font-bold text-[#70787d] uppercase tracking-wider">
              Quick Clinical Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-[#f0f3ff] text-[#004357] hover:bg-[#dee8ff] transition-colors border border-[#dee8ff] cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Chief Pharmacist about dosage, side effects, condoms..."
              className="flex-1 h-10 px-3 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[12px] text-[#111c2d] outline-none focus:border-[#0d5c75]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isSending}
              className="w-10 h-10 bg-[#0d5c75] disabled:opacity-50 text-white rounded-xl flex items-center justify-center hover:bg-[#004357] cursor-pointer shrink-0 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Call Simulation Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111c2d] text-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0d5c75] mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-white">videocam</span>
            </div>
            <h3 className="text-[18px] font-bold">Connecting to Dr. Arvind Rao</h3>
            <p className="text-[12px] text-[#93d3ef] mt-1 font-mono">MBBS, MD · Reg: KMC-88192</p>
            <p className="text-[12px] text-[#bfc8cd] mt-3">
              Camera &amp; audio permission authorized. Telemedicine video line is end-to-end encrypted under DISHA guidelines.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="flex-1 py-2.5 bg-[#ba1a1a] text-white rounded-xl text-[13px] font-bold hover:bg-[#93000a] cursor-pointer"
              >
                End Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
