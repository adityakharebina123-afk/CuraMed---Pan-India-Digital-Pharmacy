import React from 'react';

export type TabKey = 'store' | 'prescriptions' | 'consult' | 'orders' | 'account';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  activeOrderCount?: number;
  prescriptionAlertCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  activeOrderCount = 1,
  prescriptionAlertCount = 0,
}) => {
  const tabs = [
    {
      id: 'store' as TabKey,
      label: 'Store',
      icon: 'local_pharmacy',
      badge: null,
    },
    {
      id: 'prescriptions' as TabKey,
      label: 'Prescriptions',
      icon: 'prescriptions',
      badge: prescriptionAlertCount > 0 ? prescriptionAlertCount : null,
    },
    {
      id: 'consult' as TabKey,
      label: 'Consult',
      icon: 'medical_services',
      badge: null,
    },
    {
      id: 'orders' as TabKey,
      label: 'Orders',
      icon: 'package_2',
      badge: activeOrderCount > 0 ? 'Live' : null,
    },
    {
      id: 'account' as TabKey,
      label: 'Account',
      icon: 'person',
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#f9f9ff]/95 backdrop-blur-xl border-t border-[#e7eeff] shadow-[0_-2px_12px_rgba(13,92,117,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto h-16 px-1 grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 h-12 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#004357] font-semibold'
                  : 'text-[#40484c] hover:text-[#004357]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[22px] transition-transform duration-200"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {tab.icon}
                </span>

                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full text-white leading-tight ${
                      tab.badge === 'Live' ? 'bg-[#006c49] animate-pulse' : 'bg-[#ba1a1a]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] leading-tight tracking-tight transition-colors ${
                  isActive ? 'text-[#004357] font-semibold' : 'text-[#70787d]'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d5c75] absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
