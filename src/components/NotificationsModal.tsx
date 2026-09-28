import React from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'orders' | 'prescriptions' | 'consult') => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Cold-Chain Delivery En Route',
      message: 'Your Lantus Solostar Insulin is arriving in 35 mins. Current container temperature is 4.2°C (Optimal).',
      time: '12 mins ago',
      type: 'delivery',
      target: 'orders' as const,
      icon: 'local_shipping',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Refill Due in 4 Days',
      message: 'Your 90-day course of Telma 40mg is ending soon. Tap to order 1-tap scheduled refill.',
      time: '2 hours ago',
      type: 'refill',
      target: 'prescriptions' as const,
      icon: 'event_repeat',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'Pharmacist Review Completed',
      message: 'Sneha Patel, Chief Pharmacist (KA-PH-49201), verified your electronic prescription records.',
      time: 'Yesterday',
      type: 'clinical',
      target: 'consult' as const,
      icon: 'verified',
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e7eeff] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#e7eeff] mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004357] text-2xl">notifications</span>
            <h3 className="text-[16px] font-bold text-[#111c2d]">Clinical Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#70787d] hover:text-[#111c2d] flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onNavigateToTab(n.target);
                onClose();
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                n.unread
                  ? 'bg-[#f0f3ff] border-[#0d5c75]/30'
                  : 'bg-white border-[#e7eeff] hover:bg-[#f9f9ff]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#dee8ff] text-[#004357] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-lg">{n.icon}</span>
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#111c2d] truncate">{n.title}</span>
                  <span className="text-[10px] text-[#70787d] shrink-0 ml-1">{n.time}</span>
                </div>
                <p className="text-[11px] text-[#40484c] mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
