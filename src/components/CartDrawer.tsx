import React, { useState } from 'react';
import { Medicine } from '../data/mockData';
import { checkDrugInteractions, DrugInteractionResult } from '../services/aiService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { medicine: Medicine; quantity: number }[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  deliveryAddress: { locality: string; city: string; pincode: string };
  onOpenAICenter?: (tab?: 'pharmacist' | 'interactions' | 'rx_scanner' | 'generics') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  deliveryAddress,
  onOpenAICenter,
}) => {
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyResult, setSafetyResult] = useState<DrugInteractionResult | null>(null);

  if (!isOpen) return null;

  const itemTotal = cartItems.reduce((acc, curr) => acc + curr.medicine.price * curr.quantity, 0);
  const mrpTotal = cartItems.reduce((acc, curr) => acc + curr.medicine.mrp * curr.quantity, 0);
  const savings = mrpTotal - itemTotal;
  const deliveryFee = itemTotal > 499 ? 0 : 40;
  const finalTotal = itemTotal + deliveryFee;

  const hasColdChain = cartItems.some((i) => i.medicine.isColdChain);
  const hasRx = cartItems.some((i) => i.medicine.requiresRx);
  const hasDiscrete = cartItems.some((i) => i.medicine.isDiscretePackaging || i.medicine.category === 'condoms');

  const handleRunCartSafetyCheck = async () => {
    if (cartItems.length < 2) return;
    setIsCheckingSafety(true);
    try {
      const names = cartItems.map((i) => i.medicine.name);
      const res = await checkDrugInteractions(names);
      setSafetyResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingSafety(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e7eeff] max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7eeff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004357] text-2xl">shopping_bag</span>
            <h3 className="text-[16px] font-bold text-[#111c2d]">Your Medical Cart</h3>
            <span className="text-[11px] font-bold text-[#0d5c75] bg-[#dee8ff] px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#70787d] hover:text-[#111c2d] flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#70787d] mb-3">
              <span className="material-symbols-outlined text-3xl">remove_shopping_cart</span>
            </div>
            <h4 className="text-[15px] font-bold text-[#111c2d]">Your cart is empty</h4>
            <p className="text-[12px] text-[#70787d] mt-1 max-w-xs">
              Explore essential tablets, syrups, pills, condoms &amp; cold-chain insulins.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-[#f0f3ff] my-2 pr-1">
            {/* Notices */}
            {hasColdChain && (
              <div className="p-3 mb-2 rounded-xl bg-[#004357] text-white text-[12px] flex items-center gap-2 shadow-xs">
                <span className="material-symbols-outlined text-base text-[#6cf8bb]">ac_unit</span>
                <span><strong>Calibrated Cold-Chain Pack (2°C–8°C):</strong> Auto-applied with phase-change coolants.</span>
              </div>
            )}

            {hasDiscrete && (
              <div className="p-3 mb-2 rounded-xl bg-[#f0f3ff] text-[#593600] text-[12px] flex items-center gap-2 border border-[#ffddb8]">
                <span className="material-symbols-outlined text-base text-[#593600]">inventory_2</span>
                <span><strong>100% Discrete Packaging:</strong> Plain brown box, zero product markings on external label.</span>
              </div>
            )}

            {hasRx && (
              <div className="p-3 mb-2 rounded-xl bg-[#f0f3ff] text-[#784b00] text-[12px] flex items-center gap-2 border border-[#ffbd6b]/40">
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>Prescription required. Chief Pharmacist will verify during packing.</span>
              </div>
            )}

            {/* AI Cart Safety Check Card (Available when 2+ items) */}
            {cartItems.length >= 2 && (
              <div className="p-3 mb-3 rounded-2xl bg-gradient-to-r from-[#eef7fa] to-[#f0f4ff] border border-[#0d5c75]/25">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#004357] text-lg">neurology</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-[#004357]">AI Drug Safety Check</span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-[#004357] text-[#6cf8bb] rounded-full uppercase">
                          Gemini 3.8
                        </span>
                      </div>
                      <span className="text-[10px] text-[#70787d]">
                        Scan {cartItems.length} medications for interactions
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleRunCartSafetyCheck}
                    disabled={isCheckingSafety}
                    className="px-3 py-1 bg-[#004357] hover:bg-[#0d5c75] disabled:opacity-50 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    {isCheckingSafety ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xs">shield</span>
                        <span>Verify Safety</span>
                      </>
                    )}
                  </button>
                </div>

                {safetyResult && (
                  <div className="mt-2.5 pt-2 border-t border-[#0d5c75]/15 text-[11px] animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111c2d]">Risk Assessment:</span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded-full text-[10px] ${
                          safetyResult.overallRisk === 'Low'
                            ? 'bg-[#006c49] text-white'
                            : safetyResult.overallRisk === 'Moderate'
                            ? 'bg-[#d97706] text-white'
                            : 'bg-[#ba1a1a] text-white'
                        }`}
                      >
                        {safetyResult.overallRisk} Risk
                      </span>
                    </div>
                    <p className="text-[#40484c] mt-1 leading-snug">{safetyResult.summary}</p>
                    {onOpenAICenter && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAICenter('interactions');
                        }}
                        className="mt-1 text-[#004357] font-bold text-[10.5px] hover:underline cursor-pointer block"
                      >
                        View full dosage schedule &amp; mechanism in AI Suite →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="flex flex-col gap-3 py-2">
              {cartItems.map(({ medicine, quantity }) => (
                <div key={medicine.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="flex flex-col flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-[#111c2d] truncate">{medicine.name}</h4>
                    <span className="text-[11px] text-[#70787d]">{medicine.packSize}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[13px] font-bold text-[#111c2d] tabular-nums">
                        ₹{medicine.price * quantity}
                      </span>
                      <span className="text-[11px] text-[#70787d] line-through tabular-nums">
                        ₹{medicine.mrp * quantity}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-1.5 bg-[#f0f3ff] rounded-xl p-1 border border-[#dee8ff]">
                    <button
                      onClick={() => {
                        if (quantity === 1) onRemoveItem(medicine.id);
                        else onUpdateQuantity(medicine.id, -1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white text-[#111c2d] flex items-center justify-center text-sm font-bold shadow-xs hover:bg-[#dee8ff] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-[12px] font-bold text-[#004357] px-2 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(medicine.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white text-[#111c2d] flex items-center justify-center text-sm font-bold shadow-xs hover:bg-[#dee8ff] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address Preview */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase text-[#70787d]">Delivering to:</span>
              <p className="text-[12px] text-[#111c2d] font-semibold mt-0.5">
                {deliveryAddress.locality}, {deliveryAddress.city} - {deliveryAddress.pincode}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 flex flex-col gap-1.5 text-[12px]">
              <div className="flex justify-between text-[#70787d]">
                <span>Item Subtotal</span>
                <span className="tabular-nums">₹{itemTotal}</span>
              </div>
              <div className="flex justify-between text-[#006c49]">
                <span>Total Discount</span>
                <span className="tabular-nums">- ₹{savings}</span>
              </div>
              <div className="flex justify-between text-[#70787d]">
                <span>Delivery Fee</span>
                <span className="tabular-nums font-semibold">
                  {deliveryFee === 0 ? <span className="text-[#006c49]">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              {hasColdChain && (
                <div className="flex justify-between text-[#004357] text-[11px]">
                  <span>❄️ Calibrated 2°C–8°C Pack</span>
                  <span className="font-bold text-[#006c49]">FREE</span>
                </div>
              )}
              <div className="flex justify-between text-[14px] font-bold text-[#111c2d] pt-2 border-t border-[#e7eeff]">
                <span>To Pay</span>
                <span className="tabular-nums text-[#004357]">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="pt-3 border-t border-[#e7eeff] flex flex-col gap-2">
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-[#004357] text-white text-[14px] font-bold rounded-xl hover:bg-[#0d5c75] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Proceed to Express Checkout</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <span className="text-[10px] text-[#70787d] text-center">
              CDSCO Verified Pharmacy Partner · Free returns on cold-chain defect
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
