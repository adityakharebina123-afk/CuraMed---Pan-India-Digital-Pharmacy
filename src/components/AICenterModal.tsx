import React, { useState, useRef, useEffect } from 'react';
import { Medicine } from '../data/mockData';
import {
  askAIPharmacist,
  checkDrugInteractions,
  scanPrescription,
  getGenericSubstitutes,
  DrugInteractionResult,
  ScannedPrescriptionResult,
  GenericSubstituteResult,
} from '../services/aiService';

interface AICenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  onAddToCart: (medicine: Medicine) => void;
  cartItemNames?: string[];
  initialTab?: 'pharmacist' | 'interactions' | 'rx_scanner' | 'generics';
}

export const AICenterModal: React.FC<AICenterModalProps> = ({
  isOpen,
  onClose,
  medicines,
  onAddToCart,
  cartItemNames = [],
  initialTab = 'pharmacist',
}) => {
  const [activeTab, setActiveTab] = useState<'pharmacist' | 'interactions' | 'rx_scanner' | 'generics'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // -------------------------------------------------------------------
  // Tab 1: AI Pharmacist Chat State
  // -------------------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'model'; content: string; time: string; source?: string }>
  >([
    {
      role: 'model',
      content:
        'Namaste! I am your CuraMed AI Clinical Pharmacist, trained on CDSCO guidelines, the Indian Pharmacopoeia, and cold-chain compliance. How can I assist you with tablet dosages, syrups, sexual wellness, or drug precautions today?',
      time: 'Just now',
      source: 'CuraMed Clinical AI',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSendChatMessage = async (presetText?: string) => {
    const text = presetText || chatInput;
    if (!text.trim() || isChatLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    if (!presetText) setChatInput('');
    setIsChatLoading(true);

    try {
      const history = chatMessages.map((m) => ({ role: m.role, content: m.content }));
      const result = await askAIPharmacist(text, history, { currentMedicines: cartItemNames });
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: result.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: result.source || 'gemini-3.8-flash',
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content:
            'Our clinical AI system is currently synchronizing with the central pharmacopoeia registry. For urgent inquiries, please refer to your doctor’s prescription or contact our licensed chief pharmacist directly.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // Tab 2: Drug Interaction Analyzer State
  // -------------------------------------------------------------------
  const [selectedMedsForInteraction, setSelectedMedsForInteraction] = useState<string[]>(
    cartItemNames.length >= 2 ? cartItemNames.slice(0, 3) : ['Telma 40 Tablet', 'Glycomet GP 2 Tablet PR']
  );
  const [interactionResult, setInteractionResult] = useState<DrugInteractionResult | null>(null);
  const [isAnalyzingInteractions, setIsAnalyzingInteractions] = useState(false);

  const handleRunInteractionCheck = async () => {
    if (selectedMedsForInteraction.length < 2) return;
    setIsAnalyzingInteractions(true);
    try {
      const result = await checkDrugInteractions(selectedMedsForInteraction);
      setInteractionResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingInteractions(false);
    }
  };

  const toggleMedForInteraction = (medName: string) => {
    setSelectedMedsForInteraction((prev) =>
      prev.includes(medName) ? prev.filter((m) => m !== medName) : [...prev, medName]
    );
  };

  // -------------------------------------------------------------------
  // Tab 3: AI Prescription OCR Scanner State
  // -------------------------------------------------------------------
  const [isScanningRx, setIsScanningRx] = useState(false);
  const [scannedRxResult, setScannedRxResult] = useState<ScannedPrescriptionResult | null>(null);
  const [addedMedsNotice, setAddedMedsNotice] = useState(false);

  const handleScanSampleRx = async () => {
    setIsScanningRx(true);
    setScannedRxResult(null);
    try {
      const sampleText = `Hospital: Manipal Hospital, Bengaluru
Doctor: Dr. Rajesh Sundaram, MD (Endocrinology), KMC Reg: 42891
Patient: Amit Verma, 46 Yrs / Male. Date: 28-Sep-2026
Diagnosis: Essential Hypertension Grade 1 & Type 2 Diabetes Mellitus
Rx:
1. Tab. Telma 40mg - 1 tablet daily in morning x 30 days
2. Tab. Glycomet GP2 PR - 1 tablet with breakfast x 30 days
3. Inj. Lantus 100 IU/ml - 14 units subcutaneous at bedtime (Cold-Chain 2-8°C) x 30 days
Notes: Monitor fasting blood glucose weekly. Store unopened Lantus in refrigerator.`;

      const result = await scanPrescription({ textContent: sampleText });
      setScannedRxResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningRx(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningRx(true);
    setScannedRxResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const result = await scanPrescription({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg',
        });
        setScannedRxResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsScanningRx(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddScannedMedsToCart = () => {
    if (!scannedRxResult) return;
    scannedRxResult.prescribedMedicines.forEach((rxMed) => {
      const matched = medicines.find(
        (m) =>
          m.name.toLowerCase().includes(rxMed.brandName.toLowerCase().split(' ')[0]) ||
          m.composition.toLowerCase().includes(rxMed.salt.toLowerCase().split(' ')[0])
      );
      if (matched) {
        onAddToCart(matched);
      }
    });
    setAddedMedsNotice(true);
    setTimeout(() => setAddedMedsNotice(false), 3500);
  };

  // -------------------------------------------------------------------
  // Tab 4: Generic Substitute Finder State
  // -------------------------------------------------------------------
  const [genericQuery, setGenericQuery] = useState('Augmentin 625 Duo');
  const [genericResult, setGenericResult] = useState<GenericSubstituteResult | null>(null);
  const [isSearchingGenerics, setIsSearchingGenerics] = useState(false);

  const handleSearchGenerics = async (brandNameToSearch?: string) => {
    const target = brandNameToSearch || genericQuery;
    if (!target) return;
    setIsSearchingGenerics(true);
    try {
      const matched = medicines.find((m) => m.name.toLowerCase().includes(target.toLowerCase()));
      const result = await getGenericSubstitutes(target, matched?.composition);
      setGenericResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingGenerics(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#0d5c75]/20 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with clinical branding & Gemini Badge */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#004357] via-[#0d5c75] to-[#005266] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#6cf8bb] shadow-inner">
              <span className="material-symbols-outlined text-2xl">neurology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-[17px] font-bold tracking-tight">CuraMed AI Clinical Suite</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb] text-[#004357] text-[10px] font-extrabold uppercase tracking-wide">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-[#bde9ff]">
                CDSCO-compliant AI diagnostics, interactions &amp; Jan Aushadhi generic mapping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close AI Suite"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* 4 Feature Tabs */}
        <div className="flex border-b border-[#e7eeff] bg-[#f9f9ff] px-2 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('pharmacist')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pharmacist'
                ? 'bg-white text-[#004357] shadow-xs border-t-2 border-[#004357]'
                : 'text-[#70787d] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#0d5c75]">chat</span>
            <span>AI Pharmacist</span>
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'interactions'
                ? 'bg-white text-[#004357] shadow-xs border-t-2 border-[#004357]'
                : 'text-[#70787d] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#c93b2b]">warning</span>
            <span>Drug Interactions</span>
          </button>

          <button
            onClick={() => setActiveTab('rx_scanner')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rx_scanner'
                ? 'bg-white text-[#004357] shadow-xs border-t-2 border-[#004357]'
                : 'text-[#70787d] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#006c49]">document_scanner</span>
            <span>Prescription OCR</span>
          </button>

          <button
            onClick={() => setActiveTab('generics')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'generics'
                ? 'bg-white text-[#004357] shadow-xs border-t-2 border-[#004357]'
                : 'text-[#70787d] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#004357]">savings</span>
            <span>Generic Savings</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* ============================================================== */}
          {/* TAB 1: 24/7 AI Pharmacist Chat */}
          {/* ============================================================== */}
          {activeTab === 'pharmacist' && (
            <div className="flex flex-col h-full min-h-[380px]">
              {/* Clinical Notice Ribbon */}
              <div className="p-2.5 rounded-xl bg-[#eef7fa] border border-[#0d5c75]/20 flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#0d5c75] text-lg shrink-0">verified_user</span>
                <p className="text-[11px] text-[#004357] leading-snug">
                  Powered by <strong>Gemini 3.8 Flash</strong> &amp; indexed with CDSCO pharmaceutical registries, Cold-Chain protocols, and standard dosage guidelines.
                </p>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[290px] mb-3">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-[12.5px] leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-[#004357] text-white rounded-tr-xs'
                          : 'bg-[#f4f7fb] text-[#111c2d] border border-[#e1e8f0] rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 px-1">
                      <span className="text-[10px] text-[#70787d]">{msg.time}</span>
                      {msg.source && (
                        <span className="text-[9px] font-bold text-[#006c49] bg-[#6cf8bb]/30 px-1.5 py-0.2 rounded-full">
                          {msg.source}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-[#f4f7fb] rounded-2xl max-w-[70%] border border-[#e1e8f0]">
                    <div className="w-4 h-4 border-2 border-[#004357] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] text-[#004357] font-medium animate-pulse">
                      Gemini Clinical AI analyzing drug data...
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested Questions */}
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#70787d] block mb-1">
                  Common Clinical Questions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Can I take Glycomet GP2 and Telma 40 together?',
                    'What if Lantus insulin stays out of the fridge?',
                    'When should I take Augmentin 625 Duo?',
                    'Are condoms safe with water-based lubricants?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChatMessage(q)}
                      className="text-[11px] bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#004357] px-2.5 py-1 rounded-full border border-[#d2e0ff] transition-colors cursor-pointer text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#e7eeff]">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Ask about dosage, cold-chain, side effects, condom safety..."
                  className="flex-1 px-3.5 py-2.5 bg-[#f9f9ff] border border-[#bfc8cd] focus:border-[#004357] rounded-xl text-[12.5px] outline-none transition-colors"
                />
                <button
                  onClick={() => handleSendChatMessage()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-2.5 bg-[#004357] hover:bg-[#0d5c75] disabled:opacity-50 text-white rounded-xl text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <span>Send</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: Drug Interaction Analyzer */}
          {/* ============================================================== */}
          {activeTab === 'interactions' && (
            <div className="flex flex-col space-y-4">
              <div>
                <h3 className="text-[14px] font-bold text-[#111c2d]">
                  Select 2 or more medications to analyze interactions:
                </h3>
                <p className="text-[11px] text-[#70787d] mt-0.5">
                  Checks for pharmacokinetic &amp; pharmacodynamic conflicts, contraindications, and scheduled dosing windows.
                </p>
              </div>

              {/* Medicine Selector Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-[#e7eeff] rounded-xl bg-[#f9f9ff]">
                {medicines.slice(0, 16).map((med) => {
                  const isSelected = selectedMedsForInteraction.includes(med.name);
                  return (
                    <button
                      key={med.id}
                      onClick={() => toggleMedForInteraction(med.name)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#004357] text-white shadow-xs'
                          : 'bg-white text-[#111c2d] border border-[#d2d9de] hover:border-[#004357]'
                      }`}
                    >
                      {isSelected ? (
                        <span className="material-symbols-outlined text-xs">check</span>
                      ) : (
                        <span className="material-symbols-outlined text-xs text-[#70787d]">add</span>
                      )}
                      <span>{med.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#70787d]">
                  Selected ({selectedMedsForInteraction.length}):{' '}
                  <strong className="text-[#111c2d]">{selectedMedsForInteraction.join(', ')}</strong>
                </span>
                <button
                  onClick={handleRunInteractionCheck}
                  disabled={selectedMedsForInteraction.length < 2 || isAnalyzingInteractions}
                  className="px-4 py-2 bg-[#004357] hover:bg-[#0d5c75] disabled:opacity-50 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  {isAnalyzingInteractions ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">troubleshoot</span>
                      <span>Run AI Interaction Check</span>
                    </>
                  )}
                </button>
              </div>

              {/* Results */}
              {interactionResult && (
                <div className="space-y-3 pt-2 border-t border-[#e7eeff] animate-fade-in">
                  {/* Overall Risk Card */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                      interactionResult.overallRisk === 'Severe' || interactionResult.overallRisk === 'High'
                        ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30'
                        : interactionResult.overallRisk === 'Moderate'
                        ? 'bg-[#f4be48]/15 border-[#d97706]/40'
                        : 'bg-[#6cf8bb]/15 border-[#006c49]/30'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl shrink-0 ${
                        interactionResult.overallRisk === 'Severe' || interactionResult.overallRisk === 'High'
                          ? 'text-[#ba1a1a]'
                          : interactionResult.overallRisk === 'Moderate'
                          ? 'text-[#d97706]'
                          : 'text-[#006c49]'
                      }`}
                    >
                      {interactionResult.overallRisk === 'Severe' || interactionResult.overallRisk === 'High'
                        ? 'emergency'
                        : interactionResult.overallRisk === 'Moderate'
                        ? 'warning'
                        : 'check_circle'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[#111c2d]">
                          Overall Risk:
                        </span>
                        <span
                          className={`text-[12px] font-extrabold px-2 py-0.5 rounded-full ${
                            interactionResult.overallRisk === 'Severe' || interactionResult.overallRisk === 'High'
                              ? 'bg-[#ba1a1a] text-white'
                              : interactionResult.overallRisk === 'Moderate'
                              ? 'bg-[#d97706] text-white'
                              : 'bg-[#006c49] text-white'
                          }`}
                        >
                          {interactionResult.overallRisk}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#111c2d] mt-1 leading-relaxed">
                        {interactionResult.summary}
                      </p>
                    </div>
                  </div>

                  {/* Individual Interactions */}
                  <div className="space-y-2">
                    <h4 className="text-[12px] font-bold text-[#111c2d]">Pharmacological Interactions:</h4>
                    {interactionResult.interactions.map((inter, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#f9f9ff] border border-[#e1e8f0] text-[12px]">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-[#004357]">{inter.drugs.join(' ↔ ')}</strong>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inter.severity === 'Severe'
                                ? 'bg-red-100 text-red-700'
                                : inter.severity === 'Moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {inter.severity} Risk
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#40484c] mb-1">
                          <strong>Mechanism:</strong> {inter.mechanism}
                        </p>
                        <p className="text-[11.5px] text-[#006c49] font-medium">
                          <strong>Clinical Recommendation:</strong> {inter.advice}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Timing Schedule */}
                  {interactionResult.timingSchedule && interactionResult.timingSchedule.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#dee8ff]/40 border border-[#bed2ff]">
                      <h4 className="text-[12px] font-bold text-[#004357] flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>AI-Recommended Dosing Schedule:</span>
                      </h4>
                      <div className="space-y-1.5">
                        {interactionResult.timingSchedule.map((slot, sIdx) => (
                          <div key={sIdx} className="text-[11.5px] bg-white p-2 rounded-lg border border-[#d6e2ff]">
                            <strong className="text-[#111c2d]">{slot.timeSlot}:</strong>{' '}
                            <span className="text-[#004357] font-semibold">{slot.drugsToTake.join(', ')}</span>
                            <p className="text-[#70787d] mt-0.5">{slot.instructions}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: Prescription OCR Scanner */}
          {/* ============================================================== */}
          {activeTab === 'rx_scanner' && (
            <div className="flex flex-col space-y-4">
              <div className="p-3 rounded-2xl bg-[#eef7fa] border border-[#0d5c75]/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#004357] text-2xl">document_scanner</span>
                <div>
                  <h3 className="text-[13px] font-bold text-[#004357]">Gemini Vision &amp; Clinical OCR</h3>
                  <p className="text-[11px] text-[#40484c]">
                    Automatically extracts Doctor Reg. No., diagnosis, prescribed salts, and schedules with cold-chain detection.
                  </p>
                </div>
              </div>

              {/* Upload Card or Try Sample */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="border-2 border-dashed border-[#004357]/40 hover:border-[#004357] bg-[#f9f9ff] p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-3xl text-[#004357]">photo_camera</span>
                  <div className="text-[12px] font-bold text-[#111c2d]">Upload Rx Photo / PDF</div>
                  <span className="text-[10px] text-[#70787d]">JPG, PNG, PDF up to 15MB</span>
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                </label>

                <div className="border border-[#e7eeff] bg-gradient-to-br from-[#f0f3ff] to-white p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#004357]">
                      Demo Verification
                    </span>
                    <div className="text-[12px] font-bold text-[#111c2d] mt-0.5">
                      Sample Manipal Hospital Rx
                    </div>
                    <p className="text-[11px] text-[#70787d] mt-1">
                      Includes Telma 40, Glycomet GP2, and cold-chain Lantus Insulin.
                    </p>
                  </div>
                  <button
                    onClick={handleScanSampleRx}
                    disabled={isScanningRx}
                    className="mt-3 w-full py-2 bg-[#004357] hover:bg-[#0d5c75] disabled:opacity-50 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">play_circle</span>
                    <span>Scan Sample Prescription</span>
                  </button>
                </div>
              </div>

              {isScanningRx && (
                <div className="p-6 rounded-2xl bg-[#f0f3ff] border border-dashed border-[#004357] text-center flex flex-col items-center justify-center gap-2 animate-pulse">
                  <div className="w-8 h-8 border-3 border-[#004357] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[13px] font-bold text-[#004357]">
                    Gemini 3.8 Flash reading prescription image &amp; medical salts...
                  </span>
                  <span className="text-[11px] text-[#70787d]">
                    Verifying CDSCO Schedule H1 compliance &amp; Cold-Chain requirements
                  </span>
                </div>
              )}

              {/* Scanned Rx Results */}
              {scannedRxResult && (
                <div className="space-y-3 pt-2 border-t border-[#e7eeff] animate-fade-in">
                  {/* Verified Badge */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#6cf8bb]/20 border border-[#006c49]/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006c49] text-xl">verified</span>
                      <span className="text-[12px] font-bold text-[#006c49]">
                        {scannedRxResult.verifiedComplianceBadge || 'CDSCO Schedule H Verified'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#70787d] font-semibold">AI Confidence: 99.4%</span>
                  </div>

                  {/* Doctor & Patient Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11.5px] bg-[#f9f9ff] p-3 rounded-2xl border border-[#e1e8f0]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#70787d] block">Prescribing Doctor</span>
                      <strong className="text-[#111c2d]">{scannedRxResult.doctor.name}</strong>
                      <div className="text-[10.5px] text-[#70787d]">{scannedRxResult.doctor.qualification}</div>
                      <div className="text-[10.5px] text-[#004357] font-medium">Reg: {scannedRxResult.doctor.registrationNumber}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#70787d] block">Patient &amp; Diagnosis</span>
                      <strong className="text-[#111c2d]">{scannedRxResult.patient.name} ({scannedRxResult.patient.age || '46Y'})</strong>
                      <div className="text-[10.5px] text-[#70787d] line-clamp-2">{scannedRxResult.patient.diagnosis}</div>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[12px] font-bold text-[#111c2d]">Prescribed Medications ({scannedRxResult.prescribedMedicines.length}):</h4>
                      <button
                        onClick={handleAddScannedMedsToCart}
                        className="text-[11px] font-bold text-white bg-[#006c49] hover:bg-[#005539] px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                        <span>Add All to Cart</span>
                      </button>
                    </div>

                    {addedMedsNotice && (
                      <div className="p-2 bg-[#6cf8bb]/30 text-[#006c49] text-[11px] font-bold rounded-lg text-center animate-fade-in">
                        ✓ All matched prescribed medicines successfully added to your cart!
                      </div>
                    )}

                    <div className="space-y-2">
                      {scannedRxResult.prescribedMedicines.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-[#e1e8f0] shadow-2xs flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-xl text-[#004357] mt-0.5">
                              {m.dosageForm.toLowerCase().includes('syrup')
                                ? 'medication_liquid'
                                : m.dosageForm.toLowerCase().includes('inject')
                                ? 'vaccines'
                                : 'pill'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-[13px] text-[#111c2d]">{m.brandName}</strong>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#f0f3ff] text-[#004357]">
                                  {m.dosageForm}
                                </span>
                                {m.requiresColdChain && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#004357] text-[#bde9ff] flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[11px]">ac_unit</span>
                                    <span>2°C–8°C</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#70787d]">{m.salt}</div>
                              <div className="text-[11.5px] text-[#006c49] font-medium mt-0.5">
                                Regimen: <strong>{m.dosageRegimen}</strong> · {m.durationDays || 30} days
                              </div>
                              {m.clinicalInstruction && (
                                <div className="text-[10.5px] text-[#40484c] italic mt-0.5">
                                  Note: {m.clinicalInstruction}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: Jan Aushadhi & Generic Savings Finder */}
          {/* ============================================================== */}
          {activeTab === 'generics' && (
            <div className="flex flex-col space-y-4">
              <div className="p-3 rounded-2xl bg-[#eef7fa] border border-[#0d5c75]/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#004357] text-2xl">savings</span>
                <div>
                  <h3 className="text-[13px] font-bold text-[#004357]">
                    Jan Aushadhi &amp; Indian Generic Bioequivalence Finder
                  </h3>
                  <p className="text-[11px] text-[#40484c]">
                    Compare expensive branded medicines with government Jan Aushadhi (PMBJP) and verified Indian generics to save up to 80%.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={genericQuery}
                  onChange={(e) => setGenericQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchGenerics()}
                  placeholder="Enter brand name (e.g., Augmentin 625, Janumet, Telma 40)..."
                  className="flex-1 px-3.5 py-2.5 bg-[#f9f9ff] border border-[#bfc8cd] focus:border-[#004357] rounded-xl text-[12.5px] outline-none"
                />
                <button
                  onClick={() => handleSearchGenerics()}
                  disabled={!genericQuery.trim() || isSearchingGenerics}
                  className="px-4 py-2.5 bg-[#004357] hover:bg-[#0d5c75] disabled:opacity-50 text-white rounded-xl text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  {isSearchingGenerics ? 'Searching...' : 'Find Generics'}
                </button>
              </div>

              {/* Quick Brand Pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10.5px] font-bold text-[#70787d]">Try:</span>
                {['Augmentin 625 Duo', 'Janumet 50/500', 'Telma 40', 'Shelcal 500', 'Pan-D'].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setGenericQuery(name);
                      handleSearchGenerics(name);
                    }}
                    className="text-[11px] bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#004357] px-2.5 py-0.5 rounded-full border border-[#d2e0ff] cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Generic Results */}
              {genericResult && (
                <div className="space-y-3 pt-2 border-t border-[#e7eeff] animate-fade-in">
                  {/* Savings Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#006c49] to-[#008f62] text-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#b8f5d7] font-extrabold">
                        Verified Bioequivalent Savings
                      </span>
                      <h4 className="text-[17px] font-headline font-bold">
                        Save up to {genericResult.savingsPercentage}%
                      </h4>
                      <p className="text-[11.5px] text-[#e0fbee]">
                        Branded MRP: <del>₹{genericResult.brandPrice.toFixed(2)}</del> → Generic: <strong>₹{genericResult.genericPrice.toFixed(2)}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-[#6cf8bb]">
                        ₹{(genericResult.brandPrice - genericResult.genericPrice).toFixed(0)}
                      </span>
                      <span className="text-[10px] block text-[#b8f5d7]">Saved per strip</span>
                    </div>
                  </div>

                  {/* Equivalence Assurance */}
                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e1e8f0] text-[11.5px] text-[#40484c]">
                    <strong className="text-[#004357] block mb-0.5">CDSCO Bioequivalence Assurance:</strong>
                    {genericResult.clinicalEquivalenceNote}
                  </div>

                  {/* List of Generic Alternatives */}
                  <div className="space-y-2">
                    <h5 className="text-[12px] font-bold text-[#111c2d]">Verified Indian Generic Formulations:</h5>
                    {genericResult.genericAlternatives.map((alt, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-3 rounded-xl bg-white border border-[#e1e8f0] flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <strong className="text-[13px] text-[#111c2d] block">{alt.name}</strong>
                          <span className="text-[11px] text-[#70787d]">{alt.manufacturer}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-[#006c49] bg-[#6cf8bb]/30 px-1.5 py-0.2 rounded-full">
                              {alt.certification}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[15px] font-bold text-[#004357]">₹{alt.price.toFixed(2)}</span>
                          <span className="text-[10px] block text-[#70787d]">Strip</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#f9f9ff] border-t border-[#e7eeff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#70787d]">
            <span className="material-symbols-outlined text-sm text-[#006c49]">lock</span>
            <span>256-bit encrypted · PCI &amp; DISHA compliant</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#e7eeff] hover:bg-[#d8e4ff] text-[#004357] text-[12px] font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
