import React, { useState } from 'react';

interface AccountViewProps {
  currentPincode: string;
  onUpdatePincode: (pincode: string, locality: string, city: string) => void;
  onNavigateToStore: () => void;
  onNavigateToPrescriptions: () => void;
  onNavigateToOrders: () => void;
  onOpenSearch?: () => void;
  onOpenPharmaPartners?: () => void;
  onOpenAICenter?: (tab?: 'pharmacist' | 'interactions' | 'rx_scanner' | 'generics') => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentPincode,
  onUpdatePincode,
  onNavigateToStore,
  onNavigateToPrescriptions,
  onNavigateToOrders,
  onOpenSearch,
  onOpenPharmaPartners,
  onOpenAICenter,
}) => {
  // Screen mode: 'register_step1' | 'register_step2' | 'login' | 'profile'
  const [viewMode, setViewMode] = useState<'register_step1' | 'register_step2' | 'login' | 'profile'>('register_step1');

  // Form states
  const [fullName, setFullName] = useState('Dr. Rajesh Sundaram');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [email, setEmail] = useState('patient.name@example.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pincode, setPincode] = useState(currentPincode || '560038');
  const [pincodeMessage, setPincodeMessage] = useState('Delivers within 4 to 24 hrs across Bengaluru & Karnataka.');
  const [isPincodeValid, setIsPincodeValid] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Step 2 OTP & ABHA states
  const [otpCode, setOtpCode] = useState('');
  const [abhaId, setAbhaId] = useState('91-4920-8841-2910');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Type 2 Diabetes', 'Hypertension']);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('otp');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strengthScore = 0;
  if (hasMinLength) strengthScore++;
  if (hasNumber) strengthScore++;
  if (hasSymbol) strengthScore++;

  const getStrengthInfo = () => {
    if (!password) {
      return { label: 'Enter password', colorClass: 'text-[#70787d]', barColor: 'bg-[#70787d]', width: '0%' };
    }
    if (strengthScore === 1) {
      return { label: 'Weak', colorClass: 'text-[#ba1a1a]', barColor: 'bg-[#ba1a1a]', width: '33%' };
    }
    if (strengthScore === 2) {
      return { label: 'Moderate', colorClass: 'text-[#784b00]', barColor: 'bg-[#ffb95f]', width: '66%' };
    }
    return { label: 'Strong (Encrypted)', colorClass: 'text-[#006c49]', barColor: 'bg-[#006c49]', width: '100%' };
  };

  const strength = getStrengthInfo();

  // Pincode validation helper
  const handleCheckPincode = (code: string) => {
    const clean = code.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeMessage('Please enter a valid 6-digit Indian PIN code.');
      setIsPincodeValid(false);
      return;
    }

    if (clean.startsWith('560')) {
      setPincodeMessage('Delivers within 4 to 24 hrs across Bengaluru & Karnataka.');
      setIsPincodeValid(true);
      onUpdatePincode(clean, 'Indiranagar', 'Bengaluru');
    } else if (clean.startsWith('400')) {
      setPincodeMessage('Delivers within 6 to 24 hrs across Mumbai MMR.');
      setIsPincodeValid(true);
      onUpdatePincode(clean, 'Bandra', 'Mumbai');
    } else if (clean.startsWith('110')) {
      setPincodeMessage('Delivers within 6 to 24 hrs across Delhi NCR.');
      setIsPincodeValid(true);
      onUpdatePincode(clean, 'Connaught Place', 'Delhi');
    } else {
      setPincodeMessage('Pan-India Cold-Chain delivery within 24 to 48 hrs.');
      setIsPincodeValid(true);
      onUpdatePincode(clean, 'Local Center', 'India');
    }
    showToast(`Pincode ${clean} verified: ${pincodeMessage}`);
  };

  // Submission handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Please accept the Terms & DISHA Digital Health policies.');
      return;
    }
    setViewMode('register_step2');
    showToast(`OTP dispatched to +91 ${mobileNumber}`);
  };

  const handleVerifyOtp = () => {
    setViewMode('profile');
    showToast('Patient account verified & linked to ABDM Health ID!');
  };

  const handleSocialAuth = (provider: string) => {
    showToast(`Authenticating securely with ${provider}...`);
    setTimeout(() => {
      setViewMode('profile');
      showToast(`Welcome! Verified via ${provider}.`);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-22 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-[#111c2d] text-white text-[13px] px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-2 border border-white/10 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6cf8bb] text-sm">verified</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Quick Search Bar Option */}
      {onOpenSearch && (
        <div
          onClick={onOpenSearch}
          className="w-full mt-1 mb-2 bg-white border border-[#dee8ff] hover:border-[#0d5c75] p-2.5 px-3.5 rounded-2xl shadow-xs flex items-center justify-between gap-2.5 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[#004357] text-xl group-hover:scale-105 transition-transform">
              search
            </span>
            <span className="text-[13px] text-[#70787d] truncate group-hover:text-[#111c2d]">
              Search 50,000+ medicines, salts &amp; cold-chain supplies...
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#006c49] bg-[#6cf8bb]/30 px-2 py-0.5 rounded-full shrink-0">
            Search
          </span>
        </div>
      )}

      {/* Trust Ribbon */}
      <div className="w-full mt-1 mb-4">
        <div className="bg-[#f0f3ff] rounded-xl p-3 shadow-xs border border-[#e7eeff] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-[#6cf8bb]/40 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[#00714d] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
            </span>
            <span className="text-[12px] font-semibold text-[#004357] truncate">
              CDSCO Registered &amp; DISHA Compliant
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#006c49] px-2 py-0.5 rounded-full bg-[#6ffbbe]/50 shrink-0">
            {viewMode === 'profile' ? 'Verified Patient' : viewMode === 'register_step2' ? 'Step 2 of 2' : 'Step 1 of 2'}
          </span>
        </div>
      </div>

      {/* AI Clinical Suite Ribbon */}
      {onOpenAICenter && (
        <div className="w-full -mt-2 mb-4">
          <div className="bg-gradient-to-r from-[#004357] via-[#0d5c75] to-[#00556e] rounded-xl p-3 shadow-xs text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-[#6cf8bb]">
                <span className="material-symbols-outlined text-base">neurology</span>
              </span>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-white truncate">
                    CuraMed AI Clinical Care
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#6cf8bb] text-[#004357] text-[9px] font-extrabold uppercase">
                    Gemini 3.8
                  </span>
                </div>
                <span className="text-[10px] text-[#bde9ff] truncate">
                  AI Prescription OCR · Drug Interaction Checker · Generic Savings
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAICenter('pharmacist')}
              className="text-[11px] font-bold text-[#004357] bg-[#6cf8bb] hover:bg-[#5ae6ab] px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              Open AI
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d5c75] text-white p-5 shadow-md mb-5">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#004357]/40 pointer-events-none" />
        <div className="absolute right-4 top-4 text-[#93d3ef]/30 pointer-events-none select-none">
          <span className="material-symbols-outlined text-6xl">local_hospital</span>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#004357] text-[#bde9ff] text-[11px] font-bold mb-2 border border-white/10">
            <span className="material-symbols-outlined text-xs">shield</span>
            <span>Secure Patient Portal</span>
          </div>
          <h1 className="font-headline text-[24px] font-bold text-white mb-1.5 tracking-tight leading-tight">
            {viewMode === 'profile'
              ? 'Patient Health Dashboard'
              : viewMode === 'login'
              ? 'Welcome Back to CuraMed'
              : viewMode === 'register_step2'
              ? 'Verify ABHA & Instant OTP'
              : 'Create Patient Account'}
          </h1>
          <p className="text-[13px] text-[#93d3ef] leading-relaxed">
            {viewMode === 'profile'
              ? 'Manage digital prescriptions, active cold-chain refills, and state-registered doctor consults.'
              : 'Access verified prescription refills, doorstep pan-India delivery tracking, and licensed pharmacist consultations.'}
          </p>
        </div>
      </div>

      {/* VIEW: REGISTER STEP 1 (Mockup Screenshot Replica) */}
      {viewMode === 'register_step1' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] mb-5">
          <form className="flex flex-col gap-4" onSubmit={handleRegisterSubmit}>
            {/* Full Legal Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#111c2d] flex items-center justify-between" htmlFor="fullName">
                <span>Full Legal Name</span>
                <span className="text-[12px] font-normal text-[#70787d]">Required</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#70787d] text-xl pointer-events-none">
                  person
                </span>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sundaram"
                  className="w-full h-12 pl-11 pr-4 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[14px] text-[#111c2d] placeholder:text-[#bfc8cd] outline-none focus:bg-white focus:border-[#0d5c75] focus:ring-2 focus:ring-[#0d5c75]/15 transition-all"
                />
              </div>
              <p className="text-[12px] text-[#40484c] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#004357]">info</span>
                Must match government ID or prescription records.
              </p>
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-semibold text-[#111c2d]" htmlFor="mobileNumber">
                  Mobile Number
                </label>
                <span className="text-[11px] font-semibold text-[#006c49] bg-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
                  Instant OTP Verification
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1.5 text-[#111c2d] pointer-events-none select-none">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span className="text-[13px] font-bold text-[#111c2d]">+91</span>
                  <span className="w-[1px] h-5 bg-[#bfc8cd] ml-0.5" />
                </div>
                <input
                  id="mobileNumber"
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full h-12 pl-20 pr-4 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[14px] text-[#111c2d] placeholder:text-[#bfc8cd] outline-none focus:bg-white focus:border-[#0d5c75] focus:ring-2 focus:ring-[#0d5c75]/15 transition-all tracking-wider"
                />
              </div>
              <p className="text-[12px] text-[#40484c] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#006c49]">chat</span>
                Used for order dispatch alerts and WhatsApp refill reminders.
              </p>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#111c2d]" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#70787d] text-xl pointer-events-none">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient.name@example.com"
                  className="w-full h-12 pl-11 pr-4 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[14px] text-[#111c2d] placeholder:text-[#bfc8cd] outline-none focus:bg-white focus:border-[#0d5c75] focus:ring-2 focus:ring-[#0d5c75]/15 transition-all"
                />
              </div>
              <p className="text-[12px] text-[#40484c] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#004357]">receipt_long</span>
                For GST medical tax invoices and tele-consult notes.
              </p>
            </div>

            {/* Create Master Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#111c2d]" htmlFor="password">
                Create Master Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#70787d] text-xl pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-12 pl-11 pr-11 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[14px] text-[#111c2d] placeholder:text-[#bfc8cd] outline-none focus:bg-white focus:border-[#0d5c75] focus:ring-2 focus:ring-[#0d5c75]/15 transition-all"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#70787d] hover:text-[#111c2d] p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Strength Meter */}
              <div className="mt-1 flex flex-col gap-1.5 bg-[#f0f3ff] p-3 rounded-xl border border-[#dee8ff]">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#40484c]">Security Strength:</span>
                  <span className={`text-[12px] font-semibold ${strength.colorClass}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-[#d8e3fb] h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${strength.barColor} transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <span
                    className={`text-[11px] flex items-center gap-1 ${
                      hasMinLength ? 'text-[#006c49] font-semibold' : 'text-[#70787d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {hasMinLength ? 'check' : 'fiber_manual_record'}
                    </span>{' '}
                    8+ chars
                  </span>
                  <span
                    className={`text-[11px] flex items-center gap-1 ${
                      hasNumber ? 'text-[#006c49] font-semibold' : 'text-[#70787d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {hasNumber ? 'check' : 'fiber_manual_record'}
                    </span>{' '}
                    1 number
                  </span>
                  <span
                    className={`text-[11px] flex items-center gap-1 ${
                      hasSymbol ? 'text-[#006c49] font-semibold' : 'text-[#70787d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {hasSymbol ? 'check' : 'fiber_manual_record'}
                    </span>{' '}
                    1 symbol
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Delivery PIN Location helper */}
            <div className="bg-[#e7eeff]/60 border border-[#dee8ff] rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#004357] text-xl">pin_drop</span>
                  <span className="text-[13px] font-semibold text-[#111c2d]">Default Delivery Pincode</span>
                </div>
                <span className="text-[11px] font-semibold text-[#006c49] bg-[#6ffbbe]/50 px-2 py-0.5 rounded-full">
                  Pan-India Express
                </span>
              </div>
              <div className="relative flex items-center mt-1">
                <input
                  id="pincodeInput"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code"
                  className="w-full h-11 px-3.5 pr-20 bg-white border border-[#bfc8cd] rounded-xl text-[14px] text-[#111c2d] outline-none focus:border-[#0d5c75] focus:ring-2 focus:ring-[#0d5c75]/15"
                />
                <button
                  type="button"
                  onClick={() => handleCheckPincode(pincode)}
                  className="absolute right-1.5 px-3 py-1.5 bg-[#dee8ff] text-[#004357] text-[12px] font-bold rounded-lg hover:bg-[#d8e3fb] transition-colors cursor-pointer"
                >
                  Check
                </button>
              </div>
              <p className={`text-[12px] flex items-center gap-1 mt-0.5 ${isPincodeValid ? 'text-[#40484c]' : 'text-[#ba1a1a]'}`}>
                <span className={`material-symbols-outlined text-xs ${isPincodeValid ? 'text-[#006c49]' : 'text-[#ba1a1a]'}`}>
                  {isPincodeValid ? 'check_circle' : 'error'}
                </span>
                {pincodeMessage}
              </p>
            </div>

            {/* Health Data Privacy & Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="termsCheckbox"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="mt-1 w-5 h-5 rounded border-[#70787d] text-[#0d5c75] focus:ring-0 accent-[#0d5c75] cursor-pointer shrink-0"
                />
                <span className="text-[12px] text-[#111c2d] leading-relaxed">
                  I agree to the CuraMed{' '}
                  <span className="text-[#0d5c75] font-semibold underline">Terms of Service</span>{' '}
                  and consent to encrypted patient record storage per{' '}
                  <span className="text-[#0d5c75] font-semibold underline">
                    DISHA &amp; Digital Health Policies
                  </span>.
                </span>
              </label>
            </div>

            {/* Primary Action CTA */}
            <button
              type="submit"
              className="w-full h-12 bg-[#0d5c75] text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#004357] shadow-md active:scale-[0.99] transition-all mt-2 cursor-pointer"
            >
              <span>Create Account &amp; Continue</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>

            {/* Social Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full h-[1px] bg-[#e7eeff] absolute" />
              <span className="relative bg-white px-3 text-[11px] font-bold text-[#70787d] uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="h-11 px-3 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl flex items-center justify-center gap-2 hover:bg-[#e7eeff] text-[#111c2d] transition-colors shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.24 21.36 7.34 24 12 24z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.24 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-[13px] font-semibold">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('WhatsApp OTP')}
                className="h-11 px-3 bg-[#6cf8bb]/20 border border-[#6cf8bb]/40 text-[#00714d] rounded-xl flex items-center justify-center gap-2 hover:bg-[#6cf8bb]/40 transition-colors shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#006c49] text-lg">sms</span>
                <span className="text-[13px] font-semibold">WhatsApp OTP</span>
              </button>
            </div>

            {/* Log In Prompt */}
            <div className="text-center pt-2">
              <p className="text-[13px] text-[#40484c]">
                Already have a CuraMed profile?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-[13px] font-bold text-[#004357] hover:underline ml-1 cursor-pointer bg-transparent border-0 p-0"
                >
                  Log In here
                </button>
              </p>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: REGISTER STEP 2 (Instant OTP & ABHA Verification) */}
      {viewMode === 'register_step2' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] mb-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e7eeff]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('register_step1')}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#004357] hover:bg-[#dee8ff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
              </button>
              <h2 className="text-[16px] font-bold text-[#111c2d]">Step 2: Instant OTP &amp; ABHA</h2>
            </div>
            <span className="text-[11px] font-bold text-[#006c49] bg-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
              Safe Patient Auth
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#f0f3ff] p-3.5 rounded-xl border border-[#dee8ff]">
              <span className="text-[12px] text-[#40484c]">Verification code sent to</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[14px] font-bold text-[#111c2d]">+91 {mobileNumber}</span>
                <button
                  onClick={() => setViewMode('register_step1')}
                  className="text-[12px] font-semibold text-[#0d5c75] hover:underline cursor-pointer"
                >
                  Edit Number
                </button>
              </div>
            </div>

            {/* 6-Digit OTP */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#111c2d]">Enter 6-Digit Security OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="492015"
                className="w-full h-12 px-4 text-center tracking-[0.5em] text-lg font-bold bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[#111c2d] outline-none focus:border-[#0d5c75] focus:ring-2 focus:ring-[#0d5c75]/15"
              />
              <div className="flex items-center justify-between text-[11px] text-[#70787d] mt-1">
                <span>Didn't receive SMS?</span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode('492015');
                    showToast('Autofilled demo OTP: 492015');
                  }}
                  className="text-[#0d5c75] font-bold hover:underline cursor-pointer"
                >
                  Autofill Demo Code (492015)
                </button>
              </div>
            </div>

            {/* Ayushman Bharat Health Account (ABHA ID) */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#e7eeff]">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-[#111c2d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#004357] text-base">badge</span>
                  <span>Link Ayushman Bharat ID (ABHA)</span>
                </label>
                <span className="text-[10px] uppercase font-bold text-[#006c49] bg-[#6cf8bb]/30 px-1.5 py-0.5 rounded">
                  ABDM Compatible
                </span>
              </div>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="14-Digit ABHA / Health ID"
                className="w-full h-11 px-3.5 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[13px] text-[#111c2d] outline-none focus:border-[#0d5c75]"
              />
              <p className="text-[11px] text-[#70787d]">
                Allows automated sync of laboratory diagnostics and electronic health records with National Health Authority.
              </p>
            </div>

            {/* Health Profile Tags */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#e7eeff]">
              <label className="text-[13px] font-semibold text-[#111c2d]">Select Chronic Care Trackers</label>
              <div className="flex flex-wrap gap-1.5">
                {['Type 2 Diabetes', 'Hypertension', 'Thyroid Care', 'Cardiac Care', 'Cold-Chain Insulin'].map((cond) => {
                  const isSelected = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedConditions(selectedConditions.filter((c) => c !== cond));
                        } else {
                          setSelectedConditions([...selectedConditions, cond]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#0d5c75] text-white shadow-xs'
                          : 'bg-[#f0f3ff] text-[#40484c] hover:bg-[#dee8ff]'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full h-12 bg-[#0d5c75] text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#004357] shadow-md transition-all mt-2 cursor-pointer"
            >
              <span>Confirm &amp; Activate Patient Profile</span>
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: LOGIN MODE */}
      {viewMode === 'login' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] mb-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e7eeff]">
            <h2 className="text-[16px] font-bold text-[#111c2d]">Patient Log In</h2>
            <button
              onClick={() => setViewMode('register_step1')}
              className="text-[12px] font-semibold text-[#0d5c75] hover:underline cursor-pointer"
            >
              New Patient? Sign Up
            </button>
          </div>

          <div className="flex bg-[#f0f3ff] p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setLoginMethod('otp')}
              className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                loginMethod === 'otp' ? 'bg-white text-[#004357] shadow-xs' : 'text-[#70787d]'
              }`}
            >
              Fast OTP Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                loginMethod === 'password' ? 'bg-white text-[#004357] shadow-xs' : 'text-[#70787d]'
              }`}
            >
              Master Password
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setViewMode('profile');
              showToast('Logged in successfully!');
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#111c2d]">Registered Mobile / Email</label>
              <input
                type="text"
                required
                defaultValue={mobileNumber}
                placeholder="Enter mobile or email"
                className="w-full h-12 px-4 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[14px] text-[#111c2d] outline-none focus:border-[#0d5c75]"
              />
            </div>

            {loginMethod === 'password' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#111c2d]">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-12 px-4 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[14px] text-[#111c2d] outline-none focus:border-[#0d5c75]"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#111c2d]">6-Digit SMS / WhatsApp Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="492015"
                  defaultValue="492015"
                  className="w-full h-12 px-4 bg-[#f9f9ff] border border-[#e7eeff] rounded-xl text-[14px] text-[#111c2d] outline-none focus:border-[#0d5c75]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-[#0d5c75] text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#004357] shadow-md transition-all mt-1 cursor-pointer"
            >
              <span>Access Health Records</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>
        </div>
      )}

      {/* VIEW: LOGGED-IN PATIENT PROFILE & HEALTH DASHBOARD */}
      {viewMode === 'profile' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] mb-5">
          {/* Patient Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#004357] to-[#0d5c75] text-white shadow-md mb-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#bde9ff]">
                  National Digital Health Card
                </span>
                <h3 className="text-[18px] font-bold mt-0.5">{fullName || 'Dr. Rajesh Sundaram'}</h3>
                <p className="text-[12px] text-[#93d3ef] font-mono mt-0.5">ABHA: {abhaId}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center backdrop-blur-xs">
                <span className="material-symbols-outlined text-2xl text-[#6cf8bb]">health_and_safety</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-[#93d3ef]">
              <div>
                <span>Phone: </span>
                <span className="text-white font-semibold">+91 {mobileNumber}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/20 text-[#6cf8bb] font-bold">
                ✓ CDSCO Active
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={onNavigateToPrescriptions}
              className="p-3 rounded-xl bg-[#f0f3ff] text-left hover:bg-[#dee8ff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#004357] text-xl">prescriptions</span>
              <div className="text-[12px] font-bold text-[#111c2d] mt-1">Prescriptions</div>
              <div className="text-[10px] text-[#70787d]">3 Active Refills</div>
            </button>

            <button
              onClick={onNavigateToOrders}
              className="p-3 rounded-xl bg-[#f0f3ff] text-left hover:bg-[#dee8ff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#006c49] text-xl">package_2</span>
              <div className="text-[12px] font-bold text-[#111c2d] mt-1">Live Order</div>
              <div className="text-[10px] text-[#006c49] font-semibold">Cold-Chain 4.2°C</div>
            </button>

            <button
              onClick={onNavigateToStore}
              className="p-3 rounded-xl bg-[#f0f3ff] text-left hover:bg-[#dee8ff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#004357] text-xl">local_pharmacy</span>
              <div className="text-[12px] font-bold text-[#111c2d] mt-1">Medicine Store</div>
              <div className="text-[10px] text-[#70787d]">28 States Supply</div>
            </button>
          </div>

          {/* Primary Profile Details */}
          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex items-center justify-between py-2 border-b border-[#f0f3ff]">
              <span className="text-[#70787d]">Default Delivery Address</span>
              <span className="text-[#111c2d] font-semibold text-right max-w-[60%] truncate">
                Indiranagar, Bengaluru - {pincode}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#f0f3ff]">
              <span className="text-[#70787d]">Email for Invoices</span>
              <span className="text-[#111c2d] font-semibold">{email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#f0f3ff]">
              <span className="text-[#70787d]">WhatsApp Alerts</span>
              <span className="text-[#006c49] font-bold">Enabled (+91 {mobileNumber})</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#70787d]">Cold-Chain Packaging Sensor</span>
              <span className="text-[#004357] font-semibold">Automatic NFC Verification</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e7eeff] flex items-center justify-between">
            <button
              onClick={() => {
                setViewMode('register_step1');
                showToast('Switched to Registration form test mode');
              }}
              className="text-[12px] font-semibold text-[#0d5c75] hover:underline cursor-pointer"
            >
              ← Back to Registration Screen
            </button>
            <button
              onClick={() => {
                setViewMode('login');
                showToast('Signed out.');
              }}
              className="text-[12px] font-semibold text-[#ba1a1a] hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Medical Safety & Privacy Guarantees Grid (Matches Screenshot) */}
      <div className="bg-[#f0f3ff] rounded-2xl p-4 shadow-xs border border-[#dee8ff] mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#006c49] text-xl">verified</span>
          <h2 className="text-[15px] font-bold text-[#111c2d]">Your Data &amp; Prescription Safeguards</h2>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          <div className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-xs border border-[#e7eeff]">
            <div className="w-9 h-9 rounded-lg bg-[#dee8ff] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#004357] text-xl">enhanced_encryption</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#111c2d]">256-Bit Encrypted Health Records</span>
              <span className="text-[12px] text-[#70787d]">
                Stored according to National Digital Health Mission (ABDM) standards.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-xs border border-[#e7eeff]">
            <div className="w-9 h-9 rounded-lg bg-[#dee8ff] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#006c49] text-xl">play_pass</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#111c2d]">Pharmacist Controlled Dispensation</span>
              <span className="text-[12px] text-[#70787d]">
                Every prescription is verified by a state-registered chief pharmacist before packaging.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-xs border border-[#e7eeff]">
            <div className="w-9 h-9 rounded-lg bg-[#dee8ff] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#784b00] text-xl">local_shipping</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#111c2d]">Tamper-Evident Cold-Chain Shipping</span>
              <span className="text-[12px] text-[#70787d]">
                Temperature monitored packaging for sensitive drugs (e.g. Insulin, biologics).
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 bg-white p-3 rounded-xl shadow-xs border border-[#e7eeff]">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#6cf8bb]/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#006c49] text-xl">domain_verification</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#111c2d]">
                  12 Linked Pharmaceutical Manufacturers
                </span>
                <span className="text-[12px] text-[#70787d]">
                  Direct factory supply covenants with Cipla, Abbott, Sanofi, Glenmark, GSK &amp; more with live GS1 batch verification.
                </span>
              </div>
            </div>
            {onOpenPharmaPartners && (
              <button
                type="button"
                onClick={onOpenPharmaPartners}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#004357] text-[11px] font-bold transition-colors cursor-pointer self-center"
              >
                View Network
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification Help & Tele-Pharmacist Banner (Matches Screenshot) */}
      <div className="rounded-xl bg-[#d8e3fb]/40 border border-[#dee8ff] p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#6ffbbe] flex items-center justify-center shrink-0 text-[#002113]">
            <span className="material-symbols-outlined text-2xl">support_agent</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#111c2d] truncate">Need assistance signing up?</span>
            <span className="text-[12px] text-[#70787d] truncate">Call Toll-Free 1800-209-CURA (24x7)</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            showToast('Dialing 1800-209-CURA... Connecting to licensed clinical support.');
          }}
          className="shrink-0 px-3.5 py-1.5 rounded-lg bg-white text-[#004357] text-[12px] font-bold shadow-xs hover:bg-[#f0f3ff] transition-colors border border-[#e7eeff] cursor-pointer"
        >
          Call Now
        </button>
      </div>
    </div>
  );
};
