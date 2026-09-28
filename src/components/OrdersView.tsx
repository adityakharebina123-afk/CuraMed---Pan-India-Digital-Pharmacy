import React, { useState } from 'react';
import { Order } from '../data/mockData';

interface OrdersViewProps {
  order: Order;
  onNavigateToStore: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ order, onNavigateToStore }) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const steps = [
    { title: 'Order Placed & Rx Submitted', time: '09:30 AM', done: true },
    { title: 'Chief Pharmacist Verified', time: '10:12 AM', done: true, note: `By ${order.pharmacistSignature.name} (${order.pharmacistSignature.regNumber})` },
    { title: 'Cold-Chain Sealed & Calibrated', time: '10:40 AM', done: true, note: 'NFC Logger Activated (2-8°C Target)' },
    { title: 'Out for Express Delivery', time: '11:15 AM', done: true, active: true, note: 'Bengaluru Temperature Van #KA-03-MD-9012' },
    { title: 'Doorstep Delivery with Secure OTP', time: 'ETA 35 mins', done: false },
  ];

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Live Cold-Chain Tracker Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e7eeff] mb-4">
        <div className="flex items-start justify-between mb-3 pb-3 border-b border-[#e7eeff]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#70787d] tracking-wider">
              Live Express Shipment
            </span>
            <h2 className="text-[16px] font-bold text-[#111c2d] mt-0.5">{order.orderNumber}</h2>
            <p className="text-[11px] text-[#70787d]">Placed {order.orderDate}</p>
          </div>

          <div className="flex flex-col items-end">
            <span className="px-2.5 py-1 rounded-full bg-[#6cf8bb]/30 text-[#006c49] text-[11px] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-ping" />
              {order.eta}
            </span>
            <span className="text-[10px] text-[#70787d] mt-1">Express Delivery</span>
          </div>
        </div>

        {/* Cold-Chain Telemetry Dashboard */}
        {order.coldChainData && (
          <div className="bg-gradient-to-br from-[#004357] to-[#0d5c75] text-white p-4 rounded-xl mb-4 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#6cf8bb] text-xl">device_thermostat</span>
                <span className="text-[12px] font-bold text-white">Live Cold-Chain Telemetry</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/20 text-[#6cf8bb] text-[10px] font-bold">
                ✓ Safe Biological Range
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div>
                <div className="text-[32px] font-bold font-mono leading-none tabular-nums text-white">
                  {order.coldChainData.currentTemp}°C
                </div>
                <div className="text-[11px] text-[#93d3ef] mt-1">
                  Target Range: {order.coldChainData.minTemp}°C - {order.coldChainData.maxTemp}°C
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-mono text-[#bde9ff]">
                  ID: {order.coldChainData.loggerId}
                </div>
                <div className="text-[10px] text-[#93d3ef]">
                  Ping: {order.coldChainData.lastSensorPing}
                </div>
              </div>
            </div>

            {/* Sparkline / History bar */}
            <div className="mt-3 pt-3 border-t border-white/15">
              <span className="text-[10px] text-[#93d3ef] block mb-1">Temperature History Log:</span>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {order.coldChainData.tempHistory.map((item, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-1 backdrop-blur-xs">
                    <span className="text-[9px] text-[#bde9ff] block">{item.time}</span>
                    <span className="text-[11px] font-mono font-bold text-white">{item.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5-Step Visual Delivery Timeline */}
        <div className="py-2 mb-4">
          <h3 className="text-[13px] font-bold text-[#111c2d] mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#004357] text-lg">local_shipping</span>
            Fulfillment Journey
          </h3>

          <div className="flex flex-col gap-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#dee8ff]">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    step.done
                      ? step.active
                        ? 'bg-[#004357] text-white ring-4 ring-[#90cfec]/40'
                        : 'bg-[#006c49] text-white'
                      : 'bg-[#d8e3fb] text-[#70787d]'
                  }`}
                >
                  {step.done ? (step.active ? '●' : '✓') : '○'}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[12px] font-semibold ${
                      step.active ? 'text-[#004357] font-bold' : step.done ? 'text-[#111c2d]' : 'text-[#70787d]'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-[#70787d]">{step.time}</span>
                </div>
                {step.note && (
                  <span className="text-[10px] text-[#70787d] mt-0.5">{step.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0f3ff]">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="py-2.5 px-3 bg-[#f0f3ff] text-[#004357] rounded-xl text-[12px] font-bold hover:bg-[#dee8ff] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">receipt</span>
            <span>GST Tax Invoice</span>
          </button>

          <button
            onClick={() => setShowDriverModal(true)}
            className="py-2.5 px-3 bg-[#0d5c75] text-white rounded-xl text-[12px] font-bold hover:bg-[#004357] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">call</span>
            <span>Call Delivery Van</span>
          </button>
        </div>
      </div>

      {/* Package Contents */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e7eeff] mb-4">
        <h3 className="text-[14px] font-bold text-[#111c2d] mb-3">Package Items ({order.items.length})</h3>

        <div className="flex flex-col divide-y divide-[#f0f3ff]">
          {order.items.map((item, index) => (
            <div key={index} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#111c2d]">{item.medicineName}</span>
                  {item.isColdChain && (
                    <span className="px-1.5 py-0.2 rounded bg-[#dee8ff] text-[#004357] text-[9px] font-bold">
                      2-8°C
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#70787d] mt-0.5">
                  Batch: {item.batchNo} · Exp: {item.expiryDate} · Qty: {item.quantity}
                </div>
              </div>

              <span className="text-[13px] font-bold text-[#111c2d] tabular-nums">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-[#dee8ff] flex items-center justify-between text-[13px]">
          <span className="font-bold text-[#111c2d]">Total Amount Paid</span>
          <span className="font-bold text-[#004357] text-[16px] tabular-nums">
            ₹{order.totalAmount}
          </span>
        </div>
      </div>

      {/* Delivery Destination */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e7eeff] mb-4">
        <h3 className="text-[14px] font-bold text-[#111c2d] mb-2">Delivery Destination</h3>
        <p className="text-[13px] text-[#111c2d] font-semibold">{order.deliveryAddress.name}</p>
        <p className="text-[12px] text-[#70787d] mt-0.5">
          {order.deliveryAddress.addressLine}, {order.deliveryAddress.locality}
        </p>
        <p className="text-[12px] text-[#70787d]">
          {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
        </p>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e7eeff] max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#e7eeff]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#006c49]">Tax Invoice / Cash Memo</span>
                <h3 className="text-[16px] font-bold text-[#111c2d] mt-0.5">CuraMed India Pvt. Ltd.</h3>
                <span className="text-[11px] text-[#70787d]">GSTIN: 29AABCC1234F1Z6 · DL: KA-B2-98412</span>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#70787d] hover:text-[#111c2d] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-3 flex flex-col gap-2 text-[12px]">
              <div className="flex justify-between py-1 border-b border-[#f0f3ff]">
                <span className="text-[#70787d]">Invoice No:</span>
                <span className="font-mono font-bold text-[#111c2d]">INV-2026-84920</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f0f3ff]">
                <span className="text-[#70787d]">Patient Name:</span>
                <span className="font-bold text-[#111c2d]">{order.deliveryAddress.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f0f3ff]">
                <span className="text-[#70787d]">Verified Pharmacist:</span>
                <span className="text-[#004357] font-semibold">{order.pharmacistSignature.name} ({order.pharmacistSignature.regNumber})</span>
              </div>

              <div className="mt-2 pt-2 border-t border-[#dee8ff]">
                <span className="text-[11px] font-bold text-[#70787d] uppercase">Tax Breakup</span>
                <div className="flex justify-between text-[11px] mt-1 text-[#70787d]">
                  <span>Item Subtotal:</span>
                  <span>₹1,322.32</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#70787d]">
                  <span>CGST (6%):</span>
                  <span>₹79.34</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#70787d]">
                  <span>SGST (6%):</span>
                  <span>₹79.34</span>
                </div>
                <div className="flex justify-between text-[13px] font-bold text-[#111c2d] pt-2 border-t border-[#dee8ff] mt-2">
                  <span>Grand Total Paid:</span>
                  <span className="text-[#004357]">₹1,481.00</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInvoiceModal(false)}
              className="w-full mt-4 py-2.5 bg-[#0d5c75] text-white rounded-xl text-[13px] font-bold hover:bg-[#004357] cursor-pointer"
            >
              Download PDF Receipt
            </button>
          </div>
        </div>
      )}

      {/* Driver Simulation Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#e7eeff] text-center">
            <div className="w-14 h-14 rounded-full bg-[#f0f3ff] text-[#004357] mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl">local_shipping</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#111c2d]">CuraMed Cold-Van Dispatch</h3>
            <p className="text-[12px] text-[#70787d] mt-1">Driver: Manjunath K. (Verified Delivery Pilot)</p>
            <p className="text-[11px] text-[#006c49] font-semibold mt-1">Vehicle Temp: 4.2°C (Optimal)</p>

            <div className="mt-4 p-3 bg-[#f0f3ff] rounded-xl text-[12px] text-[#004357]">
              Dialing +91 94812 04921 directly to cold-chain dispatch vehicle...
            </div>

            <button
              onClick={() => setShowDriverModal(false)}
              className="w-full mt-4 py-2.5 bg-[#ba1a1a] text-white rounded-xl text-[13px] font-bold hover:bg-[#93000a] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
