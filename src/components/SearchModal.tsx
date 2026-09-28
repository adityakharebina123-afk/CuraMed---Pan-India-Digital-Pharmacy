import React, { useState, useEffect, useRef } from 'react';
import { Medicine } from '../data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  onAddToCart: (medicine: Medicine) => void;
  onSelectMedicine: (medicine: Medicine) => void;
  cartItemIds: Record<string, number>;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  medicines,
  onAddToCart,
  onSelectMedicine,
  cartItemIds,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'tablets' | 'syrups' | 'pills' | 'condoms' | 'cold-chain' | 'rx' | 'otc'
  >('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const popularSearches = [
    'Dolo 650',
    'Cipla',
    'Abbott',
    'Sanofi',
    'Glenmark',
    'GSK',
    'USV',
    'Micro Labs',
    'Reckitt',
    'Mankind',
    'Pfizer',
    'Alkem',
    'Benadryl DR Syrup',
    'Pan-D Capsule',
    'Durex Condoms',
    'Lantus Insulin',
  ];

  const filteredMedicines = medicines.filter((med) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      med.name.toLowerCase().includes(q) ||
      med.composition.toLowerCase().includes(q) ||
      med.manufacturer.toLowerCase().includes(q) ||
      med.dosageForm.toLowerCase().includes(q) ||
      (med.formType && med.formType.toLowerCase().includes(q)) ||
      med.category.toLowerCase().includes(q);

    let matchesFilter = true;
    if (activeFilter === 'tablets') {
      matchesFilter = med.category === 'tablets' || med.formType === 'tablet' || med.dosageForm.toLowerCase().includes('tablet');
    } else if (activeFilter === 'syrups') {
      matchesFilter = med.category === 'syrups' || med.formType === 'syrup' || med.dosageForm.toLowerCase().includes('syrup') || med.dosageForm.toLowerCase().includes('solution') || med.dosageForm.toLowerCase().includes('suspension');
    } else if (activeFilter === 'pills') {
      matchesFilter = med.category === 'pills' || med.formType === 'pill' || med.dosageForm.toLowerCase().includes('capsule') || med.dosageForm.toLowerCase().includes('pill');
    } else if (activeFilter === 'condoms') {
      matchesFilter = med.category === 'condoms' || med.formType === 'condom' || med.dosageForm.toLowerCase().includes('condom') || med.isDiscretePackaging === true;
    } else if (activeFilter === 'cold-chain') {
      matchesFilter = !!med.isColdChain;
    } else if (activeFilter === 'rx') {
      matchesFilter = med.requiresRx;
    } else if (activeFilter === 'otc') {
      matchesFilter = !med.requiresRx;
    }

    return matchesQuery && matchesFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 pt-6 sm:pt-14">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#e7eeff] max-h-[88vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Search Header Bar */}
        <div className="p-4 border-b border-[#e7eeff] bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#004357] text-xl pointer-events-none">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicines, salt, brand, or illness..."
                className="w-full h-12 pl-11 pr-9 bg-white border border-[#bfc8cd] focus:border-[#0d5c75] rounded-2xl text-[14px] text-[#111c2d] placeholder:text-[#70787d] outline-none shadow-xs transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 w-6 h-6 rounded-full bg-[#f0f3ff] text-[#70787d] hover:text-[#111c2d] flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-[13px] font-semibold text-[#004357] hover:bg-[#e7eeff] rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Cancel
            </button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Results' },
              { id: 'tablets', label: '💊 Tablets' },
              { id: 'syrups', label: '🧪 Syrups' },
              { id: 'pills', label: '💊 Pills & Capsules' },
              { id: 'condoms', label: '🛡️ Condoms' },
              { id: 'cold-chain', label: '❄️ Cold-Chain (2-8°C)' },
              { id: 'rx', label: 'Rx Prescriptions' },
              { id: 'otc', label: 'OTC Wellness' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#004357] text-white shadow-xs'
                    : 'bg-white text-[#40484c] border border-[#e7eeff] hover:bg-[#f0f3ff]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#f0f3ff]">
          {/* Trending Suggestions when no query is typed */}
          {!query && (
            <div className="pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#70787d] flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-sm text-[#006c49]">trending_up</span>
                Popular Indian Formulations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-xl bg-[#f0f3ff] text-[#004357] text-[12px] font-semibold hover:bg-[#dee8ff] border border-[#dee8ff] transition-colors cursor-pointer"
                  >
                    🔍 {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Result Items */}
          <div className="pt-2 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#70787d] px-1 mb-1">
              <span>{filteredMedicines.length} medications found</span>
              <span>CDSCO Approved Pan-India</span>
            </div>

            {filteredMedicines.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-[#bfc8cd] mb-1">
                  search_off
                </span>
                <p className="text-[14px] font-bold text-[#111c2d]">No matching medications</p>
                <p className="text-[12px] text-[#70787d] max-w-xs mt-1">
                  Try searching by generic salt (e.g., Telmisartan, Metformin, Insulin Glargine) or manufacturer.
                </p>
              </div>
            ) : (
              filteredMedicines.map((med) => {
                const count = cartItemIds[med.id] || 0;
                return (
                  <div
                    key={med.id}
                    className="p-3 rounded-2xl bg-white border border-[#e7eeff] hover:border-[#0d5c75]/40 transition-all flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        onSelectMedicine(med);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[14px] font-bold text-[#111c2d] hover:text-[#004357]">
                          {med.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#f0f3ff] text-[#004357] text-[9px] font-bold border border-[#dee8ff]">
                          {med.dosageForm}
                        </span>
                        {med.isColdChain && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#dee8ff] text-[#004357] text-[9px] font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">ac_unit</span>
                            2-8°C
                          </span>
                        )}
                        {med.requiresRx ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#ffdad6]/50 text-[#93000a] text-[9px] font-bold">
                            Rx
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#6cf8bb]/20 text-[#006c49] text-[9px] font-bold">
                            OTC
                          </span>
                        )}
                        {med.isDiscretePackaging && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#f0f3ff] text-[#593600] text-[9px] font-bold border border-[#ffddb8]">
                            📦 Discrete Box
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#004357] font-medium mt-0.5 truncate">
                        {med.composition}
                      </p>
                      <p className="text-[10px] text-[#70787d] mt-0.5">
                        {med.manufacturer} · {med.packSize}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-[#006c49] font-medium mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        <span>Direct from {med.manufacturer.split(' ')[0]}</span>
                      </div>

                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-[14px] font-bold text-[#111c2d] tabular-nums">
                          ₹{med.price}
                        </span>
                        <span className="text-[11px] text-[#70787d] line-through tabular-nums">
                          ₹{med.mrp}
                        </span>
                        <span className="text-[10px] font-bold text-[#006c49]">
                          {med.discount}% OFF
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToCart(med)}
                      className={`h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                        count > 0
                          ? 'bg-[#006c49] text-white'
                          : 'bg-[#0d5c75] text-white hover:bg-[#004357]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {count > 0 ? 'check' : 'add'}
                      </span>
                      <span>{count > 0 ? `In Cart (${count})` : 'Add'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-[#f0f3ff] border-t border-[#dee8ff] flex items-center justify-between text-[11px] text-[#004357]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#006c49]">verified</span>
            <span>All drugs verified under CDSCO Schedule H &amp; G guidelines</span>
          </div>
          <span className="font-bold text-[#006c49]">Express 4-24hr Delivery</span>
        </div>
      </div>
    </div>
  );
};
