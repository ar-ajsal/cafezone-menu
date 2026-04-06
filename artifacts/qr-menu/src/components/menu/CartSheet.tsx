import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<number, number>;
  menuItems: any[];
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
}

export function CartSheet({ isOpen, onClose, cart, menuItems, onIncrement, onDecrement }: CartSheetProps) {
  const [address, setAddress] = useState("");

  if (!isOpen) return null;

  const cartEntries = Object.entries(cart)
    .map(([idStr, qty]) => {
      const item = menuItems.find((i: any) => i.id === parseInt(idStr, 10));
      return { item, qty };
    })
    .filter(entry => entry.item);

  const cartTotalPrice = cartEntries.reduce((acc, { item, qty }) => acc + (item.price * qty), 0);
  const cartTotalItems = cartEntries.reduce((acc, { qty }) => acc + qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Sheet Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl flex flex-col max-h-[90dvh] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-800" />
            <h2 className="text-[18px] font-bold text-gray-900">Your Cart</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
          {cartEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
              <ShoppingBag className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-semibold text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartEntries.map(({ item, qty }) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                    {item.imageUrl ? (
                       <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100">{item.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-bold text-[14px] text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="font-medium text-[13px] text-gray-500 mt-0.5">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 pt-0.5">
                    <p className="font-extrabold text-[14px] text-gray-900">₹{item.price * qty}</p>
                    
                    {/* Quantity Control Pill */}
                    <div className="flex items-center justify-between px-1.5 py-1 w-[72px] bg-green-50 rounded-lg border border-green-200">
                      <button onClick={() => onDecrement(item.id)} className="p-1 rounded bg-white text-green-700 shadow-sm active:scale-95"><Minus className="w-3 h-3 stroke-[3]" /></button>
                      <span className="font-bold text-[13px] text-green-700 leading-none">{qty}</span>
                      <button onClick={() => onIncrement(item.id)} className="p-1 rounded bg-white text-green-700 shadow-sm active:scale-95"><Plus className="w-3 h-3 stroke-[3]" /></button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Area */}
        {cartTotalItems > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl shrink-0 space-y-4">
            <div>
              <label htmlFor="address" className="block text-[13px] font-bold text-gray-700 mb-1.5 flex justify-between">
                <span>Table No. / Address</span>
                <span className="text-gray-400 font-normal">Optional</span>
              </label>
              <textarea 
                id="address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="E.g., Table 4 or Door No."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[14px] bg-white outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] transition-all resize-none"
              />
            </div>
            <button 
              onClick={() => {
                const orderText = cartEntries.map(({ item, qty }) => `${qty}x ${item.name}`).join('\n');
                let message = `*New Order:*\n\n${orderText}`;
                if (address.trim()) {
                  message += `\n\n*Deliver to:*\n${address.trim()}`;
                }
                const whatsappUrl = `https://wa.me/919746214344?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="w-full flex items-center justify-center bg-[#22c55e] text-white py-3.5 rounded-xl font-bold text-[16px] shadow-[0_4px_14px_rgba(34,197,94,0.3)] hover:bg-[#16a34a] transition-colors active:scale-[0.98]">
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
