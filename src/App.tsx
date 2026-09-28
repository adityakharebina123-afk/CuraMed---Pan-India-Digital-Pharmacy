import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { AccountView } from './components/AccountView';
import { StoreView } from './components/StoreView';
import { PrescriptionsView } from './components/PrescriptionsView';
import { ConsultView } from './components/ConsultView';
import { OrdersView } from './components/OrdersView';
import { LocationModal } from './components/LocationModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { PharmaPartnersModal } from './components/PharmaPartnersModal';
import { AICenterModal } from './components/AICenterModal';
import {
  INITIAL_MEDICINES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ORDER,
  Medicine,
  PrescriptionItem,
  Order,
} from './data/mockData';

export default function App() {
  // Navigation tab - Default to 'account' matching the screenshot
  const [activeTab, setActiveTab] = useState<TabKey>('account');

  // Location state
  const [currentLocation, setCurrentLocation] = useState({
    locality: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
  });

  // Modal states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPharmaModalOpen, setIsPharmaModalOpen] = useState(false);
  const [isAICenterOpen, setIsAICenterOpen] = useState(false);
  const [aiCenterInitialTab, setAiCenterInitialTab] = useState<'pharmacist' | 'interactions' | 'rx_scanner' | 'generics'>('pharmacist');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  // Data states
  const [medicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(INITIAL_PRESCRIPTIONS);
  const [activeOrder, setActiveOrder] = useState<Order>(INITIAL_ORDER);

  // Cart state: Record<medicineId, quantity>
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({
    'med-3': 1, // Lantus Insulin preloaded in cart
    'med-2': 1, // Glycomet GP2 preloaded in cart
  });

  const cartItems = Object.entries(cartQuantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, quantity]) => {
      const medicine = medicines.find((m) => m.id === id)!;
      return { medicine, quantity };
    })
    .filter((item) => !!item.medicine);

  const totalCartCount = Object.values(cartQuantities).reduce((acc, count) => acc + count, 0);

  // Cart operations
  const handleAddToCart = (medicine: Medicine) => {
    setCartQuantities((prev) => ({
      ...prev,
      [medicine.id]: (prev[medicine.id] || 0) + 1,
    }));
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartQuantities((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCartQuantities((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setActiveTab('orders');
  };

  // Prescription dosage mark
  const handleToggleDoseTaken = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, takenToday: !item.takenToday } : item
      )
    );
  };

  const handleRequestRefill = (item: PrescriptionItem) => {
    // Find matching catalog medicine or add sample
    const matched = medicines.find((m) =>
      m.name.toLowerCase().includes(item.medicineName.toLowerCase().split(' ')[0])
    );
    if (matched) {
      handleAddToCart(matched);
      setIsCartOpen(true);
    }
  };

  const handleOpenAICenter = (tab: 'pharmacist' | 'interactions' | 'rx_scanner' | 'generics' = 'pharmacist') => {
    setAiCenterInitialTab(tab);
    setIsAICenterOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col font-sans selection:bg-[#004357] selection:text-white">
      {/* Top Clinical Sticky Header */}
      <Header
        currentLocation={currentLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenNotifications={() => {
          setIsNotificationsModalOpen(true);
          setHasUnreadNotification(false);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPharmaPartners={() => setIsPharmaModalOpen(true)}
        onOpenAICenter={() => handleOpenAICenter('pharmacist')}
        onNavigateToAccount={() => setActiveTab('account')}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        hasUnreadNotification={hasUnreadNotification}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-md mx-auto pt-24 pb-20 px-4">
        {activeTab === 'account' && (
          <AccountView
            currentPincode={currentLocation.pincode}
            onUpdatePincode={(pincode, locality, city) => {
              setCurrentLocation({ pincode, locality, city });
            }}
            onNavigateToStore={() => setActiveTab('store')}
            onNavigateToPrescriptions={() => setActiveTab('prescriptions')}
            onNavigateToOrders={() => setActiveTab('orders')}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenPharmaPartners={() => setIsPharmaModalOpen(true)}
            onOpenAICenter={handleOpenAICenter}
          />
        )}

        {activeTab === 'store' && (
          <StoreView
            medicines={medicines}
            onAddToCart={handleAddToCart}
            cartItemIds={cartQuantities}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigateToPrescriptions={() => setActiveTab('prescriptions')}
            currentPincode={currentLocation.pincode}
            onOpenPharmaPartners={() => setIsPharmaModalOpen(true)}
            onOpenAICenter={handleOpenAICenter}
            selectedCompany={selectedCompany}
            onSelectCompany={(comp) => setSelectedCompany(comp)}
          />
        )}

        {activeTab === 'prescriptions' && (
          <PrescriptionsView
            prescriptions={prescriptions}
            onToggleDoseTaken={handleToggleDoseTaken}
            onRequestRefill={handleRequestRefill}
            onAddToCart={handleAddToCart}
            medicines={medicines}
            onOpenAICenter={handleOpenAICenter}
          />
        )}

        {activeTab === 'consult' && (
          <ConsultView onOpenAICenter={handleOpenAICenter} />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            order={activeOrder}
            onNavigateToStore={() => setActiveTab('store')}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        activeOrderCount={1}
        prescriptionAlertCount={0}
      />

      {/* AI Clinical Suite Modal (Powered by Gemini 3.8 Flash) */}
      <AICenterModal
        isOpen={isAICenterOpen}
        onClose={() => setIsAICenterOpen(false)}
        medicines={medicines}
        onAddToCart={handleAddToCart}
        cartItemNames={cartItems.map((i) => i.medicine.name)}
        initialTab={aiCenterInitialTab}
      />

      {/* Modals & Drawers */}
      <PharmaPartnersModal
        isOpen={isPharmaModalOpen}
        onClose={() => setIsPharmaModalOpen(false)}
        onSelectCompany={(companyName) => {
          setSelectedCompany(companyName);
          setActiveTab('store');
        }}
        medicines={medicines}
        onAddToCart={handleAddToCart}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        medicines={medicines}
        onAddToCart={handleAddToCart}
        onSelectMedicine={(_medicine) => {
          setActiveTab('store');
        }}
        cartItemIds={cartQuantities}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentPincode={currentLocation.pincode}
        onSelectLocation={(pincode, locality, city) => {
          setCurrentLocation({ pincode, locality, city });
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        deliveryAddress={currentLocation}
        onOpenAICenter={handleOpenAICenter}
      />
    </div>
  );
}
