import React from "react";
import { Truck, RefreshCw } from "lucide-react";

const ActionButtons: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-150 shadow-lg shadow-orange-200 text-sm sm:text-base">
        <Truck size={18} />
        Check Availability
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-150 shadow-lg shadow-emerald-200 text-sm sm:text-base">
        <RefreshCw size={18} />
        Exchange
      </button>
    </div>
  ); 
};

export default ActionButtons;