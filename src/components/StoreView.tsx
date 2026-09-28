import React, { useState } from 'react';
import { Medicine } from '../data/mockData';

interface StoreViewProps {
  medicines: Medicine[];
  onAddToCart: (medicine: Medicine) => void;
  cartItemIds: Record<string, number>;
  onOpenCart: () => void;
  onNavigateToPrescriptions: () => void;
  currentPincode: string;
  onOpenPharmaPartners?: () => void;
  onOpenAICenter?: (tab?: 'pharmacist' | 'interactions' | 'rx_scanner' | 'generics') => void;
  selectedCompany?: string;
  onSelectCompany?: (company: string) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  medicines,
  onAddToCart,
  cartItemIds,
  onOpenCart,
  onNavigateToPrescriptions,
  currentPincode,
  onOpenPharmaPartners,
  onOpenAICenter,
  selectedCompany,
  onSelectCompany,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMedicineModal, setSelectedMedicineModal] = useState<Medicine | null>(null);

  const pharmaCompanies = [
    { name: 'All Partners', query: '' },
    { name: 'Cipla', query: 'Cipla' },
    { name: 'Abbott', query: 'Abbott' },
    { name: 'Sanofi', query: 'Sanofi' },
    { name: 'Glenmark', query: 'Glenmark' },
    { name: 'GSK', query: 'GlaxoSmithKline' },
    { name: 'USV', query: 'USV' },
    { name: 'Micro Labs', query: 'Micro Labs' },
    { name: 'Reckitt', query: 'Reckitt' },
    { name: 'Mankind', query: 'Mankind' },
    { name: 'Pfizer', query: 'Pfizer' },
    { name: 'Alkem', query: 'Alkem' },
    { name: 'Torrent', query: 'Torrent' },
  ];

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'tablets', label: '💊 Tablets' },
    { id: 'syrups', label: '🧪 Syrups & Liquids' },
    { id: 'pills', label: '💊 Pills & Capsules' },
    { id: 'condoms', label: '🛡️ Condoms & Wellness' },
    { id: 'cold-chain', label: '❄️ Cold-Chain (2-8°C)' },
    { id: 'devices', label: '🩺 Devices' },
  ];

  const filteredMedicines = medicines.filter((med) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      med.name.toLowerCase().includes(q) ||
      med.composition.toLowerCase().includes(q) ||
      med.manufacturer.toLowerCase().includes(q) ||
      med.dosageForm.toLowerCase().includes(q) ||
      (med.formType && med.formType.toLowerCase().includes(q)) ||
      med.category.toLowerCase().includes(q);

    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'tablets') {
      matchesCategory = med.category === 'tablets' || med.formType === 'tablet' || med.dosageForm.toLowerCase().includes('tablet');
    } else if (selectedCategory === 'syrups') {
      matchesCategory = med.category === 'syrups' || med.formType === 'syrup' || med.dosageForm.toLowerCase().includes('syrup') || med.dosageForm.toLowerCase().includes('solution') || med.dosageForm.toLowerCase().includes('suspension');
    } else if (selectedCategory === 'pills') {
      matchesCategory = med.category === 'pills' || med.formType === 'pill' || med.dosageForm.toLowerCase().includes('capsule') || med.dosageForm.toLowerCase().includes('pill');
    } else if (selectedCategory === 'condoms') {
      matchesCategory = med.category === 'condoms' || med.formType === 'condom' || med.dosageForm.toLowerCase().includes('condom') || med.isDiscretePackaging === true;
    } else if (selectedCategory === 'cold-chain') {
      matchesCategory = !!med.isColdChain;
    } else if (selectedCategory === 'devices') {
      matchesCategory = med.category === 'devices' || med.formType === 'device';
    }

    let matchesCompany = true;
    if (selectedCompany && selectedCompany.trim()) {
      matchesCompany = med.manufacturer.toLowerCase().includes(selectedCompany.toLowerCase());
    }

    return matchesSearch && matchesCategory && matchesCompany;
  });

  const totalCartCount = Object.values(cartItemIds).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Top Search & Delivery Guarantee */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e7eeff] mb-4">
        <div className="relative flex items-center mb-2.5">
          <span className="material-symbols-outlined absolute left-3.5 text-[#70787d] text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by medicine, salt (e.g. Telmisartan, Insulin), or company..."
            className="w-full h-11 pl-11 pr-4 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[13px] text-[#111c2d] placeholder:text-[#bfc8cd] outline-none focus:border-[#0d5c75] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#70787d] hover:text-[#111c2d] text-sm cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Prescription Quick Upload Hook */}
        <div className="flex items-center justify-between p-2.5 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004357] text-lg">description</span>
            <span className="text-[12px] font-semibold text-[#004357]">Have a doctor prescription?</span>
          </div>
          <button
            onClick={onNavigateToPrescriptions}
            className="px-2.5 py-1 bg-[#0d5c75] text-white text-[11px] font-bold rounded-lg hover:bg-[#004357] cursor-pointer"
          >
            Upload Rx
          </button>
        </div>

        {/* Official Pharma Network Link Bar */}
        {onOpenPharmaPartners && (
          <div className="mt-2.5 pt-2.5 border-t border-[#f0f3ff] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#006c49] font-semibold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>12 Direct Pharmaceutical Company Links</span>
            </div>
            <button
              type="button"
              onClick={onOpenPharmaPartners}
              className="text-[11px] font-bold text-[#0d5c75] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Verify Batch &amp; Network</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        )}

        {/* CuraMed AI Clinical Suite Hook */}
        {onOpenAICenter && (
          <div className="mt-2.5 pt-2.5 border-t border-[#f0f3ff] flex items-center justify-between bg-gradient-to-r from-[#dee8ff]/30 to-[#6cf8bb]/15 -mx-4 -mb-4 p-3 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#004357]">neurology</span>
              <span className="text-[11.5px] font-bold text-[#004357]">
                AI Rx Digitizer &amp; Drug Interaction Safety Check
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenAICenter('pharmacist')}
              className="text-[11px] font-bold text-white bg-[#004357] hover:bg-[#0d5c75] px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Open AI Suite</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        )}
      </div>

      {/* Linked Pharma Companies Filter Ribbon */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#70787d] flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#004357]">factory</span>
            Filter by Pharma Company:
          </span>
          {selectedCompany && (
            <button
              onClick={() => onSelectCompany && onSelectCompany('')}
              className="text-[11px] font-bold text-[#ba1a1a] hover:underline cursor-pointer"
            >
              Clear Brand Filter (✕)
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {pharmaCompanies.map((c) => {
            const isSelected = selectedCompany
              ? selectedCompany.toLowerCase() === c.query.toLowerCase()
              : c.query === '';
            return (
              <button
                key={c.name}
                onClick={() => onSelectCompany && onSelectCompany(c.query)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#004357] text-white border-[#004357] shadow-xs'
                    : 'bg-white text-[#40484c] border-[#e7eeff] hover:bg-[#f0f3ff]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#0d5c75] text-white shadow-xs'
                : 'bg-white text-[#40484c] border border-[#e7eeff] hover:bg-[#f0f3ff]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Medicines List */}
      <div className="flex flex-col gap-3">
        {filteredMedicines.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#e7eeff]">
            <span className="material-symbols-outlined text-4xl text-[#70787d] mb-2">medication</span>
            <h3 className="text-[15px] font-bold text-[#111c2d]">No medications found</h3>
            <p className="text-[12px] text-[#70787d] mt-1 max-w-xs mx-auto">
              We supply all licensed schedule drugs across 28 Indian states. Try searching for generic salt or upload your prescription.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-4 py-2 bg-[#f0f3ff] text-[#004357] text-[12px] font-bold rounded-lg hover:bg-[#dee8ff] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const countInCart = cartItemIds[med.id] || 0;
            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl p-4 border border-[#e7eeff] shadow-xs flex flex-col justify-between transition-all hover:border-[#0d5c75]/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-[#70787d] tracking-wider">
                        {med.manufacturer}
                      </span>
                      <h3
                        onClick={() => setSelectedMedicineModal(med)}
                        className="text-[15px] font-bold text-[#111c2d] hover:text-[#004357] cursor-pointer leading-tight mt-0.5"
                      >
                        {med.name}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#f0f3ff] text-[#004357] text-[10px] font-bold border border-[#dee8ff]">
                          {med.dosageForm}
                        </span>
                        {med.requiresRx ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffdad6]/50 text-[#93000a] text-[10px] font-bold border border-[#ffdad6]">
                            Rx Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/20 text-[#006c49] text-[10px] font-bold">
                            OTC Genuine
                          </span>
                        )}
                      </div>

                      {med.isColdChain && (
                        <span className="px-2 py-0.5 rounded-full bg-[#dee8ff] text-[#004357] text-[10px] font-bold flex items-center gap-1 border border-[#90cfec]/40">
                          <span className="material-symbols-outlined text-[12px]">ac_unit</span>
                          2°C - 8°C Cold-Chain
                        </span>
                      )}

                      {med.isDiscretePackaging && (
                        <span className="px-2 py-0.5 rounded-full bg-[#f0f3ff] text-[#593600] text-[10px] font-bold flex items-center gap-1 border border-[#ffddb8]">
                          <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                          100% Discrete Packaging
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[12px] font-mono text-[#004357] font-medium mb-1">
                    {med.composition}
                  </p>
                  <p className="text-[11px] text-[#70787d] mb-1">{med.packSize}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#006c49] font-medium mb-2">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>Direct from {med.manufacturer.split(' ')[0]}</span>
                    <span className="text-[#70787d] text-[10px]">· WHO-GMP Certified</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#f0f3ff] flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[16px] font-bold text-[#111c2d] tabular-nums">
                      ₹{med.price}
                    </span>
                    <span className="text-[12px] text-[#70787d] line-through tabular-nums">
                      ₹{med.mrp}
                    </span>
                    <span className="text-[11px] font-bold text-[#006c49]">
                      {med.discount}% OFF
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMedicineModal(med)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-[#004357] hover:bg-[#f0f3ff] rounded-lg transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => onAddToCart(med)}
                      className={`h-9 px-3.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        countInCart > 0
                          ? 'bg-[#006c49] text-white'
                          : 'bg-[#0d5c75] text-white hover:bg-[#004357]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {countInCart > 0 ? 'check' : 'add'}
                      </span>
                      <span>{countInCart > 0 ? `Added (${countInCart})` : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar if items exist */}
      {totalCartCount > 0 && (
        <div className="sticky bottom-20 z-30 mt-4 animate-fade-in">
          <div className="bg-[#004357] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#6cf8bb] text-[#002113] flex items-center justify-center font-bold text-xs">
                {totalCartCount}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#93d3ef]">
                  {totalCartCount} item{totalCartCount > 1 ? 's' : ''} in cart
                </span>
                <span className="text-[10px] text-white/80">
                  Includes free cold-chain calibrated packaging
                </span>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-4 py-2 bg-[#6cf8bb] text-[#002113] text-[12px] font-bold rounded-xl hover:bg-[#4edea3] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Cart</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Medicine Info Modal */}
      {selectedMedicineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e7eeff] max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#70787d]">
                  {selectedMedicineModal.manufacturer}
                </span>
                <h3 className="text-[18px] font-bold text-[#111c2d] mt-0.5">
                  {selectedMedicineModal.name}
                </h3>
                <p className="text-[13px] text-[#004357] font-mono font-medium">
                  {selectedMedicineModal.composition}
                </p>
              </div>
              <button
                onClick={() => setSelectedMedicineModal(null)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#70787d] hover:text-[#111c2d] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedMedicineModal.isColdChain && (
              <div className="p-3 rounded-xl bg-[#dee8ff] text-[#004357] text-[12px] mb-3 flex items-start gap-2 border border-[#90cfec]/40">
                <span className="material-symbols-outlined text-lg shrink-0">ac_unit</span>
                <div>
                  <span className="font-bold">Cold-Chain Temperature Controlled (2°C - 8°C)</span>
                  <p className="text-[11px] text-[#0d5c75] mt-0.5">
                    Dispatched in calibrated gel-ice pack temperature containers with wireless NFC temperature logger for biological integrity.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 text-[13px] my-3">
              <div>
                <h4 className="text-[12px] font-bold text-[#70787d] uppercase tracking-wider mb-1">
                  Clinical Description
                </h4>
                <p className="text-[#111c2d] leading-relaxed">
                  {selectedMedicineModal.description}
                </p>
              </div>

              <div>
                <h4 className="text-[12px] font-bold text-[#70787d] uppercase tracking-wider mb-1">
                  Recommended Administration
                </h4>
                <p className="text-[#111c2d] bg-[#f0f3ff] p-2.5 rounded-xl border border-[#dee8ff]">
                  {selectedMedicineModal.dosageInstruction}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-2.5 bg-[#f9f9ff] rounded-xl border border-[#e7eeff]">
                  <span className="text-[#70787d] block text-[10px]">Regulation:</span>
                  <span className="font-bold text-[#004357]">
                    {selectedMedicineModal.scheduleH ? 'Schedule H (Rx Mandated)' : 'OTC Genuine'}
                  </span>
                </div>
                <div className="p-2.5 bg-[#f9f9ff] rounded-xl border border-[#e7eeff]">
                  <span className="text-[#70787d] block text-[10px]">Packaging:</span>
                  <span className="font-bold text-[#111c2d]">{selectedMedicineModal.packSize}</span>
                </div>
              </div>

              {/* Pharma Manufacturer Authenticity Ribbon */}
              <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#70787d] uppercase font-bold block">
                    Direct Manufacturer Supply
                  </span>
                  <span className="text-[12px] font-bold text-[#004357]">
                    {selectedMedicineModal.manufacturer}
                  </span>
                </div>
                {onOpenPharmaPartners && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedicineModal(null);
                      onOpenPharmaPartners();
                    }}
                    className="px-2.5 py-1 bg-[#0d5c75] text-white text-[11px] font-bold rounded-lg hover:bg-[#004357] cursor-pointer"
                  >
                    Verify Batch
                  </button>
                )}
              </div>

              {/* AI Generic Substitute Check */}
              {onOpenAICenter && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMedicineModal(null);
                    onOpenAICenter('generics');
                  }}
                  className="w-full py-2 bg-[#f0f9f5] hover:bg-[#e0f5eb] text-[#006c49] border border-[#006c49]/30 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">savings</span>
                  <span>Check Jan Aushadhi &amp; Generic Substitutes (Save up to 80%)</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-[#e7eeff] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#70787d]">Discounted Price</span>
                <div className="text-[18px] font-bold text-[#111c2d] tabular-nums">
                  ₹{selectedMedicineModal.price}{' '}
                  <span className="text-[12px] text-[#006c49]">({selectedMedicineModal.discount}% off)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(selectedMedicineModal);
                  setSelectedMedicineModal(null);
                }}
                className="px-5 py-2.5 bg-[#0d5c75] text-white rounded-xl text-[13px] font-bold hover:bg-[#004357] cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
