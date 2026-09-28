import React from 'react';

interface HeaderProps {
  currentLocation: {
    locality: string;
    city: string;
    pincode: string;
  };
  onOpenLocationModal: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenPharmaPartners: () => void;
  onOpenAICenter: () => void;
  onNavigateToAccount: () => void;
  cartCount: number;
  onOpenCart: () => void;
  hasUnreadNotification: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onOpenLocationModal,
  onOpenNotifications,
  onOpenSearch,
  onOpenPharmaPartners,
  onOpenAICenter,
  onNavigateToAccount,
  cartCount,
  onOpenCart,
  hasUnreadNotification,
}) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-[#f9f9ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e7eeff]">
      <div className="max-w-md mx-auto h-20 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            alt="CuraMed Pharmacy Logo"
            className="h-8 w-auto object-contain shrink-0 cursor-pointer"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VE7dMIN6z8eToHiEmrykFl-KdatlvOWqSuJEErKCOyjoIHq1IJ3ZvE7CtnODTr0Nu9Osb0yLIAcfkclBsI0c3W7W_jNGBEl9PFV7VoSL_2n8cnQtAw1LaaLuiba6UyB4mUeSPkLRmBIP6fDClB4E-fwOV8o8S9-7jP2UWLqgs_QhbmDM-o9m2NqrspOpGBKk9IBhvlk0UohWWcI7sFOBk5csoM6wOMu3snz-Lyj6UuxqicOrgcNVeVTrc"
            onClick={onNavigateToAccount}
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-[#004357] font-bold uppercase tracking-wider">
                CuraMed
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#6cf8bb]/40 text-[#006c49] text-[10px] leading-tight font-semibold tracking-wide">
                Pan-India
              </span>
            </div>
            <button
              onClick={onOpenLocationModal}
              className="flex items-center gap-0.5 text-left min-w-0 group mt-0.5 cursor-pointer text-inherit border-0 bg-transparent p-0"
              title="Change Delivery Location"
            >
              <span className="material-symbols-outlined text-[#006c49] shrink-0 text-base">
                location_on
              </span>
              <div className="flex flex-col min-w-0 leading-none">
                <span className="text-[10px] text-[#70787d] leading-tight">Deliver to:</span>
                <span className="text-[12px] font-semibold text-[#111c2d] truncate group-hover:text-[#004357] transition-colors">
                  {currentLocation.locality}, {currentLocation.city} - {currentLocation.pincode}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#70787d] shrink-0 text-sm ml-0.5 group-hover:translate-y-0.5 transition-transform">
                expand_more
              </span>
            </button>
            <span className="text-[10px] text-[#70787d] truncate mt-0.5">
              Serving 28 States &amp; UTs (All Towns &amp; Villages)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* AI Clinical Suite button */}
          <button
            aria-label="CuraMed AI Clinical Suite"
            onClick={onOpenAICenter}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#004357] bg-[#dee8ff]/50 hover:bg-[#dee8ff] transition-colors cursor-pointer relative"
            title="CuraMed AI Clinical Suite (Gemini 3.8 Flash)"
          >
            <span className="material-symbols-outlined text-xl text-[#004357]">neurology</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#006c49] ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Pharma Partners Network button */}
          <button
            aria-label="Pharma Partners"
            onClick={onOpenPharmaPartners}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#40484c] hover:bg-[#e7eeff] hover:text-[#004357] transition-colors cursor-pointer relative"
            title="Official Pharma Companies Network & Batch Verification"
          >
            <span className="material-symbols-outlined text-xl">domain_verification</span>
            <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#006c49]"></span>
          </button>

          {/* Global Search button */}
          <button
            aria-label="Search Medicines"
            onClick={onOpenSearch}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#40484c] hover:bg-[#e7eeff] hover:text-[#004357] transition-colors cursor-pointer"
            title="Search Medicines, Salts & Prescriptions"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>

          {/* Cart Icon button */}
          <button
            aria-label="View Cart"
            onClick={onOpenCart}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#40484c] hover:bg-[#e7eeff] transition-colors relative cursor-pointer"
            title="Shopping Cart"
          >
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#0d5c75] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notifications button */}
          <button
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#40484c] hover:bg-[#e7eeff] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {hasUnreadNotification && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#f9f9ff]"></span>
            )}
          </button>

          {/* Profile avatar button */}
          <button
            aria-label="Profile"
            onClick={onNavigateToAccount}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 hover:ring-[#0d5c75]/30 transition-all p-0.5 cursor-pointer"
            title="Account & Patient Profile"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shadow-xs border border-white"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAawbVj7hCYafb3Ipc-fVE8mD9vnaWm_xVJMs41ldlnRYU15OgOJun3t1maHQCYIcFQGZhJLgRag3asYN6CdR9nmebs4Ral42v0ODoRJ5I1pUWrgKruuDR3nwBPdl9Q2cjfoPtQvi6FrOMb3Az5HSgCqg_eusUBiMnJSo54mRJriFHuNS-zuAfqYSl01vivu87ZBKc1xy_cDENctYc2nbOfi4qrJoM8UGRn7i3sQEJtP9rmCuEghKsv"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
