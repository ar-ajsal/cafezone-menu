import { X, Share2, Bookmark, Coffee } from "lucide-react";

interface ItemDetailsSheetProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailsSheet({ item, isOpen, onClose }: ItemDetailsSheetProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-end md:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[95dvh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Scrollable Area (Image + Details) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white pb-8">
          
          {/* Top Image Banner */}
          <div className="relative w-full h-[250px] bg-gray-100 shrink-0">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 font-bold bg-[#f1f5f9]">{item.name.charAt(0)}</div>
            )}

            {/* Floating Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm transition-transform active:scale-95">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm transition-transform active:scale-95">
                <Bookmark className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-gray-900 shadow-sm transition-transform active:scale-95 ml-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5">
          
          {/* Veg/Non-Veg Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 mb-4">
            <div className={`w-2.5 h-2.5 rounded-full ${item.type === 'non-veg' || item.type === 'mixed' ? 'bg-[#d97706]' : 'bg-green-600'}`} />
            <span className="text-[11px] font-bold text-[#d97706] tracking-wide uppercase">
              {item.type || "Mixed"}
            </span>
          </div>

          <h1 className="text-[22px] font-black text-gray-900 leading-tight mb-2">
            {item.name}
          </h1>
          
          {item.description && (
            <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-6">
              {item.description}
            </p>
          )}

          {/* Price Block */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-8">
            <p className="text-[12px] font-semibold text-gray-500 mb-1">Price</p>
            <p className="text-[32px] font-black text-gray-900 leading-none">
              <span className="text-[18px] mr-1 opacity-50">₹</span>
              {item.price}
            </p>
          </div>
        </div>
        </div>

        {/* Add to Cart Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button 
              onClick={() => alert("Added to cart")}
              className="w-full flex items-center justify-center bg-[#22c55e] text-white py-3.5 rounded-xl font-bold text-[16px] shadow-[0_4px_14px_rgba(34,197,94,0.3)] hover:bg-[#16a34a] transition-colors active:scale-[0.98]">
              Add to Cart — ₹{item.price}
            </button>
        </div>

      </div>
    </div>
  );
}
