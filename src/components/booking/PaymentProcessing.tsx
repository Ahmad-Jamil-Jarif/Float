import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PaymentProcessingProps {
  amount: number;
  onPaymentSuccess: (paymentDetails: {
    method: 'card' | 'apple_pay' | 'pay_at_resort';
    transactionId: string;
    cardLast4?: string;
  }) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  amount,
  onPaymentSuccess,
  isProcessing,
  setIsProcessing,
}) => {
  const [method, setMethod] = useState<'card' | 'apple_pay' | 'pay_at_resort'>('card');
  const [cardNumber, setCardNumber] = useState('4242 8490 2948 5192');
  const [cardName, setCardName] = useState('Elena Rostova');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('482');
  const [error, setError] = useState<string | null>(null);

  // 3D Secure simulation modal
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [otpCode, setOtpCode] = useState('7492');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isVerifying3DS, setIsVerifying3DS] = useState(false);

  // Determine card brand from number
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'text-blue-400' };
    if (clean.startsWith('5')) return { name: 'Mastercard', color: 'text-amber-400' };
    if (clean.startsWith('3')) return { name: 'Amex', color: 'text-cyan-400' };
    return { name: 'Card', color: 'text-white/60' };
  };

  const cardBrand = getCardBrand(cardNumber);

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter the 3 or 4-digit CVV code on the back of your card.');
        return;
      }

      // Trigger 3D-Secure modal for bank-level card verification
      setShow3DSModal(true);
      return;
    }

    if (method === 'apple_pay') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess({
          method: 'apple_pay',
          transactionId: 'TXN_APL_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          cardLast4: '8819',
        });
      }, 1400);
      return;
    }

    if (method === 'pay_at_resort') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess({
          method: 'pay_at_resort',
          transactionId: 'TXN_RESORT_GTEE_' + Math.random().toString(36).substring(2, 9).toUpperACE(),
          cardLast4: cardNumber.replace(/\s+/g, '').slice(-4),
        });
      }, 1000);
      return;
    }
  };

  const handleComplete3DS = () => {
    setIsVerifying3DS(true);
    setTimeout(() => {
      setIsVerifying3DS(false);
      setShow3DSModal(false);
      onPaymentSuccess({
        method: 'card',
        transactionId: 'TXN_PCI_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        cardLast4: cardNumber.replace(/\s+/g, '').slice(-4),
      });
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Payment Method Selector */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          id="pay-method-card"
          onClick={() => setMethod('card')}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            method === 'card'
              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
              : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard className={`w-5 h-5 ${method === 'card' ? 'text-[#d4af37]' : ''}`} />
          <span className="text-xs font-medium">Credit Card</span>
        </button>

        <button
          type="button"
          id="pay-method-apple"
          onClick={() => setMethod('apple_pay')}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            method === 'apple_pay'
              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
              : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Smartphone className={`w-5 h-5 ${method === 'apple_pay' ? 'text-[#d4af37]' : ''}`} />
          <span className="text-xs font-medium">Apple Pay</span>
        </button>

        <button
          type="button"
          id="pay-method-resort"
          onClick={() => setMethod('pay_at_resort')}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            method === 'pay_at_resort'
              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
              : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building className={`w-5 h-5 ${method === 'pay_at_resort' ? 'text-[#d4af37]' : ''}`} />
          <span className="text-xs font-medium">Pay at Resort</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Credit Card Form */}
      {method === 'card' && (
        <div className="space-y-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/70">Cardholder Name</label>
            </div>
            <input
              type="text"
              id="input-card-name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-[#d4af37]"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/70">Card Number</label>
              <span className={`text-xs font-semibold ${cardBrand.color}`}>{cardBrand.name}</span>
            </div>
            <div className="relative">
              <input
                type="text"
                id="input-card-number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-meta focus:outline-none focus:border-[#d4af37]"
                required
              />
              <Lock className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Expiry Date</label>
              <input
                type="text"
                id="input-card-expiry"
                value={cardExpiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-meta text-center focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-white/70">Security CVV</label>
                <HelpCircle className="w-3.5 h-3.5 text-white/40" title="3 digits on back of card" />
              </div>
              <input
                type="password"
                id="input-card-cvv"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-meta text-center focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Apple Pay notice */}
      {method === 'apple_pay' && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white">
            <Smartphone className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-medium text-white">Biometric One-Touch Checkout</h4>
          <p className="text-xs text-white/60 max-w-sm mx-auto">
            Authorize securely using Touch ID, Face ID, or Passcode. Your card number is never shared with the resort.
          </p>
        </div>
      )}

      {/* Pay at Resort notice */}
      {method === 'pay_at_resort' && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center mx-auto text-[#d4af37]">
            <Building className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-medium text-white">Reserve Now · Pay Upon Arrival</h4>
          <p className="text-xs text-white/60 max-w-sm mx-auto">
            We hold your villa immediately with zero advance charge. Settled at check-in via cash, card, or room charge.
          </p>
        </div>
      )}

      {/* PCI Security Badges */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/50">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PCI-DSS Level 1 Encrypted</span>
        </div>
        <span>256-Bit SSL Secured</span>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        id="btn-process-payment"
        disabled={isProcessing}
        onClick={handleInitiatePayment}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e6c65c] to-[#d4af37] text-black font-semibold text-sm shadow-xl shadow-[#d4af37]/25 hover:shadow-[#d4af37]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Lock className="w-4 h-4 text-black" />
        <span>
          {isProcessing
            ? 'Authorizing Secure Payment...'
            : method === 'pay_at_resort'
            ? `Guarantee Stay ($${amount.toFixed(2)})`
            : `Pay & Confirm $${amount.toFixed(2)} USD`}
        </span>
      </button>

      {/* 3D-Secure Simulated Bank Verification Challenge Modal */}
      {show3DSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0e171f] border border-[#d4af37]/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-meta text-xs uppercase tracking-wider text-white font-semibold">
                  Bank 3D-Secure 2.0 Check
                </span>
              </div>
              <span className="text-[10px] text-white/40">Verified by Visa</span>
            </div>

            <p className="text-xs text-white/70">
              For your protection, your issuing bank has generated an authentication code sent to your registered mobile device ending in **-9201.
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/60">Amount Authorized:</span>
              <span className="font-semibold text-emerald-400">${amount.toFixed(2)} USD</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/80 block">Enter One-Time Passcode (OTP)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="input-3ds-otp"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder={`Demo OTP: ${otpCode}`}
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white font-meta text-center tracking-widest text-base focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={() => setEnteredOtp(otpCode)}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover-bg-white/20 text-xs text-[#d4af37] font-medium whitespace-nowrap cursor-pointer"
                >
                  Fill Demo
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShow3DSModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-white/15 text-xs text-white/60 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-3ds"
                disabled={isVerifying3DS}
                onClick={handleComplete3DS}
                className="w-1/2 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-semibold shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isVerifying3DS ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}