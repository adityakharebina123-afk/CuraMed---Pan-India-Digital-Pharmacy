import React, { useState } from 'react';
import { PrescriptionItem, Medicine } from '../data/mockData';
import { scanPrescription, ScannedPrescriptionResult } from '../services/aiService';

interface PrescriptionsViewProps {
  prescriptions: PrescriptionItem[];
  onToggleDoseTaken: (id: string) => void;
  onRequestRefill: (item: PrescriptionItem) => void;
  onAddToCart?: (medicine: Medicine) => void;
  medicines?: Medicine[];
  onOpenAICenter?: (tab?: 'pharmacist' | 'interactions' | 'rx_scanner' | 'generics') => void;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({
  prescriptions,
  onToggleDoseTaken,
  onRequestRefill,
  onAddToCart,
  medicines = [],
  onOpenAICenter,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedPrescriptionResult | null>(null);
  const [selectedRx, setSelectedRx] = useState<PrescriptionItem | null>(null);
  const [cartSuccessNotice, setCartSuccessNotice] = useState(false);

  const handleSimulateUpload = async () => {
    setIsUploading(true);
    setScannedResult(null);
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
      setScannedResult(result);
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setScannedResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await scanPrescription({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg',
        });
        setScannedResult(res);
        setUploadSuccess(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAllScannedToCart = () => {
    if (!scannedResult || !onAddToCart) return;
    scannedResult.prescribedMedicines.forEach((rxMed) => {
      const found = medicines.find(
        (m) =>
          m.name.toLowerCase().includes(rxMed.brandName.toLowerCase().split(' ')[0]) ||
          m.composition.toLowerCase().includes(rxMed.salt.toLowerCase().split(' ')[0])
      );
      if (found) {
        onAddToCart(found);
      }
    });
    setCartSuccessNotice(true);
    setTimeout(() => setCartSuccessNotice(false), 3500);
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Upload Prescription Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e7eeff] mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004357] text-2xl">receipt_long</span>
            <h2 className="text-[16px] font-bold text-[#111c2d]">Upload Doctor Prescription</h2>
          </div>
          <span className="text-[10px] font-bold text-[#004357] bg-[#dee8ff] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#006c49]">neurology</span>
            <span>Gemini 3.8 OCR</span>
          </span>
        </div>

        <p className="text-[12px] text-[#70787d] mb-4 leading-relaxed">
          Upload photo or PDF of your doctor's prescription. Our Gemini 3.8 Vision OCR automatically digitizes medications and assigns our licensed chief pharmacists for compliance verification.
        </p>

        {isUploading ? (
          <div className="p-6 rounded-2xl bg-[#f0f3ff] border border-dashed border-[#0d5c75] text-center flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-[#0d5c75] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] font-bold text-[#004357]">
              Gemini Vision analyzing prescription image...
            </span>
            <span className="text-[11px] text-[#70787d]">
              Extracting Doctor Reg. No., Drug Salts, Regimens &amp; Cold-Chain Requirements
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="border-2 border-dashed border-[#bfc8cd] hover:border-[#0d5c75] bg-[#f9f9ff] p-5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
              <span className="material-symbols-outlined text-3xl text-[#0d5c75]">cloud_upload</span>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111c2d]">
                  Click to Browse or Drag &amp; Drop Rx Photo
                </span>
                <span className="text-[11px] text-[#70787d]">
                  Supports JPG, PNG, PDF up to 15MB
                </span>
              </div>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#70787d]">Testing the portal?</span>
              <button
                type="button"
                onClick={handleSimulateUpload}
                className="text-[#0d5c75] font-bold hover:underline cursor-pointer"
              >
                + Scan Sample Manipal Hospital Rx (AI OCR)
              </button>
            </div>
          </div>
        )}

        {/* AI Extracted Prescription Details Card */}
        {scannedResult && (
          <div className="mt-4 p-4 rounded-2xl bg-[#f8fbff] border border-[#d2e0ff] animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff] mb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49] text-xl">verified</span>
                <div>
                  <h4 className="text-[13px] font-bold text-[#004357]">
                    {scannedResult.verifiedComplianceBadge || 'CDSCO Schedule H Verified'}
                  </h4>
                  <p className="text-[10.5px] text-[#70787d]">
                    {scannedResult.doctor.name} ({scannedResult.doctor.registrationNumber}) · {scannedResult.doctor.hospitalOrClinic}
                  </p>
                </div>
              </div>

              {onAddToCart && (
                <button
                  type="button"
                  onClick={handleAddAllScannedToCart}
                  className="px-3 py-1.5 bg-[#006c49] hover:bg-[#005539] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  <span>Add All to Cart</span>
                </button>
              )}
            </div>

            {cartSuccessNotice && (
              <div className="mb-2.5 p-2 bg-[#6cf8bb]/30 text-[#006c49] text-[11px] font-bold rounded-lg text-center animate-fade-in">
                ✓ Prescribed items added to your cart with cold-chain safeguards!
              </div>
            )}

            {/* Extracted medicines list */}
            <div className="space-y-2">
              {scannedResult.prescribedMedicines.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-[#e1e8f0] flex items-center justify-between text-[11.5px]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-[#111c2d]">{m.brandName}</strong>
                      <span className="text-[9.5px] font-semibold text-[#004357] bg-[#f0f3ff] px-1.5 py-0.2 rounded-full">
                        {m.dosageForm}
                      </span>
                      {m.requiresColdChain && (
                        <span className="text-[9.5px] font-bold text-[#004357] bg-[#bde9ff] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">ac_unit</span>
                          <span>2°C–8°C</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10.5px] text-[#70787d]">{m.salt}</div>
                    <div className="text-[11px] text-[#006c49] font-medium mt-0.5">
                      Timing: {m.dosageRegimen} · Duration: {m.durationDays || 30} days
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {onOpenAICenter && (
              <button
                type="button"
                onClick={() => onOpenAICenter('interactions')}
                className="mt-3 w-full py-1.5 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#004357] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-xs">troubleshoot</span>
                <span>Check Interactions between these Prescribed Medicines →</span>
              </button>
            )}
          </div>
        )}

        {uploadSuccess && !scannedResult && (
          <div className="mt-3 p-3 rounded-xl bg-[#6cf8bb]/20 border border-[#006c49]/30 flex items-start gap-2.5 animate-fade-in">
            <span className="material-symbols-outlined text-[#006c49] text-xl shrink-0">check_circle</span>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#006c49]">
                Prescription Successfully Verified &amp; Queued!
              </span>
              <span className="text-[11px] text-[#111c2d]">
                Doctor: Dr. Rajesh Sundaram (KMC-42891) · Pharmacist assigned: Sneha Patel, B.Pharm.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Active Prescription Refills */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[15px] font-bold text-[#111c2d] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#004357] text-xl">event_repeat</span>
          Active Medication Schedules
        </h3>
        <span className="text-[11px] text-[#70787d]">
          {prescriptions.length} Active Prescriptions
        </span>
      </div>

      {/* Refill Cards */}
      <div className="flex flex-col gap-3">
        {prescriptions.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-xs border border-[#e7eeff] hover:border-[#0d5c75]/40 transition-all flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.isColdChain ? 'bg-[#004357] text-[#6cf8bb]' : 'bg-[#dee8ff] text-[#004357]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {item.isColdChain ? 'ac_unit' : 'medication'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-bold text-[#111c2d]">{item.medicineName}</h4>
                    {item.isColdChain && (
                      <span className="px-1.5 py-0.5 rounded bg-[#004357] text-[#6cf8bb] text-[9px] font-bold">
                        2°C - 8°C
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#70787d]">{item.timing}</span>
                  <div className="flex items-center gap-1 text-[11px] text-[#40484c] mt-0.5">
                    <span className="material-symbols-outlined text-xs">person</span>
                    <span>{item.doctorName} · {item.hospital}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  item.refillsRemaining > 1
                    ? 'bg-[#6cf8bb]/30 text-[#006c49]'
                    : item.refillsRemaining === 1
                    ? 'bg-[#ffddb8] text-[#784b00]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                {item.refillsRemaining > 1
                  ? `${item.refillsRemaining} Refills Left`
                  : item.refillsRemaining === 1
                  ? 'Refill Due Soon'
                  : 'Refill Expired'}
              </span>
            </div>

            {/* Dose Compliance & Schedule Row */}
            <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e7eeff] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#70787d] uppercase font-bold">Dosage Instruction</span>
                <span className="text-[12px] font-semibold text-[#111c2d]">{item.dosage}</span>
                <span className="text-[10px] text-[#006c49] font-medium mt-0.5">{item.frequency}</span>
              </div>

              <button
                onClick={() => onToggleDoseTaken(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  item.takenToday
                    ? 'bg-[#6cf8bb]/30 text-[#006c49] border border-[#006c49]/30'
                    : 'bg-white text-[#111c2d] border border-[#bfc8cd] hover:border-[#006c49]'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {item.takenToday ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>{item.takenToday ? 'Dose Taken' : 'Mark Dose'}</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-[#70787d]">
                Next Due: <strong className="text-[#111c2d]">{item.nextRefillDue}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRx(item)}
                  className="text-[#0d5c75] font-bold hover:underline cursor-pointer"
                >
                  View Digital Rx
                </button>
                <button
                  onClick={() => onRequestRefill(item)}
                  className="px-3 py-1 bg-[#004357] text-white font-bold rounded-lg hover:bg-[#0d5c75] transition-colors cursor-pointer"
                >
                  1-Tap Refill
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Digital Prescription Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#e7eeff] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004357] text-xl">medical_information</span>
                <h3 className="text-[15px] font-bold text-[#111c2d]">Digital Prescription</h3>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="w-7 h-7 rounded-full bg-[#f0f3ff] text-[#70787d] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 text-[12px] flex-1 overflow-y-auto">
              <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
                <span className="text-[10px] text-[#70787d] uppercase font-bold block">Hospital / Clinic</span>
                <span className="text-[13px] font-bold text-[#004357]">{selectedRx.hospital}</span>
                <span className="text-[11px] text-[#111c2d] block">{selectedRx.doctorName}</span>
                <span className="text-[10px] text-[#006c49] font-mono mt-0.5 block">Reg. No: {selectedRx.doctorReg}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#70787d] uppercase font-bold block">Medication &amp; Timing</span>
                <span className="text-[14px] font-bold text-[#111c2d]">{selectedRx.medicineName}</span>
                <span className="text-[11px] text-[#70787d] block">{selectedRx.timing} · {selectedRx.duration}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#70787d] uppercase font-bold block">Schedule</span>
                <span className="text-[12px] font-medium text-[#111c2d]">{selectedRx.dosage}</span>
                <span className="text-[11px] text-[#006c49] font-semibold block">{selectedRx.frequency}</span>
              </div>

              {selectedRx.isColdChain && (
                <div className="p-2.5 rounded-xl bg-[#004357] text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#6cf8bb]">ac_unit</span>
                  <span className="text-[11px]">
                    Requires 2°C to 8°C cold-chain verified biological delivery.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#e7eeff] flex gap-2">
              <button
                onClick={() => setSelectedRx(null)}
                className="flex-1 py-2 bg-[#f0f3ff] text-[#004357] rounded-xl font-bold text-[12px] hover:bg-[#dee8ff] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onRequestRefill(selectedRx);
                  setSelectedRx(null);
                }}
                className="flex-1 py-2 bg-[#004357] text-white rounded-xl font-bold text-[12px] hover:bg-[#0d5c75] cursor-pointer"
              >
                Refill Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
