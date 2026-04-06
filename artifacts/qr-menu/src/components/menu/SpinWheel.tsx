import { useState } from "react";
import { X, Gift } from "lucide-react";

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIZES = [
  { label: "10% OFF", color: "#FBBF24" }, // amber-400
  { label: "NO LUCK", color: "#F87171" }, // red-400
  { label: "FREE FRIES", color: "#34D399" }, // emerald-400
  { label: "TRY AGAIN", color: "#9CA3AF" }, // gray-400
  { label: "20% OFF", color: "#60A5FA" }, // blue-400
  { label: "FREE DRINK", color: "#A78BFA" }, // purple-400
];

export function SpinWheel({ isOpen, onClose }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Randomize winning index
    const winIndex = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = 360 / PRIZES.length;
    
    // We want the winning slice to land at the TOP (0 degrees).
    // The slice index starts at top right, so we offset by 90deg, 
    // but a simple approach: just spin 5-8 full rotations + the winning angle.
    const extraSpins = 5 * 360; 
    const targetAngle = extraSpins + (360 - (winIndex * sliceAngle)) - (sliceAngle / 2);
    
    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(PRIZES[winIndex].label);
    }, 4000); // 4 seconds spin duration
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col pt-12 items-center bg-gray-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 mb-8 mt-4">
        <h2 className="text-white text-2xl font-black italic tracking-widest flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-400" />
          SPIN TO WIN
        </h2>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <p className="text-gray-300 mb-12 text-[15px] font-medium text-center px-4">
        Feeling lucky? Spin the wheel to win exclusive discounts or free items applied directly to your cart!
      </p>

      {/* Wheel Container */}
      <div className="relative w-[300px] h-[300px] md:w-[360px] md:h-[360px]">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 z-10 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-md pb-[-10px]" />
        
        {/* The Wheel */}
        <div 
          className="w-full h-full rounded-full border-8 border-gray-800 shadow-[0_0_40px_rgba(251,191,36,0.3)] overflow-hidden relative"
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transition: 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)',
            background: 'conic-gradient(' + PRIZES.map((p, i) => `${p.color} ${i * (360/PRIZES.length)}deg ${(i+1) * (360/PRIZES.length)}deg`).join(', ') + ')'
          }}
        >
          {PRIZES.map((prize, i) => {
            const rot = (i * (360 / PRIZES.length)) + ((360 / PRIZES.length) / 2);
            return (
              <div 
                key={i}
                className="absolute w-full h-full flex items-start justify-center pt-8 text-black font-black text-[18px]"
                style={{ transform: `rotate(${rot}deg)` }}
              >
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  {prize.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <button 
        onClick={handleSpin}
        disabled={isSpinning}
        className="mt-16 w-[200px] py-4 rounded-full bg-gradient-to-b from-[#FDE68A] via-[#FBBF24] to-[#D97706] shadow-[0_8px_0_#92400E] active:shadow-[0_2px_0_#92400E] active:translate-y-1.5 transition-all outline-none font-black text-amber-900 text-[24px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? 'SPINNING...' : 'SPIN'}
      </button>

      {/* Result Modal */}
      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in zoom-in-90 duration-300 p-4">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center shadow-2xl relative overflow-hidden w-full max-w-sm">
            {/* Sunburst background effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(251,191,36,0.2)_0%,transparent_70%)]" />
            
            <h3 className="text-[#22c55e] font-black text-[20px] tracking-widest uppercase mb-2 relative z-10"> RESULT </h3>
            <p className="text-black font-black text-[36px] text-center leading-tight mb-8 relative z-10">{result}</p>
            
            <div className="w-full flex flex-col gap-3 relative z-10">
              <button 
                onClick={() => onClose()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold text-[16px] shadow-[0_4px_0_#166534] active:shadow-none active:translate-y-1 transition-all">
                CLAIM PRIZE & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
