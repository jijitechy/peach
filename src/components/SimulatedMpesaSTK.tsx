import { useState } from "react";
import { ShieldCheck, Smartphone, Send, Delete, X, Loader2 } from "lucide-react";

interface SimulatedMpesaSTKProps {
  amount: number;
  phone: string;
  listingTitle: string;
  onPaymentConfirmed: (receiptCode: string) => void;
  onCancel: () => void;
}

export default function SimulatedMpesaSTK({
  amount,
  phone,
  listingTitle,
  onPaymentConfirmed,
  onCancel
}: SimulatedMpesaSTKProps) {
  const [pin, setPin] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const handleAuthorize = async () => {
    if (pin.length !== 4) return;
    setIsProcessing(true);
    setStatusMessage("Authenticating STK callback handshake with Safaricom Daraja API...");
    
    // Simulate real network delay for payment callback processing
    setTimeout(() => {
      setStatusMessage("Authorizing KES escrow vault assignment...");
      setTimeout(() => {
        const receipt = "MPESA" + Math.random().toString(36).substring(2, 10).toUpperCase() + "K";
        onPaymentConfirmed(receipt);
        setIsProcessing(false);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-xs">
      <div className="bg-gray-100 rounded-3xl w-full max-w-[340px] shadow-2xl overflow-hidden border-4 border-gray-400 select-none">
        
        {/* Top Screen Status Bar */}
        <div className="bg-[#2B7A1C] text-white px-5 py-3 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] tracking-wider">SAFARICOM DARAJA SECURE</span>
          </div>
          <button onClick={onCancel} className="text-white hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Liquid crystal display simulating ancient M-Pesa prompt */}
        <div className="p-5 bg-white text-gray-800 rounded-b-2xl shadow-inner border-b border-gray-200">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center flex flex-col items-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png" 
              alt="M-Pesa Logo" 
              className="h-7 object-contain mb-2"
            />
            <div className="text-[11px] font-mono text-safaricom-green uppercase font-bold tracking-wide">
              Secure Escrow Lockbox
            </div>
          </div>

          <div className="mt-4 text-xs font-mono space-y-2 text-gray-600">
            <p className="font-sans leading-tight">
              Do you want to deposit <span className="font-bold text-gray-900">KES {amount.toLocaleString()}</span> to Peach Escrow for <span className="italic font-semibold text-gray-900">"{listingTitle}"</span>?
            </p>
            <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-200">
              <p className="text-[10px]">Mobile: <strong className="text-gray-800">{phone}</strong></p>
              <p className="text-[10px]">Recipient: <strong className="text-gray-800">Peach Trust Vault</strong></p>
            </div>
            <p className="text-center text-[10px] text-gray-400 font-sans mt-2">Enter your 4-digit M-Pesa PIN:</p>
          </div>

          {/* Secure masked PIN dots */}
          <div className="mt-3 flex justify-center gap-4">
            {[0, 1, 2, 3].map(idx => (
              <div 
                key={idx} 
                className={`w-4.5 h-4.5 rounded-full border-2 transition-all ${
                  pin.length > idx 
                    ? "bg-[#2B7A1C] border-[#2B7A1C] scale-110 shadow-md" 
                    : "bg-gray-50 border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* PIN Keyboard Pad */}
        <div className="p-4 bg-gray-200 text-gray-700">
          {isProcessing ? (
            <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-3">
              <Loader2 className="w-9 h-9 text-[#2B7A1C] animate-spin mb-3" />
              <p className="text-xs font-semibold text-gray-800 leading-tight">{statusMessage}</p>
              <p className="text-[10px] text-gray-400 mt-2">Please do not exit this window. Handshaking is secure.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(key => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className="bg-white hover:bg-gray-50 active:bg-gray-350 py-3 rounded-xl font-bold text-lg text-gray-800 shadow-xs border border-gray-300 transition-transform active:scale-95"
                >
                  {key}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="bg-gray-300 hover:bg-gray-350 active:bg-gray-400 py-3 rounded-xl font-sans text-xs font-bold shadow-xs transition-transform active:scale-95"
              >
                Clear
              </button>
              <button
                onClick={() => handleKeyPress("0")}
                className="bg-white hover:bg-gray-50 active:bg-gray-350 py-3 rounded-xl font-bold text-lg text-gray-800 shadow-xs border border-gray-300 transition-transform active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="bg-gray-300 hover:bg-gray-350 active:bg-gray-400 py-3 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center"
              >
                <Delete className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* STK cancel and confirmation triggers */}
              <button
                onClick={onCancel}
                className="col-span-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthorize}
                disabled={pin.length !== 4}
                className={`col-span-2 py-3 rounded-xl font-bold font-sans text-sm shadow-md transition-transform flex items-center justify-center gap-1.5 active:scale-95 ${
                  pin.length === 4 
                    ? "bg-[#2B7A1C] hover:bg-emerald-700 text-white" 
                    : "bg-gray-300 text-gray-400 cursor-not-allowed border border-gray-400"
                }`}
              >
                <Send className="w-4 h-4" /> Pay KES {amount.toLocaleString()}
              </button>
            </div>
          )}
        </div>

        {/* Security watermark footer */}
        <div className="bg-gray-300 text-[10px] text-gray-500 text-center py-2 border-t border-gray-350 select-none">
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2B7A1C]" />
            <span>256-bit AES Safaricom Vault Encrypted</span>
          </div>
        </div>

      </div>
    </div>
  );
}
