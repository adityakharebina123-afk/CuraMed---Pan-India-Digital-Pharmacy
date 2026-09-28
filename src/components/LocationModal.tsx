import React, { useState } from 'react';
import { POPULAR_LOCATIONS } from '../data/mockData';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onSelectLocation: (pincode: string, locality: string, city: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentPincode,
  onSelectLocation,
}) => {
  const [customPincode, setCustomPincode] = useState(currentPincode);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    const clean = customPincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (clean.startsWith('560')) {
      onSelectLocation(clean, 'Indiranagar', 'Bengaluru');
    } else if (clean.startsWith('400')) {
      onSelectLocation(clean, 'Bandra West', 'Mumbai');
    } else if (clean.startsWith('110')) {
      onSelectLocation(clean, 'Central', 'New Delhi');
    } else if (clean.startsWith('500')) {
      onSelectLocation(clean, 'Hitec City', 'Hyderabad');
    } else if (clean.startsWith('600')) {
      onSelectLocation(clean, 'R.A. Puram', 'Chennai');
    } else {
      onSelectLocation(clean, 'Regional Hub', 'India');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e7eeff] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#e7eeff] mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c49] text-2xl">location_on</span>
            <h3 className="text-[16px] font-bold text-[#111c2d]">Select Delivery Location</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#70787d] hover:text-[#111c2d] flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-[12px] text-[#70787d] mb-4">
          Serving 28 States &amp; 8 UTs across India with temperature-controlled cold-chain dispatch.
        </p>

        {/* Custom Pincode Input */}
        <div className="mb-4">
          <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
            Enter Indian PIN Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={customPincode}
              onChange={(e) => {
                setCustomPincode(e.target.value.replace(/\D/g, ''));
                setErrorMsg('');
              }}
              placeholder="e.g. 560038"
              className="flex-1 h-11 px-3.5 bg-[#f9f9ff] border border-[#bfc8cd] rounded-xl text-[14px] text-[#111c2d] outline-none focus:border-[#0d5c75]"
            />
            <button
              onClick={handleApplyCustom}
              className="px-4 bg-[#0d5c75] text-white text-[12px] font-bold rounded-xl hover:bg-[#004357] cursor-pointer"
            >
              Verify
            </button>
          </div>
          {errorMsg && <p className="text-[11px] text-[#ba1a1a] mt-1">{errorMsg}</p>}
        </div>

        {/* Popular Locations */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#70787d] block mb-2">
            Fast Delivery Hubs
          </span>
          <div className="flex flex-col gap-2">
            {POPULAR_LOCATIONS.map((loc) => {
              const isCurrent = loc.pincode === currentPincode;
              return (
                <button
                  key={loc.pincode}
                  onClick={() => {
                    onSelectLocation(loc.pincode, loc.locality, loc.city);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#f0f3ff] border-[#0d5c75] shadow-xs'
                      : 'bg-white border-[#e7eeff] hover:bg-[#f9f9ff]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#111c2d]">
                        {loc.locality}, {loc.city}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-[#004357]">
                        - {loc.pincode}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#006c49] font-medium block mt-0.5">
                      ✓ {loc.deliverySpeed}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="material-symbols-outlined text-[#006c49] text-lg">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
